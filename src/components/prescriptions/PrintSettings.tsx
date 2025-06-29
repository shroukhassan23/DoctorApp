import React, { useState, useContext, createContext, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Settings, Printer, Download, FileText, Save, RotateCcw, Move, Ruler } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

// Enhanced Print Settings Types
export interface PrintSettings {
  paperSize: 'A4' | 'A5' | 'Letter' | 'Legal';
  orientation: 'portrait' | 'landscape';
  margins: 'normal' | 'narrow' | 'wide' | 'custom';
  fontSize: 'small' | 'medium' | 'large';
  includeHeader: boolean;
  includeFooter: boolean;
  colorMode: 'color' | 'grayscale';
  quality: 'draft' | 'normal' | 'high';
  // New content spacing settings
  contentPadding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  contentMargin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  // Page margins (different from content margins)
  pageMargins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  lineHeight: number;
  paragraphSpacing: number;
}

const defaultSettings: PrintSettings = {
  paperSize: 'A4',
  orientation: 'portrait',
  margins: 'normal',
  fontSize: 'medium',
  includeHeader: true,
  includeFooter: true,
  colorMode: 'color',
  quality: 'normal',
  contentPadding: {
    top: 16,
    right: 16,
    bottom: 16,
    left: 16
  },
  contentMargin: {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
  },
  pageMargins: {
    top: 25,
    right: 25,
    bottom: 25,
    left: 25
  },
  lineHeight: 1.5,
  paragraphSpacing: 12
};

// Print Context
const PrintContext = createContext<{
  settings: PrintSettings;
  updateSettings: (settings: PrintSettings) => void;
  showSettingsDialog: boolean;
  setShowSettingsDialog: (show: boolean) => void;
  handlePrint: (content?: string) => void;
  getContentStyles: () => React.CSSProperties;
}>({
  settings: defaultSettings,
  updateSettings: () => {},
  showSettingsDialog: false,
  setShowSettingsDialog: () => {},
  handlePrint: () => {},
  getContentStyles: () => ({})
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

  const getContentStyles = (): React.CSSProperties => {
    return {
      padding: `${settings.contentPadding.top}px ${settings.contentPadding.right}px ${settings.contentPadding.bottom}px ${settings.contentPadding.left}px`,
      margin: `${settings.contentMargin.top}px ${settings.contentMargin.right}px ${settings.contentMargin.bottom}px ${settings.contentMargin.left}px`,
      lineHeight: settings.lineHeight,
      fontSize: settings.fontSize === 'small' ? '12px' : settings.fontSize === 'large' ? '16px' : '14px',
    };
  };
const handlePrint = (content?: string) => {
  const printContentHtml = content || document.querySelector('.print-content')?.innerHTML;
  if (!printContentHtml) {
    console.warn("No content found to print.");
    return;
  }

  const printStyles = `
    <style>
      @media print {
        @page {
          margin: ${settings.pageMargins.top}mm ${settings.pageMargins.right}mm ${settings.pageMargins.bottom}mm ${settings.pageMargins.left}mm;
          size: ${settings.paperSize} ${settings.orientation};
        }

        body {
          background: white !important;
          margin: 0;
          padding: 0;
        }

        header, .no-print {
          display: none !important;
        }

        .print-content {
          padding: ${settings.contentPadding.top}px ${settings.contentPadding.right}px ${settings.contentPadding.bottom}px ${settings.contentPadding.left}px;
          margin: ${settings.contentMargin.top}px ${settings.contentMargin.right}px ${settings.contentMargin.bottom}px ${settings.contentMargin.left}px;
          line-height: ${settings.lineHeight};
          font-size: ${settings.fontSize === 'small' ? '12px' : settings.fontSize === 'large' ? '16px' : '14px'};
        }

        .print-content p {
          margin-bottom: ${settings.paragraphSpacing}px;
        }
      }
    </style>
  `;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert("Popup blocked. Please allow popups for this site.");
    return;
  }

  printWindow.document.write(`
    <html>
      <head>
        <title>Print Preview</title>
        ${printStyles}
      </head>
      <body>
        <div class="print-content">
          ${printContentHtml}
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
};

  return (
    <PrintContext.Provider value={{
      settings,
      updateSettings,
      showSettingsDialog,
      setShowSettingsDialog,
      handlePrint,
      getContentStyles
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

// Spacing Control Component
const SpacingControl: React.FC<{
  label: string;
  description: string;
  values: { top: number; right: number; bottom: number; left: number };
  onChange: (values: { top: number; right: number; bottom: number; left: number }) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}> = ({ label, description, values, onChange, min = 0, max = 100, step = 1, unit = 'px' }) => {
  const [isLinked, setIsLinked] = useState(false);
  const { t } = useLanguage();

  const handleValueChange = (side: keyof typeof values, value: number) => {
    if (isLinked) {
      // Update all sides when linked
      onChange({
        top: value,
        right: value,
        bottom: value,
        left: value
      });
    } else {
      // Update only the specific side
      onChange({
        ...values,
        [side]: value
      });
    }
  };

  const presetValues = [
    { name: t('print.none'), value: 0 },
    { name: t('print.small'), value: 8 },
    { name: t('print.medium'), value: 16 },
    { name: t('print.large'), value: 24 },
    { name: t('print.extraLarge'), value: 32 }
  ];

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-gray-800">{label}</h4>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <button
          onClick={() => setIsLinked(!isLinked)}
          className={`p-2 rounded ${isLinked ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'}`}
          title={isLinked ? t('print.unlink') : t('print.link')}
        >
          <Move className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Presets */}
      <div className="flex flex-wrap gap-2">
        {presetValues.map((preset) => (
          <button
            key={preset.name}
            onClick={() => onChange({
              top: preset.value,
              right: preset.value,
              bottom: preset.value,
              left: preset.value
            })}
            className="px-3 py-1 text-xs bg-white border rounded hover:bg-gray-50"
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Individual Controls */}
      <div className="grid grid-cols-2 gap-4">
        {/* Top */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">{t('print.top')}</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={values.top}
              onChange={(e) => handleValueChange('top', Number(e.target.value))}
              className="flex-1"
            />
            <input
              type="number"
              min={min}
              max={max}
              step={step}
              value={values.top}
              onChange={(e) => handleValueChange('top', Number(e.target.value))}
              className="w-16 px-2 py-1 text-sm border rounded"
            />
            <span className="text-xs text-gray-500">{unit}</span>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">{t('print.right')}</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={values.right}
              onChange={(e) => handleValueChange('right', Number(e.target.value))}
              className="flex-1"
            />
            <input
              type="number"
              min={min}
              max={max}
              step={step}
              value={values.right}
              onChange={(e) => handleValueChange('right', Number(e.target.value))}
              className="w-16 px-2 py-1 text-sm border rounded"
            />
            <span className="text-xs text-gray-500">{unit}</span>
          </div>
        </div>

        {/* Bottom */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">{t('print.bottom')}</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={values.bottom}
              onChange={(e) => handleValueChange('bottom', Number(e.target.value))}
              className="flex-1"
            />
            <input
              type="number"
              min={min}
              max={max}
              step={step}
              value={values.bottom}
              onChange={(e) => handleValueChange('bottom', Number(e.target.value))}
              className="w-16 px-2 py-1 text-sm border rounded"
            />
            <span className="text-xs text-gray-500">{unit}</span>
          </div>
        </div>

        {/* Left */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">{t('print.left')}</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={values.left}
              onChange={(e) => handleValueChange('left', Number(e.target.value))}
              className="flex-1"
            />
            <input
              type="number"
              min={min}
              max={max}
              step={step}
              value={values.left}
              onChange={(e) => handleValueChange('left', Number(e.target.value))}
              className="w-16 px-2 py-1 text-sm border rounded"
            />
            <span className="text-xs text-gray-500">{unit}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Print Settings Dialog Component
const GlobalPrintSettingsDialog = () => {
  const { settings, updateSettings, showSettingsDialog, setShowSettingsDialog } = usePrintSettings();
  const [tempSettings, setTempSettings] = useState<PrintSettings>(settings);
  const [activeTab, setActiveTab] = useState<'layout' | 'format' | 'spacing'>('layout');
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
    { value: 'wide', label: t('print.wide'), description: t('print.spaces') },
    { value: 'custom', label: t('print.custom'), description: t('print.customSpacing') }
  ];

  const fontSizes = [
    { value: 'small', label: t('print.small') },
    { value: 'medium', label: t('print.medium') },
    { value: 'large', label: t('print.large') }
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

  return (
    <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
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
                {t('print.font')}: {fontSizes.find(f => f.value === tempSettings.fontSize)?.label} |
                Padding: {tempSettings.contentPadding.top}px
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
          <TabButton tab="spacing" label={t('print.spacing')} icon={Ruler} />
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
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

              {/* Line Height */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">{t('print.lineHeight')}</h3>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.1"
                    value={tempSettings.lineHeight}
                    onChange={(e) => handleSettingChange('lineHeight', Number(e.target.value))}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    min="1"
                    max="3"
                    step="0.1"
                    value={tempSettings.lineHeight}
                    onChange={(e) => handleSettingChange('lineHeight', Number(e.target.value))}
                    className="w-20 px-2 py-1 border rounded"
                  />
                </div>
              </div>

              {/* Paragraph Spacing */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">{t('print.paragraphSpacing')}</h3>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={tempSettings.paragraphSpacing}
                    onChange={(e) => handleSettingChange('paragraphSpacing', Number(e.target.value))}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    min="0"
                    max="40"
                    value={tempSettings.paragraphSpacing}
                    onChange={(e) => handleSettingChange('paragraphSpacing', Number(e.target.value))}
                    className="w-20 px-2 py-1 border rounded"
                  />
                  <span className="text-sm text-gray-500">px</span>
                </div>
              </div>
            </>
          )}

          {activeTab === 'spacing' && (
            <>
              {/* Content Padding */}
              <SpacingControl
                label={t('print.contentPadding')}
                description={''}
                values={tempSettings.contentPadding}
                onChange={(values) => handleSettingChange('contentPadding', values)}
                max={50}
                unit="px"
              />

              {/* Content Margin */}
              <SpacingControl
                label={t('print.contentMargin')}
                description={''}
                values={tempSettings.contentMargin}
                onChange={(values) => handleSettingChange('contentMargin', values)}
                max={100}
                unit="px"
              />

              {/* Page Margins */}
              <SpacingControl
                label={t('print.pageMargins')}
                description={''}
                values={tempSettings.pageMargins}
                onChange={(values) => handleSettingChange('pageMargins', values)}
                max={50}
                unit="mm"
              />
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

// Print Settings Button Component (unchanged)
export const PrintSettingsButton: React.FC<{ 
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}> = ({ variant = 'outline', size = 'md', showLabel = true }) => {
  const { setShowSettingsDialog } = usePrintSettings();
  const { t, language } = useLanguage();

  return (
    <Button
      onClick={() => setShowSettingsDialog(true)}
      className={cn(
        "bg-[#2463EB] hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2",
        'flex-row-reverse'
      )}
    >
      {t('prescription.settings')}
      <Settings className={`${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'}`} />
    </Button>
  );
};

// Hook to apply print styles to content
export const usePrintableContent = () => {
  const { getContentStyles } = usePrintSettings();
  
  return {
    printableStyles: getContentStyles(),
    PrintableWrapper: ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
      <div 
        className={`print-content ${className}`}
        style={getContentStyles()}
      >
        {children}
      </div>
    )
  };
};