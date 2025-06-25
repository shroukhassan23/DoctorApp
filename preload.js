const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Admin rights check
  checkAdminRights: () => ipcRenderer.invoke('check-admin-rights'),
  
  // Directory selection
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  
  // Installation process
  startInstallation: (options) => ipcRenderer.invoke('start-installation', options),
  
  // Database connection test
  testDatabaseConnection: (dbConfig) => ipcRenderer.invoke('test-database-connection', dbConfig),
  
  // System information
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  
  // Listen for installation progress updates
  onInstallationProgress: (callback) => {
    ipcRenderer.on('installation-progress', (event, progress) => {
      callback(progress);
    });
  },
  
  // Remove installation progress listener
  removeInstallationProgressListener: () => {
    ipcRenderer.removeAllListeners('installation-progress');
  },
  
  // Show message box
  showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),
  
  // Validate installation path
  validatePath: (path) => ipcRenderer.invoke('validate-path', path),
  
  // Check Docker installation
  checkDockerInstallation: () => ipcRenderer.invoke('check-docker-installation'),
  
  // Generate configuration file
  generateConfigFile: (config) => ipcRenderer.invoke('generate-config-file', config)
});