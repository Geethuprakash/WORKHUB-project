-- phpMyAdmin SQL Dump
-- version 5.1.1deb5ubuntu1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Feb 01, 2026 at 08:00 PM
-- Server version: 8.0.43
-- PHP Version: 8.1.2-1ubuntu2.22

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `workhubdb`
--

-- --------------------------------------------------------

--


-- Step 2: Select the database
USE workhubdb;

DROP TABLE IF EXISTS `assets`;

CREATE TABLE `assets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenant_code` varchar(50) NOT NULL,
  `asset_name` varchar(100) NOT NULL,
  `serial_no` varchar(100) DEFAULT NULL,
  `assigned_to` int DEFAULT NULL,
  `status` enum('READY','ASSIGNED','UNDER_SERVICE','RETIRED') DEFAULT 'READY',
  `last_service_date` date DEFAULT NULL,
  `next_service_due` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;

CREATE TABLE `departments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenant_code` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `manager_employee_id` int DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `tenant_code`, `name`, `manager_employee_id`, `status`, `created_at`) VALUES
(1, 'TEST001', 'finnace', NULL, 'ACTIVE', '2026-02-01 13:55:49'),
(2, 'TEST001', 'TESTING', 2, 'ACTIVE', '2026-02-01 14:10:44');

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;

CREATE TABLE `employees` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenant_code` varchar(50) DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `employee_code` varchar(50) DEFAULT NULL,
  `department_id` int DEFAULT NULL,
  `designation` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `joining_date` date DEFAULT NULL,
  `face_registered` tinyint(1) DEFAULT '0',
  `profile_completed` tinyint(1) DEFAULT '0',
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;



--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`id`, `tenant_code`, `user_id`, `employee_code`, `department_id`, `designation`, `phone`, `joining_date`, `face_registered`, `profile_completed`, `status`, `created_at`) VALUES
(1, 'TEST001', 2, '0', NULL, NULL, NULL, '2026-02-01', 0, 0, 'ACTIVE', '2026-02-01 12:35:14'),
(2, 'TEST001', 4, 'TE-7C9640', NULL, NULL, NULL, '2026-02-01', 0, 0, 'ACTIVE', '2026-02-01 12:49:27'),
(3, 'TEST001', 5, 'TE-37C51C', NULL, NULL, NULL, '2026-02-01', 0, 0, 'ACTIVE', '2026-02-01 12:55:11');

-- --------------------------------------------------------

--
-- Table structure for table `employee_leave_balance`
--

DROP TABLE IF EXISTS `employee_leave_balance`;

CREATE TABLE `employee_leave_balance` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `tenant_code` VARCHAR(20) NOT NULL,
    `employee_id` INT NOT NULL,
    `leave_type` VARCHAR(5) NOT NULL,
    `balance` INT NOT NULL,
    PRIMARY KEY (`id`)
);




--
-- Dumping data for table `employee_leave_balance`
--

INSERT INTO `employee_leave_balance` (`id`, `tenant_code`, `employee_id`, `leave_type`, `balance`) VALUES
(1, 'TEST001', 1, 'CL', 12),
(2, 'TEST001', 1, 'SL', 8),
(3, 'TEST001', 1, 'PL', 15),
(4, 'TEST001', 2, 'CL', 12),
(5, 'TEST001', 2, 'SL', 8),
(6, 'TEST001', 2, 'PL', 15),
(7, 'TEST001', 3, 'CL', 12),
(8, 'TEST001', 3, 'SL', 8),
(9, 'TEST001', 3, 'PL', 15);

-- --------------------------------------------------------

--
-- Table structure for table `employee_profiles`
--

CREATE TABLE `employee_profiles` (
  `id` bigint NOT NULL,
  `tenant_code` varchar(50) NOT NULL,
  `employee_id` int NOT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('MALE','FEMALE','OTHER') DEFAULT NULL,
  `marital_status` enum('SINGLE','MARRIED') DEFAULT NULL,
  `blood_group` varchar(5) DEFAULT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `personal_email` varchar(100) DEFAULT NULL,
  `address` text,
  `total_experience_years` decimal(4,1) DEFAULT NULL,
  `highest_qualification` varchar(100) DEFAULT NULL,
  `emergency_contact_name` varchar(100) DEFAULT NULL,
  `emergency_contact_phone` varchar(15) DEFAULT NULL,
  `profile_completed` tinyint(1) DEFAULT '0',
  `completed_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employee_salary`
--

CREATE TABLE `employee_salary` (
  `id` int NOT NULL,
  `tenant_code` varchar(50) DEFAULT NULL,
  `employee_id` int DEFAULT NULL,
  `basic_salary` decimal(10,2) DEFAULT NULL,
  `effective_from` date DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `employee_salary`
--

INSERT INTO `employee_salary` (`id`, `tenant_code`, `employee_id`, `basic_salary`, `effective_from`, `is_verified`) VALUES
(1, 'TEST001', 1, '5600000.00', '2026-02-01', 1),
(2, 'TEST001', 2, '8778.00', '2026-02-01', 1),
(3, 'TEST001', 3, '787878.00', '2026-02-01', 1);

-- --------------------------------------------------------

--
-- Table structure for table `inventory`
--

CREATE TABLE `inventory` (
  `id` int NOT NULL,
  `tenant_code` varchar(50) NOT NULL,
  `item_name` varchar(100) NOT NULL,
  `category` varchar(50) DEFAULT NULL,
  `stock_qty` int DEFAULT '0',
  `unit_price` decimal(10,2) DEFAULT NULL,
  `min_stock_level` int DEFAULT '5',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `leave_config`
--

CREATE TABLE `leave_config` (
  `id` int NOT NULL,
  `tenant_code` varchar(50) DEFAULT NULL,
  `leave_type` enum('CL','SL','PL') DEFAULT NULL,
  `yearly_quota` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `id` int NOT NULL,
  `tenant_code` varchar(50) NOT NULL,
  `title` varchar(150) NOT NULL,
  `client_name` varchar(100) DEFAULT NULL,
  `project_type` varchar(50) DEFAULT NULL,
  `revenue` decimal(15,2) DEFAULT NULL,
  `deadline` date DEFAULT NULL,
  `manager_id` int DEFAULT NULL,
  `status` enum('PLANNING','ONGOING','COMPLETED','ON_HOLD') DEFAULT 'PLANNING'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `salary_config`
--

CREATE TABLE `salary_config` (
  `id` int NOT NULL,
  `tenant_code` varchar(50) DEFAULT NULL,
  `hra_percent` decimal(5,2) DEFAULT NULL,
  `pf_percent` decimal(5,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sales_items`
--

CREATE TABLE `sales_items` (
  `id` int NOT NULL,
  `sales_order_id` int DEFAULT NULL,
  `inventory_id` int DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `unit_price_at_sale` decimal(10,2) DEFAULT NULL,
  `subtotal` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sales_orders`
--

CREATE TABLE `sales_orders` (
  `id` int NOT NULL,
  `tenant_code` varchar(50) NOT NULL,
  `customer_name` varchar(100) DEFAULT NULL,
  `total_amount` decimal(15,2) DEFAULT NULL,
  `tax_amount` decimal(15,2) DEFAULT NULL,
  `discount_amount` decimal(15,2) DEFAULT NULL,
  `final_payable` decimal(15,2) DEFAULT NULL,
  `payment_method` enum('CASH','CARD','UPI','CREDIT') DEFAULT 'CASH',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `software_licences`
--

CREATE TABLE `software_licences` (
  `id` int NOT NULL,
  `tenant_code` varchar(50) NOT NULL,
  `software_name` varchar(100) DEFAULT NULL,
  `license_key` varchar(255) DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `purchase_date` date DEFAULT NULL,
  `alert_sent` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stock_log`
--

CREATE TABLE `stock_log` (
  `id` int NOT NULL,
  `tenant_code` varchar(50) NOT NULL,
  `inventory_id` int DEFAULT NULL,
  `change_qty` int DEFAULT NULL,
  `reason` enum('PURCHASE','RETURN','DAMAGE','ADJUSTMENT') DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `id` int NOT NULL,
  `project_id` int DEFAULT NULL,
  `assigned_to` int DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `criteria_json` text,
  `is_completed` tinyint(1) DEFAULT '0',
  `manager_comment` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tenants`
--

CREATE TABLE `tenants` (
  `id` int NOT NULL,
  `tenant_code` varchar(50) NOT NULL,
  `organization_name` varchar(150) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `attendance_type` enum('MANUAL','LOGIN','FACE') DEFAULT 'MANUAL',
  `payroll_date` int DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tenants`
--

INSERT INTO `tenants` (`id`, `tenant_code`, `organization_name`, `created_at`, `attendance_type`, `payroll_date`) VALUES
(1, 'TEST001', 'test', '2026-02-01 08:34:56', 'MANUAL', 1);

-- --------------------------------------------------------

--
-- Table structure for table `tickets`
--

CREATE TABLE `tickets` (
  `id` int NOT NULL,
  `tenant_code` varchar(50) NOT NULL,
  `created_by_user_id` int DEFAULT NULL,
  `category` enum('ASSET','SOFTWARE','TASK','OTHER') DEFAULT NULL,
  `related_id` int DEFAULT NULL,
  `description` text,
  `status` enum('OPEN','IN_PROGRESS','CLOSED') DEFAULT 'OPEN',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `tenant_code` varchar(50) NOT NULL,
  `email` varchar(150) NOT NULL,
  `employee_code` varchar(50) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('SUPER_ADMIN','ADMIN','MANAGER','EMPLOYEE') NOT NULL,
  `display_name` varchar(150) DEFAULT NULL,
  `is_temp_password` tinyint(1) DEFAULT '0',
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `tenant_code`, `email`, `employee_code`, `password_hash`, `role`, `display_name`, `is_temp_password`, `status`, `created_at`) VALUES
(1, 'TEST001', 'admin@gmail.com', NULL, '$2y$10$RFZgKHeoVd00lQ2u7AFrfO325Lk/g6/MGFglGKbQ5lI.mdPmEf3NC', 'ADMIN', 'Admin', 0, 'ACTIVE', '2026-02-01 08:34:56'),
(2, 'TEST001', 'akdmuralimk@gmail.com', 'TE-FC3628', '$2y$10$5Nrx/kDVO0j2Tknlu8jOUu1grF1p6UjeT1iQuVAfHlwwkRjkxh1WG', 'EMPLOYEE', 'murali', 1, 'ACTIVE', '2026-02-01 12:35:14'),
(4, 'TEST001', 'sreesabareesam8055@gmail.com', 'TE-7C9640', '$2y$10$1qYBWOmKFAENyi3W5abwZuiM01y7NLE51KVnGDJ6OYmkYSMogxXz.', 'MANAGER', 'arun', 1, 'ACTIVE', '2026-02-01 12:49:27'),
(5, 'TEST001', 'sam2003@gmail.com', 'TE-37C51C', '$2y$10$3LU.u4OvwWgd8alivoGyNOeWr6Te.drXLBmhyWcYA0AZ07Uo4y3Pa', 'EMPLOYEE', 'catfood', 1, 'ACTIVE', '2026-02-01 12:55:11');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `assets`
--
ALTER TABLE `assets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `serial_no` (`serial_no`),
  ADD KEY `assigned_to` (`assigned_to`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_dept_name` (`tenant_code`,`name`),
  ADD KEY `manager_employee_id` (`manager_employee_id`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_employee_code` (`tenant_code`,`employee_code`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `employee_leave_balance`
--
ALTER TABLE `employee_leave_balance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_leave_balance` (`tenant_code`,`employee_id`,`leave_type`),
  ADD KEY `employee_id` (`employee_id`);

--
-- Indexes for table `employee_profiles`
--
ALTER TABLE `employee_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_employee_profile` (`tenant_code`,`employee_id`),
  ADD KEY `employee_id` (`employee_id`);

--
-- Indexes for table `employee_salary`
--
ALTER TABLE `employee_salary`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`);

--
-- Indexes for table `inventory`
--
ALTER TABLE `inventory`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `leave_config`
--
ALTER TABLE `leave_config`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_leave_cfg` (`tenant_code`,`leave_type`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `manager_id` (`manager_id`);

--
-- Indexes for table `salary_config`
--
ALTER TABLE `salary_config`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_salary_cfg` (`tenant_code`);

--
-- Indexes for table `sales_items`
--
ALTER TABLE `sales_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sales_order_id` (`sales_order_id`),
  ADD KEY `inventory_id` (`inventory_id`);

--
-- Indexes for table `sales_orders`
--
ALTER TABLE `sales_orders`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `software_licences`
--
ALTER TABLE `software_licences`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `stock_log`
--
ALTER TABLE `stock_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `inventory_id` (`inventory_id`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_id` (`project_id`),
  ADD KEY `assigned_to` (`assigned_to`);

--
-- Indexes for table `tenants`
--
ALTER TABLE `tenants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tenant_code` (`tenant_code`);

--
-- Indexes for table `tickets`
--
ALTER TABLE `tickets`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tenant_code` (`tenant_code`,`email`),
  ADD UNIQUE KEY `employee_code` (`employee_code`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `assets`
--
ALTER TABLE `assets`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `employee_leave_balance`
--
ALTER TABLE `employee_leave_balance`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `employee_profiles`
--
ALTER TABLE `employee_profiles`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employee_salary`
--
ALTER TABLE `employee_salary`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `inventory`
--
ALTER TABLE `inventory`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `leave_config`
--
ALTER TABLE `leave_config`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `projects`
--
ALTER TABLE `projects`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `salary_config`
--
ALTER TABLE `salary_config`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sales_items`
--
ALTER TABLE `sales_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sales_orders`
--
ALTER TABLE `sales_orders`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `software_licences`
--
ALTER TABLE `software_licences`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stock_log`
--
ALTER TABLE `stock_log`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tenants`
--
ALTER TABLE `tenants`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tickets`
--
ALTER TABLE `tickets`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `assets`
--
ALTER TABLE `assets`
  ADD CONSTRAINT `assets_ibfk_1` FOREIGN KEY (`assigned_to`) REFERENCES `employees` (`id`);

--
-- Constraints for table `departments`
--
ALTER TABLE `departments`
  ADD CONSTRAINT `departments_ibfk_1` FOREIGN KEY (`manager_employee_id`) REFERENCES `employees` (`id`);

--
-- Constraints for table `employees`
--
ALTER TABLE `employees`
  ADD CONSTRAINT `employees_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `employee_leave_balance`
--
ALTER TABLE `employee_leave_balance`
  ADD CONSTRAINT `employee_leave_balance_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`);

--
-- Constraints for table `employee_profiles`
--
ALTER TABLE `employee_profiles`
  ADD CONSTRAINT `employee_profiles_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`);

--
-- Constraints for table `employee_salary`
--
ALTER TABLE `employee_salary`
  ADD CONSTRAINT `employee_salary_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`);

--
-- Constraints for table `projects`
--
ALTER TABLE `projects`
  ADD CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`manager_id`) REFERENCES `employees` (`id`);

--
-- Constraints for table `sales_items`
--
ALTER TABLE `sales_items`
  ADD CONSTRAINT `sales_items_ibfk_1` FOREIGN KEY (`sales_order_id`) REFERENCES `sales_orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sales_items_ibfk_2` FOREIGN KEY (`inventory_id`) REFERENCES `inventory` (`id`);

--
-- Constraints for table `stock_log`
--
ALTER TABLE `stock_log`
  ADD CONSTRAINT `stock_log_ibfk_1` FOREIGN KEY (`inventory_id`) REFERENCES `inventory` (`id`);

--
-- Constraints for table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`),
  ADD CONSTRAINT `tasks_ibfk_2` FOREIGN KEY (`assigned_to`) REFERENCES `employees` (`id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`tenant_code`) REFERENCES `tenants` (`tenant_code`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
