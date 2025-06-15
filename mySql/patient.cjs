const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const db = require('./hospitalSystem.cjs');
const app = express();
app.use(cors());
app.use(express.json());
// GET all Patients
app.get('/Patients', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM patients WHERE deleted_at IS NULL');
    res.send(rows);
  } catch (err) {
    res.status(500).send(err);
}
});


app.post('/Patients', async (req, res) => {
  try {
    // 1. Validate request body
    if (!req.body || !req.body.patient) {
      return res.status(400).json({ error: "Patient data is required in the request body" });
    }

    const { patient } = req.body;
console.log("Received body:", req.body);

    // 2. Validate required fields
    if (!patient.name || !patient.age || !patient.gender || !patient.date_of_birth ) {
      return res.status(400).json({ error: "Name, age , gender and date of birth are required fields" });
    }

    // 3. Execute the query
    const [results] = await db.query(
      'INSERT INTO patients (name, age, date_of_birth, gender, phone, address, medical_history) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        patient.name,
        patient.age,
        patient.date_of_birth, 
        patient.gender,
        patient.phone || null,
        patient.address || null,
        patient.medical_history || null
      ]
    );

    // 4. Return success response
    res.status(201).json({ 
      success: true,
      id: results.insertId 
    });

  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ 
      error: "Internal server error",
      details: err.message 
    });
  }
});

// PUT update user
app.put('/Patients/:id', async (req, res) => {
  console.log('Start editing....');
  try {
    const { id } = req.params;
    const patient = req.body; 
console.log('Received ID:', id, typeof id);


    const [result] = await db.query(
      `UPDATE patients SET 
       name=?, age=?, date_of_birth=?, gender=?, phone=?, address=?, medical_history=?
       WHERE id=?`,
      [
        patient.name,
        patient.age,
        patient.date_of_birth,
        patient.gender,
        patient.phone || null,
        patient.address || null,
        patient.medical_history || null,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ 
      error: err.sqlMessage || err.message 
    });
  }
});

// DELETE user
app.delete('/Patients/:id', async (req, res) => {
  const { id } = req.params;
  console.log('Received DELETE request for patient ID:', id);
console.log(res);
  try {
    const [result] = await db.query(
      'UPDATE patients SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL', 
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).send({ error: 'Patient not found' });
    }

    res.json({ success: true, message: 'Patient marked as deleted' });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});


// ✅ Start server
const PORT = 3001;
app.listen(PORT, () => {
  console.log('🚀 Server running at http://localhost:${PORT}');
});