import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { SaveButton, PrintButton, CancelButton } from '@/components/ui/enhanced-button';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText,
  Save,
  Edit,
  Printer
} from 'lucide-react';

interface VisitFormActionsProps {
  isSubmitting: boolean;
  isPrescriptionSaved: boolean;
  hasPrescriptionContent: boolean;
  isEditing?: boolean;
  onPrintPrescription?: () => void;
  onCancel?: () => void;
}

export const VisitFormActions = ({ 
  isSubmitting, 
  isPrescriptionSaved, 
  hasPrescriptionContent,
  isEditing = false,
  onPrintPrescription,
  onCancel
}: VisitFormActionsProps) => {
  const { t, language } = useLanguage();

  // Determine if form can be submitted
  const canSubmit = !isEditing || !hasPrescriptionContent || isPrescriptionSaved;
  const hasUnsavedPrescription = !isEditing && hasPrescriptionContent && !isPrescriptionSaved;

  return (
    <div className="w-full space-y-4">
      {/* Status Messages */}
      {hasUnsavedPrescription && (
        <div className={cn("p-4 bg-amber-50 rounded-lg border border-amber-200", language === 'ar' && 'text-right')}>
          <div className={cn("flex items-start gap-3", language === 'ar' && 'flex-row-reverse')}>
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className={cn("font-medium text-amber-800", language === 'ar' && 'text-right')}>
                Prescription Not Saved
              </p>
              <p className={cn("text-sm text-amber-700 mt-1", language === 'ar' && 'text-right')}>
                You have prescription content that hasn't been saved. Please save the prescription before saving the visit.
              </p>
            </div>
          </div>
        </div>
      )}

      {isPrescriptionSaved && (
        <div className={cn("p-4 bg-green-50 rounded-lg border border-green-200", language === 'ar' && 'text-right')}>
          <div className={cn("flex items-center justify-between", language === 'ar' && 'flex-row-reverse')}>
            <div className={cn("flex items-center gap-2", language === 'ar' && 'flex-row-reverse')}>
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className={cn("text-sm font-medium text-green-800", language === 'ar' && 'text-right')}>
                {t('prescription.successSave')} 
              </span>
            </div>
            {onPrintPrescription && (
              <PrintButton 
                type="button"
                onClick={onPrintPrescription}
                size="sm"
              >
                {t('common.quickPrint')}
              </PrintButton>
            )}
          </div>
        </div>
      )}

      {/* Action Summary */}
      <div className={cn("flex items-center justify-between p-4 bg-gray-50 rounded-lg border")}>
        <div className={cn("flex items-center gap-4", language === 'ar' && 'flex-row-reverse')}>
          <div className={cn("flex items-center gap-2", language === 'ar' && 'flex-row-reverse')}>
            <FileText className="w-4 h-4 text-gray-600" />
         
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
              {isEditing ? t('common.edit') : t('common.new')}
            </Badge>
          </div>

          {hasPrescriptionContent && (
            <div className={cn("flex items-center gap-2", language === 'ar' && 'flex-row-reverse')}>
            
              <Badge variant="secondary" className={
                isPrescriptionSaved 
                  ? "bg-green-100 text-green-800 border-green-200" 
                  : "bg-yellow-100 text-yellow-800 border-yellow-200"
              }>
                {isPrescriptionSaved ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {t('common.saved')}
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3 mr-1" />
                    Pending
                  </>
                )}
              </Badge>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className={cn("flex items-center gap-3", language === 'ar' && 'flex-row-reverse')}>
          {onCancel && (
            <CancelButton 
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              {t('common.saved')}
            </CancelButton>
          )}

          {/* Print Button - Show when prescription is saved */}
          {isPrescriptionSaved && onPrintPrescription && (
            <PrintButton 
              type="button"
              onClick={onPrintPrescription}
              disabled={isSubmitting}
            >
              {t('visit.printPrescription') || 'Print Prescription'}
            </PrintButton>
          )}

          {/* Main Action Button */}
          {isEditing ? (
            <SaveButton 
              type="submit" 
              disabled={!canSubmit || isSubmitting} 
              loading={isSubmitting}
              size="lg"
              className="min-w-[140px]"
            >
              {isSubmitting ? t('common.updating') : (t('visit.updateVisit') || 'Update Visit')}
            </SaveButton>
          ) : (
            <SaveButton 
              type="submit" 
              disabled={!canSubmit || isSubmitting} 
              loading={isSubmitting}
              size="lg"
              className="min-w-[140px]"
            >
              {isSubmitting ? t('common.saving') : t('visit.saveVisit')}
            </SaveButton>
          )}
        </div>
      </div>

      {/* Help Text */}
      <div className={cn("text-center text-xs text-gray-500", language === 'ar' && 'text-right')}>
        {isEditing ? (
          t('visit.clickupdate')
        ) : t('visit.clickSave')}
      </div>
    </div>
  );
};