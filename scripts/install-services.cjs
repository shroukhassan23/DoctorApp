const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');


const debug = (message) => {
  console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`);
};


debug('Starting service installation script');
debug(`Running as: ${process.env.USERNAME || 'Unknown user'}`);
debug(`Node version: ${process.version}`);
debug(`Working directory: ${process.cwd()}`);

// Install node-windows for service management
function installNodeWindows() {
  return new Promise((resolve, reject) => {
    console.log('Installing node-windows...');
    const install = spawn('npm', ['install', 'node-windows'], { shell: true });

    install.on('close', (code) => {
      if (code === 0) {
        console.log('node-windows installed successfully');
        resolve();
      } else {
        reject(new Error('Failed to install node-windows'));
      }
    });
  });
}

async function createServiceScript(serviceName, serviceFile, port) {
  debug(`Creating service script for ${serviceName}`);
  debug(`Service file path: ${serviceFile}`);
  debug(`Checking if service file exists: ${require('fs').existsSync(serviceFile)}`);

  if (!require('fs').existsSync(serviceFile)) {
    throw new Error(`Service file not found: ${serviceFile}`);
  }

  const serviceScript = `
const Service = require('node-windows').Service;

console.log('${serviceName} service installer starting...');
console.log('Service script path: ${path.resolve(serviceFile)}');
console.log('Working directory: ${path.dirname(path.resolve(serviceFile))}');

// Create a new service object
const svc = new Service({
  name: 'DoctorApp ${serviceName} Service',
  description: 'Doctor App ${serviceName} backend service',
  script: '${path.resolve(serviceFile)}',
  nodeOptions: [
    '--max_old_space_size=4096'
  ],
  env: {
    name: 'NODE_ENV',
    value: 'production'
  },
  workingDirectory: '${path.dirname(path.resolve(serviceFile))}',
  allowServiceLogon: true
});

// Add timeout for installation
const timeout = setTimeout(() => {
  console.error('${serviceName} service installation timeout (60 seconds)');
  process.exit(1);
}, 60000);

// Listen for events
svc.on('install', function() {
  clearTimeout(timeout);
  console.log('${serviceName} service installed successfully');
  svc.start();
});

svc.on('start', function() {
  console.log('${serviceName} service started successfully');
  process.exit(0);
});

svc.on('alreadyinstalled', function() {
  clearTimeout(timeout);
  console.log('${serviceName} service already installed');
  process.exit(0);
});

svc.on('error', function(err) {
  clearTimeout(timeout);
  console.error('${serviceName} service error:', err);
  process.exit(1);
});

// Install the service
console.log('Installing ${serviceName} service...');
svc.install();
`;

  const scriptPath = path.join(__dirname, `install-${serviceName}-service.cjs`);
  fs.writeFileSync(scriptPath, serviceScript, 'utf8');
  debug(`Service script created: ${scriptPath}`);
  return scriptPath;
}

async function installServices() {
  try {
    debug('Checking node-windows installation...');
    // Install node-windows first
    await installNodeWindows();

    const services = [
      { name: 'Patient', file: 'patient.cjs', port: 3001 },
      { name: 'Visit', file: 'visit.cjs', port: 3002 },
      { name: 'Reports', file: 'reports.cjs', port: 3003 }
    ];

    debug(`Found ${services.length} services to install`);

    for (const service of services) {
      debug(`\n=== Installing ${service.name} Service ===`);




      // Try multiple possible paths for service files
      const possiblePaths = [
        // If running from built app directory
        path.resolve(__dirname, '..', 'resources', service.file),

        // If running from project root
        path.resolve(__dirname, '..', 'dist-installers', 'win-unpacked', 'resources', service.file),

        // Alternative project root paths
        path.resolve(process.cwd(), 'dist-installers', 'win-unpacked', 'resources', service.file),
        path.resolve(process.cwd(), 'resources', service.file),
      ];

      let fullServicePath = null;
      for (const testPath of possiblePaths) {
        debug(`Checking path: ${testPath}`);
        if (fs.existsSync(testPath)) {
          fullServicePath = testPath;
          debug(`✅ Found service file at: ${fullServicePath}`);
          break;
        } else {
          debug(`❌ Not found at: ${testPath}`);
        }
      }

      if (!fullServicePath) {
        throw new Error(`Service file not found. Searched paths:\n${possiblePaths.join('\n')}`);
      }

      // Create service installation script
      const scriptPath = await createServiceScript(service.name, fullServicePath, service.port);

      // Run the service installation with more detailed output
      debug(`Running service installation script: ${scriptPath}`);
      const install = spawn('node', [scriptPath], {
        shell: true,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      // Capture and log all output
      install.stdout.on('data', (data) => {
        const output = data.toString().trim();
        if (output) console.log(`${service.name} Output:`, output);
      });

      install.stderr.on('data', (data) => {
        const error = data.toString().trim();
        if (error) console.error(`${service.name} Error:`, error);
      });

      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          install.kill();
          reject(new Error(`${service.name} installation timeout`));
        }, 120000); // 2 minutes timeout

        install.on('close', (code) => {
          clearTimeout(timeout);
          debug(`${service.name} installation finished with code: ${code}`);
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`${service.name} installation failed with code ${code}`));
          }
        });
      });

      // Clean up script file
      fs.unlinkSync(scriptPath);
      debug(`Cleaned up script file: ${scriptPath}`);

      // Verify service was installed
      const { execSync } = require('child_process');
      try {
        const queryResult = execSync(`sc query "DoctorApp ${service.name} Service"`, {
          encoding: 'utf8'
        });

        if (queryResult && queryResult.includes('RUNNING')) {
          debug(`✅ ${service.name} service verified as RUNNING`);
        } else if (queryResult && queryResult.includes('STOPPED')) {
          debug(`⚠️ ${service.name} service installed but STOPPED`);
        } else {
          debug(`ℹ️ ${service.name} service status: ${queryResult.split('\n')[0]}`);
        }
      } catch (error) {
        debug(`❌ ${service.name} service verification failed: ${error.message}`);
      }
    }

    console.log('\n=== Installation Summary ===');
    console.log('All services processed!');

    // Final verification
    debug('Final service status check...');
    services.forEach(service => {
      try {
        const queryResult = execSync(`sc query "DoctorApp ${service.name} Service"`, {
          encoding: 'utf8'
        });
        const status = queryResult ?
          (queryResult.includes('RUNNING') ? 'RUNNING' :
            queryResult.includes('STOPPED') ? 'STOPPED' : 'UNKNOWN') : 'ERROR';
        console.log(`${service.name} Service: ${status}`);
      } catch (error) {
        console.log(`${service.name} Service: NOT_FOUND`);
      }
    });

  } catch (error) {
    debug(`Installation failed: ${error.message}`);
    console.error('Error installing services:', error);
  }
}

installServices();