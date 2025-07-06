const express = require('express');
const cors = require('cors');
const initDatabase = require('./initDb.cjs');
const SimpleFileLogger = require('./fileLog.cjs');

const app = express();
app.use(express.json());
app.use(cors());

let db;

(async () => {
  try {
    console.log('Reports service starting with SQLite...');
    
    db = await initDatabase();
    let logger;
    try {
      logger = new SimpleFileLogger('reports-service');
      await logger.initialize();
      await logger.info('Reports service starting with SQLite');
    } catch (error) {
      console.error('Logger initialization failed:', error);
    }
    console.log("✅ Reports service database initialized.");

    // Debug endpoint - اختبر دا الأول
    app.get('/reports/debug', async (req, res) => {
      try {
        console.log('🔍 Debug endpoint called');
        
        // Check visits table structure
        const [visitColumns] = await db.execute("PRAGMA table_info(visits)");
        console.log('📊 Visit columns:', visitColumns);
        
        // Check all visits with their dates
        const [allVisits] = await db.execute(`
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
        const [statusTable] = await db.execute("SELECT * FROM status").catch(() => [[]]);
        console.log('🏷️ Status table:', statusTable);
        
        // Check type table
        const [typeTable] = await db.execute("SELECT * FROM type").catch(() => [[]]);
        console.log('🏷️ Type table:', typeTable);
        
        // Test date comparison
        const testDate = new Date().toISOString().split('T')[0];
        console.log('🧪 Testing date comparison for:', testDate);
        
        const [dateTest] = await db.execute(`
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

    // GET /reports/visits - مُحسن للتعامل مع مشاكل التواريخ
    app.get('/reports/visits', async (req, res) => {
      const { from, to } = req.query;
      console.log('📅 Fetching visits from:', from, 'to:', to);
    
      if (!from || !to) {
        return res.status(400).json({ error: 'Both from and to dates are required' });
      }
    
      try {
        const [rows] = await db.execute(
          `SELECT 
            v.id AS visit_id, 
            v.*, 
            p.*, 
            p.id AS patient_id,
            date(v.visit_date) as visit_date_only,
            datetime(v.visit_date) as full_visit_datetime
           FROM visits v
           JOIN patients p ON v.patient_id = p.id
           WHERE date(v.visit_date) >= date(?) AND date(v.visit_date) <= date(?)
           ORDER BY v.visit_date ASC`,
          [from, to]
        );
    
        console.log('📋 Found visits:', rows.length);
        res.json(rows);
      } catch (error) {
        console.error('❌ Error fetching visits:', error);
        res.status(500).json({ error: 'Failed to fetch visits' });
      }
    });

    // GET /reports/visit-stats - مُحسن لحل مشاكل التواريخ
    app.get('/reports/visit-stats', async (req, res) => {
      const { from, to } = req.query;
      console.log('📊 Fetching visit stats from:', from, 'to:', to);
    
      if (!from || !to) {
        return res.status(400).json({ error: 'Both from and to dates are required' });
      }
    
      try {
        const [stats] = await db.execute(`
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
    
        res.json(stats[0] || {
          totalVisits: 0,
          primaryVisits: 0,
          followUpVisits: 0,
          waitingVisits: 0,
          completedVisits: 0,
          cancelledVisits: 0
        });
      } catch (error) {
        console.error('❌ Error fetching visit stats:', error);
        res.status(500).json({ error: 'Failed to fetch visit stats' });
      }
    });

    // GET /reports/today - مُحسن للتعامل مع تاريخ اليوم
    app.get('/reports/today', async (req, res) => {
      try {
        const [todayStats] = await db.execute(`
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

    // GET /reports/visits/all
    app.get('/reports/visits/all', async (req, res) => {
      try {
        const [rows] = await db.execute(
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

    const PORT = 3003;
    app.listen(PORT, () => {
      console.log(`🚀 Reports service running at http://localhost:${PORT}`);
      console.log(`🔍 Debug endpoint: http://localhost:${PORT}/reports/debug`);
      console.log(`🧪 Test endpoint: http://localhost:${PORT}/reports/test`);
    });

  } catch (error) {
    console.error("❌ Failed to initialize reports service:", error.message);
    process.exit(1);
  }
})();