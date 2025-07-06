// initDb.cjs - SQLite version
const path = require('path');

let sqliteManager = null;

async function initDatabase(config = {}) {
  try {
    // For SQLite, we ignore the MySQL config and use SQLiteManager 
    if (!sqliteManager) {
      let managerPath;
      if (process.env.ELECTRON_DEV === 'true') {
        managerPath = './src/utils/sqliteManager.cjs';
      } else {
        // In production, copy sqliteManager.cjs to same directory as initDb.cjs
        managerPath = './sqliteManager.cjs';
      }
      const SQLiteManager = require(managerPath);
      sqliteManager = new SQLiteManager();

      // FIXED: Get app path and database path from environment or fallback
      let appPath;
      let dbPath;
      
      if (process.env.DB_PATH) {
        // Use explicit database path from environment
        dbPath = process.env.DB_PATH;
        appPath = path.dirname(dbPath);
      } else if (process.env.ELECTRON_DEV === 'true') {
        // Development mode
        appPath = process.cwd();
      } else {
        // Production mode - use resources or executable directory
        appPath = process.resourcesPath || path.dirname(process.execPath);
      }

      console.log('initDb: Using app path:', appPath);
      console.log('initDb: Database path:', dbPath || 'Will be determined by SQLiteManager');

      sqliteManager.initializePaths(appPath);
      
      // If we have an explicit DB path, override the manager's path
      if (dbPath) {
        sqliteManager.dbPath = dbPath;
        sqliteManager.dataPath = path.dirname(dbPath);
        console.log('initDb: Overrode SQLiteManager paths with explicit DB_PATH');
      }
      
      await sqliteManager.startDatabase();
    }

    // Return a MySQL-compatible interface
    return {
      query: async (sql, params) => {
        return await sqliteManager.query(sql, params);
      },

      // Add any other methods your services use
      end: async () => {
        await sqliteManager.stopDatabase();
      },

      // For backward compatibility
      execute: async (sql, params) => {
        return await sqliteManager.query(sql, params);
      }
    };

  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

module.exports = initDatabase;