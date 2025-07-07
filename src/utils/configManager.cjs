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
                port: 3001
            },
            sharedFolderPath: config.sharedFolderPath,
            installAsServices: config.installAsServices || true,
            createdAt: new Date().toISOString()
        };
        await this.saveConfig(fullConfig);
    }

    async saveClientConfig(config) {
        const fullConfig = {
            installationType: 'client',
            setupComplete: true,
            masterHost: config.masterHost,
            servicePort: config.servicePort || 3001,
            database: null,
            services: null,
            sharedFolderPath: null,
            createdAt: new Date().toISOString()
        };
        await this.saveConfig(fullConfig);
    }

    getServicePorts() {
        return {
            port: 3001
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
            // Client connects to remote master combined service
            const port = config.servicePort || 3001;
            return {
                base: `http://${config.masterHost}:${port}`
            };
        } else {
            // Master uses local combined service
            return {
                base: `http://localhost:${config.services?.port || 3001}`
            };
        }
    }

    // Validate client configuration
    async validateClientConfig() {
        const config = await this.loadConfig();

        if (config.installationType !== 'client') {
            return { valid: true, message: 'Not a client installation' };
        }

        const required = ['masterHost', 'servicePort'];
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
                    sharedFolderPath: config.sharedFolderPath,
                    installAsServices: config.installAsServices
                }),
                ...(config.installationType === 'client' && {
                    masterHost: config.masterHost,
                    servicePort: config.servicePort
                })
            };
        } catch (error) {
            return { error: error.message };
        }
    }
}

module.exports = ConfigManager;