
import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface VisitStatusSelectorProps {
  visitId: string;
  currentStatus: string;
  patientName: string;
  onStatusChangeRequest: (visitId: string, newStatus: string, patientName: string) => void;
}

export const VisitStatusSelector = ({ 
  visitId, 
  currentStatus, 
  patientName, 
  onStatusChangeRequest 
}: VisitStatusSelectorProps) => {
  const { t, language } = useLanguage();

  return (
    <div className={cn("flex flex-col items-center space-y-2", language === 'ar' && 'items-end')}>
      <label className="text-xs text-gray-600">{t('visit.changeStatus')}</label>
      <RadioGroup
        value={currentStatus}
        onValueChange={(value) => onStatusChangeRequest(visitId, value, patientName)}
        className="flex flex-col space-y-1"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="waiting" id={`waiting-${visitId}`} />
          <label htmlFor={`waiting-${visitId}`} className="text-xs cursor-pointer">
            {t('visit.waiting')}
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="completed" id={`completed-${visitId}`} />
          <label htmlFor={`completed-${visitId}`} className="text-xs cursor-pointer">
            {t('visit.completed')}
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="cancelled" id={`cancelled-${visitId}`} />
          <label htmlFor={`cancelled-${visitId}`} className="text-xs cursor-pointer">
            {t('visit.cancelled')}
          </label>
        </div>
      </RadioGroup>
    </div>
  );
};
