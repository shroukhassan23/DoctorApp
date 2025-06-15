--
-- Table structure for table `imaging_studies`
--

DROP TABLE IF EXISTS `imaging_studies`;
CREATE TABLE `imaging_studies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `name_ar` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 ;


LOCK TABLES `imaging_studies` WRITE;
INSERT INTO `imaging_studies` VALUES (1,'CT Scan Abdomen',NULL),(2,'CT Scan Head',NULL),(3,'Echocardiogram',NULL),(4,'Mammography\n',NULL),(5,'MRI Brain',NULL),(6,'Ultrasound Abdomen',NULL),(7,'\nX-Ray Chest',NULL),(8,'\nX-Ray Spine',NULL);
UNLOCK TABLES;

--
-- Table structure for table `lab_tests`
--

DROP TABLE IF EXISTS `lab_tests`;
CREATE TABLE `lab_tests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `name_ar` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 ;

--
-- Dumping data for table `lab_tests`
--

LOCK TABLES `lab_tests` WRITE;
INSERT INTO `lab_tests` VALUES (1,'Blood Sugar',NULL),(2,'Complete Blood Count (CBC)',NULL),(3,'ECG',NULL),(4,'Kidney Function Test',NULL),(5,'Lipid Profile',NULL),(6,'Liver Function Test',NULL),(7,'Thyroid Function Test',NULL),(8,'Urine Analysis',NULL),(9,'X-Ray Chest',NULL);
UNLOCK TABLES;

--
-- Table structure for table `medicine`
--

DROP TABLE IF EXISTS `medicine`;
CREATE TABLE `medicine` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `name_ar` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 ;

--
-- Dumping data for table `medicine`
--

LOCK TABLES `medicine` WRITE;
INSERT INTO `medicine` VALUES (1,'Amoxicilin',NULL),(2,'Cetrizine',NULL),(3,'Ibuprofen',NULL),(4,'Omeprazole',NULL),(5,'Panadol',NULL),(6,'Paracetamol',NULL);
UNLOCK TABLES;

--
-- Table structure for table `patients`
--

DROP TABLE IF EXISTS `patients`;
CREATE TABLE `patients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `age` int DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT 'other',
  `phone` varchar(20) DEFAULT NULL,
  `address` text,
  `medical_history` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 ;

--
-- Dumping data for table `patients`
--

LOCK TABLES `patients` WRITE;
INSERT INTO `patients` VALUES (34,'mona',19,'2005-10-06','female','4445',NULL,NULL,'2025-06-11 11:54:01'),(35,'sara',29,'1995-10-12','female',NULL,NULL,NULL,'2025-06-11 12:08:18');
UNLOCK TABLES;

DROP TABLE IF EXISTS `prescription_imaging_studies`;
CREATE TABLE `prescription_imaging_studies` (
  `prescription_id` int NOT NULL,
  `imaging_studies_id` int NOT NULL,
  `comments` text,
  PRIMARY KEY (`prescription_id`,`imaging_studies_id`),
  KEY `imaging_studies_id` (`imaging_studies_id`),
  CONSTRAINT `prescription_imaging_studies_ibfk_1` FOREIGN KEY (`prescription_id`) REFERENCES `prescription` (`id`) ON DELETE CASCADE,
  CONSTRAINT `prescription_imaging_studies_ibfk_2` FOREIGN KEY (`imaging_studies_id`) REFERENCES `imaging_studies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB ;

--
-- Dumping data for table `prescription_imaging_studies`
--

LOCK TABLES `prescription_imaging_studies` WRITE;
UNLOCK TABLES;

--
-- Table structure for table `prescription`
--

DROP TABLE IF EXISTS `prescription`;
CREATE TABLE `prescription` (
  `id` int NOT NULL AUTO_INCREMENT,
  `prescription_date` date DEFAULT NULL,
  `diagnosis` text,
  `notes` text,
  `lab_tests` varchar(100) DEFAULT NULL,
  `visit_id` int DEFAULT NULL,
  `patient_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_visitid` (`visit_id`),
  KEY `fk_patientid` (`patient_id`),
  CONSTRAINT `fk_patientid` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`),
  CONSTRAINT `fk_visitid` FOREIGN KEY (`visit_id`) REFERENCES `visits` (`id`)
) ENGINE=InnoDB ;

--
-- Dumping data for table `prescription`
--

LOCK TABLES `prescription` WRITE;
UNLOCK TABLES;

--
-- Table structure for table `status`
--

DROP TABLE IF EXISTS `status`;
CREATE TABLE `status` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `name_ar` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 ;

--
-- Dumping data for table `status`
--

LOCK TABLES `status` WRITE;
INSERT INTO `status` VALUES (1,'waiting',NULL),(2,'completed',NULL),(3,'cancelled',NULL);
UNLOCK TABLES;

--
-- Table structure for table `type`
--

DROP TABLE IF EXISTS `type`;
CREATE TABLE `type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=11 ;

--
-- Dumping data for table `type`
--

LOCK TABLES `type` WRITE;
INSERT INTO `type` VALUES (10,'follow up'),(9,'primary');
UNLOCK TABLES;

--
-- Table structure for table `visit_medicines`
--

DROP TABLE IF EXISTS `visit_medicines`;
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
  KEY `medicine_id` (`medicine_id`),
  CONSTRAINT `visit_medicines_ibfk_1` FOREIGN KEY (`prescription_id`) REFERENCES `prescription` (`id`),
  CONSTRAINT `visit_medicines_ibfk_2` FOREIGN KEY (`medicine_id`) REFERENCES `medicine` (`id`)
) ENGINE=InnoDB ;

--
-- Dumping data for table `visit_medicines`
--

LOCK TABLES `visit_medicines` WRITE;
UNLOCK TABLES;

--
-- Table structure for table `visits`
--

DROP TABLE IF EXISTS `visits`;
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
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `type_id` (`type_id`),
  KEY `status_id` (`status_id`),
  KEY `fk_prescription` (`prescription_id`),
  CONSTRAINT `fk_prescription` FOREIGN KEY (`prescription_id`) REFERENCES `prescription` (`id`),
  CONSTRAINT `visits_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`),
  CONSTRAINT `visits_ibfk_2` FOREIGN KEY (`type_id`) REFERENCES `type` (`id`),
  CONSTRAINT `visits_ibfk_3` FOREIGN KEY (`status_id`) REFERENCES `status` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 ;

--
-- Dumping data for table `visits`
--

LOCK TABLES `visits` WRITE;
INSERT INTO `visits` VALUES (1,34,'2025-06-13',10,2,'','','',NULL),(2,34,'2025-06-13',10,2,'s','s','s',NULL),(3,34,'2025-06-13',10,2,'h','d','d',NULL),(4,34,'2025-06-13',10,2,'f','f','f',NULL);
UNLOCK TABLES;


-- Dump completed on 2025-06-13 15:20:28


CREATE TABLE prescription_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prescription_id INT NOT NULL,
    medicine_id INT NOT NULL,
    dosage VARCHAR(255),
    frequency VARCHAR(255),
    duration VARCHAR(255),
    instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (prescription_id) REFERENCES prescription(id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES medicine(id) ON DELETE CASCADE
);

-- Create the missing prescription_lab_tests table
CREATE TABLE prescription_lab_tests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prescription_id INT NOT NULL,
    lab_test_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prescription_id) REFERENCES prescription(id) ON DELETE CASCADE,
    FOREIGN KEY (lab_test_id) REFERENCES lab_tests(id) ON DELETE CASCADE
);



CREATE TABLE IF NOT EXISTS doctor_profile (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(100),
    qualification VARCHAR(255),
    specialization VARCHAR(255),
    clinic_name VARCHAR(255),
    clinic_address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create patient_files table
CREATE TABLE IF NOT EXISTS patient_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    visit_id INT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_size INT,
    file_path VARCHAR(500) NOT NULL,
    description TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (visit_id) REFERENCES visits(id) ON DELETE CASCADE
);

-- Add created_at column to visits table if it doesn't exist
ALTER TABLE visits ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add any missing indexes for better performance
CREATE INDEX idx_patient_files_patient_id ON patient_files(patient_id);
CREATE INDEX idx_patient_files_visit_id ON patient_files(visit_id);
CREATE INDEX idx_visits_patient_id ON visits(patient_id);
CREATE INDEX idx_visits_date ON visits(visit_date);
CREATE INDEX idx_prescription_visit_id ON prescription(visit_id);
CREATE INDEX idx_prescription_patient_id ON prescription(patient_id);

ALTER TABLE lab_tests ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;


ALTER TABLE imaging_studies ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;




CREATE TABLE IF NOT EXISTS dosage_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    text VARCHAR(255) NOT NULL UNIQUE,
    usage_count INT DEFAULT 1,
    last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS duration_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    text VARCHAR(255) NOT NULL UNIQUE,
    usage_count INT DEFAULT 1,
    last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS diagnosis_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    text VARCHAR(255) NOT NULL,
    usage_count INT DEFAULT 1,
    last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_diagnosis (text)
);

CREATE TABLE IF NOT EXISTS notes_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    text VARCHAR(255) NOT NULL,
    usage_count INT DEFAULT 1,
    last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_notes (text)
);

CREATE TABLE IF NOT EXISTS instruction_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    text Text NOT NULL,
    usage_count INT DEFAULT 1,
    last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX idx_dosage_usage ON dosage_history(usage_count DESC, last_used DESC);
CREATE INDEX idx_duration_usage ON duration_history(usage_count DESC, last_used DESC);
CREATE INDEX idx_diagnosis_usage ON diagnosis_history(usage_count DESC, last_used DESC);
CREATE INDEX idx_notes_usage ON notes_history(usage_count DESC, last_used DESC);
CREATE INDEX idx_instruction_usage ON instruction_history(usage_count DESC, last_used DESC);




ALTER TABLE medicine 
ADD COLUMN dosage VARCHAR(100) NULL AFTER name_ar,
ADD COLUMN form VARCHAR(100) NULL AFTER dosage,
ADD COLUMN manufacturer VARCHAR(100) NULL AFTER form,
ADD COLUMN price DECIMAL(10,2) NULL AFTER manufacturer,
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER price,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

