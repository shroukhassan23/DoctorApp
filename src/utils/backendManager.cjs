const { spawn } = require('child_process');
const path = require('path');

class BackendManager {
    constructor(appPath) {
        this.appPath = appPath;
        this.processes = new Map();
    }

    async startServices(installationType, config) {
        const services = [
            { name: 'patient', file: 'patient.cjs', port: 3001 },
            { name: 'visit', file: 'visit.cjs', port: 3002 },
            { name: 'reports', file: 'reports.cjs', port: 3003 }
        ];

        for (const service of services) {
            await this.startService(service, config);
        }
    }

    async startService(service, config) {
        try {
            const isDev = process.env.ELECTRON_DEV === 'true';
            const servicePath = isDev ? 
                path.join(this.appPath, service.file) : 
                path.join(this.appPath, '..', 'Resources', 'app.asar.unpacked', service.file);
            
            // Check if service file exists
            const fs = require('fs');
            if (!fs.existsSync(servicePath)) {
                console.error(`Service file not found: ${servicePath}`);
                // Try alternative path for Windows
                const altPath = path.join(this.appPath, 'resources', 'app.asar.unpacked', service.file);
                if (fs.existsSync(altPath)) {
                    servicePath = altPath;
                } else {
                    throw new Error(`Service file not found: ${service.file}`);
                }
            }
            
            const env = {
                ...process.env,
                DB_HOST: config.database?.host || 'localhost',
                DB_PORT: config.database?.port || '3306',
                DB_USER: config.database?.user || 'root',
                DB_PASSWORD: config.database?.password || '',
                DB_NAME: 'doctor',
                SHARED_FOLDER_PATH: config.sharedFolderPath || '',
                NODE_ENV: 'production'
            };

            // Determine node executable path
            const nodeExecutable = process.platform === 'win32' ? 'node.exe' : 'node';
            const nodePath = isDev ? nodeExecutable : path.join(process.resourcesPath, 'node_modules', '.bin', nodeExecutable);

            const serviceProcess = spawn(nodePath, [servicePath], {
                env,
                stdio: ['pipe', 'pipe', 'pipe'],
                cwd: path.dirname(servicePath)
            });

            serviceProcess.stdout.on('data', (data) => {
                console.log(`${service.name}:`, data.toString());
            });

            serviceProcess.stderr.on('data', (data) => {
                console.error(`${service.name} Error:`, data.toString());
            });

            serviceProcess.on('close', (code) => {
                console.log(`${service.name} process exited with code ${code}`);
                this.processes.delete(service.name);
            });

            this.processes.set(service.name, serviceProcess);
            console.log(`Started ${service.name} service on port ${service.port}`);

        } catch (error) {
            console.error(`Error starting ${service.name} service:`, error);
            throw error;
        }
    }

    async stopAllServices() {
        for (const [name, process] of this.processes) {
            try {
                if (process.platform === 'win32') {
                    // Windows requires different approach
                    process.kill('SIGKILL');
                } else {
                    // Unix-like systems
                    process.kill('SIGTERM');
                }
                console.log(`Stopped ${name} service`);
            } catch (error) {
                console.error(`Error stopping ${name} service:`, error);
            }
        }
        this.processes.clear();
    }
}

module.exports = BackendManager;