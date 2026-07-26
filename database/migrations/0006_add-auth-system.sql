-- Migration: Add email verification and OTP support
-- Adds email_verified column to customer_profiles and creates email_otps table

-- 1. Add email_verified column to customer_profiles (default false for existing users)
ALTER TABLE `customer_profiles`
  ADD COLUMN `email_verified` BOOLEAN NOT NULL DEFAULT FALSE AFTER `is_active`;

-- 2. Make password_hash nullable (OAuth users don't have passwords)
ALTER TABLE `customer_profiles`
  MODIFY COLUMN `password_hash` VARCHAR(255) NULL;

-- 3. Create email_otps table for OTP-based verification and password reset
CREATE TABLE IF NOT EXISTS `email_otps` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL,
  `otp_hash` VARCHAR(64) NOT NULL,
  `purpose` ENUM('EMAIL_VERIFICATION', 'PASSWORD_RESET', 'LOGIN_VERIFICATION') NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `attempts` INT NOT NULL DEFAULT 0,
  `verified` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  INDEX `email_otps_email_idx` (`email`),
  INDEX `email_otps_purpose_idx` (`purpose`)
);

-- 4. Create Better Auth tables (if not already created by Better Auth on first run)
-- Better Auth auto-creates these tables, but this migration ensures they exist for production.

CREATE TABLE IF NOT EXISTS `user` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `emailVerified` BOOLEAN NOT NULL DEFAULT FALSE,
  `image` VARCHAR(512),
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  UNIQUE INDEX `user_email_idx` (`email`)
);

CREATE TABLE IF NOT EXISTS `session` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `token` VARCHAR(255) NOT NULL,
  `userId` VARCHAR(36) NOT NULL,
  `ipAddress` VARCHAR(255),
  `userAgent` TEXT,
  `expiresAt` DATETIME NOT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  UNIQUE INDEX `session_token_idx` (`token`),
  INDEX `session_userId_idx` (`userId`)
);

CREATE TABLE IF NOT EXISTS `account` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `userId` VARCHAR(36) NOT NULL,
  `accountId` VARCHAR(255) NOT NULL,
  `providerId` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255),
  `accessToken` TEXT,
  `refreshToken` TEXT,
  `idToken` TEXT,
  `accessTokenExpiresAt` DATETIME,
  `refreshTokenExpiresAt` DATETIME,
  `scope` TEXT,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  INDEX `account_userId_idx` (`userId`)
);

CREATE TABLE IF NOT EXISTS `verification` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `identifier` VARCHAR(255) NOT NULL,
  `token` VARCHAR(255) NOT NULL,
  `expiresAt` DATETIME NOT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  UNIQUE INDEX `verification_token_idx` (`token`)
);
