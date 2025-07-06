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
        // طريقة محسنة للتعامل مع التواريخ في SQLite
        const [rows] = await db.execute(
          `SELECT 
            v.id AS visit_id, 
            v.*, 
            p.*, 
            p.id AS patient_id,
            DATE(v.visit_date) as visit_date_only
           FROM visits v
           JOIN patients p ON v.patient_id = p.id
           WHERE DATE(v.visit_date) >= DATE(?) AND DATE(v.visit_date) <= DATE(?)
           ORDER BY v.visit_date ASC`,
          [from, to]
        );

        console.log('📋 Found visits:', rows.length);
        
        // إذا مافيش نتائج، جرب بدون فلتر التاريخ للتأكد من وجود البيانات
        if (rows.length === 0) {
          console.log('⚠️ No visits found for date range, checking all visits...');
          const [allRows] = await db.execute(`
            SELECT 
              v.id AS visit_id, 
              v.*, 
              p.*, 
              p.id AS patient_id,
              DATE(v.visit_date) as visit_date_only
             FROM visits v
             JOIN patients p ON v.patient_id = p.id
             ORDER BY v.visit_date DESC
             LIMIT 10
          `);
          console.log('📋 Sample of all visits:', allRows.map(r => ({ 
            id: r.visit_id, 
            visit_date: r.visit_date, 
            visit_date_only: r.visit_date_only,
            patient_name: r.name 
          })));
        }

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
        // طريقة محسنة للتعامل مع التواريخ
        const [stats] = await db.execute(`
          SELECT 
            COUNT(*) as totalVisits,
            COUNT(CASE WHEN v.type_id = 1 THEN 1 END) as primaryVisits,
            COUNT(CASE WHEN v.type_id = 2 THEN 1 END) as followUpVisits,
            COUNT(CASE WHEN v.status_id = 1 THEN 1 END) as waitingVisits,
            COUNT(CASE WHEN v.status_id = 2 THEN 1 END) as completedVisits,
            COUNT(CASE WHEN v.status_id = 3 THEN 1 END) as cancelledVisits
          FROM visits v
          WHERE DATE(v.visit_date) >= DATE(?) AND DATE(v.visit_date) <= DATE(?)
        `, [from, to]);

        console.log('📊 Stats with date filter:', stats[0]);

        // إذا مافيش نتائج، جرب طريقة تانية
        if (!stats[0] || stats[0].totalVisits === 0) {
          console.log('⚠️ No stats found with date filter, trying string comparison...');
          
          // جرب مقارنة النصوص مباشرة
          const [statsString] = await db.execute(`
            SELECT 
              COUNT(*) as totalVisits,
              COUNT(CASE WHEN v.type_id = 1 THEN 1 END) as primaryVisits,
              COUNT(CASE WHEN v.type_id = 2 THEN 1 END) as followUpVisits,
              COUNT(CASE WHEN v.status_id = 1 THEN 1 END) as waitingVisits,
              COUNT(CASE WHEN v.status_id = 2 THEN 1 END) as completedVisits,
              COUNT(CASE WHEN v.status_id = 3 THEN 1 END) as cancelledVisits
            FROM visits v
            WHERE substr(v.visit_date, 1, 10) >= ? AND substr(v.visit_date, 1, 10) <= ?
          `, [from, to]);
          
          console.log('📊 Stats with string comparison:', statsString[0]);
          
          // إذا لسه مافيش نتائج، جرب بدون فلتر
          if (!statsString[0] || statsString[0].totalVisits === 0) {
            console.log('⚠️ Still no results, checking all data...');
            const [allStats] = await db.execute(`
              SELECT 
                COUNT(*) as totalVisits,
                COUNT(CASE WHEN v.type_id = 1 THEN 1 END) as primaryVisits,
                COUNT(CASE WHEN v.type_id = 2 THEN 1 END) as followUpVisits,
                COUNT(CASE WHEN v.status_id = 1 THEN 1 END) as waitingVisits,
                COUNT(CASE WHEN v.status_id = 2 THEN 1 END) as completedVisits,
                COUNT(CASE WHEN v.status_id = 3 THEN 1 END) as cancelledVisits
              FROM visits v
            `);
            
            console.log('📊 All data stats (no filter):', allStats[0]);
            
            // Sample of visits to debug
            const [sampleVisits] = await db.execute(`
              SELECT 
                visit_date,
                DATE(visit_date) as date_only,
                substr(visit_date, 1, 10) as string_date
              FROM visits 
              ORDER BY visit_date DESC 
              LIMIT 5
            `);
            
            console.log('📋 Sample visits for debugging:', sampleVisits);
            
            res.json({
              ...stats[0],
              debug: {
                allDataStats: allStats[0],
                sampleVisits: sampleVisits,
                dateRange: { from, to },
                stringComparisonStats: statsString[0]
              }
            });
          } else {
            res.json(statsString[0]);
          }
        } else {
          res.json(stats[0]);
        }
      } catch (error) {
        console.error('❌ Error fetching visit stats:', error);
        res.status(500).json({ error: 'Failed to fetch visit stats' });
      }
    });

    // GET /reports/today - مُحسن للتعامل مع تاريخ اليوم
    app.get('/reports/today', async (req, res) => {
      const today = new Date().toISOString().split('T')[0];
      console.log('📅 Fetching today stats for:', today);

      try {
        // جرب الطريقة المحسنة أولاً
        const [todayStats] = await db.execute(`
          SELECT 
            COUNT(*) as totalVisits,
            COUNT(CASE WHEN status_id = 1 THEN 1 END) as waitingVisits,
            COUNT(CASE WHEN status_id = 2 THEN 1 END) as completedVisits,
            COUNT(CASE WHEN status_id = 3 THEN 1 END) as cancelledVisits
          FROM visits v
          WHERE DATE(v.visit_date) = DATE(?)
        `, [today]);

        console.log('📊 Today stats (DATE function):', todayStats[0]);

        // إذا مافيش نتائج، جرب مقارنة النصوص
        if (!todayStats[0] || todayStats[0].totalVisits === 0) {
          const [todayStatsString] = await db.execute(`
            SELECT 
              COUNT(*) as totalVisits,
              COUNT(CASE WHEN status_id = 1 THEN 1 END) as waitingVisits,
              COUNT(CASE WHEN status_id = 2 THEN 1 END) as completedVisits,
              COUNT(CASE WHEN status_id = 3 THEN 1 END) as cancelledVisits
            FROM visits v
            WHERE substr(v.visit_date, 1, 10) = ?
          `, [today]);
          
          console.log('📊 Today stats (string comparison):', todayStatsString[0]);
          
          res.json({
            date: today,
            ...(todayStatsString[0] || todayStats[0])
          });
        } else {
          res.json({
            date: today,
            ...todayStats[0]
          });
        }
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