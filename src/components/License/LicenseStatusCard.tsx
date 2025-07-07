// src/components/license/LicenseStatusCard.tsx
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Key, 
  Monitor,
  Calendar,
  Timer
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/ui/use-toast';
import type { LicenseStatus } from '@/types/electron';

interface LicenseStatusCardProps {
  licenseStatus?: LicenseStatus;
}

export const LicenseStatusCard: React.FC<LicenseStatusCardProps> = ({ licenseStatus }) => {
const [showActivation, setShowActivation] = useState(licenseStatus.type === 'trial_expired');

  const [licenseKey, setLicenseKey] = useState('');
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState('');
  const { t, language } = useLanguage();
  const { toast } = useToast();
useEffect(() => {
  if (licenseStatus?.type === 'trial_expired') {
    setShowActivation(true);
  }
}, [licenseStatus]);
  // Don't show in browser mode or if no license info
  if (!licenseStatus || !window.electron || licenseStatus.type === 'browser') {
    return null;
  }

  const handleActivation = async () => {
    if (!licenseKey.trim()) {
      setError('Please enter a license key');
      return;
    }

    setActivating(true);
    setError('');

    try {
      await window.electron.activateLicense(licenseKey);
      setShowActivation(false);
      setLicenseKey('');
      toast({
        title: "License Activated",
        description: "Your license has been activated successfully.",
      });
      // Refresh the page to update license status
      window.location.reload();
    } catch (error: any) {
      setError(error.message || 'Invalid license key');
    } finally {
      setActivating(false);
    }
  };

  const formatTime = (hours: number) => {
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    return `${hours.toFixed(1)} hour${hours !== 1 ? 's' : ''}`;
  };

  const getStatusInfo = () => {
    switch (licenseStatus.type) {
      case 'trial':
        const progressPercentage = licenseStatus.usageHours && licenseStatus.totalHours 
          ? (licenseStatus.usageHours / licenseStatus.totalHours) * 100 
          : 0;
        
        return {
          icon: Clock,
          title: 'Trial Version',
          status: 'trial',
          color: 'orange',
          bgColor: 'from-orange-50 to-yellow-50',
          details: [
            { 
              label: 'Remaining Time', 
              value: licenseStatus.remainingHours ? formatTime(licenseStatus.remainingHours) : 'Unknown',
              icon: Timer 
            },
            { 
              label: 'Used Time', 
              value: licenseStatus.usageHours ? formatTime(licenseStatus.usageHours) : 'Unknown',
              icon: Clock 
            },
            { 
              label: 'Trial Started', 
              value: licenseStatus.startDate || 'Unknown',
              icon: Calendar 
            }
          ],
          showProgress: true,
          progressValue: progressPercentage,
          showActivateButton: true
        };
          case 'trial_expired':
      return {
        icon: AlertTriangle,
        title: 'Trial Expired',
        status: 'expired',
        color: 'red',
        bgColor: 'from-red-50 to-rose-50',
        details: [
          { label: 'Trial Ended', value: licenseStatus.endDate || 'Unknown', icon: Calendar },
          { label: 'Used Time', value: licenseStatus.usageHours ? formatTime(licenseStatus.usageHours) : 'Unknown', icon: Clock }
        ],
        showProgress: false,
        progressValue: 100,
        showActivateButton: true
      };
      case 'full':
        return {
          icon: CheckCircle,
          title: 'Licensed Version',
          status: 'active',
          color: 'green',
          bgColor: 'from-green-50 to-emerald-50',
          details: [
            { 
              label: 'Status', 
              value: 'Active',
              icon: Shield 
            },
            { 
              label: 'Activated On', 
              value: licenseStatus.activatedDate || 'Unknown',
              icon: Calendar 
            },
            { 
              label: 'Machine ID', 
              value: licenseStatus.machineId?.substring(0, 8) + '...' || 'Unknown',
              icon: Monitor 
            }
          ],
          showProgress: false,
          showActivateButton: false
        };
        
      default:
        return {
          icon: AlertTriangle,
          title: 'Unknown Status',
          status: 'unknown',
          color: 'gray',
          bgColor: 'from-gray-50 to-slate-50',
          details: [],
          showProgress: false,
          showActivateButton: true
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <Card className={cn(`shadow-xl border-0 bg-gradient-to-br ${statusInfo.bgColor}`, language === 'ar' && 'rtl')}>
      <CardHeader>
        <div className={cn("flex items-center justify-between", language === 'ar' && 'flex-row-reverse')}>
          <CardTitle className={cn("flex items-center text-lg font-bold", language === 'ar' && 'text-right')}>
            {language === 'ar' ? (
              <>
                <span>License Status</span>
                <StatusIcon className={`w-5 h-5 ml-2 text-${statusInfo.color}-600`} />
              </>
            ) : (
              <>
                <StatusIcon className={`w-5 h-5 mr-2 text-${statusInfo.color}-600`} />
                License Status
              </>
            )}
          </CardTitle>
          <Badge 
            variant="secondary" 
            className={cn(
              statusInfo.color === 'green' ? 'bg-green-100 text-green-800 border-green-200' :
              statusInfo.color === 'orange' ? 'bg-orange-100 text-orange-800 border-orange-200' :
              'bg-gray-100 text-gray-800 border-gray-200'
            )}
          >
            <Shield className="w-3 h-3 mr-1" />
            {statusInfo.title}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Details */}
        <div className="space-y-3">
          {statusInfo.details.map((detail, index) => {
            const DetailIcon = detail.icon;
            return (
              <div key={index} className={cn("flex items-center justify-between p-3 bg-white rounded-lg shadow-sm", language === 'ar' && 'flex-row-reverse')}>
                <div className={cn("flex items-center", language === 'ar' ? 'space-x-reverse space-x-3' : 'space-x-3')}>
                  <div className={`p-2 bg-${statusInfo.color}-100 rounded-lg`}>
                    <DetailIcon className={`w-4 h-4 text-${statusInfo.color}-600`} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{detail.label}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{detail.value}</span>
              </div>
            );
          })}
        </div>

        {/* Progress Bar for Trial */}
        {statusInfo.showProgress && licenseStatus.type === 'trial' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Usage Progress</span>
              <span>{Math.round(statusInfo.progressValue)}%</span>
            </div>
            <Progress 
              value={statusInfo.progressValue} 
              className="h-2"
            />
            {licenseStatus.remainingHours && licenseStatus.remainingHours < 2 && (
              <Alert className="border-orange-500">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <AlertDescription>
                  Trial period is almost over. Activate your license to continue using the application.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Activate License Button */}
        {statusInfo.showActivateButton && (
          <div className="pt-2">
            <Dialog open={showActivation} onOpenChange={setShowActivation}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full bg-white hover:bg-gray-50 border-gray-200"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Activate License
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-center">Activate License</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
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
                    <Button 
                      variant="outline" 
                      onClick={() => setShowActivation(false)}
                      disabled={activating}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleActivation}
                      disabled={activating || !licenseKey.trim()}
                      className="flex-1"
                    >
                      {activating ? 'Activating...' : 'Activate'}
                    </Button>
                  </div>

                  {licenseStatus.machineId && (
                    <div className="text-center text-xs text-gray-500 pt-2 border-t">
                      <p>Machine ID: {licenseStatus.machineId.substring(0, 8)}...</p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
};