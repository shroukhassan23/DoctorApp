const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const db = require('./hospitalSystem.cjs');
const app = express();
app.use(cors());
app.use(express.json());
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

app.post('/visits', async (req, res) => {
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
const PORT = 3002;
app.listen(PORT, () => {
  console.log('🚀 Server running at http://localhost:${PORT}');
});