-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jun 16, 2026 at 08:45 AM
-- Server version: 8.3.0
-- PHP Version: 8.2.18

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `vet_management`
--

-- --------------------------------------------------------

--
-- Table structure for table `appointments`
--

DROP TABLE IF EXISTS `appointments`;
CREATE TABLE IF NOT EXISTS `appointments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `client_name` varchar(100) NOT NULL,
  `client_email` varchar(100) NOT NULL,
  `client_phone` varchar(20) NOT NULL,
  `pet_name` varchar(100) NOT NULL,
  `pet_type` varchar(50) NOT NULL,
  `pet_breed` varchar(100) DEFAULT NULL,
  `pet_age` int DEFAULT NULL,
  `service_id` int DEFAULT NULL,
  `vet_id` int DEFAULT NULL,
  `appointment_date` date NOT NULL,
  `appointment_time` time NOT NULL,
  `status` enum('pending','confirmed','completed','no-show','cancelled') NOT NULL DEFAULT 'pending',
  `price` decimal(10,2) NOT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `payment_status` enum('paid','unpaid') DEFAULT 'paid',
  `payment_method` varchar(30) DEFAULT NULL,
  `payment_reference` varchar(50) DEFAULT NULL,
  `receipt_number` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `service_id` (`service_id`),
  KEY `vet_id` (`vet_id`)
) ENGINE=MyISAM AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `appointments`
--

INSERT INTO `appointments` (`id`, `client_name`, `client_email`, `client_phone`, `pet_name`, `pet_type`, `pet_breed`, `pet_age`, `service_id`, `vet_id`, `appointment_date`, `appointment_time`, `status`, `price`, `notes`, `created_at`, `payment_status`, `payment_method`, `payment_reference`, `receipt_number`) VALUES
(1, 'Colin Sibanda', 'flickyflicks01@gmail.com', '0788400209', 'hess', 'cat', 'cat', NULL, 1, NULL, '2025-06-19', '09:00:00', 'confirmed', 50.00, 'hghvjhvujh', '2025-06-14 21:54:34', 'paid', NULL, NULL, NULL),
(2, 'Kholwani Dube', 'flickyflicks01@gmail.com', '0788400200', 'gol', 'dog', 'k9', NULL, 3, NULL, '2025-06-18', '09:00:00', 'confirmed', 120.00, '', '2025-06-14 22:09:18', 'paid', NULL, NULL, NULL),
(3, 'Colin Sibands', 'phillippendare@gmail.com', '0788400201', 'golsa', 'dog', 'sda', NULL, 1, NULL, '2025-06-25', '09:00:00', 'confirmed', 50.00, '', '2025-06-14 22:18:36', 'paid', NULL, NULL, NULL),
(4, 'Phillip Ndare', 'ndarephillip@gmail.com', '0788400202', 'cxczxc', 'bird', 'zxcz', NULL, 1, NULL, '2025-06-27', '09:00:00', 'confirmed', 50.00, 'xzczxczx', '2025-06-14 22:26:33', 'paid', NULL, NULL, NULL),
(5, 'Colin Sibandr', 'phillippendare@gmail.com', '0788400206', 'hnwew', 'cat', 'zxcz', NULL, 4, NULL, '2025-06-26', '09:30:00', 'confirmed', 100.00, '', '2025-06-15 13:09:47', 'paid', NULL, NULL, NULL),
(6, 'Phillip Ndarew', 'flickyflicks01@gmail.com', '0788411020', 'asdada', 'bird', 'zxcz', NULL, 3, NULL, '2025-06-20', '09:00:00', 'confirmed', 120.00, '', '2025-06-15 14:33:54', 'paid', NULL, NULL, NULL),
(7, 'sbha', 'phillippendare@gmail.com', '0788400321', 'Zzx', 'other', 'Zx', NULL, 2, NULL, '2025-06-26', '09:30:00', 'confirmed', 75.00, 'Zxc', '2025-06-15 21:10:27', 'paid', NULL, NULL, NULL),
(8, 'Phillip Ndareman', 'flickyflicks01@gmail.com', '0788400212', 'braids', 'cat', 'assassin', NULL, 2, NULL, '2025-06-17', '09:00:00', 'confirmed', 75.00, 'nope', '2025-06-15 22:15:33', 'paid', NULL, NULL, NULL),
(9, 'Claudine Dublin', 'flickyflicks01@gmail.com', '0788432123', 'kin', 'other', 'Not sure', NULL, 1, NULL, '2025-06-24', '09:00:00', 'confirmed', 50.00, '', '2025-06-23 12:34:37', 'paid', NULL, NULL, NULL),
(10, 'Malulin', 'flickyflicks01@gmail.com', '0788432122', 'Clouse', 'dog', 'Chuaua', NULL, 1, NULL, '2025-06-28', '09:00:00', 'confirmed', 50.00, 'Get it checked asap', '2025-06-24 11:56:33', 'paid', NULL, NULL, NULL),
(11, 'Dalin', 'flickyflicks01@gmail.com', '0788432124', 'kas', 'bird', 'Not sure', NULL, 1, NULL, '2025-07-09', '17:00:00', 'confirmed', 50.00, 'jessy', '2025-06-24 11:57:30', 'paid', NULL, NULL, NULL),
(12, 'Getride duve', 'flickyflicks01@gmail.com', '0788432100', 'lala', 'other', 'dont know', NULL, 1, NULL, '2025-07-01', '17:00:00', 'confirmed', 50.00, 'Wassaaaa', '2025-06-24 11:58:46', 'paid', NULL, NULL, NULL),
(13, 'Katlyn Mioyo', 'flickyflicks01@gmail.com', '0788432122', 'Vos', 'dog', 'k9', NULL, 4, NULL, '2025-07-01', '17:00:00', 'confirmed', 100.00, 'Woza', '2025-06-24 12:00:35', 'paid', NULL, NULL, NULL),
(14, 'Phillip Smoke', 'flickyflicks01@gmail.com', '0788432342', 'Bill', 'cat', 'Not sure', NULL, 4, NULL, '2025-07-01', '17:00:00', 'confirmed', 100.00, '', '2025-06-25 09:19:46', 'paid', NULL, NULL, NULL),
(15, 'July Baby', 'flickyflicks01@gmail.com', '0788432000', 'Billion', 'dog', 'Not sure', NULL, 4, NULL, '2025-06-27', '10:30:00', 'confirmed', 100.00, '', '2025-06-25 09:29:44', 'paid', NULL, NULL, NULL),
(16, 'Malulins', 'flickyflicks01@gmail.com', '0788432441', 'kinh', 'bird', 'Not sure', NULL, 4, NULL, '2025-07-01', '10:30:00', 'confirmed', 100.00, '', '2025-06-25 10:35:25', 'paid', NULL, NULL, NULL),
(22, 'Lara', 'phillippendare@gmail.com', '0788432333', 'Noel', 'Reptile', 'I dont know', NULL, 1, NULL, '2025-06-27', '15:00:00', 'confirmed', 7000.00, '', '2025-06-26 11:22:59', 'paid', NULL, NULL, NULL),
(18, 'Claudine Dublinas', 'flickyflicks01@gmail.com', '0788432000', 'kinas', 'dog', 'Chuaua', NULL, 3, NULL, '2025-07-11', '11:00:00', 'confirmed', 120.00, '', '2025-06-25 11:31:58', 'paid', NULL, NULL, NULL),
(19, 'July Babys', 'flickyflicks01@gmail.com', '0788432333', 'Vosys', 'bird', 'Not sure', NULL, 1, NULL, '2025-07-26', '13:00:00', 'confirmed', 50.00, '', '2025-06-26 10:26:51', 'paid', NULL, NULL, NULL),
(20, 'July Baby', 'flickyflicks01@gmail.com', '0788432122', 'Billass', 'Reptile', 'dont know', NULL, 1, NULL, '2025-06-27', '16:32:00', 'confirmed', 100.00, 'ssadasd', '2025-06-26 11:11:02', 'paid', NULL, NULL, NULL),
(21, 'Beatrivce', 'flickyflicks01@gmail.com', '0788432555', 'lala', 'Reptile', 'wer', NULL, 2, NULL, '2025-06-26', '14:01:00', 'confirmed', 300.00, '', '2025-06-26 11:15:20', 'paid', NULL, NULL, NULL),
(23, 'Noel Dube', 'flickyflicks01@gmail.com', '0788432111', 'Flex', 'dog', 'Not sure', NULL, 3, NULL, '2025-07-12', '09:00:00', 'confirmed', 120.00, '', '2025-06-27 09:53:43', 'paid', NULL, NULL, NULL),
(24, 'Phillip N Ndarevani', 'phillippendare@gmail.com', '0788400208', 'Husky', 'Reptile', 'Wqew', 1, 3, NULL, '2026-05-28', '13:00:00', 'confirmed', 120.00, '', '2026-05-27 16:21:51', 'paid', NULL, NULL, NULL),
(25, 'Slim', 'slim@gmail.com', '0788400208', 'Test Data', 'Dog', 'Test Data', 0, 3, NULL, '2026-05-30', '11:00:00', 'confirmed', 120.00, '', '2026-05-27 17:38:42', 'paid', NULL, NULL, NULL),
(26, 'Salvo', 'test@gmail.com', '0788400208', 'Test2', 'Reptile', 'Test', 0, 4, NULL, '2026-06-01', '12:00:00', 'confirmed', 100.00, '', '2026-05-27 17:55:54', 'paid', NULL, NULL, NULL),
(27, 'Able Dube', 'are@gmail.com', '0784177000', 'Test Data', 'Dog', 'Test Data', NULL, 4, NULL, '2026-06-03', '20:17:00', 'confirmed', 200.00, 'test data', '2026-05-29 17:18:51', 'paid', NULL, NULL, NULL),
(28, 'Anna', 'azviriuke@gmail.com', '0771721488', 'Bruno', 'Dog', 'Bull', 0, 4, NULL, '2026-05-30', '11:15:00', 'confirmed', 100.00, '', '2026-05-29 17:36:35', 'paid', NULL, NULL, NULL),
(29, 'Phillip N Ndarevani', 'phillippendare@gmail.com', '0788400208', 'Misa', 'Reptile', 'Test Data', 0, 1, NULL, '2026-06-09', '10:30:00', 'confirmed', 50.00, '', '2026-06-07 00:17:43', 'paid', NULL, NULL, NULL),
(30, 'Phillip N Ndarevani', 'phillippendare@gmail.com', '0788400208', 'Boony', 'Cat', 'K9', 2, 2, NULL, '2026-06-11', '09:00:00', 'confirmed', 75.00, '', '2026-06-07 00:36:43', 'paid', NULL, NULL, NULL),
(48, 'Phillip N Ndarevani', 'phillippendare@gmail.com', '0788400208', 'Test Data', 'Dog', 'K9', 1, 1, NULL, '2026-06-18', '10:30:00', 'confirmed', 50.00, '', '2026-06-13 07:24:09', 'paid', 'EcoCash', 'ECO-B58C206E', 'PC-2026-000048'),
(32, 'Phillip N Ndarevani', 'phillippendare@gmail.com', '0788400208', 'Helio', 'Cat', 'K9', 4, 3, NULL, '2026-06-11', '11:30:00', 'confirmed', 120.00, '', '2026-06-07 05:13:22', 'paid', NULL, NULL, NULL),
(33, 'Phillip N Ndarevani', 'phillippendare@gmail.com', '0784177243', 'Boony', 'Bird', '', NULL, 1, NULL, '2026-06-07', '09:20:00', 'confirmed', 299.99, '', '2026-06-07 05:34:41', 'paid', NULL, NULL, NULL),
(34, 'Ankela', 'able2@gmail.com', '0784177001', 'Helio', 'Rabbit', 'Wef', NULL, 3, NULL, '2026-06-07', '08:35:00', 'cancelled', 700.00, '', '2026-06-07 05:36:06', 'paid', NULL, NULL, NULL),
(35, 'Phillip N Ndarevani', 'phillippendare@gmail.com', '0788400208', 'Bruno', 'Reptile', 'Test Data', 1, 1, NULL, '2026-06-17', '12:30:00', 'confirmed', 50.00, '', '2026-06-12 09:40:13', 'paid', NULL, NULL, NULL),
(47, 'Phillip N Ndarevani', 'phillippendare@gmail.com', '0788400208', 'Test Data', 'Other', 'Test Data', 1, 3, NULL, '2026-06-17', '10:30:00', 'confirmed', 120.00, 'test data', '2026-06-12 17:52:08', 'paid', 'EcoCash', 'ECO-7CDDA65E', 'PC-2026-000047'),
(39, 'Phillip N Ndarevani', 'phillippendare@gmail.com', '0788400208', 'Boony', 'Bird', 'Wef', 1, 3, NULL, '2026-06-18', '09:30:00', 'confirmed', 120.00, '', '2026-06-12 14:25:26', 'paid', 'EcoCash', 'ECO-6FAE401A', 'PC-2026-000039'),
(40, 'Phillip N Ndarevani', 'phillippendare@gmail.com', '0788400208', 'Test Data', 'Bird', 'K9', 0, 1, NULL, '2026-06-30', '11:00:00', 'confirmed', 50.00, 'test data', '2026-06-12 15:45:00', 'paid', 'InnBucks', 'INN-EEBAA2E7', 'PC-2026-000040'),
(41, 'Phillip N Ndarevani', 'phillippendare@gmail.com', '0784177001', 'Asdas', 'Rabbit', 'Helio', NULL, 1, NULL, '2026-06-17', '09:55:00', 'completed', 400.00, '', '2026-06-12 15:53:58', 'paid', NULL, NULL, NULL),
(43, 'Phillip N Ndarevani', 'phillippendare@gmail.com', '0788400208', 'Bruno', 'Cat', 'K9', 2, 1, NULL, '2026-06-18', '12:00:00', 'confirmed', 50.00, '', '2026-06-12 16:10:47', 'paid', 'Visa', 'VSA-4AC28D32', 'PC-2026-000043'),
(45, 'Phillip N Ndarevani', 'phillippendare@gmail.com', '0788400208', 'Bruno', 'Dog', 'Helio', 2, 1, NULL, '2026-06-19', '12:30:00', 'confirmed', 50.00, '', '2026-06-12 16:17:41', 'paid', 'EcoCash', 'ECO-74FEE132', 'PC-2026-000045'),
(46, 'Phillip N Ndarevani', 'phillippendare@gmail.com', '0788400208', 'Test Data', 'Dog', 'K9', 1, 3, NULL, '2026-06-16', '11:00:00', 'cancelled', 120.00, 'test data', '2026-06-12 17:42:58', 'paid', 'EcoCash', 'ECO-586E27F5', 'PC-2026-000046'),
(49, 'Phillip N Ndarevani', 'phillippendare@gmail.com', '0788400208', 'Misa', 'Bird', 'Test Data', 5, 3, NULL, '2026-06-15', '09:15:00', 'pending', 120.00, '', '2026-06-14 20:21:15', 'paid', 'EcoCash', 'ECO-503AD2D9', 'PC-2026-000049'),
(50, 'Phillip N Ndarevani', 'phillippendare@gmail.com', '0788400208', 'Bruno', 'Dog', 'K9', 1, 3, NULL, '2026-06-16', '10:00:00', 'completed', 120.00, '', '2026-06-15 06:52:41', 'paid', 'EcoCash', 'ECO-7283EC04', 'PC-2026-000050'),
(51, 'Phillip N Ndarevani', 'phillippendare@gmail.com', '0788400208', 'Bruno', 'Dog', 'K9', 3, 3, NULL, '2026-06-17', '10:00:00', 'confirmed', 120.00, '', '2026-06-15 09:56:58', 'paid', 'EcoCash', 'ECO-D36AC3EA', 'PC-2026-000051');

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `user_role` varchar(20) DEFAULT NULL,
  `action` varchar(20) NOT NULL,
  `entity` varchar(50) NOT NULL,
  `record_id` int DEFAULT NULL,
  `description` text NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_entity` (`entity`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=MyISAM AUTO_INCREMENT=71 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `user_role`, `action`, `entity`, `record_id`, `description`, `ip_address`, `created_at`) VALUES
(1, 1, 'admin', 'CREATE', 'medical_record', 14, 'Created medical record for patient Misa', '::1', '2026-06-07 00:38:15'),
(2, 1, 'admin', 'UPDATE', 'inventory', 1, 'Reordered inventory item #1: added 300 units', '::1', '2026-06-07 00:48:15'),
(3, 1, 'admin', 'UPDATE', 'inventory', 19, 'Used 2 units of inventory item #19 (remaining: 38)', '::1', '2026-06-07 00:48:45'),
(4, 1, 'admin', 'CREATE', 'appointment', NULL, 'Created appointment for Phillip N Ndarevani (Misa) on 2026-06-07', '::1', '2026-06-07 00:49:39'),
(5, 2, 'vet', 'UPDATE', 'inventory', 1, 'Used 6 units of inventory item #1 (remaining: 304)', '::1', '2026-06-07 00:50:53'),
(6, 2, 'vet', 'UPDATE', 'inventory', 19, 'Used 3 units of inventory item #19 (remaining: 35)', '::1', '2026-06-07 00:51:04'),
(7, 1, 'admin', 'UPDATE', 'service', 1, 'Updated service #1: General Checkup', '::1', '2026-06-07 01:04:43'),
(8, 1, 'admin', 'CREATE', 'employee', 11, 'Created employee: Phillip Ndarevani', '::1', '2026-06-07 01:11:38'),
(9, 1, 'admin', 'UPDATE', 'employee', 11, 'Updated employee #11', '::1', '2026-06-07 01:11:58'),
(10, 2, 'vet', 'CREATE', 'inventory', NULL, 'Added inventory item: Antibiotics - Morphine', '::1', '2026-06-07 05:16:52'),
(11, 2, 'vet', 'UPDATE', 'inventory', 1, 'Used 3 units of inventory item #1 (remaining: 301)', '::1', '2026-06-07 05:20:00'),
(12, 2, 'vet', 'CREATE', 'inventory', NULL, 'Added inventory item: test data', '::1', '2026-06-07 05:20:32'),
(13, 2, 'vet', 'CREATE', 'medical_record', 15, 'Vet created medical record for patient Misa', '::1', '2026-06-07 05:27:33'),
(14, 2, 'vet', 'CREATE', 'appointment', NULL, 'Created appointment for Phillip N Ndarevani (Boony) on 2026-06-07', '::1', '2026-06-07 05:34:41'),
(15, 1, 'admin', 'CREATE', 'appointment', NULL, 'Created appointment for Ankela (Helio) on 2026-06-07', '::1', '2026-06-07 05:36:06'),
(16, 1, 'admin', 'UPDATE', 'appointment', 31, 'Appointment rescheduled successfully (appointment #31)', '::1', '2026-06-07 05:36:49'),
(17, 1, 'admin', 'CREATE', 'medical_record', 16, 'Created medical record for patient Helio', '::1', '2026-06-07 05:37:57'),
(18, 1, 'admin', 'UPDATE', 'medical_record', 16, 'Updated medical record #16', '::1', '2026-06-07 05:38:23'),
(19, 1, 'admin', 'UPDATE', 'medical_record', 15, 'Updated medical record #15', '::1', '2026-06-07 05:42:13'),
(20, 1, 'admin', 'UPDATE', 'appointment', 34, 'Appointment updated successfully (appointment #34)', '::1', '2026-06-07 05:43:07'),
(21, 1, 'admin', 'UPDATE', 'appointment', 34, 'Appointment updated successfully (appointment #34)', '::1', '2026-06-07 05:43:10'),
(22, 1, 'admin', 'UPDATE', 'appointment', 34, 'Appointment updated successfully (appointment #34)', '::1', '2026-06-07 05:43:18'),
(23, 2, 'vet', 'UPDATE', 'appointment', 34, 'Appointment updated successfully (appointment #34)', '::1', '2026-06-07 05:43:45'),
(24, 2, 'vet', 'UPDATE', 'inventory', 1, 'Used 5 units of inventory item #1 (remaining: 296)', '::1', '2026-06-12 15:47:40'),
(25, 2, 'vet', 'UPDATE', 'medical_record', 15, 'Vet updated medical record #15', '::1', '2026-06-12 15:48:32'),
(26, 2, 'vet', 'CREATE', 'medical_record', 17, 'Vet created medical record for patient Boony', '::1', '2026-06-12 15:49:53'),
(27, 2, 'vet', 'UPDATE', 'appointment', 31, 'Appointment updated successfully (appointment #31)', '::1', '2026-06-12 15:50:08'),
(28, 2, 'vet', 'UPDATE', 'appointment', 31, 'Appointment updated successfully (appointment #31)', '::1', '2026-06-12 15:50:20'),
(29, 2, 'vet', 'UPDATE', 'appointment', 31, 'Appointment completed successfully (appointment #31)', '::1', '2026-06-12 15:50:29'),
(30, 2, 'vet', 'UPDATE', 'appointment', 31, 'Appointment updated successfully (appointment #31)', '::1', '2026-06-12 15:50:38'),
(31, 2, 'vet', 'UPDATE', 'appointment', 31, 'Appointment rescheduled successfully (appointment #31)', '::1', '2026-06-12 15:51:14'),
(32, 1, 'admin', 'CREATE', 'appointment', NULL, 'Created appointment for Phillip N Ndarevani (Asdas) on 2026-06-12', '::1', '2026-06-12 15:53:58'),
(33, 1, 'admin', 'UPDATE', 'inventory', 1, 'Used 12 units of inventory item #1 (remaining: 284)', '::1', '2026-06-12 15:55:43'),
(34, 1, 'admin', 'UPDATE', 'service', 3, 'Updated service #3: Dental Cleaning', '::1', '2026-06-12 15:55:57'),
(35, 1, 'admin', 'UPDATE', 'service', 3, 'Updated service #3: Dental Cleaning', '::1', '2026-06-12 15:56:02'),
(36, 1, 'admin', 'UPDATE', 'service', 2, 'Updated service #2: Vaccination', '::1', '2026-06-12 15:56:23'),
(37, 1, 'admin', 'UPDATE', 'employee', 3, 'Updated employee #3', '::1', '2026-06-12 15:58:39'),
(38, 1, 'admin', 'UPDATE', 'appointment', 41, 'Appointment rescheduled successfully (appointment #41)', '::1', '2026-06-12 17:44:43'),
(39, 1, 'admin', 'UPDATE', 'appointment', 46, 'Appointment updated successfully (appointment #46)', '::1', '2026-06-12 17:44:52'),
(40, 1, 'admin', 'UPDATE', 'appointment', 46, 'Appointment updated successfully (appointment #46)', '::1', '2026-06-12 17:44:56'),
(41, 1, 'admin', 'UPDATE', 'appointment', 46, 'Appointment updated successfully (appointment #46)', '::1', '2026-06-12 17:44:59'),
(42, 1, 'admin', 'DELETE', 'appointment', 31, 'Deleted appointment #31', '::1', '2026-06-12 17:45:04'),
(43, 1, 'admin', 'DELETE', 'appointment', 37, 'Deleted appointment #37', '::1', '2026-06-12 17:45:14'),
(44, 1, 'admin', 'UPDATE', 'inventory', 1, 'Updated inventory item #1', '::1', '2026-06-12 17:46:32'),
(45, 1, 'admin', 'UPDATE', 'inventory', 21, 'Used 13 units of inventory item #21 (remaining: 885)', '::1', '2026-06-12 17:46:42'),
(46, 1, 'admin', 'UPDATE', 'service', 3, 'Updated service #3: Dental Cleaning', '::1', '2026-06-12 17:47:11'),
(47, 1, 'admin', 'UPDATE', 'service', 3, 'Updated service #3: Dental Cleaning', '::1', '2026-06-12 17:47:16'),
(48, 1, 'admin', 'UPDATE', 'appointment', 46, 'Appointment completed successfully (appointment #46)', '::1', '2026-06-12 17:53:27'),
(49, 1, 'admin', 'UPDATE', 'inventory', 1, 'Used 20 units of inventory item #1 (remaining: 264)', '::1', '2026-06-12 17:54:18'),
(50, 1, 'admin', 'UPDATE', 'appointment', 46, 'Appointment updated successfully (appointment #46)', '::1', '2026-06-13 07:27:30'),
(51, 1, 'admin', 'UPDATE', 'appointment', 46, 'Appointment updated successfully (appointment #46)', '::1', '2026-06-13 07:27:35'),
(52, 1, 'admin', 'UPDATE', 'inventory', 1, 'Used 3 units of inventory item #1 (remaining: 261)', '::1', '2026-06-13 07:32:04'),
(53, 1, 'admin', 'UPDATE', 'appointment', 49, 'Appointment updated successfully (appointment #49)', '::1', '2026-06-14 20:22:54'),
(54, 1, 'admin', 'UPDATE', 'appointment', 49, 'Appointment completed successfully (appointment #49)', '::1', '2026-06-14 20:23:35'),
(55, 1, 'admin', 'UPDATE', 'appointment', 49, 'Appointment updated successfully (appointment #49)', '::1', '2026-06-14 20:23:54'),
(56, 1, 'admin', 'UPDATE', 'appointment', 49, 'Appointment updated successfully (appointment #49)', '::1', '2026-06-14 20:24:14'),
(57, 1, 'admin', 'UPDATE', 'appointment', 49, 'Appointment updated successfully (appointment #49)', '::1', '2026-06-14 20:24:47'),
(58, 1, 'admin', 'UPDATE', 'appointment', 49, 'Appointment rescheduled successfully (appointment #49)', '::1', '2026-06-14 20:25:45'),
(59, 1, 'admin', 'UPDATE', 'employee', 3, 'Updated employee #3', '::1', '2026-06-14 20:27:06'),
(60, 2, 'vet', 'UPDATE', 'appointment', 49, 'Appointment updated successfully (appointment #49)', '::1', '2026-06-14 20:28:14'),
(61, 1, 'admin', 'UPDATE', 'appointment', 49, 'Appointment completed successfully (appointment #49)', '::1', '2026-06-15 06:55:07'),
(62, 1, 'admin', 'UPDATE', 'inventory', 1, 'Used 10 units of inventory item #1 (remaining: 251)', '::1', '2026-06-15 06:59:08'),
(63, 1, 'admin', 'CREATE', 'medical_record', 18, 'Created medical record for patient Asdas', '::1', '2026-06-15 07:00:10'),
(64, 1, 'admin', 'UPDATE', 'appointment', 49, 'Appointment updated successfully (appointment #49)', '::1', '2026-06-15 07:00:48'),
(65, 1, 'admin', 'UPDATE', 'appointment', 47, 'Appointment updated successfully (appointment #47)', '::1', '2026-06-15 07:00:59'),
(66, 1, 'admin', 'UPDATE', 'appointment', 47, 'Appointment updated successfully (appointment #47)', '::1', '2026-06-15 07:01:13'),
(67, 2, 'vet', 'UPDATE', 'inventory', 1, 'Used 5 units of inventory item #1 (remaining: 246)', '::1', '2026-06-15 07:03:03'),
(68, 1, 'admin', 'UPDATE', 'appointment', 50, 'Appointment updated successfully (appointment #50)', '::1', '2026-06-15 09:58:33'),
(69, 1, 'admin', 'UPDATE', 'appointment', 50, 'Appointment completed successfully (appointment #50)', '::1', '2026-06-15 09:58:59'),
(70, 1, 'admin', 'UPDATE', 'inventory', 1, 'Used 40 units of inventory item #1 (remaining: 206)', '::1', '2026-06-15 09:59:40');

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
CREATE TABLE IF NOT EXISTS `employees` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('vet','admin','staff') NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `specialization` varchar(100) DEFAULT NULL,
  `working_hours` json DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=MyISAM AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`id`, `first_name`, `last_name`, `email`, `password`, `role`, `phone`, `specialization`, `working_hours`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Admin', 'User', 'admin@vettech.com', '$2b$10$xxxxxxxxxxx', 'admin', NULL, NULL, NULL, 'active', '2025-06-10 10:15:57', '2025-06-10 10:15:57'),
(2, 'James', 'Moyo', 'j.moyo@vettech.com', '$2a$10$SEwTZ9h3wZI2RgJyRPSOc.aUXrRd4tp7bLEcjaBg8uIGmSXWoIhO2', 'vet', '0788100001', 'Small Animal Medicine', '{\"friday\": \"08:00-16:00\", \"monday\": \"08:00-17:00\", \"tuesday\": \"08:00-17:00\", \"thursday\": \"08:00-17:00\", \"wednesday\": \"08:00-17:00\"}', 'active', '2026-05-27 16:33:57', '2026-05-27 16:33:57'),
(3, 'Chiedza', 'Ncube', 'c.ncube@vettech.com', '$2a$10$SEwTZ9h3wZI2RgJyRPSOc.aUXrRd4tp7bLEcjaBg8uIGmSXWoIhO2', 'vet', '0788100002', 'Surgery & Orthopaedics', '{\"friday\": \"09:00-17:00\", \"monday\": \"09:00-18:00\", \"tuesday\": \"09:00-18:00\", \"thursday\": \"09:00-18:00\", \"wednesday\": \"09:00-18:00\"}', 'active', '2026-05-27 16:33:57', '2026-06-14 20:27:06'),
(4, 'Takudzwa', 'Dube', 't.dube@vettech.com', '$2a$10$SEwTZ9h3wZI2RgJyRPSOc.aUXrRd4tp7bLEcjaBg8uIGmSXWoIhO2', 'vet', '0788100003', 'Dentistry & Dermatology', '{\"friday\": \"08:00-17:00\", \"monday\": \"08:00-17:00\", \"tuesday\": \"08:00-17:00\", \"saturday\": \"08:00-13:00\", \"thursday\": \"08:00-17:00\", \"wednesday\": \"off\"}', 'active', '2026-05-27 16:33:57', '2026-05-27 16:33:57'),
(5, 'Rutendo', 'Mhaka', 'r.mhaka@vettech.com', '$2a$10$SEwTZ9h3wZI2RgJyRPSOc.aUXrRd4tp7bLEcjaBg8uIGmSXWoIhO2', 'vet', '0788100004', 'Exotic & Avian Animals', '{\"friday\": \"09:00-17:00\", \"tuesday\": \"09:00-17:00\", \"saturday\": \"09:00-14:00\", \"thursday\": \"09:00-17:00\", \"wednesday\": \"09:00-17:00\"}', 'active', '2026-05-27 16:33:57', '2026-05-27 16:33:57'),
(6, 'Simba', 'Mutasa', 's.mutasa@vettech.com', '$2a$10$SEwTZ9h3wZI2RgJyRPSOc.aUXrRd4tp7bLEcjaBg8uIGmSXWoIhO2', 'staff', '0788100005', 'Veterinary Nurse', '{\"friday\": \"07:30-15:30\", \"monday\": \"07:30-16:30\", \"tuesday\": \"07:30-16:30\", \"thursday\": \"07:30-16:30\", \"wednesday\": \"07:30-16:30\"}', 'active', '2026-05-27 16:33:57', '2026-05-27 16:33:57'),
(7, 'Melody', 'Chirisa', 'm.chirisa@vettech.com', '$2a$10$SEwTZ9h3wZI2RgJyRPSOc.aUXrRd4tp7bLEcjaBg8uIGmSXWoIhO2', 'staff', '0788100006', 'Receptionist', '{\"friday\": \"08:00-16:00\", \"monday\": \"08:00-17:00\", \"tuesday\": \"08:00-17:00\", \"thursday\": \"08:00-17:00\", \"wednesday\": \"08:00-17:00\"}', 'active', '2026-05-27 16:33:57', '2026-05-27 16:33:57'),
(8, 'Tendai', 'Zvobgo', 't.zvobgo@vettech.com', '$2a$10$SEwTZ9h3wZI2RgJyRPSOc.aUXrRd4tp7bLEcjaBg8uIGmSXWoIhO2', 'staff', '0788100007', 'Lab Technician', '{\"friday\": \"08:00-16:00\", \"monday\": \"08:00-16:00\", \"wednesday\": \"08:00-16:00\"}', 'active', '2026-05-27 16:33:57', '2026-05-27 16:33:57'),
(9, 'Farai', 'Nhamo', 'f.nhamo@vettech.com', '$2a$10$SEwTZ9h3wZI2RgJyRPSOc.aUXrRd4tp7bLEcjaBg8uIGmSXWoIhO2', 'admin', '0788100008', 'Practice Manager', '{\"friday\": \"08:00-16:00\", \"monday\": \"08:00-17:00\", \"tuesday\": \"08:00-17:00\", \"thursday\": \"08:00-17:00\", \"wednesday\": \"08:00-17:00\"}', 'active', '2026-05-27 16:33:57', '2026-05-27 16:33:57'),
(10, 'Blessed', 'Mpofu', 'b.mpofu@vettech.com', '$2a$10$SEwTZ9h3wZI2RgJyRPSOc.aUXrRd4tp7bLEcjaBg8uIGmSXWoIhO2', 'staff', '0788100009', 'Veterinary Assistant', '{\"tuesday\": \"08:00-17:00\", \"saturday\": \"08:00-14:00\", \"thursday\": \"08:00-17:00\", \"wednesday\": \"08:00-17:00\"}', 'active', '2026-05-27 16:33:57', '2026-05-29 17:34:12'),
(11, 'Phillip', 'Ndarevani', 'phillippendare@gmail.com', '$2a$10$NFoStVtY2OGnF3/ioPucTOrqnES84GVj9tesDiov6K8Hk2W0k3mDO', 'staff', '0788400208', 'Veterinary Assistant', NULL, 'active', '2026-06-07 01:11:38', '2026-06-07 01:11:58');

-- --------------------------------------------------------

--
-- Table structure for table `inventory`
--

DROP TABLE IF EXISTS `inventory`;
CREATE TABLE IF NOT EXISTS `inventory` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `category` varchar(50) NOT NULL,
  `quantity` int NOT NULL DEFAULT '0',
  `unit_price` decimal(10,2) NOT NULL,
  `reorder_level` int NOT NULL DEFAULT '10',
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `inventory`
--

INSERT INTO `inventory` (`id`, `name`, `category`, `quantity`, `unit_price`, `reorder_level`, `status`, `created_at`) VALUES
(1, 'Amoxicillin 250mg', 'Medications', 206, 13.00, 20, 'active', '2025-06-10 08:00:00'),
(2, 'Metronidazole 200mg', 'Medications', 60, 9.75, 15, 'active', '2025-06-10 08:00:00'),
(3, 'Meloxicam 1.5mg/ml', 'Medications', 45, 18.00, 10, 'active', '2025-06-10 08:00:00'),
(4, 'Dexamethasone Injection 2mg', 'Medications', 30, 22.00, 10, 'active', '2025-06-10 08:00:00'),
(5, 'Rabies Vaccine', 'Vaccines', 50, 35.00, 15, 'active', '2025-06-10 08:00:00'),
(6, 'Distemper/Parvovirus Vaccine', 'Vaccines', 40, 28.50, 15, 'active', '2025-06-10 08:00:00'),
(7, 'Feline Calicivirus Vaccine', 'Vaccines', 35, 30.00, 10, 'active', '2025-06-10 08:00:00'),
(8, 'Bordetella Vaccine', 'Vaccines', 25, 25.00, 10, 'active', '2025-06-10 08:00:00'),
(9, 'Disposable Syringes 5ml', 'Medical Supplies', 200, 0.85, 50, 'active', '2025-06-10 08:00:00'),
(10, 'Sterile Gloves (box of 100)', 'Medical Supplies', 20, 14.00, 5, 'active', '2025-06-10 08:00:00'),
(11, 'Gauze Bandage Rolls', 'Medical Supplies', 100, 2.50, 25, 'active', '2025-06-10 08:00:00'),
(12, 'Surgical Sutures (pack)', 'Medical Supplies', 40, 11.00, 10, 'active', '2025-06-10 08:00:00'),
(13, 'IV Drip Set', 'Medical Supplies', 50, 6.50, 15, 'active', '2025-06-10 08:00:00'),
(14, 'Digital Thermometer', 'Equipment', 10, 45.00, 3, 'active', '2025-06-10 08:00:00'),
(15, 'Stethoscope', 'Equipment', 5, 120.00, 2, 'active', '2025-06-10 08:00:00'),
(16, 'Elizabethan Collar (Medium)', 'Equipment', 25, 8.00, 8, 'active', '2025-06-10 08:00:00'),
(17, 'Omega-3 Supplement (bottle)', 'Supplements', 30, 16.00, 8, 'active', '2025-06-10 08:00:00'),
(18, 'Probiotic Powder (200g)', 'Supplements', 25, 13.50, 8, 'active', '2025-06-10 08:00:00'),
(19, 'Antiseptic Solution 500ml', 'Cleaning Supplies', 35, 7.00, 10, 'active', '2025-06-10 08:00:00'),
(20, 'Disinfectant Spray 1L', 'Cleaning Supplies', 30, 9.00, 10, 'active', '2025-06-10 08:00:00'),
(21, 'Antibiotics - Amoxicillinz', 'Medications', 885, 20.00, 5, 'active', '2026-05-29 17:21:31'),
(22, 'Antibiotics - Morphine', 'Medication', 400, 2.00, 20, 'active', '2026-06-07 05:16:52'),
(23, 'test data', 'Medication', 200, 25.00, 24, 'active', '2026-06-07 05:20:32');

-- --------------------------------------------------------

--
-- Table structure for table `medical_records`
--

DROP TABLE IF EXISTS `medical_records`;
CREATE TABLE IF NOT EXISTS `medical_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `appointment_id` int DEFAULT NULL,
  `patient_name` varchar(100) NOT NULL,
  `owner_name` varchar(100) NOT NULL,
  `owner_phone` varchar(20) DEFAULT NULL,
  `pet_species` varchar(50) NOT NULL,
  `pet_breed` varchar(100) DEFAULT NULL,
  `pet_age` int DEFAULT NULL,
  `diagnosis` text NOT NULL,
  `treatment` text NOT NULL,
  `prescription` text,
  `notes` text,
  `vet_id` int NOT NULL,
  `record_date` date NOT NULL,
  `next_visit_date` date DEFAULT NULL,
  `status` enum('active','archived') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `vet_id` (`vet_id`),
  KEY `appointment_id` (`appointment_id`),
  KEY `patient_name` (`patient_name`)
) ENGINE=MyISAM AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `medical_records`
--

INSERT INTO `medical_records` (`id`, `appointment_id`, `patient_name`, `owner_name`, `owner_phone`, `pet_species`, `pet_breed`, `pet_age`, `diagnosis`, `treatment`, `prescription`, `notes`, `vet_id`, `record_date`, `next_visit_date`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 'Hess', 'Colin Sibanda', '0788400209', 'Cat', 'Domestic Shorthair', 3, 'Routine annual wellness exam. No abnormalities detected.', 'Administered FVRCP booster vaccine. Deworming treatment applied.', 'Drontal Plus 1 tablet once', 'Patient calm and cooperative. Good weight.', 2, '2025-06-19', '2026-06-19', 'active', '2026-05-27 16:05:37', '2026-05-27 16:05:37'),
(2, 2, 'Gol', 'Kholwani Dube', '0788400200', 'Dog', 'K9 Mixed Breed', 4, 'Moderate tartar buildup on molars. Early gingivitis noted.', 'Full dental scaling and polishing under sedation. Gingivitis treated with chlorhexidine rinse.', 'Chlorhexidine oral rinse 10ml twice daily for 7 days', 'Owner advised to begin regular tooth brushing at home.', 2, '2025-06-18', '2025-09-18', 'active', '2026-05-27 16:05:37', '2026-05-27 16:05:37'),
(3, 5, 'Hnwew', 'Colin Sibandr', '0788400206', 'Cat', 'Mixed Breed', 2, 'Vomiting and lethargy for 2 days. Mild dehydration on examination.', 'IV fluid therapy administered. Anti-emetic injection given. Bland diet prescribed.', 'Cerenia 1mg/kg once daily for 3 days. Hill s i/d diet.', 'Bloods taken ? results pending. Follow up if symptoms persist beyond 48hrs.', 2, '2025-06-26', '2025-07-03', 'active', '2026-05-27 16:05:37', '2026-05-27 16:05:37'),
(4, 8, 'Braids', 'Phillip Ndareman', '0788400212', 'Cat', 'Assassin Mix', 5, 'Annual vaccination and health check. Overweight ? body condition score 7/9.', 'Rabies and FVRCP vaccines administered. Weight management counselling given.', NULL, 'Owner advised to switch to weight-control diet and increase exercise.', 2, '2025-06-17', '2025-09-17', 'active', '2026-05-27 16:05:37', '2026-05-27 16:05:37'),
(5, 9, 'Kin', 'Claudine Dublin', '0788432123', 'Other', 'Unknown', 1, 'First visit. Skin irritation and excessive scratching noted. Possible flea allergy dermatitis.', 'Flea treatment applied. Cortisone injection for inflammation.', 'Advocate spot-on monthly. Cortavance spray twice daily for 5 days.', 'Recommended flea treatment for all household pets.', 2, '2025-06-24', '2025-07-08', 'active', '2026-05-27 16:05:37', '2026-05-27 16:05:37'),
(6, 10, 'Clouse', 'Malulin', '0788432122', 'Dog', 'Chihuahua', 6, 'Sudden onset limping on left foreleg. X-ray shows no fracture. Soft tissue injury.', 'Rest enforced. Anti-inflammatory prescribed. Cold compress advised for first 48hrs.', 'Meloxicam 0.1mg/kg once daily for 5 days with food.', 'No strenuous activity for 2 weeks. Return if no improvement.', 2, '2025-06-28', '2025-07-12', 'active', '2026-05-27 16:05:37', '2026-05-27 16:05:37'),
(7, 13, 'Vos', 'Katlyn Mioyo', '0788432122', 'Dog', 'K9 Mixed Breed', 3, 'Pre-surgery consultation. Cruciate ligament tear confirmed via orthopaedic exam.', 'Surgery scheduled. Blood work and chest X-ray done as pre-op workup. All clear.', 'Tramadol 5mg/kg twice daily for pain management pre-op.', 'Surgery booked for next available slot. Owner briefed on post-op care.', 2, '2025-07-01', '2025-07-15', 'active', '2026-05-27 16:05:37', '2026-05-27 16:05:37'),
(8, 15, 'Billion', 'July Baby', '0788432000', 'Dog', 'Mixed Breed', 2, 'Puppy wellness check at 8 weeks. Healthy. First vaccination course started.', 'DHPPi first vaccination administered. Deworming done.', 'Drontal puppy suspension 1ml/kg once. Return in 3-4 weeks for second dose.', 'Owner educated on puppy nutrition and socialisation.', 2, '2025-06-27', '2025-07-25', 'active', '2026-05-27 16:05:37', '2026-05-27 16:05:37'),
(9, NULL, 'Luna', 'Walk-in Client', NULL, 'Cat', 'Persian', 2, 'Eye discharge and mild conjunctivitis in both eyes.', 'Eyes cleaned with sterile saline. Antibiotic eye drops prescribed.', 'Terramycin eye ointment 3x daily for 7 days.', 'Walk-in visit. No appointment on file. Monitor for improvement.', 2, '2025-05-10', NULL, 'active', '2026-05-27 16:05:37', '2026-05-27 16:05:37'),
(10, NULL, 'Max', 'Walk-in Client', NULL, 'Dog', 'Golden Retriever', 3, 'Annual booster vaccines. Healthy adult dog in good condition.', 'DHPPi and rabies boosters administered. Heartworm test negative.', 'Heartgard Plus monthly chewable ? 1 tablet.', 'Next annual vaccines due June 2026.', 2, '2025-06-01', '2026-06-01', 'active', '2026-05-27 16:05:37', '2026-05-27 16:05:37'),
(11, NULL, 'braids', 'Phillip Ndareman', '0788400212', 'cat', 'assassin', NULL, 'sadada', 'asdasda', 'sadasa', 'safasafasf', 2, '2026-05-27', NULL, 'active', '2026-05-27 16:24:11', '2026-05-27 16:24:11'),
(12, NULL, 'Test Data', 'Able Dube', '0784177000', 'Dog', NULL, 5, 'eggaegarg', 'egaerag', 'rgaerg', 'egeag', 1, '2026-05-29', NULL, 'active', '2026-05-29 17:20:16', '2026-05-29 17:20:42'),
(13, NULL, 'kinas', 'Claudine Dublinas', '0788432000', 'dog', 'Chuaua', NULL, 'efgwefwef', 'wfqqew', 'wefqwe', 'wefweqf', 2, '2026-05-29', NULL, 'active', '2026-05-29 17:46:52', '2026-05-29 17:46:52'),
(14, NULL, 'Misa', 'Phillip N Ndarevani', '0788400208', 'Reptile', NULL, 2, 'etwtetw', 'wetrwetw', 'etwtwetwe', 'wetwetwet', 1, '2026-06-07', NULL, 'active', '2026-06-07 00:38:15', '2026-06-07 00:38:15'),
(15, NULL, 'Misa', 'Phillip N Ndarevani', '0788400208', 'Reptile', 'Wef', NULL, 'test data', 'test data 33', 'test data', 'afsafafs', 2, '2026-06-12', NULL, 'active', '2026-06-07 05:27:33', '2026-06-12 15:48:32'),
(16, NULL, 'Helio', 'Ankela', '0784177001', 'Rabbit', NULL, NULL, 'kjbkjbl', 'jhbpiu', 'opj[oj', 'oibpio;', 1, '2026-06-07', NULL, 'active', '2026-06-07 05:37:57', '2026-06-07 05:38:23'),
(17, NULL, 'Boony', 'Phillip N Ndarevani', '0784177243', 'Bird', 'helio', 2, 'sfdsdfs', 'sdgdsfsdg', 'sgsdgsg', 'sdgsdg', 2, '2026-06-12', NULL, 'active', '2026-06-12 15:49:53', '2026-06-12 15:49:53'),
(18, NULL, 'Asdas', 'Phillip N Ndarevani', '0784177001', 'Rabbit', NULL, 3, 'test data', 'test data', 'testing', 'testing', 1, '2026-06-15', NULL, 'active', '2026-06-15 07:00:10', '2026-06-15 07:00:10');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `executed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `name`, `executed_at`) VALUES
(1, '01_initial_schema.sql', '2025-06-10 11:40:50'),
(2, '02_sample_data.sql', '2025-06-10 11:40:50'),
(3, '03_newsletter.sql', '2025-06-11 20:53:08'),
(4, '04_employees.sql', '2026-06-12 13:45:54'),
(5, '11_payment_details.sql', '2026-06-12 13:46:23'),
(6, '12_appointment_status_no_show.sql', '2026-06-14 20:18:08');

-- --------------------------------------------------------

--
-- Table structure for table `newsletter_subscriptions`
--

DROP TABLE IF EXISTS `newsletter_subscriptions`;
CREATE TABLE IF NOT EXISTS `newsletter_subscriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `status` enum('active','unsubscribed') DEFAULT 'active',
  `subscribed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `unsubscribed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `newsletter_subscriptions`
--

INSERT INTO `newsletter_subscriptions` (`id`, `email`, `status`, `subscribed_at`, `unsubscribed_at`) VALUES
(1, 'newsletter1@email.com', 'active', '2025-06-10 11:40:50', NULL),
(2, 'newsletter2@email.com', 'active', '2025-06-10 11:40:50', NULL),
(3, 'newsletter3@email.com', 'unsubscribed', '2025-06-10 11:40:50', NULL),
(4, 'flickyflicks01@gmail.com', 'active', '2025-06-14 21:54:34', NULL),
(5, 'phillippendare@gmail.com', 'active', '2025-06-14 22:18:36', NULL),
(6, 'ndarephillip@gmail.com', 'active', '2025-06-14 22:26:33', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `queries`
--

DROP TABLE IF EXISTS `queries`;
CREATE TABLE IF NOT EXISTS `queries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `message` text NOT NULL,
  `status` enum('new','in_progress','resolved') DEFAULT 'new',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `queries`
--

INSERT INTO `queries` (`id`, `name`, `email`, `message`, `status`, `created_at`) VALUES
(1, 'asda', 'asda@dsfsdfs', 'dfsdfs', 'new', '2025-06-14 20:46:23'),
(2, 'sdsdf', 'sdfsdf@sdgsdsdfs', 'sdfsd', 'new', '2025-06-14 20:47:57'),
(3, 'gdfg', 'dsfsdfs@dfgdfd', 'fgdfgd', 'new', '2025-06-14 20:50:36'),
(4, 'd', 'sd@gdfgd', 'g', 'new', '2025-06-15 21:05:20'),
(5, 'd', 'sd@gdfgd', 'g', 'new', '2025-06-15 21:05:29'),
(7, 'killer', 'killer2@hotmail', 'kill', 'new', '2025-06-15 21:07:29'),
(16, 'test data', 'phillippendare@gmail.com', 'test data', 'resolved', '2026-06-12 17:52:52'),
(14, 'Smokes', 'test@gmail.com', 'testing 123', 'resolved', '2026-06-07 05:02:13'),
(15, 'Test data', 'testdata@gmail.com', 'Test data', 'resolved', '2026-06-12 15:43:06'),
(17, 'Trust Moyo', 'phillippendare@gmail.com', 'Testing system', 'new', '2026-06-15 06:50:29');

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

DROP TABLE IF EXISTS `services`;
CREATE TABLE IF NOT EXISTS `services` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `duration` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`id`, `name`, `description`, `duration`, `price`, `status`, `created_at`) VALUES
(1, 'General Checkup', 'Routine health examination', 25, 50.00, 'active', '2025-06-14 20:44:17'),
(2, 'Vaccination', 'Standard pet vaccination', 20, 76.00, 'active', '2025-06-14 20:44:17'),
(3, 'Dental Cleaning', 'Complete dental care', 60, 120.00, 'active', '2025-06-14 20:44:17'),
(4, 'Surgery Consultation', 'Pre-surgery consultation', 45, 100.00, 'active', '2025-06-14 20:44:17');

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
CREATE TABLE IF NOT EXISTS `settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `clinic_name` varchar(100) NOT NULL,
  `clinic_email` varchar(100) DEFAULT NULL,
  `clinic_phone` varchar(20) DEFAULT NULL,
  `clinic_address` text,
  `appointment_duration` int DEFAULT '30',
  `working_hours_start` time DEFAULT '09:00:00',
  `working_hours_end` time DEFAULT '17:00:00',
  `email_notifications` tinyint(1) DEFAULT '1',
  `sms_notifications` tinyint(1) DEFAULT '0',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `clinic_name`, `clinic_email`, `clinic_phone`, `clinic_address`, `appointment_duration`, `working_hours_start`, `working_hours_end`, `email_notifications`, `sms_notifications`, `updated_at`) VALUES
(1, 'VetTech Animal Hospital', 'contact@vettech.com', '123-456-7890', '123 Vet Street, Medical District, City', 30, '09:00:00', '17:00:00', 1, 0, '2025-06-14 20:44:17');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','vet') NOT NULL,
  `specialization` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `specialization`, `phone`, `status`, `created_at`) VALUES
(1, 'Admin User', 'admin@vettech.com', '$2a$10$5dTIOaSa0jn0s.VPnL84mOKsje0mdq0SpLsWoG/LJR0e5W7IfGWwq', 'admin', NULL, NULL, 'active', '2025-06-14 20:44:17'),
(2, 'Dr. Smith', 'vet@vettech.com', '$2a$10$SEwTZ9h3wZI2RgJyRPSOc.aUXrRd4tp7bLEcjaBg8uIGmSXWoIhO2', 'vet', NULL, NULL, 'active', '2025-06-14 20:44:17'),
(3, 'Sir Phillippe', 'phillippendare@gmail.com', '$2a$10$F2tSZuydzOeQpg9gQ6ThP.anilwwFa0EtJReP2gmpny2.tMjQjn7e', 'admin', 'Doctor', '0788400208', 'inactive', '2026-05-29 17:23:43');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
