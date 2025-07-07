// src/components/License/TrialStatusBar.jsx - Trial status display for dashboard
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, AlertTriangle, X } from 'lucide-react';

const TrialStatusBar = ({ licenseStatus }) => {
  const [dismissed, setDismissed] = useState(false);

  // Don't show if dismissed or if not a trial
  if (dismissed || !licenseStatus || licenseStatus.type !== 'trial') {
    return null;
  }

  const formatTime = (hours) => {
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    return `${hours.toFixed(1)} hour${hours !== 1 ? 's' : ''}`;
  };

  const progressPercentage = ((licenseStatus.totalHours - licenseStatus.remainingHours) / licenseStatus.totalHours) * 100;
  const isLowTime = licenseStatus.remainingHours < 2;

  return (
    <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="flex items-center justify-between p-3 max-w-7xl mx-auto">
        <div className="flex items-center space-x-4 flex-1">
          <div className="flex items-center space-x-2">
            <Clock className={`h-4 w-4 ${isLowTime ? 'text-red-500' : 'text-orange-500'}`} />
            <span className="font-medium">Trial Version</span>
            <Badge 
              variant="outline" 
              className={`${isLowTime ? 'text-red-600 border-red-600' : 'text-orange-600 border-orange-600'}`}
            >
              {formatTime(licenseStatus.remainingHours)} remaining
            </Badge>
          </div>
          
          <div className="flex-1 max-w-xs">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Usage: {formatTime(licenseStatus.usageHours)}</span>
              <span>Total: {formatTime(licenseStatus.totalHours)}</span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-2"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              // You can add logic here to show license activation modal
              // For now, just show a message
              alert('License activation coming soon!');
            }}
          >
            Activate License
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {isLowTime && (
        <div className="px-3 pb-3">
          <Alert className="border-red-500">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription>
              Trial period is almost over. Activate your license to continue using the application.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};

export default TrialStatusBar;