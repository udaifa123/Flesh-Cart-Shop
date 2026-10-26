
import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { HttpError, asyncHandler, PHONE_RE } from '../utils.js';

const router = Router();

router.use(requireAuth);

const GST_PERCENT = 5;
const LOW_STOCK = 5;
const ALLOWED_STATUSES = [
  'Pending',
  'Processing',
  'Completed',
  'Cancelled'
];

const rupees = (paise) => (paise / 100).toFixed(2);


// ======================================================
// TODAY'S SUMMARY + LOW STOCK
// GET /api/bills/summary/today
// ======================================================
router.get(
  '/summary/today',
  asyncHandler(async (req, res) => {
    const sales = await pool.query(
      `SELECT
         COUNT(*)::int AS bill_count,
         COALESCE(SUM(grand_total), 0) AS total_sales
       FROM bills
       WHERE (created_at AT TIME ZONE 'Asia/Kolkata')::date =
             (now() AT TIME ZONE 'Asia/Kolkata')::date`
    );

    const low = await pool.query(
      `SELECT id, name, stock
       FROM products
       WHERE stock < $1
       ORDER BY stock, name`,
      [LOW_STOCK]
    );

    res.json({
      billCount: sales.rows[0].bill_count,
      totalSales: Number(sales.rows[0].total_sales),
      lowStock: low.rows
    });
  })
);


// ======================================================
// ADMIN: GET ALL ORDERS
// GET /api/bills/admin/orders
// Must be before GET /:id
// ======================================================
router.get(
  '/admin/orders',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      `SELECT
         b.id,
         b.bill_number,
         b.created_at,
         b.grand_total,
         b.customer_name,
         b.customer_phone,
         b.status,
         (SELECT COUNT(*)::int
            FROM bill_items i
           WHERE i.bill_id = b.id) AS item_count
       FROM bills b
       ORDER BY b.created_at DESC, b.id DESC`
    );

    res.json({ orders: rows });
  })
);


// ======================================================
// ADMIN: UPDATE ORDER STATUS
// PATCH /api/bills/admin/orders/:id/status
// ======================================================
router.patch(
  '/admin/orders/:id/status',
  requireAdmin,
  asyncHandler(async (req, res) => {
    if (!/^\d{1,9}$/.test(req.params.id)) {
      throw new HttpError(400, 'Invalid order ID');
    }

    const id = Number(req.params.id);
    const status = String(req.body?.status ?? '');

    if (!ALLOWED_STATUSES.includes(status)) {
      throw new HttpError(400, 'Invalid order status');
    }

    const { rows } = await pool.query(
      `UPDATE bills
       SET status = $1
       WHERE id = $2
       RETURNING id, bill_number, status`,
      [status, id]
    );

    if (!rows.length) {
      throw new HttpError(404, 'Order not found');
    }

    res.json({
      success: true,
      order: rows[0]
    });
  })
);


// ======================================================
// BILL HISTORY
// GET /api/bills
// ======================================================
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      `SELECT
         b.id,
         b.bill_number,
         b.created_at,
         b.grand_total,
         b.customer_name,
         b.status,
         (SELECT COUNT(*)::int
            FROM bill_items i
           WHERE i.bill_id = b.id) AS item_count
       FROM bills b
       ORDER BY b.created_at DESC, b.id DESC`
    );

    res.json({ bills: rows });
  })
);


// ======================================================
// GET SINGLE BILL WITH ITEMS
// GET /api/bills/:id
// ======================================================
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    if (!/^\d{1,9}$/.test(req.params.id)) {
      throw new HttpError(400, 'Invalid bill ID');
    }

    const bill = await pool.query(
      `SELECT
         b.id,
         b.bill_number,
         b.created_at,
         b.customer_name,
         b.customer_phone,
         b.subtotal,
         b.gst_amount,
         b.grand_total,
         b.status,
         u.full_name AS billed_by
       FROM bills b
       LEFT JOIN users u ON u.id = b.created_by
       WHERE b.id = $1`,
      [req.params.id]
    );

    if (!bill.rows[0]) {
      throw new HttpError(404, 'Bill not found');
    }

    const items = await pool.query(
      `SELECT
         product_id,
         product_name,
         unit_price,
         quantity,
         line_total
       FROM bill_items
       WHERE bill_id = $1
       ORDER BY id`,
      [req.params.id]
    );

    res.json({
      bill: {
        ...bill.rows[0],
        gstPercent: GST_PERCENT,
        items: items.rows
      }
    });
  })
);


// ======================================================
// CREATE BILL / CHECKOUT
// POST /api/bills
// Server calculates totals and updates stock transactionally.
// ======================================================
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const rawItems = req.body?.items;

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      throw new HttpError(400, 'Cart is empty');
    }

    if (rawItems.length > 500) {
      throw new HttpError(400, 'Too many cart items');
    }

    // Merge duplicate product IDs.
    const wanted = new Map();

    for (const item of rawItems) {
      const productId = Number(item?.productId);
      const quantity = Number(item?.quantity);

      if (
        !Number.isInteger(productId) ||
        productId <= 0 ||
        !Number.isInteger(quantity) ||
        quantity <= 0 ||
        quantity > 10000
      ) {
        throw new HttpError(400, 'Invalid cart item');
      }

      const combined = (wanted.get(productId) || 0) + quantity;

      if (combined > 10000) {
        throw new HttpError(400, 'Maximum quantity exceeded');
      }

      wanted.set(productId, combined);
    }

    const customerName =
      String(req.body?.customerName ?? '').trim().slice(0, 100) || null;

    const customerPhone =
      String(req.body?.customerPhone ?? '').trim() || null;

    if (customerPhone && !PHONE_RE.test(customerPhone)) {
      throw new HttpError(400, 'Enter a valid customer phone number');
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const ids = [...wanted.keys()].sort((a, b) => a - b);

      const { rows: products } = await client.query(
        `SELECT id, name, price, stock
         FROM products
         WHERE id = ANY($1::int[])
         ORDER BY id
         FOR UPDATE`,
        [ids]
      );

      if (products.length !== ids.length) {
        throw new HttpError(
          400,
          'A product in the cart no longer exists'
        );
      }

      let subtotalPaise = 0;
      const lines = [];

      for (const product of products) {
        const quantity = wanted.get(product.id);

        if (quantity > product.stock) {
          throw new HttpError(
            409,
            `Only ${product.stock} of "${product.name}" left in stock`
          );
        }

        const unitPaise = Math.round(Number(product.price) * 100);
        const linePaise = unitPaise * quantity;

        subtotalPaise += linePaise;

        lines.push({
          product,
          quantity,
          unitPaise,
          linePaise
        });
      }

      const gstPaise = Math.round(
        (subtotalPaise * GST_PERCENT) / 100
      );

      const grandPaise = subtotalPaise + gstPaise;

      const sequenceResult = await client.query(
        "SELECT nextval('bill_number_seq') AS n"
      );

      const billNumber =
        `FC-${String(sequenceResult.rows[0].n).padStart(6, '0')}`;

      // New checkout starts as Pending for order tracking.
      const billResult = await client.query(
        `INSERT INTO bills (
           bill_number,
           customer_name,
           customer_phone,
           subtotal,
           gst_amount,
           grand_total,
           created_by,
           status
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, bill_number, status`,
        [
          billNumber,
          customerName,
          customerPhone,
          rupees(subtotalPaise),
          rupees(gstPaise),
          rupees(grandPaise),
          req.user.id,
          'Pending'
        ]
      );

      const billId = billResult.rows[0].id;

      for (const line of lines) {
        await client.query(
          `INSERT INTO bill_items (
             bill_id,
             product_id,
             product_name,
             unit_price,
             quantity,
             line_total
           )
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            billId,
            line.product.id,
            line.product.name,
            rupees(line.unitPaise),
            line.quantity,
            rupees(line.linePaise)
          ]
        );

        await client.query(
          `UPDATE products
           SET stock = stock - $2
           WHERE id = $1`,
          [line.product.id, line.quantity]
        );
      }

      await client.query('COMMIT');

      res.status(201).json({
        bill: {
          ...billResult.rows[0],
          subtotal: rupees(subtotalPaise),
          gst_amount: rupees(gstPaise),
          grand_total: rupees(grandPaise)
        }
      });
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  })
);

export default router;
