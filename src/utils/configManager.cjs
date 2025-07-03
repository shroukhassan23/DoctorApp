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

    async saveClientConfig(config) {
        const fullConfig = {
            installationType: 'client',
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
            createdAt: new Date().toISOString()
        };
        await this.saveConfig(fullConfig);
    }

    async getConfig() {
        return await this.loadConfig();
    }
}

module.exports = ConfigManager;