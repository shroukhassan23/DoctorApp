
import React from 'react';
import { Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateToDDMMYYYY } from '@/lib/dateUtils';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface VisitInformationProps {
  visit: any;
}

export const VisitInformation = ({ visit }: VisitInformationProps) => {
  const { t, language } = useLanguage();
  
  return (
    <Card className={cn(language === 'ar' && "rtl")}>
      <CardHeader>
        <CardTitle className={cn("flex items-center gap-2", language === 'ar' && 'flex-row-reverse')}>
          <Calendar className="w-5 h-5" />
          {t('visit.details')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={cn(language === 'ar' && 'text-right')}>
            <span className="font-medium">{t('visit.date')}:</span>
            <p className="text-gray-600">{formatDateToDDMMYYYY(visit.visit_date)}</p>
          </div>
          <div className={cn(language === 'ar' && 'text-right')}>
            <span className="font-medium">{t('visit.type')}:</span>
            <span className={cn(`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
              visit.visit_type === 'primary' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-orange-100 text-orange-700'
            }`, language === 'ar' && 'mr-2 ml-0')}>
              {visit.visit_type === 'primary' ? t('visit.primaryConsultation') : t('visit.followUp')}
            </span>
          </div>
        </div>
        
        {/* Chief Complaint - Always show if exists */}
        {visit.chief_complaint && visit.chief_complaint.trim() !== '' && (
          <div className={cn(language === 'ar' && 'text-right')}>
            <span className="font-medium">{t('visit.chiefComplaint')}:</span>
            <p className="text-gray-600 mt-1 whitespace-pre-wrap">{visit.chief_complaint}</p>
          </div>
        )}
        
        {/* Diagnosis - Always show if exists */}
        {visit.diagnosis && visit.diagnosis.trim() !== '' && (
          <div className={cn(language === 'ar' && 'text-right')}>
            <span className="font-medium">{t('visit.diagnosis')}:</span>
            <p className="text-gray-600 mt-1 whitespace-pre-wrap">{visit.diagnosis}</p>
          </div>
        )}
        
        {/* Visit Notes - Always show if exists */}
        {visit.notes && visit.notes.trim() !== '' && (
          <div className={cn(language === 'ar' && 'text-right')}>
            <span className="font-medium">{t('prescription.notes')}:</span>
            <p className="text-gray-600 mt-1 whitespace-pre-wrap">{visit.notes}</p>
          </div>
        )}

        {/* Show message if no additional details */}
        {(!visit.chief_complaint || visit.chief_complaint.trim() === '') && 
         (!visit.diagnosis || visit.diagnosis.trim() === '') && 
         (!visit.notes || visit.notes.trim() === '') && (
          <div className={cn("text-gray-500 text-sm italic", language === 'ar' && 'text-right')}>
            {t('visit.noAdditionalDetails')}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
