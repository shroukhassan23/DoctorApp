const path = require('path');
const fs = require('fs').promises;
const SimpleFileLogger = require('./fileLog.cjs');

class SQLiteManager {
  constructor() {
    this.db = null;
    this.dbPath = null;
    this.isInitialized = false;
    this.logger = new SimpleFileLogger('sqlite-manager');
  }

  initializePaths(installPath) {
    if (process.env.DB_PATH) {
      this.dbPath = process.env.DB_PATH;
      this.dataPath = path.dirname(this.dbPath);
    } else if (installPath) {
      this.dataPath = path.join(installPath, 'data');
      this.dbPath = path.join(this.dataPath, 'doctor-app.db');
    } else {
      // Fallback: use executable directory
      const fallbackPath = path.join(path.dirname(process.execPath), 'data');
      this.dataPath = fallbackPath;
      this.dbPath = path.join(fallbackPath, 'doctor-app.db');
    }

    console.log('SQLite Database Path:', this.dbPath);
    console.log('SQLite Data Directory:', this.dataPath);
  }

  async saveDatabase() {
    try {
      if (this.db && this.SQL) {
        // Add file locking mechanism
        const lockFile = this.dbPath + '.lock';

        // Check if another process is writing
        try {
          await fs.access(lockFile);
          console.log('Database is being written by another process, skipping save');
          return;
        } catch (error) {
          // Lock file doesn't exist, we can proceed
        }

        // Create lock file
        await fs.writeFile(lockFile, process.pid.toString());

        try {
          const data = this.db.export();
          await fs.writeFile(this.dbPath, Buffer.from(data));
          console.log('💾 Database saved successfully');
        } finally {
          // Always remove lock file
          try {
            await fs.unlink(lockFile);
          } catch (error) {
            // Ignore errors when removing lock file
          }
        }
      }
    } catch (error) {
      console.error('Error saving database:', error);
    }
  }

  async initializeDatabase() {
    try {
      console.log('Initializing SQLite database with sql.js...');

      // Initialize sql.js
      const initSqlJs = require('sql.js');
      this.SQL = await initSqlJs();

      // Ensure directory exists
      const dbDir = path.dirname(this.dbPath);
      await fs.mkdir(dbDir, { recursive: true });

      // Try to load existing database
      let filebuffer;
      try {
        filebuffer = await fs.readFile(this.dbPath);
        this.db = new this.SQL.Database(filebuffer);
        console.log('✅ Loaded existing SQLite database');
      } catch (error) {
        // Create new database
        this.db = new this.SQL.Database();
        console.log('✅ Created new SQLite database');
      }

      // Enable foreign keys
      this.db.run('PRAGMA foreign_keys = ON');

      console.log('SQLite database initialized successfully with sql.js');
      this.isInitialized = true;

      return true;
    } catch (error) {
      console.error('Error initializing SQLite database:', error);
      throw error;
    }
  }

  async importSchema(schemaPath) {
    try {
      let actualSchemaPath;
      if (process.env.ELECTRON_DEV === 'true') {
        actualSchemaPath = path.join(process.cwd(), 'dump.sql');
      } else {
        // Search for dump.sql in production
        const possiblePaths = [
          path.join(__dirname, 'dump.sql'),
          path.join(process.cwd(), 'dump.sql'),
          process.resourcesPath ? path.join(process.resourcesPath, 'app', 'src', 'utils', 'dump.sql') : null,
          process.resourcesPath ? path.join(process.resourcesPath, 'dump.sql') : null,
          path.join(path.dirname(process.execPath), 'dump.sql')
        ].filter(Boolean);

        for (const testPath of possiblePaths) {
          try {
            await fs.access(testPath);
            actualSchemaPath = testPath;
            console.log(`✅ Found schema at: ${testPath}`);
            break;
          } catch (e) {
            console.log(`❌ Schema not found at: ${testPath}`);
          }
        }

        if (!actualSchemaPath) {
          throw new Error(`dump.sql not found in any expected location`);
        }
      }

      console.log('📄 Reading schema from:', actualSchemaPath);
      const sqlContent = await fs.readFile(actualSchemaPath, 'utf8');

      // Split by semicolon and execute each statement
      const statements = sqlContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      console.log(`📊 Executing ${statements.length} SQL statements...`);
      let successCount = 0;
      let skipCount = 0;

      // Use individual statements for sql.js (no transactions)
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            this.db.run(statement);
            successCount++;
          } catch (error) {
            if (error.message.includes('already exists')) {
              skipCount++;
            } else {
              console.warn('Schema statement warning:', error.message);
            }
          }
        }
      }

      // Save after schema import
      await this.saveDatabase();

      console.log(`✅ SQLite schema imported successfully: ${successCount} executed, ${skipCount} skipped`);
      return true;

    } catch (error) {
      console.error('Schema import failed:', error);
      throw new Error(`Schema import failed: ${error.message}`);
    }
  }

  async startDatabase() {
    try {
      if (!this.isInitialized) {
        await this.initializeDatabase();
      }

      // Check if tables exist
      const result = this.db.exec("SELECT name FROM sqlite_master WHERE type='table'");
      const tables = result.length > 0 ? result[0].values : [];

      if (tables.length === 0) {
        console.log('No tables found, importing schema...');
        await this.importSchema();
      } else {
        console.log(`✅ Found ${tables.length} tables in database`);
      }

      console.log('SQLite database is ready');
      return true;

    } catch (error) {
      console.error('Error starting SQLite database:', error);
      throw error;
    }
  }

  async stopDatabase() {
    try {
      if (this.db) {
        await this.saveDatabase();
        this.db.close();
        this.db = null;
        console.log('SQLite database closed');
      }
      return true;
    } catch (error) {
      console.error('Error closing SQLite database:', error);
      throw error;
    }
  }

  getDatabase() {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  async query(sql, params = []) {
    try {
      const db = this.getDatabase();

      // Handle SELECT queries
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        const stmt = db.prepare(sql);
        const rows = [];

        stmt.bind(params);
        while (stmt.step()) {
          const row = stmt.getAsObject();
          rows.push(row);
        }
        stmt.free();

        // Auto-save after any query that might modify data
        await this.saveDatabase();

        return [rows]; // Return in MySQL format [rows, fields]
      }

      // Handle INSERT/UPDATE/DELETE queries
      const stmt = db.prepare(sql);
      stmt.bind(params);
      stmt.step();

      const changes = db.getRowsModified();
      const lastInsertId = db.exec("SELECT last_insert_rowid() as id")[0]?.values[0]?.[0] || 0;

      stmt.free();

      // Auto-save after modifications
      await this.saveDatabase();

      return [{
        affectedRows: changes,
        insertId: lastInsertId
      }];

    } catch (error) {
      console.error('Database query error:', error);
      console.error('SQL:', sql);
      console.error('Params:', params);
      throw error;
    }
  }

  async diagnoseIssues() {
    const diagnostics = {
      databaseFile: false,
      databaseConnection: false,
      writeTest: false,
      schemaLoaded: false,
      dbPath: this.dbPath
    };

    try {
      // Check if database file exists
      await fs.access(this.dbPath);
      diagnostics.databaseFile = true;

      // Get file stats
      const stats = await fs.stat(this.dbPath);
      diagnostics.fileSize = stats.size;
      diagnostics.lastModified = stats.mtime;

    } catch (error) {
      console.log('Database file does not exist yet');
    }

    try {
      // Test database connection
      if (this.db) {
        this.db.exec('SELECT 1');
        diagnostics.databaseConnection = true;
      }
    } catch (error) {
      console.error('Database connection test failed:', error);
    }

    try {
      // Test write permissions
      this.db.exec('CREATE TEMPORARY TABLE test_write (id INTEGER)');
      diagnostics.writeTest = true;
    } catch (error) {
      console.error('Write test failed:', error);
    }

    try {
      // Check if main tables exist
      const tables = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='patients'").all();
      if (tables.length > 0) {
        diagnostics.schemaLoaded = true;

        // Get row counts
        const patientCount = this.db.prepare("SELECT COUNT(*) as count FROM patients").get();
        const visitCount = this.db.prepare("SELECT COUNT(*) as count FROM visits").get();
        diagnostics.patientCount = patientCount.count;
        diagnostics.visitCount = visitCount.count;
      }
    } catch (error) {
      console.error('Schema check failed:', error);
    }

    console.log('SQLite Diagnostics:', diagnostics);
    return diagnostics;
  }
}

module.exports = SQLiteManager;