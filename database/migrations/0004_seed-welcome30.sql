INSERT INTO `coupons` (`code`, `discount_type`, `discount_value`, `min_purchase_amount`, `is_active`, `created_at`, `updated_at`)
SELECT 'WELCOME30', 'percentage', '30.00', '0', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM `coupons` WHERE `code` = 'WELCOME30');
