const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function createUninstallScript(serviceName) {
  const uninstallScript = `
const Service = require('node-windows').Service;

// Create a new service object
const svc = new Service({
  name: 'DoctorApp ${serviceName} Service',
  script: 'dummy.js' // Not used for uninstall
});

// Listen for the "uninstall" event
svc.on('uninstall', function() {
  console.log('${serviceName} service uninstalled successfully');
});

svc.on('error', function(err) {
  console.error('${serviceName} service uninstall error:', err);
});

// Uninstall the service
svc.uninstall();
`;

  const scriptPath = path.join(__dirname, `uninstall-${serviceName}-service.js`);
  fs.writeFileSync(scriptPath, uninstallScript, 'utf8');
  return scriptPath;
}

async function uninstallServices() {
  try {
    const services = ['Patient', 'Visit', 'Reports'];

    console.log('Stopping services first...');
    
    // Stop services first
    for (const serviceName of services) {
      try {
        const stop = spawn('net', ['stop', `DoctorApp ${serviceName} Service`], { shell: true });
        await new Promise((resolve) => {
          stop.on('close', resolve);
        });
        console.log(`${serviceName} service stopped`);
      } catch (error) {
        console.log(`${serviceName} service was not running`);
      }
    }

    // Wait a bit for services to fully stop
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Uninstall services
    for (const serviceName of services) {
      console.log(`Uninstalling ${serviceName} service...`);
      
      const scriptPath = await createUninstallScript(serviceName);
      
      const uninstall = spawn('node', [scriptPath], { shell: true });
      
      uninstall.stdout.on('data', (data) => {
        console.log(`${serviceName}:`, data.toString());
      });
      
      uninstall.stderr.on('data', (data) => {
        console.error(`${serviceName} Error:`, data.toString());
      });
      
      await new Promise((resolve) => {
        uninstall.on('close', resolve);
      });
      
      // Clean up script file
      fs.unlinkSync(scriptPath);
    }

    console.log('All services uninstalled successfully!');
    console.log('You can now run the app in regular process mode.');
    
  } catch (error) {
    console.error('Error uninstalling services:', error);
  }
}

uninstallServices();