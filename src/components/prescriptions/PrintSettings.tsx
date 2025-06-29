import React, { useState, useContext, createContext, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Settings, Printer, Download, FileText, Save, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

// Print Settings Types
export interface PrintSettings {
  paperSize: 'A4' | 'A5' | 'Letter' | 'Legal';
  orientation: 'portrait' | 'landscape';
  margins: 'normal' | 'narrow' | 'wide';
  fontSize: 'small' | 'medium' | 'large';
  includeHeader: boolean;
  includeFooter: boolean;
  colorMode: 'color' | 'grayscale';
  quality: 'draft' | 'normal' | 'high';
}

const defaultSettings: PrintSettings = {
  paperSize: 'A4',
  orientation: 'portrait',
  margins: 'normal',
  fontSize: 'medium',
  includeHeader: true,
  includeFooter: true,
  colorMode: 'color',
  quality: 'normal'
};

// Print Context
const PrintContext = createContext<{
  settings: PrintSettings;
  updateSettings: (settings: PrintSettings) => void;
  showSettingsDialog: boolean;
  setShowSettingsDialog: (show: boolean) => void;
  handlePrint: (content?: string) => void;
}>({
  settings: defaultSettings,
  updateSettings: () => {},
  showSettingsDialog: false,
  setShowSettingsDialog: () => {},
  handlePrint: () => {}
});

// Print Settings Provider
export const PrintSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<PrintSettings>(defaultSettings);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const { t, language } = useLanguage();
  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('prescription-print-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error('Error loading print settings:', error);
      }
    }
  }, []);

  const updateSettings = (newSettings: PrintSettings) => {
    setSettings(newSettings);
    // Save to localStorage
    localStorage.setItem('prescription-print-settings', JSON.stringify(newSettings));
  };

  const handlePrint = (content?: string) => {
    // Implementation for actual printing logic
    console.log('Printing with settings:', settings);
    if (content) {
      console.log('Content to print:', content);
    }
    // Here you would implement the actual printing logic
  };

  return (
    <PrintContext.Provider value={{
      settings,
      updateSettings,
      showSettingsDialog,
      setShowSettingsDialog,
      handlePrint
    }}>
      {children}
      <GlobalPrintSettingsDialog />
    </PrintContext.Provider>
  );
};

// Hook to use print context
export const usePrintSettings = () => {
  const context = useContext(PrintContext);
  if (!context) {
    throw new Error('usePrintSettings must be used within PrintSettingsProvider');
  }
  return context;
};

// Enhanced Print Settings Dialog Component
const GlobalPrintSettingsDialog = () => {
  const { settings, updateSettings, showSettingsDialog, setShowSettingsDialog } = usePrintSettings();
  const [tempSettings, setTempSettings] = useState<PrintSettings>(settings);
  const [activeTab, setActiveTab] = useState<'layout' | 'format' | 'advanced'>('layout');
  const [isSaving, setIsSaving] = useState(false);
  const { t, language } = useLanguage();
  // Update temp settings when dialog opens
  useEffect(() => {
    if (showSettingsDialog) {
      setTempSettings(settings);
    }
  }, [showSettingsDialog, settings]);

  const paperSizes = [
    { value: 'A4', label: 'A4 (21 × 29.7 cm)', description: t('print.standardSize') },
    { value: 'A5', label: 'A5 (14.8 × 21 cm)', description: t('print.combinedSize') },
    { value: 'Letter', label: 'Letter (21.6 × 27.9 cm)', description: t('print.americanStandard') },
    { value: 'Legal', label: 'Legal (21.6 × 35.6 cm)', description: t('print.extendedFormat') }
  ];

  const marginOptions = [
    { value: 'narrow', label: t('print.narrow'), description: t('print.moreSpace') },
    { value: 'normal', label: t('print.normal'), description: t('print.balancedLayout') },
    { value: 'wide', label: t('print.wide'), description: t('print.spaces') }
  ];

  const fontSizes = [
    { value: 'small', label: t('print.small'),  },
    { value: 'medium', label: t('print.medium'), },
    { value: 'large', label: t('print.large'),  }
  ];

  const handleSettingChange = <K extends keyof PrintSettings>(
    key: K,
    value: PrintSettings[K]
  ) => {
    setTempSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate saving delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateSettings(tempSettings);
    setIsSaving(false);
    setShowSettingsDialog(false);
  };

  const handleReset = () => {
    setTempSettings(defaultSettings);
  };

  const TabButton = ({ tab, label, icon: Icon }: { tab: string; label: string; icon: any }) => (
    <button
      onClick={() => setActiveTab(tab as any)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
        activeTab === tab
          ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
          : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-transparent'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  const OptionCard = ({ 
    title, 
    description, 
    selected, 
    onClick 
  }: { 
    title: string; 
    description: string; 
    selected: boolean; 
    onClick: () => void;
  }) => (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
        selected
          ? 'border-blue-500 bg-blue-50 text-blue-700'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <div className="font-semibold text-sm">{title}</div>
      <div className={`text-xs mt-1 ${selected ? 'text-blue-600' : 'text-gray-500'}`}>
        {description}
      </div>
    </div>
  );

  const CheckboxOption = ({ 
    label, 
    description, 
    checked, 
    onChange 
  }: { 
    label: string; 
    description: string; 
    checked: boolean; 
    onChange: (checked: boolean) => void;
  }) => (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
      />
      <div>
        <div className="font-medium text-sm text-gray-800">{label}</div>
        <div className="text-xs text-gray-600 mt-1">{description}</div>
      </div>
    </div>
  );

  return (
    <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Settings className="w-6 h-6 text-blue-600" />
            {t('print.general')}
          </DialogTitle>
         
        </DialogHeader>

        {/* Current Settings Preview */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-green-800">{t('print.currentSettings')}</h3>
              <p className="text-sm text-green-600 mt-1">
                {t('print.size')}: {paperSizes.find(p => p.value === tempSettings.paperSize)?.label} | 
              
                {t('print.font')}: {fontSizes.find(f => f.value === tempSettings.fontSize)?.label}
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleReset}
                className="text-orange-600 border-orange-300 hover:bg-orange-50"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                {t('print.reset')}
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <TabButton tab="layout" label={t('print.layout')} icon={FileText} />
          <TabButton tab="format" label={t('print.format')} icon={Settings} />
        
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'layout' && (
            <>
              {/* Paper Size */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">{t('print.paperSize')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {paperSizes.map((size) => (
                    <OptionCard
                      key={size.value}
                      title={size.label}
                      description={size.description}
                      selected={tempSettings.paperSize === size.value}
                      onClick={() => handleSettingChange('paperSize', size.value as any)}
                    />
                  ))}
                </div>
              </div>

        
      

              {/* Margins */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">{t('print.margin')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {marginOptions.map((margin) => (
                    <OptionCard
                      key={margin.value}
                      title={margin.label}
                      description={margin.description}
                      selected={tempSettings.margins === margin.value}
                      onClick={() => handleSettingChange('margins', margin.value as any)}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'format' && (
            <>
              {/* Font Size */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">{t('print.fontSize')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {fontSizes.map((font) => (
                    <OptionCard
                      key={font.value}
                      title={font.label}
                      description={''}
                      selected={tempSettings.fontSize === font.value}
                      onClick={() => handleSettingChange('fontSize', font.value as any)}
                    />
                  ))}
                </div>
              </div> 
            </>
          )}
        </div>
        {/* Action Buttons */}
     
        <div className="flex justify-between items-center pt-6 border-t">
          <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
             {t('common.cancel')}
          </Button>
          
          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700 text-white px-6"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('common.saving')}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {t('common.save')}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Print Settings Button Component
export const PrintSettingsButton: React.FC<{ 
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}> = ({ variant = 'outline', size = 'md', showLabel = true }) => {
  const { setShowSettingsDialog } = usePrintSettings();

  const buttonClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    outline: 'border border-blue-600 text-blue-600 hover:bg-blue-50'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };
  const { t, language } = useLanguage();

  return (
    <>
<Button
  onClick={() => setShowSettingsDialog(true)}
  className={cn(
    "bg-[#2463EB] hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2",
   'flex-row-reverse'
  )}
>
 
  {t('prescription.settings')}


      <Settings className={`${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'}`} />
    
    </Button></>
  );
};

