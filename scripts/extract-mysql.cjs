const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

const rootDir = process.cwd();
const resourcesDir = path.join(rootDir, 'mysql-resources');

class MySQLExtractor {
  constructor() {
    this.platform = os.platform();
    this.isWindows = this.platform === 'win32';
    this.isMac = this.platform === 'darwin';
  }

  async extractMySQL() {
    console.log('🔧 Extracting MySQL binaries...');
    
    // Create mysql-resources directory
    await fs.promises.mkdir(resourcesDir, { recursive: true });

    // Look for MySQL archives in root directory
    const files = fs.readdirSync(rootDir);
    
    // Extract Windows MySQL
    await this.extractWindowsMySQL(files);
    
    // Extract macOS MySQL
    await this.extractMacMySQL(files);

    console.log('✅ MySQL extraction completed');
  }

  async extractWindowsMySQL(files) {
    const winArchives = files.filter(f => 
      f.includes('mysql') && 
      (f.includes('win') || f.includes('windows')) && 
      f.endsWith('.zip')
    );

    if (winArchives.length === 0) {
      console.log('⚠️  No Windows MySQL archive found');
      await this.createWindowsInstructions();
      return;
    }

    const winArchive = winArchives[0];
    const winDir = path.join(resourcesDir, 'mysql-windows');
    
    if (fs.existsSync(winDir)) {
      console.log('📁 Windows MySQL binaries already exist');
      return;
    }

    try {
      console.log(`📦 Extracting Windows MySQL: ${winArchive}`);
      
      if (this.isWindows) {
        // Use PowerShell on Windows
        execSync(`powershell -command "Expand-Archive -Path '${winArchive}' -DestinationPath '${resourcesDir}' -Force"`, 
          { stdio: 'inherit' });
      } else {
        // Use unzip on Unix-like systems
        execSync(`unzip -q "${winArchive}" -d "${resourcesDir}"`, { stdio: 'inherit' });
      }
      
      // Find and rename extracted directory
      const extracted = fs.readdirSync(resourcesDir).find(d => 
        d.startsWith('mysql-') && d !== 'mysql-windows' && d !== 'mysql-macos'
      );
      
      if (extracted) {
        const extractedPath = path.join(resourcesDir, extracted);
        await fs.promises.rename(extractedPath, winDir);
        console.log('✅ Windows MySQL binaries prepared');
      }
    } catch (error) {
      console.error('❌ Error extracting Windows MySQL:', error.message);
      await this.createWindowsInstructions();
    }
  }

  async extractMacMySQL(files) {
    const macArchives = files.filter(f => 
      f.includes('mysql') && 
      (f.includes('macos') || f.includes('darwin')) && 
      f.endsWith('.tar.gz')
    );

    if (macArchives.length === 0) {
      console.log('⚠️  No macOS MySQL archive found');
      await this.createMacInstructions();
      return;
    }

    const macArchive = macArchives[0];
    const macDir = path.join(resourcesDir, 'mysql-macos');
    
    if (fs.existsSync(macDir)) {
      console.log('📁 macOS MySQL binaries already exist');
      return;
    }

    try {
      console.log(`📦 Extracting macOS MySQL: ${macArchive}`);
      execSync(`tar -xzf "${macArchive}" -C "${resourcesDir}"`, { stdio: 'inherit' });
      
      // Find and rename extracted directory
      const extracted = fs.readdirSync(resourcesDir).find(d => 
        d.startsWith('mysql-') && d !== 'mysql-windows' && d !== 'mysql-macos'
      );
      
      if (extracted) {
        const extractedPath = path.join(resourcesDir, extracted);
        await fs.promises.rename(extractedPath, macDir);
        console.log('✅ macOS MySQL binaries prepared');
      }
    } catch (error) {
      console.error('❌ Error extracting macOS MySQL:', error.message);
      await this.createMacInstructions();
    }
  }

  async createWindowsInstructions() {
    const winDir = path.join(resourcesDir, 'mysql-windows');
    await fs.promises.mkdir(winDir, { recursive: true });
    
    const instructions = `
Windows MySQL Setup Instructions:

1. Download MySQL Community Server from:
   https://dev.mysql.com/downloads/mysql/

2. Choose: Windows (x86, 64-bit), ZIP Archive
   File name should be like: mysql-8.x.xx-winx64.zip

3. Place the downloaded ZIP file in the root directory of this project

4. Run the build command again

Expected file structure after extraction:
mysql-windows/
├── bin/
│   ├── mysqld.exe
│   ├── mysql.exe
│   └── ...
├── lib/
├── share/
└── ...
`;

    await fs.promises.writeFile(path.join(winDir, 'INSTRUCTIONS.txt'), instructions);
    console.log(`📝 Windows instructions written to: ${winDir}/INSTRUCTIONS.txt`);
  }

  async createMacInstructions() {
    const macDir = path.join(resourcesDir, 'mysql-macos');
    await fs.promises.mkdir(macDir, { recursive: true });
    
    const instructions = `
macOS MySQL Setup Instructions:

1. Download MySQL Community Server from:
   https://dev.mysql.com/downloads/mysql/

2. Choose: macOS, Compressed TAR Archive
   File name should be like: mysql-8.x.xx-macos-x86_64.tar.gz or mysql-8.x.xx-macos-arm64.tar.gz

3. Place the downloaded TAR.GZ file in the root directory of this project

4. Run the build command again

Expected file structure after extraction:
mysql-macos/
├── bin/
│   ├── mysqld
│   ├── mysql
│   └── ...
├── lib/
├── share/
└── ...
`;

    await fs.promises.writeFile(path.join(macDir, 'INSTRUCTIONS.txt'), instructions);
    console.log(`📝 macOS instructions written to: ${macDir}/INSTRUCTIONS.txt`);
  }

  async validateMySQLBinaries() {
    console.log('🔍 Validating MySQL binaries...');

    const platforms = [
      { name: 'Windows', dir: 'mysql-windows', executable: 'mysqld.exe' },
      { name: 'macOS', dir: 'mysql-macos', executable: 'mysqld' }
    ];

    for (const platform of platforms) {
      const binDir = path.join(resourcesDir, platform.dir, 'bin');
      const executablePath = path.join(binDir, platform.executable);

      if (fs.existsSync(executablePath)) {
        console.log(`✅ ${platform.name} MySQL binaries found`);
        
        // Check if executable has proper permissions (Unix-like systems)
        if (!this.isWindows && platform.name === 'macOS') {
          try {
            execSync(`chmod +x "${executablePath}"`, { stdio: 'ignore' });
            console.log(`✅ ${platform.name} MySQL executable permissions set`);
          } catch (error) {
            console.warn(`⚠️  Could not set permissions for ${platform.name} MySQL`);
          }
        }
      } else {
        console.warn(`⚠️  ${platform.name} MySQL binaries missing`);
        console.log(`   Expected: ${executablePath}`);
      }
    }
  }
}

// Run extraction
const extractor = new MySQLExtractor();
extractor.extractMySQL()
  .then(() => extractor.validateMySQLBinaries())
  .then(() => {
    console.log('🎉 MySQL preparation completed');
  })
  .catch((error) => {
    console.error('💥 MySQL preparation failed:', error);
    process.exit(1);
  });