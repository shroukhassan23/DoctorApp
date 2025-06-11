
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface PrescriptionNotesProps {
  notes: string;
}

export const PrescriptionNotes = ({ notes }: PrescriptionNotesProps) => {
  const { t, language } = useLanguage();
  
  if (!notes) return null;

  return (
    <Card className={cn(language === 'ar' && "rtl")}>
      <CardHeader>
        <CardTitle className={cn("text-lg text-gray-700", language === 'ar' && 'text-right')}>{t('prescription.notes')}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={cn("text-gray-700 whitespace-pre-wrap", language === 'ar' && 'text-right')}>{notes}</p>
      </CardContent>
    </Card>
  );
};
