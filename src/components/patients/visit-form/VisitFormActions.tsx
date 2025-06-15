
import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { EditButton, PrintButton, SaveButton } from '@/components/ui/enhanced-button';

interface VisitFormActionsProps {
  isSubmitting: boolean;
  isPrescriptionSaved: boolean;
  hasPrescriptionContent: boolean;
  isEditing?: boolean;
  onPrintPrescription?: () => void;
}

export const VisitFormActions = ({ 
  isSubmitting, 
  isPrescriptionSaved, 
  hasPrescriptionContent,
  isEditing = false,
  onPrintPrescription
}: VisitFormActionsProps) => {
  const { t, language } = useLanguage();

  return (
    <div className={cn("flex justify-end items-center space-x-2", language === 'ar' && 'flex-row-reverse space-x-reverse')}>
      {!isEditing && hasPrescriptionContent && !isPrescriptionSaved && (
        <p className={cn("text-amber-600 text-sm mr-4 self-center", language === 'ar' && 'ml-4 mr-0')}>
          {t('visit.savePrescriptionFirst') || 'Please save the prescription before saving the visit.'}
        </p>
      )}
      
      {/* Print Prescription Button - Show when prescription is saved */}
      {isPrescriptionSaved && onPrintPrescription && (
        <PrintButton 
        type="button"
        onClick={onPrintPrescription}
        size="md"
      >
        {t('visit.printPrescription') || 'Print Prescription'}
      </PrintButton>
      )}

      {isEditing ? (
  <EditButton 
    type="submit" 
    disabled={isSubmitting} 
    loading={isSubmitting}
    size="lg"
  >
    { (t('visit.updateVisit') || 'Update Visit')}
  </EditButton>
) : (
  <SaveButton 
    type="submit" 
    disabled={isSubmitting} 
    loading={isSubmitting}
    size="lg"
  >
    { (t('common.save') || 'Saving...')}
  </SaveButton>
)}
    </div>
  );
};
