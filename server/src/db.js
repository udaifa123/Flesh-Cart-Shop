import 'dotenv/config';
import pg from 'pg';

// NUMERIC -> JS number (we only ever hold 2-decimal rupee values)
pg.types.setTypeParser(1700, (v) => parseFloat(v));

export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
