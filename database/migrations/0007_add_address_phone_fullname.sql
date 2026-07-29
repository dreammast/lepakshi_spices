ALTER TABLE `addresses` ADD COLUMN `full_name` varchar(128) AFTER `label`;
ALTER TABLE `addresses` ADD COLUMN `phone` varchar(32) AFTER `full_name`;
