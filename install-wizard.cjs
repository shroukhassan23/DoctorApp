// install.js - Main installer script
const DoctorAppInstaller = require('./installer-config.cjs');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

class InstallationWizard {
  constructor() {
    this.installer = new DoctorAppInstaller();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    this.silentMode = false;
    this.installationOptions = {};
  }

  async start() {
    try {
      console.log('\n' + '='.repeat(60));
      console.log('🏥 DOCTOR APP INSTALLATION WIZARD');
      console.log('='.repeat(60));
      
      // Check if running as administrator
      if (!await this.checkAdminRights()) {
        console.error('❌ Please run this installer as Administrator');
        process.exit(1);
      }
      
      // Parse command line arguments
      this.parseCommandLine();
      
      if (this.silentMode) {
        await this.silentInstall();
      } else {
        await this.interactiveInstall();
      }
      
    } catch (error) {
      console.error('❌ Installation failed:', error.message);
      process.exit(1);
    } finally {
      this.rl.close();
    }
  }

  parseCommandLine() {
    const args = process.argv.slice(2);
    
    for (let i = 0; i < args.length; i++) {
      const arg = args[i].toLowerCase();
      
      switch (arg) {
        case '--silent':
        case '-s':
          this.silentMode = true;
          break;
          
        case '--mode':
        case '-m':
          if (i + 1 < args.length) {
            this.installationOptions.mode = args[++i].toLowerCase();
          }
          break;
          
        case '--server-host':
        case '--host':
          if (i + 1 < args.length) {
            this.installationOptions.serverHost = args[++i];
          }
          break;
          
        case '--server-port':
        case '--port':
          if (i + 1 < args.length) {
            this.installationOptions.serverPort = parseInt(args[++i]);
          }
          break;
          
        case '--install-path':
        case '--path':
          if (i + 1 < args.length) {
            this.installationOptions.installPath = args[++i];
          }
          break;
          
        case '--db-password':
        case '--password':
          if (i + 1 < args.length) {
            this.installationOptions.dbPassword = args[++i];
          }
          break;
          
        case '--help':
        case '-h':
          this.showHelp();
          process.exit(0);
          break;
      }
    }
  }

  showHelp() {
    console.log(`
DoctorApp Installation Wizard

Usage: node install.js [options]

Options:
  --silent, -s                Silent installation (no prompts)
  --mode, -m <mode>          Installation mode: server, client, standalone
  --server-host <host>       Server host for client mode (default: localhost)
  --server-port <port>       Server port (default: 3001)
  --install-path <path>      Installation directory
  --db-password <password>   Database password
  --help, -h                 Show this help message

Examples:
  # Interactive installation
  node install.js

  # Silent server installation
  node install.js --silent --mode server

  # Silent client installation
  node install.js --silent --mode client --server-host 192.168.1.100

  # Standalone installation with custom path
  node install.js --silent --mode standalone --install-path "C:\\MyApps\\DoctorApp"
    `);
  }

  async checkAdminRights() {
    try {
      // Try to write to a system directory to check admin rights
      const testPath = path.join(process.env.WINDIR, 'temp', 'admin-test.txt');
      fs.writeFileSync(testPath, 'test');
      fs.unlinkSync(testPath);
      return true;
    } catch {
      return false;
    }
  }

  async silentInstall() {
    console.log('🤖 Starting silent installation...');
    
    // Use default values if not provided
    if (!this.installationOptions.mode) {
      this.installationOptions.mode = 'standalone';
    }
    
    console.log(`Installation mode: ${this.installationOptions.mode}`);
    
    await this.installer.install(this.installationOptions);
  }

  async interactiveInstall() {
    console.log('🧙 Starting interactive installation wizard...');
    
    // Welcome message
    console.log(`
Welcome to the DoctorApp Installation Wizard!

This wizard will guide you through the installation process.
Please answer the following questions to configure your installation.
`);
    
    // Get installation mode
    const mode = await this.askMode();
    this.installationOptions.mode = mode;
    
    // Get installation path
    const installPath = await this.askInstallPath();
    if (installPath) {
      this.installationOptions.installPath = installPath;
    }
    
    // Mode-specific questions
    if (mode === 'client') {
      await this.askClientConfig();
    } else if (mode === 'server' || mode === 'standalone') {
      await this.askServerConfig();
    }
    
    // Confirmation
    await this.showConfigurationSummary();
    
    const confirmed = await this.askConfirmation();
    if (confirmed) {
      console.log('\n🚀 Starting installation...');
      await this.installer.install(this.installationOptions);
      console.log('\n✅ Installation completed successfully!');
      await this.showPostInstallationInfo();
    } else {
      console.log('\n❌ Installation cancelled by user.');
    }
  }

  async askMode() {
    return new Promise((resolve) => {
      console.log('\nInstallation Modes:');
      console.log('1. Server - Install as a server (for multi-user access)');
      console.log('2. Client - Install as a client (connects to existing server)');
      console.log('3. Standalone - Install as standalone application (single user)');
      
      this.rl.question('\nSelect installation mode (1-3) [3]: ', (answer) => {
        const choice = answer.trim() || '3';
        
        switch (choice) {
          case '1':
            resolve('server');
            break;
          case '2':
            resolve('client');
            break;
          case '3':
          default:
            resolve('standalone');
            break;
        }
      });
    });
  }

  async askInstallPath() {
    return new Promise((resolve) => {
      const defaultPath = path.join('C:', 'Program Files', 'DoctorApp');
      
      this.rl.question(`\nInstallation directory [${defaultPath}]: `, (answer) => {
        resolve(answer.trim() || defaultPath);
      });
    });
  }

  async askClientConfig() {
    console.log('\n--- Client Configuration ---');
    
    // Server host
    const serverHost = await new Promise((resolve) => {
      this.rl.question('Server host [localhost]: ', (answer) => {
        resolve(answer.trim() || 'localhost');
      });
    });
    this.installationOptions.serverHost = serverHost;
    
    // Server port
    const serverPort = await new Promise((resolve) => {
      this.rl.question('Server port [3001]: ', (answer) => {
        const port = parseInt(answer.trim()) || 3001;
        resolve(port);
      });
    });
    this.installationOptions.serverPort = serverPort;
  }

  async askServerConfig() {
    console.log('\n--- Server Configuration ---');
    
    // Server port
    const serverPort = await new Promise((resolve) => {
      this.rl.question('Server port [3001]: ', (answer) => {
        const port = parseInt(answer.trim()) || 3001;
        resolve(port);
      });
    });
    this.installationOptions.serverPort = serverPort;
    
    // Database configuration
    console.log('\n--- Database Configuration ---');
    
    const dbType = await new Promise((resolve) => {
      console.log('Database types:');
      console.log('1. SQLite (recommended for standalone/small installations)');
      console.log('2. MySQL');
      console.log('3. PostgreSQL');
      
      this.rl.question('Select database type (1-3) [1]: ', (answer) => {
        const choice = answer.trim() || '1';
        
        switch (choice) {
          case '1':
            resolve('sqlite');
            break;
          case '2':
            resolve('mysql');
            break;
          case '3':
            resolve('postgresql');
            break;
          default:
            resolve('sqlite');
            break;
        }
      });
    });
    this.installationOptions.dbType = dbType;
    
    if (dbType !== 'sqlite') {
      // Database host
      const dbHost = await new Promise((resolve) => {
        this.rl.question('Database host [localhost]: ', (answer) => {
          resolve(answer.trim() || 'localhost');
        });
      });
      this.installationOptions.dbHost = dbHost;
      
      // Database port
      const defaultPort = dbType === 'mysql' ? 3306 : 5432;
      const dbPort = await new Promise((resolve) => {
        this.rl.question(`Database port [${defaultPort}]: `, (answer) => {
          const port = parseInt(answer.trim()) || defaultPort;
          resolve(port);
        });
      });
      this.installationOptions.dbPort = dbPort;
      
      // Database name
      const dbName = await new Promise((resolve) => {
        this.rl.question('Database name [doctorapp]: ', (answer) => {
          resolve(answer.trim() || 'doctorapp');
        });
      });
      this.installationOptions.dbName = dbName;
      
      // Database username
      const dbUser = await new Promise((resolve) => {
        this.rl.question('Database username: ', (answer) => {
          resolve(answer.trim());
        });
      });
      this.installationOptions.dbUser = dbUser;
      
      // Database password
      const dbPassword = await new Promise((resolve) => {
        this.rl.question('Database password: ', (answer) => {
          resolve(answer.trim());
        });
      });
      this.installationOptions.dbPassword = dbPassword;
    }
    
    // Additional server options
    const createService = await new Promise((resolve) => {
      this.rl.question('Install as Windows service? (y/n) [y]: ', (answer) => {
        const choice = answer.trim().toLowerCase() || 'y';
        resolve(choice === 'y' || choice === 'yes');
      });
    });
    this.installationOptions.createService = createService;
    
    const autoStart = await new Promise((resolve) => {
      this.rl.question('Start service automatically? (y/n) [y]: ', (answer) => {
        const choice = answer.trim().toLowerCase() || 'y';
        resolve(choice === 'y' || choice === 'yes');
      });
    });
    this.installationOptions.autoStart = autoStart;
  }

  async showConfigurationSummary() {
    console.log('\n' + '='.repeat(50));
    console.log('📋 INSTALLATION SUMMARY');
    console.log('='.repeat(50));
    
    console.log(`Installation Mode: ${this.installationOptions.mode}`);
    console.log(`Installation Path: ${this.installationOptions.installPath || 'Default'}`);
    
    if (this.installationOptions.mode === 'client') {
      console.log(`Server Host: ${this.installationOptions.serverHost}`);
      console.log(`Server Port: ${this.installationOptions.serverPort}`);
    }
    
    if (this.installationOptions.mode === 'server' || this.installationOptions.mode === 'standalone') {
      console.log(`Server Port: ${this.installationOptions.serverPort || 3001}`);
      console.log(`Database Type: ${this.installationOptions.dbType || 'sqlite'}`);
      
      if (this.installationOptions.dbType && this.installationOptions.dbType !== 'sqlite') {
        console.log(`Database Host: ${this.installationOptions.dbHost}`);
        console.log(`Database Port: ${this.installationOptions.dbPort}`);
        console.log(`Database Name: ${this.installationOptions.dbName}`);
        console.log(`Database User: ${this.installationOptions.dbUser}`);
      }
      
      if (this.installationOptions.createService !== undefined) {
        console.log(`Install as Service: ${this.installationOptions.createService ? 'Yes' : 'No'}`);
      }
      
      if (this.installationOptions.autoStart !== undefined) {
        console.log(`Auto Start: ${this.installationOptions.autoStart ? 'Yes' : 'No'}`);
      }
    }
    
    console.log('='.repeat(50));
  }

  async askConfirmation() {
    return new Promise((resolve) => {
      this.rl.question('\nProceed with installation? (y/n) [y]: ', (answer) => {
        const choice = answer.trim().toLowerCase() || 'y';
        resolve(choice === 'y' || choice === 'yes');
      });
    });
  }

  async showPostInstallationInfo() {
    console.log('\n' + '='.repeat(50));
    console.log('🎉 INSTALLATION COMPLETE');
    console.log('='.repeat(50));
    
    if (this.installationOptions.mode === 'server' || this.installationOptions.mode === 'standalone') {
      const port = this.installationOptions.serverPort || 3001;
      console.log(`\n🌐 Access your DoctorApp at: http://localhost:${port}`);
      
      if (this.installationOptions.createService) {
        console.log('\n📋 Service Information:');
        console.log('  Service Name: DoctorApp');
        console.log('  Status: ' + (this.installationOptions.autoStart ? 'Running (Auto-start enabled)' : 'Stopped'));
        console.log('\n  Service Commands:');
        console.log('    Start:   net start DoctorApp');
        console.log('    Stop:    net stop DoctorApp');
        console.log('    Restart: net stop DoctorApp && net start DoctorApp');
      }
    }
    
    if (this.installationOptions.mode === 'client') {
      console.log(`\n💻 DoctorApp client installed successfully!`);
      console.log(`   Server: ${this.installationOptions.serverHost}:${this.installationOptions.serverPort}`);
    }
    
    console.log('\n📁 Installation Directory:', this.installationOptions.installPath || 'Default location');
    console.log('\n📚 Documentation and support: https://doctorapp.com/docs');
    console.log('\n🔧 Configuration files can be found in the installation directory.');
    
    console.log('\nThank you for installing DoctorApp! 🏥');
  }

  question(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, resolve);
    });
  }
}

// Start the installation wizard
if (require.main === module) {
  const wizard = new InstallationWizard();
  wizard.start().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = InstallationWizard;