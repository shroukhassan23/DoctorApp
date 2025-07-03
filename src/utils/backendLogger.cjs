
const fs = require('fs').promises;
const path = require('path');

class BackendLogger {
  constructor(serviceName, logDir = null) {
    this.serviceName = serviceName;
    this.logDir = logDir || path.join(process.cwd(), 'logs');
    this.logFilePath = path.join(this.logDir, `${serviceName}.log`);
    this.errorLogPath = path.join(this.logDir, `${serviceName}-error.log`);
    this.maxLogSize = 10 * 1024 * 1024; // 10MB
    this.maxLogFiles = 5;
    this.initialized = false;
  }

  async initialize() {
    try {
      // إنشاء مجلد الـ logs إذا لم يكن موجود
      await fs.mkdir(this.logDir, { recursive: true });
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
        service: this.serviceName,
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
      
      // كتابة في الـ log file العادي
      await this.checkLogRotation(this.logFilePath);
      await fs.appendFile(this.logFilePath, logLine);
      
      // كتابة الأخطاء في ملف منفصل
      if (level === 'ERROR') {
        await this.checkLogRotation(this.errorLogPath);
        await fs.appendFile(this.errorLogPath, logLine);
      }
      
      // عرض في الـ console
      console.log(`[${level}] [${this.serviceName}] ${message}`, context, error);
    } catch (writeError) {
      console.error('Failed to write log:', writeError);
    }
  }

  async checkLogRotation(filePath) {
    try {
      const stats = await fs.stat(filePath);
      
      if (stats.size > this.maxLogSize) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = `${filePath}.${timestamp}`;
        await fs.rename(filePath, backupPath);
        
        // تنظيف الملفات القديمة
        await this.cleanupOldLogs(path.dirname(filePath));
      }
    } catch (error) {
      // الملف غير موجود، لا مشكلة
    }
  }

  async cleanupOldLogs(logDir) {
    try {
      const files = await fs.readdir(logDir);
      const serviceLogFiles = files
        .filter(file => file.startsWith(this.serviceName) && file.includes('.log.'))
        .sort()
        .reverse();

      if (serviceLogFiles.length > this.maxLogFiles) {
        const filesToDelete = serviceLogFiles.slice(this.maxLogFiles);
        for (const file of filesToDelete) {
          await fs.unlink(path.join(logDir, file));
        }
      }
    } catch (error) {
      console.error('Failed to cleanup old logs:', error);
    }
  }

  // طرق الـ logging المختلفة
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

  // طرق مخصصة للـ API
  async logRequest(req, res, next) {
    const startTime = Date.now();
    
    await this.info('API Request', {
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      body: req.method === 'POST' || req.method === 'PUT' ? req.body : undefined
    });

    // Override res.json to log response
    const originalJson = res.json;
    res.json = (data)=> {
      const duration = Date.now() - startTime;
      this.info('API Response', {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        responseSize: JSON.stringify(data).length
      });
      return originalJson.call(this, data);
    };

    next();
  }

  async logDatabaseQuery(query, params = [], result = null, error = null) {
    if (error) {
      await this.error('Database Query Failed', error, { query, params });
    } else {
      await this.info('Database Query', {
        query,
        params,
        affectedRows: result?.affectedRows || result?.length || 0
      });
    }
  }

  async logUserAction(action, userId = null, details = {}) {
    await this.info(`User Action: ${action}`, {
      userId,
      action,
      ...details
    });
  }
}

module.exports = BackendLogger;