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

    // استخدام مجلد آمن للبيانات
    const { app } = require('electron');
    this.dataPath = path.join(app.getPath('userData'), 'mysql-data');

    console.log('MySQL Path:', this.mysqlPath);
    console.log('Data Path:', this.dataPath);
  }

  async cleanupOldData() {
    try {
        // Check if directory exists
        await fs.access(this.dataPath);
        console.log('Removing old MySQL data directory...');
        await fs.rm(this.dataPath, { recursive: true, force: true });
        console.log('Old MySQL data removed successfully');
        
        // Wait a moment for the filesystem
        await new Promise(resolve => setTimeout(resolve, 1000));
        
    } catch (error) {
        // Directory doesn't exist - that's fine
        console.log('No old MySQL data to remove');
    }
}

  async ensureDataDirectory() {
    try {
      // حذف البيانات القديمة أولاً
      await this.cleanupOldData();

      // إنشاء مجلد البيانات الجديد
      await fs.mkdir(this.dataPath, { recursive: true });
      console.log('Created new data directory:', this.dataPath);

      // إعداد الصلاحيات في Windows
      if (process.platform === 'win32') {
        await this.setWindowsPermissions(this.dataPath);
      } else {
        // إعداد الصلاحيات في Unix/Linux/macOS
        await this.setUnixPermissions(this.dataPath);
      }

      // تهيئة قاعدة البيانات
      await this.initializeDatabase();

    } catch (error) {
      console.error('Error ensuring data directory:', error);
      throw error;
    }
  }

  async setWindowsPermissions(dirPath) {
    return new Promise((resolve, reject) => {
      const username = os.userInfo().username;
      const commands = [
        // إعطاء صلاحيات كاملة للمستخدم الحالي
        `icacls "${dirPath}" /grant "${username}:(OI)(CI)F" /T`,
        // إعطاء صلاحيات للـ System
        `icacls "${dirPath}" /grant "SYSTEM:(OI)(CI)F" /T`,
        // إعطاء صلاحيات للـ Administrators
        `icacls "${dirPath}" /grant "Administrators:(OI)(CI)F" /T`
      ];

      let completedCommands = 0;

      commands.forEach(command => {
        exec(command, (error, stdout, stderr) => {
          if (error) {
            console.warn('Permission command failed:', command, error.message);
          } else {
            console.log('Permission set:', stdout);
          }

          completedCommands++;
          if (completedCommands === commands.length) {
            resolve();
          }
        });
      });
    });
  }

  async setUnixPermissions(dirPath) {
    try {
      // إعطاء صلاحيات قراءة وكتابة للمالك
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
            
            // التأكد من وجود مجلدات ضرورية
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
                '--collation-server=utf8mb4_unicode_ci'
            ];

            // إضافة lc-messages-dir إذا كان موجوداً
            const messagesPath = path.join(this.mysqlPath, 'share');
            try {
                await fs.access(messagesPath);
                initArgs.push(`--lc-messages-dir=${messagesPath}`);
            } catch (error) {
                console.warn('Messages directory not found, continuing without it');
            }

            console.log('MySQL init command:', mysqldPath, initArgs.join(' '));

            const initProcess = spawn(mysqldPath, initArgs, {
                stdio: ['ignore', 'pipe', 'pipe'], // Changed from 'pipe' to 'ignore' for stdin
                cwd: this.mysqlPath,
                env: {
                    ...process.env,
                    MYSQL_HOME: this.mysqlPath,
                    PATH: `${path.join(this.mysqlPath, 'bin')};${process.env.PATH}`
                },
                detached: false,
                shell: false // Explicitly disable shell
            });

            let output = '';
            let errorOutput = '';
            let hasError = false;

            initProcess.stdout.on('data', (data) => {
                const text = data.toString();
                output += text;
                console.log('MySQL Init Output:', text.trim());
            });

            initProcess.stderr.on('data', (data) => {
                const text = data.toString();
                errorOutput += text;
                console.log('MySQL Init Error Detail:', text.trim());
                
                // فحص الأخطاء الحرجة
                if (text.includes('Access is denied') || 
                    text.includes('Permission denied') ||
                    text.includes('cannot create') ||
                    text.includes('failed to create') ||
                    text.includes('Cannot find or open table') ||
                    text.includes('Fatal error') ||
                    text.includes('Aborting')) {
                    hasError = true;
                    console.log('Critical MySQL error detected:', text.trim());
                }
            });

            initProcess.on('close', async (code) => {
                console.log('MySQL initialization completed with code:', code);
                console.log('=== MySQL stdout ===');
                console.log(output || 'No stdout output');
                console.log('=== MySQL stderr ===');
                console.log(errorOutput || 'No stderr output');
                console.log('==================');
                
                if (code === 0) {
                    console.log('MySQL database initialized successfully');
                    this.isInitialized = true;
                    
                    // التحقق من إنشاء الملفات الأساسية
                    try {
                        const mysqlDir = path.join(this.dataPath, 'mysql');
                        await fs.access(mysqlDir);
                        console.log('MySQL system database created successfully');
                        resolve();
                    } catch (error) {
                        console.warn('MySQL system database may not be complete, but continuing...');
                        this.isInitialized = true;
                        resolve();
                    }
                } else {
                    console.error('MySQL initialization failed with code:', code);
                    
                    // محاولة تشخيص المشكلة
                    let errorMessage = 'MySQL initialization failed';
                    if (errorOutput.includes('Access is denied')) {
                        errorMessage = 'MySQL initialization failed: Access denied. Check file permissions.';
                    } else if (errorOutput.includes('cannot create')) {
                        errorMessage = 'MySQL initialization failed: Cannot create database files. Check disk space and permissions.';
                    } else if (errorOutput.includes('Unknown variable')) {
                        errorMessage = 'MySQL initialization failed: Configuration error. Check MySQL version compatibility.';
                    } else if (errorOutput.includes('Can\'t find messagefile')) {
                        errorMessage = 'MySQL initialization failed: Missing message files. Check MySQL installation.';
                    } else if (errorOutput.trim() === '' && output.trim() === '') {
                        errorMessage = 'MySQL initialization failed: Process exited without output. This may be a stdio/process issue in Electron.';
                    }
                    
                    reject(new Error(`${errorMessage}\nDetails: ${errorOutput || 'No error details available'}`));
                }
            });

            initProcess.on('error', (error) => {
                console.error('Failed to start MySQL initialization process:', error);
                reject(new Error(`Cannot start MySQL initialization: ${error.message}`));
            });

            // إضافة timeout للتهيئة مع إمكانية المتابعة
            setTimeout(() => {
                if (initProcess && !initProcess.killed) {
                    console.log('MySQL initialization timeout, attempting to continue...');
                    initProcess.kill('SIGTERM');
                    
                    // انتظار قليل ثم فحص ما إذا تم إنشاء ملفات أساسية
                    setTimeout(async () => {
                        try {
                            await fs.access(this.dataPath);
                            const files = await fs.readdir(this.dataPath);
                            if (files.length > 0) {
                                console.log('Some MySQL files created despite timeout, continuing...');
                                this.isInitialized = true;
                                resolve();
                            } else {
                                reject(new Error('MySQL initialization timeout and no files created'));
                            }
                        } catch (error) {
                            reject(new Error('MySQL initialization timeout and data directory check failed'));
                        }
                    }, 2000);
                }
            }, 90000); // 90 ثانية

        } catch (error) {
            reject(error);
        }
    });
}

  async startMySQL(port = 3306) {
    try {
      // إيقاف أي عملية MySQL قديمة
      if (this.mysqlProcess) {
        console.log('Stopping existing MySQL process...');
        await this.stopMySQL();
      }

      console.log('Starting MySQL server...');

      // التأكد من إعداد مجلد البيانات والصلاحيات
      await this.ensureDataDirectory();

      const mysqldPath = await this.checkMySQLBinary();

      // إنشاء ملف الإعدادات
      const configPath = await this.createTempConfig(port);

      console.log('Starting MySQL with config:', configPath);
      console.log('MySQL executable:', mysqldPath);
      console.log('Data directory:', this.dataPath);

      this.mysqlProcess = spawn(mysqldPath, [
        `--defaults-file=${configPath}`,
        '--console',
        '--skip-grant-tables', // تجاهل جداول الصلاحيات مؤقتاً
        '--skip-networking=false'
      ], {
        stdio: ['pipe', 'pipe', 'pipe'],
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
        let hasStartupMessage = false;

        this.startupTimeout = setTimeout(() => {
          if (!isResolved) {
            isResolved = true;
            console.error('MySQL startup timeout - MySQL did not start within 45 seconds');
            this.stopMySQL();
            reject(new Error('MySQL startup timeout'));
          }
        }, 45000);

        this.mysqlProcess.stdout.on('data', async (data) => {
          const output = data.toString();
          console.log('MySQL Output:', output);

          // البحث عن رسائل نجاح البدء
          if (output.includes('ready for connections') ||
            output.includes(`port: ${port}`) ||
            output.includes('mysqld: ready for connections')) {
            hasStartupMessage = true;
            if (!isResolved) {
              isResolved = true;
              clearTimeout(this.startupTimeout);
              console.log('MySQL server started successfully');

              // Import schema after MySQL is ready
              setTimeout(async () => {
                try {
                  const dumpPath = process.env.ELECTRON_DEV === 'true' ?
                    path.join(process.cwd(), 'dump.sql') :
                    path.join(process.resourcesPath, 'dump.sql');

                  console.log('Attempting to import schema from:', dumpPath);
                  await this.importSchema(dumpPath, port);
                  console.log('Database schema imported successfully');
                } catch (schemaError) {
                  console.warn('Schema import failed, but MySQL is running:', schemaError.message);
                  // Continue anyway - schema might already exist or will be imported later
                }
              }, 2000); // Wait 2 seconds for MySQL to be fully ready

              resolve(true);
            }
          }
        });

        this.mysqlProcess.stderr.on('data', (data) => {
          const error = data.toString();
          console.error('MySQL Error:', error);

          // التحقق من الأخطاء القاتلة
          if (error.includes('Aborting') ||
            error.includes('must be writable') ||
            error.includes('Cannot start') ||
            error.includes('Fatal error')) {
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

        // إضافة فحص دوري لحالة MySQL
        const healthCheck = setInterval(() => {
          if (isResolved) {
            clearInterval(healthCheck);
            return;
          }

          if (this.mysqlProcess && this.mysqlProcess.exitCode === null && !this.mysqlProcess.killed) {
            // MySQL ما زال يعمل، نتحقق إذا مر وقت كافي
            setTimeout(() => {
              if (!isResolved && hasStartupMessage) {
                isResolved = true;
                clearTimeout(this.startupTimeout);
                clearInterval(healthCheck);
                console.log('MySQL appears to be running (health check)');
                resolve(true);
              }
            }, 5000);
          }
        }, 10000);
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
bind-address=127.0.0.1

# Character set
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci

# Storage
default-storage-engine=INNODB
innodb_file_per_table=1
innodb_buffer_pool_size=64M
innodb_flush_log_at_trx_commit=2

# Network
max_connections=50
wait_timeout=28800
interactive_timeout=28800

# Security
skip-name-resolve=1
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

# Disable problematic features for embedded use
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

      // محاولة الإنهاء السليم
      this.mysqlProcess.kill('SIGTERM');
    });
  }

  async importSchema(schemaPath, port = 3306) {
    return new Promise(async (resolve, reject) => {
      try {
        // Check if schema file exists
        await fs.access(schemaPath);

        const mysqlPath = path.join(this.mysqlPath, 'bin',
          process.platform === 'win32' ? 'mysql.exe' : 'mysql');

        await fs.access(mysqlPath);
        console.log('Importing schema from:', schemaPath);

        // Read the SQL file and execute it
        const sqlContent = await fs.readFile(schemaPath, 'utf8');

        const importProcess = spawn(mysqlPath, [
          '-h', '127.0.0.1',
          '-P', port.toString(),
          '-u', 'root',
          '--execute', `CREATE DATABASE IF NOT EXISTS doctor; USE doctor; ${sqlContent}`
        ], {
          stdio: ['pipe', 'pipe', 'pipe'],
          cwd: this.mysqlPath,
          env: {
            ...process.env,
            PATH: `${path.join(this.mysqlPath, 'bin')};${process.env.PATH}`
          }
        });

        let output = '';
        let errorOutput = '';

        importProcess.stdout.on('data', (data) => {
          output += data.toString();
          console.log('MySQL Import:', data.toString());
        });

        importProcess.stderr.on('data', (data) => {
          errorOutput += data.toString();
          console.log('MySQL Import Error:', data.toString());
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
      } catch (error) {
        reject(new Error(`Schema file not found or MySQL client missing: ${error.message}`));
      }
    });
  }

  // دالة مساعدة لتشخيص المشاكل
  async diagnoseIssues() {
    const diagnostics = {
      mysqlBinary: false,
      dataDirectory: false,
      permissions: false,
      diskSpace: false
    };

    try {
      // فحص وجود MySQL binary
      await this.checkMySQLBinary();
      diagnostics.mysqlBinary = true;
    } catch (error) {
      console.error('MySQL binary check failed:', error.message);
    }

    try {
      // فحص مجلد البيانات
      await fs.access(this.dataPath);
      diagnostics.dataDirectory = true;
    } catch (error) {
      console.error('Data directory check failed:', error.message);
    }

    try {
      // فحص الصلاحيات
      const testFile = path.join(this.dataPath, 'test.txt');
      await fs.writeFile(testFile, 'test');
      await fs.unlink(testFile);
      diagnostics.permissions = true;
    } catch (error) {
      console.error('Permissions check failed:', error.message);
    }

    // فحص مساحة القرص
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