const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs').promises;

class SQLiteManager {
  constructor() {
    this.db = null;
    this.dbPath = null;
    this.isInitialized = false;
  }

  initializePaths(appPath) {
    // Use safe directory for database
    const { app } = require('electron');
    const userDataPath = app.getPath('userData');
    this.dbPath = path.join(userDataPath, 'doctor-app.db');
    
    console.log('SQLite Database Path:', this.dbPath);
  }

  async initializeDatabase() {
    try {
      console.log('Initializing SQLite database...');
      
      // Ensure directory exists
      const dbDir = path.dirname(this.dbPath);
      await fs.mkdir(dbDir, { recursive: true });

      // Create/open database
      this.db = new Database(this.dbPath);
      
      // Enable foreign keys and WAL mode for better performance
      this.db.pragma('journal_mode = WAL');
      this.db.pragma('foreign_keys = ON');
      this.db.pragma('synchronous = NORMAL');
      
      console.log('SQLite database initialized successfully');
      this.isInitialized = true;
      
      return true;
    } catch (error) {
      console.error('Error initializing SQLite database:', error);
      throw error;
    }
  }

  async importSchema(schemaPath) {
    try {
      await fs.access(schemaPath);
      console.log('Importing schema from:', schemaPath);

      const sqlContent = await fs.readFile(schemaPath, 'utf8');
      
      // Convert MySQL schema to SQLite
      const sqliteSchema = this.convertMySQLToSQLite(sqlContent);
      
      // Execute schema in transaction
      const transaction = this.db.transaction(() => {
        // Split by semicolon and execute each statement
        const statements = sqliteSchema
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        for (const statement of statements) {
          if (statement.trim()) {
            try {
              this.db.exec(statement);
            } catch (error) {
              // Log but don't fail on non-critical errors
              if (!error.message.includes('already exists')) {
                console.warn('Schema statement warning:', error.message);
              }
            }
          }
        }
      });

      transaction();
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
    sqliteSchema = sqliteSchema.replace(/enum\('([^']+)','([^']+)','([^']+)'\)/gi, "TEXT CHECK($column IN ('$1','$2','$3'))");
    sqliteSchema = sqliteSchema.replace(/enum\('([^']+)','([^']+)'\)/gi, "TEXT CHECK($column IN ('$1','$2'))");

    // Handle DEFAULT CURRENT_TIMESTAMP
    sqliteSchema = sqliteSchema.replace(/DEFAULT CURRENT_TIMESTAMP/gi, "DEFAULT (datetime('now'))");
    sqliteSchema = sqliteSchema.replace(/ON UPDATE CURRENT_TIMESTAMP/gi, '');

    // Remove MySQL-specific syntax
    sqliteSchema = sqliteSchema.replace(/ENGINE=InnoDB/gi, '');
    sqliteSchema = sqliteSchema.replace(/DEFAULT CHARSET=utf8mb4/gi, '');
    sqliteSchema = sqliteSchema.replace(/COLLATE=utf8mb4_unicode_ci/gi, '');
    sqliteSchema = sqliteSchema.replace(/CHARACTER SET utf8mb4/gi, '');

    // Fix the enum gender field specifically
    sqliteSchema = sqliteSchema.replace(
      /`gender` TEXT CHECK\(\$column IN \('male','female','other'\)\) DEFAULT 'other'/gi,
      "`gender` TEXT CHECK(gender IN ('male','female','other')) DEFAULT 'other'"
    );

    // Remove KEY constraints (SQLite handles them differently)
    sqliteSchema = sqliteSchema.replace(/,\s*KEY `[^`]+` \([^)]+\)/gi, '');
    sqliteSchema = sqliteSchema.replace(/,\s*UNIQUE KEY `[^`]+` \([^)]+\)/gi, '');

    // Convert INSERT statements to use proper datetime
    sqliteSchema = sqliteSchema.replace(/NOW\(\)/gi, "datetime('now')");

    return sqliteSchema;
  }

  async startDatabase() {
    try {
      if (!this.isInitialized) {
        await this.initializeDatabase();
      }

      // Import schema if tables don't exist
      const tables = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
      
      if (tables.length === 0) {
        console.log('No tables found, importing schema...');
        
        const schemaPath = process.env.ELECTRON_DEV === 'true' ?
          path.join(process.cwd(), 'dump.sql') :
          path.join(process.resourcesPath, 'dump.sql');
          
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
        this.db.prepare('SELECT 1').get();
        diagnostics.databaseConnection = true;
      }
    } catch (error) {
      console.error('Database connection test failed:', error);
    }

    try {
      // Test write permissions
      const testTable = 'CREATE TEMPORARY TABLE test_write (id INTEGER)';
      this.db.exec(testTable);
      diagnostics.writeTest = true;
    } catch (error) {
      console.error('Write test failed:', error);
    }

    try {
      // Check if main tables exist
      const tables = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='patients'").get();
      if (tables) {
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