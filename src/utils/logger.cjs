const fs = require('fs').promises;
const path = require('path');

class Logger {
  constructor(installPath) {
    this.installPath = installPath;
    this.logFilePath = path.join(installPath, 'logs');
    this.currentLogFile = null;
    this.maxLogSize = 10 * 1024 * 1024; // 10MB
    this.maxLogFiles = 5; // Keep last 5 log files
    this.initialized = false;
  }

  async initialize() {
    try {
      // Create logs directory if it doesn't exist
      await fs.mkdir(this.logFilePath, { recursive: true });
      
      // Set current log file name
      const today = new Date().toISOString().split('T')[0];
      this.currentLogFile = path.join(this.logFilePath, `app-${today}.log`);
      
      // Clean up old log files
      await this.cleanupOldLogs();
      
      this.initialized = true;
      await this.info('Logger initialized successfully');
    } catch (error) {
      console.error('Failed to initialize logger:', error);
    }
  }

  async writeLog(level, message, error = null, context = {}) {
    if (!this.initialized) {
      console.log(`[${level}] ${message}`);
      return;
    }

    try {
      const timestamp = new Date().toISOString();
      const logEntry = {
        timestamp,
        level,
        message,
        context,
        ...(error && {
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack
          }
        })
      };

      const logLine = JSON.stringify(logEntry) + '\n';
      
      // Check if log file needs rotation
      await this.checkLogRotation();
      
      // Write to log file
      await fs.appendFile(this.currentLogFile, logLine);
      
      // Also log to console in development
      if (process.env.ELECTRON_DEV === 'true') {
        console.log(`[${level}] ${message}`, context, error);
      }
    } catch (writeError) {
      console.error('Failed to write log:', writeError);
    }
  }

  async checkLogRotation() {
    try {
      const stats = await fs.stat(this.currentLogFile);
      
      if (stats.size > this.maxLogSize) {
        // Create new log file with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const newLogFile = path.join(this.logFilePath, `app-${timestamp}.log`);
        this.currentLogFile = newLogFile;
        
        // Clean up old files
        await this.cleanupOldLogs();
      }
    } catch (error) {
      // File doesn't exist yet, that's fine
    }
  }

  async cleanupOldLogs() {
    try {
      const files = await fs.readdir(this.logFilePath);
      const logFiles = files
        .filter(file => file.startsWith('app-') && file.endsWith('.log'))
        .map(file => ({
          name: file,
          path: path.join(this.logFilePath, file)
        }));

      if (logFiles.length > this.maxLogFiles) {
        // Sort by name (which includes date) and remove oldest
        const sortedFiles = logFiles.sort((a, b) => a.name.localeCompare(b.name));
        const filesToDelete = sortedFiles.slice(0, sortedFiles.length - this.maxLogFiles);
        
        for (const file of filesToDelete) {
          await fs.unlink(file.path);
        }
      }
    } catch (error) {
      console.error('Failed to cleanup old logs:', error);
    }
  }

  // Log level methods
  async error(message, error = null, context = {}) {
    await this.writeLog('ERROR', message, error, context);
  }

  async warn(message, context = {}) {
    await this.writeLog('WARN', message, null, context);
  }

  async info(message, context = {}) {
    await this.writeLog('INFO', message, null, context);
  }

  async debug(message, context = {}) {
    await this.writeLog('DEBUG', message, null, context);
  }

  // Specialized logging methods
  async logUserAction(action, details = {}) {
    await this.info(`User Action: ${action}`, { 
      type: 'user_action', 
      action, 
      ...details 
    });
  }

  async logSystemEvent(event, details = {}) {
    await this.info(`System Event: ${event}`, { 
      type: 'system_event', 
      event, 
      ...details 
    });
  }

  async logDatabaseOperation(operation, details = {}) {
    await this.info(`Database Operation: ${operation}`, { 
      type: 'database_operation', 
      operation, 
      ...details 
    });
  }

  async logLicenseEvent(event, details = {}) {
    await this.info(`License Event: ${event}`, { 
      type: 'license_event', 
      event, 
      ...details 
    });
  }

  // Get recent logs for debugging
  async getRecentLogs(lines = 100) {
    try {
      const logContent = await fs.readFile(this.currentLogFile, 'utf8');
      const logLines = logContent.split('\n').filter(line => line.trim());
      
      return logLines
        .slice(-lines)
        .map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return { raw: line };
          }
        });
    } catch (error) {
      return [];
    }
  }

  // Export logs for support
  async exportLogs() {
    try {
      const files = await fs.readdir(this.logFilePath);
      const logFiles = files.filter(file => file.startsWith('app-') && file.endsWith('.log'));
      
      let allLogs = '';
      for (const file of logFiles.sort()) {
        const content = await fs.readFile(path.join(this.logFilePath, file), 'utf8');
        allLogs += `\n\n=== ${file} ===\n${content}`;
      }
      
      const exportPath = path.join(this.appDataPath, `logs-export-${Date.now()}.txt`);
      await fs.writeFile(exportPath, allLogs);
      
      return exportPath;
    } catch (error) {
      throw new Error(`Failed to export logs: ${error.message}`);
    }
  }
}

module.exports = Logger;