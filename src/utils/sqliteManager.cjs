const Database = require('better-sqlite3');
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

  initializePaths(appPath) {
    // Use environment variable or explicit path
    if (process.env.DB_PATH) {
      this.dbPath = process.env.DB_PATH;
      this.dataPath = path.dirname(this.dbPath);
    } else if (appPath) {
      this.dataPath = path.join(appPath, 'data');
      this.dbPath = path.join(this.dataPath, 'doctor-app.db');
    } else {
      const fallbackPath = path.join(path.dirname(process.execPath), 'data');
      this.dataPath = fallbackPath;
      this.dbPath = path.join(fallbackPath, 'doctor-app.db');
    }
    
    console.log('SQLite Database Path:', this.dbPath);
    console.log('SQLite Data Directory:', this.dataPath);
  }

  async initializeDatabase() {
    try {
      console.log('Initializing SQLite database with better-sqlite3...');
      
      // Ensure directory exists
      const dbDir = path.dirname(this.dbPath);
      await fs.mkdir(dbDir, { recursive: true });

      // Create database connection with better-sqlite3
      this.db = new Database(this.dbPath, {
        verbose: console.log, // Remove in production
        fileMustExist: false
      });
      
      // Enable WAL mode for better concurrency
      this.db.pragma('journal_mode = WAL');
      this.db.pragma('foreign_keys = ON');
      this.db.pragma('synchronous = NORMAL');
      
      console.log('SQLite database initialized successfully with better-sqlite3');
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
          process.resourcesPath ? path.join(process.resourcesPath, 'dump.sql') : null,
          path.join(path.dirname(process.execPath), 'dump.sql')
        ].filter(Boolean);
        
        for (const testPath of possiblePaths) {
          try {
            await fs.access(testPath);
            actualSchemaPath = testPath;
            break;
          } catch (e) {
            // Continue searching
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

      // Use transaction for better performance and consistency
      const transaction = this.db.transaction((statements) => {
        for (const statement of statements) {
          if (statement.trim()) {
            try {
              this.db.exec(statement);
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
      });

      transaction(statements);
      
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
      const tables = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
      
      if (tables.length === 0) {
        console.log('No tables found, importing schema...');
        await this.importSchema();
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

  // MySQL-compatible interface
  async query(sql, params = []) {
    try {
      const db = this.getDatabase();
      
      // Handle SELECT queries
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        const stmt = db.prepare(sql);
        const rows = stmt.all(params);
        return [rows]; // Return in MySQL format [rows, fields]
      }
      
      // Handle INSERT/UPDATE/DELETE queries
      const stmt = db.prepare(sql);
      const result = stmt.run(params);
      
      return [{
        affectedRows: result.changes,
        insertId: result.lastInsertRowid
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
      schemaLoaded: false
    };

    try {
      // Check if database file exists
      await fs.access(this.dbPath);
      diagnostics.databaseFile = true;
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
      }
    } catch (error) {
      console.error('Schema check failed:', error);
    }

    console.log('SQLite Diagnostics:', diagnostics);
    return diagnostics;
  }
}

module.exports = SQLiteManager;