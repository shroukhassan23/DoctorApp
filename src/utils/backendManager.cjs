const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class BackendManager {
    constructor(appPath) {
        this.appPath = appPath;
        this.processes = new Map();
        this.isShuttingDown = false;
    }

    async startServices(installationType, config) {
        // IMPORTANT: Only start services for MASTER installations
        if (installationType === 'client') {
            console.log('Client installation detected - not starting local services');
            console.log('Client will connect to master services at:', {
                patientService: `http://${config.masterHost}:${config.patientServicePort}`,
                visitService: `http://${config.masterHost}:${config.visitServicePort}`,
                reportsService: `http://${config.masterHost}:${config.reportsServicePort}`
            });
            return; // Clients don't run their own services!
        }

        // NEW: Check if Windows services are installed
        if (process.platform === 'win32' && config.installAsServices) {
            console.log('Windows services are installed - not starting as regular processes');
            return; // Services are already running as Windows services
        }

        console.log('Master installation detected - starting local services as regular processes');

        const patientPort = config.services?.patientPort || 3001;
        const visitPort = config.services?.visitPort || 3002;
        const reportsPort = config.services?.reportsPort || 3003;

        const services = [
            { name: 'patient', file: 'patient.cjs', port: patientPort },
            { name: 'visit', file: 'visit.cjs', port: visitPort },
            { name: 'reports', file: 'reports.cjs', port: reportsPort }
        ];

        for (const service of services) {
            await this.startService(service, config);
        }
    }

    async startService(service, config) {
        try {
            const isDev = process.env.ELECTRON_DEV === 'true';
            let servicePath;

            // Find service file path
            if (isDev) {
                servicePath = path.join(this.appPath, service.file);
            } else {
                console.log('Debug Info:');
                console.log('  this.appPath:', this.appPath);
                console.log('  __dirname:', __dirname);
                console.log('  process.resourcesPath:', process.resourcesPath);
                console.log('  process.execPath:', process.execPath);

                const possiblePaths = [
                    path.join(process.resourcesPath, 'app', service.file),
                    path.join(process.resourcesPath, service.file),
                    path.join(this.appPath, service.file),
                    path.join(__dirname, service.file),
                    path.join(path.dirname(process.execPath), 'resources', 'app', service.file),
                    path.join(this.appPath, '..', service.file),
                ];

                console.log(`Looking for ${service.file} in these paths:`);
                possiblePaths.forEach(p => console.log(`  - ${p} (exists: ${fs.existsSync(p)})`));

                for (const testPath of possiblePaths) {
                    if (fs.existsSync(testPath)) {
                        servicePath = testPath;
                        console.log(`✅ Found ${service.file} at: ${testPath}`);
                        break;
                    }
                }
            }

            if (!servicePath || !fs.existsSync(servicePath)) {
                throw new Error(`Service file not found: ${service.file}. Searched paths: ${isDev ? path.join(this.appPath, service.file) : 'multiple production paths'}`);
            }

            console.log(`Found service file at: ${servicePath}`);

            // FIXED: Set explicit database path for consistent location
            const dbPath = this.getServiceDatabasePath(config);
            const logDir = path.join(path.dirname(dbPath), 'logs');

            const env = {
                ...process.env,
                DB_TYPE: 'sqlite',
                DB_NAME: 'doctor',
                DB_PATH: dbPath, // FIXED: Explicit path instead of using os.homedir()
                LOG_DIR: logDir, // FIXED: Explicit log directory
                SHARED_FOLDER_PATH: config.sharedFolderPath || '',
                NODE_ENV: isDev ? 'development' : 'production',
                PORT: service.port.toString(),
                ELECTRON_DEV: process.env.ELECTRON_DEV || 'false'
            };

            console.log(`Service ${service.name} will use database at: ${dbPath}`);
            console.log(`Service ${service.name} will use logs at: ${logDir}`);

            // Determine Node.js executable - FIXED VERSION
            let nodeExecutable;
            if (isDev) {
                nodeExecutable = 'node';
            } else {
                try {
                    // Try bundled Node.js first
                    nodeExecutable = path.join(process.resourcesPath, 'node.exe');
                    if (!fs.existsSync(nodeExecutable)) {
                        console.log(`Bundled Node.js not found at: ${nodeExecutable}`);

                        // Fallback to system Node.js
                        const commonPaths = [
                            'C:\\Program Files\\nodejs\\node.exe',
                            'C:\\Program Files (x86)\\nodejs\\node.exe',
                            process.execPath // Current process (might be Electron)
                        ];

                        for (const testPath of commonPaths) {
                            if (testPath && fs.existsSync(testPath)) {
                                nodeExecutable = testPath;
                                console.log(`Using system Node.js: ${nodeExecutable}`);
                                break;
                            }
                        }
                    } else {
                        console.log(`Using bundled Node.js: ${nodeExecutable}`);
                    }

                    if (!nodeExecutable || !fs.existsSync(nodeExecutable)) {
                        throw new Error('Node.js executable not found in any expected location');
                    }

                } catch (error) {
                    throw new Error(`Failed to find Node.js executable: ${error.message}`);
                }
            }

            console.log(`Starting ${service.name} with node: ${nodeExecutable}`);

            const serviceProcess = spawn(nodeExecutable, [servicePath], {
                env,
                stdio: ['ignore', 'pipe', 'pipe'],
                cwd: path.dirname(servicePath),
                detached: false,
                shell: process.platform === 'win32',
                windowsHide: true
            });

            const startupTimeout = setTimeout(() => {
                if (serviceProcess && !serviceProcess.killed) {
                    console.warn(`${service.name} startup timeout - but keeping process running`);
                }
            }, 10000);

            serviceProcess.stdout.on('data', (data) => {
                const output = data.toString().trim();
                if (output) {
                    console.log(`${service.name}:`, output);
                    if (output.includes('listening') || output.includes('started') || output.includes(`${service.port}`)) {
                        clearTimeout(startupTimeout);
                    }
                }
            });

            serviceProcess.stderr.on('data', (data) => {
                const error = data.toString().trim();
                if (error) {
                    console.error(`${service.name} Error:`, error);
                    if (error.includes('Cannot find module')) {
                        console.error(`${service.name} Module not found error - check NODE_PATH:`, env.NODE_PATH);
                    }
                }
            });

            serviceProcess.on('exit', (code, signal) => {
                console.log(`${service.name} process exited with code ${code}, signal: ${signal}`);

                if (code !== 0 && !this.isShuttingDown) {
                    console.error(`${service.name} unexpected exit with code ${code}`);
                    console.error(`Working directory was: ${path.dirname(servicePath)}`);
                    console.error(`Service path was: ${servicePath}`);

                    setTimeout(() => {
                        if (!this.processes.has(service.name)) {
                            console.log(`Attempting to restart ${service.name}...`);
                            this.startService(service, config).catch(err => {
                                console.error(`Failed to restart ${service.name}:`, err);
                            });
                        }
                    }, 2000);
                }

                clearTimeout(startupTimeout);
                this.processes.delete(service.name);
            });

            serviceProcess.on('error', (error) => {
                console.error(`Failed to start ${service.name}:`, error);
                clearTimeout(startupTimeout);
                this.processes.delete(service.name);
            });

            serviceProcess.on('close', (code, signal) => {
                console.log(`${service.name} process closed with code ${code}, signal: ${signal}`);
                clearTimeout(startupTimeout);
                this.processes.delete(service.name);
            });

            if (serviceProcess.pid) {
                this.processes.set(service.name, serviceProcess);
                console.log(`Started ${service.name} service (PID: ${serviceProcess.pid}) on port ${service.port}`);
            } else {
                throw new Error(`Failed to start ${service.name} service - no PID assigned`);
            }

            await new Promise(resolve => setTimeout(resolve, 1000));

            if (serviceProcess.killed || serviceProcess.exitCode !== null) {
                throw new Error(`${service.name} process died immediately after start`);
            }

        } catch (error) {
            console.error(`Error starting ${service.name} service:`, error);
            throw error;
        }
    }

    // FIXED: Helper method to determine consistent database path
    getServiceDatabasePath(config) {
        // Priority 1: Environment variable
        if (process.env.DB_PATH) {
            return process.env.DB_PATH;
        }

        // Priority 2: Use application path
        if (this.appPath) {
            return path.join(this.appPath, 'data', 'doctor-app.db');
        }

        // Priority 3: Use executable directory
        const execDir = path.dirname(process.execPath);
        return path.join(execDir, 'data', 'doctor-app.db');
    }

    async gracefulShutdown() {
        this.isShuttingDown = true;
        console.log('Initiating graceful shutdown of all services...');

        for (const [name, process] of this.processes) {
            try {
                if (!process.killed && process.exitCode === null) {
                    console.log(`Sending shutdown signal to ${name} (PID: ${process.pid})`);

                    process.kill('SIGTERM');

                    await new Promise(resolve => {
                        const timeout = setTimeout(() => {
                            console.log(`Force killing ${name} after timeout`);
                            try {
                                process.kill('SIGKILL');
                            } catch (e) {
                                console.log(`${name} already dead:`, e.message);
                            }
                            resolve();
                        }, 3000);

                        process.on('exit', () => {
                            clearTimeout(timeout);
                            resolve();
                        });
                    });
                }
            } catch (error) {
                console.error(`Error during graceful shutdown of ${name}:`, error);
            }
        }

        this.processes.clear();
        console.log('All services shutdown complete');
    }

    async stopAllServices() {
        console.log('Stopping all services...');

        for (const [name, process] of this.processes) {
            try {
                if (!process.killed && process.exitCode === null) {
                    console.log(`Stopping ${name} service (PID: ${process.pid})`);

                    if (process.platform === 'win32') {
                        spawn('taskkill', ['/pid', process.pid, '/f', '/t'], { stdio: 'inherit' });
                    } else {
                        process.kill('SIGTERM');

                        setTimeout(() => {
                            if (!process.killed && process.exitCode === null) {
                                process.kill('SIGKILL');
                            }
                        }, 5000);
                    }
                }
            } catch (error) {
                console.error(`Error stopping ${name} service:`, error);
            }
        }

        this.processes.clear();
        console.log('All services stopped');
    }

    getServicesStatus() {
        const status = {};
        for (const [name, process] of this.processes) {
            status[name] = {
                running: !process.killed && process.exitCode === null,
                pid: process.pid,
                exitCode: process.exitCode
            };
        }
        return status;
    }

    async restartService(serviceName, config) {
        const process = this.processes.get(serviceName);
        if (process) {
            try {
                if (process.platform === 'win32') {
                    process.kill('SIGKILL');
                } else {
                    process.kill('SIGTERM');
                }
            } catch (error) {
                console.error(`Error stopping ${serviceName}:`, error);
            }
            this.processes.delete(serviceName);
        }

        const services = [
            { name: 'patient', file: 'patient.cjs', port: 3001 },
            { name: 'visit', file: 'visit.cjs', port: 3002 },
            { name: 'reports', file: 'reports.cjs', port: 3003 }
        ];

        const service = services.find(s => s.name === serviceName);
        if (service) {
            await this.startService(service, config);
        }
    }
}

module.exports = BackendManager;