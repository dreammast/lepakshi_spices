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

  // Insert standard Categories
  const [c1] = await conn.query("INSERT INTO categories (name, slug, description, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())", ['Roots & Paste', 'roots-paste', 'Fresh organic ginger garlic paste and turmeric roots']);
  const [c2] = await conn.query("INSERT INTO categories (name, slug, description, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())", ['Seeds & Pods', 'seeds-pods', 'Aromatic whole and ground seeds']);
  const [c3] = await conn.query("INSERT INTO categories (name, slug, description, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())", ['Spice Blends', 'spice-blends', 'Roasted masala blends and chilli powders']);

  const catRootsId = c1.insertId;
  const catBlendsId = c3.insertId;

  // Insert initial real products
  const [p1] = await conn.query("INSERT INTO products (category_id, name, slug, description, base_price, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())", [catRootsId, 'Kashmiri Chilli Powder', 'kashmiri-chilli-powder', 'Vibrant red chilli powder with rich mild heat', 129.00, true]);
  await conn.query("INSERT INTO product_variants (product_id, sku, price, stock, attributes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())", [p1.insertId, 'KCP-100G', 129.00, 150, JSON.stringify({ pack: '100g' })]);
  await conn.query("INSERT INTO product_images (product_id, url, alt_text, is_primary, created_at) VALUES (?, ?, ?, ?, NOW())", [p1.insertId, 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&fit=crop', 'Kashmiri Chilli Powder', true]);

  const [p2] = await conn.query("INSERT INTO products (category_id, name, slug, description, base_price, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())", [catBlendsId, 'Organic Ginger Garlic Paste', 'organic-ginger-garlic-paste', 'Freshly ground organic ginger and garlic paste', 99.00, true]);
  await conn.query("INSERT INTO product_variants (product_id, sku, price, stock, attributes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())", [p2.insertId, 'GGP-250G', 99.00, 200, JSON.stringify({ pack: '250g' })]);
  await conn.query("INSERT INTO product_images (product_id, url, alt_text, is_primary, created_at) VALUES (?, ?, ?, ?, NOW())", [p2.insertId, 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&fit=crop', 'Ginger Garlic Paste', true]);

  console.log('Clean database seed completed successfully!');
} finally {
  await conn.end();
}
