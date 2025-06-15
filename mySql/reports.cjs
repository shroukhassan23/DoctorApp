const express = require('express');
const app = express();
app.use(express.json());
const db = require('./hospitalSystem.cjs');// اتصال بقاعدة البيانات

// GET 
app.get('/reports/visits', async (req, res) => {
  const { from, to } = req.query;

  if (!from || !to) {
    return res.status(400).json({ error: 'Both from and to dates are required' });
  }

  try {
    const [rows] = await db.execute(
      `SELECT * FROM visits WHERE visit_date BETWEEN ? AND ? ORDER BY visit_date DESC`,
      [from, to]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching visits:', error);
    res.status(500).json({ error: 'Failed to fetch visits' });
  }
});

module.exports = app;
app.listen(3002, () => {
  console.log('Server running on http://localhost:3002');
});