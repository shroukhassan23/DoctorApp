// src/utils/mysqlManager.js - Updated for ES modules
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Get __dirname equivalent in ES modules

class MySQLManager {
  constructor() {
    this.platform = os.platform();
    this.isWindows = this.platform === 'win32';
    this.isMac = this.platform === 'darwin';
    this.mysqlProcess = null;
    this.dataDir = null;
    this.mysqlBinPath = null;
    this.configFile = null;
  }

  initializePaths(appPath) {
    const isDev = process.env.ELECTRON_DEV === 'true';
    const resourcesPath = isDev ? path.join(appPath, 'mysql-resources') : path.join(appPath, '..', 'Resources');

    if (this.isWindows) {
      this.mysqlBinPath = path.join(resourcesPath, 'mysql-windows', 'bin');
      this.dataDir = path.join(appPath, 'mysql-data');
      this.configFile = path.join(appPath, 'my-windows.cnf');
    } else if (this.isMac) {
      this.mysqlBinPath = path.join(resourcesPath, 'mysql-macos', 'bin');
      this.dataDir = path.join(appPath, 'mysql-data');
      this.configFile = path.join(appPath, 'my-macos.cnf');
    }
    
    console.log(`MySQL paths initialized for ${this.platform}:`);
    console.log(`  Bin Path: ${this.mysqlBinPath}`);
    console.log(`  Data Dir: ${this.dataDir}`);
    console.log(`  Config: ${this.configFile}`);
  }

  // Create MySQL configuration file
  async createMySQLConfig(port = 3306) {
    const config = this.isWindows ? this.getWindowsConfig(port) : this.getMacConfig(port);

    try {
      await fs.promises.writeFile(this.configFile, config, 'utf8');
      console.log(`MySQL config created at: ${this.configFile}`);
    } catch (error) {
      console.error('Error creating MySQL config:', error);
      throw error;
    }
  }

  getWindowsConfig(port) {
    return `[mysqld]
port=${port}
datadir=${this.dataDir.replace(/\\/g, '/')}
basedir=${path.dirname(this.mysqlBinPath).replace(/\\/g, '/')}
tmpdir=${path.join(this.dataDir, 'tmp').replace(/\\/g, '/')}
socket=${path.join(this.dataDir, 'mysql.sock').replace(/\\/g, '/')}
pid-file=${path.join(this.dataDir, 'mysql.pid').replace(/\\/g, '/')}
log-error=${path.join(this.dataDir, 'error.log').replace(/\\/g, '/')}
bind-address=0.0.0.0
skip-networking=false
default-storage-engine=InnoDB
innodb_flush_log_at_trx_commit=1
innodb_log_buffer_size=1M
innodb_buffer_pool_size=128M
innodb_log_file_size=10M
max_allowed_packet=16M

[mysql]
default-character-set=utf8mb4

[client]
default-character-set=utf8mb4
port=${port}
socket=${path.join(this.dataDir, 'mysql.sock').replace(/\\/g, '/')}`;
  }

  getMacConfig(port) {
    return `[mysqld]
port=${port}
datadir=${this.dataDir}
basedir=${path.dirname(this.mysqlBinPath)}
tmpdir=${path.join(this.dataDir, 'tmp')}
socket=${path.join(this.dataDir, 'mysql.sock')}
pid-file=${path.join(this.dataDir, 'mysql.pid')}
log-error=${path.join(this.dataDir, 'error.log')}
bind-address=0.0.0.0
skip-networking=false
default-storage-engine=InnoDB
innodb_flush_log_at_trx_commit=1
innodb_log_buffer_size=1M
innodb_buffer_pool_size=128M
innodb_log_file_size=10M
max_allowed_packet=16M

[mysql]
default-character-set=utf8mb4

[client]
default-character-set=utf8mb4
port=${port}
socket=${path.join(this.dataDir, 'mysql.sock')}`;
  }

  // Initialize MySQL data directory
  async initializeDataDirectory() {
    try {
      // Create data directory if it doesn't exist
      await fs.promises.mkdir(this.dataDir, { recursive: true });
      await fs.promises.mkdir(path.join(this.dataDir, 'tmp'), { recursive: true });

      // Check if MySQL is already initialized
      const mysqlDir = path.join(this.dataDir, 'mysql');
      try {
        await fs.promises.access(mysqlDir);
        console.log('MySQL data directory already initialized');
        return true;
      } catch {
        console.log('Cleaning and initializing MySQL data directory...');

        // Remove any partial/corrupted data - more aggressive cleanup
        try {
          const { execSync } = require('child_process');
          execSync(`rm -rf "${this.dataDir}"`, { stdio: 'ignore' });
          console.log('Removed existing data directory');
        } catch (e) {
          console.log('Cleanup error (ignoring):', e.message);
        }

        // Small delay to ensure filesystem operations complete
        await new Promise(resolve => setTimeout(resolve, 100));

        // Recreate directories
        await fs.promises.mkdir(this.dataDir, { recursive: true });
        await fs.promises.mkdir(path.join(this.dataDir, 'tmp'), { recursive: true });
        console.log('Created fresh data directories');
      }

      console.log('Initializing MySQL data directory...');

      const mysqldExecutable = this.isWindows ? 'mysqld.exe' : 'mysqld';
      const mysqldPath = path.join(this.mysqlBinPath, mysqldExecutable);

      const initArgs = [
        '--initialize-insecure',
        `--datadir=${this.dataDir}`,
        `--basedir=${path.dirname(this.mysqlBinPath)}`
      ];

      return new Promise((resolve, reject) => {
        const initProcess = spawn(mysqldPath, initArgs, {
          stdio: ['pipe', 'pipe', 'pipe']
        });

        let errorOutput = '';

        initProcess.stderr.on('data', (data) => {
          errorOutput += data.toString();
          console.log('MySQL Init:', data.toString());
        });

        initProcess.on('close', (code) => {
          if (code === 0) {
            console.log('MySQL data directory initialized successfully');
            resolve(true);
          } else {
            console.error('MySQL initialization failed:', errorOutput);
            reject(new Error(`MySQL initialization failed with code ${code}: ${errorOutput}`));
          }
        });
      });
    } catch (error) {
      console.error('Error initializing MySQL data directory:', error);
      throw error;
    }
  }

  // Start MySQL server
  async startMySQL(port = 3306) {
    try {
      if (this.mysqlProcess) {
        console.log('MySQL is already running');
        return;
      }

      await this.createMySQLConfig(port);
      await this.initializeDataDirectory();

      console.log('Starting MySQL server...');

      const mysqldExecutable = this.isWindows ? 'mysqld.exe' : 'mysqld';
      const mysqldPath = path.join(this.mysqlBinPath, mysqldExecutable);

      const startArgs = [
        `--defaults-file=${this.configFile}`,
        '--console'
      ];

      this.mysqlProcess = spawn(mysqldPath, startArgs, {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      this.mysqlProcess.stdout.on('data', (data) => {
        console.log('MySQL:', data.toString());
      });

      this.mysqlProcess.stderr.on('data', (data) => {
        console.log('MySQL Error:', data.toString());
      });

      this.mysqlProcess.on('close', (code) => {
        console.log(`MySQL process exited with code ${code}`);
        this.mysqlProcess = null;
      });

      // Wait for MySQL to start
      await this.waitForMySQL(port);
      console.log('MySQL server started successfully');

      return true;
    } catch (error) {
      console.error('Error starting MySQL:', error);
      throw error;
    }
  }

  // Wait for MySQL to be ready
  async waitForMySQL(port, timeout = 30000) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        // Dynamic import for mysql2 since it might not be available in all contexts
        const mysql = require('mysql2/promise');
        const connection = await mysql.createConnection({
          host: 'localhost',
          port: port,
          user: 'root',
          password: ''
        });
        await connection.end();
        return true;
      } catch (error) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    throw new Error('MySQL failed to start within timeout period');
  }

  // Stop MySQL server
  async stopMySQL() {
    if (this.mysqlProcess) {
      console.log('Stopping MySQL server...');

      if (this.isWindows) {
        this.mysqlProcess.kill('SIGTERM');
      } else {
        this.mysqlProcess.kill('SIGTERM');
      }

      // Wait for process to end
      await new Promise((resolve) => {
        this.mysqlProcess.on('close', resolve);
        setTimeout(resolve, 5000); // Force resolve after 5 seconds
      });

      this.mysqlProcess = null;
      console.log('MySQL server stopped');
    }
  }

  // Import database schema
  async importSchema(schemaFile, port = 3306) {
    try {
      console.log('Importing database schema...');

      const mysqlExecutable = this.isWindows ? 'mysql.exe' : 'mysql';
      const mysqlPath = path.join(this.mysqlBinPath, mysqlExecutable);

      const importArgs = [
        '-u', 'root',
        '-P', port.toString(),
        '-h', 'localhost',
        '--protocol=TCP'
      ];

      return new Promise((resolve, reject) => {
        const importProcess = spawn(mysqlPath, importArgs, {
          stdio: ['pipe', 'pipe', 'pipe']
        });

        // Read schema file and pipe to mysql
        fs.promises.readFile(schemaFile, 'utf8').then(schemaData => {
          importProcess.stdin.write(schemaData);
          importProcess.stdin.end();
        });

        let errorOutput = '';

        importProcess.stderr.on('data', (data) => {
          errorOutput += data.toString();
        });

        importProcess.on('close', (code) => {
          if (code === 0) {
            console.log('Database schema imported successfully');
            resolve(true);
          } else {
            console.error('Schema import failed:', errorOutput);
            reject(new Error(`Schema import failed with code ${code}: ${errorOutput}`));
          }
        });
      });
    } catch (error) {
      console.error('Error importing schema:', error);
      throw error;
    }
  }

  // Check if MySQL binaries exist
  async checkMySQLBinaries() {
    try {
      const mysqldExecutable = this.isWindows ? 'mysqld.exe' : 'mysqld';
      const mysqldPath = path.join(this.mysqlBinPath, mysqldExecutable);
      await fs.promises.access(mysqldPath);
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = MySQLManager;
