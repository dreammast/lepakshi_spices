CREATE TABLE `bulk_packaging` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`product_id` int NOT NULL,
	`pack_label` varchar(100) NOT NULL,
	`price` decimal(12,2) NOT NULL,
	`min_order_qty` int NOT NULL DEFAULT 1,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `bulk_packaging_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campaigns` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`placement` enum('alert_banner','popup_modal') NOT NULL,
	`title` varchar(200),
	`message` text NOT NULL,
	`cta_label` varchar(80),
	`cta_url` varchar(512),
	`image_url` varchar(512),
	`is_active` boolean NOT NULL DEFAULT false,
	`starts_at` datetime,
	`ends_at` datetime,
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `collection_products` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`collection_id` int NOT NULL,
	`product_id` int NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	CONSTRAINT `collection_products_id` PRIMARY KEY(`id`),
	CONSTRAINT `collection_products_unique` UNIQUE(`collection_id`,`product_id`)
);
--> statement-breakpoint
CREATE TABLE `collections` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`slug` varchar(200) NOT NULL,
	`description` text,
	`image_url` varchar(512),
	`is_active` boolean NOT NULL DEFAULT true,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `collections_id` PRIMARY KEY(`id`),
	CONSTRAINT `collections_slug_idx` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `pdf_catalog_history` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`generated_by` int,
	`product_ids` json NOT NULL,
	`template_key` varchar(80),
	`file_url` varchar(512),
	`created_at` datetime NOT NULL,
	CONSTRAINT `pdf_catalog_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `bulk_packaging_product_idx` ON `bulk_packaging` (`product_id`);--> statement-breakpoint
CREATE INDEX `campaigns_placement_idx` ON `campaigns` (`placement`);--> statement-breakpoint
CREATE INDEX `collection_products_collection_idx` ON `collection_products` (`collection_id`);--> statement-breakpoint
CREATE INDEX `collection_products_product_idx` ON `collection_products` (`product_id`);