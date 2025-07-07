// #!/usr/bin/env node

console.log('🔧 Preparing modules for sql.js...');

// Since we're using sql.js (no native modules), just ensure it's installed
const fs = require('fs');
const path = require('path');

try {
  // Test if sql.js is available
  const sqlJs = require('sql.js');
  console.log('✅ sql.js is available and ready!');
  
  // Create dist-native directory for consistency
  const distNativeDir = path.join(process.cwd(), 'dist-native');
  if (!fs.existsSync(distNativeDir)) {
    fs.mkdirSync(distNativeDir, { recursive: true });
  }
  
  // Create a marker file
  fs.writeFileSync(path.join(distNativeDir, 'sql-js-ready.txt'), 'sql.js is ready for packaging');
  
  console.log('✅ No native modules needed - using sql.js!');
  console.log('🚀 Ready for Electron packaging!');
  
} catch (error) {
  console.error('❌ sql.js not found:', error.message);
  console.log('Installing sql.js...');
  const { execSync } = require('child_process');
  execSync('npm install sql.js', { stdio: 'inherit' });
  console.log('✅ sql.js installed successfully!');
}