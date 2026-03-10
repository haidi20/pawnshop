-- Pawnshop database redesign
-- This schema uses English table and column names and is designed for easier maintenance.
-- It normalizes repeating fields, standardizes monetary values, and adds foreign keys.

CREATE DATABASE IF NOT EXISTS `pawnshop`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `pawnshop`;

SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE IF NOT EXISTS `branches` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `branch_code` VARCHAR(50) NOT NULL,
  `branch_number` VARCHAR(50) DEFAULT NULL,
  `branch_name` VARCHAR(150) NOT NULL,
  `phone_number` VARCHAR(30) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_branches_branch_code` (`branch_code`),
  UNIQUE KEY `uq_branches_branch_number` (`branch_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `investors` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `investor_code` VARCHAR(50) NOT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `phone_number` VARCHAR(30) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_investors_investor_code` (`investor_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `branch_investors` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `branch_id` BIGINT UNSIGNED NOT NULL,
  `investor_id` BIGINT UNSIGNED NOT NULL,
  `ownership_percentage` DECIMAL(5,2) DEFAULT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE DEFAULT NULL,
  `is_primary` TINYINT(1) NOT NULL DEFAULT 0,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_branch_investors_period` (`branch_id`, `investor_id`, `start_date`),
  KEY `idx_branch_investors_branch_id` (`branch_id`),
  KEY `idx_branch_investors_investor_id` (`investor_id`),
  CONSTRAINT `fk_branch_investors_branch`
    FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_branch_investors_investor`
    FOREIGN KEY (`investor_id`) REFERENCES `investors` (`id`)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `roles` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `role_code` VARCHAR(50) NOT NULL,
  `role_name` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_roles_role_code` (`role_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(100) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(150) DEFAULT NULL,
  `email` VARCHAR(150) DEFAULT NULL,
  `phone_number` VARCHAR(30) DEFAULT NULL,
  `remember_token` VARCHAR(255) DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_username` (`username`),
  UNIQUE KEY `uq_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user_roles` (
  `user_id` BIGINT UNSIGNED NOT NULL,
  `role_id` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`, `role_id`),
  KEY `idx_user_roles_role_id` (`role_id`),
  CONSTRAINT `fk_user_roles_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_user_roles_role`
    FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user_branch_assignments` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `branch_id` BIGINT UNSIGNED NOT NULL,
  `is_primary` TINYINT(1) NOT NULL DEFAULT 0,
  `assigned_at` DATETIME NOT NULL,
  `unassigned_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_branch_assignments` (`user_id`, `branch_id`, `assigned_at`),
  KEY `idx_user_branch_assignments_branch_id` (`branch_id`),
  CONSTRAINT `fk_user_branch_assignments_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_user_branch_assignments_branch`
    FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `login_sessions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED DEFAULT NULL,
  `session_token` VARCHAR(255) NOT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` VARCHAR(255) DEFAULT NULL,
  `login_at` DATETIME NOT NULL,
  `logout_at` DATETIME DEFAULT NULL,
  `session_status` ENUM('active', 'closed', 'expired') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_login_sessions_session_token` (`session_token`),
  KEY `idx_login_sessions_user_id` (`user_id`),
  CONSTRAINT `fk_login_sessions_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `customers` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `customer_code` VARCHAR(50) NOT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `gender` ENUM('male', 'female') NOT NULL,
  `birth_date` DATE DEFAULT NULL,
  `city` VARCHAR(100) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `customer_status` ENUM('active', 'inactive', 'blocked') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_customers_customer_code` (`customer_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `customer_documents` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `customer_id` BIGINT UNSIGNED NOT NULL,
  `document_type` VARCHAR(50) NOT NULL,
  `document_number` VARCHAR(100) NOT NULL,
  `is_primary` TINYINT(1) NOT NULL DEFAULT 0,
  `issued_date` DATE DEFAULT NULL,
  `expired_date` DATE DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_customer_documents_type_number` (`document_type`, `document_number`),
  KEY `idx_customer_documents_customer_id` (`customer_id`),
  CONSTRAINT `fk_customer_documents_customer`
    FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `customer_contacts` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `customer_id` BIGINT UNSIGNED NOT NULL,
  `contact_type` VARCHAR(50) NOT NULL,
  `contact_value` VARCHAR(150) NOT NULL,
  `is_primary` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_customer_contacts_customer_id` (`customer_id`),
  CONSTRAINT `fk_customer_contacts_customer`
    FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `item_categories` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_code` VARCHAR(50) NOT NULL,
  `category_name` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_item_categories_category_code` (`category_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `item_types` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_id` BIGINT UNSIGNED NOT NULL,
  `type_code` VARCHAR(50) NOT NULL,
  `type_name` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_item_types_type_code` (`type_code`),
  KEY `idx_item_types_category_id` (`category_id`),
  CONSTRAINT `fk_item_types_category`
    FOREIGN KEY (`category_id`) REFERENCES `item_categories` (`id`)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `storage_locations` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `branch_id` BIGINT UNSIGNED DEFAULT NULL,
  `location_code` VARCHAR(50) NOT NULL,
  `location_name` VARCHAR(100) NOT NULL,
  `location_type` VARCHAR(50) NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_storage_locations_branch_code` (`branch_id`, `location_code`),
  CONSTRAINT `fk_storage_locations_branch`
    FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `pawn_contracts` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `contract_number` VARCHAR(100) NOT NULL,
  `branch_id` BIGINT UNSIGNED NOT NULL,
  `customer_id` BIGINT UNSIGNED NOT NULL,
  `contract_date` DATE NOT NULL,
  `maturity_date` DATE NOT NULL,
  `term_days` SMALLINT UNSIGNED NOT NULL,
  `appraised_value` DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  `disbursed_value` DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  `storage_fee_amount` DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  `administration_fee_amount` DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  `payment_option_days` SMALLINT UNSIGNED DEFAULT NULL,
  `amount_in_words` TEXT DEFAULT NULL,
  `contract_status` ENUM('draft', 'active', 'extended', 'redeemed', 'auctioned', 'closed', 'cancelled') NOT NULL DEFAULT 'draft',
  `maintenance_required` TINYINT(1) NOT NULL DEFAULT 0,
  `maintenance_report` TEXT DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_by_user_id` BIGINT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_pawn_contracts_contract_number` (`contract_number`),
  KEY `idx_pawn_contracts_branch_id` (`branch_id`),
  KEY `idx_pawn_contracts_customer_id` (`customer_id`),
  KEY `idx_pawn_contracts_created_by_user_id` (`created_by_user_id`),
  CONSTRAINT `fk_pawn_contracts_branch`
    FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_pawn_contracts_customer`
    FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_pawn_contracts_created_by_user`
    FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `pawn_items` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `contract_id` BIGINT UNSIGNED NOT NULL,
  `item_sequence` SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  `item_name` VARCHAR(255) NOT NULL,
  `category_id` BIGINT UNSIGNED DEFAULT NULL,
  `item_type_id` BIGINT UNSIGNED DEFAULT NULL,
  `brand_name` VARCHAR(100) DEFAULT NULL,
  `model_name` VARCHAR(100) DEFAULT NULL,
  `serial_number` VARCHAR(100) DEFAULT NULL,
  `item_description` TEXT DEFAULT NULL,
  `quantity` INT UNSIGNED NOT NULL DEFAULT 1,
  `appraised_value` DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  `disbursed_value` DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  `condition_notes` TEXT DEFAULT NULL,
  `missing_notes` TEXT DEFAULT NULL,
  `specification_json` JSON DEFAULT NULL,
  `current_location_id` BIGINT UNSIGNED DEFAULT NULL,
  `current_location_status` ENUM('in_office', 'in_warehouse', 'released', 'auctioned', 'returned', 'other') NOT NULL DEFAULT 'in_office',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_pawn_items_contract_sequence` (`contract_id`, `item_sequence`),
  KEY `idx_pawn_items_category_id` (`category_id`),
  KEY `idx_pawn_items_item_type_id` (`item_type_id`),
  KEY `idx_pawn_items_current_location_id` (`current_location_id`),
  CONSTRAINT `fk_pawn_items_contract`
    FOREIGN KEY (`contract_id`) REFERENCES `pawn_contracts` (`id`)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_pawn_items_category`
    FOREIGN KEY (`category_id`) REFERENCES `item_categories` (`id`)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT `fk_pawn_items_item_type`
    FOREIGN KEY (`item_type_id`) REFERENCES `item_types` (`id`)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT `fk_pawn_items_current_location`
    FOREIGN KEY (`current_location_id`) REFERENCES `storage_locations` (`id`)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Replaces legacy repeating columns:
-- kelengkapan_barang_satu, kelengkapan_barang_dua, kelengkapan_barang_tiga.
CREATE TABLE IF NOT EXISTS `pawn_item_accessories` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `pawn_item_id` BIGINT UNSIGNED NOT NULL,
  `accessory_name` VARCHAR(255) NOT NULL,
  `accessory_condition` VARCHAR(255) DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `sort_order` SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pawn_item_accessories_pawn_item_id` (`pawn_item_id`),
  CONSTRAINT `fk_pawn_item_accessories_pawn_item`
    FOREIGN KEY (`pawn_item_id`) REFERENCES `pawn_items` (`id`)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `pawn_item_issues` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `pawn_item_id` BIGINT UNSIGNED NOT NULL,
  `issue_name` VARCHAR(255) NOT NULL,
  `issue_details` TEXT DEFAULT NULL,
  `severity_level` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pawn_item_issues_pawn_item_id` (`pawn_item_id`),
  CONSTRAINT `fk_pawn_item_issues_pawn_item`
    FOREIGN KEY (`pawn_item_id`) REFERENCES `pawn_items` (`id`)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `pawn_item_location_movements` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `pawn_item_id` BIGINT UNSIGNED NOT NULL,
  `from_location_id` BIGINT UNSIGNED DEFAULT NULL,
  `to_location_id` BIGINT UNSIGNED DEFAULT NULL,
  `from_status` VARCHAR(50) DEFAULT NULL,
  `to_status` VARCHAR(50) DEFAULT NULL,
  `moved_at` DATETIME NOT NULL,
  `moved_by_user_id` BIGINT UNSIGNED DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pawn_item_location_movements_pawn_item_id` (`pawn_item_id`),
  KEY `idx_pawn_item_location_movements_from_location_id` (`from_location_id`),
  KEY `idx_pawn_item_location_movements_to_location_id` (`to_location_id`),
  KEY `idx_pawn_item_location_movements_moved_by_user_id` (`moved_by_user_id`),
  CONSTRAINT `fk_pawn_item_location_movements_pawn_item`
    FOREIGN KEY (`pawn_item_id`) REFERENCES `pawn_items` (`id`)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_pawn_item_location_movements_from_location`
    FOREIGN KEY (`from_location_id`) REFERENCES `storage_locations` (`id`)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT `fk_pawn_item_location_movements_to_location`
    FOREIGN KEY (`to_location_id`) REFERENCES `storage_locations` (`id`)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT `fk_pawn_item_location_movements_user`
    FOREIGN KEY (`moved_by_user_id`) REFERENCES `users` (`id`)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `contract_payments` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `contract_id` BIGINT UNSIGNED NOT NULL,
  `payment_type` VARCHAR(50) NOT NULL,
  `payment_reference` VARCHAR(100) DEFAULT NULL,
  `amount` DECIMAL(18,2) NOT NULL,
  `payment_date` DATETIME NOT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_by_user_id` BIGINT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_contract_payments_contract_id` (`contract_id`),
  KEY `idx_contract_payments_created_by_user_id` (`created_by_user_id`),
  CONSTRAINT `fk_contract_payments_contract`
    FOREIGN KEY (`contract_id`) REFERENCES `pawn_contracts` (`id`)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_contract_payments_user`
    FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `contract_extensions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `contract_id` BIGINT UNSIGNED NOT NULL,
  `extension_date` DATE NOT NULL,
  `previous_maturity_date` DATE NOT NULL,
  `new_maturity_date` DATE NOT NULL,
  `extension_term_days` SMALLINT UNSIGNED NOT NULL,
  `extension_fee_amount` DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  `notes` TEXT DEFAULT NULL,
  `created_by_user_id` BIGINT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_contract_extensions_contract_id` (`contract_id`),
  KEY `idx_contract_extensions_created_by_user_id` (`created_by_user_id`),
  CONSTRAINT `fk_contract_extensions_contract`
    FOREIGN KEY (`contract_id`) REFERENCES `pawn_contracts` (`id`)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_contract_extensions_user`
    FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `auction_transactions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `contract_id` BIGINT UNSIGNED NOT NULL,
  `auction_date` DATE NOT NULL,
  `overdue_amount` DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  `auction_sale_amount` DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  `auction_fee_amount` DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  `refund_amount` DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  `notes` TEXT DEFAULT NULL,
  `created_by_user_id` BIGINT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_auction_transactions_contract_id` (`contract_id`),
  KEY `idx_auction_transactions_created_by_user_id` (`created_by_user_id`),
  CONSTRAINT `fk_auction_transactions_contract`
    FOREIGN KEY (`contract_id`) REFERENCES `pawn_contracts` (`id`)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_auction_transactions_user`
    FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `branch_cash_accounts` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `branch_id` BIGINT UNSIGNED NOT NULL,
  `account_code` VARCHAR(50) NOT NULL,
  `account_name` VARCHAR(100) NOT NULL,
  `account_type` VARCHAR(50) NOT NULL,
  `current_balance` DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_branch_cash_accounts_branch_code` (`branch_id`, `account_code`),
  CONSTRAINT `fk_branch_cash_accounts_branch`
    FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Covers legacy tables such as administrasi, atk, refund, bku, kas_cabang, and saldo_cabang logs.
CREATE TABLE IF NOT EXISTS `branch_cash_transactions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `branch_id` BIGINT UNSIGNED NOT NULL,
  `cash_account_id` BIGINT UNSIGNED DEFAULT NULL,
  `transaction_type_code` VARCHAR(50) NOT NULL,
  `reference_table` VARCHAR(100) DEFAULT NULL,
  `reference_id` BIGINT UNSIGNED DEFAULT NULL,
  `entry_direction` ENUM('debit', 'credit') NOT NULL,
  `amount` DECIMAL(18,2) NOT NULL,
  `transaction_date` DATETIME NOT NULL,
  `description` TEXT DEFAULT NULL,
  `created_by_user_id` BIGINT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_branch_cash_transactions_branch_id` (`branch_id`),
  KEY `idx_branch_cash_transactions_cash_account_id` (`cash_account_id`),
  KEY `idx_branch_cash_transactions_created_by_user_id` (`created_by_user_id`),
  CONSTRAINT `fk_branch_cash_transactions_branch`
    FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_branch_cash_transactions_cash_account`
    FOREIGN KEY (`cash_account_id`) REFERENCES `branch_cash_accounts` (`id`)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT `fk_branch_cash_transactions_user`
    FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `branch_debts` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `branch_id` BIGINT UNSIGNED NOT NULL,
  `creditor_branch_id` BIGINT UNSIGNED DEFAULT NULL,
  `debt_source_type` VARCHAR(50) NOT NULL,
  `debt_reference_number` VARCHAR(100) DEFAULT NULL,
  `debt_date` DATE NOT NULL,
  `principal_amount` DECIMAL(18,2) NOT NULL,
  `outstanding_amount` DECIMAL(18,2) NOT NULL,
  `due_date` DATE DEFAULT NULL,
  `debt_status` ENUM('open', 'partially_paid', 'paid', 'cancelled') NOT NULL DEFAULT 'open',
  `description` TEXT DEFAULT NULL,
  `created_by_user_id` BIGINT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_branch_debts_branch_id` (`branch_id`),
  KEY `idx_branch_debts_creditor_branch_id` (`creditor_branch_id`),
  KEY `idx_branch_debts_created_by_user_id` (`created_by_user_id`),
  CONSTRAINT `fk_branch_debts_branch`
    FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_branch_debts_creditor_branch`
    FOREIGN KEY (`creditor_branch_id`) REFERENCES `branches` (`id`)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT `fk_branch_debts_user`
    FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `branch_debt_payments` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `debt_id` BIGINT UNSIGNED NOT NULL,
  `payment_date` DATETIME NOT NULL,
  `amount` DECIMAL(18,2) NOT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_by_user_id` BIGINT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_branch_debt_payments_debt_id` (`debt_id`),
  KEY `idx_branch_debt_payments_created_by_user_id` (`created_by_user_id`),
  CONSTRAINT `fk_branch_debt_payments_debt`
    FOREIGN KEY (`debt_id`) REFERENCES `branch_debts` (`id`)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_branch_debt_payments_user`
    FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `inter_branch_transfers` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `source_branch_id` BIGINT UNSIGNED NOT NULL,
  `target_branch_id` BIGINT UNSIGNED NOT NULL,
  `transfer_number` VARCHAR(100) NOT NULL,
  `transfer_date` DATETIME NOT NULL,
  `amount` DECIMAL(18,2) NOT NULL,
  `transfer_status` ENUM('draft', 'sent', 'received', 'cancelled') NOT NULL DEFAULT 'draft',
  `description` TEXT DEFAULT NULL,
  `created_by_user_id` BIGINT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_inter_branch_transfers_transfer_number` (`transfer_number`),
  KEY `idx_inter_branch_transfers_source_branch_id` (`source_branch_id`),
  KEY `idx_inter_branch_transfers_target_branch_id` (`target_branch_id`),
  KEY `idx_inter_branch_transfers_created_by_user_id` (`created_by_user_id`),
  CONSTRAINT `fk_inter_branch_transfers_source_branch`
    FOREIGN KEY (`source_branch_id`) REFERENCES `branches` (`id`)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_inter_branch_transfers_target_branch`
    FOREIGN KEY (`target_branch_id`) REFERENCES `branches` (`id`)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_inter_branch_transfers_user`
    FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Covers legacy modal_investor, penambahan_modal, peralihan_modal, and related logs.
CREATE TABLE IF NOT EXISTS `investor_capital_transactions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `investor_id` BIGINT UNSIGNED NOT NULL,
  `branch_id` BIGINT UNSIGNED NOT NULL,
  `transfer_id` BIGINT UNSIGNED DEFAULT NULL,
  `transaction_type_code` VARCHAR(50) NOT NULL,
  `transaction_date` DATETIME NOT NULL,
  `amount` DECIMAL(18,2) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `created_by_user_id` BIGINT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_investor_capital_transactions_investor_id` (`investor_id`),
  KEY `idx_investor_capital_transactions_branch_id` (`branch_id`),
  KEY `idx_investor_capital_transactions_transfer_id` (`transfer_id`),
  KEY `idx_investor_capital_transactions_created_by_user_id` (`created_by_user_id`),
  CONSTRAINT `fk_investor_capital_transactions_investor`
    FOREIGN KEY (`investor_id`) REFERENCES `investors` (`id`)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_investor_capital_transactions_branch`
    FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_investor_capital_transactions_transfer`
    FOREIGN KEY (`transfer_id`) REFERENCES `inter_branch_transfers` (`id`)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT `fk_investor_capital_transactions_user`
    FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `branch_item_settings` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `branch_id` BIGINT UNSIGNED NOT NULL,
  `item_type_id` BIGINT UNSIGNED NOT NULL,
  `margin_rate` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `deduction_rate` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `effective_from` DATE NOT NULL,
  `effective_until` DATE DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_branch_item_settings_period` (`branch_id`, `item_type_id`, `effective_from`),
  KEY `idx_branch_item_settings_item_type_id` (`item_type_id`),
  CONSTRAINT `fk_branch_item_settings_branch`
    FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_branch_item_settings_item_type`
    FOREIGN KEY (`item_type_id`) REFERENCES `item_types` (`id`)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `notifications` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `branch_id` BIGINT UNSIGNED DEFAULT NULL,
  `customer_id` BIGINT UNSIGNED DEFAULT NULL,
  `contract_id` BIGINT UNSIGNED DEFAULT NULL,
  `notification_type` VARCHAR(50) NOT NULL,
  `message` TEXT NOT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `read_at` DATETIME DEFAULT NULL,
  `read_by_user_id` BIGINT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_branch_id` (`branch_id`),
  KEY `idx_notifications_customer_id` (`customer_id`),
  KEY `idx_notifications_contract_id` (`contract_id`),
  KEY `idx_notifications_read_by_user_id` (`read_by_user_id`),
  CONSTRAINT `fk_notifications_branch`
    FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT `fk_notifications_customer`
    FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT `fk_notifications_contract`
    FOREIGN KEY (`contract_id`) REFERENCES `pawn_contracts` (`id`)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT `fk_notifications_read_by_user`
    FOREIGN KEY (`read_by_user_id`) REFERENCES `users` (`id`)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED DEFAULT NULL,
  `entity_type` VARCHAR(100) NOT NULL,
  `entity_id` BIGINT UNSIGNED DEFAULT NULL,
  `action_type` VARCHAR(50) NOT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `action_at` DATETIME NOT NULL,
  `summary` VARCHAR(255) DEFAULT NULL,
  `metadata_json` JSON DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_logs_user_id` (`user_id`),
  KEY `idx_audit_logs_entity` (`entity_type`, `entity_id`),
  CONSTRAINT `fk_audit_logs_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
