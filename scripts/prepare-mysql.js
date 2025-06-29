// scripts/prepare-mysql.js (Updated for ES modules)
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MySQLPreparation {
  constructor() {
    this.resourcesDir = path.join(__dirname, '..', 'mysql-resources');
    this.platform = process.platform;
  }

  async prepareMySQLBinaries() {
    console.log('🔧 Preparing MySQL binaries...');
    
    try {
      // Create mysql-resources directory
      await fs.promises.mkdir(this.resourcesDir, { recursive: true });

      if (this.platform === 'darwin') {
        await this.prepareMacMySQL();
      } else if (this.platform === 'win32') {
        await this.prepareWindowsMySQL();
      }

      console.log('✅ MySQL binaries prepared successfully');
    } catch (error) {
      console.error('❌ Error preparing MySQL binaries:', error);
      throw error;
    }
  }

  async prepareMacMySQL() {
    const macMySQLDir = path.join(this.resourcesDir, 'mysql-macos');
    
    // Check if MySQL binaries already exist
    if (fs.existsSync(macMySQLDir)) {
      console.log('📁 macOS MySQL binaries already exist');
      return;
    }

    console.log('📦 Extracting macOS MySQL binaries...');
    
    // Look for the downloaded MySQL tar.gz file
    const possibleFiles = [
      'mysql-9.3.0-macos15-arm64.tar.gz',
      'mysql-8.0.*-macos*.tar.gz'
    ];

    let mysqlArchive = null;
    const currentDir = process.cwd();
    
    for (const pattern of possibleFiles) {
      const files = fs.readdirSync(currentDir).filter(f => f.match(pattern.replace('*', '.*')));
      if (files.length > 0) {
        mysqlArchive = files[0];
        break;
      }
    }

    if (!mysqlArchive) {
      console.warn('⚠️  MySQL archive not found. Please download MySQL Community Server for macOS');
      console.log('📥 Download from: https://dev.mysql.com/downloads/mysql/');
      console.log('📥 Choose: macOS, Compressed TAR Archive');
      return;
    }

    try {
      // Extract the archive
      console.log(`📂 Extracting ${mysqlArchive}...`);
      execSync(`tar -xzf ${mysqlArchive}`, { stdio: 'inherit', cwd: currentDir });

      // Find the extracted directory
      const extractedDir = fs.readdirSync(currentDir).find(d => 
        d.startsWith('mysql-') && fs.statSync(path.join(currentDir, d)).isDirectory() && d !== 'mysql-resources'
      );

      if (extractedDir) {
        // Move to resources directory
        const extractedPath = path.join(currentDir, extractedDir);
        execSync(`mv "${extractedPath}" "${macMySQLDir}"`, { stdio: 'inherit' });
        console.log('✅ macOS MySQL binaries prepared');
      }
    } catch (error) {
      console.error('❌ Error extracting MySQL:', error.message);
    }
  }

  async prepareWindowsMySQL() {
    const winMySQLDir = path.join(this.resourcesDir, 'mysql-windows');
    
    // Check if MySQL binaries already exist
    if (fs.existsSync(winMySQLDir)) {
      console.log('📁 Windows MySQL binaries already exist');
      return;
    }

    console.log('📦 Windows MySQL binaries need to be prepared...');
    console.warn('⚠️  Please download MySQL Community Server for Windows');
    console.log('📥 Download from: https://dev.mysql.com/downloads/mysql/');
    console.log('📥 Choose: Windows (x86, 64-bit), ZIP Archive');
    console.log('📥 Extract to: mysql-resources/mysql-windows/');
    
    // Create placeholder directory
    await fs.promises.mkdir(winMySQLDir, { recursive: true });
    
    // Create instruction file
    const instructionFile = path.join(winMySQLDir, 'INSTRUCTIONS.txt');
    const instructions = `
Windows MySQL Setup Instructions:

1. Download MySQL Community Server from:
   https://dev.mysql.com/downloads/mysql/

2. Choose: Windows (x86, 64-bit), ZIP Archive
   (NOT the MSI installer)

3. Extract the downloaded ZIP file

4. Copy the contents to this directory:
   ${winMySQLDir}

5. The directory structure should look like:
   mysql-windows/
   ├── bin/
   │   ├── mysqld.exe
   │   ├── mysql.exe
   │   └── ...
   ├── lib/
   ├── share/
   └── ...

6. Run the build command again after setting up MySQL binaries.
`;

    await fs.promises.writeFile(instructionFile, instructions);
    console.log(`📝 Instructions written to: ${instructionFile}`);
  }

  async validateMySQLBinaries() {
    console.log('🔍 Validating MySQL binaries...');

    const platforms = [
      { name: 'macOS', dir: 'mysql-macos', executable: 'mysqld' },
      { name: 'Windows', dir: 'mysql-windows', executable: 'mysqld.exe' }
    ];

    for (const platform of platforms) {
      const binDir = path.join(this.resourcesDir, platform.dir, 'bin');
      const executablePath = path.join(binDir, platform.executable);

      if (fs.existsSync(executablePath)) {
        console.log(`✅ ${platform.name} MySQL binaries found`);
      } else {
        console.warn(`⚠️  ${platform.name} MySQL binaries missing`);
        console.log(`   Expected: ${executablePath}`);
      }
    }
  }

  async createBuildIcons() {
    console.log('🎨 Creating build icons directory...');
    
    const buildDir = path.join(__dirname, '..', 'build');
    await fs.promises.mkdir(buildDir, { recursive: true });

    // Create placeholder icon files if they don't exist
    const iconFiles = [
      { name: 'icon.ico', content: 'Windows icon placeholder' },
      { name: 'icon.icns', content: 'macOS icon placeholder' },
      { name: 'icon.png', content: 'Linux icon placeholder' }
    ];

    for (const icon of iconFiles) {
      const iconPath = path.join(buildDir, icon.name);
      if (!fs.existsSync(iconPath)) {
        await fs.promises.writeFile(iconPath, icon.content);
        console.log(`📝 Created placeholder: ${icon.name}`);
      }
    }

    console.log('💡 Note: Replace placeholder icons with actual application icons');
  }
}

// Run if called directly
const preparation = new MySQLPreparation();

preparation.prepareMySQLBinaries()
  .then(() => preparation.validateMySQLBinaries())
  .then(() => preparation.createBuildIcons())
  .then(() => {
    console.log('🎉 MySQL preparation completed');
  })
  .catch((error) => {
    console.error('💥 MySQL preparation failed:', error);
    process.exit(1);
  });