
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { randomBytes } from 'node:crypto';

import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import {
  HttpError,
  asyncHandler,
  EMAIL_RE,
  PHONE_RE,
} from '../utils.js';

const router = Router();

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

const cookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.COOKIE_SECURE === 'true',
  path: '/',
});

const publicUser = (user) => ({
  id: user.id,
  fullName: user.full_name,
  email: user.email,
  phone: user.phone,
  role: user.role,
});

// --------------------------------------------------
// SIGNUP
// --------------------------------------------------

router.post(
  '/signup',
  asyncHandler(async (req, res) => {
    const body = req.body || {};

    const fullName = String(body.fullName ?? '').trim();
    const email = String(body.email ?? '').trim().toLowerCase();
    const phone = String(body.phone ?? '').trim();
    const password = String(body.password ?? '');
    const confirmPassword = String(body.confirmPassword ?? '');

    const errors = {};

    if (!fullName) {
      errors.fullName = 'Full name is required';
    } else if (fullName.length > 100) {
      errors.fullName = 'Full name is too long';
    }

    if (!email) {
      errors.email = 'Email is required';
    } else if (!EMAIL_RE.test(email) || email.length > 255) {
      errors.email = 'Enter a valid email address';
    }

    if (!phone) {
      errors.phone = 'Phone is required';
    } else if (!PHONE_RE.test(phone)) {
      errors.phone = 'Enter a valid phone number';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (password.length > 72) {
      errors.password = 'Password must be at most 72 characters';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length) {
      throw new HttpError(
        400,
        'Please fix the highlighted fields',
        errors
      );
    }

    const hash = await bcrypt.hash(password, 10);

    try {
      await pool.query(
        `INSERT INTO users
          (full_name, email, phone, password_hash)
         VALUES ($1, $2, $3, $4)`,
        [fullName, email, phone, hash]
      );
    } catch (error) {
      if (error.code === '23505') {
        throw new HttpError(
          409,
          'This email is already registered',
          { email: 'This email is already registered' }
        );
      }

      throw error;
    }

    res.status(201).json({
      message: 'Account created. Please log in.',
    });
  })
);

// --------------------------------------------------
// GOOGLE LOGIN
// --------------------------------------------------

router.post(
  '/google',
  asyncHandler(async (req, res) => {
    const credential = req.body?.credential;

    if (typeof credential !== 'string' || !credential) {
      throw new HttpError(
        400,
        'Google credential is required'
      );
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      throw new HttpError(
        500,
        'Google sign-in is not configured on the server'
      );
    }

    let payload;

    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      payload = ticket.getPayload();
    } catch {
      throw new HttpError(
        401,
        'Google sign-in verification failed'
      );
    }

    if (
      !payload?.sub ||
      !payload.email ||
      payload.email_verified !== true
    ) {
      throw new HttpError(
        401,
        'A verified Google account is required'
      );
    }

    const googleSub = payload.sub;
    const email = payload.email.trim().toLowerCase();
    const fullName = String(
      payload.name || email.split('@')[0]
    ).trim().slice(0, 100);

    // Check whether this Google account is already linked.
    const linkedResult = await pool.query(
      `SELECT id, full_name, email, phone, role
       FROM users
       WHERE google_sub = $1`,
      [googleSub]
    );

    let user = linkedResult.rows[0];

    if (!user) {
      // Do not automatically link an existing password account.
      const existingResult = await pool.query(
        `SELECT id
         FROM users
         WHERE LOWER(email) = $1`,
        [email]
      );

      if (existingResult.rows.length > 0) {
        throw new HttpError(
          409,
          'This email already has an account. Please log in with your password first.'
        );
      }

      // Google-only account: generate a random unusable password.
      const randomPassword = randomBytes(32).toString('hex');
      const passwordHash = await bcrypt.hash(randomPassword, 10);

      try {
        const createdResult = await pool.query(
          `INSERT INTO users
            (full_name, email, phone, password_hash, google_sub)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, full_name, email, phone, role`,
          [
            fullName,
            email,
            '',
            passwordHash,
            googleSub,
          ]
        );

        user = createdResult.rows[0];
      } catch (error) {
        if (error.code === '23505') {
          throw new HttpError(
            409,
            'This account may already exist. Please try signing in again.'
          );
        }

        throw error;
      }
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.cookie('token', token, {
      ...cookieOptions(),
      maxAge: 8 * 60 * 60 * 1000,
    });

    res.json({
      user: publicUser(user),
    });
  })
);

// --------------------------------------------------
// EMAIL AND PASSWORD LOGIN
// --------------------------------------------------

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const email = String(req.body?.email ?? '')
      .trim()
      .toLowerCase();

    const password = String(req.body?.password ?? '');

    const invalid = new HttpError(
      401,
      'Invalid email or password'
    );

    if (!email || !password) {
      throw invalid;
    }

    const result = await pool.query(
      'SELECT * FROM users WHERE LOWER(email) = $1',
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      await bcrypt.compare(password, DUMMY_HASH);
      throw invalid;
    }

    if (
      user.locked_until &&
      new Date(user.locked_until) > new Date()
    ) {
      const minutes = Math.ceil(
        (new Date(user.locked_until) - new Date()) / 60000
      );

      throw new HttpError(
        429,
        `Too many failed attempts. Try again in ${minutes} minute(s).`
      );
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatches) {
      const attempts = user.failed_attempts + 1;

      if (attempts >= MAX_ATTEMPTS) {
        await pool.query(
          `UPDATE users
           SET failed_attempts = 0,
               locked_until = now() + ($2 || ' minutes')::interval
           WHERE id = $1`,
          [user.id, String(LOCK_MINUTES)]
        );
      } else {
        await pool.query(
          `UPDATE users
           SET failed_attempts = $2
           WHERE id = $1`,
          [user.id, attempts]
        );
      }

      throw invalid;
    }

    await pool.query(
      `UPDATE users
       SET failed_attempts = 0,
           locked_until = NULL
       WHERE id = $1`,
      [user.id]
    );

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.cookie('token', token, {
      ...cookieOptions(),
      maxAge: 8 * 60 * 60 * 1000,
    });

    res.json({
      user: publicUser(user),
    });
  })
);

// --------------------------------------------------
// LOGOUT
// --------------------------------------------------

router.post('/logout', (req, res) => {
  res.clearCookie('token', cookieOptions());

  res.json({
    message: 'Logged out',
  });
});

// --------------------------------------------------
// CURRENT LOGGED-IN USER
// --------------------------------------------------

router.get(
  '/me',
  requireAuth,
  (req, res) => {
    res.json({
      user: publicUser(req.user),
    });
  }
);

export default router;
