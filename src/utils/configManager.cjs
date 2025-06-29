const fs = require('fs');
const path = require('path');

class ConfigManager {
    constructor(appDataPath) {
        this.configPath = path.join(appDataPath, 'config.json');
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
                host: 'localhost',
                port: config.mysqlPort,
                user: 'root',
                password: '',
                database: 'doctor'
            },
            sharedFolderPath: config.sharedFolderPath,
            createdAt: new Date().toISOString()
        };
        await this.saveConfig(fullConfig);
    }

    async saveClientConfig(config) {
        const fullConfig = {
            installationType: 'client',
            setupComplete: true,
            database: {
                host: config.host,
                port: config.port,
                user: config.user,
                password: config.password,
                database: 'doctor'
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