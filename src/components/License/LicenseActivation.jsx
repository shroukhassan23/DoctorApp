// src/components/License/LicenseActivation.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Key, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const LicenseActivation = ({ onLicenseActivated }) => {
  const [licenseKey, setLicenseKey] = useState('');
  const [licenseInfo, setLicenseInfo] = useState(null);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState('');
  const [showActivation, setShowActivation] = useState(false);

  useEffect(() => {
    loadLicenseInfo();
    
    // Set up periodic license checking
    const interval = setInterval(loadLicenseInfo, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);

  const loadLicenseInfo = async () => {
    try {
      const info = await window.electron.getLicenseInfo();
      setLicenseInfo(info);
      
      if (info.type === 'trial_expired') {
        setShowActivation(true);
      }
    } catch (error) {
      console.error('Error loading license info:', error);
    }
  };

  // في LicenseActivation component - عدل الـ handleActivation function

const handleActivation = async () => {
  if (!licenseKey.trim()) {
    setError('Please enter a license key');
    return;
  }

  setActivating(true);
  setError('');

  try {
    // Activate license
    await window.electron.activateLicense(licenseKey);
    
    // Clear form
    setLicenseKey('');
    
    // Show success message
    toast({
      title: "License Activated",
      description: "Your license has been activated successfully.",
    });

    // IMPORTANT: Call the parent callback to update state
    if (onLicenseActivated) {
      await onLicenseActivated();
    }
    
  } catch (error) {
    setError(error.message || 'Invalid license key');
    console.error('License activation error:', error);
  } finally {
    setActivating(false);
  }
};

  const formatTime = (hours) => {
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    return `${hours.toFixed(1)} hour${hours !== 1 ? 's' : ''}`;
  };

  if (!licenseInfo) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If trial expired or user wants to activate
  if (licenseInfo.type === 'trial_expired' || showActivation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
              <Key className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">
              {licenseInfo.type === 'trial_expired' ? 'Trial Expired' : 'Activate License'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {licenseInfo.type === 'trial_expired' && (
              <Alert className="border-orange-500">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <AlertDescription>
                  Your {licenseInfo.totalHours}-hour trial period has ended. 
                  Please enter your license key to continue using the application.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="licenseKey">License Key</Label>
              <Input
                id="licenseKey"
                type="password"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="Enter your license key"
                disabled={activating}
                onKeyPress={(e) => e.key === 'Enter' && handleActivation()}
              />
            </div>

            {error && (
              <Alert className="border-red-500">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex space-x-2">
              {licenseInfo.type !== 'trial_expired' && (
                <Button 
                  variant="outline" 
                  onClick={() => setShowActivation(false)}
                  disabled={activating}
                  className="flex-1"
                >
                  Cancel
                </Button>
              )}
              <Button 
                onClick={handleActivation}
                disabled={activating || !licenseKey.trim()}
                className="flex-1"
              >
                {activating ? 'Activating...' : 'Activate License'}
              </Button>
            </div>

            <div className="text-center text-sm text-gray-500 pt-4 border-t">
              <p>Machine ID: {licenseInfo.machineId?.substring(0, 8)}...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Trial status display
  if (licenseInfo.type === 'trial') {
    const progressPercentage = ((licenseInfo.totalHours - licenseInfo.remainingHours) / licenseInfo.totalHours) * 100;
    
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <span className="font-medium">Trial Version</span>
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                {formatTime(licenseInfo.remainingHours)} remaining
              </Badge>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowActivation(true)}
            >
              Activate License
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Usage: {formatTime(licenseInfo.usageHours)}</span>
              <span>Total: {formatTime(licenseInfo.totalHours)}</span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-2"
            />
          </div>
          
          {licenseInfo.remainingHours < 2 && (
            <Alert className="mt-3 border-orange-500">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <AlertDescription>
                Trial period is almost over. Activate your license to continue using the application.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  // Full license status
  if (licenseInfo.type === 'full') {
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="font-medium">Licensed Version</span>
              <Badge variant="outline" className="text-green-600 border-green-600">
                Active
              </Badge>
            </div>
            <div className="text-sm text-gray-600">
              Activated: {licenseInfo.activatedDate}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default LicenseActivation;