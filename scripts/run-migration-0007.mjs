import { createPool } from 'mysql2/promise';
import 'dotenv/config';

const pool = createPool({
  host: process.env.DB_HOST || process.env.DATABASE_HOST,
  port: Number(process.env.DB_PORT || process.env.DATABASE_PORT || 4000),
  user: process.env.DB_USER || process.env.DATABASE_USER,
  password: process.env.DB_PASSWORD || process.env.DATABASE_PASSWORD,
  database: process.env.DB_NAME || process.env.DATABASE_NAME || 'lepakshispices',
  ssl: { rejectUnauthorized: false }
});

try {
  const conn = await pool.getConnection();
  console.log('Connected to database');
  await conn.execute('ALTER TABLE `addresses` ADD COLUMN IF NOT EXISTS `full_name` varchar(128) AFTER `label`');
  console.log('Column full_name added/verified');
  await conn.execute('ALTER TABLE `addresses` ADD COLUMN IF NOT EXISTS `phone` varchar(32) AFTER `full_name`');
  console.log('Column phone added/verified');
  conn.release();
  console.log('Migration complete');
} catch (err) {
  console.error('Migration failed:', err.message);
} finally {
  await pool.end();
}
