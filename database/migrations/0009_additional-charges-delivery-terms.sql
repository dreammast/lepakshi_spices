-- Migration: Add additional_charges and delivery_terms columns to quotations, wholesale_orders, and wholesale_invoices
ALTER TABLE `quotations` ADD COLUMN `additional_charges` DECIMAL(12,2) NOT NULL DEFAULT 0.00;
ALTER TABLE `quotations` ADD COLUMN `delivery_terms` TEXT NULL;

ALTER TABLE `wholesale_orders` ADD COLUMN `additional_charges` DECIMAL(12,2) NOT NULL DEFAULT 0.00;
ALTER TABLE `wholesale_orders` ADD COLUMN `delivery_terms` TEXT NULL;

ALTER TABLE `wholesale_invoices` ADD COLUMN `additional_charges` DECIMAL(12,2) NOT NULL DEFAULT 0.00;
