
import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { HttpError, asyncHandler } from '../utils.js';

const router = Router();

// GET ALL PRODUCTS / SEARCH PRODUCTS
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const q = String(req.query.q ?? '').trim();

    const { rows } = q
      ? await pool.query(
          `SELECT id, name, price, stock, emoji
           FROM products
           WHERE name ILIKE $1 ESCAPE '\\'
           ORDER BY name`,
          [`%${q.replace(/[\\%_]/g, '\\$&')}%`]
        )
      : await pool.query(
          `SELECT id, name, price, stock, emoji
           FROM products
           ORDER BY name`
        );

    res.json({ products: rows });
  })
);

// ADD PRODUCT — ADMIN ONLY
router.post(
  '/',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const name = String(req.body?.name ?? '').trim();
    const price = Number(req.body?.price);
    const stock = Number(req.body?.stock);
    const emoji = String(req.body?.emoji ?? '').trim() || '🛒';

    const errors = {};

    if (!name) {
      errors.name = 'Name is required';
    } else if (name.length > 120) {
      errors.name = 'Name is too long';
    }

    const validPrice =
      Number.isFinite(price) &&
      price >= 0 &&
      price < 1e8 &&
      Math.abs(price * 100 - Math.round(price * 100)) < 1e-6;

    if (!validPrice) {
      errors.price = 'Enter a price in rupees with at most 2 decimals';
    }

    if (!Number.isInteger(stock) || stock < 0) {
      errors.stock = 'Stock must be a whole number, 0 or more';
    }

    if (emoji.length > 8) {
      errors.emoji = 'Use a single emoji';
    }

    if (Object.keys(errors).length) {
      throw new HttpError(
        400,
        'Please fix the highlighted fields',
        errors
      );
    }

    try {
      const { rows } = await pool.query(
        `INSERT INTO products (name, price, stock, emoji)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, price, stock, emoji`,
        [name, price.toFixed(2), stock, emoji]
      );

      res.status(201).json({ product: rows[0] });
    } catch (e) {
      if (e.code === '23505') {
        throw new HttpError(
          409,
          'A product with this name already exists',
          { name: 'Already exists' }
        );
      }

      throw e;
    }
  })
);

// UPDATE PRODUCT — ADMIN ONLY
router.patch(
  '/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      throw new HttpError(400, 'Invalid product ID');
    }

    const name = String(req.body?.name ?? '').trim();
    const price = Number(req.body?.price);
    const stock = Number(req.body?.stock);
    const emoji = String(req.body?.emoji ?? '').trim() || '🛒';

    const errors = {};

    if (!name) {
      errors.name = 'Name is required';
    } else if (name.length > 120) {
      errors.name = 'Name is too long';
    }

    const validPrice =
      Number.isFinite(price) &&
      price >= 0 &&
      price < 1e8 &&
      Math.abs(price * 100 - Math.round(price * 100)) < 1e-6;

    if (!validPrice) {
      errors.price = 'Enter a price in rupees with at most 2 decimals';
    }

    if (!Number.isInteger(stock) || stock < 0) {
      errors.stock = 'Stock must be a whole number, 0 or more';
    }

    if (emoji.length > 8) {
      errors.emoji = 'Use a single emoji';
    }

    if (Object.keys(errors).length) {
      throw new HttpError(
        400,
        'Please fix the highlighted fields',
        errors
      );
    }

    try {
      const { rows } = await pool.query(
        `UPDATE products
         SET name = $1, price = $2, stock = $3, emoji = $4
         WHERE id = $5
         RETURNING id, name, price, stock, emoji`,
        [name, price.toFixed(2), stock, emoji, id]
      );

      if (!rows.length) {
        throw new HttpError(404, 'Product not found');
      }

      res.json({ product: rows[0] });
    } catch (e) {
      if (e.code === '23505') {
        throw new HttpError(
          409,
          'A product with this name already exists',
          { name: 'Already exists' }
        );
      }

      throw e;
    }
  })
);

// DELETE PRODUCT — ADMIN ONLY
router.delete(
  '/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      throw new HttpError(400, 'Invalid product ID');
    }

    try {
      const { rows } = await pool.query(
        `DELETE FROM products
         WHERE id = $1
         RETURNING id`,
        [id]
      );

      if (!rows.length) {
        throw new HttpError(404, 'Product not found');
      }

      res.json({
        success: true,
        message: 'Product deleted successfully',
        id: rows[0].id
      });
    } catch (e) {
      // Product may already be referenced by a bill.
      if (e.code === '23503') {
        throw new HttpError(
          409,
          'This product is linked to existing bills. Set its stock to 0 instead.'
        );
      }

      throw e;
    }
  })
);

export default router;
