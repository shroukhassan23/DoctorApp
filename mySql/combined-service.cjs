const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const initDatabase = require('./initDb.cjs');
const SimpleFileLogger = require('./fileLog.cjs');

const app = express();
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:8081', 'http://localhost:4173', 'http://localhost:8081', 'http://localhost:8080'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Disposition', 'Content-Type', 'Content-Length']
}));
app.use(express.json());

let db;
let logger;

// Combined service initialization
(async () => {
    try {
        console.log('🚀 Combined service starting with SQLite...');

        db = await initDatabase();
        logger = new SimpleFileLogger('combined-service');
        await logger.initialize();

        console.log("✅ Combined service database initialized.");

        // Import all your existing routes from patient.cjs, visit.cjs, and reports.cjs here
        // Just copy-paste the route definitions (app.get, app.post, etc.) from each file

        const PORT = process.env.PORT || 3001;
        app.listen(PORT, () => {
            console.log(`🚀 Combined service running at http://localhost:${PORT}`);
            console.log(`📊 Patient endpoints: http://localhost:${PORT}/Patients`);
            console.log(`🏥 Visit endpoints: http://localhost:${PORT}/Visit/*`);
            console.log(`📈 Reports endpoints: http://localhost:${PORT}/reports/*`);
        });

    } catch (error) {
        console.error("❌ Failed to initialize combined service:", error.message);
        process.exit(1);
    }
})();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const { patientId } = req.params;

        // Use installation directory uploads folder
        const installPath = process.env.INSTALL_PATH || 'C:\\Program Files\\DoctorApp';
        const uploadPath = path.join(installPath, 'uploads', 'patients', patientId);
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
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|xls|xlsx|ppt|pptx|mp3|mp4|xlsx|csv|xls|/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        console.log('File type:', file.mimetype);
        console.log('File extension:', path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype) ||
            file.mimetype.includes('application/pdf') ||
            file.mimetype.includes('application/msword') ||
            file.mimetype.includes('application/vnd.openxmlformats') ||
            file.mimetype.includes('application/vnd.ms-excel') ||
            file.mimetype.includes('application/vnd.ms-powerpoint');
        console.log('MIME type valid:', mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images, PDFs, MP3, MP4, and documents (DOC, DOCX, XLS, XLSX, PPT, PPTX) are allowed!'));
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


const installPath = process.env.INSTALL_PATH || 'C:\\Program Files\\DoctorApp';
app.use('/uploads', express.static(path.join(installPath, 'uploads')));


// Add this debug endpoint to visit.cjs
app.get('/debug/database-state', async (req, res) => {
    try {
        // Check if we're connected to the same database file
        const [visitCount] = await db.query("SELECT COUNT(*) as count FROM visits");
        const [patientCount] = await db.query("SELECT COUNT(*) as count FROM patients WHERE deleted_at IS NULL");

        // Check the actual data
        const [recentVisits] = await db.query(`
      SELECT v.*, p.name as patient_name 
      FROM visits v 
      LEFT JOIN patients p ON v.patient_id = p.id 
      ORDER BY v.created_at DESC 
      LIMIT 5
    `);

        console.log('🔍 Visit service DB state:', {
            visits: visitCount[0],
            patients: patientCount[0],
            recentVisits: recentVisits
        });

        res.json({
            service: 'visit-service',
            visits: visitCount[0],
            patients: patientCount[0],
            recentVisits: recentVisits,
            dbPath: process.env.DB_PATH || 'default path'
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

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

    try {
        // Validate and format visit_date
        let formattedVisitDate;
        if (visit_date) {
            // If it's a date object or string, format it properly
            const dateObj = new Date(visit_date);
            if (isNaN(dateObj.getTime())) {
                return res.status(400).json({ error: 'Invalid visit date format' });
            }
            // Format as YYYY-MM-DD HH:MM:SS for SQLite
            formattedVisitDate = dateObj.toISOString().replace('T', ' ').slice(0, 19);
        } else {
            // Use current datetime if no date provided
            formattedVisitDate = new Date().toISOString().replace('T', ' ').slice(0, 19);
        }

        const [result] = await db.query(
            `INSERT INTO visits 
       (patient_id, visit_date, type_id, chief_complaint, diagnosis, notes, status_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
            [patient_id, formattedVisitDate, type_id, chief_complaint, diagnosis, notes, status_id]
        );

        // Update history
        if (diagnosis) await updateHistory('diagnosis_history', diagnosis);
        if (notes) await updateHistory('notes_history', notes);

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
        // Format prescription date
        let formattedPrescriptionDate;
        if (prescription_date) {
            const dateObj = new Date(prescription_date);
            if (isNaN(dateObj.getTime())) {
                return res.status(400).json({ error: 'Invalid prescription date format' });
            }
            formattedPrescriptionDate = dateObj.toISOString().replace('T', ' ').slice(0, 19);
        } else {
            formattedPrescriptionDate = new Date().toISOString().replace('T', ' ').slice(0, 19);
        }

        const [result] = await db.query(
            `INSERT INTO prescription 
       (patient_id, visit_id, diagnosis, notes, prescription_date)
       VALUES (?, ?, ?, ?, ?)`,
            [patient_id, visit_id, diagnosis, notes, formattedPrescriptionDate]
        );

        // Update history
        if (diagnosis) await updateHistory('diagnosis_history', diagnosis);
        if (notes) await updateHistory('notes_history', notes);

        res.status(201).json({ message: 'Prescription added successfully', prescriptionId: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Fixed: Add prescription medicines for SQLite
app.post('/prescription/medicines/add', async (req, res) => {
    const { medicines } = req.body; // Array of medicine objects

    try {
        if (!medicines || medicines.length === 0) {
            return res.status(400).json({ error: 'No medicines provided' });
        }

        // Insert medicines one by one for SQLite compatibility
        let insertedCount = 0;

        for (const med of medicines) {
            await db.query(
                `INSERT INTO prescription_items 
         (prescription_id, medicine_id, dosage, frequency, duration, instructions, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
                [
                    med.prescription_id,
                    med.medicine_id,
                    med.dosage || '',
                    med.frequency || '',
                    med.duration || '',
                    med.instructions || ''
                ]
            );
            insertedCount++;
            if (med.dosage) await updateHistory('dosage_history', med.dosage);
            if (med.duration) await updateHistory('duration_history', med.duration);
            if (med.instructions) await updateHistory('instruction_history', med.instructions);
        }

        

        res.status(201).json({
            message: 'Prescription medicines added successfully',
            insertedCount: insertedCount
        });
    } catch (err) {
        console.error('Error adding prescription medicines:', err);
        res.status(500).json({ error: err.message });
    }
});

// Fixed: Add prescription lab tests for SQLite
app.post('/prescription/labtests/add', async (req, res) => {
    const { labTests } = req.body; // Array of lab test objects

    try {
        if (!labTests || labTests.length === 0) {
            return res.status(400).json({ error: 'No lab tests provided' });
        }

        // Insert lab tests one by one for SQLite compatibility
        let insertedCount = 0;

        for (const test of labTests) {
            await db.query(
                `INSERT INTO prescription_lab_tests 
         (prescription_id, lab_test_id, created_at)
         VALUES (?, ?, datetime('now'))`,
                [test.prescription_id, test.lab_test_id]
            );
            insertedCount++;
        }

        res.status(201).json({
            message: 'Prescription lab tests added successfully',
            insertedCount: insertedCount
        });
    } catch (err) {
        console.error('Error adding prescription lab tests:', err);
        res.status(500).json({ error: err.message });
    }
});

// Fixed: Add prescription imaging studies for SQLite
app.post('/prescription/imagingstudies/add', async (req, res) => {
    const { imagingStudies } = req.body; // Array of imaging study objects

    try {
        if (!imagingStudies || imagingStudies.length === 0) {
            return res.status(400).json({ error: 'No imaging studies provided' });
        }

        console.log('Received imaging studies data:', imagingStudies);

        // Insert imaging studies one by one for SQLite compatibility
        let insertedCount = 0;

        for (const study of imagingStudies) {
            await db.query(
                `INSERT INTO prescription_imaging_studies 
         (prescription_id, imaging_studies_id, comments, created_at)
         VALUES (?, ?, ?, datetime('now'))`,
                [
                    study.prescription_id,
                    study.imaging_studies_id,
                    study.comments || null
                ]
            );
            insertedCount++;
        }

        console.log('Successfully inserted imaging studies:', insertedCount);

        res.status(201).json({
            message: 'Prescription imaging studies added successfully',
            insertedCount: insertedCount
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
       ORDER BY v.visit_date ASC, v.created_at ASC`,
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
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime("now"))`,
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
         updated_at = datetime("now")
         WHERE id = ?`,
                [name, title, qualification, specialization, clinic_name, clinic_address, phone, email, existing[0].id]
            );

            res.json({ message: 'Doctor profile updated successfully' });
        } else {
            // Create new profile
            const [result] = await db.query(
                `INSERT INTO doctor_profile 
         (name, title, qualification, specialization, clinic_name, clinic_address, phone, email, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime("now"), datetime("now"))`,
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
       updated_at = datetime("now")
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
       LEFT JOIN imaging_studies ist ON pis.imaging_studies_id = ist.id
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
            'INSERT INTO lab_tests (name, description, created_at) VALUES (?, ?, datetime("now"))',
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
            'INSERT INTO imaging_studies (name, description, created_at) VALUES (?, ?, datetime("now"))',
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
// Visit Management - Delete visit (Fixed for SQLite)
app.delete('/visits/:id', async (req, res) => {
    const { id } = req.params;

    try {
        console.log(`Starting deletion process for visit ID: ${id}`);

        // First, get all prescriptions for this visit
        const [prescriptions] = await db.query(
            'SELECT id FROM prescription WHERE visit_id = ?',
            [id]
        );

        // Delete related prescription data for each prescription
        for (const prescription of prescriptions) {
            const prescriptionId = prescription.id;
            console.log(`Deleting prescription data for prescription ID: ${prescriptionId}`);

            // Delete prescription items (medicines)
            await db.query(
                'DELETE FROM prescription_items WHERE prescription_id = ?',
                [prescriptionId]
            );

            // Delete prescription lab tests
            await db.query(
                'DELETE FROM prescription_lab_tests WHERE prescription_id = ?',
                [prescriptionId]
            );

            // Delete prescription imaging studies
            await db.query(
                'DELETE FROM prescription_imaging_studies WHERE prescription_id = ?',
                [prescriptionId]
            );

            console.log(`Deleted all related data for prescription ID: ${prescriptionId}`);
        }

        // Delete all prescriptions for this visit
        if (prescriptions.length > 0) {
            await db.query(
                'DELETE FROM prescription WHERE visit_id = ?',
                [id]
            );
            console.log(`Deleted ${prescriptions.length} prescription(s) for visit ID: ${id}`);
        }

        // Delete any files related to this visit
        await db.query(
            'DELETE FROM patient_files WHERE visit_id = ?',
            [id]
        );

        // Finally, delete the visit itself
        const [result] = await db.query(
            'DELETE FROM visits WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Visit not found' });
        }

        console.log(`Successfully deleted visit ID: ${id} and all related data`);

        res.json({
            message: 'Visit and all related data deleted successfully',
            deletedVisitId: id,
            deletedPrescriptions: prescriptions.length
        });

    } catch (err) {
        console.error('Error deleting visit:', err);
        res.status(500).json({ error: err.message });
    }
});


app.put('/visits/:id', async (req, res) => {
    const { id } = req.params;
    const { visit_date, type_id, chief_complaint, diagnosis, notes, status_id } = req.body;

    try {
        // Format visit_date if provided
        let formattedVisitDate = visit_date;
        if (visit_date) {
            const dateObj = new Date(visit_date);
            if (isNaN(dateObj.getTime())) {
                return res.status(400).json({ error: 'Invalid visit date format' });
            }
            formattedVisitDate = dateObj.toISOString().replace('T', ' ').slice(0, 19);
        }

        const [result] = await db.query(
            `UPDATE visits SET 
       visit_date = ?, type_id = ?, chief_complaint = ?, 
       diagnosis = ?, notes = ?, status_id = ?
       WHERE id = ?`,
            [formattedVisitDate, type_id, chief_complaint, diagnosis, notes, status_id, id]
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
        // First try to update existing record
        const [updateResult] = await db.query(`
      UPDATE ${table} 
      SET usage_count = usage_count + 1, last_used = datetime('now')
      WHERE text = ?
    `, [trimmedText]);

        // If no rows affected, insert new record
        if (updateResult.affectedRows === 0) {
            await db.query(`
        INSERT INTO ${table} (text, usage_count, last_used, created_at)
        VALUES (?, 1, datetime('now'), datetime('now'))
      `, [trimmedText]);
        }
    } catch (error) {
        console.error(`Error updating ${table}:`, error);
    }
}

// Update visit status only
app.put('/visits/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status_id } = req.body;

    try {
        const [result] = await db.query(
            'UPDATE visits SET status_id = ? WHERE id = ?',
            [status_id, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Visit not found' });
        }

        res.json({ message: 'Visit status updated successfully' });
    } catch (err) {
        console.error('Error updating visit status:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/Patients', async (req, res) => {
    try {
        console.log('🔍 DEBUG: GET /Patients called');
        await logger.info('Fetching all patients');


        // Debug: Check database connection
        console.log('🔍 DEBUG: Database object:', !!db);

        const [rows] = await db.query('SELECT * FROM patients WHERE deleted_at IS NULL');

        console.log('🔍 DEBUG: Raw database query result:', rows);
        console.log('🔍 DEBUG: Number of rows from DB:', rows.length);
        console.log('🔍 DEBUG: First row:', rows[0]);


        await logger.info('Patients fetched successfully', { count: rows.length });

        console.log('🔍 DEBUG: About to send response:', rows);
        res.send(rows);
    } catch (err) {
        console.error('🔍 DEBUG: Error in GET /Patients:', err);
        await logger.error('Failed to fetch patients', err);
        res.status(500).send({ error: 'Failed to fetch patients', details: err.message });
    }
});


app.get('/debug/test-db', async (req, res) => {
    try {
        console.log('🔍 Testing database directly...');

        // Test direct database access
        const [allTables] = await db.query("SELECT name FROM sqlite_master WHERE type='table'");
        console.log('🔍 All tables:', allTables);

        const [patientCount] = await db.query("SELECT COUNT(*) as count FROM patients");
        console.log('🔍 Patient count:', patientCount);

        const [allPatients] = await db.query("SELECT * FROM patients");
        console.log('🔍 All patients (including deleted):', allPatients);

        res.json({
            tables: allTables,
            patientCount: patientCount[0],
            allPatients: allPatients
        });
    } catch (err) {
        console.error('🔍 Database test error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Search Patients
app.get('/Patients/search', async (req, res) => {
    try {
     await logger.info("🔍search", req.query);
await logger.info("🔍 Entered GET /Patients/search", req.query);
        const { q } = req.query;
        await logger.info('Patient search initiated', { searchTerm: q });

        if (!q || q.trim().length === 0) {
            await logger.warn('Empty search query provided');
            return res.json([]);
        }

        const searchTerm = `%${q.trim()}%`;
          await logger.info('Patient search initiated', searchTerm);

        const query = `SELECT * FROM patients 
                       WHERE deleted_at IS NULL 
                       AND (name LIKE ? OR phone LIKE ? OR address LIKE ?)
                       ORDER BY name ASC
                       LIMIT 20`;

        const [rows] = await db.query(query, [searchTerm, searchTerm, searchTerm]);

        await logger.info('Patient search completed', {
            searchTerm: q,
            resultsCount: rows.length
        });

        res.json(rows);
    } catch (err) {
        await logger.error('Patient search failed', err, { searchTerm: req.query.q });
        res.status(500).json({ error: 'Search failed', details: err.message });
    }
});

// Create Patient
app.post('/Patients', async (req, res) => {
    try {
        const { patient } = req.body;
        await logger.info('📝 Incoming patient create request', { body: req.body });
        await logger.info('Creating new patient', { patientData: patient });

        // Validate required fields
        if (!patient || !patient.name || !patient.age || !patient.gender || !patient.date_of_birth) {
            await logger.warn('Missing required patient fields', { providedData: patient });
            return res.status(400).json({ error: "Missing required patient fields" });
        }

        const query = 'INSERT INTO patients (name, age, date_of_birth, gender, phone, address, medical_history, deleted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        const params = [
            patient.name,
            patient.age,
            patient.date_of_birth,
            patient.gender,
            patient.phone || null,
            patient.address || null,
            patient.medical_history || null,
            null
        ];

        const [results] = await db.query(query, params);

        await logger.info('Patient created successfully', {
            patientId: results.insertId,
            patientName: patient.name
        });

        return res.status(201).json({ success: true, id: results.insertId });
    } catch (err) {
        await logger.error('Failed to create patient', err, { patientData: req.body });
        return res.status(500).json({ error: "Failed to create patient", details: err.message });
    }
});

// Update Patient
app.put('/Patients/:id', async (req, res) => {
     await logger.info(" PUT /Patients/:id",);
    try {
          await logger.info("✏️ Entered PUT /Patients/:id", req.params.id);
        const { id } = req.params;
        const patient = req.body;

        await logger.info('Updating patient', { patientId: id, updateData: patient });

        const query = `UPDATE patients SET 
                       name=?, age=?, date_of_birth=?, gender=?, phone=?, address=?, medical_history=?
                       WHERE id=?`;
        const params = [
            patient.name,
            patient.age,
            patient.date_of_birth,
            patient.gender,
            patient.phone || null,
            patient.address || null,
            patient.medical_history || null,
            id
        ];

        const [result] = await db.query(query, params);

        if (result.affectedRows === 0) {
            await logger.info('error in update ',);
            await logger.warn('Patient not found for update', { patientId: id });
            return res.status(404).json({ error: "Patient not found" });
        }

        await logger.info('Patient updated successfully', {
            patientId: id,
            patientName: patient.name
        });

        res.json({ success: true });
    } catch (err) {
        await logger.error('Failed to update patient', err, {
            patientId: req.params.id,
            updateData: req.body
        });
        res.status(500).json({ error: 'Failed to update patient', details: err.message });
    }
});

// Delete Patient (Soft Delete)
app.delete('/Patients/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await logger.info('Deleting patient', { patientId: id });

        const query = 'UPDATE patients SET deleted_at = datetime("now") WHERE id = ? AND deleted_at IS NULL';
        const [result] = await db.query(query, [id]);

        if (result.affectedRows === 0) {
            await logger.warn('Patient not found for deletion', { patientId: id });
            return res.status(404).json({ error: 'Patient not found' });
        }

        await logger.info('Patient deleted successfully', { patientId: id });

        res.json({ success: true, message: 'Patient marked as deleted' });
    } catch (err) {
        await logger.error('Failed to delete patient', err, { patientId: req.params.id });
        res.status(500).json({ error: 'Failed to delete patient', details: err.message });
    }
});

app.get('/reports/debug', async (req, res) => {
    try {
        console.log('🔍 Debug endpoint called');

        // Check visits table structure
        const [visitColumns] = await db.query("PRAGMA table_info(visits)");
        console.log('📊 Visit columns:', visitColumns);

        // Check all visits with their dates
        const [allVisits] = await db.query(`
          SELECT 
            id, 
            patient_id, 
            visit_date, 
            DATE(visit_date) as visit_date_only,
            status_id, 
            type_id,
            strftime('%Y-%m-%d', visit_date) as formatted_date
          FROM visits 
          ORDER BY visit_date DESC
        `);
        console.log('📋 All visits with dates:', allVisits);

        // Check status table
        const [statusTable] = await db.query("SELECT * FROM status").catch(() => [[]]);
        console.log('🏷️ Status table:', statusTable);

        // Check type table
        const [typeTable] = await db.query("SELECT * FROM type").catch(() => [[]]);
        console.log('🏷️ Type table:', typeTable);

        // Test date comparison
        const testDate = new Date().toISOString().split('T')[0];
        console.log('🧪 Testing date comparison for:', testDate);

        const [dateTest] = await db.query(`
          SELECT 
            COUNT(*) as count,
            DATE(visit_date) as visit_date_only
          FROM visits 
          WHERE DATE(visit_date) = ?
          GROUP BY DATE(visit_date)
        `, [testDate]);

        console.log('📅 Date test results:', dateTest);

        res.json({
            visitColumns,
            allVisits,
            statusTable,
            typeTable,
            totalVisitsCount: allVisits.length,
            dateTest,
            testDate
        });
    } catch (error) {
        console.error('❌ Debug error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Test endpoint
app.get('/reports/test', (req, res) => {
    res.json({ message: 'Reports service is working!', timestamp: new Date().toISOString() });
});

app.get('/reports/visits', async (req, res) => {
    const { from, to } = req.query;
    console.log('📅 Fetching visits from:', from, 'to:', to);

    if (!from || !to) {
        return res.status(400).json({ error: 'Both from and to dates are required' });
    }

    try {
        // Debug query first
        console.log('🔍 Testing date range query...');
        const [testRows] = await db.query(`
          SELECT 
            id,
            visit_date,
            date(visit_date) as date_only,
            date(visit_date) >= date(?) as date_gte,
            date(visit_date) <= date(?) as date_lte
          FROM visits
        `, [from, to]);
        console.log('🔍 Date test results:', testRows);

        const [rows] = await db.query(
            `SELECT 
            v.id AS visit_id, 
            v.*, 
            p.*, 
            p.id AS patient_id,
            date(v.visit_date) as visit_date_only
           FROM visits v
           JOIN patients p ON v.patient_id = p.id AND p.deleted_at IS NULL
           WHERE date(v.visit_date) >= date(?) AND date(v.visit_date) <= date(?)
           ORDER BY v.visit_date ASC`,
            [from, to]
        );

        console.log('📋 Found visits:', rows.length);

        // If no results, try alternative approach
        if (rows.length === 0) {
            console.log('⚠️ No visits found with date(), trying string comparison...');
            const [altRows] = await db.query(
                `SELECT 
              v.id AS visit_id, 
              v.*, 
              p.*, 
              p.id AS patient_id,
              substr(v.visit_date, 1, 10) as visit_date_only
             FROM visits v
             JOIN patients p ON v.patient_id = p.id AND p.deleted_at IS NULL
             WHERE substr(v.visit_date, 1, 10) >= ? AND substr(v.visit_date, 1, 10) <= ?
             ORDER BY v.visit_date ASC`,
                [from, to]
            );
            console.log('📋 Alternative query found visits:', altRows.length);
            res.json(altRows);
        } else {
            res.json(rows);
        }
    } catch (error) {
        console.error('❌ Error fetching visits:', error);
        res.status(500).json({ error: 'Failed to fetch visits' });
    }
});


// Add this debug endpoint
app.get('/reports/debug-database', async (req, res) => {
    try {
        console.log('🔍 Debugging database state...');

        // 1. Check if we're actually connected to the same database
        const [dbInfo] = await db.query("SELECT sqlite_version() as version");
        console.log('📊 SQLite version:', dbInfo);

        // 2. Check all tables
        const [tables] = await db.query("SELECT name FROM sqlite_master WHERE type='table'");
        console.log('📊 Available tables:', tables);

        // 3. Check patients table
        const [patientCount] = await db.query("SELECT COUNT(*) as count FROM patients");
        console.log('👥 Total patients:', patientCount[0]);

        const [nonDeletedPatients] = await db.query("SELECT COUNT(*) as count FROM patients WHERE deleted_at IS NULL");
        console.log('👥 Non-deleted patients:', nonDeletedPatients[0]);

        // 4. Check visits table structure
        const [visitStructure] = await db.query("PRAGMA table_info(visits)");
        console.log('🏥 Visits table structure:', visitStructure);

        // 5. Check visits count
        const [visitCount] = await db.query("SELECT COUNT(*) as count FROM visits");
        console.log('🏥 Total visits:', visitCount[0]);

        // 6. Check actual visit data with patient info
        const [visitData] = await db.query(`
      SELECT 
        v.id as visit_id,
        v.patient_id,
        v.visit_date,
        v.type_id,
        v.status_id,
        p.id as patient_real_id,
        p.name as patient_name,
        p.deleted_at as patient_deleted
      FROM visits v
      LEFT JOIN patients p ON v.patient_id = p.id
      LIMIT 10
    `);
        console.log('🏥 Visit data with patient info:', visitData);

        // 7. Check for orphaned visits
        const [orphanedVisits] = await db.query(`
      SELECT v.*, 'ORPHANED' as status
      FROM visits v
      LEFT JOIN patients p ON v.patient_id = p.id
      WHERE p.id IS NULL
    `);
        console.log('⚠️ Orphaned visits:', orphanedVisits);

        res.json({
            database: dbInfo[0],
            tables: tables,
            patientCount: patientCount[0],
            nonDeletedPatients: nonDeletedPatients[0],
            visitStructure: visitStructure,
            visitCount: visitCount[0],
            visitData: visitData,
            orphanedVisits: orphanedVisits
        });

    } catch (error) {
        console.error('❌ Database debug error:', error);
        res.status(500).json({
            error: error.message,
            stack: error.stack
        });
    }
});

app.get('/reports/visit-stats', async (req, res) => {
    const { from, to } = req.query;
    console.log('📊 Fetching visit stats from:', from, 'to:', to);

    if (!from || !to) {
        return res.status(400).json({ error: 'Both from and to dates are required' });
    }

    try {
        // Debug: Let's see what we're working with
        console.log('🔍 Debug: Checking all visits first...');
        const [allVisits] = await db.query(`
          SELECT 
            id,
            visit_date,
            date(visit_date) as date_only,
            type_id,
            status_id
          FROM visits 
          ORDER BY visit_date DESC
        `);
        console.log('🔍 All visits in DB:', allVisits);

        // Main query with proper date handling
        const [stats] = await db.query(`
          SELECT 
            COUNT(*) as totalVisits,
            COUNT(CASE WHEN v.type_id = 9 THEN 1 END) as primaryVisits,
            COUNT(CASE WHEN v.type_id = 10 THEN 1 END) as followUpVisits,
            COUNT(CASE WHEN v.status_id = 1 THEN 1 END) as waitingVisits,
            COUNT(CASE WHEN v.status_id = 2 THEN 1 END) as completedVisits,
            COUNT(CASE WHEN v.status_id = 3 THEN 1 END) as cancelledVisits
          FROM visits v
          WHERE date(v.visit_date) >= date(?) AND date(v.visit_date) <= date(?)
        `, [from, to]);

        console.log('📊 Query result:', stats[0]);

        // If no results, try a more permissive query for debugging
        if (!stats[0] || stats[0].totalVisits === 0) {
            console.log('⚠️ No results with date filter, trying broader query...');

            const [debugStats] = await db.query(`
            SELECT 
              COUNT(*) as totalVisits,
              COUNT(CASE WHEN v.type_id = 9 THEN 1 END) as primaryVisits,
              COUNT(CASE WHEN v.type_id = 10 THEN 1 END) as followUpVisits,
              COUNT(CASE WHEN v.status_id = 1 THEN 1 END) as waitingVisits,
              COUNT(CASE WHEN v.status_id = 2 THEN 1 END) as completedVisits,
              COUNT(CASE WHEN v.status_id = 3 THEN 1 END) as cancelledVisits,
              GROUP_CONCAT(date(v.visit_date)) as found_dates
            FROM visits v
            WHERE substr(date(v.visit_date), 1, 10) >= ? 
            AND substr(date(v.visit_date), 1, 10) <= ?
          `, [from, to]);

            console.log('📊 Debug stats with string comparison:', debugStats[0]);

            if (debugStats[0] && debugStats[0].totalVisits > 0) {
                res.json(debugStats[0]);
                return;
            }
        }

        const result = stats[0] || {
            totalVisits: 0,
            primaryVisits: 0,
            followUpVisits: 0,
            waitingVisits: 0,
            completedVisits: 0,
            cancelledVisits: 0
        };

        res.json(result);
    } catch (error) {
        console.error('❌ Error fetching visit stats:', error);
        res.status(500).json({ error: 'Failed to fetch visit stats' });
    }
});

app.get('/reports/today', async (req, res) => {
    try {
        const [todayStats] = await db.query(`
          SELECT 
            COUNT(*) as totalVisits,
            COUNT(CASE WHEN status_id = 1 THEN 1 END) as waitingVisits,
            COUNT(CASE WHEN status_id = 2 THEN 1 END) as completedVisits,
            COUNT(CASE WHEN status_id = 3 THEN 1 END) as cancelledVisits
          FROM visits v
          WHERE date(v.visit_date) = date('now')
        `);

        res.json({
            date: new Date().toISOString().split('T')[0],
            ...(todayStats[0] || {
                totalVisits: 0,
                waitingVisits: 0,
                completedVisits: 0,
                cancelledVisits: 0
            })
        });
    } catch (error) {
        console.error('❌ Error fetching today stats:', error);
        res.status(500).json({ error: 'Failed to fetch today stats' });
    }
});

app.get('/reports/visits/all', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT 
            v.id AS visit_id, 
            v.*, 
            p.*, 
            p.id AS patient_id,
            DATE(v.visit_date) as visit_date_only
           FROM visits v
           JOIN patients p ON v.patient_id = p.id
           ORDER BY v.visit_date DESC`
        );

        console.log('📋 All visits found:', rows.length);
        res.json(rows);
    } catch (error) {
        console.error('❌ Error fetching all visits:', error);
        res.status(500).json({ error: 'Failed to fetch all visits' });
    }
});