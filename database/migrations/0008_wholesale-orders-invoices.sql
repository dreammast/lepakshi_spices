-- Migration: Add wholesale orders, invoices, activity log, and quotation revision columns
-- Safe for existing data: all new columns have defaults, all new tables are additive.

-- Add revision tracking to existing quotations table
ALTER TABLE `quotations` ADD COLUMN `revision_number` INT NOT NULL DEFAULT 1;
ALTER TABLE `quotations` ADD COLUMN `parent_quotation_id` INT NULL;
ALTER TABLE `quotations` ADD INDEX `quotations_parent_idx` (`parent_quotation_id`);

-- Wholesale Orders
CREATE TABLE IF NOT EXISTS `wholesale_orders` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `order_number` VARCHAR(64) NOT NULL,
  `quotation_id` INT NOT NULL,
  `inquiry_id` INT NOT NULL,
  `customer_id` INT,
  `company_name` VARCHAR(255),
  `contact_name` VARCHAR(255),
  `email` VARCHAR(255),
  `phone` VARCHAR(32),
  `billing_address` TEXT,
  `shipping_address` TEXT,
  `gstin` VARCHAR(32),
  `subtotal_amount` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `discount_amount` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `tax_amount` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `shipping_amount` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `total_amount` DECIMAL(12,2) NOT NULL,
  `currency` VARCHAR(3) NOT NULL DEFAULT 'INR',
  `payment_terms` TEXT,
  `notes` TEXT,
  `status` ENUM('pending','confirmed','processing','shipped','delivered','completed','cancelled') NOT NULL DEFAULT 'pending',
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  INDEX `ws_orders_quotation_idx` (`quotation_id`),
  INDEX `ws_orders_inquiry_idx` (`inquiry_id`),
  INDEX `ws_orders_status_idx` (`status`)
);

-- Wholesale Order Items
CREATE TABLE IF NOT EXISTS `wholesale_order_items` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `wholesale_order_id` INT NOT NULL,
  `product_variant_id` INT,
  `product_name` VARCHAR(255) NOT NULL,
  `weight_label` VARCHAR(128),
  `quantity` DECIMAL(12,3) NOT NULL,
  `unit_price` DECIMAL(12,2) NOT NULL,
  `discount_percent` DECIMAL(6,3) NOT NULL DEFAULT 0,
  `tax_percent` DECIMAL(6,3) NOT NULL DEFAULT 0,
  `line_total` DECIMAL(12,2) NOT NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  INDEX `ws_order_items_order_idx` (`wholesale_order_id`)
);

-- Wholesale Invoices
CREATE TABLE IF NOT EXISTS `wholesale_invoices` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `invoice_number` VARCHAR(64) NOT NULL,
  `wholesale_order_id` INT NOT NULL,
  `customer_id` INT,
  `subtotal_amount` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `tax_amount` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `total_amount` DECIMAL(12,2) NOT NULL,
  `currency` VARCHAR(3) NOT NULL DEFAULT 'INR',
  `status` ENUM('draft','sent','paid','overdue','cancelled') NOT NULL DEFAULT 'draft',
  `due_date` DATETIME,
  `paid_at` DATETIME,
  `notes` TEXT,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  INDEX `ws_invoices_order_idx` (`wholesale_order_id`),
  INDEX `ws_invoices_status_idx` (`status`)
);

-- Wholesale Activity Log
CREATE TABLE IF NOT EXISTS `wholesale_activity_log` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `entity_type` ENUM('inquiry','quotation','order','invoice') NOT NULL,
  `entity_id` INT NOT NULL,
  `action` VARCHAR(128) NOT NULL,
  `previous_value` TEXT,
  `new_value` TEXT,
  `performed_by` INT,
  `notes` TEXT,
  `created_at` DATETIME NOT NULL,
  INDEX `ws_activity_entity_idx` (`entity_type`, `entity_id`),
  INDEX `ws_activity_created_idx` (`created_at`)
);
