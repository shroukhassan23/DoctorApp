const mysql = require('mysql2/promise');

async function initDatabase(config = {}) {
  const dbConfig = {
    host: config.host || 'localhost',
    port: parseInt(config.port) || 3306,
    user: config.user || 'root',
    password: config.password || '',
    database: config.database || 'doctor',
    charset: 'utf8mb4',
    connectTimeout: 10000,
    acquireTimeout: 10000,
    timeout: 10000,
    reconnect: true
  };

  try {
    console.log(`Attempting to connect to MySQL at ${dbConfig.host}:${dbConfig.port}`);
    const connection = await mysql.createConnection(dbConfig);
    
    // Test the connection
    await connection.execute('SELECT 1');
    
    console.log(`✅ Connected to MySQL database at ${dbConfig.host}:${dbConfig.port}`);
    return connection;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    // Provide more helpful error messages
    if (error.code === 'ECONNREFUSED') {
      throw new Error(`Cannot connect to MySQL server at ${dbConfig.host}:${dbConfig.port}. Make sure MySQL is running.`);
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      throw new Error(`Access denied for user '${dbConfig.user}'. Check username and password.`);
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      throw new Error(`Database '${dbConfig.database}' does not exist.`);
    }
    
    throw error;
  }
}

module.exports = initDatabase;