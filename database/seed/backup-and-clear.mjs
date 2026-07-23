import { config } from 'dotenv';
import { dirname, resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
config({ path: resolve(projectRoot, '.env') });

const ssl = process.env.DB_SSL_CA_PATH
  ? { rejectUnauthorized: true, ca: readFileSync(process.env.DB_SSL_CA_PATH, 'utf8') }
  : undefined;

const conn = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl
});

// Tables to back up and clear. Matches seed/cleanup expectations.
const tables = [
  'cart_items',
  'carts',
  'wishlist_items',
  'wishlists',
  'order_items',
  'orders',
  'reviews',
  'wholesale_inquiries',
  'quotations',
  'website_settings',
  'product_images',
  'product_variants',
  'products',
  'categories',
  'customer_profiles'
];

const ts = new Date().toISOString().replace(/[:.]/g, '-');
try {
  for (const table of tables) {
    const backupTable = `backup_${ts}_${table}`;
    console.log(`Backing up ${table} -> ${backupTable} ...`);
    // Create backup table structure
    await conn.query(`CREATE TABLE IF NOT EXISTS \`${backupTable}\` LIKE \`${table}\``);
    // Copy data
    await conn.query(`INSERT INTO \`${backupTable}\` SELECT * FROM \`${table}\``);
    console.log(`Backup for ${table} completed (${backupTable}).`);
  }

  console.log('All backups completed. Proceeding to clear original tables...');

  // Disable foreign key checks for safe truncation
  await conn.query('SET FOREIGN_KEY_CHECKS = 0');
  for (const table of tables) {
    console.log(`Clearing ${table} ...`);
    await conn.query(`DELETE FROM \`${table}\``);
  }
  await conn.query('SET FOREIGN_KEY_CHECKS = 1');

  console.log('All specified tables cleared. No mock data re-inserted.');
} catch (err) {
  console.error('Error during backup/clear:', err);
  process.exitCode = 1;
} finally {
  await conn.end();
}
