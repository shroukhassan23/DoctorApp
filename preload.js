const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // License Management
  getLicenseInfo: () => ipcRenderer.invoke('get-license-info'),
  activateLicense: (licenseKey) => ipcRenderer.invoke('activate-license', licenseKey),
  checkLicense: () => ipcRenderer.invoke('check-license'),
  writeLog: (data) => ipcRenderer.invoke('write-log', data),

  // Setup Management
  isSetupComplete: () => ipcRenderer.invoke('is-setup-complete'),
  setupMasterInstallation: (config) => ipcRenderer.invoke('setup-master-installation', config),
  setupClientConfiguration: (config) => ipcRenderer.invoke('setup-client-configuration', config),
  
  // Connection Testing - SQLite doesn't need network testing
  testDatabaseConnection: (config) => ipcRenderer.invoke('test-database-connection', config),
  testSharedFolder: (folderPath) => ipcRenderer.invoke('test-shared-folder', folderPath),
  testMasterServices: (config) => ipcRenderer.invoke('test-master-services', config), // Add this line

  // Configuration Access
  getConfig: () => ipcRenderer.invoke('get-config'),
  
  // Utility Functions
  getDefaultDocumentsPath: () => ipcRenderer.invoke('get-default-documents-path'),
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  restartApp: () => ipcRenderer.invoke('restart-app'),
  
  // Database Management
  startDatabase: () => ipcRenderer.invoke('start-database'),
  stopDatabase: () => ipcRenderer.invoke('stop-database'),
  getDatabaseStatus: () => ipcRenderer.invoke('get-database-status'),
  
  // Logging Functions
  getRecentLogs: (lines) => ipcRenderer.invoke('get-recent-logs', lines),
  exportLogs: () => ipcRenderer.invoke('export-logs'),

  getConfigSync: () => ipcRenderer.invoke('get-config-sync'),
  
  // App Information
  platform: process.platform,
  versions: process.versions
});

// Enhanced error handling for the renderer process
window.addEventListener('error', (event) => {
  console.error('Renderer Error:', event.error);
  // You can add additional error reporting here if needed
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Renderer Unhandled Rejection:', event.reason);
  // You can add additional error reporting here if needed
});