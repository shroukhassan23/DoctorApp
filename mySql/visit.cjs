const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./hospitalSystem.cjs');
const app = express();
app.use(express.json());

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:4173','http://localhost:8081'], // Add your frontend URLs
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Disposition', 'Content-Type', 'Content-Length']
}));


// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const { patientId } = req.params;
    const uploadPath = path.join(__dirname, 'uploads', 'patients', patientId);
    
    // Create directory if it doesn't exist
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = file.fieldname + '-' + uniqueSuffix + extension;
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit (increased from 10MB)
    fieldSize: 10 * 1024 * 1024, // 10MB for field data
    files: 10, // Maximum 10 files
  },
  fileFilter: function (req, file, cb) {
    // Check file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|xls|xlsx|ppt|pptx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || 
                     file.mimetype.includes('application/pdf') ||
                     file.mimetype.includes('application/msword') ||
                     file.mimetype.includes('application/vnd.openxmlformats') ||
                     file.mimetype.includes('application/vnd.ms-excel') ||
                     file.mimetype.includes('application/vnd.ms-powerpoint');
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, and documents (DOC, DOCX, XLS, XLSX, PPT, PPTX) are allowed!'));
    }
  }
});

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'File size should be less than 50MB',
        code: 'FILE_TOO_LARGE'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files',
        message: 'Maximum 10 files allowed',
        code: 'TOO_MANY_FILES'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: 'Unexpected file field',
        message: 'Unexpected file field',
        code: 'UNEXPECTED_FILE'
      });
    }
  }
  
  // Handle other file filter errors
  if (error.message && error.message.includes('Only images, PDFs, and documents')) {
    return res.status(400).json({
      error: 'Invalid file type',
      message: error.message,
      code: 'INVALID_FILE_TYPE'
    });
  }
  
  // Handle other errors
  res.status(500).json({
    error: 'Internal server error',
    message: error.message || 'Something went wrong'
  });
});


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/Visittypes', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM type');
    res.send(rows);
  } catch (err) {
    res.status(500).send(err);
}
});

app.get('/Visitstatus', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM status');
    res.send(rows);
  } catch (err) {
    res.status(500).send(err);
}
});
app.get('/Visit/medicine', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM medicine');
    res.send(rows);
  } catch (err) {
    res.status(500).send(err);
}
});
app.get('/Visit/labtests', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM lab_tests');
    res.send(rows);
  } catch (err) {
    res.status(500).send(err);
}
});
app.get('/Visit/imagingstudies', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM imaging_studies');
    res.send(rows);
  } catch (err) {
    res.status(500).send(err);
}
});

app.post('/Visit/add', async (req, res) => {
  const {
    patient_id,
    visit_date,
    type_id,
    chief_complaint,
    diagnosis,
    notes,
    status_id
  } = req.body;
console.log(patient_id);

  try {
    const [result] = await db.query(
      `INSERT INTO visits 
       (patient_id, visit_date, type_id, chief_complaint, diagnosis, notes, status_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [patient_id, visit_date, type_id, chief_complaint, diagnosis, notes, status_id]
    );

    res.status(201).json({ message: 'Visit added successfully', visitId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post('/prescription/add', async (req, res) => {
  const {
    patient_id,
    visit_id,
    diagnosis,
    notes,
    prescription_date,
  } = req.body;

  try {
    const [result] = await db.query(
      `INSERT INTO prescription 
       (patient_id, visit_id, diagnosis, notes, prescription_date)
       VALUES (?, ?, ?, ?, ?)`,
      [patient_id, visit_id, diagnosis, notes, prescription_date]
    );

    res.status(201).json({ message: 'Prescription added successfully', prescriptionId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post('/prescription/medicines/add', async (req, res) => {
  const { medicines } = req.body; // Array of medicine objects
  
  try {
    if (!medicines || medicines.length === 0) {
      return res.status(400).json({ error: 'No medicines provided' });
    }

    const values = medicines.map(med => [
      med.prescription_id,
      med.medicine_id,
      med.dosage || '',
      med.frequency || '',
      med.duration || '',
      med.instructions || ''
    ]);

    const [result] = await db.query(
      `INSERT INTO prescription_items 
       (prescription_id, medicine_id, dosage, frequency, duration, instructions)
       VALUES ?`,
      [values]
    );

    res.status(201).json({ 
      message: 'Prescription medicines added successfully', 
      insertedCount: result.affectedRows 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add prescription lab tests
app.post('/prescription/labtests/add', async (req, res) => {
  const { labTests } = req.body; // Array of lab test objects
  
  try {
    if (!labTests || labTests.length === 0) {
      return res.status(400).json({ error: 'No lab tests provided' });
    }

    const values = labTests.map(test => [
      test.prescription_id,
      test.lab_test_id
    ]);

    const [result] = await db.query(
      `INSERT INTO prescription_lab_tests 
       (prescription_id, lab_test_id)
       VALUES ?`,
      [values]
    );

    res.status(201).json({ 
      message: 'Prescription lab tests added successfully', 
      insertedCount: result.affectedRows 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add prescription imaging studies
app.post('/prescription/imagingstudies/add', async (req, res) => {
  const { imagingStudies } = req.body; // Array of imaging study objects
  
  try {
    if (!imagingStudies || imagingStudies.length === 0) {
      return res.status(400).json({ error: 'No imaging studies provided' });
    }

    console.log('Received imaging studies data:', imagingStudies);

    const values = imagingStudies.map(study => [
      study.prescription_id,
      study.imaging_studies_id, // Now matches the database column name
      study.comments || null // Changed from 'notes' to 'comments'
    ]);

    console.log('Mapped values for database:', values);

    // Use the correct column names from your database schema
    const [result] = await db.query(
      `INSERT INTO prescription_imaging_studies 
       (prescription_id, imaging_studies_id, comments)
       VALUES ?`,
      [values]
    );

    res.status(201).json({ 
      message: 'Prescription imaging studies added successfully', 
      insertedCount: result.affectedRows 
    });
  } catch (err) {
    console.error('Error adding imaging studies:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get patient visits
app.get('/patients/:patientId/visits', async (req, res) => {
  const { patientId } = req.params;
  
  try {
    const [rows] = await db.query(
      `SELECT v.*, t.name as type_name, s.name as status_name 
       FROM visits v
       LEFT JOIN type t ON v.type_id = t.id
       LEFT JOIN status s ON v.status_id = s.id
       WHERE v.patient_id = ?
       ORDER BY v.visit_date DESC, v.created_at DESC`,
      [patientId]
    );
    
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get patient files
app.post('/patients/:patientId/files', upload.single('file'), async (req, res) => {
  const { patientId } = req.params;
  const { description, visitId } = req.body;
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const filePath = path.join('patients', patientId, req.file.filename);
    
    const [result] = await db.query(
      `INSERT INTO patient_files 
       (patient_id, visit_id, file_name, file_type, file_size, file_path, description, uploaded_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        patientId, 
        visitId || null, 
        req.file.originalname, 
        req.file.mimetype, 
        req.file.size, 
        filePath, 
        description || ''
      ]
    );
    
    res.status(201).json({ 
      message: 'File uploaded successfully', 
      fileId: result.insertId,
      file: {
        id: result.insertId,
        filename: req.file.originalname,
        path: filePath,
        size: req.file.size,
        type: req.file.mimetype
      }
    });
  } catch (err) {
    // If database insert fails, delete the uploaded file
    if (req.file) {
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting file:', unlinkErr);
      });
    }
    res.status(500).json({ error: err.message });
  }
});

// Upload patient file
app.post('/patients/:patientId/files', async (req, res) => {
  const { patientId } = req.params;
  const { fileName, fileType, fileSize, filePath, description, visitId } = req.body;
  
  try {
    const [result] = await db.query(
      `INSERT INTO patient_files 
       (patient_id, visit_id, file_name, file_type, file_size, file_path, description, uploaded_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [patientId, visitId || null, fileName, fileType, fileSize, filePath, description || '']
    );
    
    res.status(201).json({ 
      message: 'File record created successfully', 
      fileId: result.insertId 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Get patient files
app.get('/patients/:patientId/files', async (req, res) => {
  const { patientId } = req.params;
  
  try {
    const [rows] = await db.query(
      `SELECT * FROM patient_files 
       WHERE patient_id = ? AND visit_id IS NULL
       ORDER BY uploaded_at DESC`,
      [patientId]
    );
    
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get('/patients/:patientId/files/:fileId/download', async (req, res) => {
  const { patientId, fileId } = req.params;
  
  try {
    const [rows] = await db.query(
      'SELECT * FROM patient_files WHERE id = ? AND patient_id = ?',
      [fileId, patientId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const fileRecord = rows[0];
    const filePath = path.join(__dirname, 'uploads', fileRecord.file_path);
    
    // Check if file exists on disk
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on disk' });
    }
    
    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${fileRecord.file_name}"`);
    res.setHeader('Content-Type', fileRecord.file_type);
    
    // Send file
    res.sendFile(filePath);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.delete('/patients/:patientId/files/:fileId', async (req, res) => {
  const { patientId, fileId } = req.params;
  
  try {
    const [rows] = await db.query(
      'SELECT * FROM patient_files WHERE id = ? AND patient_id = ?',
      [fileId, patientId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const fileRecord = rows[0];
    const filePath = path.join(__dirname, 'uploads', fileRecord.file_path);
    
    // Delete from database
    await db.query('DELETE FROM patient_files WHERE id = ?', [fileId]);
    
    // Delete file from disk
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    res.json({ message: 'File deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get doctor profile
app.get('/doctor-profile', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM doctor_profile LIMIT 1');
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No doctor profile found' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create doctor profile
app.post('/doctor-profile', async (req, res) => {
  const {
    name,
    title,
    qualification,
    specialization,
    clinic_name,
    clinic_address,
    phone,
    email
  } = req.body;
  
  try {
    // Check if profile already exists
    const [existing] = await db.query('SELECT id FROM doctor_profile LIMIT 1');
    
    if (existing.length > 0) {
      // Update existing profile
      const [result] = await db.query(
        `UPDATE doctor_profile SET 
         name = ?, title = ?, qualification = ?, specialization = ?,
         clinic_name = ?, clinic_address = ?, phone = ?, email = ?,
         updated_at = NOW()
         WHERE id = ?`,
        [name, title, qualification, specialization, clinic_name, clinic_address, phone, email, existing[0].id]
      );
      
      res.json({ message: 'Doctor profile updated successfully' });
    } else {
      // Create new profile
      const [result] = await db.query(
        `INSERT INTO doctor_profile 
         (name, title, qualification, specialization, clinic_name, clinic_address, phone, email, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [name, title, qualification, specialization, clinic_name, clinic_address, phone, email]
      );
      
      res.status(201).json({ 
        message: 'Doctor profile created successfully', 
        profileId: result.insertId 
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update doctor profile
app.put('/doctor-profile/:id', async (req, res) => {
  const { id } = req.params;
  const {
    name,
    title,
    qualification,
    specialization,
    clinic_name,
    clinic_address,
    phone,
    email
  } = req.body;
  
  try {
    const [result] = await db.query(
      `UPDATE doctor_profile SET 
       name = ?, title = ?, qualification = ?, specialization = ?,
       clinic_name = ?, clinic_address = ?, phone = ?, email = ?,
       updated_at = NOW()
       WHERE id = ?`,
      [name, title, qualification, specialization, clinic_name, clinic_address, phone, email, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }
    
    res.json({ message: 'Doctor profile updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get patient by ID (for prescription printing)
app.get('/patients/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const [rows] = await db.query('SELECT * FROM patients WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get prescription with all details
app.get('/prescriptions/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // Get main prescription
    const [prescription] = await db.query('SELECT * FROM prescription WHERE id = ?', [id]);
    
    if (prescription.length === 0) {
      return res.status(404).json({ error: 'Prescription not found' });
    }
    
    const prescriptionData = prescription[0];
    
    // Get prescription items (medicines)
    const [items] = await db.query(
      `SELECT pi.*, m.name as medicine_name
       FROM prescription_items pi
       LEFT JOIN medicine m ON pi.medicine_id = m.id
       WHERE pi.prescription_id = ?`,
      [id]
    );
    
    // Get lab tests
    const [labTests] = await db.query(
      `SELECT plt.*, lt.name as test_name
       FROM prescription_lab_tests plt
       LEFT JOIN lab_tests lt ON plt.lab_test_id = lt.id
       WHERE plt.prescription_id = ?`,
      [id]
    );
    
    // Get imaging studies
    const [imagingStudies] = await db.query(
      `SELECT pis.*, ist.name as study_name
       FROM prescription_imaging_studies pis
       LEFT JOIN imaging_studies ist ON pis.imaging_study_id = ist.id
       WHERE pis.prescription_id = ?`,
      [id]
    );
    
    // Format the response to match Supabase structure
    prescriptionData.prescription_items = items.map(item => ({
      ...item,
      medicines: { name: item.medicine_name }
    }));
    
    prescriptionData.prescription_lab_tests = labTests.map(test => ({
      ...test,
      lab_tests: { name: test.test_name }
    }));
    
    prescriptionData.prescription_imaging_studies = imagingStudies.map(study => ({
      ...study,
      imaging_studies: { name: study.study_name }
    }));
    
    res.json(prescriptionData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get visit prescription
app.get('/visits/:visitId/prescription', async (req, res) => {
  const { visitId } = req.params;
  
  try {
    console.log('Fetching prescription for visit ID:', visitId);
    
    const [prescriptions] = await db.query(
      'SELECT * FROM prescription WHERE visit_id = ? LIMIT 1',
      [visitId]
    );
    
    if (prescriptions.length === 0) {
      console.log('No prescription found for visit ID:', visitId);
      return res.status(404).json({ error: 'No prescription found for this visit' });
    }
    
    // Use the existing prescription endpoint logic
    const prescriptionId = prescriptions[0].id;
    console.log('Found prescription ID:', prescriptionId);
    
    const [prescription] = await db.query('SELECT * FROM prescription WHERE id = ?', [prescriptionId]);
    const prescriptionData = prescription[0];
    
    // Get prescription items, lab tests, and imaging studies
    const [items] = await db.query(
      `SELECT pi.*, m.name as medicine_name
       FROM prescription_items pi
       LEFT JOIN medicine m ON pi.medicine_id = m.id
       WHERE pi.prescription_id = ?`,
      [prescriptionId]
    );
    
    const [labTests] = await db.query(
      `SELECT plt.*, lt.name as test_name
       FROM prescription_lab_tests plt
       LEFT JOIN lab_tests lt ON plt.lab_test_id = lt.id
       WHERE plt.prescription_id = ?`,
      [prescriptionId]
    );
    
    // Fixed the column name from imaging_study_id to imaging_studies_id
    const [imagingStudies] = await db.query(
      `SELECT pis.*, ist.name as study_name, pis.comments as notes
       FROM prescription_imaging_studies pis
       LEFT JOIN imaging_studies ist ON pis.imaging_studies_id = ist.id
       WHERE pis.prescription_id = ?`,
      [prescriptionId]
    );
    
    // Format the response to match expected structure
    prescriptionData.prescription_items = items.map(item => ({
      ...item,
      medicines: { name: item.medicine_name }
    }));
    
    prescriptionData.prescription_lab_tests = labTests.map(test => ({
      ...test,
      lab_tests: { name: test.test_name }
    }));
    
    prescriptionData.prescription_imaging_studies = imagingStudies.map(study => ({
      ...study,
      imaging_studies: { name: study.study_name },
      notes: study.notes // Map comments to notes for frontend compatibility
    }));
    
    console.log('Successfully retrieved prescription data');
    res.json(prescriptionData);
  } catch (err) {
    console.error('Error fetching visit prescription:', err);
    res.status(500).json({ error: err.message });
  }
});

// Lab Tests Management
app.get('/management/labtests', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM lab_tests ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/management/labtests', async (req, res) => {
  const { name, description } = req.body;
  
  try {
    const [result] = await db.query(
      'INSERT INTO lab_tests (name, description, created_at) VALUES (?, ?, NOW())',
      [name, description || null]
    );
    
    res.status(201).json({ 
      message: 'Lab test added successfully', 
      testId: result.insertId 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/management/labtests/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  
  try {
    const [result] = await db.query(
      'UPDATE lab_tests SET name = ?, description = ? WHERE id = ?',
      [name, description || null, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Lab test not found' });
    }
    
    res.json({ message: 'Lab test updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/management/labtests/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const [result] = await db.query('DELETE FROM lab_tests WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Lab test not found' });
    }
    
    res.json({ message: 'Lab test deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Imaging Studies Management
app.get('/management/imagingstudies', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM imaging_studies ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/management/imagingstudies', async (req, res) => {
  const { name, description } = req.body;
  
  try {
    const [result] = await db.query(
      'INSERT INTO imaging_studies (name, description, created_at) VALUES (?, ?, NOW())',
      [name, description || null]
    );
    
    res.status(201).json({ 
      message: 'Imaging study added successfully', 
      studyId: result.insertId 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/management/imagingstudies/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  
  try {
    const [result] = await db.query(
      'UPDATE imaging_studies SET name = ?, description = ? WHERE id = ?',
      [name, description || null, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Imaging study not found' });
    }
    
    res.json({ message: 'Imaging study updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/management/imagingstudies/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const [result] = await db.query('DELETE FROM imaging_studies WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Imaging study not found' });
    }
    
    res.json({ message: 'Imaging study deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Medicines Management
app.get('/management/medicines', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM medicine ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/management/medicines', async (req, res) => {
  const { name, dosage, form, manufacturer, price } = req.body;
  
  try {
    const [result] = await db.query(
      'INSERT INTO medicine (name, dosage, form, manufacturer, price) VALUES (?, ?, ?, ?, ?)',
      [name, dosage || null, form || null, manufacturer || null, price || null]
    );
    
    res.status(201).json({ 
      message: 'Medicine added successfully', 
      medicineId: result.insertId 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/management/medicines/:id', async (req, res) => {
  const { id } = req.params;
  const { name, dosage, form, manufacturer, price } = req.body;
  
  try {
    const [result] = await db.query(
      'UPDATE medicine SET name = ?, dosage = ?, form = ?, manufacturer = ?, price = ? WHERE id = ?',
      [name, dosage || null, form || null, manufacturer || null, price || null, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Medicine not found' });
    }
    
    res.json({ message: 'Medicine updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/management/medicines/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const [result] = await db.query('DELETE FROM medicine WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Medicine not found' });
    }
    
    res.json({ message: 'Medicine deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Visit Management
app.delete('/visits/:id', async (req, res) => {
  const { id } = req.params;
  
  // Start a transaction to ensure all deletes succeed or fail together
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    console.log(`Starting deletion process for visit ID: ${id}`);
    
    // First, get all prescriptions for this visit
    const [prescriptions] = await connection.query(
      'SELECT id FROM prescription WHERE visit_id = ?',
      [id]
    );
    
    // Delete related prescription data for each prescription
    for (const prescription of prescriptions) {
      const prescriptionId = prescription.id;
      console.log(`Deleting prescription data for prescription ID: ${prescriptionId}`);
      
      // Delete prescription items (medicines)
      await connection.query(
        'DELETE FROM prescription_items WHERE prescription_id = ?',
        [prescriptionId]
      );
      
      // Delete prescription lab tests
      await connection.query(
        'DELETE FROM prescription_lab_tests WHERE prescription_id = ?',
        [prescriptionId]
      );
      
      // Delete prescription imaging studies
      await connection.query(
        'DELETE FROM prescription_imaging_studies WHERE prescription_id = ?',
        [prescriptionId]
      );
      
      console.log(`Deleted all related data for prescription ID: ${prescriptionId}`);
    }
    
    // Delete all prescriptions for this visit
    if (prescriptions.length > 0) {
      await connection.query(
        'DELETE FROM prescription WHERE visit_id = ?',
        [id]
      );
      console.log(`Deleted ${prescriptions.length} prescription(s) for visit ID: ${id}`);
    }
    
    // Delete any files related to this visit
    await connection.query(
      'DELETE FROM patient_files WHERE visit_id = ?',
      [id]
    );
    
    // Finally, delete the visit itself
    const [result] = await connection.query(
      'DELETE FROM visits WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Visit not found' });
    }
    
    // Commit the transaction
    await connection.commit();
    console.log(`Successfully deleted visit ID: ${id} and all related data`);
    
    res.json({ 
      message: 'Visit and all related data deleted successfully',
      deletedVisitId: id,
      deletedPrescriptions: prescriptions.length
    });
    
  } catch (err) {
    // Rollback the transaction on error
    await connection.rollback();
    console.error('Error deleting visit:', err);
    res.status(500).json({ error: err.message });
  } finally {
    // Release the connection
    connection.release();
  }
});

app.put('/visits/:id', async (req, res) => {
  const { id } = req.params;
  const { visit_date, type_id, chief_complaint, diagnosis, notes, status_id } = req.body;
  
  try {
    const [result] = await db.query(
      `UPDATE visits SET 
       visit_date = ?, type_id = ?, chief_complaint = ?, 
       diagnosis = ?, notes = ?, status_id = ?
       WHERE id = ?`,
      [visit_date, type_id, chief_complaint, diagnosis, notes, status_id, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Visit not found' });
    }
    
    res.json({ message: 'Visit updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/prescriptions/:id', async (req, res) => {
  const { id } = req.params;
  const { notes, diagnosis } = req.body;
  
  try {
    const [result] = await db.query(
      'UPDATE prescription SET notes = ?, diagnosis = ? WHERE id = ?',
      [notes, diagnosis, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Prescription not found' });
    }
    
    res.json({ message: 'Prescription updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/prescriptions/:id/items', async (req, res) => {
  const { id } = req.params;
  
  try {
    await db.query('DELETE FROM prescription_items WHERE prescription_id = ?', [id]);
    res.json({ message: 'Prescription items deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/prescriptions/:id/labtests', async (req, res) => {
  const { id } = req.params;
  
  try {
    await db.query('DELETE FROM prescription_lab_tests WHERE prescription_id = ?', [id]);
    res.json({ message: 'Prescription lab tests deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete prescription imaging studies
app.delete('/prescriptions/:id/imagingstudies', async (req, res) => {
  const { id } = req.params;
  
  try {
    await db.query('DELETE FROM prescription_imaging_studies WHERE prescription_id = ?', [id]);
    res.json({ message: 'Prescription imaging studies deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Add this new endpoint to your visit.cjs file for file preview

// File preview endpoint (serves file inline for preview)
app.get('/patients/:patientId/files/:fileId/preview', async (req, res) => {
  const { patientId, fileId } = req.params;
  
  try {
    const [rows] = await db.query(
      'SELECT * FROM patient_files WHERE id = ? AND patient_id = ?',
      [fileId, patientId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const fileRecord = rows[0];
    const filePath = path.join(__dirname, 'uploads', fileRecord.file_path);
    
    // Check if file exists on disk
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on disk' });
    }
    
    // Set headers for inline display (preview)
    res.setHeader('Content-Type', fileRecord.file_type);
    res.setHeader('Content-Length', fileRecord.file_size);
    
    // For PDFs, add specific headers to ensure proper display
    if (fileRecord.file_type === 'application/pdf') {
      res.setHeader('Content-Disposition', 'inline');
      res.setHeader('X-Content-Type-Options', 'nosniff');
    }
    
    // For images, set cache headers
    if (fileRecord.file_type.startsWith('image/')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
    
    // For text files, ensure UTF-8 encoding
    if (fileRecord.file_type.startsWith('text/')) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    }
    
    // Send file for preview
    res.sendFile(filePath);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update the existing download endpoint to force download
app.get('/patients/:patientId/files/:fileId/download', async (req, res) => {
  const { patientId, fileId } = req.params;
  
  try {
    const [rows] = await db.query(
      'SELECT * FROM patient_files WHERE id = ? AND patient_id = ?',
      [fileId, patientId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const fileRecord = rows[0];
    const filePath = path.join(__dirname, 'uploads', fileRecord.file_path);
    
    // Check if file exists on disk
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on disk' });
    }
    
    // Properly encode the filename for download
    const encodedFilename = encodeURIComponent(fileRecord.file_name);
    
    // Set headers to force download (attachment)
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFilename}`);
    res.setHeader('Content-Type', 'application/octet-stream'); // Force download
    res.setHeader('Content-Length', fileRecord.file_size);
    
    // Send file for download
    res.sendFile(filePath);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// Dosage history
app.get('/history/dosage', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT text, usage_count, last_used 
      FROM dosage_history 
      ORDER BY usage_count DESC, last_used DESC 
      LIMIT 20
    `);
    
    const dosages = rows.map(row => row.text);
    res.json(dosages);
  } catch (err) {
    console.error('Error fetching dosage history:', err);
    res.status(500).json({ error: err.message });
  }
});

// Duration history
app.get('/history/duration', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT text, usage_count, last_used 
      FROM duration_history 
      ORDER BY usage_count DESC, last_used DESC 
      LIMIT 20
    `);
    
    const durations = rows.map(row => row.text);
    res.json(durations);
  } catch (err) {
    console.error('Error fetching duration history:', err);
    res.status(500).json({ error: err.message });
  }
});

// Diagnosis history
app.get('/history/diagnosis', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT text, usage_count, last_used 
      FROM diagnosis_history 
      ORDER BY usage_count DESC, last_used DESC 
      LIMIT 20
    `);
    
    const diagnoses = rows.map(row => row.text);
    res.json(diagnoses);
  } catch (err) {
    console.error('Error fetching diagnosis history:', err);
    res.status(500).json({ error: err.message });
  }
});

// Notes history
app.get('/history/notes', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT text, usage_count, last_used 
      FROM notes_history 
      ORDER BY usage_count DESC, last_used DESC 
      LIMIT 20
    `);
    
    const notes = rows.map(row => row.text);
    res.json(notes);
  } catch (err) {
    console.error('Error fetching notes history:', err);
    res.status(500).json({ error: err.message });
  }
});

// Instruction history
app.get('/history/instruction', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT text, usage_count, last_used 
      FROM instruction_history 
      ORDER BY usage_count DESC, last_used DESC 
      LIMIT 20
    `);
    
    const instructions = rows.map(row => row.text);
    res.json(instructions);
  } catch (err) {
    console.error('Error fetching instruction history:', err);
    res.status(500).json({ error: err.message });
  }
});

// Helper function to update history tables (if not already added)
async function updateHistory(table, text) {
  if (!text || !text.trim()) return;
  
  const trimmedText = text.trim();
  
  try {
    await db.query(`
      INSERT INTO ${table} (text, usage_count, last_used, created_at)
      VALUES (?, 1, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
      usage_count = usage_count + 1,
      last_used = NOW()
    `, [trimmedText]);
  } catch (error) {
    console.error(`Error updating ${table}:`, error);
  }
}



const PORT = 3002;
app.listen(PORT, () => {
  console.log('🚀 Server running at http://localhost:${PORT}');
});