const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const SQLiteManager = require('./src/utils/sqliteManager.cjs');
const LicenseManager = require('./src/utils/licenseManager.cjs');
const ConfigManager = require('./src/utils/configManager.cjs');
const BackendManager = require('./src/utils/backendManager.cjs');

const isDev = process.env.ELECTRON_DEV === 'true';

class DoctorApp {
  constructor() {
    this.mainWindow = null;
    this.sqliteManager = new SQLiteManager();
    this.licenseManager = new LicenseManager();
    this.configManager = null;
    this.backendManager = null;
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
    const appPath = isDev ?
      process.cwd() :
      process.resourcesPath;  // Point to Resources folder
    this.sqliteManager.initializePaths(appPath);

    // Initialize other managers
    this.configManager = new ConfigManager(this.appDataPath);
    this.backendManager = new BackendManager(__dirname);

    // Check if setup is complete
    await this.checkSetupStatus();

    // Set up IPC handlers
    this.setupIPCHandlers();
  }

  async checkSetupStatus() {
    try {
      this.isSetupComplete = await this.configManager.isSetupComplete();
      console.log('Setup status check:', {
        isSetupComplete: this.isSetupComplete,
        configPath: this.configManager.configPath
      });

      // Debug: Log the config content if it exists
      if (this.isSetupComplete) {
        const config = await this.configManager.getConfig();
        console.log('Existing config:', config);
      }
    } catch (error) {
      console.log('Setup status check error:', error);
      this.isSetupComplete = false;
    }
  }

  async saveSetupConfig(installationType, config) {
    if (installationType === 'master') {
      await this.configManager.saveMasterConfig(config);
    } else {
      await this.configManager.saveClientConfig(config);
    }
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
        console.log('Setting up master installation...');

        // Start SQLite database
        await this.sqliteManager.startDatabase();
        console.log('SQLite database started successfully');

        // Create shared folder
        await fs.mkdir(config.sharedFolderPath, { recursive: true });
        console.log('Created shared folder:', config.sharedFolderPath);

        // Save configuration
        await this.saveSetupConfig('master', config);
        console.log('Configuration saved');

        // Start backend services
        const fullConfig = await this.configManager.getConfig();
        await this.backendManager.startServices('master', fullConfig);
        console.log('Backend services started');

        return { success: true };
      } catch (error) {
        console.error('Master installation failed:', error);
        throw error;
      }
    });

    ipcMain.handle('get-config', async () => {
      try {
        return await this.configManager.getConfig();
      } catch (error) {
        console.error('Failed to get config:', error);
        return {};
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

        // Start backend services
        const fullConfig = await this.configManager.getConfig();
        await this.backendManager.startServices('client', fullConfig);
        console.log('Backend services started');

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

    // SQLite Management (for master installations)
    ipcMain.handle('start-database', async () => {
      return await this.sqliteManager.startDatabase();
    });

    ipcMain.handle('stop-database', async () => {
      return await this.sqliteManager.stopDatabase();
    });

    ipcMain.handle('get-database-status', () => {
      return this.sqliteManager.isInitialized;
    });
  }

  async testDatabaseConnection(config) {
    try {
      // For SQLite, just test if we can create/access the database
      await this.sqliteManager.startDatabase();
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

    // If this is a setup complete, start services
    if (this.isSetupComplete) {
      try {
        const config = await this.configManager.getConfig();

        if (config.installationType === 'master') {
          console.log('Starting SQLite database for master installation...');
          await this.sqliteManager.startDatabase();
        }

        // Start backend services
        await this.backendManager.startServices(config.installationType, config);
        console.log('Backend services started');

      } catch (error) {
        console.error('Error starting services:', error);
      }
    }
  }

  async shutdown() {
    // Stop license tracking
    if (this.licenseManager) {
      this.licenseManager.stopUsageTracking();
    }

    // Stop backend services
    if (this.backendManager) {
      console.log('Stopping backend services...');
      await this.backendManager.stopAllServices();
    }

    // Stop MySQL if running
    if (this.sqliteManager && this.sqliteManager.isInitialized) {
      console.log('Stopping SQLite database...');
      await this.sqliteManager.stopDatabase();
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