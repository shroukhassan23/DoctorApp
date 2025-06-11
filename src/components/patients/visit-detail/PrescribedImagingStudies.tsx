
import React from 'react';
import { Scan } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface PrescribedImagingStudiesProps {
  imagingStudies: any[];
}

export const PrescribedImagingStudies = ({ imagingStudies }: PrescribedImagingStudiesProps) => {
  const { t, language } = useLanguage();
  
  if (!imagingStudies?.length) return null;

  return (
    <Card className={cn(language === 'ar' && "rtl")}>
      <CardHeader>
        <CardTitle className={cn("text-lg text-purple-700 flex items-center gap-2", language === 'ar' && 'flex-row-reverse')}>
          <Scan className="w-5 h-5" />
          {t('prescription.imagingStudies')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {imagingStudies.map((study: any, index: number) => (
            <div key={study.id} className="border-l-4 border-purple-500 pl-4 py-3 bg-purple-50">
              <p className={cn("font-medium", language === 'ar' && 'text-right')}>{index + 1}. {study.imaging_studies.name}</p>
              {study.notes && (
                <p className={cn("text-sm text-gray-600 mt-1", language === 'ar' && 'text-right')}><span className="font-medium">{t('prescription.notes')}:</span> {study.notes}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
