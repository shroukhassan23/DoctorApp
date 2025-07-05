const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Debug logging
const debug = (message) => {
  console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`);
};

debug('Starting NSSM service installation script');
debug(`Running as: ${process.env.USERNAME || 'Unknown user'}`);
debug(`Node version: ${process.version}`);
debug(`Working directory: ${process.cwd()}`);

function findProjectRoot(startPath) {
  let currentPath = startPath;
  while (!fs.existsSync(path.join(currentPath, 'package.json'))) {
    const parent = path.dirname(currentPath);
    if (parent === currentPath) break; // Reached root
    currentPath = parent;
  }
  return currentPath;
}

async function installServices() {
  try {
    const projectRoot = findProjectRoot(__dirname);
    
    // Find NSSM executable
    const nssmPath = path.resolve(projectRoot, 'dist-installers', 'win-unpacked', 'resources', 'nssm.exe');
    debug(`Looking for NSSM at: ${nssmPath}`);
    
    if (!fs.existsSync(nssmPath)) {
      throw new Error(`NSSM not found at: ${nssmPath}\nMake sure NSSM is included in your build.`);
    }
    
    debug('✅ NSSM found successfully');
    
    // Find Node.js executable
    const nodeExe = path.join(process.resourcesPath, 'electron-dist', 'node.exe');
    if (!fs.existsSync(nodeExe)) {
      nodeExe = path.join(path.dirname(process.execPath), 'node.exe');
      if (!fs.existsSync(nodeExe)) throw new Error(`Bundled Node.js not found at: ${nodeExe}`);
    }
    
    debug(`Using bundled Node.js: ${nodeExe}`);

    
    const services = [
      { name: 'DoctorApp-Patient', file: 'patient.cjs', port: 3001, displayName: 'DoctorApp Patient Service' },
      { name: 'DoctorApp-Visit', file: 'visit.cjs', port: 3002, displayName: 'DoctorApp Visit Service' },
      { name: 'DoctorApp-Reports', file: 'reports.cjs', port: 3003, displayName: 'DoctorApp Reports Service' }
    ];

    debug(`Found ${services.length} services to install`);

    for (const service of services) {
      debug(`\n=== Installing ${service.displayName} ===`);
      
      // Find service file
      const servicePath = path.resolve(projectRoot, 'dist-installers', 'win-unpacked', 'resources', service.file);
      debug(`Service file path: ${servicePath}`);
      
      if (!fs.existsSync(servicePath)) {
        throw new Error(`Service file not found: ${servicePath}`);
      }
      
      debug(`✅ Service file found: ${servicePath}`);
      
      try {
        // Check if service already exists
        debug(`Checking if service ${service.name} already exists...`);
        try {
          execSync(`sc.exe query "${service.name}"`, { encoding: 'utf8', stdio: 'pipe' });
          debug(`Service ${service.name} already exists, removing it first...`);
          
          // Stop service if running
          try {
            execSync(`"${nssmPath}" stop "${service.name}"`, { encoding: 'utf8', stdio: 'pipe' });
            debug(`Stopped existing service: ${service.name}`);
          } catch (stopError) {
            debug(`Service ${service.name} was not running`);
          }
          
          // Remove existing service
          execSync(`"${nssmPath}" remove "${service.name}" confirm`, { encoding: 'utf8', stdio: 'pipe' });
          debug(`Removed existing service: ${service.name}`);
          
          // Wait for service to be fully removed
          await new Promise(resolve => setTimeout(resolve, 2000));
          
        } catch (queryError) {
          debug(`Service ${service.name} does not exist yet`);
        }
        
        // Install new service
        debug(`Installing service: ${service.name}`);
        const installCmd = `"${nssmPath}" install "${service.name}" "${nodeExe}" "${servicePath}"`;
        debug(`Install command: ${installCmd}`);
        
        execSync(installCmd, { encoding: 'utf8' });
        debug(`✅ Service ${service.name} installed successfully`);
        
        // Set service display name
        execSync(`"${nssmPath}" set "${service.name}" DisplayName "${service.displayName}"`, { encoding: 'utf8' });
        
        // Set service description
        execSync(`"${nssmPath}" set "${service.name}" Description "${service.displayName} - Backend API service"`, { encoding: 'utf8' });
        
        // Set working directory
        const workingDir = path.dirname(servicePath);
        execSync(`"${nssmPath}" set "${service.name}" AppDirectory "${workingDir}"`, { encoding: 'utf8' });
        
        // Set service to start automatically
        execSync(`"${nssmPath}" set "${service.name}" Start SERVICE_AUTO_START`, { encoding: 'utf8' });
        
        // Set restart policy (restart on failure)
        execSync(`"${nssmPath}" set "${service.name}" AppRestartDelay 5000`, { encoding: 'utf8' });
        
        // Set environment variables
        const envVars = [
          'DB_TYPE=sqlite',
          'DB_NAME=doctor',
          `DB_PATH=${path.join(require('os').homedir(), 'AppData', 'Roaming', 'doctor-app-desktop', 'doctor-app.db')}`,
          'NODE_ENV=production',
          `PORT=${service.port}`,
          'ELECTRON_DEV=false'
        ];
        
        for (let i = 0; i < envVars.length; i++) {
          execSync(`"${nssmPath}" set "${service.name}" AppEnvironmentExtra "${envVars[i]}"`, { encoding: 'utf8' });
        }
        
        debug(`Configured service ${service.name} successfully`);
        
        // Start the service
        debug(`Starting service: ${service.name}`);
        execSync(`"${nssmPath}" start "${service.name}"`, { encoding: 'utf8' });
        debug(`✅ Service ${service.name} started successfully`);
        
        // Wait a moment for service to initialize
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Verify service is running
        const statusResult = execSync(`sc.exe query "${service.name}"`, { encoding: 'utf8' });
        
        if (statusResult.includes('RUNNING')) {
          debug(`✅ ${service.name} verified as RUNNING`);
        } else if (statusResult.includes('STOPPED')) {
          debug(`⚠️ ${service.name} is installed but STOPPED`);
        } else {
          debug(`ℹ️ ${service.name} status: ${statusResult.split('\n')[0]}`);
        }
        
      } catch (error) {
        debug(`❌ Failed to install ${service.name}: ${error.message}`);
        throw error;
      }
    }

    console.log('\n=== Installation Summary ===');
    console.log('All services installed successfully!');
    
    // Final verification
    debug('\nFinal service status check...');
    services.forEach(service => {
      try {
        const queryResult = execSync(`sc.exe query "${service.name}"`, { encoding: 'utf8' });
        const status = queryResult.includes('RUNNING') ? 'RUNNING' : 
                     queryResult.includes('STOPPED') ? 'STOPPED' : 'UNKNOWN';
        console.log(`${service.displayName}: ${status}`);
        
        if (status === 'RUNNING') {
          // Test if the service is actually responding
          setTimeout(() => {
            try {
              const testUrl = `http://localhost:${service.port}`;
              debug(`Testing service at: ${testUrl}`);
              // You could add a simple HTTP test here if needed
            } catch (testError) {
              debug(`Service test failed for ${service.name}: ${testError.message}`);
            }
          }, 1000);
        }
        
      } catch (error) {
        console.log(`${service.displayName}: NOT_FOUND`);
      }
    });
    
    console.log('\n✅ Services installation completed!');
    console.log('Services will now:');
    console.log('- Start automatically with Windows');
    console.log('- Restart automatically if they crash');
    console.log('- Run independently of the main app');
    console.log('\nYou can now run Doctor App.exe and it will connect to these services.');
    
  } catch (error) {
    debug(`Installation failed: ${error.message}`);
    console.error('❌ Error installing services:', error.message);
    process.exit(1);
  }
}

// Helper function to wait
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

installServices();