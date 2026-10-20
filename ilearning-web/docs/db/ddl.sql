-- ============================================================
-- Online Examination System
-- MySQL 8.0.16+
-- InnoDB / utf8mb4
-- No foreign keys or cascading operations.
-- Referential integrity is maintained by the application layer.
-- ============================================================
SET NAMES utf8mb4;

DROP DATABASE IF EXISTS `ilearning`;
CREATE DATABASE `ilearning` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `ilearning`;

-- 1. User account
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
	`id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
	`username` VARCHAR (64) NOT NULL,
	`password` VARCHAR (255) NOT NULL,
	`nickname` VARCHAR (64) DEFAULT NULL,
	`status` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '0: disabled, 1: enabled',
	`created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	UNIQUE KEY `uk_user_name` (`username`),
	KEY `idx_status` (`status`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = 'User account';

-- 2. Role
DROP TABLE IF EXISTS `role`;
CREATE TABLE `role` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
	`role_code` VARCHAR (32) NOT NULL,
	`role_name` VARCHAR (64) NOT NULL,
	`created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	UNIQUE KEY `uk_role_code` (`role_code`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = 'System role';

-- 3. User-role association
DROP TABLE IF EXISTS `user_role`;
CREATE TABLE `user_role` (
	`user_id` BIGINT UNSIGNED NOT NULL,
	`role_id` INT UNSIGNED NOT NULL,
	`created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`user_id`, `role_id`),
	KEY `idx_role_id` (`role_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = 'User-role association';

-- 4. Question bank
DROP TABLE IF EXISTS `question_bank`;
CREATE TABLE `question_bank` (
	`id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
	`title` VARCHAR (128) NOT NULL,
	`description` VARCHAR (500) DEFAULT NULL,
	`sort` INT NOT NULL DEFAULT 0,
	`status` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '0: disabled, 1: enabled',
	`created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	KEY `idx_status_sort` (`status`, `sort`, `id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = 'Question bank';

-- 5. Question
DROP TABLE IF EXISTS `question`;
CREATE TABLE `question` (
	`id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
	`question_bank_id` BIGINT UNSIGNED NOT NULL,
	`question_type` TINYINT UNSIGNED NOT NULL COMMENT '1: single choice, 2: multiple choice, 3: true/false, 4: short answer',
	`difficulty` TINYINT UNSIGNED NOT NULL DEFAULT 2 COMMENT '1: easy, 2: medium, 3: hard',
	`content` TEXT NOT NULL,
	`image_url` VARCHAR (512) DEFAULT NULL,
	`analysis` TEXT DEFAULT NULL,
	`status` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '0: disabled, 1: enabled',
	`created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	KEY `idx_status` (`question_bank_id`, `status`, `id`),
	KEY `idx_type` (`question_bank_id`, `question_type`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = 'Question';

-- 6. Question option
DROP TABLE IF EXISTS `question_option`;
CREATE TABLE `question_option` (
	`id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
	`question_id` BIGINT UNSIGNED NOT NULL,
	`option_key` CHAR (1) NOT NULL,
	`content` TEXT NOT NULL,
	`image_url` VARCHAR (512) DEFAULT NULL,
	`is_correct` TINYINT (1) NOT NULL DEFAULT 0,
	`created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	UNIQUE KEY `uk_key` (`question_id`, `option_key`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = 'Question option';

-- 7. Paper
DROP TABLE IF EXISTS `paper`;
CREATE TABLE `paper` (
	`id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
	`title` VARCHAR (128) NOT NULL,
	`description` VARCHAR (1000) DEFAULT NULL,
	`total_score` DECIMAL (8, 2) NOT NULL,
	`status` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '0: draft, 1: published, 2: archived',
	`created_by` BIGINT UNSIGNED NOT NULL,
	`created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	KEY `idx_status_created` (`status`, `created_at`),
	KEY `idx_created_by` (`created_by`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = 'Paper';

-- 8. Paper question
DROP TABLE IF EXISTS `paper_question`;
CREATE TABLE `paper_question` (
	`id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
	`paper_id` BIGINT UNSIGNED NOT NULL,
	`question_id` BIGINT UNSIGNED NOT NULL,
	`sort` INT UNSIGNED NOT NULL,
	`score` DECIMAL (8, 2) NOT NULL,
	`question_snapshot` JSON NOT NULL COMMENT 'Published question content, options, answer and analysis snapshot',
	`created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	UNIQUE KEY `uk_sort` (`paper_id`, `sort`),
	UNIQUE KEY `uk_question` (`paper_id`, `question_id`),
	KEY `idx_question` (`question_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = 'Paper question';

-- 9. Exam activity
DROP TABLE IF EXISTS `exam`;
CREATE TABLE `exam` (
	`id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
	`paper_id` BIGINT UNSIGNED NOT NULL,
	`title` VARCHAR (128) NOT NULL,
	`description` VARCHAR (1000) DEFAULT NULL,
	`duration_minutes` SMALLINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '0: unlimited duration',
	`max_attempts` SMALLINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '0: unlimited attempts per user',
	`passing_score` DECIMAL (8, 2) NOT NULL,
	`start_time` DATETIME DEFAULT NULL,
	`end_time` DATETIME DEFAULT NULL,
	`status` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '0: draft, 1: published, 2: closed',
	`created_by` BIGINT UNSIGNED NOT NULL,
	`created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	KEY `idx_status_start_time` (`status`, `start_time`),
	KEY `idx_paper_id` (`paper_id`),
	KEY `idx_created_by` (`created_by`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = 'Exam activity';

-- 10. Exam attempt
DROP TABLE IF EXISTS `exam_attempt`;
CREATE TABLE `exam_attempt` (
	`id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
	`exam_id` BIGINT UNSIGNED NOT NULL,
	`user_id` BIGINT UNSIGNED NOT NULL,
	`attempt_no` SMALLINT UNSIGNED NOT NULL,
	`status` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '1: in progress, 2: submitted, 3: graded, 4: cancelled',
	`total_score` DECIMAL (8, 2) NOT NULL,
	`passing_score` DECIMAL (8, 2) NOT NULL,
	`user_score` DECIMAL (8, 2) DEFAULT NULL,
	`is_passed` TINYINT (1) DEFAULT NULL,
	`started_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`deadline` DATETIME DEFAULT NULL,
	`submitted_at` DATETIME DEFAULT NULL,
	`graded_at` DATETIME DEFAULT NULL,
	`time_spent_seconds` INT UNSIGNED DEFAULT NULL,
	`created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	UNIQUE KEY `uk_user_exam_no` (`user_id`, `exam_id`, `attempt_no`),
	KEY `idx_user_created` (`user_id`, `created_at`),
	KEY `idx_exam_status` (`exam_id`, `status`),
	KEY `idx_status_deadline` (`status`, `deadline`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = 'Exam attempt';

-- 11. Exam answer
DROP TABLE IF EXISTS `exam_answer`;
CREATE TABLE `exam_answer` (
	`id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
	`exam_attempt_id` BIGINT UNSIGNED NOT NULL,
	`paper_question_id` BIGINT UNSIGNED NOT NULL,
	`answer_content` JSON DEFAULT NULL COMMENT 'Selected option keys, true/false value, or text answer',
	`is_correct` TINYINT (1) DEFAULT NULL,
	`score` DECIMAL (8, 2) NOT NULL,
	`actual_score` DECIMAL (8, 2) DEFAULT NULL,
	`answered_at` DATETIME DEFAULT NULL,
	`created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	UNIQUE KEY `uk_attempt_question` (`exam_attempt_id`, `paper_question_id`),
	KEY `idx_paper_question` (`paper_question_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = 'Exam answer';