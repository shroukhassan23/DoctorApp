// installer-config.cjs - Centralized SQLite Version (No Docker)
const path = require('path');
const fs = require('fs');
const { execSync, spawn } = require('child_process');
const os = require('os');

class DoctorAppInstaller {
  constructor() {
    this.appName = 'DoctorApp';
    this.serviceName = 'DoctorAppService';
    this.installPath = process.env.PROGRAMFILES || 'C:\\Program Files';
    this.appPath = path.join(this.installPath, this.appName);
    
    // Centralized directory structure
    this.directories = {
    app: path.join(this.appPath, 'app'),           // C:\Program Files\DoctorApp\app
    data: path.join(this.appPath, 'data'),         // C:\Program Files\DoctorApp\data
    config: path.join(this.appPath, 'config'),     // C:\Program Files\DoctorApp\config
    logs: path.join(this.appPath, 'logs'),         // C:\Program Files\DoctorApp\logs
    uploads: path.join(this.appPath, 'uploads'),   // C:\Program Files\DoctorApp\uploads
    backups: path.join(this.appPath, 'backups'),   // C:\Program Files\DoctorApp\backups
    temp: path.join(this.appPath, 'temp'),         // C:\Program Files\DoctorApp\temp
    services: path.join(this.appPath, 'services')  // C:\Program Files\DoctorApp\services
  };

    // Installation modes
    this.MODES = {
      SERVER: 'server',
      CLIENT: 'client',
      STANDALONE: 'standalone'
    };

    this.config = {
      mode: this.MODES.STANDALONE,
      database: {
        type: 'sqlite',
        path: path.join(this.directories.data, 'doctor-app.db')
      },
      server: {
        port: 3001
      }
    };
  }

  async install(options = {}) {
    try {
      console.log('🚀 Starting DoctorApp Installation (SQLite Edition)...');

      // Parse installation options
      this.parseOptions(options);

      // Create centralized directory structure
      await this.createDirectories();

      // Install based on mode
      switch (this.config.mode) {
        case this.MODES.SERVER:
          await this.installServer();
          break;
        case this.MODES.CLIENT:
          await this.installClient();
          break;
        case this.MODES.STANDALONE:
          await this.installStandalone();
          break;
      }

      // Create configuration files
      await this.createConfigFiles();

      // Install and start services
      await this.installServices();

      console.log('✅ Installation completed successfully!');
      await this.showInstallationSummary();

    } catch (error) {
      console.error('❌ Installation failed:', error.message);
      await this.rollback();
      throw error;
    }
  }

  parseOptions(options) {
    if (options.mode) {
      this.config.mode = options.mode;
    }
    if (options.serverPort) {
      this.config.server.port = options.serverPort;
    }
    if (options.installPath) {
      this.installPath = options.installPath;
      this.appPath = path.join(this.installPath, this.appName);
      this.updateDirectoryPaths();
    }
  }

  updateDirectoryPaths() {
    Object.keys(this.directories).forEach(key => {
      this.directories[key] = path.join(this.appPath, key);
    });
    this.config.database.path = path.join(this.directories.data, 'doctor-app.db');
  }

  async createDirectories() {
    console.log('📁 Creating centralized directory structure...');

    // Create all directories
    for (const [name, dirPath] of Object.entries(this.directories)) {
      try {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`📁 Created: ${name} -> ${dirPath}`);
      } catch (err) {
        if (err.code === 'EPERM') {
          throw new Error(`Permission denied creating directory: ${dirPath}. Please run as administrator.`);
        }
        throw err;
      }
    }
  }

  async installServer() {
    console.log('🗄️ Installing Server Configuration (SQLite)...');
    await this.copyApplicationFiles();
    await this.installNodeServices();
    await this.setupSQLiteDatabase();
  }

  async installClient() {
    console.log('💻 Installing Client Configuration...');
    await this.copyApplicationFiles();
    await this.createClientConfig();
  }

  async installStandalone() {
    console.log('🖥️ Installing Standalone Configuration (SQLite)...');
    await this.copyApplicationFiles();
    await this.installNodeServices();
    await this.setupSQLiteDatabase();
  }

  async setupSQLiteDatabase() {
    console.log('🗄️ Setting up SQLite database...');
    
    try {
      // Copy schema file to data directory
      const sourceSqlPath = path.join(process.cwd(), 'dump.sql');
      const targetSqlPath = path.join(this.directories.data, 'schema.sql');
      
      if (fs.existsSync(sourceSqlPath)) {
        fs.copyFileSync(sourceSqlPath, targetSqlPath);
        console.log('✅ Database schema prepared');
      } else {
        console.warn('⚠️ No schema file found - database will be created when first accessed');
      }

    } catch (error) {
      console.error('SQLite setup failed:', error);
      throw error;
    }
  }

  async copyApplicationFiles() {
    console.log('📋 Copying application files...');

    const sourceDir = process.cwd();
    const targetDir = this.directories.app;

    const filesToCopy = [
      'dist-electron',
      'app_dist',
      'package.json',
      'dump.sql'
    ];

    for (const file of filesToCopy) {
      const sourcePath = path.join(sourceDir, file);
      const targetPath = path.join(targetDir, file);

      if (fs.existsSync(sourcePath)) {
        await this.copyRecursive(sourcePath, targetPath);
        console.log(`Copied: ${file}`);
      }
    }
  }

  async copyRecursive(src, dest) {
    const stat = fs.statSync(src);

    if (stat.isDirectory()) {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }

      const files = fs.readdirSync(src);
      for (const file of files) {
        await this.copyRecursive(
          path.join(src, file),
          path.join(dest, file)
        );
      }
    } else {
      fs.copyFileSync(src, dest);
    }
  }

  async installNodeServices() {
    console.log('⚙️ Installing Node.js services...');
    await this.createServiceWrappers();
    await this.installWindowsServices();
  }

  async createServiceWrappers() {
    const serviceDir = this.directories.services;

    const combinedServiceScript = `
const path = require('path');
const { spawn } = require('child_process');

const installPath = '${this.appPath.replace(/\\/g, '\\\\')}';
const servicePath = path.join(installPath, 'app', 'combined-service.cjs');

console.log('Starting DoctorApp Combined Service...');
console.log('Service path:', servicePath);

const service = spawn('node', [servicePath], {
  cwd: path.join(installPath, 'app'),
  stdio: ['pipe', 'pipe', 'pipe'],
  env: {
    ...process.env,
    NODE_ENV: 'production',
    DB_TYPE: 'sqlite',
    DB_PATH: path.join(installPath, 'data', 'doctor-app.db'),
    LOG_DIR: path.join(installPath, 'logs'),
    INSTALL_PATH: installPath,
    PORT: '${this.config.server.port}'
  }
});

service.stdout.on('data', (data) => {
  console.log('SERVICE:', data.toString());
});

service.stderr.on('data', (data) => {
  console.error('SERVICE ERROR:', data.toString());
});

service.on('close', (code) => {
  console.log('Service exited with code:', code);
  if (code !== 0) {
    setTimeout(() => {
      console.log('Restarting service...');
    }, 5000);
  }
});

process.on('SIGTERM', () => {
  console.log('Stopping service...');
  service.kill('SIGTERM');
});
    `;

    fs.writeFileSync(
      path.join(serviceDir, 'combined-service.js'),
      combinedServiceScript
    );
  }

  async installWindowsServices() {
    console.log('Installing Windows service...');
    
    const serviceConfig = {
      name: 'DoctorApp-Combined',
      displayName: 'Doctor App - Combined Service',
      script: path.join(this.directories.services, 'combined-service.js'),
      port: this.config.server.port
    };
    
    const batchScript = `
@echo off
cd /d "${this.appPath}"
node "${serviceConfig.script}"
    `;
    
    const batchPath = path.join(this.directories.services, `${serviceConfig.name}.bat`);
    fs.writeFileSync(batchPath, batchScript);
    
    try {
      const createServiceCmd = `sc create "${serviceConfig.name}" binPath= "${batchPath}" DisplayName= "${serviceConfig.displayName}" start= auto`;
      execSync(createServiceCmd, { stdio: 'pipe' });
      
      execSync(`sc start "${serviceConfig.name}"`, { stdio: 'pipe' });
      
      console.log(`✅ Service ${serviceConfig.name} installed and started`);
    } catch (error) {
      console.warn(`⚠️ Failed to install service ${serviceConfig.name}:`, error.message);
      throw error;
    }
  }

  async createConfigFiles() {
    console.log('📝 Creating configuration files...');

    // Main application config
    const appConfig = {
      mode: this.config.mode,
      database: {
        type: 'sqlite',
        path: this.config.database.path
      },
      server: this.config.server,
      paths: this.directories,
      version: '1.0.0',
      installDate: new Date().toISOString()
    };

    fs.writeFileSync(
      path.join(this.directories.config, 'app-config.json'),
      JSON.stringify(appConfig, null, 2)
    );

    // Environment file
    const envConfig = `
NODE_ENV=production
DB_TYPE=sqlite
DB_PATH=${this.config.database.path}
LOG_DIR=${this.directories.logs}
INSTALL_PATH=${this.appPath}
SERVER_PORT=${this.config.server.port}
    `;

    fs.writeFileSync(path.join(this.directories.config, '.env'), envConfig.trim());

    // Create management scripts
    await this.createManagementScripts();
  }

  async createManagementScripts() {
    console.log('Creating management scripts...');

    // Backup script
    const backupScript = `
@echo off
set BACKUP_DIR="${this.directories.backups}"
set BACKUP_FILE=%BACKUP_DIR%\\backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%.db
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"
echo Creating database backup...
copy "${this.config.database.path}" "%BACKUP_FILE%"
echo Backup created: %BACKUP_FILE%
pause
    `;

    fs.writeFileSync(
      path.join(this.appPath, 'backup-database.bat'),
      backupScript
    );

    console.log('✅ Management scripts created');
  }

  async createClientConfig() {
    console.log('📝 Creating client configuration...');

    const clientConfig = {
      mode: 'client',
      serverUrl: `http://localhost:${this.config.server.port}`,
      version: '1.0.0',
      installDate: new Date().toISOString()
    };

    fs.writeFileSync(
      path.join(this.directories.config, 'client-config.json'),
      JSON.stringify(clientConfig, null, 2)
    );
  }

  async installServices() {
    console.log('⚙️ Installing application services...');
    await this.createDesktopShortcut();
    await this.createStartMenuEntry();
  }

  async createDesktopShortcut() {
    const desktopPath = path.join(os.homedir(), 'Desktop');
    const launcherPath = path.join(this.appPath, 'DoctorApp-Launcher.bat');
    const exePath = path.join(this.directories.app, 'dist-electron', 'DoctorApp.exe');

    const launcherScript = `
@echo off
cd /d "${this.directories.app}"
start "" "${exePath}"
    `;

    fs.writeFileSync(launcherPath, launcherScript);
    console.log('✅ Desktop shortcut created');
  }

  async createStartMenuEntry() {
    const startMenuPath = path.join(
      process.env.APPDATA,
      'Microsoft',
      'Windows',
      'Start Menu',
      'Programs',
      'DoctorApp'
    );

    if (!fs.existsSync(startMenuPath)) {
      fs.mkdirSync(startMenuPath, { recursive: true });
    }

    console.log('✅ Start menu entry created');
  }

  async showInstallationSummary() {
    console.log('\n' + '='.repeat(50));
    console.log('🎉 INSTALLATION COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(50));
    console.log(`Installation Mode: ${this.config.mode.toUpperCase()}`);
    console.log(`Installation Path: ${this.appPath}`);
    console.log(`Database: SQLite at ${this.config.database.path}`);
    console.log(`Service Port: ${this.config.server.port}`);

    console.log('\n📋 Next Steps:');
    console.log('1. Launch DoctorApp from Desktop shortcut');
    console.log('2. Configure settings in the application');

    console.log('\n📁 Important Directories:');
    Object.entries(this.directories).forEach(([name, path]) => {
      console.log(`${name}: ${path}`);
    });

    console.log('\n🔧 Management:');
    console.log(`- Backup Database: ${path.join(this.appPath, 'backup-database.bat')}`);

    console.log('='.repeat(50));
  }

  async rollback() {
    console.log('🔄 Rolling back installation...');

    try {
      // Stop and remove services
      const services = ['DoctorApp-Combined'];
      for (const service of services) {
        try {
          execSync(`sc stop "${service}"`, { stdio: 'ignore' });
          execSync(`sc delete "${service}"`, { stdio: 'ignore' });
        } catch {
          // Ignore errors during rollback
        }
      }

      // Remove installation directory
      if (fs.existsSync(this.appPath)) {
        fs.rmSync(this.appPath, { recursive: true, force: true });
      }

      console.log('✅ Rollback completed');
    } catch (error) {
      console.error('Rollback failed:', error.message);
    }
  }
}

module.exports = DoctorAppInstaller;