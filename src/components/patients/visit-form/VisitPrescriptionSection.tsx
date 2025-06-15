import React from 'react';
import { Badge } from '@/components/ui/badge';
import { PrintButton } from '@/components/ui/enhanced-button';
import { Separator } from '@/components/ui/separator';
import { PrescriptionForm } from '../../prescriptions/PrescriptionForm';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { 
  FileText, 
  Pill, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Info
} from 'lucide-react';

interface VisitPrescriptionSectionProps {
  prescriptionKey: number;
  patientId: string;
  visitId?: string;
  existingPrescription: any;
  isEditing: boolean;
  isPrescriptionSaved: boolean;
  onPrescriptionSaved: (data: any) => void;
  onPrintPrescription: () => void;
}

export const VisitPrescriptionSection = ({
  prescriptionKey,
  patientId,
  visitId,
  existingPrescription,
  isEditing,
  isPrescriptionSaved,
  onPrescriptionSaved,
  onPrintPrescription
}: VisitPrescriptionSectionProps) => {
  const { t, language } = useLanguage();

  // Determine prescription status
  const getPrescriptionStatus = () => {
    if (isPrescriptionSaved || existingPrescription) {
      return {
        label: 'Saved',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle
      };
    }
    if (isEditing) {
      return {
        label: 'Draft',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock
      };
    }
    return {
      label: 'Optional',
      color: 'bg-gray-100 text-gray-600 border-gray-200',
      icon: Info
    };
  };

  const status = getPrescriptionStatus();
  const StatusIcon = status.icon;

  return (
    <div className="w-full space-y-6">
      {/* Section Header */}
      <div className={cn("flex items-center justify-between", language === 'ar' && 'flex-row-reverse')}>
        <div className={cn("flex items-center gap-3", language === 'ar' && 'flex-row-reverse')}>
          <div className="p-2 bg-green-100 rounded-lg">
            <Pill className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className={cn("text-lg font-semibold text-gray-900", language === 'ar' && 'text-right')}>
              {isEditing ? 
                (t('visit.editPrescription') || 'Edit Prescription') : 
                (t('visit.addPrescription') || 'Add Prescription')
              }
            </h3>
            <p className={cn("text-sm text-gray-600", language === 'ar' && 'text-right')}>
              {isEditing ? 
                'Update medications, lab tests, and imaging studies' : 
                'Add medications, lab tests, and imaging studies (optional)'
              }
            </p>
          </div>
        </div>
        
        <div className={cn("flex items-center gap-3", language === 'ar' && 'flex-row-reverse')}>
          {/* Status Badge */}
          <Badge variant="secondary" className={status.color}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {status.label}
          </Badge>

          {/* Print Button - Show when prescription is saved */}
          {(isPrescriptionSaved || existingPrescription) && (
            <PrintButton 
              onClick={onPrintPrescription}
              size="sm"
            >
              {t('visit.printPrescription') || 'Print'}
            </PrintButton>
          )}
        </div>
      </div>

      {/* Status Information */}
      {!isPrescriptionSaved && !existingPrescription && !isEditing && (
        <div className={cn("p-4 bg-blue-50 rounded-lg border border-blue-200", language === 'ar' && 'text-right')}>
          <div className={cn("flex items-start gap-2 text-sm text-blue-800", language === 'ar' && 'flex-row-reverse')}>
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium mb-1">Prescription Information:</p>
              <p className="text-xs">
                Adding a prescription is optional. You can save the visit without a prescription and add one later if needed.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Prescription Saved Notice */}
      {(isPrescriptionSaved || existingPrescription) && (
        <div className={cn("p-4 bg-green-50 rounded-lg border border-green-200", language === 'ar' && 'text-right')}>
          <div className={cn("flex items-center justify-between", language === 'ar' && 'flex-row-reverse')}>
            <div className={cn("flex items-center gap-2 text-sm text-green-800", language === 'ar' && 'flex-row-reverse')}>
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">
                Prescription has been saved and is ready to print.
              </span>
            </div>
            <PrintButton 
              onClick={onPrintPrescription}
              size="sm"
            >
              Print Now
            </PrintButton>
          </div>
        </div>
      )}

      {/* Warning for unsaved changes */}
      {isEditing && !isPrescriptionSaved && (
        <div className={cn("p-4 bg-amber-50 rounded-lg border border-amber-200", language === 'ar' && 'text-right')}>
          <div className={cn("flex items-start gap-2 text-sm text-amber-800", language === 'ar' && 'flex-row-reverse')}>
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium mb-1">Unsaved Changes:</p>
              <p className="text-xs">
                Remember to save your prescription changes before saving the visit.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Prescription Form */}
      <div className="space-y-4">
        <PrescriptionForm 
          key={prescriptionKey}
          patientId={patientId}
          visitId={visitId}
          prescription={existingPrescription}
          onSave={onPrescriptionSaved}
          isEmbedded={true}
        />
      </div>
    </div>
  );
};