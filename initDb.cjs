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

    if (process.env.INSTALL_PATH) {
      // Priority 1: Installation directory
      appPath = process.env.INSTALL_PATH;
      dbPath = path.join(appPath, 'data', 'doctor-app.db');
    } else if (process.env.DB_PATH) {
      // Priority 2: Explicit DB path
      dbPath = process.env.DB_PATH;
      appPath = path.dirname(path.dirname(dbPath)); // Go up to installation root
    } else if (process.env.ELECTRON_DEV === 'true') {
      // Priority 3: Development mode
      appPath = process.cwd();
      dbPath = path.join(appPath, 'data', 'doctor-app.db');
    } else {
      // Priority 4: Fallback
      appPath = 'C:\\Program Files\\DoctorApp';
      dbPath = path.join(appPath, 'data', 'doctor-app.db');
    }

    const dataDir = path.dirname(dbPath);
    if (!require('fs').existsSync(dataDir)) {
        require('fs').mkdirSync(dataDir, { recursive: true });
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