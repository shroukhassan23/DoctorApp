const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

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
            let servicePath;

            // تحديد مسار الخدمة بشكل أفضل
            if (isDev) {
                servicePath = path.join(this.appPath, service.file);
            } else {
                console.log('Debug Info:');
                console.log('  this.appPath:', this.appPath);
                console.log('  __dirname:', __dirname);
                console.log('  process.resourcesPath:', process.resourcesPath);
                console.log('  process.execPath:', process.execPath);
                // محاولة مسارات مختلفة للـ production
                const possiblePaths = [
                    path.join(process.resourcesPath, 'app', service.file),    // From extraFiles
                    path.join(process.resourcesPath, service.file),           // From extraResources
                    path.join(this.appPath, service.file),                   // Same directory as electron.cjs
                    path.join(__dirname, service.file),                      // Current directory
                    path.join(path.dirname(process.execPath), 'resources', 'app', service.file), // Relative to exe
                    path.join(this.appPath, '..', service.file),            // Parent directory
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

            // التحقق من وجود ملف الخدمة
            if (!servicePath || !fs.existsSync(servicePath)) {
                throw new Error(`Service file not found: ${service.file}. Searched paths: ${isDev ? path.join(this.appPath, service.file) : 'multiple production paths'}`);
            }

            console.log(`Found service file at: ${servicePath}`);

            const env = {
                ...process.env,
                DB_TYPE: 'sqlite',
                DB_NAME: 'doctor',
                DB_PATH: path.join(require('os').homedir(), 'AppData', 'Roaming', 'doctor-app-desktop', 'doctor-app.db'),
                SHARED_FOLDER_PATH: config.sharedFolderPath || '',
                NODE_ENV: isDev ? 'development' : 'production',
                PORT: service.port.toString(),
                ELECTRON_DEV: process.env.ELECTRON_DEV || 'false'
            };

            // تحديد مسار Node.js بشكل أفضل
            let nodeExecutable;
            if (isDev) {
                nodeExecutable = 'node';
            } else {
                // للـ production في Electron
                if (process.platform === 'win32') {
                    nodeExecutable = path.join(process.resourcesPath, 'node.exe') || 'node';
                } else {
                    nodeExecutable = path.join(process.resourcesPath, 'node') || 'node';
                }

                // التحقق من وجود Node.js في المسار المحدد
                if (!fs.existsSync(nodeExecutable)) {
                    nodeExecutable = 'node'; // استخدام Node.js من النظام
                }
            }

            console.log(`Starting ${service.name} with node: ${nodeExecutable}`);

            const serviceProcess = spawn(nodeExecutable, [servicePath], {
                env,
                stdio: ['ignore', 'pipe', 'pipe'], // Ignore stdin to prevent EPIPE
                cwd: path.dirname(servicePath),
                detached: false,
                shell: process.platform === 'win32',
                windowsHide: true // Hide console window on Windows
            });

            // إضافة timeout للتأكد من بدء الخدمة
            const startupTimeout = setTimeout(() => {
                if (serviceProcess && !serviceProcess.killed) {
                    console.warn(`${service.name} startup timeout - but keeping process running`);
                }
            }, 10000);

            serviceProcess.stdout.on('data', (data) => {
                const output = data.toString().trim();
                if (output) {
                    console.log(`${service.name}:`, output);
                    // إذا رأينا رسالة نجاح البدء، نلغي الـ timeout
                    if (output.includes('listening') || output.includes('started') || output.includes(`${service.port}`)) {
                        clearTimeout(startupTimeout);
                    }
                }
            });

            serviceProcess.stderr.on('data', (data) => {
                const error = data.toString().trim();
                if (error) {
                    console.error(`${service.name} Error:`, error);
                    // Log more details for debugging
                    if (error.includes('Cannot find module')) {
                        console.error(`${service.name} Module not found error - check NODE_PATH:`, env.NODE_PATH);
                    }
                }
            });

            serviceProcess.on('exit', (code, signal) => {
                console.log(`${service.name} process exited with code ${code}, signal: ${signal}`);

                // Don't treat exit code 0 as error if it's a clean shutdown
                if (code !== 0 && !isShuttingDown) {
                    console.error(`${service.name} unexpected exit with code ${code}`);
                    console.error(`Working directory was: ${path.dirname(servicePath)}`);
                    console.error(`Service path was: ${servicePath}`);

                    // Attempt to restart the service once
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
                console.log(`${service.name} process exited with code ${code}, signal: ${signal}`);
                clearTimeout(startupTimeout);
                this.processes.delete(service.name);
            });

            // التحقق من أن العملية بدأت بنجاح
            if (serviceProcess.pid) {
                this.processes.set(service.name, serviceProcess);
                console.log(`Started ${service.name} service (PID: ${serviceProcess.pid}) on port ${service.port}`);
            } else {
                throw new Error(`Failed to start ${service.name} service - no PID assigned`);
            }

            // انتظار قصير للتأكد من عدم انهيار العملية فوراً
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (serviceProcess.killed || serviceProcess.exitCode !== null) {
                throw new Error(`${service.name} process died immediately after start`);
            }

        } catch (error) {
            console.error(`Error starting ${service.name} service:`, error);
            throw error;
        }
    }

    // Add this new method to BackendManager class
    async gracefulShutdown() {
        console.log('Initiating graceful shutdown of all services...');

        for (const [name, process] of this.processes) {
            try {
                if (!process.killed && process.exitCode === null) {
                    console.log(`Sending shutdown signal to ${name} (PID: ${process.pid})`);

                    // Send graceful shutdown signal
                    process.kill('SIGTERM');

                    // Wait for graceful shutdown
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
                        // Windows
                        spawn('taskkill', ['/pid', process.pid, '/f', '/t'], { stdio: 'inherit' });
                    } else {
                        // Unix-like systems
                        process.kill('SIGTERM');

                        // إعطاء وقت للإنهاء السليم ثم فرض الإنهاء إذا لزم الأمر
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

    // دالة للتحقق من حالة الخدمات
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

    // دالة لإعادة تشغيل خدمة معينة
    async restartService(serviceName, config) {
        const process = this.processes.get(serviceName);
        if (process) {
            // إيقاف الخدمة أولاً
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

        // إعادة تشغيل الخدمة
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