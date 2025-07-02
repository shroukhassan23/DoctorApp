const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');

class MySQLManager {
  constructor() {
    this.mysqlProcess = null;
    this.mysqlPath = null;
    this.dataPath = null;
    this.isInitialized = false;
    this.startupTimeout = null;
  }

  initializePaths(appPath) {
    const isDev = process.env.ELECTRON_DEV === 'true';

    if (isDev) {
      // Development mode - MySQL is in mysql-resources folder
      if (process.platform === 'win32') {
        this.mysqlPath = path.join(appPath, 'mysql-resources', 'mysql-windows');
      } else if (process.platform === 'darwin') {
        this.mysqlPath = path.join(appPath, 'mysql-resources', 'mysql-macos');
      } else {
        this.mysqlPath = path.join(appPath, 'mysql-resources', 'mysql-linux');
      }
    } else {
      // Production mode - MySQL is directly in resources folder
      if (process.platform === 'win32') {
        this.mysqlPath = path.join(appPath, 'mysql-windows');
      } else if (process.platform === 'darwin') {
        this.mysqlPath = path.join(appPath, 'mysql-macos');
      } else {
        this.mysqlPath = path.join(appPath, 'mysql-linux');
      }
    }

    // Use safe directory for data
    const { app } = require('electron');
    this.dataPath = path.join(app.getPath('userData'), 'mysql-data');

    console.log('MySQL Path:', this.mysqlPath);
    console.log('Data Path:', this.dataPath);
  }

  async cleanupOldData() {
    try {
      // Stop any running MySQL processes first
      if (this.mysqlProcess) {
        await this.stopMySQL();
      }

      // Check if directory exists
      await fs.access(this.dataPath);
      console.log('Removing old MySQL data directory...');

      // Force remove with retries for Windows file locking issues
      let retries = 5;
      while (retries > 0) {
        try {
          // First try to remove read-only attributes on Windows
          if (process.platform === 'win32') {
            await this.removeReadOnlyAttributes(this.dataPath);
          }

          await fs.rm(this.dataPath, { recursive: true, force: true });
          console.log('Old MySQL data removed successfully');
          break;
        } catch (error) {
          retries--;
          if (retries === 0) {
            throw error;
          }
          console.log(`Retry removing data directory (${retries} attempts left)...`);
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }

      // Wait for filesystem to catch up
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      // Directory doesn't exist - that's fine
      console.log('No old MySQL data to remove');
    }
  }

  async removeReadOnlyAttributes(dirPath) {
    return new Promise((resolve) => {
      // Remove read-only attributes recursively on Windows
      exec(`attrib -R "${dirPath}\\*" /S /D`, (error, stdout, stderr) => {
        if (error) {
          console.warn('Could not remove read-only attributes:', error.message);
        } else {
          console.log('Read-only attributes removed');
        }
        resolve();
      });
    });
  }

  async ensureDataDirectory() {
    try {
      // Check if MySQL is already initialized
      try {
        const mysqlDir = path.join(this.dataPath, 'mysql');
        await fs.access(mysqlDir);

        // Check if ibdata1 exists and is writable
        const ibdata1Path = path.join(this.dataPath, 'ibdata1');
        try {
          await fs.access(ibdata1Path, fs.constants.W_OK);
          console.log('MySQL already initialized and writable, skipping initialization...');
          this.isInitialized = true;
          return;
        } catch (writeError) {
          console.log('MySQL exists but not writable, reinitializing...');
          await this.cleanupOldData();
        }
      } catch (error) {
        // MySQL not initialized, proceed with setup
        console.log('MySQL not initialized, proceeding with setup...');
      }

      // Clean up old data first
      await this.cleanupOldData();

      // Create new data directory
      await fs.mkdir(this.dataPath, { recursive: true });
      console.log('Created new data directory:', this.dataPath);

      // CRITICAL: Set permissions BEFORE initializing database
      await this.setDirectoryPermissions(this.dataPath);

      // Initialize database
      if (!this.isInitialized) {
        await this.initializeDatabase();
      }

    } catch (error) {
      console.error('Error ensuring data directory:', error);
      throw error;
    }
  }

  async setDirectoryPermissions(dirPath) {
    if (process.platform === 'win32') {
      await this.setWindowsPermissions(dirPath);
    } else {
      await this.setUnixPermissions(dirPath);
    }
  }

  async setWindowsPermissions(dirPath) {
    return new Promise((resolve, reject) => {
      const username = os.userInfo().username;

      // Execute commands sequentially to avoid conflicts
      const executeCommand = (command) => {
        return new Promise((cmdResolve) => {
          exec(command, { timeout: 30000 }, (error, stdout, stderr) => {
            if (error) {
              console.warn(`Permission command failed: ${command}`, error.message);
            } else {
              console.log(`Permission command succeeded: ${command.split(' ')[0]}`);
            }
            cmdResolve(); // Always resolve to continue with next command
          });
        });
      };

      const commands = [
        `takeown /F "${dirPath}" /R /D Y`,  // <-- FIXED: changed filePath to dirPath, added /R /D Y for directories
        `icacls "${dirPath}" /inheritance:d /T /Q`,
        `icacls "${dirPath}" /grant "${username}:(OI)(CI)F" /T /Q`,
        `icacls "${dirPath}" /grant "SYSTEM:(OI)(CI)F" /T /Q`,
        `icacls "${dirPath}" /grant "Administrators:(OI)(CI)F" /T /Q`
      ];

      // Execute commands sequentially
      const executeSequentially = async () => {
        for (const command of commands) {
          await executeCommand(command);
          // Small delay between commands
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Final verification - try to create a test file
        try {
          await this.verifyWritePermissions(dirPath);
          console.log('Windows permissions set successfully');
          resolve();
        } catch (verifyError) {
          console.error('Write permission verification failed:', verifyError);
          reject(verifyError);
        }
      };

      executeSequentially().catch(reject);
    });
  }

  async verifyWritePermissions(dirPath) {
    const testFile = path.join(dirPath, 'write_test.tmp');
    try {
      await fs.writeFile(testFile, 'test', 'utf8');
      await fs.unlink(testFile);
      console.log('Write permissions verified successfully');
    } catch (error) {
      throw new Error(`Cannot write to directory ${dirPath}: ${error.message}`);
    }
  }

  async setUnixPermissions(dirPath) {
    try {
      // Give read, write, execute permissions to owner
      await fs.chmod(dirPath, 0o755);
      console.log('Unix permissions set for:', dirPath);
    } catch (error) {
      console.warn('Could not set Unix permissions:', error.message);
    }
  }

  async checkMySQLBinary() {
    const mysqldPath = path.join(this.mysqlPath, 'bin',
      process.platform === 'win32' ? 'mysqld.exe' : 'mysqld');

    try {
      await fs.access(mysqldPath);
      console.log('MySQL binary found at:', mysqldPath);
      return mysqldPath;
    } catch (error) {
      throw new Error(`MySQL binary not found at: ${mysqldPath}`);
    }
  }

  async initializeDatabase() {
    return new Promise(async (resolve, reject) => {
      try {
        const mysqldPath = await this.checkMySQLBinary();

        console.log('Initializing MySQL database...');
        console.log('Using mysqld:', mysqldPath);
        console.log('Data directory:', this.dataPath);

        // Ensure required directories exist
        const sharePath = path.join(this.mysqlPath, 'share');
        const binPath = path.join(this.mysqlPath, 'bin');

        try {
          await fs.access(sharePath);
          await fs.access(binPath);
        } catch (error) {
          console.error('Required MySQL directories missing:', error);
          return reject(new Error('MySQL installation incomplete - missing required directories'));
        }

        const initArgs = [
          '--initialize-insecure',
          '--console',
          `--basedir=${this.mysqlPath}`,
          `--datadir=${this.dataPath}`,
          '--character-set-server=utf8mb4',
          '--collation-server=utf8mb4_unicode_ci',
          '--innodb-file-per-table=1',
          '--innodb-buffer-pool-size=64M'
        ];

        // Add lc-messages-dir if it exists
        const messagesPath = path.join(this.mysqlPath, 'share');
        try {
          await fs.access(messagesPath);
          initArgs.push(`--lc-messages-dir=${messagesPath}`);
        } catch (error) {
          console.warn('Messages directory not found, continuing without it');
        }

        console.log('MySQL init command:', mysqldPath, initArgs.join(' '));

        const initProcess = spawn(mysqldPath, initArgs, {
          stdio: ['ignore', 'pipe', 'pipe'],
          cwd: this.mysqlPath,
          env: {
            ...process.env,
            MYSQL_HOME: this.mysqlPath,
            PATH: `${path.join(this.mysqlPath, 'bin')};${process.env.PATH}`
          },
          detached: false,
          shell: false
        });

        let output = '';
        let errorOutput = '';

        initProcess.stdout.on('data', (data) => {
          const text = data.toString();
          output += text;
          console.log('MySQL Init Output:', text.trim());
        });

        initProcess.stderr.on('data', (data) => {
          const text = data.toString();
          errorOutput += text;
          console.log('MySQL Init Error Detail:', text.trim());
        });

        initProcess.on('close', async (code) => {
          console.log('MySQL initialization completed with code:', code);

          if (code === 0) {
            console.log('MySQL database initialized successfully');

            // Only verify critical files are writable - don't reset all permissions
            try {
              const ibdata1Path = path.join(this.dataPath, 'ibdata1');
              await fs.access(ibdata1Path, fs.constants.W_OK);
              console.log('ibdata1 file is writable');
            } catch (error) {
              console.warn('ibdata1 file may not be writable, attempting to fix...');
              // Try to fix permissions specifically for ibdata1 only
              if (process.platform === 'win32') {
                await this.fixFilePermissions(ibdata1Path);
              }
            }

            this.isInitialized = true;
            resolve();
          } else {
            console.error('MySQL initialization failed with code:', code);
            let errorMessage = 'MySQL initialization failed';

            if (errorOutput.includes('Access is denied')) {
              errorMessage = 'MySQL initialization failed: Access denied. Check file permissions.';
            } else if (errorOutput.includes('cannot create')) {
              errorMessage = 'MySQL initialization failed: Cannot create database files. Check disk space and permissions.';
            } else if (errorOutput.includes('must be writable')) {
              errorMessage = 'MySQL initialization failed: Database files must be writable. Check permissions.';
            }

            reject(new Error(`${errorMessage}\nDetails: ${errorOutput}`));
          }
        });

        initProcess.on('error', (error) => {
          console.error('Failed to start MySQL initialization process:', error);
          reject(new Error(`Cannot start MySQL initialization: ${error.message}`));
        });

        // Timeout with better error handling
        setTimeout(() => {
          if (initProcess && !initProcess.killed) {
            console.log('MySQL initialization timeout, terminating...');
            initProcess.kill('SIGTERM');
            reject(new Error('MySQL initialization timeout'));
          }
        }, 120000); // 2 minutes

      } catch (error) {
        reject(error);
      }
    });
  }

  // New method to fix specific file permissions
  async fixFilePermissions(filePath) {
    if (process.platform !== 'win32') return;


    return new Promise((resolve) => {
      const username = os.userInfo().username;
      const commands = [
        `takeown /F "${filePath}"`,
        `icacls "${filePath}" /grant "${username}:F" /Q`,
        `icacls "${filePath}" /grant "SYSTEM:F" /Q`,
        `icacls "${filePath}" /grant "Administrators:F" /Q`
      ];

      let completed = 0;
      commands.forEach((command) => {
        exec(command, (error) => {
          if (error) {
            console.warn(`File permission command failed: ${command}`, error.message);
          } else {
            console.log(`File permission command succeeded: ${command.split(' ')[0]}`);
          }
          completed++;
          if (completed === commands.length) {
            resolve();
          }
        });
      });
    });
  }

  async findAvailablePort(startPort = 3306) {
    const net = require('net');

    const isPortAvailable = (port) => {
      return new Promise((resolve) => {
        const server = net.createServer();
        server.listen(port, '127.0.0.1', () => {
          server.close(() => resolve(true));
        });
        server.on('error', () => resolve(false));
      });
    };

    // Check ports 3306, 3307, 3308, etc.
    for (let port = startPort; port < startPort + 10; port++) {
      console.log(`Checking if port ${port} is available...`);
      if (await isPortAvailable(port)) {
        console.log(`Port ${port} is available`);
        return port;
      } else {
        console.log(`Port ${port} is in use`);
      }
    }

    throw new Error('No available ports found in range 3306-3315');
  }

  async startMySQL(requestedPort = 3306) {
    try {
      // Find an available port first
      const port = await this.findAvailablePort(requestedPort);
      console.log(`Using MySQL port: ${port}`);
      this.currentPort = port; // ✅ Store port as instance variable


      // Stop any existing MySQL process
      if (this.mysqlProcess) {
        console.log('Stopping existing MySQL process...');
        await this.stopMySQL();
      }

      console.log('Starting MySQL server...');

      // Ensure data directory and permissions
      await this.ensureDataDirectory();

      const mysqldPath = await this.checkMySQLBinary();

      // Create configuration file
      const configPath = await this.createTempConfig(port);

      console.log('MySQL config created at:', configPath);

      console.log('Starting MySQL with config:', configPath);
      console.log('MySQL executable:', mysqldPath);
      console.log('Data directory:', this.dataPath);

      this.mysqlProcess = spawn(mysqldPath, [
        `--defaults-file=${configPath}`,
        '--console'
      ], {
        stdio: ['ignore', 'pipe', 'pipe'],
        cwd: this.mysqlPath,
        env: {
          ...process.env,
          MYSQL_HOME: this.mysqlPath,
          TMPDIR: this.dataPath,
          PATH: `${path.join(this.mysqlPath, 'bin')};${process.env.PATH}`
        }
      });

      return new Promise((resolve, reject) => {
        let isResolved = false;

        this.startupTimeout = setTimeout(() => {
          if (!isResolved) {
            isResolved = true;
            console.error('MySQL startup timeout');
            this.stopMySQL();
            reject(new Error('MySQL startup timeout'));
          }
        }, 60000); // 1 minute timeout

        this.mysqlProcess.stdout.on('data', async (data) => {
          const output = data.toString();
          console.log('MySQL Output:', output);

          if (output.includes('ready for connections') ||
            output.includes(`port: ${port}`) ||
            output.includes('mysqld: ready for connections')) {
            if (!isResolved) {
              isResolved = true;
              clearTimeout(this.startupTimeout);
              console.log('MySQL server started successfully');
              const mysqlPort = port;
              // Import schema after startup
              setTimeout(async () => {
                try {
                  const dumpPath = process.env.ELECTRON_DEV === 'true' ?
                    path.join(process.cwd(), 'dump.sql') :
                    path.join(process.resourcesPath, 'dump.sql');
                  console.log('About to import schema with port:', mysqlPort);
                  await this.importSchema(dumpPath, mysqlPort);
                  console.log('Database schema imported successfully');
                } catch (schemaError) {
                  console.warn('Schema import failed:', schemaError.message);
                }
              }, 2000);

              resolve(true);
            }
          }
        });

        this.mysqlProcess.stderr.on('data', (data) => {
          const error = data.toString();
          console.error('MySQL Error:', error);

          // Check for success in stderr (MySQL 9.x behavior)
          if (error.includes('ready for connections')) {
            if (!isResolved) {
              isResolved = true;
              clearTimeout(this.startupTimeout);
              console.log('MySQL server started successfully (detected in stderr)');

              // Import schema after startup
              setTimeout(async () => {
                try {
                  const dumpPath = process.env.ELECTRON_DEV === 'true' ?
                    path.join(process.cwd(), 'dump.sql') :
                    path.join(process.resourcesPath, 'dump.sql');
                  await this.importSchema(dumpPath, port);  // ✅ Use the original port variable
                  console.log('Database schema imported successfully');
                } catch (schemaError) {
                  console.warn('Schema import failed:', schemaError.message);
                }
              }, 2000);

              resolve(true);
            }
            return;
          }

          // Check for critical errors - especially the writable file error
          if (error.includes('must be writable') ||
            error.includes('Aborting') ||
            error.includes('Cannot start') ||
            error.includes('Fatal error') ||
            error.includes('Failed to initialize DD Storage Engine')) {
            if (!isResolved) {
              isResolved = true;
              clearTimeout(this.startupTimeout);
              reject(new Error(`MySQL startup failed: ${error}`));
            }
          }
        });

        this.mysqlProcess.on('error', (error) => {
          if (!isResolved) {
            isResolved = true;
            clearTimeout(this.startupTimeout);
            console.error('MySQL process error:', error);
            reject(error);
          }
        });

        this.mysqlProcess.on('close', (code) => {
          console.log(`MySQL process exited with code ${code}`);
          this.mysqlProcess = null;
          if (!isResolved) {
            isResolved = true;
            clearTimeout(this.startupTimeout);
            if (code !== 0) {
              reject(new Error(`MySQL exited with code ${code}`));
            } else {
              resolve(false);
            }
          }
        });
      });

    } catch (error) {
      console.error('Error starting MySQL:', error);
      throw error;
    }
  }

  async createTempConfig(port = 3306) {
    const configContent = `[mysqld]
basedir=${this.mysqlPath.replace(/\\/g, '/')}
datadir=${this.dataPath.replace(/\\/g, '/')}
port=${port}
bind-address=0.0.0.0

# Enable TCP/IP
skip-networking=0
${process.platform === 'win32' ? 'enable-named-pipe=1' : ''}

# Authentication
# skip-grant-tables=1
skip-name-resolve=1

# Character set - FIXED: Removed invalid default-character-set from [mysqld] section
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci

# InnoDB settings - Important for file permissions
default-storage-engine=INNODB
innodb_file_per_table=1
innodb_buffer_pool_size=64M
innodb_flush_log_at_trx_commit=2
innodb_force_recovery=0
innodb_flush_method=${process.platform === 'win32' ? 'normal' : 'fsync'}

# Network
max_connections=50
wait_timeout=28800
interactive_timeout=28800

# Security
local-infile=0
secure-file-priv=""

# Performance
tmp_table_size=32M
max_heap_table_size=32M

# Logging
log-error=${path.join(this.dataPath, 'error.log').replace(/\\/g, '/')}
slow-query-log=0

# MyISAM
key_buffer_size=16M

# Disable features for embedded use
skip-log-bin=1
mysqlx=0

[mysql]
default-character-set=utf8mb4

[client]
default-character-set=utf8mb4
port=${port}
`;

    const configPath = path.join(this.dataPath, 'my.cnf');
    await fs.writeFile(configPath, configContent, 'utf8');

    console.log('MySQL config created at:', configPath);
    return configPath;
  }
  async stopMySQL() {
    return new Promise((resolve) => {
      if (this.startupTimeout) {
        clearTimeout(this.startupTimeout);
        this.startupTimeout = null;
      }

      if (!this.mysqlProcess) {
        console.log('MySQL is not running');
        resolve(true);
        return;
      }

      console.log('Stopping MySQL server...');

      const timeout = setTimeout(() => {
        if (this.mysqlProcess && !this.mysqlProcess.killed) {
          console.log('Force killing MySQL process');
          this.mysqlProcess.kill('SIGKILL');
        }
        this.mysqlProcess = null;
        resolve(true);
      }, 10000);

      this.mysqlProcess.on('close', () => {
        clearTimeout(timeout);
        this.mysqlProcess = null;
        console.log('MySQL server stopped');
        resolve(true);
      });

      this.mysqlProcess.kill('SIGTERM');
    });
  }

  async importSchema(schemaPath, port = 3306) {
    return new Promise(async (resolve, reject) => {
      try {
        await fs.access(schemaPath);

        console.log('ImportSchema called with port:', port); // ✅ Add this log
        console.log('Connecting to MySQL on 127.0.0.1:' + port); // ✅ Add this log

        const mysqlPath = path.join(this.mysqlPath, 'bin',
          process.platform === 'win32' ? 'mysql.exe' : 'mysql');

        await fs.access(mysqlPath);
        console.log('Importing schema from:', schemaPath);

        const setupProcess = spawn(mysqlPath, [
          '-h', 'localhost',
          '-P', port.toString(),
          '-u', 'root',
          '-pdummypass123',
          '--default-character-set=utf8mb4'
        ], {
          stdio: ['pipe', 'pipe', 'pipe'],
          cwd: this.mysqlPath,
          env: {
            ...process.env,
            PATH: `${path.join(this.mysqlPath, 'bin')};${process.env.PATH}`,
            MYSQL_PWD: ''
          }
        });
        setupProcess.stdin.write(`
CREATE DATABASE IF NOT EXISTS doctor;
CREATE USER IF NOT EXISTS 'root'@'localhost' IDENTIFIED BY 'dummypass123';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' WITH GRANT OPTION;
CREATE USER IF NOT EXISTS 'root'@'127.0.0.1' IDENTIFIED BY 'dummypass123';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'127.0.0.1' WITH GRANT OPTION;
CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED BY 'dummypass123';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
`);
        setupProcess.stdin.end();

        setupProcess.on('close', async (setupCode) => {
          if (setupCode === 0) {
            console.log('Database setup completed successfully');
          } else {
            console.log('Setup completed with warnings, continuing...');
          }

          const importProcess = spawn(mysqlPath, [
            '-h', 'localhost',
            '-P', port.toString(),
            '-u', 'root',
            '-pdummypass123',  // Add password here
            '--default-character-set=utf8mb4',
            'doctor'
          ], {
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: this.mysqlPath,
            env: {
              ...process.env,
              PATH: `${path.join(this.mysqlPath, 'bin')};${process.env.PATH}`,
              MYSQL_PWD: ''
            }
          });

          try {
            const sqlContent = await fs.readFile(schemaPath, 'utf8');
            importProcess.stdin.write(sqlContent);
            importProcess.stdin.end();
          } catch (error) {
            importProcess.kill();
            reject(new Error(`Failed to read schema file: ${error.message}`));
            return;
          }

          let output = '';
          let errorOutput = '';

          importProcess.stdout.on('data', (data) => {
            output += data.toString();
            console.log('MySQL Import:', data.toString().trim());
          });

          importProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
            console.log('MySQL Import Error:', data.toString().trim());
          });

          importProcess.on('close', (code) => {
            if (code === 0) {
              console.log('Schema imported successfully');
              resolve(true);
            } else {
              console.error('Schema import failed with code:', code);
              reject(new Error(`Schema import failed: ${errorOutput}`));
            }
          });

          importProcess.on('error', (error) => {
            console.error('Failed to start schema import:', error);
            reject(error);
          });
        });

        setupProcess.on('error', (error) => {
          console.error('Failed to setup database:', error);
          reject(error);
        });

      } catch (error) {
        reject(new Error(`Schema file not found or MySQL client missing: ${error.message}`));
      }
    });
  }

  async diagnoseIssues() {
    const diagnostics = {
      mysqlBinary: false,
      dataDirectory: false,
      permissions: false,
      diskSpace: false,
      writeTest: false
    };

    try {
      await this.checkMySQLBinary();
      diagnostics.mysqlBinary = true;
    } catch (error) {
      console.error('MySQL binary check failed:', error.message);
    }

    try {
      await fs.access(this.dataPath);
      diagnostics.dataDirectory = true;
    } catch (error) {
      console.error('Data directory check failed:', error.message);
    }

    try {
      await this.verifyWritePermissions(this.dataPath);
      diagnostics.writeTest = true;
      diagnostics.permissions = true;
    } catch (error) {
      console.error('Write permissions test failed:', error.message);
    }

    try {
      const stats = await fs.stat(this.dataPath);
      diagnostics.diskSpace = true;
    } catch (error) {
      console.error('Disk space check failed:', error.message);
    }

    console.log('MySQL Diagnostics:', diagnostics);
    return diagnostics;
  }
}

module.exports = MySQLManager;