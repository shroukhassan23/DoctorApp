
import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

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

  console.log('VisitFormActions render:', {
    isPrescriptionSaved,
    hasPrescriptionContent,
    isEditing,
    shouldShowPrintButton: isPrescriptionSaved && onPrintPrescription
  });

  return (
    <div className={cn("flex justify-end items-center space-x-2", language === 'ar' && 'flex-row-reverse space-x-reverse')}>
      {!isEditing && hasPrescriptionContent && !isPrescriptionSaved && (
        <p className={cn("text-amber-600 text-sm mr-4 self-center", language === 'ar' && 'ml-4 mr-0')}>
          {t('visit.savePrescriptionFirst') || 'Please save the prescription before saving the visit.'}
        </p>
      )}
      
      {/* Print Prescription Button - Show when prescription is saved */}
      {isPrescriptionSaved && onPrintPrescription && (
        <Button 
          type="button"
          variant="outline" 
          onClick={onPrintPrescription}
          className={cn("flex items-center gap-2", language === 'ar' && 'flex-row-reverse')}
        >
          <Printer className="w-4 h-4" />
          {t('visit.printPrescription') || 'Print Prescription'}
        </Button>
      )}
      
      <Button 
        type="submit" 
        disabled={isSubmitting || (!isEditing && hasPrescriptionContent && !isPrescriptionSaved)}
      >
        {isSubmitting ? (t('common.saving') || 'Saving...') : isEditing ? (t('visit.updateVisit') || 'Update Visit') : (t('visit.saveVisit') || 'Save Visit')}
      </Button>
    </div>
  );
};
