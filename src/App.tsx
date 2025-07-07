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

const queryClient = new QueryClient();// src/App.tsx
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
      if (!window.electron) {
        setSetupComplete(true);
        setLicenseStatus({ isValid: true, type: 'browser' });
        setLoading(false);
        return;
      }

      if (!window.electron.isSetupComplete || !window.electron.checkLicense) {
        setLoading(false);
        return;
      }

      const isSetupComplete = await window.electron.isSetupComplete();
      const license = await window.electron.checkLicense();

      setSetupComplete(isSetupComplete);
      setLicenseStatus(license);
      setLoading(false);

      if (license.type === 'trial' && license.remainingHours < 2) {
        toast({
          title: "Trial Expiring Soon",
          description: `Only ${license.remainingHours.toFixed(1)} hours remaining in your trial.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      setLoading(false);
    }
  };

  const handleSetupComplete = async () => {
    setSetupComplete(true);
    const license = await window.electron.checkLicense();
    setLicenseStatus(license);
  };

  const handleLicenseActivated = async () => {
    const license = await window.electron.checkLicense();
    setLicenseStatus(license);
    toast({
      title: "License Activated",
      description: "Your license has been activated successfully.",
    });
  };

  // ⏳ Show loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading Doctor App...</div>
      </div>
    );
  }

  // 🛠️ First-time setup wizard
  if (!setupComplete) {
    return <SetupWizard onSetupComplete={handleSetupComplete} />;
  }

  // 🔒 License expired → show activation only (no dashboard)
  if (
    licenseStatus?.type === 'trial_expired' ||
    (licenseStatus && !licenseStatus.isValid)
  ) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LicenseActivation onLicenseActivated={handleLicenseActivated} />
      </div>
    );
  }
  
if (licenseStatus?.type === 'trial_expired' || !licenseStatus?.isValid) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <LicenseActivation onLicenseActivated={handleLicenseActivated} />
    </div>
  );
}
  // ✅ Main dashboard with top trial banner
  return (
    <HashRouter>
      <PrintSettingsProvider>
        <div className="flex flex-col min-h-screen">
        

          {/* 🧠 Main dashboard */}
          <Dashboard licenseStatus={licenseStatus} />
        </div>
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