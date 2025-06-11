
import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { PrescriptionForm } from '../../prescriptions/PrescriptionForm';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

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

  return (
    <>
      <Separator />
      <div>
        <div className={cn("flex items-center justify-between mb-4", language === 'ar' && 'flex-row-reverse')}>
          <h3 className="text-lg font-medium">
            {isEditing ? t('visit.editPrescription') || 'Edit Prescription' : t('visit.addPrescription') || 'Add Prescription (Optional)'}
          </h3>
          
          {/* Print Button - Show when prescription is saved */}
          {(isPrescriptionSaved || existingPrescription) && (
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
        </div>
        
        <PrescriptionForm 
          key={prescriptionKey}
          patientId={patientId}
          visitId={visitId}
          prescription={existingPrescription}
          onSave={onPrescriptionSaved}
          isEmbedded={true}
        />
      </div>
    </>
  );
};
