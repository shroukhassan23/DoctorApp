// src/types/electron.d.ts
export interface LicenseStatus {
    isValid: boolean;
    type: 'trial' | 'full' | 'trial_expired' | 'browser';
    message: string;
    remainingHours?: number;
    totalHours?: number;
    usageHours?: number;
    startDate?: string;
    activatedDate?: string;
    machineId?: string;
  }
  
  export interface DatabaseConfig {
    host: string;
    port: number;
    user: string;
    password: string;
  }
  
  export interface MasterInstallationConfig {
    mysqlPort: number;
    sharedFolderPath: string;
  }
  
  export interface ClientInstallationConfig extends DatabaseConfig {
    sharedFolderPath: string;
  }
  
  export interface ConnectionTestResult {
    success: boolean;
    error?: string;
  }
  
  declare global {
    interface Window {
      electron?: {
        // License Management
        getLicenseInfo(): Promise<LicenseStatus>;
        activateLicense(licenseKey: string): Promise<void>;
        checkLicense(): Promise<LicenseStatus>;
  
        // Setup Management
        isSetupComplete(): Promise<boolean>;
        setupMasterInstallation(config: MasterInstallationConfig): Promise<{ success: boolean }>;
        setupClientConfiguration(config: ClientInstallationConfig): Promise<{ success: boolean }>;
  
        // Connection Testing
        testDatabaseConnection(config: DatabaseConfig): Promise<ConnectionTestResult>;
        testSharedFolder(folderPath: string): Promise<ConnectionTestResult>;
  
        // Utility Functions
        getDefaultDocumentsPath(): Promise<string>;
        selectFolder(): Promise<string | null>;
        restartApp(): Promise<void>;
  
        // MySQL Management (for master installations)
        startMySQL(port: number): Promise<boolean>;
        stopMySQL(): Promise<boolean>;
        getMySQLStatus(): Promise<boolean>;
  
        // App Information
        platform: string;
        versions: any;
      };
    }
  }
  
  // Export the types for use in components
  export type { LicenseStatus, DatabaseConfig, MasterInstallationConfig, ClientInstallationConfig, ConnectionTestResult };