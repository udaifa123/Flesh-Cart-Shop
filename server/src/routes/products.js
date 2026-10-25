import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { HttpError, asyncHandler } from '../utils.js';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const q = String(req.query.q ?? '').trim();
  const { rows } = q
    ? await pool.query(
        `SELECT id, name, price, stock, emoji FROM products WHERE name ILIKE $1 ORDER BY name`,
        [`%${q.replace(/[\\%_]/g, '\\$&')}%`]
      )
    : await pool.query('SELECT id, name, price, stock, emoji FROM products ORDER BY name');
  res.json({ products: rows });
}));


router.post('/', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const name = String(req.body?.name ?? '').trim();
  const price = Number(req.body?.price);
  const stock = Number(req.body?.stock);
  const emoji = String(req.body?.emoji ?? '').trim() || '🛒';

  const errors = {};
  if (!name) errors.name = 'Name is required';
  else if (name.length > 120) errors.name = 'Name is too long';
  const validPrice =
    Number.isFinite(price) && price >= 0 && price < 1e8 && Math.abs(price * 100 - Math.round(price * 100)) < 1e-6;
  if (!validPrice) errors.price = 'Enter a price in rupees with at most 2 decimals';
  if (!Number.isInteger(stock) || stock < 0) errors.stock = 'Stock must be a whole number, 0 or more';
  if (emoji.length > 8) errors.emoji = 'Use a single emoji';
  if (Object.keys(errors).length) throw new HttpError(400, 'Please fix the highlighted fields', errors);

  try {
    const { rows } = await pool.query(
      'INSERT INTO products (name, price, stock, emoji) VALUES ($1,$2,$3,$4) RETURNING id, name, price, stock, emoji',
      [name, price.toFixed(2), stock, emoji]
    );
    res.status(201).json({ product: rows[0] });
  } catch (e) {
    if (e.code === '23505') throw new HttpError(409, 'A product with this name already exists', { name: 'Already exists' });
    throw e;
  }
}));

export default router;
