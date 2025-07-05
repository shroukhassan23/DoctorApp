// src/components/Setup/SetupWizard.jsx - Fixed Version
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const SetupWizard = ({ onSetupComplete }) => {
  const [step, setStep] = useState(1);
  const [installationType, setInstallationType] = useState('');
  const [config, setConfig] = useState({
    // Master configuration
    sharedFolderPath: '',
    installAsServices: true,
    
    // Client configuration (only needs master IP)
    masterHost: '192.168.1.100',
    patientServicePort: '3001',
    visitServicePort: '3002', 
    reportsServicePort: '3003'
  });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [installing, setInstalling] = useState(false);

  const handleInstallationTypeChange = (value) => {
    setInstallationType(value);
    if (value === 'master') {
      // Get default path for master
      const getDefaultPath = async () => {
        try {
          const defaultPath = window.electron ? await window.electron.getDefaultDocumentsPath() : 'C:';
          return `${defaultPath}/DoctorApp/SharedFiles`;
        } catch (error) {
          return 'C:/DoctorApp/SharedFiles';
        }
      };
    
      getDefaultPath().then(defaultPath => {
        setConfig(prev => ({
          ...prev,
          sharedFolderPath: defaultPath
        }));
      });
    }
  };

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      if (installationType === 'client') {
        // Test HTTP connection to master services
        const testResult = await window.electron.testMasterServices({
          masterHost: config.masterHost,
          patientServicePort: config.patientServicePort,
          visitServicePort: config.visitServicePort,
          reportsServicePort: config.reportsServicePort
        });

        if (testResult.success) {
          setTestResult({ 
            success: true, 
            message: `Successfully connected to master at ${config.masterHost}` 
          });
        } else {
          setTestResult({ 
            success: false, 
            message: `Connection failed: ${testResult.error}` 
          });
        }
      } else {
        // For master installation, just validate folder path
        if (config.sharedFolderPath) {
          setTestResult({ success: true, message: 'Master configuration validated!' });
        } else {
          setTestResult({ success: false, message: 'Please specify shared folder path' });
        }
      }
    } catch (error) {
      setTestResult({ success: false, message: `Test failed: ${error.message}` });
    } finally {
      setTesting(false);
    }
  };

  const performInstallation = async () => {
    setInstalling(true);
    
    try {
      console.log('DEBUG: About to install with config:', config);
      
      if (installationType === 'master') {
        // Setup master with SQLite + services
        await window.electron.setupMasterInstallation({
          sharedFolderPath: config.sharedFolderPath,
          installAsServices: config.installAsServices  // Make sure this is being sent
        });
      } else {
        // Setup client with master connection info
        await window.electron.setupClientConfiguration({
          masterHost: config.masterHost,
          patientServicePort: config.patientServicePort,
          visitServicePort: config.visitServicePort,
          reportsServicePort: config.reportsServicePort
        });
      }

      onSetupComplete(installationType, config);
    } catch (error) {
      setTestResult({ success: false, message: `Installation failed: ${error.message}` });
    } finally {
      setInstalling(false);
    }
  };

  const renderStep1 = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Choose Installation Type</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup value={installationType} onValueChange={handleInstallationTypeChange}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="master" id="master" />
            <Label htmlFor="master" className="cursor-pointer">
              <div>
                <div className="font-medium">Master Installation</div>
                <div className="text-sm text-gray-500">
                  Install database and API services on this machine
                </div>
              </div>
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="client" id="client" />
            <Label htmlFor="client" className="cursor-pointer">
              <div>
                <div className="font-medium">Client Installation</div>
                <div className="text-sm text-gray-500">
                  Connect to existing master installation
                </div>
              </div>
            </Label>
          </div>
        </RadioGroup>
        
        <Button 
          onClick={() => setStep(2)} 
          disabled={!installationType}
          className="w-full"
        >
          Continue
        </Button>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>
          {installationType === 'master' ? 'Master Configuration' : 'Client Configuration'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
      {installationType === 'master' ? (
  <>
    <div className="space-y-2">
      <Label htmlFor="sharedFolder">Shared Folder Path</Label>
      <Input
        id="sharedFolder"
        value={config.sharedFolderPath}
        onChange={(e) => setConfig(prev => ({ ...prev, sharedFolderPath: e.target.value }))}
        placeholder="C:/DoctorApp/SharedFiles"
      />
      <div className="text-sm text-gray-500">
        This folder will store uploaded files and backups
      </div>
    </div>

    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        id="installAsServices"
        checked={config.installAsServices || false}
        onChange={(e) => setConfig(prev => ({ ...prev, installAsServices: e.target.checked }))}
        className="rounded border-gray-300"
      />
      <Label htmlFor="installAsServices" className="text-sm">
        Install as Windows Services (recommended for production)
      </Label>
    </div>
    <div className="text-xs text-gray-500">
      Services will start automatically with Windows and run in the background
    </div>
    
    <Alert>
      <AlertDescription>
        Master installation will:
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Setup SQLite database</li>
          <li>Install 3 API services (ports 3001-3003)</li>
          <li>Create shared storage folder</li>
          {config.installAsServices && <li>Install services to run automatically with Windows</li>}
        </ul>
      </AlertDescription>
    </Alert>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="masterHost">Master Server IP Address</Label>
              <Input
                id="masterHost"
                value={config.masterHost}
                onChange={(e) => setConfig(prev => ({ ...prev, masterHost: e.target.value }))}
                placeholder="192.168.1.100"
              />
              <div className="text-sm text-gray-500">
                IP address of the machine running the master installation
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-2">
                <Label htmlFor="patientServicePort">Patient Port</Label>
                <Input
                  id="patientServicePort"
                  value={config.patientServicePort}
                  onChange={(e) => setConfig(prev => ({ ...prev, patientServicePort: e.target.value }))}
                  placeholder="3001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="visitServicePort">Visit Port</Label>
                <Input
                  id="visitServicePort"
                  value={config.visitServicePort}
                  onChange={(e) => setConfig(prev => ({ ...prev, visitServicePort: e.target.value }))}
                  placeholder="3002"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reportsServicePort">Reports Port</Label>
                <Input
                  id="reportsServicePort"
                  value={config.reportsServicePort}
                  onChange={(e) => setConfig(prev => ({ ...prev, reportsServicePort: e.target.value }))}
                  placeholder="3003"
                />
              </div>
            </div>

            <Alert>
              <AlertDescription>
                Client installation will only setup the user interface. 
                All data will be accessed from the master server.
              </AlertDescription>
            </Alert>
          </>
        )}

        {testResult && (
          <Alert className={testResult.success ? 'border-green-500' : 'border-red-500'}>
            <div className="flex items-center">
              {testResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <AlertDescription className="ml-2">
                {testResult.message}
              </AlertDescription>
            </div>
          </Alert>
        )}

        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
            Back
          </Button>
          <Button 
            onClick={testConnection} 
            disabled={testing}
            variant="outline"
            className="flex-1"
          >
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              'Test Connection'
            )}
          </Button>
          <Button 
            onClick={() => setStep(3)} 
            disabled={!testResult?.success}
            className="flex-1"
          >
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Confirm Installation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p><strong>Installation Type:</strong> {installationType === 'master' ? 'Master' : 'Client'}</p>
          {installationType === 'master' ? (
            <>
              <p><strong>Shared Folder:</strong> {config.sharedFolderPath}</p>
              <p><strong>Services:</strong> Will run on ports 3001, 3002, 3003</p>
            </>
          ) : (
            <>
              <p><strong>Master Server:</strong> {config.masterHost}</p>
              <p><strong>Patient Service:</strong> {config.masterHost}:{config.patientServicePort}</p>
              <p><strong>Visit Service:</strong> {config.masterHost}:{config.visitServicePort}</p>
              <p><strong>Reports Service:</strong> {config.masterHost}:{config.reportsServicePort}</p>
            </>
          )}
        </div>

        <Alert>
          <AlertDescription>
            {installationType === 'master' 
              ? 'This will install SQLite database and API services on this machine.'
              : 'This will configure the application to connect to the master server.'
            }
          </AlertDescription>
        </Alert>

        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
            Back
          </Button>
          <Button 
            onClick={performInstallation} 
            disabled={installing}
            className="flex-1"
          >
            {installing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Installing...
              </>
            ) : (
              'Install'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Doctor App Setup</h1>
          <p className="text-gray-600 mt-2">Step {step} of 3</p>
        </div>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>
    </div>
  );
};

export default SetupWizard;