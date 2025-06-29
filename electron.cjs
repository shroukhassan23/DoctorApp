// electron.cjs (Enhanced version)
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const MySQLManager = require('./src/utils/mysqlManager.cjs');
const LicenseManager = require('./src/utils/licenseManager.cjs');

const isDev = process.env.ELECTRON_DEV === 'true';

class DoctorApp {
  constructor() {
    this.mainWindow = null;
    this.mysqlManager = new MySQLManager();
    this.licenseManager = new LicenseManager();
    this.appDataPath = null;
    this.isSetupComplete = false;
  }

  async initialize() {
    // Set up app data directory
    this.appDataPath = path.join(app.getPath('userData'));
    await fs.mkdir(this.appDataPath, { recursive: true });

    // Initialize license manager
    await this.licenseManager.initialize(this.appDataPath);

    // Initialize MySQL paths
    const appPath = isDev ? process.cwd() : path.dirname(process.execPath);
    this.mysqlManager.initializePaths(appPath);

    // Check if setup is complete
    await this.checkSetupStatus();

    // Set up IPC handlers
    this.setupIPCHandlers();
  }

  async checkSetupStatus() {
    try {
      const configPath = path.join(this.appDataPath, 'app-config.json');
      const configData = await fs.readFile(configPath, 'utf8');
      const config = JSON.parse(configData);
      this.isSetupComplete = config.setupComplete || false;
    } catch {
      this.isSetupComplete = false;
    }
  }

  async saveSetupConfig(installationType, config) {
    const configPath = path.join(this.appDataPath, 'app-config.json');
    const configData = {
      setupComplete: true,
      installationType,
      ...config,
      setupDate: new Date().toISOString()
    };
    await fs.writeFile(configPath, JSON.stringify(configData, null, 2));
    this.isSetupComplete = true;
  }

  createWindow() {
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
    } else {
      const indexPath = path.join(__dirname, 'app_dist', 'index.html');
      this.mainWindow.loadFile(indexPath).catch(console.error);
    }

    // Show window when ready
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow.show();
    });

    // Start license usage tracking when window becomes focused
    this.mainWindow.on('focus', () => {
      this.licenseManager.startUsageTracking();
    });

    // Stop license usage tracking when window loses focus
    this.mainWindow.on('blur', () => {
      this.licenseManager.stopUsageTracking();
    });
  }

  setupIPCHandlers() {
    // License Management
    ipcMain.handle('get-license-info', async () => {
      return await this.licenseManager.getLicenseInfo();
    });

    ipcMain.handle('activate-license', async (event, licenseKey) => {
      return await this.licenseManager.activateLicense(licenseKey);
    });

    ipcMain.handle('check-license', async () => {
      return await this.licenseManager.checkLicense();
    });

    // Setup Management
    ipcMain.handle('is-setup-complete', () => {
      return this.isSetupComplete;
    });

    ipcMain.handle('setup-master-installation', async (event, config) => {
      try {
        console.log('Setting up master installation (MySQL disabled for testing)');
        
        // Create shared folder
        await fs.mkdir(config.sharedFolderPath, { recursive: true });
        console.log('Created shared folder:', config.sharedFolderPath);
    
        // Save configuration
        await this.saveSetupConfig('master', config);
        console.log('Configuration saved');
    
        return { success: true };
      } catch (error) {
        console.error('Master installation failed:', error);
        throw error;
      }
    });

    ipcMain.handle('setup-client-configuration', async (event, config) => {
      try {
        // Test connection first
        const testResult = await this.testDatabaseConnection(config);
        if (!testResult.success) {
          throw new Error(`Database connection failed: ${testResult.error}`);
        }

        // Save configuration
        await this.saveSetupConfig('client', config);

        return { success: true };
      } catch (error) {
        console.error('Client configuration failed:', error);
        throw error;
      }
    });

    // Connection Testing
    ipcMain.handle('test-database-connection', async (event, config) => {
      return await this.testDatabaseConnection(config);
    });

    ipcMain.handle('test-shared-folder', async (event, folderPath) => {
      try {
        await fs.access(folderPath);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    // Utility functions
    ipcMain.handle('get-default-documents-path', () => {
      return app.getPath('documents');
    });

    ipcMain.handle('select-folder', async () => {
      const result = await dialog.showOpenDialog(this.mainWindow, {
        properties: ['openDirectory'],
        title: 'Select Shared Folder Location'
      });
      
      if (!result.canceled && result.filePaths.length > 0) {
        return result.filePaths[0];
      }
      return null;
    });

    // Application lifecycle
    ipcMain.handle('restart-app', () => {
      app.relaunch();
      app.exit();
    });

    // MySQL Management (for master installations)
    ipcMain.handle('start-mysql', async (event, port) => {
      return await this.mysqlManager.startMySQL(port);
    });

    ipcMain.handle('stop-mysql', async () => {
      return await this.mysqlManager.stopMySQL();
    });

    ipcMain.handle('get-mysql-status', () => {
      return this.mysqlManager.mysqlProcess !== null;
    });
  }

  async testDatabaseConnection(config) {
    try {
      const mysql = require('mysql2/promise');
      const connection = await mysql.createConnection({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        connectTimeout: 5000
      });
      
      await connection.execute('SELECT 1');
      await connection.end();
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async startup() {
    await this.initialize();

    // Check license before creating window
    const licenseStatus = await this.licenseManager.checkLicense();
    
    if (!licenseStatus.isValid) {
      // License expired - still create window but it will show activation screen
      console.log('License expired or invalid');
    }

    this.createWindow();

    // If this is a master installation, start MySQL
    if (this.isSetupComplete) {
      try {
        const configPath = path.join(this.appDataPath, 'app-config.json');
        const configData = await fs.readFile(configPath, 'utf8');
        const config = JSON.parse(configData);
        
        if (config.installationType === 'master') {
          console.log('Starting MySQL for master installation...');
          await this.mysqlManager.startMySQL(config.mysqlPort || 3306);
        }
      } catch (error) {
        console.error('Error starting MySQL:', error);
      }
    }
  }

  async shutdown() {
    // Stop license tracking
    if (this.licenseManager) {
      this.licenseManager.stopUsageTracking();
    }
    
    // Stop MySQL if running
    if (this.mysqlManager && this.mysqlManager.mysqlProcess) {
      console.log('Stopping MySQL...');
      await this.mysqlManager.stopMySQL();
    }
  }
}

// Create app instance
const doctorApp = new DoctorApp();

// App event handlers
app.whenReady().then(() => {
  doctorApp.startup();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      doctorApp.createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  doctorApp.shutdown();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  doctorApp.shutdown();
});

// Handle certificate errors in development
if (isDev) {
  app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
    event.preventDefault();
    callback(true);
  });
}