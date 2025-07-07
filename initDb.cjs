// initDb.cjs - SQLite version with singleton pattern
const path = require('path');

// Singleton instance - shared across all services
let sqliteManagerInstance = null;

async function initDatabase(config = {}) {
  try {
    // Return existing instance if already initialized
    if (sqliteManagerInstance) {
      console.log('Returning existing SQLite instance');
      return {
        query: async (sql, params) => {
          return await sqliteManagerInstance.query(sql, params);
        },
        execute: async (sql, params) => {
          return await sqliteManagerInstance.query(sql, params);
        },
        end: async () => {
          // Don't close on individual service shutdown
          console.log('Service requested database closure (ignored for singleton)');
        }
      };
    }

    // Create new instance only if none exists
    let managerPath;
    if (process.env.ELECTRON_DEV === 'true') {
      managerPath = './src/utils/sqliteManager.cjs';
    } else {
      managerPath = './sqliteManager.cjs';
    }

    const SQLiteManager = require(managerPath);
    sqliteManagerInstance = new SQLiteManager();

    // Setup paths
    let appPath;
    let dbPath;

    if (process.env.DB_PATH) {
      dbPath = process.env.DB_PATH;
      appPath = path.dirname(dbPath);
    } else if (process.env.ELECTRON_DEV === 'true') {
      appPath = process.cwd();
    } else {
      appPath = process.resourcesPath || path.dirname(process.execPath);
    }

    console.log('initDb: Using app path:', appPath);
    console.log('initDb: Database path:', dbPath || 'Will be determined by SQLiteManager');

    sqliteManagerInstance.initializePaths(appPath);

    if (dbPath) {
      sqliteManagerInstance.dbPath = dbPath;
      sqliteManagerInstance.dataPath = path.dirname(dbPath);
      console.log('initDb: Overrode SQLiteManager paths with explicit DB_PATH');
    }

    await sqliteManagerInstance.startDatabase();

    // Return MySQL-compatible interface
    return {
      query: async (sql, params) => {
        return await sqliteManagerInstance.query(sql, params);
      },
      end: async () => {
        console.log('Service requested database closure (ignored for singleton)');
      }
    };

  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

// Graceful shutdown function
async function closeDatabase() {
  if (sqliteManagerInstance) {
    await sqliteManagerInstance.stopDatabase();
    sqliteManagerInstance = null;
    console.log('SQLite singleton instance closed');
  }
}

// Export both functions
module.exports = initDatabase;
module.exports.closeDatabase = closeDatabase;