-- تعطيل فحص Foreign Key مؤقتاً
SET FOREIGN_KEY_CHECKS = 0;

-- حذف الجداول بالترتيب العكسي (إذا كانت موجودة)
DROP TABLE IF EXISTS `prescription_imaging_studies`;
DROP TABLE IF EXISTS `prescription_lab_tests`;
DROP TABLE IF EXISTS `prescription_items`;
DROP TABLE IF EXISTS `visit_medicines`;
DROP TABLE IF EXISTS `patient_files`;
DROP TABLE IF EXISTS `visits`;
DROP TABLE IF EXISTS `prescription`;
DROP TABLE IF EXISTS `patients`;
DROP TABLE IF EXISTS `imaging_studies`;
DROP TABLE IF EXISTS `lab_tests`;
DROP TABLE IF EXISTS `medicine`;
DROP TABLE IF EXISTS `status`;
DROP TABLE IF EXISTS `type`;
DROP TABLE IF EXISTS `dosage_history`;
DROP TABLE IF EXISTS `duration_history`;
DROP TABLE IF EXISTS `diagnosis_history`;
DROP TABLE IF EXISTS `notes_history`;
DROP TABLE IF EXISTS `instruction_history`;
DROP TABLE IF EXISTS `doctor_profile`;



-- جدول الحالات
CREATE TABLE `status` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `name_ar` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول الأنواع
CREATE TABLE `type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول الأدوية
CREATE TABLE `medicine` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `name_ar` varchar(50) DEFAULT NULL,
  `dosage` VARCHAR(100) NULL,
  `form` VARCHAR(100) NULL,
  `manufacturer` VARCHAR(100) NULL,
  `price` DECIMAL(10,2) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول الفحوصات المعملية
CREATE TABLE `lab_tests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `name_ar` varchar(100) DEFAULT NULL,
  `description` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول الأشعة
CREATE TABLE `imaging_studies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `name_ar` varchar(100) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول المرضى
CREATE TABLE `patients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `age` int DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT 'other',
  `phone` varchar(20) DEFAULT NULL,
  `address` text,
  `medical_history` text,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL;,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. إنشاء الجداول التي تحتاج Foreign Keys

-- جدول الوصفات الطبية (بدون Foreign Keys أولاً)
CREATE TABLE `prescription` (
  `id` int NOT NULL AUTO_INCREMENT,
  `prescription_date` date DEFAULT NULL,
  `diagnosis` text,
  `notes` text,
  `lab_tests` varchar(100) DEFAULT NULL,
  `visit_id` int DEFAULT NULL,
  `patient_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_prescription_visit_id` (`visit_id`),
  KEY `idx_prescription_patient_id` (`patient_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول الزيارات (بدون Foreign Keys أولاً)
CREATE TABLE `visits` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `visit_date` date NOT NULL,
  `type_id` int NOT NULL,
  `status_id` int NOT NULL,
  `chief_complaint` text,
  `diagnosis` text,
  `notes` text,
  `prescription_id` int DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `type_id` (`type_id`),
  KEY `status_id` (`status_id`),
  KEY `fk_prescription` (`prescription_id`),
  KEY `idx_visits_patient_id` (`patient_id`),
  KEY `idx_visits_date` (`visit_date`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. الجداول التابعة

-- جدول عناصر الوصفة الطبية
CREATE TABLE `prescription_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `prescription_id` INT NOT NULL,
    `medicine_id` INT NOT NULL,
    `dosage` VARCHAR(255),
    `frequency` VARCHAR(255),
    `duration` VARCHAR(255),
    `instructions` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY `prescription_id` (`prescription_id`),
    KEY `medicine_id` (`medicine_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول الفحوصات المعملية للوصفة
CREATE TABLE `prescription_lab_tests` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `prescription_id` INT NOT NULL,
    `lab_test_id` INT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY `prescription_id` (`prescription_id`),
    KEY `lab_test_id` (`lab_test_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول الأشعة للوصفة
CREATE TABLE `prescription_imaging_studies` (
  `prescription_id` int NOT NULL,
  `imaging_studies_id` int NOT NULL,
  `comments` text,
  PRIMARY KEY (`prescription_id`,`imaging_studies_id`),
  KEY `imaging_studies_id` (`imaging_studies_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول أدوية الزيارة
CREATE TABLE `visit_medicines` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dosage` text,
  `diagnosis` text,
  `duration` text,
  `instructions` varchar(100) DEFAULT NULL,
  `prescription_id` int DEFAULT NULL,
  `medicine_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `prescription_id` (`prescription_id`),
  KEY `medicine_id` (`medicine_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول ملف الطبيب
CREATE TABLE `doctor_profile` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `title` VARCHAR(100),
    `qualification` VARCHAR(255),
    `specialization` VARCHAR(255),
    `clinic_name` VARCHAR(255),
    `clinic_address` TEXT,
    `phone` VARCHAR(50),
    `email` VARCHAR(255),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول ملفات المرضى
CREATE TABLE `patient_files` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `patient_id` INT NOT NULL,
    `visit_id` INT NULL,
    `file_name` VARCHAR(255) NOT NULL,
    `file_type` VARCHAR(100),
    `file_size` INT,
    `file_path` VARCHAR(500) NOT NULL,
    `description` TEXT,
    `uploaded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY `idx_patient_files_patient_id` (`patient_id`),
    KEY `idx_patient_files_visit_id` (`visit_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جداول التاريخ (متوافقة مع جميع إصدارات MySQL)
CREATE TABLE `dosage_history` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `text` TEXT NOT NULL,
    `usage_count` INT DEFAULT 1,
    `last_used` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY `idx_dosage_usage` (`usage_count` DESC, `last_used` DESC),
    KEY `idx_dosage_text` (`text`(100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `duration_history` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `text` VARCHAR(191) NOT NULL,
    `usage_count` INT DEFAULT 1,
    `last_used` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `unique_duration_text` (`text`),
    KEY `idx_duration_usage` (`usage_count` DESC, `last_used` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `diagnosis_history` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `text` VARCHAR(191) NOT NULL,
    `usage_count` INT DEFAULT 1,
    `last_used` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `unique_diagnosis_text` (`text`),
    KEY `idx_diagnosis_usage` (`usage_count` DESC, `last_used` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `notes_history` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `text` VARCHAR(191) NOT NULL,
    `usage_count` INT DEFAULT 1,
    `last_used` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `unique_notes_text` (`text`),
    KEY `idx_notes_usage` (`usage_count` DESC, `last_used` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `instruction_history` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `text` TEXT NOT NULL,
    `usage_count` INT DEFAULT 1,
    `last_used` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY `idx_instruction_usage` (`usage_count` DESC, `last_used` DESC),
    KEY `idx_instruction_text` (`text`(100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. إدراج البيانات الأولية
INSERT INTO `status` VALUES (1,'waiting',NULL),(2,'completed',NULL),(3,'cancelled',NULL);

INSERT INTO `type` VALUES (10,'follow up'),(9,'primary');

INSERT INTO `medicine` VALUES 
(1,'Amoxicilin',NULL,NULL,NULL,NULL,NULL,NOW(),NOW()),
(2,'Cetrizine',NULL,NULL,NULL,NULL,NULL,NOW(),NOW()),
(3,'Ibuprofen',NULL,NULL,NULL,NULL,NULL,NOW(),NOW()),
(4,'Omeprazole',NULL,NULL,NULL,NULL,NULL,NOW(),NOW()),
(5,'Panadol',NULL,NULL,NULL,NULL,NULL,NOW(),NOW()),
(6,'Paracetamol',NULL,NULL,NULL,NULL,NULL,NOW(),NOW());

INSERT INTO `lab_tests` VALUES 
(1,'Blood Sugar',NULL,NULL,NOW()),
(2,'Complete Blood Count (CBC)',NULL,NULL,NOW()),
(3,'ECG',NULL,NULL,NOW()),
(4,'Kidney Function Test',NULL,NULL,NOW()),
(5,'Lipid Profile',NULL,NULL,NOW()),
(6,'Liver Function Test',NULL,NULL,NOW()),
(7,'Thyroid Function Test',NULL,NULL,NOW()),
(8,'Urine Analysis',NULL,NULL,NOW()),
(9,'X-Ray Chest',NULL,NULL,NOW());

INSERT INTO `imaging_studies` VALUES 
(1,'CT Scan Abdomen',NULL,NOW()),
(2,'CT Scan Head',NULL,NOW()),
(3,'Echocardiogram',NULL,NOW()),
(4,'Mammography',NULL,NOW()),
(5,'MRI Brain',NULL,NOW()),
(6,'Ultrasound Abdomen',NULL,NOW()),
(7,'X-Ray Chest',NULL,NOW()),
(8,'X-Ray Spine',NULL,NOW());

INSERT INTO `patients` VALUES 
(34,'mona',19,'2005-10-06','female','4445',NULL,NULL,'2025-06-11 11:54:01'),
(35,'sara',29,'1995-10-12','female',NULL,NULL,NULL,'2025-06-11 12:08:18');

INSERT INTO `visits` VALUES 
(1,34,'2025-06-13',10,2,'','','',NULL,NOW()),
(2,34,'2025-06-13',10,2,'s','s','s',NULL,NOW()),
(3,34,'2025-06-13',10,2,'h','d','d',NULL,NOW()),
(4,34,'2025-06-13',10,2,'f','f','f',NULL,NOW());

-- 5. إضافة Foreign Key Constraints بعد إدراج البيانات

-- Foreign Keys للوصفات الطبية
ALTER TABLE `prescription` 
ADD CONSTRAINT `fk_prescription_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
ADD CONSTRAINT `fk_prescription_visit` FOREIGN KEY (`visit_id`) REFERENCES `visits` (`id`) ON DELETE CASCADE;

-- Foreign Keys للزيارات
ALTER TABLE `visits` 
ADD CONSTRAINT `fk_visits_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
ADD CONSTRAINT `fk_visits_type` FOREIGN KEY (`type_id`) REFERENCES `type` (`id`) ON DELETE RESTRICT,
ADD CONSTRAINT `fk_visits_status` FOREIGN KEY (`status_id`) REFERENCES `status` (`id`) ON DELETE RESTRICT,
ADD CONSTRAINT `fk_visits_prescription` FOREIGN KEY (`prescription_id`) REFERENCES `prescription` (`id`) ON DELETE SET NULL;

-- Foreign Keys لعناصر الوصفة
ALTER TABLE `prescription_items` 
ADD CONSTRAINT `fk_prescription_items_prescription` FOREIGN KEY (`prescription_id`) REFERENCES `prescription` (`id`) ON DELETE CASCADE,
ADD CONSTRAINT `fk_prescription_items_medicine` FOREIGN KEY (`medicine_id`) REFERENCES `medicine` (`id`) ON DELETE CASCADE;

-- Foreign Keys للفحوصات المعملية
ALTER TABLE `prescription_lab_tests` 
ADD CONSTRAINT `fk_prescription_lab_tests_prescription` FOREIGN KEY (`prescription_id`) REFERENCES `prescription` (`id`) ON DELETE CASCADE,
ADD CONSTRAINT `fk_prescription_lab_tests_lab_test` FOREIGN KEY (`lab_test_id`) REFERENCES `lab_tests` (`id`) ON DELETE CASCADE;

-- Foreign Keys للأشعة
ALTER TABLE `prescription_imaging_studies` 
ADD CONSTRAINT `fk_prescription_imaging_prescription` FOREIGN KEY (`prescription_id`) REFERENCES `prescription` (`id`) ON DELETE CASCADE,
ADD CONSTRAINT `fk_prescription_imaging_studies` FOREIGN KEY (`imaging_studies_id`) REFERENCES `imaging_studies` (`id`) ON DELETE CASCADE;

-- Foreign Keys لأدوية الزيارة
ALTER TABLE `visit_medicines` 
ADD CONSTRAINT `fk_visit_medicines_prescription` FOREIGN KEY (`prescription_id`) REFERENCES `prescription` (`id`) ON DELETE CASCADE,
ADD CONSTRAINT `fk_visit_medicines_medicine` FOREIGN KEY (`medicine_id`) REFERENCES `medicine` (`id`) ON DELETE CASCADE;

-- Foreign Keys لملفات المرضى
ALTER TABLE `patient_files` 
ADD CONSTRAINT `fk_patient_files_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
ADD CONSTRAINT `fk_patient_files_visit` FOREIGN KEY (`visit_id`) REFERENCES `visits` (`id`) ON DELETE CASCADE;

-- إعادة تفعيل فحص Foreign Key
SET FOREIGN_KEY_CHECKS = 1;