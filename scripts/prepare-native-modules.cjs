#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Preparing native modules for packaging...');

// Get Node.js version
const nodeVersion = process.version;
console.log(`📋 Current Node.js version: ${nodeVersion}`);

// Create dist-native directory
const distNativeDir = path.join(process.cwd(), 'dist-native');
if (!fs.existsSync(distNativeDir)) {
  fs.mkdirSync(distNativeDir, { recursive: true });
  console.log('📁 Created dist-native directory');
}

try {
  console.log('🔍 Checking better-sqlite3 installation...');
  
  // Test if better-sqlite3 is working
  try {
    const Database = require('better-sqlite3');
    const testDb = new Database(':memory:');
    testDb.exec('CREATE TABLE test (id INTEGER)');
    testDb.close();
    console.log('✅ better-sqlite3 is working correctly!');
  } catch (error) {
    console.log('⚠️ better-sqlite3 not working, rebuilding...');
    
    // Rebuild better-sqlite3
    console.log('🔨 Rebuilding better-sqlite3...');
    execSync('npm rebuild better-sqlite3', { 
      stdio: 'inherit',
      env: {
        ...process.env,
        npm_config_build_from_source: 'true'
      }
    });
    
    // Test again
    const Database = require('better-sqlite3');
    const testDb = new Database(':memory:');
    testDb.exec('CREATE TABLE test (id INTEGER)');
    testDb.close();
    console.log('✅ better-sqlite3 rebuild successful!');
  }

  // Copy better-sqlite3 to dist-native for packaging
  console.log('📦 Copying better-sqlite3 for packaging...');
  const sourcePath = path.join(process.cwd(), 'node_modules', 'better-sqlite3');
  const destPath = path.join(distNativeDir, 'better-sqlite3');
  
  // Remove existing copy
  if (fs.existsSync(destPath)) {
    fs.rmSync(destPath, { recursive: true, force: true });
  }
  
  // Copy the module
  if (process.platform === 'win32') {
    execSync(`xcopy "${sourcePath}" "${destPath}" /E /I /Y /Q`, { stdio: 'inherit' });
  } else {
    execSync(`cp -r "${sourcePath}" "${destPath}"`, { stdio: 'inherit' });
  }
  
  console.log('✅ Native modules prepared successfully!');
  
  // Final verification
  console.log('🔍 Final verification...');
  const Database = require('better-sqlite3');
  const testDb = new Database(':memory:');
  testDb.exec('CREATE TABLE final_test (id INTEGER PRIMARY KEY, name TEXT)');
  testDb.exec('INSERT INTO final_test (name) VALUES (?)', ['test']);
  const result = testDb.prepare('SELECT * FROM final_test').all();
  testDb.close();
  
  if (result.length > 0) {
    console.log('✅ Final verification successful!');
    console.log('🚀 Ready for Electron packaging!');
  } else {
    throw new Error('Final verification failed');
  }

} catch (error) {
  console.error('❌ Error preparing native modules:', error.message);
  console.log('\n🔧 Troubleshooting tips:');
  console.log('1. Install Visual Studio Build Tools: npm install --global windows-build-tools');
  console.log('2. Install Python: https://www.python.org/downloads/');
  console.log('3. Clear cache: npm cache clean --force');
  console.log('4. Delete node_modules and reinstall: rm -rf node_modules && npm install');
  process.exit(1);
}