const fs = require('fs');
const path = require('path');
const os = require('os');
const { machineId: getMachineId } = require('node-machine-id');

class LicenseManager {
  constructor() {
    this.licenseKey = "DoctorPassw0rd";
    this.trialDurationHours = 0.02;
    this.configPath = null;
    this.machineId = null;
    this.platform = os.platform();
    this.isWindows = this.platform === 'win32';
    this.registryPath = 'HKCU\\Software\\DoctorApp';
  }

  async initialize(appDataPath) {
    this.configPath = path.join(appDataPath, 'license.dat');
    this.machineId = await getMachineId();
    
    // Initialize registry access for Windows
    if (this.isWindows) {
      await this.initializeWindowsRegistry();
    }
  }

  async initializeWindowsRegistry() {
    try {
      const { execSync } = require('child_process');
      // Create registry key if it doesn't exist
      execSync(`reg add "${this.registryPath}" /f`, { stdio: 'ignore' });
    } catch (error) {
      console.warn('Could not initialize Windows registry:', error.message);
    }
  }

  // Encrypt data using machine ID as key
  async loadLicenseData() {
    if (this.isWindows) {
      return await this.loadFromRegistry();
    } else {
      return await this.loadFromFile();
    }
  }

  async saveLicenseData(data) {
    if (this.isWindows) {
      await this.saveToRegistry(data);
    } else {
      await this.saveToFile(data);
    }
  }

  async loadFromRegistry() {
    try {
      const { execSync } = require('child_process');
      const result = execSync(`reg query "${this.registryPath}" /v LicenseData`, { encoding: 'utf8' });
      
      // Parse registry output
      const match = result.match(/LicenseData\s+REG_SZ\s+(.+)/);
      if (match) {
        const encodedData = match[1].trim();
        const jsonData = Buffer.from(encodedData, 'base64').toString('utf8');
        return JSON.parse(jsonData);
      }
    } catch (error) {
      console.log('No existing license data found in registry');
    }
    return null;
  }

  // Load license data from file
  async loadLicenseData() {
    try {
      const data = await fs.promises.readFile(this.configPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.log('No existing license data found');
    }
    return null;
  }

  async saveToRegistry(data) {
    try {
      const { execSync } = require('child_process');
      const jsonData = JSON.stringify(data);
      const encodedData = Buffer.from(jsonData).toString('base64');
      
      execSync(`reg add "${this.registryPath}" /v LicenseData /t REG_SZ /d "${encodedData}" /f`, { stdio: 'ignore' });
    } catch (error) {
      console.error('Error saving license data to registry:', error);
      // Fallback to file storage
      await this.saveToFile(data);
    }
  }

  // Save license data to file
  async saveLicenseData(data) {
    try {
      const jsonData = JSON.stringify(data);
      await fs.promises.writeFile(this.configPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
      console.error('Error saving license data:', error);
      throw error;
    }
  }

  async loadFromFile() {
    try {
      const data = await fs.promises.readFile(this.configPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.log('No existing license data found in file');
    }
    return null;
  }

  async saveToFile(data) {
    try {
      await fs.promises.writeFile(this.configPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
      console.error('Error saving license data to file:', error);
      throw error;
    }
  }

  // Initialize trial period
  async initializeTrial() {
    const licenseData = {
      type: 'trial',
      startTime: Date.now(),
      usageTimeMs: 0,
      lastActiveTime: Date.now(),
      machineId: this.machineId
    };

    await this.saveLicenseData(licenseData);
    return licenseData;
  }

  // Activate full license
  async activateLicense(enteredKey) {
    if (enteredKey !== this.licenseKey) {
      throw new Error('Invalid license key');
    }

    const licenseData = {
      type: 'full',
      activatedAt: Date.now(),
      licenseKey: enteredKey,
      machineId: this.machineId
    };

    await this.saveLicenseData(licenseData);
    return licenseData;
  }

  // Check license status
  async checkLicense() {
    let licenseData = await this.loadLicenseData();

    // First time run - initialize trial
    if (!licenseData) {
      licenseData = await this.initializeTrial();
    }

    // Validate machine ID (prevent license file copying)
    if (licenseData.machineId !== this.machineId) {
      console.log('License file machine ID mismatch - reinitializing trial');
      licenseData = await this.initializeTrial();
    }

    if (licenseData.type === 'full') {
      return {
        isValid: true,
        type: 'full',
        message: 'Licensed version'
      };
    }

    // Check trial status
    const usageHours = licenseData.usageTimeMs / (1000 * 60 * 60);
    const remainingHours = this.trialDurationHours - usageHours;

    if (remainingHours <= 0) {
      return {
        isValid: false,
        type: 'trial_expired',
        message: 'Trial period has expired. Please enter your license key.',
        usageHours: Math.round(usageHours * 100) / 100,
        totalHours: this.trialDurationHours
      };
    }

    return {
      isValid: true,
      type: 'trial',
      message: `Trial: ${Math.round(remainingHours * 100) / 100} hours remaining`,
      remainingHours: Math.round(remainingHours * 100) / 100,
      totalHours: this.trialDurationHours,
      usageHours: Math.round(usageHours * 100) / 100
    };
  }

  // Update usage time (call this periodically while app is active)
  async updateUsageTime() {
    const licenseData = await this.loadLicenseData();
    
    if (!licenseData || licenseData.type === 'full') {
      return; // No need to track for full license
    }

    const now = Date.now();
    const timeSinceLastUpdate = now - licenseData.lastActiveTime;
    
    // Only count time if less than 5 minutes since last update (user was active)
    if (timeSinceLastUpdate < 5 * 60 * 1000) {
      licenseData.usageTimeMs += timeSinceLastUpdate;
    }
    
    licenseData.lastActiveTime = now;
    await this.saveLicenseData(licenseData);
  }

  // Get license information for display
  async getLicenseInfo() {
    const licenseStatus = await this.checkLicense();
    const licenseData = await this.loadLicenseData();

    return {
      ...licenseStatus,
      startDate: licenseData?.startTime ? new Date(licenseData.startTime).toLocaleDateString() : null,
      activatedDate: licenseData?.activatedAt ? new Date(licenseData.activatedAt).toLocaleDateString() : null,
      machineId: this.machineId
    };
  }

  // Start usage tracking (call when app becomes active)
  startUsageTracking() {
    // Update usage every minute while app is active
    this.usageInterval = setInterval(async () => {
      await this.updateUsageTime();
    }, 60000); // 1 minute
  }

  // Stop usage tracking (call when app becomes inactive)
  stopUsageTracking() {
    if (this.usageInterval) {
      clearInterval(this.usageInterval);
      this.usageInterval = null;
    }
  }

  // Reset trial (for testing purposes - remove in production)
  async resetTrial() {
    try {
      await fs.promises.unlink(this.configPath);
      console.log('Trial reset successfully');
      return true;
    } catch (error) {
      console.log('No trial to reset or error:', error.message);
      return false;
    }
  }

  // Validate license key format
  isValidLicenseKeyFormat(key) {
    return key === this.licenseKey;
  }

  // Get trial progress percentage
  async getTrialProgress() {
    const licenseData = await this.loadLicenseData();
    
    if (!licenseData || licenseData.type === 'full') {
      return 100;
    }

    const usageHours = licenseData.usageTimeMs / (1000 * 60 * 60);
    const progressPercentage = (usageHours / this.trialDurationHours) * 100;
    
    return Math.min(100, Math.max(0, progressPercentage));
  }
}

module.exports = LicenseManager;