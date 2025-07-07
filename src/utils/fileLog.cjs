const fs = require('fs').promises;
const path = require('path');

class SimpleFileLogger {
  constructor(logName = 'app', logDir = null) {
    this.logName = logName;
    this.logDir = logDir || this.getDefaultLogDir();
    this.logFile = path.join(this.logDir, `${logName}.log`);
    this.initialized = false;
  }

  getDefaultLogDir() {
    // Use environment variable if set
    if (process.env.LOG_DIR) {
      return process.env.LOG_DIR;
    }
    
    // Use installation directory logs folder
    if (process.env.INSTALL_PATH) {
      return path.join(process.env.INSTALL_PATH, 'logs');
    }
    
    // Fallback: use executable directory
    const execDir = path.dirname(process.execPath);
    return path.join(execDir, 'logs');
  }
  
  async initialize() {
    if (this.initialized) return;
    
    try {
      // Ensure log directory exists
      await fs.mkdir(this.logDir, { recursive: true });
      this.initialized = true;
      
      // Write initialization message
      await this.info('Logger initialized', { logFile: this.logFile });
    } catch (error) {
      console.error('Failed to initialize logger:', error);
      throw error;
    }
  }

  formatLogEntry(level, message, metadata = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(metadata).length > 0 ? 
      ` | ${JSON.stringify(metadata)}` : '';
    
    return `[${timestamp}] [${level.toUpperCase()}] [${this.logName}] ${message}${metaStr}\n`;
  }

  async writeLog(level, message, metadata = {}) {
    try {
      // Initialize if not done yet
      if (!this.initialized) {
        await this.initialize();
      }

      const logEntry = this.formatLogEntry(level, message, metadata);
      
      // Append to log file
      await fs.appendFile(this.logFile, logEntry);
      
      // Also log to console for development
      if (process.env.NODE_ENV === 'development' || process.env.ELECTRON_DEV === 'true') {
        console.log(logEntry.trim());
      }
      
    } catch (error) {
      // Fallback to console if file logging fails
      console.error('Failed to write to log file:', error);
      console.log(`[${level.toUpperCase()}] [${this.logName}] ${message}`);
    }
  }

  async info(message, metadata = {}) {
    await this.writeLog('info', message, metadata);
  }

  async warn(message, metadata = {}) {
    await this.writeLog('warn', message, metadata);
  }

  async error(message, metadata = {}) {
    await this.writeLog('error', message, metadata);
  }

  async debug(message, metadata = {}) {
    await this.writeLog('debug', message, metadata);
  }

  async trace(message, metadata = {}) {
    await this.writeLog('trace', message, metadata);
  }

  // Method to rotate logs if they get too large
  async rotateLogs(maxSizeBytes = 10 * 1024 * 1024) { // 10MB default
    try {
      const stats = await fs.stat(this.logFile);
      
      if (stats.size > maxSizeBytes) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const archiveFile = path.join(
          this.logDir, 
          `${this.logName}-${timestamp}.log`
        );
        
        // Move current log to archive
        await fs.rename(this.logFile, archiveFile);
        
        // Log rotation event
        await this.info('Log rotated', { 
          archivedTo: archiveFile,
          originalSize: stats.size 
        });
      }
    } catch (error) {
      await this.error('Log rotation failed', { error: error.message });
    }
  }

  // Method to clean old log files
  async cleanOldLogs(daysToKeep = 30) {
    try {
      const files = await fs.readdir(this.logDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      for (const file of files) {
        if (file.startsWith(this.logName) && file.endsWith('.log') && file !== `${this.logName}.log`) {
          const filePath = path.join(this.logDir, file);
          const stats = await fs.stat(filePath);
          
          if (stats.mtime < cutoffDate) {
            await fs.unlink(filePath);
            await this.info('Old log file deleted', { file: file });
          }
        }
      }
    } catch (error) {
      await this.error('Failed to clean old logs', { error: error.message });
    }
  }

  // Get current log file path
  getLogFile() {
    return this.logFile;
  }

  // Read recent log entries
  async getRecentLogs(lines = 100) {
    try {
      const content = await fs.readFile(this.logFile, 'utf8');
      const logLines = content.split('\n').filter(line => line.trim());
      
      return logLines.slice(-lines);
    } catch (error) {
      await this.error('Failed to read recent logs', { error: error.message });
      return [];
    }
  }
}

module.exports = SimpleFileLogger;