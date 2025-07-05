const fs = require('fs');
const path = require('path');

class ConfigManager {
    constructor(appDataPath) {
        this.configPath = path.join(appDataPath, 'config.json');
    }

    async clearConfig() {
        try {
            await fs.promises.unlink(this.configPath);
            console.log('Config file cleared successfully');
        } catch (error) {
            console.log('No config file to clear or error clearing:', error.message);
        }
    }

    async isSetupComplete() {
        try {
            await fs.promises.access(this.configPath);
            const config = await this.loadConfig();
            return config.setupComplete === true;
        } catch {
            return false;
        }
    }

    async loadConfig() {
        try {
            const data = await fs.promises.readFile(this.configPath, 'utf8');
            return JSON.parse(data);
        } catch {
            return {};
        }
    }

    async saveConfig(config) {
        await fs.promises.writeFile(this.configPath, JSON.stringify(config, null, 2));
    }

    async saveMasterConfig(config) {
        const fullConfig = {
            installationType: 'master',
            setupComplete: true,
            database: {
                type: 'sqlite',
                database: 'doctor'
            },
            services: {
                patientPort: 3001,
                visitPort: 3002,
                reportsPort: 3003
            },
            sharedFolderPath: config.sharedFolderPath,
            installAsServices: true,
            createdAt: new Date().toISOString()
        };
        await this.saveConfig(fullConfig);
    }

    async saveClientConfig(config) {
        const fullConfig = {
            installationType: 'client',
            setupComplete: true,
            // Client configuration - connect to master services
            masterHost: config.masterHost,
            patientServicePort: config.patientServicePort || '3001',
            visitServicePort: config.visitServicePort || '3002', 
            reportsServicePort: config.reportsServicePort || '3003',
            // No local database configuration for clients
            database: null,
            services: null,
            sharedFolderPath: null, // Clients don't have local shared folders
            createdAt: new Date().toISOString()
        };
        await this.saveConfig(fullConfig);
    }

    getServicePorts() {
        return {
            patientPort: 3001,
            visitPort: 3002,
            reportsPort: 3003
        };
    }

    async getConfig() {
        return await this.loadConfig();
    }

    // Helper method to check if this is a client installation
    async isClientInstallation() {
        try {
            const config = await this.loadConfig();
            return config.installationType === 'client';
        } catch {
            return false;
        }
    }

    // Helper method to check if this is a master installation
    async isMasterInstallation() {
        try {
            const config = await this.loadConfig();
            return config.installationType === 'master';
        } catch {
            return false;
        }
    }

    // Get service URLs for the current configuration
    async getServiceUrls() {
        const config = await this.loadConfig();
        
        if (config.installationType === 'client') {
            // Client connects to remote master services
            return {
                patient: `http://${config.masterHost}:${config.patientServicePort}`,
                visit: `http://${config.masterHost}:${config.visitServicePort}`,
                reports: `http://${config.masterHost}:${config.reportsServicePort}`
            };
        } else {
            // Master uses local services
            return {
                patient: `http://localhost:${config.services?.patientPort || 3001}`,
                visit: `http://localhost:${config.services?.visitPort || 3002}`,
                reports: `http://localhost:${config.services?.reportsPort || 3003}`
            };
        }
    }

    // Validate client configuration
    async validateClientConfig() {
        const config = await this.loadConfig();
        
        if (config.installationType !== 'client') {
            return { valid: true, message: 'Not a client installation' };
        }

        const required = ['masterHost', 'patientServicePort', 'visitServicePort', 'reportsServicePort'];
        const missing = required.filter(field => !config[field]);

        if (missing.length > 0) {
            return { 
                valid: false, 
                message: `Missing client configuration: ${missing.join(', ')}` 
            };
        }

        return { valid: true, message: 'Client configuration is valid' };
    }

    // Update master host for client configurations
    async updateMasterHost(newHost) {
        const config = await this.loadConfig();
        
        if (config.installationType === 'client') {
            config.masterHost = newHost;
            config.updatedAt = new Date().toISOString();
            await this.saveConfig(config);
            return true;
        }
        
        return false;
    }

    // Get configuration summary for debugging
    async getConfigSummary() {
        try {
            const config = await this.loadConfig();
            
            return {
                installationType: config.installationType,
                setupComplete: config.setupComplete,
                createdAt: config.createdAt,
                updatedAt: config.updatedAt,
                ...(config.installationType === 'master' && {
                    hasDatabase: !!config.database,
                    hasServices: !!config.services,
                    sharedFolderPath: config.sharedFolderPath
                }),
                ...(config.installationType === 'client' && {
                    masterHost: config.masterHost,
                    servicesPorts: {
                        patient: config.patientServicePort,
                        visit: config.visitServicePort,
                        reports: config.reportsServicePort
                    }
                })
            };
        } catch (error) {
            return { error: error.message };
        }
    }
}

module.exports = ConfigManager;