#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Preparing native modules for packaging...');

// Get Node.js version that will be bundled
const nodeVersion = process.version;
console.log(`📋 Current Node.js version: ${nodeVersion}`);

// Create dist-native directory
const distNativeDir = path.join(process.cwd(), 'dist-native');
if (!fs.existsSync(distNativeDir)) {
  fs.mkdirSync(distNativeDir, { recursive: true });
}

try {
  // Step 1: Clean any existing builds
  console.log('🧹 Cleaning existing builds...');
  try {
    execSync('npm uninstall better-sqlite3', { stdio: 'inherit' });
  } catch (e) {
    // Ignore if not installed
  }

  // Step 2: Install better-sqlite3 and rebuild for current Node.js version
  console.log('📦 Installing and rebuilding better-sqlite3...');
  execSync('npm install better-sqlite3 --build-from-source', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      npm_config_build_from_source: 'true',
      npm_config_sqlite3_binary_host_mirror: ''
    }
  });

  // Step 3: Copy the built module to dist-native
  console.log('📁 Copying built module to dist-native...');
  const sourcePath = path.join(process.cwd(), 'node_modules', 'better-sqlite3');
  const destPath = path.join(distNativeDir, 'better-sqlite3');
  
  // Copy the entire better-sqlite3 module
  execSync(`xcopy "${sourcePath}" "${destPath}" /E /I /Y`, { stdio: 'inherit' });
  
  console.log('✅ Native modules prepared successfully!');
  
  // Step 4: Verify the build
  console.log('🔍 Verifying build...');
  const Database = require('better-sqlite3');
  const testDb = new Database(':memory:');
  testDb.exec('CREATE TABLE test (id INTEGER)');
  testDb.close();
  console.log('✅ Build verification successful!');

} catch (error) {
  console.error('❌ Error preparing native modules:', error.message);
  process.exit(1);
}