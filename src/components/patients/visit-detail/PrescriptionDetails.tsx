
import React, { useState } from 'react';
import { FileText, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PrescribedMedicines } from './PrescribedMedicines';
import { PrescribedLabTests } from './PrescribedLabTests';
import { PrescribedImagingStudies } from './PrescribedImagingStudies';
import { PrescriptionNotes } from './PrescriptionNotes';
import { PrescriptionPrint } from '../../prescriptions/PrescriptionPrint';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface PrescriptionDetailsProps {
  prescription: any;
}

export const PrescriptionDetails = ({ prescription }: PrescriptionDetailsProps) => {
  const [showPrint, setShowPrint] = useState(false);
  const { t, language } = useLanguage();

  if (!prescription) {
    console.log('PrescriptionDetails - no prescription data');
    return null;
  }

  console.log('PrescriptionDetails - rendering with prescription:', prescription);

  const hasMedicines = prescription.prescription_items && prescription.prescription_items.length > 0;
  const hasLabTests = prescription.prescription_lab_tests && prescription.prescription_lab_tests.length > 0;
  const hasImagingStudies = prescription.prescription_imaging_studies && prescription.prescription_imaging_studies.length > 0;
  const hasNotes = prescription.notes && prescription.notes.trim() !== '';

  // Don't render if no prescription content
  if (!hasMedicines && !hasLabTests && !hasImagingStudies && !hasNotes) {
    console.log('PrescriptionDetails - no prescription content to show');
    return null;
  }

  return (
    <div className={cn("space-y-4", language === 'ar' && "rtl")}>
      <div className={cn("flex items-center justify-between", language === 'ar' && 'flex-row-reverse')}>
        <h3 className={cn("text-lg font-medium flex items-center gap-2", language === 'ar' && 'flex-row-reverse')}>
          <FileText className="w-5 h-5" />
          {t('visit.prescription')}
        </h3>
        <Button 
          variant="outline" 
          onClick={() => setShowPrint(true)}
          className={cn("flex items-center gap-2", language === 'ar' && 'flex-row-reverse')}
        >
          <Printer className="w-4 h-4" />
          {t('visit.printPrescription')}
        </Button>
      </div>

      {hasMedicines && (
        <PrescribedMedicines prescriptionItems={prescription.prescription_items} />
      )}
      
      {hasLabTests && (
        <PrescribedLabTests labTests={prescription.prescription_lab_tests} />
      )}
      
      {hasImagingStudies && (
        <PrescribedImagingStudies imagingStudies={prescription.prescription_imaging_studies} />
      )}
      
      {hasNotes && (
        <PrescriptionNotes notes={prescription.notes} />
      )}

      {/* Print Dialog */}
      <PrescriptionPrint
        prescription={prescription}
        open={showPrint}
        onOpenChange={setShowPrint}
      />
    </div>
  );
};
