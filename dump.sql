-- SQLite Schema for Doctor App
-- Converted from MySQL schema with proper SQLite syntax

-- Table structure for table `imaging_studies`
DROP TABLE IF EXISTS `imaging_studies`;
CREATE TABLE `imaging_studies` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `name` TEXT DEFAULT NULL,
  `name_ar` TEXT DEFAULT NULL,
  `created_at` TEXT DEFAULT (datetime('now'))
);

INSERT INTO `imaging_studies` VALUES 
(1,'CT Scan Abdomen',NULL,datetime('now')),
(2,'CT Scan Head',NULL,datetime('now')),
(3,'Echocardiogram',NULL,datetime('now')),
(4,'Mammography',NULL,datetime('now')),
(5,'MRI Brain',NULL,datetime('now')),
(6,'Ultrasound Abdomen',NULL,datetime('now')),
(7,'X-Ray Chest',NULL,datetime('now')),
(8,'X-Ray Spine',NULL,datetime('now'));

-- Table structure for table `lab_tests`
DROP TABLE IF EXISTS `lab_tests`;
CREATE TABLE `lab_tests` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `name` TEXT DEFAULT NULL,
  `name_ar` TEXT DEFAULT NULL,
  `description` TEXT NULL,
  `created_at` TEXT DEFAULT (datetime('now'))
);

INSERT INTO `lab_tests` VALUES 
(1,'Blood Sugar',NULL,NULL,datetime('now')),
(2,'Complete Blood Count (CBC)',NULL,NULL,datetime('now')),
(3,'ECG',NULL,NULL,datetime('now')),
(4,'Kidney Function Test',NULL,NULL,datetime('now')),
(5,'Lipid Profile',NULL,NULL,datetime('now')),
(6,'Liver Function Test',NULL,NULL,datetime('now')),
(7,'Thyroid Function Test',NULL,NULL,datetime('now')),
(8,'Urine Analysis',NULL,NULL,datetime('now')),
(9,'X-Ray Chest',NULL,NULL,datetime('now'));

-- Table structure for table `medicine`
DROP TABLE IF EXISTS `medicine`;
CREATE TABLE `medicine` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `name` TEXT NOT NULL,
  `name_ar` TEXT DEFAULT NULL,
  `dosage` TEXT NULL,
  `form` TEXT NULL,
  `manufacturer` TEXT NULL,
  `price` REAL NULL,
  `created_at` TEXT DEFAULT (datetime('now')),
  `updated_at` TEXT DEFAULT (datetime('now')),
  UNIQUE (`name`)
);

INSERT INTO `medicine` VALUES 
(1,'Amoxicilin',NULL,NULL,NULL,NULL,NULL,datetime('now'),datetime('now')),
(2,'Cetrizine',NULL,NULL,NULL,NULL,NULL,datetime('now'),datetime('now')),
(3,'Ibuprofen',NULL,NULL,NULL,NULL,NULL,datetime('now'),datetime('now')),
(4,'Omeprazole',NULL,NULL,NULL,NULL,NULL,datetime('now'),datetime('now')),
(5,'Panadol',NULL,NULL,NULL,NULL,NULL,datetime('now'),datetime('now')),
(6,'Paracetamol',NULL,NULL,NULL,NULL,NULL,datetime('now'),datetime('now'));

-- Table structure for table `patients`
DROP TABLE IF EXISTS `patients`;
CREATE TABLE `patients` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `name` TEXT NOT NULL,
  `age` INTEGER DEFAULT NULL,
  `date_of_birth` TEXT DEFAULT NULL,
  `gender` TEXT CHECK(gender IN ('male','female','other')) DEFAULT 'other',
  `phone` TEXT DEFAULT NULL,
  `address` TEXT,
  `medical_history` TEXT,
  `created_at` TEXT DEFAULT (datetime('now')),
  `deleted_at` TEXT DEFAULT NULL
);

INSERT INTO `patients` VALUES 
(34,'mona',19,'2005-10-06','female','4445',NULL,NULL,'2025-06-11 11:54:01',NULL),
(35,'sara',29,'1995-10-12','female',NULL,NULL,NULL,'2025-06-11 12:08:18',NULL);

-- Table structure for table `status`
DROP TABLE IF EXISTS `status`;
CREATE TABLE `status` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `name` TEXT NOT NULL,
  `name_ar` TEXT DEFAULT NULL,
  UNIQUE (`name`)
);

INSERT INTO `status` VALUES 
(1,'waiting',NULL),
(2,'completed',NULL),
(3,'cancelled',NULL);

-- Table structure for table `type`
DROP TABLE IF EXISTS `type`;
CREATE TABLE `type` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `name` TEXT NOT NULL,
  UNIQUE (`name`)
);

INSERT INTO `type` VALUES 
(9,'primary'),
(10,'follow up');

-- Table structure for table `visits`
DROP TABLE IF EXISTS `visits`;
CREATE TABLE `visits` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `patient_id` INTEGER NOT NULL,
  `visit_date` TEXT NOT NULL,
  `type_id` INTEGER NOT NULL,
  `status_id` INTEGER NOT NULL,
  `chief_complaint` TEXT,
  `diagnosis` TEXT,
  `notes` TEXT,
  `prescription_id` INTEGER DEFAULT NULL,
  `created_at` TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`),
  FOREIGN KEY (`type_id`) REFERENCES `type` (`id`),
  FOREIGN KEY (`status_id`) REFERENCES `status` (`id`)
);

INSERT INTO `visits` VALUES 
(1,34,'2025-06-13',10,2,'','','',NULL,datetime('now')),
(2,34,'2025-06-13',10,2,'s','s','s',NULL,datetime('now')),
(3,34,'2025-06-13',10,2,'h','d','d',NULL,datetime('now')),
(4,34,'2025-06-13',10,2,'f','f','f',NULL,datetime('now'));

-- Table structure for table `doctor_profile`
DROP TABLE IF EXISTS `doctor_profile`;
CREATE TABLE `doctor_profile` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `name` TEXT NOT NULL,
    `title` TEXT,
    `qualification` TEXT,
    `specialization` TEXT,
    `clinic_name` TEXT,
    `clinic_address` TEXT,
    `phone` TEXT,
    `email` TEXT,
    `created_at` TEXT DEFAULT (datetime('now')),
    `updated_at` TEXT DEFAULT (datetime('now'))
);

-- Table structure for table `patient_files`
DROP TABLE IF EXISTS `patient_files`;
CREATE TABLE `patient_files` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `patient_id` INTEGER NOT NULL,
    `visit_id` INTEGER NULL,
    `file_name` TEXT NOT NULL,
    `file_type` TEXT,
    `file_size` INTEGER,
    `file_path` TEXT NOT NULL,
    `description` TEXT,
    `uploaded_at` TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`visit_id`) REFERENCES `visits`(`id`) ON DELETE CASCADE
);

-- Table structure for table `dosage_history`
DROP TABLE IF EXISTS `dosage_history`;
CREATE TABLE `dosage_history` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `text` TEXT NOT NULL UNIQUE,
    `usage_count` INTEGER DEFAULT 1,
    `last_used` TEXT DEFAULT (datetime('now')),
    `created_at` TEXT DEFAULT (datetime('now'))
);

-- Table structure for table `duration_history`
DROP TABLE IF EXISTS `duration_history`;
CREATE TABLE `duration_history` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `text` TEXT NOT NULL UNIQUE,
    `usage_count` INTEGER DEFAULT 1,
    `last_used` TEXT DEFAULT (datetime('now')),
    `created_at` TEXT DEFAULT (datetime('now'))
);

-- Table structure for table `diagnosis_history`
DROP TABLE IF EXISTS `diagnosis_history`;
CREATE TABLE `diagnosis_history` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `text` TEXT NOT NULL,
    `usage_count` INTEGER DEFAULT 1,
    `last_used` TEXT DEFAULT (datetime('now')),
    `created_at` TEXT DEFAULT (datetime('now')),
    UNIQUE (`text`)
);

-- Table structure for table `notes_history`
DROP TABLE IF EXISTS `notes_history`;
CREATE TABLE `notes_history` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `text` TEXT NOT NULL,
    `usage_count` INTEGER DEFAULT 1,
    `last_used` TEXT DEFAULT (datetime('now')),
    `created_at` TEXT DEFAULT (datetime('now')),
    UNIQUE (`text`)
);

-- Table structure for table `instruction_history`
DROP TABLE IF EXISTS `instruction_history`;
CREATE TABLE `instruction_history` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `text` TEXT NOT NULL,
    `usage_count` INTEGER DEFAULT 1,
    `last_used` TEXT DEFAULT (datetime('now')),
    `created_at` TEXT DEFAULT (datetime('now'))
);

-- Table structure for table `prescription`
DROP TABLE IF EXISTS `prescription`;
CREATE TABLE `prescription` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `prescription_date` TEXT DEFAULT NULL,
  `diagnosis` TEXT,
  `notes` TEXT,
  `lab_tests` TEXT DEFAULT NULL,
  `visit_id` INTEGER DEFAULT NULL,
  `patient_id` INTEGER DEFAULT NULL,
  FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`),
  FOREIGN KEY (`visit_id`) REFERENCES `visits` (`id`)
);

-- Table structure for table `prescription_items`
DROP TABLE IF EXISTS `prescription_items`;
CREATE TABLE `prescription_items` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `prescription_id` INTEGER NOT NULL,
    `medicine_id` INTEGER NOT NULL,
    `dosage` TEXT,
    `frequency` TEXT,
    `duration` TEXT,
    `instructions` TEXT,
    `created_at` TEXT DEFAULT (datetime('now')),
    `updated_at` TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (`prescription_id`) REFERENCES `prescription`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`medicine_id`) REFERENCES `medicine`(`id`) ON DELETE CASCADE
);

-- Table structure for table `prescription_lab_tests`
DROP TABLE IF EXISTS `prescription_lab_tests`;
CREATE TABLE `prescription_lab_tests` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `prescription_id` INTEGER NOT NULL,
    `lab_test_id` INTEGER NOT NULL,
    `created_at` TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (`prescription_id`) REFERENCES `prescription`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`lab_test_id`) REFERENCES `lab_tests`(`id`) ON DELETE CASCADE
);

-- Table structure for table `visit_medicines`
DROP TABLE IF EXISTS `visit_medicines`;
CREATE TABLE `visit_medicines` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `dosage` TEXT,
  `diagnosis` TEXT,
  `duration` TEXT,
  `instructions` TEXT DEFAULT NULL,
  `prescription_id` INTEGER DEFAULT NULL,
  `medicine_id` INTEGER DEFAULT NULL,
  FOREIGN KEY (`prescription_id`) REFERENCES `prescription` (`id`),
  FOREIGN KEY (`medicine_id`) REFERENCES `medicine` (`id`)
);

-- Enable foreign keys
PRAGMA foreign_keys = ON;