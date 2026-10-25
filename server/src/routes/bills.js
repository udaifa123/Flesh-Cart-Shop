import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { HttpError, asyncHandler, PHONE_RE } from '../utils.js';

const router = Router();
router.use(requireAuth);

const GST_PERCENT = 5;
const LOW_STOCK = 5;
const rupees = (paise) => (paise / 100).toFixed(2);

// Today's summary (India time) + low stock list for the dashboard
router.get('/summary/today', asyncHandler(async (req, res) => {
  const sales = await pool.query(
    `SELECT COUNT(*)::int AS bill_count, COALESCE(SUM(grand_total), 0) AS total_sales
       FROM bills
      WHERE (created_at AT TIME ZONE 'Asia/Kolkata')::date = (now() AT TIME ZONE 'Asia/Kolkata')::date`
  );
  const low = await pool.query(
    'SELECT id, name, stock FROM products WHERE stock < $1 ORDER BY stock, name',
    [LOW_STOCK]
  );
  res.json({
    billCount: sales.rows[0].bill_count,
    totalSales: Number(sales.rows[0].total_sales),
    lowStock: low.rows,
  });
}));

// Bill history, newest first
router.get('/', asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT b.id, b.bill_number, b.created_at, b.grand_total, b.customer_name,
            (SELECT COUNT(*)::int FROM bill_items i WHERE i.bill_id = b.id) AS item_count
       FROM bills b ORDER BY b.created_at DESC, b.id DESC`
  );
  res.json({ bills: rows });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  if (!/^\d{1,9}$/.test(req.params.id)) throw new HttpError(400, 'Invalid bill id');
  const bill = await pool.query(
    `SELECT b.id, b.bill_number, b.created_at, b.customer_name, b.customer_phone,
            b.subtotal, b.gst_amount, b.grand_total, u.full_name AS billed_by
       FROM bills b LEFT JOIN users u ON u.id = b.created_by WHERE b.id = $1`,
    [req.params.id]
  );
  if (!bill.rows[0]) throw new HttpError(404, 'Bill not found');
  const items = await pool.query(
    `SELECT product_id, product_name, unit_price, quantity, line_total
       FROM bill_items WHERE bill_id = $1 ORDER BY id`,
    [req.params.id]
  );
  res.json({ bill: { ...bill.rows[0], gstPercent: GST_PERCENT, items: items.rows } });
}));

// Generate a bill: all-or-nothing transaction. Totals are computed on the server from DB prices.
router.post('/', asyncHandler(async (req, res) => {
  const rawItems = req.body?.items;
  if (!Array.isArray(rawItems) || rawItems.length === 0) throw new HttpError(400, 'Cart is empty');

  const wanted = new Map(); // productId -> quantity (merges duplicates)
  for (const it of rawItems) {
    const pid = Number(it?.productId);
    const qty = Number(it?.quantity);
    if (!Number.isInteger(pid) || pid <= 0 || !Number.isInteger(qty) || qty <= 0 || qty > 10000)
      throw new HttpError(400, 'Invalid cart item');
    wanted.set(pid, (wanted.get(pid) || 0) + qty);
  }

  const customerName = String(req.body?.customerName ?? '').trim().slice(0, 100) || null;
  const customerPhone = String(req.body?.customerPhone ?? '').trim() || null;
  if (customerPhone && !PHONE_RE.test(customerPhone)) throw new HttpError(400, 'Enter a valid customer phone number');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const ids = [...wanted.keys()].sort((a, b) => a - b);
    const { rows: products } = await client.query(
      'SELECT id, name, price, stock FROM products WHERE id = ANY($1::int[]) ORDER BY id FOR UPDATE',
      [ids]
    );
    if (products.length !== ids.length) throw new HttpError(400, 'A product in the cart no longer exists');

    let subtotalPaise = 0;
    const lines = [];
    for (const p of products) {
      const qty = wanted.get(p.id);
      if (qty > p.stock) throw new HttpError(409, `Only ${p.stock} of "${p.name}" left in stock`);
      const unitPaise = Math.round(p.price * 100);
      const linePaise = unitPaise * qty;
      subtotalPaise += linePaise;
      lines.push({ p, qty, unitPaise, linePaise });
    }
    const gstPaise = Math.round((subtotalPaise * GST_PERCENT) / 100);
    const grandPaise = subtotalPaise + gstPaise;

    const seq = await client.query("SELECT nextval('bill_number_seq') AS n");
    const billNumber = `FC-${String(seq.rows[0].n).padStart(6, '0')}`;

    const bill = await client.query(
      `INSERT INTO bills (bill_number, customer_name, customer_phone, subtotal, gst_amount, grand_total, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id, bill_number`,
      [billNumber, customerName, customerPhone, rupees(subtotalPaise), rupees(gstPaise), rupees(grandPaise), req.user.id]
    );
    const billId = bill.rows[0].id;

    for (const l of lines) {
      await client.query(
        `INSERT INTO bill_items (bill_id, product_id, product_name, unit_price, quantity, line_total)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [billId, l.p.id, l.p.name, rupees(l.unitPaise), l.qty, rupees(l.linePaise)]
      );
      await client.query('UPDATE products SET stock = stock - $2 WHERE id = $1', [l.p.id, l.qty]);
    }

    await client.query('COMMIT');
    res.status(201).json({ bill: bill.rows[0] });
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}));

export default router;
