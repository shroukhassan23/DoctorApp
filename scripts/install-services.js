const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

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
  const serviceScript = `
const Service = require('node-windows').Service;

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

// Listen for the "install" event, which indicates the process is available as a service.
svc.on('install', function() {
  console.log('${serviceName} service installed successfully');
  svc.start();
});

svc.on('start', function() {
  console.log('${serviceName} service started successfully');
});

svc.on('error', function(err) {
  console.error('${serviceName} service error:', err);
});

// Install the service
svc.install();
`;

  const scriptPath = path.join(__dirname, `install-${serviceName}-service.js`);
  fs.writeFileSync(scriptPath, serviceScript, 'utf8');
  return scriptPath;
}

async function installServices() {
  try {
    // Install node-windows first
    await installNodeWindows();

    const services = [
      { name: 'Patient', file: 'patient.cjs', port: 3001 },
      { name: 'Visit', file: 'visit.cjs', port: 3002 },
      { name: 'Reports', file: 'reports.cjs', port: 3003 }
    ];

    for (const service of services) {
      console.log(`Installing ${service.name} service...`);
      
      // Create service installation script
      const scriptPath = await createServiceScript(service.name, service.file, service.port);
      
      // Run the service installation
      const install = spawn('node', [scriptPath], { shell: true });
      
      install.stdout.on('data', (data) => {
        console.log(`${service.name}:`, data.toString());
      });
      
      install.stderr.on('data', (data) => {
        console.error(`${service.name} Error:`, data.toString());
      });
      
      await new Promise((resolve) => {
        install.on('close', resolve);
      });
      
      // Clean up script file
      fs.unlinkSync(scriptPath);
    }

    console.log('All services installed successfully!');
    console.log('Services will now run automatically:');
    console.log('- On system startup');
    console.log('- When user logs out');
    console.log('- When main app closes');
    
  } catch (error) {
    console.error('Error installing services:', error);
  }
}

installServices();