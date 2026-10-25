import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { HttpError, asyncHandler, EMAIL_RE, PHONE_RE } from '../utils.js';

const router = Router();
const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;
// Used so a login for an unknown email takes about as long as a real one
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

const cookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.COOKIE_SECURE === 'true',
  path: '/',
});

const publicUser = (u) => ({ id: u.id, fullName: u.full_name, email: u.email, phone: u.phone, role: u.role });

router.post('/signup', asyncHandler(async (req, res) => {
  const b = req.body || {};
  const fullName = String(b.fullName ?? '').trim();
  const email = String(b.email ?? '').trim().toLowerCase();
  const phone = String(b.phone ?? '').trim();
  const password = String(b.password ?? '');
  const confirmPassword = String(b.confirmPassword ?? '');

  const errors = {};
  if (!fullName) errors.fullName = 'Full name is required';
  else if (fullName.length > 100) errors.fullName = 'Full name is too long';
  if (!email) errors.email = 'Email is required';
  else if (!EMAIL_RE.test(email) || email.length > 255) errors.email = 'Enter a valid email address';
  if (!phone) errors.phone = 'Phone is required';
  else if (!PHONE_RE.test(phone)) errors.phone = 'Enter a valid phone number';
  if (!password) errors.password = 'Password is required';
  else if (password.length < 8) errors.password = 'Password must be at least 8 characters';
  else if (password.length > 72) errors.password = 'Password must be at most 72 characters';
  if (!confirmPassword) errors.confirmPassword = 'Please confirm your password';
  else if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
  if (Object.keys(errors).length) throw new HttpError(400, 'Please fix the highlighted fields', errors);

  const hash = await bcrypt.hash(password, 10);
  try {
    await pool.query(
      `INSERT INTO users (full_name, email, phone, password_hash) VALUES ($1, $2, $3, $4)`,
      [fullName, email, phone, hash]
    );
  } catch (e) {
    if (e.code === '23505') {
      throw new HttpError(409, 'This email is already registered', { email: 'This email is already registered' });
    }
    throw e;
  }
  res.status(201).json({ message: 'Account created. Please log in.' });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const email = String(req.body?.email ?? '').trim().toLowerCase();
  const password = String(req.body?.password ?? '');
  const invalid = new HttpError(401, 'Invalid email or password');
  if (!email || !password) throw invalid;

  const { rows } = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [email]);
  const user = rows[0];
  if (!user) {
    await bcrypt.compare(password, DUMMY_HASH);
    throw invalid;
  }

  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    const mins = Math.ceil((new Date(user.locked_until) - new Date()) / 60000);
    throw new HttpError(429, `Too many failed attempts. Try again in ${mins} minute(s).`);
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    const attempts = user.failed_attempts + 1;
    if (attempts >= MAX_ATTEMPTS) {
      await pool.query(
        `UPDATE users SET failed_attempts = 0, locked_until = now() + ($2 || ' minutes')::interval WHERE id = $1`,
        [user.id, String(LOCK_MINUTES)]
      );
    } else {
      await pool.query('UPDATE users SET failed_attempts = $2 WHERE id = $1', [user.id, attempts]);
    }
    throw invalid;
  }

  await pool.query('UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = $1', [user.id]);
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '8h' });
  res.cookie('token', token, { ...cookieOptions(), maxAge: 8 * 60 * 60 * 1000 });
  res.json({ user: publicUser(user) });
}));

router.post('/logout', (req, res) => {
  res.clearCookie('token', cookieOptions());
  res.json({ message: 'Logged out' });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

export default router;
