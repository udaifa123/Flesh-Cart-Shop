import 'dotenv/config';
import pg from 'pg';

pg.types.setTypeParser(1700, (v) => parseFloat(v));

export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
