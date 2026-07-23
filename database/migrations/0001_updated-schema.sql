CREATE TABLE `audit_logs` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`actor_customer_id` int,
	`action` varchar(128) NOT NULL,
	`entity_type` varchar(128) NOT NULL,
	`entity_id` varchar(64),
	`details` json,
	`created_at` datetime NOT NULL,
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bulk_packaging_options` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`product_variant_id` int,
	`label` varchar(128) NOT NULL,
	`weight_grams` int NOT NULL,
	`min_quantity` int NOT NULL DEFAULT 1,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `bulk_packaging_options_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `content_blocks` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`page_id` int NOT NULL,
	`block_type` varchar(80) NOT NULL,
	`block_key` varchar(128) NOT NULL,
	`content` json NOT NULL,
	`display_order` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `content_blocks_id` PRIMARY KEY(`id`),
	CONSTRAINT `content_blocks_page_block_unique` UNIQUE(`page_id`,`block_key`)
);
--> statement-breakpoint
CREATE TABLE `content_pages` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`slug` varchar(160) NOT NULL,
	`title` varchar(255) NOT NULL,
	`seo_title` varchar(255),
	`seo_description` text,
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`published_at` datetime,
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `content_pages_id` PRIMARY KEY(`id`),
	CONSTRAINT `content_pages_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `coupon_redemptions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`coupon_id` int NOT NULL,
	`customer_id` int NOT NULL,
	`order_id` int NOT NULL,
	`discount_amount` decimal(12,2) NOT NULL,
	`redeemed_at` datetime NOT NULL,
	CONSTRAINT `coupon_redemptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coupons` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`code` varchar(64) NOT NULL,
	`discount_type` enum('percentage','fixed') NOT NULL,
	`discount_value` decimal(12,2) NOT NULL,
	`min_purchase_amount` decimal(12,2) NOT NULL DEFAULT '0',
	`max_discount_amount` decimal(12,2),
	`usage_limit` int,
	`per_customer_limit` int,
	`starts_at` datetime,
	`ends_at` datetime,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `coupons_id` PRIMARY KEY(`id`),
	CONSTRAINT `coupons_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `customer_notification_preferences` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`customer_id` int NOT NULL,
	`order_updates` boolean NOT NULL DEFAULT true,
	`promotions` boolean NOT NULL DEFAULT true,
	`new_arrivals` boolean NOT NULL DEFAULT false,
	`newsletter` boolean NOT NULL DEFAULT false,
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `customer_notification_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `customer_notification_preferences_customer_unique` UNIQUE(`customer_id`)
);
--> statement-breakpoint
CREATE TABLE `customer_recently_viewed` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`customer_id` int NOT NULL,
	`product_id` int NOT NULL,
	`viewed_at` datetime NOT NULL,
	CONSTRAINT `customer_recently_viewed_id` PRIMARY KEY(`id`),
	CONSTRAINT `customer_recently_viewed_unique` UNIQUE(`customer_id`,`product_id`)
);
--> statement-breakpoint
CREATE TABLE `document_exports` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`template_id` int,
	`document_type` enum('catalogue','quotation','invoice') NOT NULL,
	`reference_type` varchar(64),
	`reference_id` varchar(64),
	`file_url` varchar(512) NOT NULL,
	`created_by_customer_id` int,
	`created_at` datetime NOT NULL,
	CONSTRAINT `document_exports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `document_templates` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`document_type` enum('catalogue','quotation','invoice') NOT NULL,
	`template` json NOT NULL,
	`is_default` boolean NOT NULL DEFAULT false,
	`created_by_customer_id` int,
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `document_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `health_check` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`message` varchar(255) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `health_check_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory_movements` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`product_variant_id` int NOT NULL,
	`movement_type` enum('opening','adjustment','sale','return','restock','damage','reserved','released') NOT NULL,
	`quantity_delta` int NOT NULL,
	`reference_type` varchar(64),
	`reference_id` varchar(64),
	`note` text,
	`created_by_customer_id` int,
	`created_at` datetime NOT NULL,
	CONSTRAINT `inventory_movements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `media_assets` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`file_name` varchar(255) NOT NULL,
	`url` varchar(512) NOT NULL,
	`alt_text` varchar(255),
	`mime_type` varchar(128),
	`size_bytes` int,
	`uploaded_by_customer_id` int,
	`created_at` datetime NOT NULL,
	CONSTRAINT `media_assets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `newsletter_subscribers` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`customer_id` int,
	`status` enum('subscribed','unsubscribed','bounced') NOT NULL DEFAULT 'subscribed',
	`source` varchar(80) NOT NULL DEFAULT 'storefront',
	`subscribed_at` datetime NOT NULL,
	`unsubscribed_at` datetime,
	CONSTRAINT `newsletter_subscribers_id` PRIMARY KEY(`id`),
	CONSTRAINT `newsletter_subscribers_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`customer_id` int NOT NULL,
	`channel` enum('in_app','email','sms','whatsapp') NOT NULL DEFAULT 'in_app',
	`type` varchar(80) NOT NULL,
	`title` varchar(255) NOT NULL,
	`body` text NOT NULL,
	`action_url` varchar(512),
	`is_read` boolean NOT NULL DEFAULT false,
	`read_at` datetime,
	`created_at` datetime NOT NULL,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_payments` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`order_id` int NOT NULL,
	`provider` varchar(64) NOT NULL,
	`provider_payment_id` varchar(255),
	`method` varchar(64) NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'INR',
	`status` enum('pending','authorized','captured','failed','refunded','partially_refunded') NOT NULL DEFAULT 'pending',
	`paid_at` datetime,
	`metadata` json,
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `order_payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_status_history` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`order_id` int NOT NULL,
	`status` varchar(64) NOT NULL,
	`note` text,
	`changed_by_customer_id` int,
	`created_at` datetime NOT NULL,
	CONSTRAINT `order_status_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_bundle_items` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`bundle_id` int NOT NULL,
	`product_variant_id` int NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`is_optional` boolean NOT NULL DEFAULT false,
	`created_at` datetime NOT NULL,
	CONSTRAINT `product_bundle_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_bundles` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`product_id` int NOT NULL,
	`bundle_type` enum('fixed','build_your_own') NOT NULL DEFAULT 'fixed',
	`min_items` int NOT NULL DEFAULT 1,
	`max_items` int,
	`discount_type` enum('percentage','fixed') NOT NULL DEFAULT 'percentage',
	`discount_value` decimal(12,2) NOT NULL DEFAULT '0',
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `product_bundles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_collection_items` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`collection_id` int NOT NULL,
	`product_id` int NOT NULL,
	`display_order` int NOT NULL DEFAULT 0,
	`created_at` datetime NOT NULL,
	CONSTRAINT `product_collection_items_id` PRIMARY KEY(`id`),
	CONSTRAINT `product_collection_items_unique` UNIQUE(`collection_id`,`product_id`)
);
--> statement-breakpoint
CREATE TABLE `product_collections` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`slug` varchar(160) NOT NULL,
	`description` text,
	`image_url` varchar(512),
	`is_active` boolean NOT NULL DEFAULT true,
	`display_order` int NOT NULL DEFAULT 0,
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `product_collections_id` PRIMARY KEY(`id`),
	CONSTRAINT `product_collections_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `promotional_campaigns` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`campaign_type` enum('announcement','popup','banner','email') NOT NULL,
	`title` varchar(255),
	`body` text NOT NULL,
	`cta_label` varchar(128),
	`cta_url` varchar(512),
	`image_url` varchar(512),
	`starts_at` datetime,
	`ends_at` datetime,
	`is_active` boolean NOT NULL DEFAULT false,
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `promotional_campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quotation_events` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`quotation_id` int NOT NULL,
	`event_type` varchar(80) NOT NULL,
	`description` text NOT NULL,
	`created_by_customer_id` int,
	`created_at` datetime NOT NULL,
	CONSTRAINT `quotation_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quotation_items` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`quotation_id` int NOT NULL,
	`product_variant_id` int,
	`product_name` varchar(255) NOT NULL,
	`weight_label` varchar(128),
	`quantity` decimal(12,3) NOT NULL,
	`unit_price` decimal(12,2) NOT NULL,
	`discount_percent` decimal(6,3) NOT NULL DEFAULT '0',
	`tax_percent` decimal(6,3) NOT NULL DEFAULT '0',
	`line_total` decimal(12,2) NOT NULL,
	`display_order` int NOT NULL DEFAULT 0,
	CONSTRAINT `quotation_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quotation_terms` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`quotation_id` int NOT NULL,
	`term` text NOT NULL,
	`display_order` int NOT NULL DEFAULT 0,
	CONSTRAINT `quotation_terms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recipe_ingredients` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`recipe_id` int NOT NULL,
	`product_id` int,
	`description` varchar(512) NOT NULL,
	`quantity` varchar(128),
	`display_order` int NOT NULL DEFAULT 0,
	CONSTRAINT `recipe_ingredients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recipe_steps` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`recipe_id` int NOT NULL,
	`instruction` text NOT NULL,
	`image_url` varchar(512),
	`display_order` int NOT NULL DEFAULT 0,
	CONSTRAINT `recipe_steps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recipes` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`slug` varchar(160) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`image_url` varchar(512),
	`prep_minutes` int,
	`cook_minutes` int,
	`servings` int,
	`difficulty` enum('easy','medium','hard'),
	`nutrition` json,
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`published_at` datetime,
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `recipes_id` PRIMARY KEY(`id`),
	CONSTRAINT `recipes_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `shipments` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`order_id` int NOT NULL,
	`carrier` varchar(128),
	`service` varchar(128),
	`tracking_number` varchar(128),
	`status` enum('pending','packed','shipped','in_transit','delivered','returned','lost') NOT NULL DEFAULT 'pending',
	`shipped_at` datetime,
	`delivered_at` datetime,
	`metadata` json,
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `shipments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `support_messages` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`ticket_id` int NOT NULL,
	`sender_customer_id` int,
	`sender_type` enum('customer','staff','system') NOT NULL,
	`body` text NOT NULL,
	`created_at` datetime NOT NULL,
	CONSTRAINT `support_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `support_tickets` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`customer_id` int NOT NULL,
	`subject` varchar(255) NOT NULL,
	`status` enum('open','pending','resolved','closed') NOT NULL DEFAULT 'open',
	`priority` enum('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
	`assigned_to_customer_id` int,
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `support_tickets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tax_rates` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`country` varchar(2) NOT NULL DEFAULT 'IN',
	`state` varchar(128),
	`rate` decimal(6,3) NOT NULL,
	`is_inclusive` boolean NOT NULL DEFAULT false,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `tax_rates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wholesale_inquiry_follow_ups` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`inquiry_id` int NOT NULL,
	`scheduled_for` datetime NOT NULL,
	`note` text,
	`status` enum('scheduled','completed','cancelled') NOT NULL DEFAULT 'scheduled',
	`completed_at` datetime,
	`created_by_customer_id` int,
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `wholesale_inquiry_follow_ups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wholesale_inquiry_items` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`inquiry_id` int NOT NULL,
	`product_id` int,
	`product_name` varchar(255),
	`requested_packaging` varchar(128),
	`requested_quantity` decimal(12,3),
	`quantity_unit` varchar(32) NOT NULL DEFAULT 'kg',
	`created_at` datetime NOT NULL,
	CONSTRAINT `wholesale_inquiry_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wholesale_inquiry_notes` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`inquiry_id` int NOT NULL,
	`note` text NOT NULL,
	`created_by_customer_id` int,
	`created_at` datetime NOT NULL,
	CONSTRAINT `wholesale_inquiry_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `orders` MODIFY COLUMN `status` enum('pending','processing','shipped','delivered','completed','cancelled','refunded','returned') NOT NULL DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `quotations` MODIFY COLUMN `status` enum('draft','sent','accepted','rejected','expired','converted') NOT NULL DEFAULT 'draft';--> statement-breakpoint
ALTER TABLE `wholesale_inquiries` MODIFY COLUMN `status` enum('new','reviewing','quoted','contacted','quotation_sent','negotiation','converted','completed','rejected','closed') NOT NULL DEFAULT 'new';--> statement-breakpoint
ALTER TABLE `categories` ADD `image_url` varchar(512);--> statement-breakpoint
ALTER TABLE `categories` ADD `display_order` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `categories` ADD `is_active` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `customer_profiles` ADD `avatar_url` varchar(512);--> statement-breakpoint
ALTER TABLE `customer_profiles` ADD `segment` enum('new','regular','vip','wholesale') DEFAULT 'new' NOT NULL;--> statement-breakpoint
ALTER TABLE `customer_profiles` ADD `is_active` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `order_number` varchar(64) NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `subtotal_amount` decimal(12,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `discount_amount` decimal(12,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `tax_amount` decimal(12,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `shipping_amount` decimal(12,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `currency` varchar(3) DEFAULT 'INR' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `payment_method` varchar(64);--> statement-breakpoint
ALTER TABLE `orders` ADD `payment_status` enum('pending','authorized','paid','failed','refunded','partially_refunded') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `coupon_code` varchar(64);--> statement-breakpoint
ALTER TABLE `orders` ADD `customer_note` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `delivered_at` datetime;--> statement-breakpoint
ALTER TABLE `product_variants` ADD `label` varchar(128);--> statement-breakpoint
ALTER TABLE `product_variants` ADD `weight_grams` int;--> statement-breakpoint
ALTER TABLE `product_variants` ADD `compare_at_price` decimal(12,2);--> statement-breakpoint
ALTER TABLE `product_variants` ADD `cost_price` decimal(12,2);--> statement-breakpoint
ALTER TABLE `product_variants` ADD `low_stock_threshold` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `product_variants` ADD `is_default` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `subtitle` varchar(255);--> statement-breakpoint
ALTER TABLE `products` ADD `origin` varchar(255);--> statement-breakpoint
ALTER TABLE `products` ADD `badge` varchar(80);--> statement-breakpoint
ALTER TABLE `products` ADD `ingredients` json;--> statement-breakpoint
ALTER TABLE `products` ADD `nutrition_per_100g` json;--> statement-breakpoint
ALTER TABLE `products` ADD `storage_instructions` text;--> statement-breakpoint
ALTER TABLE `products` ADD `tags` json;--> statement-breakpoint
ALTER TABLE `products` ADD `is_featured` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `is_bundle` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `quotations` ADD `quote_number` varchar(64) NOT NULL;--> statement-breakpoint
ALTER TABLE `quotations` ADD `customer_id` int;--> statement-breakpoint
ALTER TABLE `quotations` ADD `assigned_to_customer_id` int;--> statement-breakpoint
ALTER TABLE `quotations` ADD `billing_address` text;--> statement-breakpoint
ALTER TABLE `quotations` ADD `shipping_address` text;--> statement-breakpoint
ALTER TABLE `quotations` ADD `gstin` varchar(32);--> statement-breakpoint
ALTER TABLE `quotations` ADD `subtotal_amount` decimal(12,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `quotations` ADD `discount_amount` decimal(12,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `quotations` ADD `tax_amount` decimal(12,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `quotations` ADD `shipping_amount` decimal(12,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `quotations` ADD `currency` varchar(3) DEFAULT 'INR' NOT NULL;--> statement-breakpoint
ALTER TABLE `quotations` ADD `payment_terms` text;--> statement-breakpoint
ALTER TABLE `quotations` ADD `lead_time_days` int;--> statement-breakpoint
ALTER TABLE `quotations` ADD `packaging_type` varchar(128);--> statement-breakpoint
ALTER TABLE `quotations` ADD `delivery_method` varchar(128);--> statement-breakpoint
ALTER TABLE `quotations` ADD `notes` text;--> statement-breakpoint
ALTER TABLE `quotations` ADD `valid_until` datetime;--> statement-breakpoint
ALTER TABLE `reviews` ADD `title` varchar(255);--> statement-breakpoint
ALTER TABLE `reviews` ADD `display_name` varchar(128);--> statement-breakpoint
ALTER TABLE `reviews` ADD `is_featured` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `reviews` ADD `approved_at` datetime;--> statement-breakpoint
ALTER TABLE `wholesale_inquiries` ADD `contact_name` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `wholesale_inquiries` ADD `email` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `wholesale_inquiries` ADD `phone` varchar(32);--> statement-breakpoint
ALTER TABLE `wholesale_inquiries` ADD `assigned_to_customer_id` int;--> statement-breakpoint
ALTER TABLE `wholesale_inquiries` ADD `priority` enum('low','normal','high','urgent') DEFAULT 'normal' NOT NULL;--> statement-breakpoint
ALTER TABLE `wholesale_inquiries` ADD `source` varchar(80) DEFAULT 'storefront' NOT NULL;--> statement-breakpoint
ALTER TABLE `wholesale_inquiries` ADD `desired_delivery_date` datetime;--> statement-breakpoint
CREATE INDEX `audit_logs_entity_created_idx` ON `audit_logs` (`entity_type`,`entity_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `inventory_movements_variant_created_idx` ON `inventory_movements` (`product_variant_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `notifications_customer_read_idx` ON `notifications` (`customer_id`,`is_read`);