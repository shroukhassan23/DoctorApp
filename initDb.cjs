// initDb.cjs - SQLite version
const path = require('path');

let sqliteManager = null;

async function initDatabase(config = {}) {
  try {
    // For SQLite, we ignore the MySQL config and use SQLiteManager 
    if (!sqliteManager) {
      const SQLiteManager = require('./src/utils/mysqlManager.cjs');
      sqliteManager = new SQLiteManager();
      
      // Get app path - works both in dev and production
      let appPath;
      if (process.env.ELECTRON_DEV === 'true') {
        appPath = process.cwd();
      } else {
        appPath = process.resourcesPath || path.dirname(process.execPath);
      }
      
      sqliteManager.initializePaths(appPath);
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