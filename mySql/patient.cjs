const express = require('express');
const cors = require('cors');
const initDatabase = require('../initDb.cjs'); // استدعاء الدالة
const app = express();
app.use(cors());
app.use(express.json());

let db; // نحتفظ بمتغير db لنعرفه بعد التهيئة

(async () => {
  try {
    db = await initDatabase(); // جهزي الاتصال
    console.log("✅ Database initialized.");

    // 🔥 بعد ما الاتصال جاهز، فعّلي الـ routes

    // GET all Patients
    app.get('/Patients', async (req, res) => {
      try {
        const [rows] = await db.query('SELECT * FROM patients WHERE deleted_at IS NULL');
        res.send(rows);
      } catch (err) {
        res.status(500).send(err);
      }
    });

    app.get('/Patients/search', async (req, res) => {
      try {
        const { q } = req.query;
        if (!q || q.trim().length === 0) return res.json([]);
        const searchTerm = `%${q.trim()}%`;
        const [rows] = await db.query(
          `SELECT * FROM patients 
           WHERE deleted_at IS NULL 
           AND (name LIKE ? OR phone LIKE ? OR address LIKE ?)
           ORDER BY name ASC
           LIMIT 20`,
          [searchTerm, searchTerm, searchTerm]
        );
        res.json(rows);
      } catch (err) {
        console.error('Error searching patients:', err);
        res.status(500).json({ error: err.message });
      }
    });

app.post('/Patients', async (req, res) => {
  try {
    const { patient } = req.body;

    if (!patient || !patient.name || !patient.age || !patient.gender || !patient.date_of_birth) {
      return res.status(400).json({ error: "Missing required patient fields" });
    }

    const [results] = await db.query(
      'INSERT INTO patients (name, age, date_of_birth, gender, phone, address, medical_history, deleted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        patient.name,
        patient.age,
        patient.date_of_birth,
        patient.gender,
        patient.phone || null,
        patient.address || null,
        patient.medical_history || null,
        null 
      ]
    );

    res.status(201).json({ success: true, id: results.insertId });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
});


    app.put('/Patients/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const patient = req.body;
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
        if (result.affectedRows === 0) return res.status(404).json({ error: "Patient not found" });
        res.json({ success: true });
      } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: err.sqlMessage || err.message });
      }
    });

    app.delete('/Patients/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const [result] = await db.query(
          'UPDATE patients SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL',
          [id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Patient not found' });
        res.json({ success: true, message: 'Patient marked as deleted' });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // ✅ بعد ما كل شيء تمام، شغل السيرفر
    const PORT = 3001;
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("❌ Failed to initialize database:", error.message);
  }
})();
