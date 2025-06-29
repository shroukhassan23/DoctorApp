// preload-minimal.js - Basic version without backend features
const { contextBridge } = require('electron');

// Expose minimal electron API
contextBridge.exposeInMainWorld('electron', {
  // Platform info
  platform: process.platform,
  versions: process.versions,
  
  // Minimal functions - just return defaults
  isSetupComplete: () => Promise.resolve(true),
  checkLicense: () => Promise.resolve({ 
    isValid: true, 
    type: 'minimal',
    message: 'Running in minimal mode'
  }),
  
  // Dummy functions to prevent errors
  getLicenseInfo: () => Promise.resolve({ 
    type: 'minimal',
    message: 'Minimal build - license features disabled'
  })
});

console.log('Minimal preload script loaded');