import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
import { HttpError, asyncHandler } from '../utils.js';

// Server-side check on every protected request: valid signed cookie AND user still exists
export const requireAuth = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) throw new HttpError(401, 'Not logged in');
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new HttpError(401, 'Session expired. Please log in again');
  }
  const { rows } = await pool.query(
    'SELECT id, full_name, email, phone, role FROM users WHERE id = $1',
    [payload.id]
  );
  if (!rows[0]) throw new HttpError(401, 'Not logged in');
  req.user = rows[0];
  next();
});

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return next(new HttpError(403, 'Admin access required'));
  next();
}
