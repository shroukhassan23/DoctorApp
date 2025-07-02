const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs').promises;

class SQLiteManager {
  constructor() {
    this.db = null;
    this.dbPath = null;
    this.isInitialized = false;
    this.SQL = null;
  }

  initializePaths(appPath) {
    // Use safe directory for database
    if (process.env.DB_PATH) {
      this.dataPath = path.dirname(process.env.DB_PATH);
      this.dbPath = process.env.DB_PATH;
    } else {
      // Fallback for development
      const os = require('os');
      const userDataPath = path.join(os.homedir(), 'AppData', 'Roaming', 'doctor-app-desktop');
      this.dataPath = userDataPath;
      this.dbPath = path.join(userDataPath, 'doctor-app.db');
    }
    
    console.log('SQLite Database Path:', this.dbPath);
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
      await fs.access(schemaPath);
      console.log('Importing schema from:', schemaPath);

      const sqlContent = await fs.readFile(schemaPath, 'utf8');
      
      // Convert MySQL schema to SQLite
      const sqliteSchema = this.convertMySQLToSQLite(sqlContent);
      
      // Split by semicolon and execute each statement
      const statements = sqliteSchema
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      for (const statement of statements) {
        if (statement.trim()) {
          try {
            this.db.run(statement);
          } catch (error) {
            // Log but don't fail on non-critical errors
            if (!error.message.includes('already exists')) {
              console.warn('Schema statement warning:', error.message);
            }
          }
        }
      }

      // Save database after schema import
      await this.saveDatabase();
      console.log('Schema imported successfully');
      return true;

    } catch (error) {
      console.error('Schema import failed:', error);
      throw new Error(`Schema import failed: ${error.message}`);
    }
  }

  convertMySQLToSQLite(mysqlSchema) {
    let sqliteSchema = mysqlSchema;

    // Remove MySQL-specific commands
    sqliteSchema = sqliteSchema.replace(/SET NAMES utf8mb4;/gi, '');
    sqliteSchema = sqliteSchema.replace(/SET FOREIGN_KEY_CHECKS = [01];/gi, '');
    sqliteSchema = sqliteSchema.replace(/SET SESSION sql_mode = '[^']+';/gi, '');
    sqliteSchema = sqliteSchema.replace(/CREATE DATABASE[^;]+;/gi, '');
    sqliteSchema = sqliteSchema.replace(/USE [^;]+;/gi, '');
    sqliteSchema = sqliteSchema.replace(/LOCK TABLES[^;]+;/gi, '');
    sqliteSchema = sqliteSchema.replace(/UNLOCK TABLES;/gi, '');

    // Fix PRIMARY KEY issues - replace AUTO_INCREMENT with AUTOINCREMENT
    sqliteSchema = sqliteSchema.replace(/`id` int NOT NULL AUTO_INCREMENT,[\s\S]*?PRIMARY KEY \(`id`\)/gi, '`id` INTEGER PRIMARY KEY AUTOINCREMENT');
    
    // Convert data types
    sqliteSchema = sqliteSchema.replace(/int\(\d+\)/gi, 'INTEGER');
    sqliteSchema = sqliteSchema.replace(/int NOT NULL AUTO_INCREMENT/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT');
    sqliteSchema = sqliteSchema.replace(/AUTO_INCREMENT=\d+/gi, '');
    sqliteSchema = sqliteSchema.replace(/varchar\((\d+)\)/gi, 'TEXT');
    sqliteSchema = sqliteSchema.replace(/text/gi, 'TEXT');
    sqliteSchema = sqliteSchema.replace(/date/gi, 'TEXT');
    sqliteSchema = sqliteSchema.replace(/timestamp/gi, 'TEXT');
    sqliteSchema = sqliteSchema.replace(/TIMESTAMP/gi, 'TEXT');
    sqliteSchema = sqliteSchema.replace(/decimal\(\d+,\d+\)/gi, 'REAL');
    sqliteSchema = sqliteSchema.replace(/DECIMAL\(\d+,\d+\)/gi, 'REAL');

    // Convert enum to TEXT with CHECK constraint
    sqliteSchema = sqliteSchema.replace(/enum\('male','female','other'\)/gi, "TEXT CHECK(gender IN ('male','female','other'))");
    
    // Handle DEFAULT CURRENT_TIMESTAMP
    sqliteSchema = sqliteSchema.replace(/DEFAULT CURRENT_TIMESTAMP/gi, "DEFAULT (datetime('now'))");
    sqliteSchema = sqliteSchema.replace(/ON UPDATE CURRENT_TIMESTAMP/gi, '');

    // Remove MySQL-specific syntax
    sqliteSchema = sqliteSchema.replace(/ENGINE=InnoDB/gi, '');
    sqliteSchema = sqliteSchema.replace(/DEFAULT CHARSET=utf8mb4/gi, '');
    sqliteSchema = sqliteSchema.replace(/COLLATE=utf8mb4_unicode_ci/gi, '');
    sqliteSchema = sqliteSchema.replace(/CHARACTER SET utf8mb4/gi, '');

    // Remove ALL KEY constraints (SQLite handles them as CREATE INDEX separately)
    sqliteSchema = sqliteSchema.replace(/,\s*KEY `[^`]+` \([^)]+\)/gi, '');
    sqliteSchema = sqliteSchema.replace(/,\s*UNIQUE KEY `[^`]+` \([^)]+\)/gi, '');
    sqliteSchema = sqliteSchema.replace(/,\s*CONSTRAINT `[^`]+` FOREIGN KEY[^,)]+/gi, '');

    // Remove FOREIGN KEY constraints from table definitions (add them separately later)
    sqliteSchema = sqliteSchema.replace(/,\s*FOREIGN KEY[^,)]+/gi, '');

    // Convert INSERT statements to use proper datetime
    sqliteSchema = sqliteSchema.replace(/NOW\(\)/gi, "datetime('now')");

    // Clean up extra commas and spaces
    sqliteSchema = sqliteSchema.replace(/,(\s*\))/gi, '$1');
    sqliteSchema = sqliteSchema.replace(/,\s*,/gi, ',');

    return sqliteSchema;
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
        
        let schemaPath;
        if (process.env.ELECTRON_DEV === 'true') {
          schemaPath = path.join(process.cwd(), 'dump.sql');
        } else {
          // In production, dump.sql should be in the same directory as other service files
          schemaPath = path.join(path.dirname(__filename), 'dump.sql');
        }
          
        await this.importSchema(schemaPath);
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