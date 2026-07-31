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

async function runDdlStatements() {
  console.log('[migrate] Checking B2B/Wholesale database schema updates...');

  // 1. Column additions (wrapped in try/catch to ignore "Duplicate column" errors)
  const columnsToAdd = [
    { table: 'quotations', col: 'revision_number', ddl: 'ALTER TABLE `quotations` ADD COLUMN `revision_number` INT NOT NULL DEFAULT 1' },
    { table: 'quotations', col: 'parent_quotation_id', ddl: 'ALTER TABLE `quotations` ADD COLUMN `parent_quotation_id` INT NULL' },
    { table: 'quotations', col: 'additional_charges', ddl: 'ALTER TABLE `quotations` ADD COLUMN `additional_charges` DECIMAL(12,2) NOT NULL DEFAULT 0.00' },
    { table: 'quotations', col: 'delivery_terms', ddl: 'ALTER TABLE `quotations` ADD COLUMN `delivery_terms` TEXT NULL' },
  ];

  for (const item of columnsToAdd) {
    try {
      await db.execute(sql.raw(item.ddl));
      console.log(`[migrate] Added column ${item.col} to ${item.table}`);
    } catch (err: any) {
      if (err.errno === 1060 || err.message.includes('Duplicate column')) {
        // Column already exists
      } else {
        console.warn(`[migrate] Column check for ${item.col} failed:`, err.message);
      }
    }
  }

  // 2. Add index for parent_quotation_id
  try {
    await db.execute(sql.raw('ALTER TABLE `quotations` ADD INDEX `quotations_parent_idx` (`parent_quotation_id`)'));
    console.log('[migrate] Added index `quotations_parent_idx` to `quotations`');
  } catch (err: any) {
    if (err.errno !== 1061 && !err.message.includes('Duplicate key') && !err.message.includes('duplicate key')) {
      // Index already exists or other warning
    }
  }

  // 3. Table creation
  const tablesToCreate = [
    `CREATE TABLE IF NOT EXISTS \`wholesale_orders\` (
      \`id\` BIGINT AUTO_INCREMENT PRIMARY KEY,
      \`order_number\` VARCHAR(64) NOT NULL,
      \`quotation_id\` INT NOT NULL,
      \`inquiry_id\` INT NOT NULL,
      \`customer_id\` INT,
      \`company_name\` VARCHAR(255),
      \`contact_name\` VARCHAR(255),
      \`email\` VARCHAR(255),
      \`phone\` VARCHAR(32),
      \`billing_address\` TEXT,
      \`shipping_address\` TEXT,
      \`gstin\` VARCHAR(32),
      \`subtotal_amount\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
      \`discount_amount\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
      \`tax_amount\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
      \`shipping_amount\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
      \`additional_charges\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
      \`delivery_terms\` TEXT,
      \`total_amount\` DECIMAL(12,2) NOT NULL,
      \`currency\` VARCHAR(3) NOT NULL DEFAULT 'INR',
      \`payment_terms\` TEXT,
      \`notes\` TEXT,
      \`status\` ENUM('pending','confirmed','processing','shipped','delivered','completed','cancelled') NOT NULL DEFAULT 'pending',
      \`created_at\` DATETIME NOT NULL,
      \`updated_at\` DATETIME NOT NULL,
      INDEX \`ws_orders_quotation_idx\` (\`quotation_id\`),
      INDEX \`ws_orders_inquiry_idx\` (\`inquiry_id\`),
      INDEX \`ws_orders_status_idx\` (\`status\`)
    )`,
    
    `CREATE TABLE IF NOT EXISTS \`wholesale_order_items\` (
      \`id\` BIGINT AUTO_INCREMENT PRIMARY KEY,
      \`wholesale_order_id\` INT NOT NULL,
      \`product_variant_id\` INT,
      \`product_name\` VARCHAR(255) NOT NULL,
      \`weight_label\` VARCHAR(128),
      \`quantity\` DECIMAL(12,3) NOT NULL,
      \`unit_price\` DECIMAL(12,2) NOT NULL,
      \`discount_percent\` DECIMAL(6,3) NOT NULL DEFAULT 0.000,
      \`tax_percent\` DECIMAL(6,3) NOT NULL DEFAULT 0.000,
      \`line_total\` DECIMAL(12,2) NOT NULL,
      \`display_order\` INT NOT NULL DEFAULT 0,
      INDEX \`ws_order_items_order_idx\` (\`wholesale_order_id\`)
    )`,

    `CREATE TABLE IF NOT EXISTS \`wholesale_invoices\` (
      \`id\` BIGINT AUTO_INCREMENT PRIMARY KEY,
      \`invoice_number\` VARCHAR(64) NOT NULL,
      \`wholesale_order_id\` INT NOT NULL,
      \`customer_id\` INT,
      \`subtotal_amount\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
      \`tax_amount\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
      \`additional_charges\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
      \`total_amount\` DECIMAL(12,2) NOT NULL,
      \`currency\` VARCHAR(3) NOT NULL DEFAULT 'INR',
      \`status\` ENUM('draft','sent','paid','overdue','cancelled') NOT NULL DEFAULT 'draft',
      \`due_date\` DATETIME,
      \`paid_at\` DATETIME,
      \`notes\` TEXT,
      \`created_at\` DATETIME NOT NULL,
      \`updated_at\` DATETIME NOT NULL,
      INDEX \`ws_invoices_order_idx\` (\`wholesale_order_id\`),
      INDEX \`ws_invoices_status_idx\` (\`status\`)
    )`,

    `CREATE TABLE IF NOT EXISTS \`wholesale_activity_log\` (
      \`id\` BIGINT AUTO_INCREMENT PRIMARY KEY,
      \`entity_type\` ENUM('inquiry','quotation','order','invoice') NOT NULL,
      \`entity_id\` INT NOT NULL,
      \`action\` VARCHAR(128) NOT NULL,
      \`previous_value\` TEXT,
      \`new_value\` TEXT,
      \`performed_by\` INT,
      \`notes\` TEXT,
      \`created_at\` DATETIME NOT NULL,
      INDEX \`ws_activity_entity_idx\` (\`entity_type\`, \`entity_id\`),
      INDEX \`ws_activity_created_idx\` (\`created_at\`)
    )`
  ];

  for (const stmt of tablesToCreate) {
    try {
      await db.execute(sql.raw(stmt));
    } catch (err: any) {
      console.warn('[migrate] Table creation failed:', err.message);
    }
  }

  console.log('[migrate] B2B/Wholesale schema updates complete.');
}

export async function runMigrations() {
  // Execute dynamic DDL script checks before running auto-increment sets
  await runDdlStatements();

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
