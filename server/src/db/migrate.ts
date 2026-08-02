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

  // Ensure new columns exist on wholesale_inquiries and quotations
  const columnMigrations = [
    `ALTER TABLE wholesale_inquiries ADD COLUMN assigned_executive VARCHAR(255) NULL`,
    `ALTER TABLE wholesale_inquiries ADD COLUMN product_interest VARCHAR(255) NULL`,
    `ALTER TABLE wholesale_inquiries ADD COLUMN volume VARCHAR(128) NULL`,
    `ALTER TABLE wholesale_inquiries ADD COLUMN notes JSON NULL`,
    `ALTER TABLE wholesale_inquiries ADD COLUMN timeline JSON NULL`,
    `ALTER TABLE orders ADD COLUMN timeline JSON NULL`,
    `ALTER TABLE quotations ADD COLUMN business_name VARCHAR(255) NULL`,
    `ALTER TABLE quotations ADD COLUMN contact_person VARCHAR(255) NULL`,
    `ALTER TABLE quotations ADD COLUMN email VARCHAR(255) NULL`,
    `ALTER TABLE quotations ADD COLUMN phone VARCHAR(32) NULL`,
    `ALTER TABLE quotations ADD COLUMN sales_executive VARCHAR(255) NULL`,
    `ALTER TABLE quotations ADD COLUMN discount_type ENUM('percentage', 'flat') NOT NULL DEFAULT 'percentage'`,
    `ALTER TABLE quotations ADD COLUMN discount_value DECIMAL(12,2) NOT NULL DEFAULT '0.00'`,
    `ALTER TABLE quotations ADD COLUMN shipping_charges DECIMAL(12,2) NOT NULL DEFAULT '0.00'`,
    `ALTER TABLE quotations ADD COLUMN payable_amount DECIMAL(12,2) NOT NULL DEFAULT '0.00'`,
    `ALTER TABLE quotations ADD COLUMN round_off DECIMAL(12,2) NOT NULL DEFAULT '0.00'`,
    `ALTER TABLE quotations ADD COLUMN terms_list JSON NULL`,
    `ALTER TABLE quotations ADD COLUMN timeline JSON NULL`,
    `ALTER TABLE quotations MODIFY COLUMN status ENUM('draft', 'pending_approval', 'approved', 'updated', 'sent', 'viewed', 'accepted', 'rejected', 'expired', 'cancelled', 'converted') NOT NULL DEFAULT 'draft'`,
    `ALTER TABLE quotations ADD COLUMN version INT NOT NULL DEFAULT 1`,
    `ALTER TABLE quotations ADD COLUMN approved_at DATETIME NULL`,
    `ALTER TABLE quotations ADD COLUMN email_sent_at DATETIME NULL`,
    `ALTER TABLE quotations ADD COLUMN email_sent_by VARCHAR(128) NULL`,
    `ALTER TABLE quotations ADD COLUMN email_sent_version INT NULL`
  ];

  for (const statement of columnMigrations) {
    try {
      await db.execute(sql.raw(statement));
    } catch (e: any) {
      // Column may already exist or error ignored
    }
  }

  console.log('[migrate] Auto-increment & column migration complete.');
}
