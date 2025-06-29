// src/components/Setup/SetupWizard.jsx
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
    dbHost: 'localhost',
    dbPort: '3306',
    dbUser: 'root',
    dbPassword: '',
    sharedFolderPath: '',
    mysqlPort: '3306'
  });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [installing, setInstalling] = useState(false);

  const handleInstallationTypeChange = (value) => {
    setInstallationType(value);
    if (value === 'master') {
        // Get default path asynchronously
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
            dbHost: 'localhost',
            dbPort: '3306',
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
        // Test database connection
        const dbResult = await window.electron.testDatabaseConnection({
          host: config.dbHost,
          port: parseInt(config.dbPort),
          user: config.dbUser,
          password: config.dbPassword
        });

        // Test shared folder access
        const folderResult = await window.electron.testSharedFolder(config.sharedFolderPath);

        if (dbResult.success && folderResult.success) {
          setTestResult({ success: true, message: 'Connection successful!' });
        } else {
          setTestResult({ 
            success: false, 
            message: `Connection failed: ${dbResult.error || folderResult.error}` 
          });
        }
      } else {
        // For master installation, just validate paths
        setTestResult({ success: true, message: 'Configuration validated!' });
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
      if (installationType === 'master') {
        // Install MySQL and setup shared folder
        await window.electron.setupMasterInstallation({
          mysqlPort: parseInt(config.mysqlPort),
          sharedFolderPath: config.sharedFolderPath
        });
      } else {
        // Save client configuration
        await window.electron.setupClientConfiguration({
          host: config.dbHost,
          port: parseInt(config.dbPort),
          user: config.dbUser,
          password: config.dbPassword,
          sharedFolderPath: config.sharedFolderPath
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
                  Install database and shared storage on this machine
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
              <Label htmlFor="mysqlPort">MySQL Port</Label>
              <Input
                id="mysqlPort"
                value={config.mysqlPort}
                onChange={(e) => setConfig(prev => ({ ...prev, mysqlPort: e.target.value }))}
                placeholder="3306"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sharedFolder">Shared Folder Path</Label>
              <Input
                id="sharedFolder"
                value={config.sharedFolderPath}
                onChange={(e) => setConfig(prev => ({ ...prev, sharedFolderPath: e.target.value }))}
                placeholder="C:/DoctorApp/SharedFiles"
              />
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="dbHost">Database Server IP</Label>
              <Input
                id="dbHost"
                value={config.dbHost}
                onChange={(e) => setConfig(prev => ({ ...prev, dbHost: e.target.value }))}
                placeholder="192.168.1.100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dbPort">Database Port</Label>
              <Input
                id="dbPort"
                value={config.dbPort}
                onChange={(e) => setConfig(prev => ({ ...prev, dbPort: e.target.value }))}
                placeholder="3306"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dbUser">Database User</Label>
              <Input
                id="dbUser"
                value={config.dbUser}
                onChange={(e) => setConfig(prev => ({ ...prev, dbUser: e.target.value }))}
                placeholder="root"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dbPassword">Database Password</Label>
              <Input
                id="dbPassword"
                type="password"
                value={config.dbPassword}
                onChange={(e) => setConfig(prev => ({ ...prev, dbPassword: e.target.value }))}
                placeholder="Password (leave empty if none)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sharedFolderPath">Shared Folder Path</Label>
              <Input
                id="sharedFolderPath"
                value={config.sharedFolderPath}
                onChange={(e) => setConfig(prev => ({ ...prev, sharedFolderPath: e.target.value }))}
                placeholder="\\192.168.1.100\DoctorApp\SharedFiles"
              />
            </div>
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
              <p><strong>MySQL Port:</strong> {config.mysqlPort}</p>
              <p><strong>Shared Folder:</strong> {config.sharedFolderPath}</p>
            </>
          ) : (
            <>
              <p><strong>Database Server:</strong> {config.dbHost}:{config.dbPort}</p>
              <p><strong>Database User:</strong> {config.dbUser}</p>
              <p><strong>Shared Folder:</strong> {config.sharedFolderPath}</p>
            </>
          )}
        </div>

        <Alert>
          <AlertDescription>
            {installationType === 'master' 
              ? 'This will install MySQL database and create shared folders on this machine.'
              : 'This will configure the application to connect to the master installation.'
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