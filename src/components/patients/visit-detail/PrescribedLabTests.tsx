
import React from 'react';
import { TestTube } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface PrescribedLabTestsProps {
  labTests: any[];
}

export const PrescribedLabTests = ({ labTests }: PrescribedLabTestsProps) => {
  const { t, language } = useLanguage();
  
  if (!labTests?.length) return null;

  return (
    <Card className={cn(language === 'ar' && "rtl")}>
      <CardHeader>
        <CardTitle className={cn("text-lg text-green-700 flex items-center gap-2", language === 'ar' && 'flex-row-reverse')}>
          <TestTube className="w-5 h-5" />
          {t('prescription.labTests')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {labTests.map((test: any, index: number) => (
            <div key={test.id} className="border-l-4 border-green-500 pl-4 py-2 bg-green-50">
              <p className={cn("font-medium", language === 'ar' && 'text-right')}>{index + 1}. {test.lab_tests.name}</p>
              {test.notes && (
                <p className={cn("text-sm text-gray-600 mt-1", language === 'ar' && 'text-right')}><span className="font-medium">{t('prescription.notes')}:</span> {test.notes}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
