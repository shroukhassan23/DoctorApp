const express = require('express');
const app = express();
const cors = require('cors');
app.use(express.json());
app.use(cors());
const db = require('./hospitalSystem.cjs');// اتصال بقاعدة البيانات

// GET 
app.get('/reports/visits', async (req, res) => {
  const { from, to } = req.query;

  if (!from || !to) {
    return res.status(400).json({ error: 'Both from and to dates are required' });
  }

  try {
   const [rows] = await db.execute(
  `SELECT v.*, p.name AS patient_name
   FROM visits v
   JOIN patients p ON v.patient_id = p.id
   WHERE v.visit_date BETWEEN ? AND ?
   ORDER BY v.visit_date DESC`,
  [from, to]
);

    res.json(rows);
  } catch (error) {
    console.error('Error fetching visits:', error);
    res.status(500).json({ error: 'Failed to fetch visits' });
  }
});
app.get('/reports/visit-stats', async (req, res) => {
  const { from, to } = req.query;

  if (!from || !to) {
    return res.status(400).json({ error: 'Both from and to dates are required' });
  }

  try {
    const [stats] = await db.execute(`
      SELECT
        COUNT(*) as totalVisits,
        SUM(CASE WHEN t.name = 'primary' THEN 1 ELSE 0 END) as primaryVisits,
        SUM(CASE WHEN t.name = 'follow up' THEN 1 ELSE 0 END) as followUpVisits,
        SUM(CASE WHEN s.name = 'waiting' THEN 1 ELSE 0 END) as waitingVisits
        
      FROM visits v
      JOIN type t ON v.type_id = t.id
      JOIN status s ON v.status_id = s.id
      WHERE v.visit_date BETWEEN ? AND ?
    `, [from, to]);

    res.json(stats[0]);
  } catch (error) {
    console.error('Error fetching visit stats:', error);
    res.status(500).json({ error: 'Failed to fetch visit stats' });
  }
});
module.exports = app;
app.listen(3003, () => {
  console.log('Server running on http://localhost:3003');
});