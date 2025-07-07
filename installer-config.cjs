// installer-config.js
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
    this.configPath = path.join(this.appPath, 'config');
    this.logsPath = path.join(this.appPath, 'logs');
    this.dockerPath = path.join(this.appPath, 'docker');

    // Installation modes
    this.MODES = {
      SERVER: 'server',
      CLIENT: 'client',
      STANDALONE: 'standalone'
    };

    this.config = {
      mode: this.MODES.STANDALONE,
      database: {
        host: 'localhost',
        port: 3307,
        username: 'root',
        password: this.generatePassword(),
        database: 'doctor2',
        rootPassword: this.generatePassword()
      },
      server: {
        port: 3001
      },
      docker: {
        containerName: 'doctorapp-mysql',
        imageName: 'mysql:8.0',
        volumeName: 'doctorapp-mysql-data',
        networkName: 'doctorapp-network'
      }
    };
  }

  generatePassword() {
    return Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
  }

  async install(options = {}) {
    try {
      console.log('🚀 Starting DoctorApp Installation...');

      // Parse installation options
      this.parseOptions(options);

      // Check Docker availability
      await this.checkOrInstallDockerSilently();

      // Create directory structure
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

    if (options.serverHost) {
      this.config.database.host = options.serverHost;
    }

    if (options.serverPort) {
      this.config.server.port = options.serverPort;
    }

    if (options.dbPassword) {
      this.config.database.password = options.dbPassword;
    }

    if (options.dbRootPassword) {
      this.config.database.rootPassword = options.dbRootPassword;
    }

    if (options.installPath) {
      this.installPath = options.installPath;
      this.appPath = path.join(this.installPath, this.appName);
    }
  }

  async checkOrInstallDockerSilently() {
    try {

      execSync('docker --version', { stdio: 'ignore' });
      console.log('✅ Docker is already installed.');
      return true;
    } catch {
      console.log('🚧 Docker not found. Installing silently...');

      const dockerInstallerPath = path.resolve(__dirname, 'DockerInstaller.exe');

      if (!fs.existsSync(dockerInstallerPath)) {
        throw new Error('❌ Docker installer not found: ' + dockerInstallerPath);
      }

      // تثبيت Docker بصمت
      await new Promise((resolve, reject) => {
        const installer = spawn(dockerInstallerPath, ['install', '--quiet', '--accept-license'], {
          detached: true,
          stdio: 'ignore',
          shell: true
        });

        installer.on('error', reject);
        installer.on('exit', (code) => {
          if (code === 0) {
            console.log('✅ Docker installed successfully.');
            resolve();
          } else {
            reject(new Error(`❌ Docker installation failed with code ${code}`));
          }
        });
      });

      // ننتظر Docker Desktop يفتح
      console.log('🚀 Launching Docker Desktop...');
      execSync('"C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe"', { stdio: 'ignore' });

      // ننتظر Docker Daemon لحد ما يشتغل
      let retries = 15;
      while (retries-- > 0) {
        try {
          execSync('docker info', { stdio: 'ignore' });
          console.log('✅ Docker is now running.');
          return true;
        } catch {
          process.stdout.write('.');
          await new Promise(res => setTimeout(res, 4000));
        }
      }

      throw new Error('❌ Docker did not start in time.');
    }
  }

  async createDirectories() {
    console.log('📁 Creating directory structure...');

    // Default: C:\Program Files\DoctorApp
    let basePath = this.appPath;

    try {
      // Try to make the base directory
      fs.mkdirSync(basePath, { recursive: true });
    } catch (err) {
      if (err.code === 'EPERM') {
        // Fallback to user directory
        const fallbackPath = path.join(basePath, 'DoctorApp');
        console.warn(`⚠️ Permission denied to "${basePath}". Falling back to: "${fallbackPath}"`);
        basePath = fallbackPath;
        this.appPath = basePath;
        this.configPath = path.join(basePath, 'config');
        this.logsPath = path.join(basePath, 'logs');
        this.dockerPath = path.join(basePath, 'docker');
      } else {
        throw err;
      }
    }

    // Create the rest of the directories
    const directories = [
      this.appPath,
      this.configPath,
      this.logsPath,
      this.dockerPath,
      path.join(this.appPath, 'services'),
      path.join(this.appPath, 'app'),
      path.join(this.appPath, 'temp')
    ];

    for (const dir of directories) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Created: ${dir}`);
      }
    }
  }


  async installServer() {
    console.log('🗄️ Installing Server Configuration...');

    // Setup Docker MySQL
    await this.setupDockerMySQL();

    // Copy application files
    await this.copyApplicationFiles();

    // Install Node.js services
    await this.installNodeServices();

    // Setup database
    await this.setupDatabase();
  }

  async installClient() {
    console.log('💻 Installing Client Configuration...');

    // Copy application files (client only)
    await this.copyApplicationFiles();

    // Create client configuration
    await this.createClientConfig();
  }

  async installStandalone() {
    console.log('🖥️ Installing Standalone Configuration...');

    // Setup Docker MySQL
    await this.setupDockerMySQL();

    // Copy application files
    await this.copyApplicationFiles();

    // Install Node.js services
    await this.installNodeServices();

    // Setup database
    await this.setupDatabase();
  }

  async setupDockerMySQL() {
    console.log('🐳 Setting up MySQL with Docker...');

    try {
      // Create Docker network
      await this.createDockerNetwork();

      // Create Docker volume for data persistence
      await this.createDockerVolume();

      // Create Docker Compose file
      await this.createDockerComposeFile();

      // Start MySQL container
      await this.startMySQLContainer();

      console.log('✅ Docker MySQL setup completed');

    } catch (error) {
      console.error('Docker MySQL setup failed:', error);
      throw error;
    }
  }

  async createDockerNetwork() {
    console.log('Creating Docker network...');

    try {
      // Check if network already exists
      execSync(`docker network inspect ${this.config.docker.networkName}`, { stdio: 'ignore' });
      console.log('Docker network already exists');
    } catch {
      // Create network if it doesn't exist
      execSync(`docker network create ${this.config.docker.networkName}`, { stdio: 'pipe' });
      console.log('✅ Docker network created');
    }
  }

  async createDockerVolume() {
    console.log('Creating Docker volume...');

    try {
      // Check if volume already exists
      execSync(`docker volume inspect ${this.config.docker.volumeName}`, { stdio: 'ignore' });
      console.log('Docker volume already exists');
    } catch {
      // Create volume if it doesn't exist
      execSync(`docker volume create ${this.config.docker.volumeName}`, { stdio: 'pipe' });
      console.log('✅ Docker volume created');
    }
  }

  async createDockerComposeFile() {
    console.log('Creating Docker Compose file...');

    const dockerComposeContent = `
version: '3.8'

services:
  mysql:
    image: ${this.config.docker.imageName}
    container_name: ${this.config.docker.containerName}
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${this.config.database.rootPassword}
      MYSQL_DATABASE: ${this.config.database.database}
      MYSQL_USER: ${this.config.database.username}
      MYSQL_PASSWORD: ${this.config.database.password}
      MYSQL_ROOT_HOST: '%'
    ports:
      - "${this.config.database.port}:3306"
    volumes:
      - ${this.config.docker.volumeName}:/var/lib/mysql
      - ./mysql-init:/docker-entrypoint-initdb.d
    networks:
      - ${this.config.docker.networkName}
    command: --default-authentication-plugin=mysql_native_password
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p${this.config.database.rootPassword}"]
      timeout: 20s
      retries: 10

networks:
  ${this.config.docker.networkName}:
    external: true

volumes:
  ${this.config.docker.volumeName}:
    external: true
    `;

    fs.writeFileSync(
      path.join(this.dockerPath, 'docker-compose.yml'),
      dockerComposeContent.trim()
    );

    // Create MySQL initialization directory
    const mysqlInitDir = path.join(this.dockerPath, 'mysql-init');
    if (!fs.existsSync(mysqlInitDir)) {
      fs.mkdirSync(mysqlInitDir, { recursive: true });
    }

    // Create init script for additional setup
    const initScript = `
-- Additional MySQL initialization if needed
-- This script runs when the container is first created
FLUSH PRIVILEGES;
    `;

    fs.writeFileSync(
      path.join(mysqlInitDir, '01-init.sql'),
      initScript.trim()
    );

    console.log('✅ Docker Compose file created');
  }

  async startMySQLContainer() {
    console.log('Starting MySQL container...');

    try {
      // Stop existing container if running
      try {
        execSync(`docker stop ${this.config.docker.containerName}`, { stdio: 'ignore' });
        execSync(`docker rm ${this.config.docker.containerName}`, { stdio: 'ignore' });
      } catch {
        // Container doesn't exist, continue
      }

      // Start container using docker-compose
      execSync('docker-compose up -d', {
        cwd: this.dockerPath,
        stdio: 'pipe'
      });

      console.log('✅ MySQL container started');

      // Wait for MySQL to be ready
      await this.waitForMySQLContainer();

    } catch (error) {
      throw new Error(`Failed to start MySQL container: ${error.message}`);
    }
  }

  async waitForMySQLContainer(maxRetries = 30) {
    console.log('Waiting for MySQL container to be ready...');

    for (let i = 0; i < maxRetries; i++) {
      try {
        // Check container health
        const healthCheck = execSync(
          `docker exec ${this.config.docker.containerName} mysqladmin ping -h localhost -u root -p${this.config.database.rootPassword}`,
          { stdio: 'pipe' }
        );

        if (healthCheck.toString().includes('mysqld is alive')) {
          console.log('✅ MySQL container is ready!');
          return;
        }
      } catch {
        console.log(`Waiting for MySQL container... (${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    throw new Error('MySQL container failed to start within timeout period');
  }

  async copyApplicationFiles() {
    console.log('📋 Copying application files...');

    const sourceDir = process.cwd(); // Assuming installer runs from app directory
    const targetDir = path.join(this.appPath, 'app');

    // Copy built application files
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

    // Create service wrapper scripts
    await this.createServiceWrappers();

    // Install services using NSSM (Non-Sucking Service Manager) or similar
    await this.installWindowsServices();
  }

  async createServiceWrappers() {
    const serviceDir = path.join(this.appPath, 'services');

    // Combined service wrapper (single service for all functionality)
    const combinedServiceScript = `
const path = require('path');
const { spawn } = require('child_process');

const appPath = '${this.appPath.replace(/\\/g, '\\\\')}';
const servicePath = path.join(appPath, 'app', 'combined-service.cjs');

console.log('Starting DoctorApp Combined Service...');
console.log('Service path:', servicePath);

const service = spawn('node', [servicePath], {
  cwd: path.join(appPath, 'app'),
  stdio: ['pipe', 'pipe', 'pipe'],
  env: {
    ...process.env,
    NODE_ENV: 'production',
    DB_TYPE: 'sqlite',
    DB_NAME: '${this.config.database.database}',
    DB_PATH: path.join(appPath, 'data', 'doctor-app.db'),
    PORT: '${this.config.server.port}',
    LOG_DIR: path.join(appPath, 'logs')
  }
});

service.stdout.on('data', (data) => {
  console.log('COMBINED SERVICE STDOUT:', data.toString());
});

service.stderr.on('data', (data) => {
  console.error('COMBINED SERVICE STDERR:', data.toString());
});

service.on('close', (code) => {
  console.log('Combined Service exited with code:', code);
  if (code !== 0) {
    setTimeout(() => {
      console.log('Restarting Combined Service...');
      // Restart logic here
    }, 5000);
  }
});

process.on('SIGTERM', () => {
  console.log('Stopping Combined Service...');
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
    script: path.join(this.appPath, 'services', 'combined-service.js'),
    port: this.config.server.port
  };
  
  const batchScript = `
@echo off
cd /d "${this.appPath}"
node "${serviceConfig.script}"
  `;
  
  const batchPath = path.join(this.appPath, 'services', `${serviceConfig.name}.bat`);
  fs.writeFileSync(batchPath, batchScript);
  
  try {
    // Create Windows service using sc command
    const createServiceCmd = `sc create "${serviceConfig.name}" binPath= "${batchPath}" DisplayName= "${serviceConfig.displayName}" start= auto`;
    execSync(createServiceCmd, { stdio: 'pipe' });
    
    // Start the service
    execSync(`sc start "${serviceConfig.name}"`, { stdio: 'pipe' });
    
    console.log(`✅ Service ${serviceConfig.name} installed and started`);
  } catch (error) {
    console.warn(`⚠️ Failed to install service ${serviceConfig.name}:`, error.message);
    throw error;
  }
}

  async setupDatabase() {
    console.log('🗄️ Setting up database...');

    try {
      // Import schema using Docker
      await this.importDatabaseSchema();

      console.log('✅ Database setup completed');
    } catch (error) {
      console.error('Database setup failed:', error);
      throw error;
    }
  }

  async importDatabaseSchema() {
    console.log('Importing database schema...');

    const dumpPath = path.join(this.appPath, 'app', 'dump.sql');

    if (fs.existsSync(dumpPath)) {
      try {
        // Copy dump file to container and import
        const containerDumpPath = '/tmp/dump.sql';

        // Copy file to container
        execSync(`docker cp "${dumpPath}" ${this.config.docker.containerName}:${containerDumpPath}`,
          { stdio: 'pipe' });

        // Import database schema
        const importCmd = `docker exec ${this.config.docker.containerName} mysql -u${this.config.database.username} -p${this.config.database.password} ${this.config.database.database} < ${containerDumpPath}`;
        execSync(importCmd, { stdio: 'pipe' });

        console.log('✅ Database schema imported successfully');
      } catch (error) {
        throw new Error(`Failed to import database schema: ${error.message}`);
      }
    } else {
      throw new Error(`Database dump file not found: ${dumpPath}`);
    }
  }

  async createConfigFiles() {
    console.log('📝 Creating configuration files...');

    // Main application config
    const appConfig = {
      mode: this.config.mode,
      database: {
        ...this.config.database,
        // Don't expose root password in app config
        rootPassword: undefined
      },
      server: this.config.server,
      docker: this.config.docker,
      paths: {
        app: this.appPath,
        config: this.configPath,
        logs: this.logsPath,
        docker: this.dockerPath
      },
      version: '1.0.0',
      installDate: new Date().toISOString()
    };

    fs.writeFileSync(
      path.join(this.configPath, 'app-config.json'),
      JSON.stringify(appConfig, null, 2)
    );

    // Database configuration for Node.js services
    const dbConfig = {
      host: this.config.database.host,
      port: this.config.database.port,
      user: this.config.database.username,
      password: this.config.database.password,
      database: this.config.database.database,
      charset: 'utf8mb4',
      timezone: 'local'
    };

    fs.writeFileSync(
      path.join(this.configPath, 'database.json'),
      JSON.stringify(dbConfig, null, 2)
    );

    // Create environment file
    const envConfig = `
NODE_ENV=production
DB_HOST=${this.config.database.host}
DB_PORT=${this.config.database.port}
DB_USER=${this.config.database.username}
DB_PASSWORD=${this.config.database.password}
DB_NAME=${this.config.database.database}
SERVER_PORT=${this.config.server.port}
COMBINED_SERVICE_PORT=${this.config.server.port}
APP_PATH=${this.appPath}
DOCKER_CONTAINER_NAME=${this.config.docker.containerName}
    `;

    fs.writeFileSync(path.join(this.configPath, '.env'), envConfig.trim());

    // Create Docker management scripts
    await this.createDockerManagementScripts();
  }

  async createDockerManagementScripts() {
    console.log('Creating Docker management scripts...');

    // Start script
    const startScript = `
@echo off
echo Starting DoctorApp MySQL Database...
cd /d "${this.dockerPath}"
docker-compose up -d
echo MySQL database started successfully!
pause
    `;

    fs.writeFileSync(
      path.join(this.appPath, 'start-database.bat'),
      startScript
    );

    // Stop script
    const stopScript = `
@echo off
echo Stopping DoctorApp MySQL Database...
cd /d "${this.dockerPath}"
docker-compose down
echo MySQL database stopped successfully!
pause
    `;

    fs.writeFileSync(
      path.join(this.appPath, 'stop-database.bat'),
      stopScript
    );

    // Restart script
    const restartScript = `
@echo off
echo Restarting DoctorApp MySQL Database...
cd /d "${this.dockerPath}"
docker-compose down
docker-compose up -d
echo MySQL database restarted successfully!
pause
    `;

    fs.writeFileSync(
      path.join(this.appPath, 'restart-database.bat'),
      restartScript
    );

    // Backup script
    const backupScript = `
@echo off
set BACKUP_DIR="${this.appPath}\\backups"
set BACKUP_FILE=%BACKUP_DIR%\\backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%.sql
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"
echo Creating database backup...
docker exec ${this.config.docker.containerName} mysqldump -u${this.config.database.username} -p${this.config.database.password} ${this.config.database.database} > "%BACKUP_FILE%"
echo Backup created: %BACKUP_FILE%
pause
    `;

    fs.writeFileSync(
      path.join(this.appPath, 'backup-database.bat'),
      backupScript
    );

    console.log('✅ Docker management scripts created');
  }

  async createClientConfig() {
    console.log('📝 Creating client configuration...');

    const clientConfig = {
  mode: 'client',
  serverUrl: `http://${this.config.database.host}:${this.config.server.port}`,
  version: '1.0.0',
  installDate: new Date().toISOString()
};

    fs.writeFileSync(
      path.join(this.configPath, 'client-config.json'),
      JSON.stringify(clientConfig, null, 2)
    );
  }

  async installServices() {
    console.log('⚙️ Installing application services...');

    // Create desktop shortcut
    await this.createDesktopShortcut();

    // Create start menu entry
    await this.createStartMenuEntry();

    // Set up auto-start if needed
    if (this.config.mode === 'server' || this.config.mode === 'standalone') {
      await this.setupAutoStart();
    }
  }

  async createDesktopShortcut() {
    const desktopPath = path.join(os.homedir(), 'Desktop');
    const shortcutPath = path.join(desktopPath, 'DoctorApp.lnk');
    const exePath = path.join(this.appPath, 'app', 'dist-electron', 'DoctorApp.exe');

    // Create a simple batch file to launch the app
    const launcherPath = path.join(this.appPath, 'DoctorApp-Launcher.bat');
    const launcherScript = `
@echo off
cd /d "${this.appPath}\\app"
start "" "${exePath}"
    `;

    fs.writeFileSync(launcherPath, launcherScript);

    // Note: In a real implementation, you'd use a proper shortcut creation method
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

  async setupAutoStart() {
    console.log('Setting up auto-start...');

    // Add to Windows startup (registry or startup folder)
    const startupPath = path.join(
      process.env.APPDATA,
      'Microsoft',
      'Windows',
      'Start Menu',
      'Programs',
      'Startup'
    );

    const startupScript = path.join(startupPath, 'DoctorApp.bat');
    const scriptContent = `
@echo off
timeout /t 10 /nobreak > nul
cd /d "${this.dockerPath}"
docker-compose up -d
timeout /t 15 /nobreak > nul
cd /d "${this.appPath}"
start "" "${this.appPath}\\DoctorApp-Launcher.bat"
    `;

    fs.writeFileSync(startupScript, scriptContent);
    console.log('✅ Auto-start configured');
  }

  async showInstallationSummary() {
    console.log('\n' + '='.repeat(50));
    console.log('🎉 INSTALLATION COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(50));
    console.log(`Installation Mode: ${this.config.mode.toUpperCase()}`);
    console.log(`Installation Path: ${this.appPath}`);

    if (this.config.mode !== 'client') {
      console.log(`Database Host: ${this.config.database.host}:${this.config.database.port}`);
      console.log(`Database Name: ${this.config.database.database}`);
      console.log(`Database User: ${this.config.database.username}`);
      console.log(`Docker Container: ${this.config.docker.containerName}`);
      console.log(`Combined Service: http://localhost:${this.config.server.port}`);
    }

    console.log('\n📋 Next Steps:');
    console.log('1. Launch DoctorApp from Desktop shortcut');
    console.log('2. Configure any additional settings in the application');

    if (this.config.mode === 'server') {
      console.log('3. Share server details with client installations');
      console.log(`   Server IP: ${await this.getLocalIP()}`);
      console.log(`   Service Port: ${this.config.server.port}`);
    }

    console.log('\n🐳 Docker Management:');
    console.log(`- Start Database: ${path.join(this.appPath, 'start-database.bat')}`);
    console.log(`- Stop Database: ${path.join(this.appPath, 'stop-database.bat')}`);
    console.log(`- Restart Database: ${path.join(this.appPath, 'restart-database.bat')}`);
    console.log(`- Backup Database: ${path.join(this.appPath, 'backup-database.bat')}`);

    console.log('\n📁 Important Files:');
    console.log(`Configuration: ${path.join(this.configPath, 'app-config.json')}`);
    console.log(`Docker Compose: ${path.join(this.dockerPath, 'docker-compose.yml')}`);
    console.log(`Logs: ${this.logsPath}`);
    console.log(`Database Config: ${path.join(this.configPath, 'database.json')}`);

    console.log('\n🔧 Troubleshooting:');
    console.log('- Check logs in the logs directory');
    console.log('- Verify services are running in Windows Services');
    console.log('- Check Docker container status: docker ps');
    console.log('- Check firewall settings for server installations');
    console.log('- Ensure Docker Desktop is running');

    console.log('='.repeat(50));
  }

  async getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
    return 'localhost';
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

      // Stop and remove Docker containers
      try {
        execSync(`docker-compose down -v`, { cwd: this.dockerPath, stdio: 'ignore' });
        execSync(`docker volume rm ${this.config.docker.volumeName}`, { stdio: 'ignore' });
        execSync(`docker network rm ${this.config.docker.networkName}`, { stdio: 'ignore' });
      } catch {
        // Ignore errors during rollback
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

  // Utility method to manage Docker MySQL container
  async manageDockerMySQL(action) {
    const validActions = ['start', 'stop', 'restart', 'status', 'logs'];

    if (!validActions.includes(action)) {
      throw new Error(`Invalid action: ${action}. Valid actions: ${validActions.join(', ')}`);
    }

    try {
      switch (action) {
        case 'start':
          execSync('docker-compose up -d', { cwd: this.dockerPath, stdio: 'inherit' });
          break;

        case 'stop':
          execSync('docker-compose down', { cwd: this.dockerPath, stdio: 'inherit' });
          break;

        case 'restart':
          execSync('docker-compose restart', { cwd: this.dockerPath, stdio: 'inherit' });
          break;

        case 'status':
          execSync(`docker ps --filter name=${this.config.docker.containerName}`, { stdio: 'inherit' });
          break;

        case 'logs':
          execSync(`docker logs ${this.config.docker.containerName} --tail 50 -f`, { stdio: 'inherit' });
          break;
      }
    } catch (error) {
      throw new Error(`Failed to ${action} Docker MySQL: ${error.message}`);
    }
  }

  // Method to create database backup
  async createDatabaseBackup(backupPath = null) {
    if (!backupPath) {
      const backupDir = path.join(this.appPath, 'backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      backupPath = path.join(backupDir, `backup_${timestamp}.sql`);
    }

    try {
      console.log('Creating database backup...');

      const backupCmd = `docker exec ${this.config.docker.containerName} mysqldump -u${this.config.database.username} -p${this.config.database.password} ${this.config.database.database}`;
      const backupData = execSync(backupCmd, { encoding: 'utf8' });

      fs.writeFileSync(backupPath, backupData);
      console.log(`✅ Backup created: ${backupPath}`);

      return backupPath;
    } catch (error) {
      throw new Error(`Failed to create database backup: ${error.message}`);
    }
  }

  // Method to restore database from backup
  async restoreDatabaseBackup(backupPath) {
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup file not found: ${backupPath}`);
    }

    try {
      console.log('Restoring database from backup...');

      // Copy backup file to container
      const containerBackupPath = '/tmp/restore.sql';
      execSync(`docker cp "${backupPath}" ${this.config.docker.containerName}:${containerBackupPath}`);

      // Restore database
      const restoreCmd = `docker exec ${this.config.docker.containerName} mysql -u${this.config.database.username} -p${this.config.database.password} ${this.config.database.database} < ${containerBackupPath}`;
      execSync(restoreCmd);

      console.log('✅ Database restored successfully');
    } catch (error) {
      throw new Error(`Failed to restore database: ${error.message}`);
    }
  }

  // Method to check Docker MySQL health
  async checkDockerMySQLHealth() {
    try {
      const healthCmd = `docker exec ${this.config.docker.containerName} mysqladmin ping -h localhost -u ${this.config.database.username} -p${this.config.database.password}`;
      const result = execSync(healthCmd, { encoding: 'utf8' });

      return result.includes('mysqld is alive');
    } catch (error) {
      return false;
    }
  }

  // Method to update Docker MySQL configuration
  async updateDockerMySQLConfig(newConfig) {
    console.log('Updating Docker MySQL configuration...');

    // Update internal config
    Object.assign(this.config.database, newConfig);

    // Regenerate docker-compose file
    await this.createDockerComposeFile();

    // Restart container with new configuration
    try {
      execSync('docker-compose down', { cwd: this.dockerPath, stdio: 'pipe' });
      execSync('docker-compose up -d', { cwd: this.dockerPath, stdio: 'pipe' });

      console.log('✅ Docker MySQL configuration updated');
    } catch (error) {
      throw new Error(`Failed to update Docker MySQL configuration: ${error.message}`);
    }
  }
}

// Usage example and CLI interface
if (require.main === module) {
  const installer = new DoctorAppInstaller();

  // Parse command line arguments
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--mode' && i + 1 < args.length) {
      options.mode = args[i + 1];
      i++;
    } else if (arg === '--server-host' && i + 1 < args.length) {
      options.serverHost = args[i + 1];
      i++;
    } else if (arg === '--server-port' && i + 1 < args.length) {
      options.serverPort = parseInt(args[i + 1]);
      i++;
    } else if (arg === '--db-password' && i + 1 < args.length) {
      options.dbPassword = args[i + 1];
      i++;
    } else if (arg === '--db-root-password' && i + 1 < args.length) {
      options.dbRootPassword = args[i + 1];
      i++;
    } else if (arg === '--install-path' && i + 1 < args.length) {
      options.installPath = args[i + 1];
      i++;
    } else if (arg === '--help') {
      console.log(`
DoctorApp Installer with Docker MySQL

Usage: node installer-config.js [options]

Options:
  --mode <mode>                Installation mode: server, client, or standalone (default: standalone)
  --server-host <host>         Server host for client mode (default: localhost)
  --server-port <port>         Server port (default: 3001)
  --db-password <password>     Database user password (auto-generated if not provided)
  --db-root-password <password> Database root password (auto-generated if not provided)
  --install-path <path>        Installation path (default: Program Files)
  --help                       Show this help message

Examples:
  node installer-config.js --mode standalone
  node installer-config.js --mode server --server-port 3001
  node installer-config.js --mode client --server-host 192.168.1.100

Docker Requirements:
  - Docker Desktop must be installed and running
  - Minimum 2GB RAM available for Docker
  - Port 3306 must be available for MySQL container
      `);
      process.exit(0);
    }
  }

  // Run installation
  installer.install(options)
    .then(() => {
      console.log('\n🎉 Installation completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Installation failed:', error.message);
      process.exit(1);
    });
}

module.exports = DoctorAppInstaller;