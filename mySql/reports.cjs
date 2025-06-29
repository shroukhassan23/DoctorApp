const express = require('express');
const cors = require('cors');
const initDatabase = require('./initDb.cjs');
const app = express();
app.use(express.json());
app.use(cors());
let db;

(async () => {
  try {
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'doctor'
    };

    console.log('Reports service starting with DB config:', {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      database: dbConfig.database
    });

    db = await initDatabase(dbConfig);
    console.log("✅ Reports service database initialized.");

    // GET 
    app.get('/reports/visits', async (req, res) => {
      const { from, to } = req.query;

      if (!from || !to) {
        return res.status(400).json({ error: 'Both from and to dates are required' });
      }

      try {
        const [rows] = await db.execute(
          `SELECT v.id AS visit_id, p.*, p.id AS patient_id, v.*
       FROM visits v
       JOIN patients p ON v.patient_id = p.id
       WHERE v.visit_date BETWEEN ? AND ?
       ORDER BY v.visit_date ASC`,
          [from, to]
        );

        res.json(rows);
      } catch (error) {
        console.error('Error fetching visits:', error);
        res.status(500).json({ error: 'Failed to fetch visits' });
      }
    });
    app.get('/reports/visits/all', async (req, res) => {
      try {
        const [rows] = await db.execute(
          `SELECT v.id AS visit_id, p.*, p.id AS patient_id, v.*
       FROM visits v
       JOIN patients p ON v.patient_id = p.id
       ORDER BY v.visit_date ASC`
        );

        res.json(rows);
      } catch (error) {
        console.error('Error fetching all visits:', error);
        res.status(500).json({ error: 'Failed to fetch all visits' });
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
    app.get('/reports/today', async (req, res) => {
      const today = new Date().toISOString().split('T')[0];

      try {
        const [todayStats] = await db.execute(`
      SELECT
        COUNT(*) as totalVisits,
        SUM(CASE WHEN s.name = 'waiting' THEN 1 ELSE 0 END) as waitingVisits,
        SUM(CASE WHEN s.name = 'completed' THEN 1 ELSE 0 END) as completedVisits,
        SUM(CASE WHEN s.name = 'cancelled' THEN 1 ELSE 0 END) as cancelledVisits
      FROM visits v
      JOIN status s ON v.status_id = s.id
      WHERE DATE(v.visit_date) = ?
    `, [today]);

        res.json({
          date: today,
          ...todayStats[0]
        });
      } catch (error) {
        console.error('Error fetching today stats:', error);
        res.status(500).json({ error: 'Failed to fetch today stats' });
      }
    });
    const PORT = 3003;
    app.listen(PORT, () => {
      console.log(`🚀 Reports service running at http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("❌ Failed to initialize reports service:", error.message);
    process.exit(1);
  }
})();