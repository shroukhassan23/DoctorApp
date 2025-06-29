const fs = require('fs');
const path = require('path');
const os = require('os');

class InstallerPreparation {
  constructor() {
    this.platform = os.platform();
    this.rootDir = process.cwd();
    this.buildDir = path.join(this.rootDir, 'build');
  }

  async prepareInstaller() {
    console.log('🔧 Preparing installer resources...');
    
    await this.createBuildDirectory();
    await this.createIcons();
    await this.createInstallerScripts();
    await this.validateResources();
    
    console.log('✅ Installer preparation completed');
  }

  async createBuildDirectory() {
    await fs.promises.mkdir(this.buildDir, { recursive: true });
    console.log('📁 Build directory created');
  }

  async createIcons() {
    console.log('🎨 Creating application icons...');
    
    // Create placeholder icons if they don't exist
    const icons = [
      { name: 'icon.ico', size: '256x256', platform: 'Windows' },
      { name: 'icon.icns', size: '512x512', platform: 'macOS' },
      { name: 'icon.png', size: '512x512', platform: 'Linux' }
    ];

    for (const icon of icons) {
      const iconPath = path.join(this.buildDir, icon.name);
      
      if (!fs.existsSync(iconPath)) {
        // Create a simple placeholder icon file
        const placeholder = this.createIconPlaceholder(icon);
        await fs.promises.writeFile(iconPath, placeholder);
        console.log(`📝 Created placeholder icon: ${icon.name} (${icon.size}) for ${icon.platform}`);
      } else {
        console.log(`✅ Icon exists: ${icon.name}`);
      }
    }
    
    console.log('💡 Replace placeholder icons with actual application icons before distribution');
  }

  createIconPlaceholder(icon) {
    // Create a simple text placeholder (in real implementation, you'd create actual icon files)
    return `Placeholder for ${icon.name} - ${icon.size} ${icon.platform} icon`;
  }

  async createInstallerScripts() {
    console.log('📜 Creating installer scripts...');
    
    // Windows NSIS script additions
    await this.createWindowsInstallerScript();
    
    // macOS DMG configuration
    await this.createMacInstallerScript();
    
    // Create license file
    await this.createLicenseFile();
    
    console.log('✅ Installer scripts created');
  }

  async createWindowsInstallerScript() {
    const nsisScript = `
; Doctor App Windows Installer Additions
Section "Setup Configuration" SEC02
  ; This will be handled by the main application
  ; The installer just copies files
SectionEnd
`;

    const scriptPath = path.join(this.buildDir, 'installer-additions.nsi');
    await fs.promises.writeFile(scriptPath, nsisScript);
    console.log('📝 Windows NSIS additions created');
  }

  async createMacInstallerScript() {
    const dmgConfig = {
      title: 'Doctor App Installer',
      background: null,
      icon: path.join(this.buildDir, 'icon.icns'),
      contents: [
        { x: 150, y: 200, type: 'file' },
        { x: 450, y: 200, type: 'link', path: '/Applications' }
      ],
      window: {
        width: 600,
        height: 400
      }
    };

    const configPath = path.join(this.buildDir, 'dmg-config.json');
    await fs.promises.writeFile(configPath, JSON.stringify(dmgConfig, null, 2));
    console.log('📝 macOS DMG configuration created');
  }

  async createLicenseFile() {
    const license = `END USER LICENSE AGREEMENT

Doctor App

This End User License Agreement ("Agreement") is a legal agreement between you and Doctor App.

1. LICENSE GRANT
Subject to the terms of this Agreement, Doctor App grants you a limited, non-exclusive, non-transferable license to use the Software.

2. RESTRICTIONS
You may not:
- Copy, modify, or distribute the Software
- Reverse engineer or attempt to extract the source code
- Use the Software for unlawful purposes

3. TRIAL VERSION
The trial version is limited to 20 hours of usage time.

4. SUPPORT
Support is provided as-is with no warranty.

5. TERMINATION
This license is effective until terminated.

By installing and using this software, you agree to these terms.
`;

    const licensePath = path.join(this.buildDir, 'license.txt');
    await fs.promises.writeFile(licensePath, license);
    console.log('📝 License file created');
  }

  async validateResources() {
    console.log('🔍 Validating installer resources...');
    
    const requiredFiles = [
      'icon.ico',
      'icon.icns', 
      'icon.png',
      'license.txt'
    ];

    let allValid = true;
    
    for (const file of requiredFiles) {
      const filePath = path.join(this.buildDir, file);
      if (fs.existsSync(filePath)) {
        console.log(`✅ ${file} exists`);
      } else {
        console.warn(`⚠️  ${file} missing`);
        allValid = false;
      }
    }

    if (allValid) {
      console.log('✅ All installer resources validated');
    } else {
      console.warn('⚠️  Some installer resources are missing');
    }
  }
}

// Run installer preparation
const preparation = new InstallerPreparation();
preparation.prepareInstaller().catch(console.error);