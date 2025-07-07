// src/App.tsx - Enhanced with Setup and License Management
import React, { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { DayPickerProvider } from 'react-day-picker';
import { useToast } from "@/components/ui/use-toast";

// Import your existing components
import { Dashboard } from "./pages/Dashboard";
import SetupWizard from './components/Setup/SetupWizard';
import LicenseActivation from './components/License/LicenseActivation';
import { PrintSettingsProvider } from './components/prescriptions/PrintSettings';

const queryClient = new QueryClient();

const AppCore = () => {
  const [setupComplete, setSetupComplete] = useState(false);
  const [licenseStatus, setLicenseStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Check if we're in Electron environment
      if (!window.electron) {
        console.warn('Running in browser mode - setup and license features disabled');
        setSetupComplete(true);
        setLicenseStatus({ isValid: true, type: 'browser' });
        setLoading(false);
        return;
      }

      // Check if setup functions exist (for minimal build compatibility)
      if (!window.electron.isSetupComplete || !window.electron.checkLicense) {
        console.error('Setup functions not available - this may be a build issue');
        setLoading(false);
        // Don't set setupComplete to true - let it show setup wizard
        return;
      }

      // Check setup status
      const isSetupComplete = await window.electron.isSetupComplete();
      setSetupComplete(isSetupComplete);

      // Check license status
      const license = await window.electron.checkLicense();
      setLicenseStatus(license);

      setLoading(false);

      // Show license warnings if needed
      if (license.type === 'trial' && license.remainingHours < 2) {
        toast({
          title: "Trial Expiring Soon",
          description: `Only ${license.remainingHours.toFixed(1)} hours remaining in your trial.`,
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Error initializing app:', error);
      setLoading(false);
      toast({
        title: "Initialization Error",
        description: "There was an error starting the application.",
        variant: "destructive",
      });
    }
  };

  const handleSetupComplete = async (installationType, config) => {
    try {
      setSetupComplete(true);
      
      toast({
        title: "Setup Complete",
        description: `${installationType === 'master' ? 'Master' : 'Client'} installation completed successfully.`,
      });

      // Refresh license status
      const license = await window.electron.checkLicense();
      setLicenseStatus(license);

    } catch (error) {
      console.error('Setup completion error:', error);
      toast({
        title: "Setup Error",
        description: "There was an error completing the setup.",
        variant: "destructive",
      });
    }
  };

  const handleLicenseActivated = async () => {
    try {
      // Refresh license status
      const license = await window.electron.checkLicense();
      setLicenseStatus(license);

      toast({
        title: "License Activated",
        description: "Your license has been activated successfully.",
      });

    } catch (error) {
      console.error('License activation error:', error);
    }
  };

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading Doctor App...</h2>
          <p className="text-gray-600 mt-2">Please wait while we initialize the application</p>
        </div>
      </div>
    );
  }

  // Setup wizard (first-time setup)
  if (!setupComplete) {
    return <SetupWizard onSetupComplete={handleSetupComplete} />;
  }

  // License expired - force activation
  if (licenseStatus && !licenseStatus.isValid) {
    return <LicenseActivation onLicenseActivated={handleLicenseActivated} />;
  }

  // Main application - return your existing Dashboard structure
return (
  <HashRouter>
    {/* License status bar for trial users */}
    {licenseStatus?.type === 'trial' && (
      <LicenseActivation onLicenseActivated={handleLicenseActivated} />
    )}

    <PrintSettingsProvider>
      {/* Conditionally render Dashboard only if licenseStatus is invalid */}
      {licenseStatus.isValid && (
        <Dashboard licenseStatus={licenseStatus} />
      )}
    </PrintSettingsProvider>
  </HashRouter>
);

};

// Main App component with all providers (keeping your existing structure)
const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <DayPickerProvider
        initialProps={{
          mode: 'single',
          fromYear: 1900,
          toYear: 2030
        }}
      >
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppCore />
        </TooltipProvider>
      </DayPickerProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;