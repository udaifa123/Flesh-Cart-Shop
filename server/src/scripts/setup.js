// Creates the database (if missing), tables, sample products and the admin user.
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const sql = (f) => fs.readFileSync(path.join(here, '../../sql', f), 'utf8');

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is missing. Create server/.env from server/.env.example first.');
  process.exit(1);
}

async function ensureDatabase() {
  const u = new URL(url);
  const dbName = decodeURIComponent(u.pathname.slice(1));
  u.pathname = '/postgres';
  const admin = new pg.Client({ connectionString: u.toString() });
  try {
    await admin.connect();
    const r = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
    if (!r.rowCount) {
      await admin.query(`CREATE DATABASE "${dbName.replace(/"/g, '""')}"`);
      console.log(`Created database "${dbName}"`);
    }
  } finally {
    await admin.end().catch(() => {});
  }
}

try {
  await ensureDatabase();
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  await client.query(sql('schema.sql'));
  await client.query(sql('seed.sql'));

  const email = (process.env.ADMIN_EMAIL || 'admin@freshcart.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'Admin@12345';
  const hash = await bcrypt.hash(password, 10);
  await client.query(
    `INSERT INTO users (full_name, email, phone, password_hash, role)
     SELECT 'Shop Admin', $1::varchar, '9999999999', $2, 'admin'
      WHERE NOT EXISTS (SELECT 1 FROM users WHERE LOWER(email) = $1::varchar)`,
    [email, hash]
  );
  await client.end();
  console.log('Database ready.');
  console.log(`Admin login -> email: ${email}  password: ${password}`);
} catch (e) {
  console.error('Setup failed:', e.message);
  process.exit(1);
}
