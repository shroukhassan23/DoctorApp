const express = require('express');
const cors = require('cors');
const initDatabase = require('./initDb.cjs');
const SimpleFileLogger = require('./fileLog.cjs');

const app = express();
app.use(cors());
app.use(express.json());

let db;
let logger;
let keepAlive;
let isShuttingDown = false;

// Safe console wrapper to handle EPIPE errors
const safeConsole = {
  log: (...args) => {
    try {
      if (!isShuttingDown && process.stdout && !process.stdout.destroyed) {
        console.log(...args);
      }
    } catch (error) {
      // Silently ignore EPIPE errors during console.log
      if (error.code !== 'EPIPE') {
        // Only re-throw non-EPIPE errors
        throw error;
      }
    }
  },
  error: (...args) => {
    try {
      if (!isShuttingDown && process.stderr && !process.stderr.destroyed) {
        console.error(...args);
      }
    } catch (error) {
      if (error.code !== 'EPIPE') {
        throw error;
      }
    }
  },
  warn: (...args) => {
    try {
      if (!isShuttingDown && process.stderr && !process.stderr.destroyed) {
        console.warn(...args);
      }
    } catch (error) {
      if (error.code !== 'EPIPE') {
        throw error;
      }
    }
  }
};

let sqliteManagerInstance = null;


(async () => {
  try {
    // Initialize Logger first
    logger = new SimpleFileLogger('patients-service');
    await logger.initialize();

    await logger.info('🔍 Service startup - Database path debugging', {
      'process.env.DB_PATH': process.env.DB_PATH,
      'process.env.LOG_DIR': process.env.LOG_DIR,
      'process.execPath': process.execPath,
      'process.cwd()': process.cwd(),
      '__dirname': __dirname,
      'NODE_ENV': process.env.NODE_ENV,
      'ELECTRON_DEV': process.env.ELECTRON_DEV
    });

    console.log('🔍 Patient Service - Database Path Info:');
    console.log('  DB_PATH env var:', process.env.DB_PATH);
    console.log('  LOG_DIR env var:', process.env.LOG_DIR);
    console.log('  Current working dir:', process.cwd());
    console.log('  Script location:', __dirname);

    safeConsole.log('Patient service starting with SQLite...');
    await logger.info('Patient service starting with SQLite');


    // Initialize database
    db = await initDatabase();
    console.log("🔍 DEBUG: Actual database path being used:", process.env.DB_PATH || 'Using SQLite manager default path detection');
    const [testRows] = await db.query('SELECT COUNT(*) as count FROM patients WHERE deleted_at IS NULL');
    await logger.info('Database connection verified', {
      patientCount: testRows[0]?.count || 0,
      actualDbPath: process.env.DB_PATH || 'using initDb default path detection'
    });

    console.log(`📊 Found ${testRows[0]?.count || 0} patients in database`);
    console.log("✅ Patient service database initialized and verified.");

    const [debugRows] = await db.query('SELECT * FROM patients WHERE deleted_at IS NULL');
    console.log("🔍 DEBUG: Patients found in database:", debugRows);
    console.log("🔍 DEBUG: Number of patients:", debugRows.length);

    safeConsole.log("✅ Patient service database initialized.");
    await logger.info("Patient service database initialized successfully");

    // GET all Patients
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
        const { q } = req.query;
        await logger.info('Patient search initiated', { searchTerm: q });

        if (!q || q.trim().length === 0) {
          await logger.warn('Empty search query provided');
          return res.json([]);
        }

        const searchTerm = `%${q.trim()}%`;
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
      try {
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

    // Error handling middleware
    app.use(async (err, req, res, next) => {
      await logger.error('Unhandled error in request', err, {
        method: req.method,
        url: req.url,
        body: req.body,
        params: req.params,
        query: req.query
      });

      res.status(500).json({
        error: 'Internal server error',
        message: err.message
      });
    });

    // 404 Handler
    app.use(async (req, res) => {
      await logger.warn('404 - Route not found', {
        method: req.method,
        url: req.url
      });

      res.status(404).json({
        error: 'Route not found',
        method: req.method,
        url: req.url
      });
    });

    // Start server
    const PORT = process.env.PORT || 3001;
    const server = app.listen(PORT, async () => {
      const message = `🚀 Server running at http://localhost:${PORT}`;
      safeConsole.log(message);
      await logger.info('Server started successfully', { port: PORT });

      // Add debug info
      safeConsole.log('=== SERVER STARTUP COMPLETE ===');
      safeConsole.log('Process PID:', process.pid);
      safeConsole.log('Node version:', process.version);
      safeConsole.log('Platform:', process.platform);
      safeConsole.log('================================');
    });

    keepAlive = setInterval(() => {
      if (!isShuttingDown) {
        try {
          // Only use logger, avoid console output that can cause EPIPE
          if (logger) {
            logger.debug('Keep alive heartbeat');
          }
          // Remove console.log completely to avoid EPIPE
        } catch (error) {
          // Silently ignore all errors in keep-alive
        }
      }
    }, 30000); // Every 30 seconds

    // Handle graceful shutdown
    const gracefulShutdown = async (signal) => {
      isShuttingDown = true;
      safeConsole.log(`${signal} received, shutting down gracefully`);

      if (logger) {
        try {
          await logger.info(`${signal} received, shutting down gracefully`);
        } catch (error) {
          // Ignore logging errors during shutdown
        }
      }

      // Clear the keep alive interval
      if (keepAlive) {
        clearInterval(keepAlive);
      }

      // Close the server
      if (server) {
        server.close(() => {
          safeConsole.log('Server closed successfully');
          process.exit(0);
        });
      } else {
        process.exit(0);
      }
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    const errorMessage = "❌ Failed to initialize database:";
    safeConsole.error(errorMessage, error.message);
    if (logger) {
      try {
        await logger.error('Service initialization failed', error);
      } catch (logError) {
        // Ignore logging errors during initialization failure
      }
    }
    process.exit(1);
  }
})();

// Handle uncaught exceptions with EPIPE protection
process.on('uncaughtException', async (error) => {
  // Ignore EPIPE errors as they're expected during shutdown
  if (error.code === 'EPIPE') {
    return;
  }

  safeConsole.error('Uncaught Exception:', error);
  if (logger) {
    try {
      await logger.error('Uncaught Exception', error);
    } catch (logError) {
      // Ignore logging errors
    }
  }

  // Only exit if it's a critical error
  if (error.code === 'EADDRINUSE' || error.code === 'EACCES') {
    safeConsole.error('Critical error, shutting down...');
    process.exit(1);
  } else {
    safeConsole.log('Non-critical error, continuing...');
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', async (reason, promise) => {
  safeConsole.error('Unhandled Rejection at:', promise, 'reason:', reason);
  if (logger) {
    try {
      await logger.error('Unhandled Rejection', reason instanceof Error ? reason : new Error(reason));
    } catch (logError) {
      // Ignore logging errors
    }
  }

  safeConsole.log('Unhandled rejection logged, continuing...');
});

// Add a process warning handler
process.on('warning', (warning) => {
  safeConsole.warn('Process Warning:', warning.name, warning.message);
  if (logger) {
    try {
      logger.warn('Process Warning', { name: warning.name, message: warning.message });
    } catch (error) {
      // Ignore logging errors
    }
  }
});

// Handle SIGPIPE specifically
process.on('SIGPIPE', () => {
  // Ignore SIGPIPE - this is expected when parent process closes pipe
  isShuttingDown = true;
});