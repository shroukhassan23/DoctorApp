const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const SQLiteManager = require('./src/utils/mysqlManager.cjs');
const LicenseManager = require('./src/utils/licenseManager.cjs');
const ConfigManager = require('./src/utils/configManager.cjs');
const BackendManager = require('./src/utils/backendManager.cjs');
const Logger = require('./src/utils/logger.cjs'); // Add logger import

const isDev = process.env.ELECTRON_DEV === 'true';

class DoctorApp {
  constructor() {
    this.mainWindow = null;
    this.sqliteManager = new SQLiteManager();
    this.licenseManager = new LicenseManager();
    this.configManager = null;
    this.backendManager = null;
    this.logger = null; // Add logger instance
    this.appDataPath = null;
    this.isSetupComplete = false;
  }

  async installWindowsServices() {
    try {
      const { spawn } = require('child_process');
      const isDev = process.env.ELECTRON_DEV === 'true';
      
      let scriptPath;
      if (isDev) {
        scriptPath = path.join(process.cwd(), 'scripts', 'install-services.cjs');
      } else {
        // In production, the script should be in resources
        scriptPath = path.join(process.resourcesPath, 'install-services.cjs');
      }
  
      await this.logger.logSystemEvent('Starting Windows service installation', { scriptPath });
      
      return new Promise((resolve, reject) => {
        const installProcess = spawn('node', [scriptPath], {
          stdio: 'pipe',
          cwd: path.dirname(scriptPath),
          shell: true // Important for Windows
        });
        
        let output = '';
        let errorOutput = '';
        
        installProcess.stdout.on('data', (data) => {
          const message = data.toString();
          output += message;
          console.log('Service Install:', message);
        });
        
        installProcess.stderr.on('data', (data) => {
          const message = data.toString();
          errorOutput += message;
          console.error('Service Install Error:', message);
        });
        
        installProcess.on('close', async (code) => {
          if (code === 0) {
            await this.logger.logSystemEvent('Windows services installed successfully');
            resolve();
          } else {
            await this.logger.error('Service installation failed', new Error(`Exit code: ${code}`), {
              output,
              errorOutput
            });
            reject(new Error(`Service installation failed with code ${code}. Check logs for details.`));
          }
        });
        
        installProcess.on('error', async (error) => {
          await this.logger.error('Service installation process error', error);
          reject(error);
        });
      });
    } catch (error) {
      await this.logger.error('Failed to start service installation', error);
      throw new Error(`Failed to install Windows services: ${error.message}`);
    }
  }

  async initialize() {
    try {
      // Set up app data directory
      this.appDataPath = path.join(app.getPath('userData'));
      await fs.mkdir(this.appDataPath, { recursive: true });

      // Initialize logger first
      this.logger = new Logger(this.appDataPath);
      await this.logger.initialize();

      await this.logger.logSystemEvent('App initialization started');

      // Initialize license manager
      await this.licenseManager.initialize(this.appDataPath);
      await this.logger.logSystemEvent('License manager initialized');

      // Initialize MySQL paths
      const appPath = isDev ?
        process.cwd() :
        process.resourcesPath;
      this.sqliteManager.initializePaths(appPath);
      await this.logger.logSystemEvent('SQLite paths initialized', { appPath });

      // Initialize other managers
      this.configManager = new ConfigManager(this.appDataPath);
      this.backendManager = new BackendManager(__dirname);
      await this.logger.logSystemEvent('Managers initialized');

      // Check if setup is complete
      await this.checkSetupStatus();

      // Set up IPC handlers
      this.setupIPCHandlers();

      await this.logger.logSystemEvent('App initialization completed');
    } catch (error) {
      if (this.logger) {
        await this.logger.error('Failed to initialize app', error);
      }
      console.error('App initialization failed:', error);
      throw error;
    }
  }

  async checkSetupStatus() {
    try {
      this.isSetupComplete = await this.configManager.isSetupComplete();

      // Check if we need to migrate from MySQL to SQLite
      if (this.isSetupComplete) {
        const config = await this.configManager.getConfig();
        await this.logger.debug('Existing config loaded', { config });

        // If config has old MySQL settings, force re-setup for SQLite
        if (config.database && config.database.host) {
          await this.logger.warn('Detected old MySQL config, forcing re-setup for SQLite');
          await this.configManager.clearConfig();
          this.isSetupComplete = false;
        }
      }

      await this.logger.logSystemEvent('Setup status checked', {
        isSetupComplete: this.isSetupComplete,
        configPath: this.configManager.configPath
      });

    } catch (error) {
      await this.logger.error('Setup status check failed', error);
      this.isSetupComplete = false;
    }
  }

  async saveSetupConfig(installationType, config) {
    try {
      if (installationType === 'master') {
        await this.configManager.saveMasterConfig(config);
        await this.logger.logSystemEvent('Master config saved', { config });
      } else {
        await this.configManager.saveClientConfig(config);
        await this.logger.logSystemEvent('Client config saved', { config });
      }
      this.isSetupComplete = true;
    } catch (error) {
      await this.logger.error('Failed to save setup config', error, { installationType, config });
      throw error;
    }
  }

  createWindow() {
    try {
      this.mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          webSecurity: !isDev,
          preload: path.join(__dirname, 'preload.js')
        },
        show: false,
      });

      // Load the app
      if (isDev) {
        this.mainWindow.loadURL('http://localhost:8081');
        this.mainWindow.webContents.openDevTools();
        this.logger.logSystemEvent('Development window loaded');
      } else {
        const indexPath = path.join(__dirname, 'app_dist', 'index.html');
        this.mainWindow.loadFile(indexPath).catch(async (error) => {
          await this.logger.error('Failed to load app file', error, { indexPath });
          console.error(error);
        });
        this.logger.logSystemEvent('Production window loaded');
      }

      // Show window when ready
      this.mainWindow.once('ready-to-show', async () => {
        this.mainWindow.show();
        await this.logger.logSystemEvent('Main window shown');
      });

      // Start license usage tracking when window becomes focused
      this.mainWindow.on('focus', async () => {
        this.licenseManager.startUsageTracking();
        await this.logger.logLicenseEvent('Usage tracking started');
      });

      // Stop license usage tracking when window loses focus
      this.mainWindow.on('blur', async () => {
        this.licenseManager.stopUsageTracking();
        await this.logger.logLicenseEvent('Usage tracking stopped');
      });

    } catch (error) {
      this.logger.error('Failed to create window', error);
      throw error;
    }
  }

  setupIPCHandlers() {
    // License Management
    ipcMain.handle('get-license-info', async () => {
      try {
        const result = await this.licenseManager.getLicenseInfo();
        await this.logger.logLicenseEvent('License info retrieved');
        return result;
      } catch (error) {
        await this.logger.error('Failed to get license info', error);
        throw error;
      }
    });
    ipcMain.handle('write-log', async (event, { level, message, context }) => {
      if (this.logger) {
        await this.logger.writeLog(level || 'INFO', message, null, context || {});
      }
    });

    ipcMain.handle('activate-license', async (event, licenseKey) => {
      try {
        await this.logger.logUserAction('License activation attempted', { licenseKey: '***' });
        const result = await this.licenseManager.activateLicense(licenseKey);
        await this.logger.logLicenseEvent('License activation result', { success: result.success });
        return result;
      } catch (error) {
        await this.logger.error('License activation failed', error);
        throw error;
      }
    });

    ipcMain.handle('check-license', async () => {
      try {
        const result = await this.licenseManager.checkLicense();
        await this.logger.logLicenseEvent('License check completed', { isValid: result.isValid });
        return result;
      } catch (error) {
        await this.logger.error('License check failed', error);
        throw error;
      }
    });

    // Setup Management
    ipcMain.handle('is-setup-complete', async () => {
      await this.logger.logUserAction('Setup status requested');
      return this.isSetupComplete;
    });



    ipcMain.handle('setup-master-installation', async (event, config) => {
      try {
        await this.logger.logUserAction('Master installation setup started', { config });
    
        // Start SQLite database
        await this.sqliteManager.startDatabase();
        await this.logger.logDatabaseOperation('SQLite database started');
    
        // Create shared folder
        await fs.mkdir(config.sharedFolderPath, { recursive: true });
        await this.logger.logSystemEvent('Shared folder created', { path: config.sharedFolderPath });
    
        // Save configuration
        await this.saveSetupConfig('master', config);
    
        // Install Windows services if requested
        if (config.installAsServices && process.platform === 'win32') {
          await this.logger.logSystemEvent('Installing Windows services');
          await this.installWindowsServices();
          await this.logger.logSystemEvent('Windows services installation completed');
        } else {
          // Start backend services as regular processes (for development)
          const fullConfig = await this.configManager.getConfig();
          await this.backendManager.startServices('master', fullConfig);
          await this.logger.logSystemEvent('Backend services started as regular processes');
        }
    
        await this.logger.logUserAction('Master installation completed successfully');
        return { success: true };
      } catch (error) {
        await this.logger.error('Master installation failed', error, { config });
        throw error;
      }
    });

    ipcMain.handle('get-config', async () => {
      try {
        const config = await this.configManager.getConfig();
        await this.logger.logUserAction('Config retrieved');
        return config;
      } catch (error) {
        await this.logger.error('Failed to get config', error);
        return {};
      }
    });

    // Updated client setup handler
    ipcMain.handle('setup-client-configuration', async (event, config) => {
      try {
        await this.logger.logUserAction('Client configuration setup started', config);
    
        // Test connection to master services first
        const testResult = await this.testMasterServices(config);
        if (!testResult.success) {
          await this.logger.error('Master services connection test failed during client setup', null, { testResult });
          throw new Error(`Cannot connect to master services: ${testResult.error}`);
        }
    
        // Save client configuration (no database needed)
        await this.saveSetupConfig('client', {
          masterHost: config.masterHost,
          patientServicePort: config.patientServicePort,
          visitServicePort: config.visitServicePort,
          reportsServicePort: config.reportsServicePort
        });
    
        // DO NOT start backend services for clients!
        // Clients will use the master's services directly
    
        await this.logger.logUserAction('Client configuration completed successfully');
        return { success: true };
      } catch (error) {
        await this.logger.error('Client configuration failed', error, config);
        throw error;
      }
    });

    // Connection Testing
    ipcMain.handle('test-database-connection', async (event, config) => {
      try {
        await this.logger.logUserAction('Database connection test started');
        const result = await this.testDatabaseConnection(config);
        await this.logger.logSystemEvent('Database connection test completed', { success: result.success });
        return result;
      } catch (error) {
        await this.logger.error('Database connection test failed', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('test-shared-folder', async (event, folderPath) => {
      try {
        await this.logger.logUserAction('Shared folder test started', { folderPath });
        await fs.access(folderPath);
        await this.logger.logSystemEvent('Shared folder test successful', { folderPath });
        return { success: true };
      } catch (error) {
        await this.logger.error('Shared folder test failed', error, { folderPath });
        return { success: false, error: error.message };
      }
    });

    // Utility functions
    ipcMain.handle('get-default-documents-path', async () => {
      const path = app.getPath('documents');
      await this.logger.logUserAction('Default documents path requested', { path });
      return path;
    });

    ipcMain.handle('select-folder', async () => {
      try {
        await this.logger.logUserAction('Folder selection dialog opened');
        const result = await dialog.showOpenDialog(this.mainWindow, {
          properties: ['openDirectory'],
          title: 'Select Shared Folder Location'
        });

        if (!result.canceled && result.filePaths.length > 0) {
          await this.logger.logUserAction('Folder selected', { path: result.filePaths[0] });
          return result.filePaths[0];
        }
        await this.logger.logUserAction('Folder selection cancelled');
        return null;
      } catch (error) {
        await this.logger.error('Folder selection failed', error);
        return null;
      }
    });

    // Application lifecycle
    ipcMain.handle('restart-app', async () => {
      await this.logger.logUserAction('App restart requested');
      app.relaunch();
      app.exit();
    });

    // SQLite Management (for master installations)
    ipcMain.handle('start-database', async () => {
      try {
        await this.logger.logUserAction('Database start requested');
        const result = await this.sqliteManager.startDatabase();
        await this.logger.logDatabaseOperation('Database started manually');
        return result;
      } catch (error) {
        await this.logger.error('Failed to start database', error);
        throw error;
      }
    });

    ipcMain.handle('stop-database', async () => {
      try {
        await this.logger.logUserAction('Database stop requested');
        const result = await this.sqliteManager.stopDatabase();
        await this.logger.logDatabaseOperation('Database stopped manually');
        return result;
      } catch (error) {
        await this.logger.error('Failed to stop database', error);
        throw error;
      }
    });

    ipcMain.handle('get-database-status', async () => {
      await this.logger.logUserAction('Database status requested');
      return this.sqliteManager.isInitialized;
    });

    // Logging-related handlers
    ipcMain.handle('get-recent-logs', async (event, lines = 100) => {
      try {
        await this.logger.logUserAction('Recent logs requested', { lines });
        return await this.logger.getRecentLogs(lines);
      } catch (error) {
        await this.logger.error('Failed to get recent logs', error);
        return [];
      }
    });

    ipcMain.handle('export-logs', async () => {
      try {
        await this.logger.logUserAction('Log export requested');
        const exportPath = await this.logger.exportLogs();
        await this.logger.logSystemEvent('Logs exported', { exportPath });
        return exportPath;
      } catch (error) {
        await this.logger.error('Failed to export logs', error);
        throw error;
      }
    });

    ipcMain.handle('get-config-sync', () => {
      try {
        return this.configManager ? this.configManager.loadConfig() : {};
      } catch (error) {
        return {};
      }
    });

    ipcMain.handle('test-master-services', async (event, config) => {
      try {
        await this.logger.logUserAction('Testing master services connection', config);
        
        const { masterHost, patientServicePort, visitServicePort, reportsServicePort } = config;
        
        // Test each service endpoint
        const testUrls = [
          `http://${masterHost}:${patientServicePort}/Patients`,
          `http://${masterHost}:${visitServicePort}/Visittypes`, 
          `http://${masterHost}:${reportsServicePort}/reports/today`
        ];
        
        const testResults = [];
        
        for (let i = 0; i < testUrls.length; i++) {
          const url = testUrls[i];
          const serviceName = ['Patient', 'Visit', 'Reports'][i];
          
          try {
            // Use Node.js fetch or http module to test connection
            const response = await fetch(url, { 
              method: 'GET',
              timeout: 5000 // 5 second timeout
            });
            
            if (response.ok) {
              testResults.push({ service: serviceName, success: true });
            } else {
              testResults.push({ 
                service: serviceName, 
                success: false, 
                error: `HTTP ${response.status}` 
              });
            }
          } catch (error) {
            testResults.push({ 
              service: serviceName, 
              success: false, 
              error: error.message 
            });
          }
        }
        
        const allSuccessful = testResults.every(result => result.success);
        const failedServices = testResults.filter(result => !result.success);
        
        await this.logger.logSystemEvent('Master services test completed', {
          allSuccessful,
          testResults
        });
        
        if (allSuccessful) {
          return { 
            success: true, 
            message: 'All services are accessible',
            results: testResults
          };
        } else {
          return { 
            success: false, 
            error: `Failed to connect to: ${failedServices.map(s => s.service).join(', ')}`,
            results: testResults
          };
        }
        
      } catch (error) {
        await this.logger.error('Master services test failed', error, config);
        return { success: false, error: error.message };
      }
    });
    
    
  }

  async testMasterServices(config) {
    try {
      const { masterHost, patientServicePort, visitServicePort, reportsServicePort } = config;
      
      // Simple HTTP requests to test connectivity
      const testUrls = [
        `http://${masterHost}:${patientServicePort}/Patients`,
        `http://${masterHost}:${visitServicePort}/Visittypes`,
        `http://${masterHost}:${reportsServicePort}/reports/today`
      ];
      
      for (const url of testUrls) {
        try {
          const response = await fetch(url, { 
            method: 'GET',
            timeout: 5000,
            // Add CORS headers if needed
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          // Try to parse response to ensure service is working properly
          await response.json();
          
        } catch (error) {
          await this.logger.error('Master service test failed', error, { url });
          return { 
            success: false, 
            error: `Failed to connect to ${url}: ${error.message}` 
          };
        }
      }
      
      await this.logger.logSystemEvent('Master services connectivity test passed');
      return { success: true };
      
    } catch (error) {
      await this.logger.error('Master services test failed', error);
      return { success: false, error: error.message };
    }
  }

  async testDatabaseConnection(config) {
    try {
      await this.logger.logDatabaseOperation('Testing database connection');
      // For SQLite, just test if we can create/access the database
      await this.sqliteManager.startDatabase();
      await this.logger.logDatabaseOperation('Database connection test successful');
      return { success: true };
    } catch (error) {
      await this.logger.error('Database connection test failed', error);
      return { success: false, error: error.message };
    }
  }

  async startup() {
    try {
      await this.initialize();

      // Check license before creating window
      const licenseStatus = await this.licenseManager.checkLicense();

      if (!licenseStatus.isValid) {
        await this.logger.warn('License expired or invalid at startup');
      }

      this.createWindow();

      // If this is a setup complete, start services
      if (this.isSetupComplete) {
        try {
          const config = await this.configManager.getConfig();

          if (config.installationType === 'master') {
            await this.logger.logSystemEvent('Starting SQLite database for master installation');
            await this.sqliteManager.startDatabase();
          }

          // Start backend services
          await this.backendManager.startServices(config.installationType, config);
          await this.logger.logSystemEvent('Backend services started at startup');

        } catch (error) {
          await this.logger.error('Error starting services at startup', error);
        }
      }
    } catch (error) {
      if (this.logger) {
        await this.logger.error('Startup failed', error);
      }
      console.error('Startup failed:', error);
    }
  }

  async shutdown() {
    try {
      await this.logger.logSystemEvent('App shutdown started');

      // Stop license tracking
      if (this.licenseManager) {
        this.licenseManager.stopUsageTracking();
        await this.logger.logLicenseEvent('Usage tracking stopped during shutdown');
      }

      // Stop backend services
      if (this.backendManager) {
        await this.logger.logSystemEvent('Stopping backend services');
        await this.backendManager.stopAllServices();
      }

      // Stop SQLite if running
      if (this.sqliteManager && this.sqliteManager.isInitialized) {
        await this.logger.logSystemEvent('Stopping SQLite database');
        await this.sqliteManager.stopDatabase();
      }

      await this.logger.logSystemEvent('App shutdown completed');
    } catch (error) {
      if (this.logger) {
        await this.logger.error('Error during shutdown', error);
      }
      console.error('Shutdown error:', error);
    }
  }
}

// Create app instance
const doctorApp = new DoctorApp();

// Global error handlers
process.on('uncaughtException', async (error) => {
  console.error('Uncaught Exception:', error);
  if (doctorApp.logger) {
    await doctorApp.logger.error('Uncaught Exception', error);
  }
  // Don't exit in production, just log
  if (!isDev) {
    return;
  }
  process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  if (doctorApp.logger) {
    await doctorApp.logger.error('Unhandled Rejection', reason instanceof Error ? reason : new Error(reason));
  }
});

// App event handlers
app.whenReady().then(() => {
  doctorApp.startup();

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await doctorApp.logger.logSystemEvent('App reactivated, creating new window');
      doctorApp.createWindow();
    }
  });
});

app.on('window-all-closed', async () => {
  await doctorApp.shutdown();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', async (event) => {
  if (backendManager) {
    event.preventDefault(); // Prevent immediate quit

    try {
      await backendManager.gracefulShutdown();
    } catch (error) {
      console.error('Error during graceful shutdown:', error);
    }

    // Now allow the app to quit
    app.quit();
  }
});

// Handle certificate errors in development
if (isDev) {
  app.on('certificate-error', async (event, webContents, url, error, certificate, callback) => {
    event.preventDefault();
    callback(true);
    if (doctorApp.logger) {
      await doctorApp.logger.warn('Certificate error ignored in development', { url, error });
    }
  });
}