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
  port: Number(process.env.DB_PORT || 4000),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl
});

try {
  await conn.query('DELETE FROM cart_items');
  await conn.query('DELETE FROM carts');
  await conn.query('DELETE FROM wishlist_items');
  await conn.query('DELETE FROM wishlists');
  await conn.query('DELETE FROM order_items');
  await conn.query('DELETE FROM orders');
  await conn.query('DELETE FROM reviews');
  await conn.query('DELETE FROM wholesale_inquiries');
  await conn.query('DELETE FROM quotations');
  await conn.query('DELETE FROM website_settings');
  await conn.query('DELETE FROM product_images');
  await conn.query('DELETE FROM product_variants');
  await conn.query('DELETE FROM products');
  await conn.query('DELETE FROM categories');
  await conn.query('DELETE FROM customer_profiles');

  // Seed script intentionally left minimal: no sample product/category inserts to avoid mock data.

  // If baseline records are required (admin user, initial settings), add explicit insert statements here.


  console.log('Clean database seed completed successfully!');
} finally {
  await conn.end();
}
