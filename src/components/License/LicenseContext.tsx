// src/contexts/LicenseContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import type { LicenseStatus } from '@/types/electron';

interface LicenseContextType {
  licenseStatus: LicenseStatus | null;
  isLoading: boolean;
  error: string | null;
  refreshLicenseInfo: () => Promise<void>;
  activateLicense: (licenseKey: string) => Promise<void>;
  isTrialExpired: boolean;
  isLicensed: boolean;
  remainingHours: number;
}

const LicenseContext = createContext<LicenseContextType | undefined>(undefined);

interface LicenseProviderProps {
  children: ReactNode;
  autoRefreshInterval?: number; // in milliseconds, default 30000 (30 seconds)
}

export const LicenseProvider: React.FC<LicenseProviderProps> = ({ 
  children, 
  autoRefreshInterval = 30000 
}) => {
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshLicenseInfo = useCallback(async () => {
    try {
      setError(null);
      
      // Don't load license info in browser mode
      if (!window.electron) {
        setLicenseStatus(null);
        setIsLoading(false);
        return;
      }

      const info = await window.electron.getLicenseInfo();
      setLicenseStatus(info);
    } catch (err: any) {
      setError(err.message || 'Failed to load license information');
      console.error('Error loading license info:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const activateLicense = useCallback(async (licenseKey: string) => {
    if (!window.electron) {
      throw new Error('License activation is only available in desktop mode');
    }

    try {
      setError(null);
      await window.electron.activateLicense(licenseKey);
      // Refresh license info after activation
      await refreshLicenseInfo();
    } catch (err: any) {
      setError(err.message || 'Failed to activate license');
      throw err; // Re-throw to handle in component
    }
  }, [refreshLicenseInfo]);

  // Initial load
  useEffect(() => {
    refreshLicenseInfo();
  }, [refreshLicenseInfo]);

  // Auto-refresh license info
  useEffect(() => {
    if (autoRefreshInterval > 0) {
      const interval = setInterval(refreshLicenseInfo, autoRefreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshLicenseInfo, autoRefreshInterval]);

  // Derived state
  const isTrialExpired = licenseStatus?.type === 'trial_expired';
  const isLicensed = licenseStatus?.type === 'full';
  const remainingHours = licenseStatus?.remainingHours || 0;

  const contextValue: LicenseContextType = {
    licenseStatus,
    isLoading,
    error,
    refreshLicenseInfo,
    activateLicense,
    isTrialExpired,
    isLicensed,
    remainingHours
  };

  return (
    <LicenseContext.Provider value={contextValue}>
      {children}
    </LicenseContext.Provider>
  );
};

export const useLicense = (): LicenseContextType => {
  const context = useContext(LicenseContext);
  if (context === undefined) {
    throw new Error('useLicense must be used within a LicenseProvider');
  }
  return context;
};

// Hook for components that need to handle license expiration
export const useLicenseGuard = () => {
  const { isTrialExpired, isLicensed, licenseStatus } = useLicense();

  const canUseFeature = (requiresLicense: boolean = false): boolean => {
    if (!requiresLicense) return true;
    if (isLicensed) return true;
    if (licenseStatus?.type === 'trial' && !isTrialExpired) return true;
    return false;
  };

  return {
    canUseFeature,
    isTrialExpired,
    isLicensed,
    shouldShowLicensePrompt: isTrialExpired || (licenseStatus?.type === 'trial' && licenseStatus.remainingHours < 2)
  };
};