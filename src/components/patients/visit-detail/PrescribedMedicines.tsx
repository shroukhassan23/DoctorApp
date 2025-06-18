
import React from 'react';
import { Pill } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface PrescribedMedicinesProps {
  prescriptionItems: any[];
}

export const PrescribedMedicines = ({ prescriptionItems }: PrescribedMedicinesProps) => {
  const { t, language } = useLanguage();
  
  if (!prescriptionItems?.length) {
    return null;
  }


  return (
    <Card className={cn(language === 'ar' && "rtl")}>
      <CardHeader>
        <CardTitle className={cn("text-lg text-blue-700 flex items-center gap-2")}>
          <Pill className="w-5 h-5" />
          {t('prescription.medicines')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {prescriptionItems.map((item: any, index: number) => (
            <div key={item.id} className="border-l-4 border-blue-500 pl-4 py-3 bg-blue-50">
              <p className={cn("font-medium", language === 'ar' && 'text-right')}>{index + 1}. {item.medicines?.name || 'Medicine name not available'}</p>
              <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 text-sm", language === 'ar' && 'text-right')}>
                <p><span className="font-medium">{t('medicines.dosage')}:</span> {item.dosage || 'Not specified'}</p>
                <p><span className="font-medium">{t('common.duration')}:</span> {item.duration || 'Not specified'}</p>
                <p><span className="font-medium">{t('common.frequency')}:</span> {item.frequency || 'Not specified'}</p>
              </div>
              {item.instructions && item.instructions.trim() !== '' && (
                <p className={cn("text-sm mt-2", language === 'ar' && 'text-right')}><span className="font-medium">{t('common.instructions')}:</span> {item.instructions}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
