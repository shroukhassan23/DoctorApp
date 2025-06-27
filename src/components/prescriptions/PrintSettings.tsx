import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Settings, Printer, Download, FileText } from 'lucide-react';

interface PrintSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPrint: (settings: PrintSettings) => void;
}

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

export const PrintSettingsDialog = ({ open, onOpenChange, onPrint }: PrintSettingsProps) => {
  const [settings, setSettings] = useState<PrintSettings>(defaultSettings);
  const [activeTab, setActiveTab] = useState<'layout' | 'format' | 'advanced'>('layout');

  const paperSizes = [
    { value: 'A4', label: 'A4 (21 × 29.7 cm)', description: 'Standard prescription size' },
    { value: 'A5', label: 'A5 (14.8 × 21 cm)', description: 'Compact prescription' },
    { value: 'Letter', label: 'Letter (21.6 × 27.9 cm)', description: 'US standard' },
    { value: 'Legal', label: 'Legal (21.6 × 35.6 cm)', description: 'Extended format' }
  ];

  const marginOptions = [
    { value: 'narrow', label: 'Narrow (1 cm)', description: 'More content space' },
    { value: 'normal', label: 'Normal (2 cm)', description: 'Balanced layout' },
    { value: 'wide', label: 'Wide (3 cm)', description: 'Professional spacing' }
  ];

  const fontSizes = [
    { value: 'small', label: 'Small (12px)', description: 'Compact text' },
    { value: 'medium', label: 'Medium (14px)', description: 'Standard size' },
    { value: 'large', label: 'Large (16px)', description: 'Easy to read' }
  ];

  const handleSettingChange = <K extends keyof PrintSettings>(
    key: K,
    value: PrintSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handlePrint = () => {
    onPrint(settings);
    onOpenChange(false);
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Settings className="w-6 h-6 text-blue-600" />
            إعدادات الطباعة
          </DialogTitle>
          <DialogDescription>
            قم بتخصيص إعدادات الطباعة لتناسب احتياجاتك
          </DialogDescription>
        </DialogHeader>

        {/* Preview Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-800">معاينة الإعدادات</h3>
              <p className="text-sm text-blue-600 mt-1">
                الحجم: {paperSizes.find(p => p.value === settings.paperSize)?.label} | 
                الاتجاه: {settings.orientation === 'portrait' ? 'عمودي' : 'أفقي'} | 
                الخط: {fontSizes.find(f => f.value === settings.fontSize)?.label}
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={resetToDefaults}
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                إعادة تعيين
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <TabButton tab="layout" label="التخطيط" icon={FileText} />
          <TabButton tab="format" label="التنسيق" icon={Settings} />
          <TabButton tab="advanced" label="متقدم" icon={Download} />
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'layout' && (
            <>
              {/* Paper Size */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">حجم الورق</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {paperSizes.map((size) => (
                    <OptionCard
                      key={size.value}
                      title={size.label}
                      description={size.description}
                      selected={settings.paperSize === size.value}
                      onClick={() => handleSettingChange('paperSize', size.value as any)}
                    />
                  ))}
                </div>
              </div>

              {/* Orientation */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">اتجاه الصفحة</h3>
                <div className="grid grid-cols-2 gap-3">
                  <OptionCard
                    title="عمودي (Portrait)"
                    description="الارتفاع أكبر من العرض"
                    selected={settings.orientation === 'portrait'}
                    onClick={() => handleSettingChange('orientation', 'portrait')}
                  />
                </div>
              </div>

              {/* Margins */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">الهوامش</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {marginOptions.map((margin) => (
                    <OptionCard
                      key={margin.value}
                      title={margin.label}
                      description={margin.description}
                      selected={settings.margins === margin.value}
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
                <h3 className="text-lg font-semibold mb-3 text-gray-800">حجم الخط</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {fontSizes.map((font) => (
                    <OptionCard
                      key={font.value}
                      title={font.label}
                      description={font.description}
                      selected={settings.fontSize === font.value}
                      onClick={() => handleSettingChange('fontSize', font.value as any)}
                    />
                  ))}
                </div>
              </div>

              {/* Color Mode */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">نمط الألوان</h3>
                <div className="grid grid-cols-2 gap-3">
                  <OptionCard
                    title="ملون"
                    description="طباعة بالألوان الكاملة"
                    selected={settings.colorMode === 'color'}
                    onClick={() => handleSettingChange('colorMode', 'color')}
                  />
                  <OptionCard
                    title="رمادي"
                    description="طباعة بالأبيض والأسود"
                    selected={settings.colorMode === 'grayscale'}
                    onClick={() => handleSettingChange('colorMode', 'grayscale')}
                  />
                </div>
              </div>

              {/* Include Options */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">عناصر الصفحة</h3>
                <div className="space-y-3">
                 
                  <CheckboxOption
                    label="تضمين التذييل"
                    description="عرض التاريخ والتوقيع في أسفل الصفحة"
                    checked={settings.includeFooter}
                    onChange={(checked) => handleSettingChange('includeFooter', checked)}
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === 'advanced' && (
            <>
              {/* Print Quality */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">جودة الطباعة</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <OptionCard
                    title="مسودة"
                    description="جودة منخفضة، طباعة سريعة"
                    selected={settings.quality === 'draft'}
                    onClick={() => handleSettingChange('quality', 'draft')}
                  />
                  <OptionCard
                    title="عادية"
                    description="جودة متوسطة، متوازنة"
                    selected={settings.quality === 'normal'}
                    onClick={() => handleSettingChange('quality', 'normal')}
                  />
                  <OptionCard
                    title="عالية"
                    description="جودة عالية، طباعة بطيئة"
                    selected={settings.quality === 'high'}
                    onClick={() => handleSettingChange('quality', 'high')}
                  />
                </div>
              </div>

              {/* Additional Settings */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-yellow-800 text-sm font-bold flex-shrink-0">
                    !
                  </div>
                  <div>
                    <h4 className="font-semibold text-yellow-800 mb-2">نصائح للطباعة</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• تأكد من أن الطابعة تدعم حجم الورق المحدد</li>
                      <li>• للوصفات الطبية، يُنصح باستخدام ورق A4 بجودة عالية</li>
                      <li>• تحقق من مستوى الحبر قبل الطباعة</li>
                      <li>• يمكنك حفظ هذه الإعدادات كإعدادات افتراضية</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <div className="flex gap-3">
            <Button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              <Printer className="w-4 h-4 mr-2" />
              طباعة الآن
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};