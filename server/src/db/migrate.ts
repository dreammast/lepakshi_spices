import { db } from '../config/database.js';
import { sql } from 'drizzle-orm';

const TABLE_AUTO_INCREMENT_MAP: Record<string, number> = {
  products: 1000,
  product_variants: 1,
  product_images: 1,
  categories: 1,
  collections: 1,
  collection_products: 1,
  bulk_packaging: 1,
  customer_profiles: 1,
  addresses: 1,
  carts: 1,
  cart_items: 1,
  wishlists: 1,
  wishlist_items: 1,
  orders: 10001,
  order_items: 1,
  reviews: 1,
  coupons: 1,
  campaigns: 1,
  recipes: 1,
  wholesale_inquiries: 1,
  quotations: 1,
  quotation_items: 1,
  pdf_catalog_history: 1,
  audit_logs: 1,
  website_settings: 1,
  email_otps: 1,
  wholesale_orders: 1,
  wholesale_order_items: 1,
  wholesale_invoices: 1,
  wholesale_activity_log: 1,
};

export async function runMigrations() {
  console.log('[migrate] Checking auto-increment values...');

  for (const [table, desiredStart] of Object.entries(TABLE_AUTO_INCREMENT_MAP)) {
    try {
      const [rows] = await db.execute(sql.raw(`SELECT MAX(id) AS max_id FROM \`${table}\``)) as any;
      const maxId = Number(rows?.[0]?.max_id ?? 0);

      const nextId = Math.max(desiredStart, (maxId || 0) + 1);

      await db.execute(sql.raw(`ALTER TABLE \`${table}\` AUTO_INCREMENT = ${nextId}`));
      console.log(`[migrate] ${table}: AUTO_INCREMENT set to ${nextId} (max=${maxId}, desired_start=${desiredStart})`);
    } catch (err: any) {
      console.warn(`[migrate] Skipped ${table}: ${err.message}`);
    }
  }

  console.log('[migrate] Auto-increment migration complete.');
}
