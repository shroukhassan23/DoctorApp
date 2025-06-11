const mysql = require('mysql2/promise');

async function init() {
  try {
    // الاتصال بالسيرفر بدون تحديد قاعدة بيانات
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'MyPassword123',
    });

    // إنشاء قاعدة البيانات doctor
    await connection.query('CREATE DATABASE IF NOT EXISTS doctor');
    console.log('✅ Database "doctor" created or already exists.');

    // الاتصال بقاعدة البيانات الجديدة
    const db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'MyPassword123',
      database: 'doctor'
    });

    // إنشاء جدول patient_visits
    await db.query(`
      CREATE TABLE IF NOT EXISTS patient_visits (
        id INT AUTO_INCREMENT PRIMARY KEY,
        visit_date DATE,
        visit_type VARCHAR(50),
        chief_complaint TEXT,
        diagnosis TEXT,
        notes TEXT,
        status VARCHAR(20)
      )
    `);
    console.log('✅ Table "patient_visits" created or already exists.');
const [tables] = await db.query("SHOW TABLES");
console.log(tables);
    await db.end();
    await connection.end();
  } catch (err) {
    console.error('❌ Error initializing database:', err.message);
  }
}

init();
