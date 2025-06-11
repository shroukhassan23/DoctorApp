const { app, BrowserWindow } = require('electron');
const path = require('path');

const isDev = process.env.ELECTRON_DEV === 'true';

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: !isDev, // Only disable in development
    },
    show: false,
  });

  // Load the app
  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    // Fix: Ensure correct path to dist folder
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    console.log('Loading file from:', indexPath);
    console.log('__dirname is:', __dirname);
    
    // Check if file exists before loading
    const fs = require('fs');
    if (fs.existsSync(indexPath)) {
      console.log('index.html found, loading...');
      win.loadFile(indexPath).catch(err => {
        console.error('Failed to load file:', err);
      });
    } else {
      console.error('index.html not found at:', indexPath);
      // Try alternative path
      const altPath = path.join(__dirname, '..', 'dist', 'index.html');
      console.log('Trying alternative path:', altPath);
      if (fs.existsSync(altPath)) {
        win.loadFile(altPath).catch(err => {
          console.error('Failed to load alternative file:', err);
        });
      } else {
        console.error('No valid index.html found');
      }
    }
  }

  // Show window when ready
  win.once('ready-to-show', () => {
    win.show();
  });

  // Enhanced debugging
  win.webContents.once('did-finish-load', () => {
    console.log('Page finished loading successfully');
  });

  win.webContents.on('console-message', (event, level, message) => {
    console.log(`Renderer console [${level}]:`, message);
  });

  win.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Failed to load:', {
      errorCode,
      errorDescription,
      validatedURL
    });
  });

  // Additional debugging for resource loading
  win.webContents.session.webRequest.onBeforeRequest((details, callback) => {
    console.log('Requesting:', details.url);
    callback({});
  });

  win.webContents.session.webRequest.onErrorOccurred((details) => {
    console.error('Resource load error:', details.url, details.error);
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Only handle certificate errors in development
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  if (isDev) {
    event.preventDefault();
    callback(true);
  } else {
    callback(false);
  }
});