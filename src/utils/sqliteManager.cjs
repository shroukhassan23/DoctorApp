const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs').promises;
const SimpleFileLogger = require('./fileLog.cjs');

class SQLiteManager {
  constructor() {
    this.db = null;
    this.dbPath = null;
    this.isInitialized = false;
    this.SQL = null;
    this.logger = new SimpleFileLogger('sqlite-manager');
  }

  initializePaths(appPath) {
    // FIXED: Use environment variable or explicit path instead of os.homedir()
    if (process.env.DB_PATH) {
      // Use explicit database path from environment
      this.dbPath = process.env.DB_PATH;
      this.dataPath = path.dirname(this.dbPath);
    } else if (appPath) {
      // Use application path for database
      this.dataPath = path.join(appPath, 'data');
      this.dbPath = path.join(this.dataPath, 'doctor-app.db');
    } else {
      // Fallback: use current executable directory
      const fallbackPath = path.join(path.dirname(process.execPath), 'data');
      this.dataPath = fallbackPath;
      this.dbPath = path.join(fallbackPath, 'doctor-app.db');
    }
    
    console.log('SQLite Database Path:', this.dbPath);
    console.log('SQLite Data Directory:', this.dataPath);
  }

  async initializeDatabase() {
    try {
      console.log('Initializing SQLite database...');
      
      // Initialize sql.js
      this.SQL = await initSqlJs();
      
      // Ensure directory exists
      const dbDir = path.dirname(this.dbPath);
      await fs.mkdir(dbDir, { recursive: true });

      // Try to load existing database
      let filebuffer;
      try {
        filebuffer = await fs.readFile(this.dbPath);
        this.db = new this.SQL.Database(filebuffer);
        console.log('Loaded existing SQLite database');
      } catch (error) {
        // Create new database
        this.db = new this.SQL.Database();
        console.log('Created new SQLite database');
      }
      
      // Enable foreign keys
      this.db.run('PRAGMA foreign_keys = ON');
      
      console.log('SQLite database initialized successfully');
      this.isInitialized = true;
      
      return true;
    } catch (error) {
      console.error('Error initializing SQLite database:', error);
      throw error;
    }
  }

  async saveDatabase() {
    try {
      if (this.db) {
        const data = this.db.export();
        await fs.writeFile(this.dbPath, Buffer.from(data));
      }
    } catch (error) {
      console.error('Error saving database:', error);
    }
  }

  async importSchema(schemaPath) {
    try {
      // FIXED: Use only dump.sql (not dump-sqlite.sql)
      let actualSchemaPath;
      if (process.env.ELECTRON_DEV === 'true') {
        actualSchemaPath = path.join(process.cwd(), 'dump.sql');
        if (this.logger) await this.logger.info("Development schema path: " + actualSchemaPath);
      } else {
        // In production, look for dump.sql in resources
        const possiblePaths = [
          path.join(process.resourcesPath, 'dump.sql'),
          path.join(path.dirname(__filename), 'dump.sql'),
          path.join(path.dirname(process.execPath), 'resources', 'dump.sql'),
          path.join(path.dirname(process.execPath), 'dump.sql'),
          // Add current working directory as fallback
          path.join(process.cwd(), 'dump.sql'),
          // Add relative path from current script location
          path.join(__dirname, '..', 'dump.sql'),
          path.join(__dirname, 'dump.sql')
        ];
        
        console.log('🔍 Searching for dump.sql in these locations:');
        for (const testPath of possiblePaths) {
          console.log(`  - ${testPath}`);
          try {
            await fs.access(testPath);
            actualSchemaPath = testPath;
            console.log(`  ✅ Found at: ${testPath}`);
            break;
          } catch (e) {
            console.log(`  ❌ Not found`);
            // Continue searching
          }
        }
        
        if (!actualSchemaPath) {
          throw new Error(`dump.sql not found in any expected location. Searched paths:\n${possiblePaths.join('\n')}`);
        }
        
        if (this.logger) await this.logger.info("Production schema path: " + actualSchemaPath);
      }
      
      console.log('📄 Reading schema from:', actualSchemaPath);
      const sqlContent = await fs.readFile(actualSchemaPath, 'utf8');
      
      // REMOVED: No need to convert - dump.sql is already SQLite format
      console.log('📄 Using native SQLite schema (no conversion needed)');
      
      // Split by semicolon and execute each statement
      const statements = sqlContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      console.log(`📊 Executing ${statements.length} SQL statements...`);
      let successCount = 0;
      let skipCount = 0;

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
              console.warn('Statement:', statement.substring(0, 100) + '...');
            }
          }
        }
      }

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
      const tables = this.db.exec("SELECT name FROM sqlite_master WHERE type='table'");
      
      if (!tables.length || tables[0].values.length === 0) {
        console.log('No tables found, importing schema...');
        await this.importSchema(); // Schema path will be determined internally
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

  // Helper method to create MySQL-compatible interface
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
      this.db.run('CREATE TEMPORARY TABLE test_write (id INTEGER)');
      diagnostics.writeTest = true;
    } catch (error) {
      console.error('Write test failed:', error);
    }

    try {
      // Check if main tables exist
      const tables = this.db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='patients'");
      if (tables.length > 0 && tables[0].values.length > 0) {
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