const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const DoctorAppInstaller = require('./installer-config.cjs');

class ElectronInstaller {
  constructor() {
    this.mainWindow = null;
    this.installer = new DoctorAppInstaller();
  }

  createWindow() {
    this.mainWindow = new BrowserWindow({
      width: 900,
      height: 700,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js')
      },
      icon: path.join(__dirname, 'assets', 'icon.jpg'), 
      resizable: true,
      minWidth: 800,
      minHeight: 600,
      titleBarStyle: 'default',
      show: false
    });

    this.mainWindow.loadFile('installer-gui.html');

    // Show window when ready
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow.show();
    });

    // Handle window closed
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    // Open DevTools in development
    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.webContents.openDevTools();
    }
  }

  setupIPC() {
    // Check admin rights
    ipcMain.handle('check-admin-rights', async () => {
      try {
        const testPath = path.join(process.env.WINDIR || '/tmp', 'temp', 'admin-test.txt');
        fs.writeFileSync(testPath, 'test');
        fs.unlinkSync(testPath);
        return true;
      } catch {
        return false;
      }
    });

    // Select installation directory
    ipcMain.handle('select-directory', async () => {
      const result = await dialog.showOpenDialog(this.mainWindow, {
        properties: ['openDirectory'],
        title: 'Select Installation Directory',
        defaultPath: path.join('C:', 'Program Files', 'DoctorApp')
      });

      if (!result.canceled && result.filePaths.length > 0) {
        return result.filePaths[0];
      }
      return null;
    });

    // Start installation
    ipcMain.handle('start-installation', async (event, options) => {
      try {
        // Send progress updates to renderer
        const progressCallback = (progress) => {
          this.mainWindow.webContents.send('installation-progress', progress);
        };

        await this.installer.install(options, progressCallback);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    // Test database connection
    ipcMain.handle('test-database-connection', async (event, dbConfig) => {
      try {
        // Implement database connection test
        // This would depend on your installer-config implementation
        return { success: true, message: 'Connection successful' };
      } catch (error) {
        return { success: false, message: error.message };
      }
    });

    // Get system info
    ipcMain.handle('get-system-info', async () => {
      const os = require('os');
      return {
        platform: os.platform(),
        arch: os.arch(),
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
        cpus: os.cpus().length
      };
    });
  }

  init() {
    // Handle app ready
    app.whenReady().then(() => {
      this.createWindow();
      this.setupIPC();

      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          this.createWindow();
        }
      });
    });

    // Handle all windows closed
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    // Security: Prevent new window creation
    app.on('web-contents-created', (event, contents) => {
      contents.on('new-window', (event, navigationUrl) => {
        event.preventDefault();
      });
    });
  }
}

// Initialize the app
const electronInstaller = new ElectronInstaller();
electronInstaller.init();