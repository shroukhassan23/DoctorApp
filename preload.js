// preload.js
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // License Management
  getLicenseInfo: () => ipcRenderer.invoke('get-license-info'),
  activateLicense: (licenseKey) => ipcRenderer.invoke('activate-license', licenseKey),
  checkLicense: () => ipcRenderer.invoke('check-license'),

  // Setup Management
  isSetupComplete: () => ipcRenderer.invoke('is-setup-complete'),
  setupMasterInstallation: (config) => ipcRenderer.invoke('setup-master-installation', config),
  setupClientConfiguration: (config) => ipcRenderer.invoke('setup-client-configuration', config),

  // Connection Testing - SQLite doesn't need network testing
  // testDatabaseConnection: (config) => ipcRenderer.invoke('test-database-connection', config),
  testSharedFolder: (folderPath) => ipcRenderer.invoke('test-shared-folder', folderPath),

  // Configuration Access
  getConfig: () => ipcRenderer.invoke('get-config'),

  // Utility Functions
  getDefaultDocumentsPath: () => ipcRenderer.invoke('get-default-documents-path'),
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  restartApp: () => ipcRenderer.invoke('restart-app'),

  // SQLite is file-based, no server management needed
  // startMySQL: (port) => ipcRenderer.invoke('start-mysql', port),
  // stopMySQL: () => ipcRenderer.invoke('stop-mysql'),
  // getMySQLStatus: () => ipcRenderer.invoke('get-mysql-status'),

  // App Information
  platform: process.platform,
  versions: process.versions
});