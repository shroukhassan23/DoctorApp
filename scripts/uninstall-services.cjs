const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Debug logging
const debug = (message) => {
  console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`);
};

debug('Starting NSSM service uninstallation script');
debug(`Running as: ${process.env.USERNAME || 'Unknown user'}`);

function findProjectRoot(startPath) {
  let currentPath = startPath;
  while (!fs.existsSync(path.join(currentPath, 'package.json'))) {
    const parent = path.dirname(currentPath);
    if (parent === currentPath) break; // Reached root
    currentPath = parent;
  }
  return currentPath;
}

async function uninstallServices() {
  try {
    const projectRoot = findProjectRoot(__dirname);
    
    // Find NSSM executable
    const nssmPath = path.resolve(projectRoot, 'dist-installers', 'win-unpacked', 'resources', 'nssm.exe');
    debug(`Looking for NSSM at: ${nssmPath}`);
    
    if (!fs.existsSync(nssmPath)) {
      // Try alternative paths if not found
      const altPaths = [
        path.resolve(process.cwd(), 'resources', 'nssm.exe'),
        path.resolve(__dirname, '..', 'resources', 'nssm.exe')
      ];
      
      let found = false;
      for (const altPath of altPaths) {
        if (fs.existsSync(altPath)) {
          nssmPath = altPath;
          found = true;
          break;
        }
      }
      
      if (!found) {
        console.warn('⚠️ NSSM not found, trying to use system sc command instead...');
        await uninstallWithSc();
        return;
      }
    }
    
    debug('✅ NSSM found successfully');
    
    const services = [
      { name: 'DoctorApp-Patient', displayName: 'DoctorApp Patient Service' },
      { name: 'DoctorApp-Visit', displayName: 'DoctorApp Visit Service' },
      { name: 'DoctorApp-Reports', displayName: 'DoctorApp Reports Service' }
    ];

    console.log('Stopping and uninstalling services...\n');

    for (const service of services) {
      debug(`\n=== Uninstalling ${service.displayName} ===`);
      
      try {
        // Check if service exists
        debug(`Checking if service ${service.name} exists...`);
        
        try {
          execSync(`sc.exe query "${service.name}"`, { encoding: 'utf8', stdio: 'pipe' });
          debug(`Service ${service.name} exists`);
          
          // Stop the service first
          debug(`Stopping service: ${service.name}`);
          try {
            execSync(`"${nssmPath}" stop "${service.name}"`, { encoding: 'utf8', stdio: 'pipe' });
            debug(`✅ Service ${service.name} stopped`);
            
            // Wait for service to fully stop
            await new Promise(resolve => setTimeout(resolve, 3000));
            
          } catch (stopError) {
            debug(`Service ${service.name} was not running or already stopped`);
          }
          
          // Remove the service
          debug(`Removing service: ${service.name}`);
          execSync(`"${nssmPath}" remove "${service.name}" confirm`, { encoding: 'utf8', stdio: 'pipe' });
          debug(`✅ Service ${service.name} removed successfully`);
          
          console.log(`✅ ${service.displayName} uninstalled`);
          
        } catch (queryError) {
          debug(`Service ${service.name} does not exist`);
          console.log(`ℹ️ ${service.displayName} was not installed`);
        }
        
      } catch (error) {
        debug(`❌ Failed to uninstall ${service.name}: ${error.message}`);
        console.error(`❌ Failed to uninstall ${service.displayName}: ${error.message}`);
      }
    }

    console.log('\n=== Uninstallation Summary ===');
    
    // Final verification - check if any services still exist
    debug('\nFinal verification...');
    let anyRemaining = false;
    
    services.forEach(service => {
      try {
        execSync(`sc.exe query "${service.name}"`, { encoding: 'utf8', stdio: 'pipe' });
        console.log(`⚠️ ${service.displayName}: Still exists (manual removal may be needed)`);
        anyRemaining = true;
      } catch (error) {
        console.log(`✅ ${service.displayName}: Successfully removed`);
      }
    });
    
    if (anyRemaining) {
      console.log('\n⚠️ Some services may still exist. You can manually remove them using:');
      console.log('1. Open Services (services.msc)');
      console.log('2. Find and stop any remaining DoctorApp services');
      console.log('3. Or use: sc delete "ServiceName"');
    } else {
      console.log('\n✅ All services successfully uninstalled!');
      console.log('You can now run the app in regular process mode.');
    }
    
  } catch (error) {
    debug(`Uninstallation failed: ${error.message}`);
    console.error('❌ Error uninstalling services:', error.message);
  }
}

// Fallback uninstallation using just sc command
async function uninstallWithSc() {
  const services = [
    'DoctorApp-Patient',
    'DoctorApp-Visit', 
    'DoctorApp-Reports'
  ];
  
  console.log('Using system sc command to uninstall services...\n');
  
  for (const serviceName of services) {
    try {
      // Stop service
      try {
        execSync(`sc.exe stop "${serviceName}"`, { encoding: 'utf8', stdio: 'pipe' });
        console.log(`Stopped ${serviceName}`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (stopError) {
        console.log(`${serviceName} was not running`);
      }
      
      // Delete service
      execSync(`sc.exe delete "${serviceName}"`, { encoding: 'utf8', stdio: 'pipe' });
      console.log(`✅ Removed ${serviceName}`);
      
    } catch (error) {
      console.log(`ℹ️ ${serviceName} was not installed or already removed`);
    }
  }
  
  console.log('\n✅ Uninstallation completed using sc command');
}

uninstallServices();