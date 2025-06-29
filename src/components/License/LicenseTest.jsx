import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw,
  Settings,
  Monitor
} from 'lucide-react';

const LicenseTest = () => {
  const [licenseInfo, setLicenseInfo] = useState(null);
  const [testKey, setTestKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadLicenseInfo();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadLicenseInfo, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadLicenseInfo = async () => {
    try {
      if (!window.electron) {
        setMessage('Running in browser mode - license features disabled');
        return;
      }
      
      const info = await window.electron.getLicenseInfo();
      setLicenseInfo(info);
      setMessage('');
    } catch (error) {
      setMessage(`Error loading license: ${error.message}`);
    }
  };

  const testLicenseActivation = async () => {
    if (!testKey.trim()) {
      setMessage('Please enter a license key to test');
      return;
    }

    setLoading(true);
    try {
      await window.electron.activateLicense(testKey);
      await loadLicenseInfo();
      setMessage('License activated successfully!');
      setTestKey('');
    } catch (error) {
      setMessage(`License activation failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetTrial = async () => {
    setLoading(true);
    try {
      // This is for testing only - would be removed in production
      await window.electron.resetTrial?.();
      await loadLicenseInfo();
      setMessage('Trial reset successfully (testing only)');
    } catch (error) {
      setMessage(`Reset failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (hours) => {
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    return `${hours.toFixed(1)} hour${hours !== 1 ? 's' : ''}`;
  };

  const getStatusInfo = () => {
    if (!licenseInfo) return null;

    switch (licenseInfo.type) {
      case 'trial':
        const progressPercentage = licenseInfo.usageHours && licenseInfo.totalHours 
          ? (licenseInfo.usageHours / licenseInfo.totalHours) * 100 
          : 0;
        
        return {
          icon: Clock,
          title: 'Trial Version',
          color: 'orange',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          details: [
            { label: 'Status', value: 'Active Trial' },
            { label: 'Remaining', value: formatTime(licenseInfo.remainingHours || 0) },
            { label: 'Used', value: formatTime(licenseInfo.usageHours || 0) },
            { label: 'Total', value: formatTime(licenseInfo.totalHours || 20) },
            { label: 'Progress', value: `${Math.round(progressPercentage)}%` }
          ],
          progress: progressPercentage
        };
        
      case 'full':
        return {
          icon: CheckCircle,
          title: 'Licensed Version',
          color: 'green',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          details: [
            { label: 'Status', value: 'Active License' },
            { label: 'Type', value: 'Full Version' },
            { label: 'Activated', value: licenseInfo.activatedDate || 'Unknown' }
          ]
        };
        
      case 'trial_expired':
        return {
          icon: AlertTriangle,
          title: 'Trial Expired',
          color: 'red',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          details: [
            { label: 'Status', value: 'Expired' },
            { label: 'Used Time', value: formatTime(licenseInfo.usageHours || 0) },
            { label: 'Total Time', value: formatTime(licenseInfo.totalHours || 20) }
          ]
        };
        
      default:
        return {
          icon: Shield,
          title: 'Unknown Status',
          color: 'gray',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          details: []
        };
    }
  };

  if (!window.electron) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Monitor className="w-5 h-5 mr-2" />
            Browser Mode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              License testing is only available in the Electron application.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo?.icon || Shield;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* License Status Card */}
      {statusInfo && (
        <Card className={`${statusInfo.bgColor} ${statusInfo.borderColor} border-2`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-lg">
                <StatusIcon className={`w-5 h-5 mr-2 text-${statusInfo.color}-600`} />
                License Status
              </CardTitle>
              <Badge variant="outline" className={`text-${statusInfo.color}-700 border-${statusInfo.color}-300`}>
                {statusInfo.title}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* License Details */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {statusInfo.details.map((detail, index) => (
                <div key={index} className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-sm text-gray-600">{detail.label}</div>
                  <div className="font-semibold">{detail.value}</div>
                </div>
              ))}
            </div>

            {/* Progress Bar for Trial */}
            {statusInfo.progress !== undefined && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Trial Usage</span>
                  <span>{Math.round(statusInfo.progress)}%</span>
                </div>
                <Progress value={statusInfo.progress} className="h-2" />
              </div>
            )}

            {/* Machine ID */}
            {licenseInfo?.machineId && (
              <div className="text-center text-xs text-gray-500 pt-2 border-t">
                Machine ID: {licenseInfo.machineId.substring(0, 12)}...
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Testing Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            License Testing Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Test License Activation */}
          <div className="space-y-2">
            <Label htmlFor="testKey">Test License Key (try: DoctorPassw0rd)</Label>
            <div className="flex space-x-2">
              <Input
                id="testKey"
                type="password"
                value={testKey}
                onChange={(e) => setTestKey(e.target.value)}
                placeholder="Enter license key"
                disabled={loading}
              />
              <Button 
                onClick={testLicenseActivation}
                disabled={loading || !testKey.trim()}
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Test Activate'}
              </Button>
            </div>
          </div>

          {/* Refresh License Info */}
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={loadLicenseInfo}
              disabled={loading}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Status
            </Button>
            
            {process.env.NODE_ENV === 'development' && (
              <Button 
                variant="outline" 
                onClick={resetTrial}
                disabled={loading}
                className="text-orange-600 hover:text-orange-700"
              >
                Reset Trial (Dev Only)
              </Button>
            )}
          </div>

          {/* Messages */}
          {message && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {/* Instructions */}
          <div className="text-sm text-gray-600 space-y-2">
            <div><strong>Testing Instructions:</strong></div>
            <ul className="list-disc list-inside space-y-1">
              <li>Default license key is: <code className="bg-gray-100 px-1 rounded">DoctorPassw0rd</code></li>
              <li>Trial duration is 20 hours of usage time</li>
              <li>License data is stored in Windows Registry or file system</li>
              <li>Usage time is tracked only when the app window is focused</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LicenseTest;