// create-db.js
const mysql = require('mysql2/promise');

// اتصال بـ MySQL
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'MyPassword123',
  database: 'doctor',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function testConnection() {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS result');
    console.log('✅ MySQL Connected! Result =', rows[0].result);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();
module.exports=db;
