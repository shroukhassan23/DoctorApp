
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Separator } from '@/components/ui/separator';
import { PrescriptionPrint } from '../prescriptions/PrescriptionPrint';
import { FileUpload } from './FileUpload';
import { VisitInformationForm } from './visit-form/VisitInformationForm';
import { VisitFormActions } from './visit-form/VisitFormActions';
import { VisitPrescriptionSection } from './visit-form/VisitPrescriptionSection';
import { usePrescriptionState } from '@/hooks/usePrescriptionState';
import { useVisitSubmission } from '@/hooks/useVisitSubmission';
import { updateExistingPrescription, loadExistingPrescription } from './visit-form/PrescriptionUpdateHandler';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface VisitFormProps {
  patientId: string;
  visit?: any;
  onSave: () => void;
}

export const VisitForm = ({ patientId, visit, onSave }: VisitFormProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [currentPrescriptionData, setCurrentPrescriptionData] = useState<any>(null);
  const { t, language } = useLanguage();


 /* async function fetchStatusData() {
 const response = await fetch(visitStatusPatientUrl);
           if (!response.ok) throw new Error('Failed to fetch status');
         const visitStatus =await response.json();
         console.log(visitStatus);
}
  async function fetchTypesData() {
 const response = await fetch(visitTypesPatientUrl);
           if (!response.ok) throw new Error('Failed to fetch types');
         const visitTypes =await response.json();
         console.log(visitTypes);
}*/

  const {
    prescriptionData,
    isPrescriptionSaved,
    existingPrescription,
    prescriptionKey,
    isEditing,
    updatePrescriptionData,
    setExistingPrescriptionData,
    markPrescriptionAsSaved
  } = usePrescriptionState(visit);

  const {
    isSubmitting,
    setIsSubmitting,
    savePrescriptionToDatabase,
    uploadFiles,
    toast
  } = useVisitSubmission();
  
  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm({
    defaultValues: visit || {
      visit_date: new Date().toISOString().split('T')[0],
      visit_type: 'primary',
      chief_complaint: '',
      diagnosis: '',
      notes: '',
      status: 'waiting'
    }
  });

  // Populate form when editing
  useEffect(() => {
    if (visit) {
      reset({
        visit_date: visit.visit_date,
        visit_type: visit.visit_type,
        chief_complaint: visit.chief_complaint || '',
        diagnosis: visit.diagnosis || '',
        notes: visit.notes || '',
        status: visit.status || 'waiting'
      });

      // Load existing prescription if editing
      loadExistingPrescriptionData();
    }
  }, [visit, reset]);

  const loadExistingPrescriptionData = async () => {
    if (!visit?.id) return;

    const prescription = await loadExistingPrescription(visit.id);
    if (prescription) {
      setExistingPrescriptionData(prescription);
      setCurrentPrescriptionData(prescription);
    }
  };

  const handlePrescriptionSaved = async (prescriptionData: any) => {
    console.log('Prescription saved with data:', prescriptionData);
    
    try {
      if (isEditing && existingPrescription) {
        await updateExistingPrescription(prescriptionData, existingPrescription);
        toast({ title: 'Prescription updated successfully' });
        
        // Reload the prescription data to get the latest state
        const updatedPrescription = await loadExistingPrescription(visit.id);
        if (updatedPrescription) {
          setExistingPrescriptionData(updatedPrescription);
          setCurrentPrescriptionData(updatedPrescription);
        }
        
        // Mark as saved
        markPrescriptionAsSaved();
        
        console.log('Prescription updated, state marked as saved');
      } else {
        // For new prescriptions
        updatePrescriptionData(prescriptionData);
        setCurrentPrescriptionData(prescriptionData);
        toast({ title: 'Prescription saved successfully' });
      }
    } catch (error) {
      console.error('Error saving prescription:', error);
      toast({ 
        title: 'Error saving prescription', 
        description: 'Please try again.',
        variant: 'destructive' 
      });
      return;
    }
  };

  const handleFileUploaded = (fileData: any) => {
    console.log('File uploaded:', fileData);
    setUploadedFiles(prev => [...prev, fileData]);
    toast({ title: 'File prepared for upload' });
  };

  const onSubmit = async (data: any) => {
    // Check if prescription has content but hasn't been saved (only for new visits)
    const hasAnyPrescriptionContent = prescriptionData && (
      prescriptionData.diagnosis ||
      prescriptionData.notes ||
      (prescriptionData.medicines && prescriptionData.medicines.some((m: any) => m.medicine_id)) ||
      (prescriptionData.selectedLabTests && prescriptionData.selectedLabTests.length > 0) ||
      (prescriptionData.selectedImagingStudies && prescriptionData.selectedImagingStudies.length > 0)
    );

    if (!isEditing && hasAnyPrescriptionContent && !isPrescriptionSaved) {
      toast({ 
        title: 'Prescription not saved', 
        description: 'Please save the prescription before saving the visit.',
        variant: 'destructive' 
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let visitId = visit?.id;

      if (isEditing) {
        // Update existing visit
        const { error: visitError } = await supabase
          .from('patient_visits')
          .update(data)
          .eq('id', visit.id);
        
        if (visitError) throw visitError;
        toast({ title: 'Visit updated successfully' });
      } else {
        // Create new visit
        const { data: visitData, error: visitError } = await supabase
          .from('patient_visits')
          .insert([{
            ...data,
            patient_id: patientId
          }])
          .select()
          .single();
        
        if (visitError) throw visitError;
        visitId = visitData.id;

        // Save prescription if exists and is saved
        if (prescriptionData && isPrescriptionSaved) {
          await savePrescriptionToDatabase(prescriptionData, patientId, visitId);
        }

        // Upload files if any
        await uploadFiles(uploadedFiles, patientId, visitId);

        toast({ title: 'Visit recorded successfully' });
      }
      
      onSave();
    } catch (error) {
      console.error('Error saving visit:', error);
      toast({ 
        title: 'Error saving visit', 
        description: 'Please try again.',
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintPrescription = () => {
    setShowPrintDialog(true);
  };

  const getPrintablePrescription = () => {
    // Use the most current prescription data
    const prescriptionToPrint = currentPrescriptionData || existingPrescription || prescriptionData;
    
    if (!prescriptionToPrint) return null;
    
    // If it's already in the correct format, return it
    if (prescriptionToPrint.prescription_items || prescriptionToPrint.prescription_lab_tests || prescriptionToPrint.prescription_imaging_studies) {
      return prescriptionToPrint;
    }
    
    // For new prescriptions, format the data properly for printing
    return {
      ...prescriptionToPrint,
      patient_id: patientId,
      prescription_date: prescriptionToPrint.prescription_date || new Date().toISOString().split('T')[0],
      prescription_items: prescriptionToPrint.medicines?.filter((med: any) => med.medicine_id).map((med: any) => ({
        medicines: { name: med.medicine_name || 'Medicine' },
        dosage: med.dosage || '',
        duration: med.duration || '',
        frequency: med.frequency || '',
        instructions: med.instructions || ''
      })) || [],
      prescription_lab_tests: prescriptionToPrint.selectedLabTests?.map((test: any) => ({
        lab_tests: { name: test.testName || 'Lab Test' }
      })) || [],
      prescription_imaging_studies: prescriptionToPrint.selectedImagingStudies?.map((study: any) => ({
        imaging_studies: { name: study.studyName || 'Imaging Study' },
        notes: study.notes || ''
      })) || []
    };
  };

  // Determine if we should show the print button
  const shouldShowPrintButton = isPrescriptionSaved || !!existingPrescription || !!currentPrescriptionData;
  const hasPrescriptionContent = prescriptionData !== null || existingPrescription !== null || currentPrescriptionData !== null;

  console.log('Print button state:', {
    isPrescriptionSaved,
    existingPrescription: !!existingPrescription,
    currentPrescriptionData: !!currentPrescriptionData,
    shouldShowPrintButton,
    hasPrescriptionContent,
    isEditing
  });

  return (
    <div className={cn(language === 'ar' && 'rtl')}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Visit Details Section */}
        <VisitInformationForm
          register={register}
          errors={errors}
          setValue={setValue}
          watch={watch}
        />

        {/* Prescription Section */}
        <VisitPrescriptionSection
          prescriptionKey={prescriptionKey}
          patientId={patientId}
          visitId={visit?.id}
          existingPrescription={existingPrescription}
          isEditing={isEditing}
          isPrescriptionSaved={shouldShowPrintButton}
          onPrescriptionSaved={handlePrescriptionSaved}
          onPrintPrescription={handlePrintPrescription}
        />

        {!isEditing && (
          <>
            <Separator />

            {/* File Upload Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">{t('visit.uploadFiles') || 'Upload Files (Optional)'}</h3>
              <FileUpload 
                patientId={patientId}
                onUpload={handleFileUploaded}
                isEmbedded={true}
              />
            </div>
          </>
        )}

        <Separator />

        {/* Save Button with Print Option */}
        <VisitFormActions 
          isSubmitting={isSubmitting} 
          isPrescriptionSaved={shouldShowPrintButton}
          hasPrescriptionContent={hasPrescriptionContent}
          isEditing={isEditing}
          onPrintPrescription={handlePrintPrescription}
        />
      </form>

      {/* Print Dialog */}
      {shouldShowPrintButton && (
        <PrescriptionPrint
          prescription={getPrintablePrescription()}
          open={showPrintDialog}
          onOpenChange={setShowPrintDialog}
        />
      )}
    </div>
  );
};
