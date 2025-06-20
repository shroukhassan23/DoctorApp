const fs = require('fs');
const mysql = require('mysql2/promise');
const path = require('path');

async function initDatabase() {
  let connection = null;
  try {
    console.log("🚀 Running init.js...");

    // Create database if not exists
    connection = await mysql.createConnection({
      host: '147.182.180.167',
      user: 'sa',
      password: 'P@ssw0rd',
      database: 'doctor2',

      multipleStatements: true,
    });


    await connection.query(`CREATE DATABASE IF NOT EXISTS doctor2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log('✅ Database "doctor2" created or already exists.');
    await connection.end();

    // Connect to the database
    connection = await mysql.createConnection({
      host: '147.182.180.167',
      user: 'sa',
      password: 'P@ssw0rd',
      database: 'doctor2',
      multipleStatements: true,
    });

    console.log('🔄 Connected to doctor2 database...');

    // 👇 Check if table "patients" already exists
    const [tables] = await connection.query(`SHOW TABLES LIKE 'patients'`);
    const tableExists = tables.length > 0;

    if (!tableExists) {
      console.log('📂 Table "patients" not found. Executing SQL initialization...');

      const sqlPath = path.join(__dirname, 'mySql', 'init.sql');
      if (!fs.existsSync(sqlPath)) {
        throw new Error(`SQL file not found at: ${sqlPath}`);
      }

      const sql = fs.readFileSync(sqlPath, 'utf8');
      const statements = sql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);

      console.log(`📊 Found ${statements.length} SQL statements to execute...`);

      for (let i = 0; i < statements.length; i++) {
        await connection.query(statements[i]);
        if ((i + 1) % 10 === 0) {
          console.log(`⏳ Executed ${i + 1}/${statements.length} statements...`);
        }
      }

      console.log('✅ SQL initialization completed!');
      
    } else {
      console.log('✅ Table "patients" already exists. Skipping SQL init.');
    }

    return connection;
  } catch (err) {
    console.error('❌ Database init error:', err.message);
    throw err;
  }
}

module.exports = initDatabase;
