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
import { SectionLoading, ButtonLoading } from '@/components/ui/loading-spinner';

import {
  addVisitUrl,
  getVisitPrescriptionUrl,
  visitTypesPatientUrl,
  visitStatusPatientUrl,
  updateVisitUrl
} from '@/components/constants.js';
import { PatientForm } from './PatientForm';

interface VisitFormProps {
  patientId: string;
  visit?: any;
  onSave: () => void;
}

export const VisitForm = ({ patientId, visit, onSave }: VisitFormProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [currentPrescriptionData, setCurrentPrescriptionData] = useState<any>(null);
  const [visitTypes, setVisitTypes] = useState<any[]>([]);
  const [visitStatuses, setVisitStatuses] = useState<any[]>([]);
  const [isLoadingVisitData, setIsLoadingVisitData] = useState(true);
  const { t, language } = useLanguage();

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
    defaultValues: {
      visit_date: new Date().toISOString().split('T')[0],
      visit_type: '',
      chief_complaint: '',
      diagnosis: '',
      notes: '',
      status: ''
    }
  });

  // Fetch visit types and statuses
  useEffect(() => {
    const fetchVisitData = async () => {
      setIsLoadingVisitData(true);
      try {
        const [typesResponse, statusesResponse] = await Promise.all([
          fetch(visitTypesPatientUrl),
          fetch(visitStatusPatientUrl)
        ]);

        if (typesResponse.ok) {
          const types = await typesResponse.json();
          setVisitTypes(types);
        }

        if (statusesResponse.ok) {
          const statuses = await statusesResponse.json();
          setVisitStatuses(statuses);
        }
      } catch (error) {
        console.error('Error fetching visit data:', error);
      } finally {
        setIsLoadingVisitData(false);
      }
    };

    fetchVisitData();
  }, []);
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // +1 because months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  // Populate form when editing
  useEffect(() => {
    
    if (visit && visitTypes.length > 0 && visitStatuses.length > 0) {

      // Format date properly for input[type="date"]
      let formattedDate = visit.visit_date;
      if (formattedDate) {
        const date = new Date(formattedDate);
        const localDate = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
        formattedDate = localDate.toISOString().split('T')[0];
      }

      const formData = {
        visit_date: visit.visit_date
          ? formatDate(visit.visit_date)
          : formatDate(new Date().toISOString()),
        visit_type: String(visit.type_id || visit.visit_type || ''),
        chief_complaint: visit.chief_complaint || '',
        diagnosis: visit.diagnosis || '',
        notes: visit.notes || '',
        status: String(visit.status_id || visit.status || '')
      };
      reset(formData);

      // Load existing prescription if editing
      loadExistingPrescriptionData();
    }
  }, [visit, reset, visitTypes, visitStatuses]);

  const loadExistingPrescriptionData = async () => {
    if (!visit?.id) return;

    try {
      const response = await fetch(getVisitPrescriptionUrl(visit.id));
      if (response.ok) {
        const prescription = await response.json();
        setExistingPrescriptionData(prescription);
        setCurrentPrescriptionData(prescription);
      } else if (response.status !== 404) {
        // Only log error if it's not a 404 (no prescription found)
        console.error('Error loading prescription:', response.statusText);
      }
    } catch (error) {
      console.error('Error loading prescription:', error);
    }
  };

  const handlePrescriptionSaved = async (prescriptionData: any) => {

    try {
      if (isEditing && existingPrescription) {
        await updateExistingPrescription(prescriptionData, existingPrescription);
        toast({ title: 'Prescription updated successfully' });

        // Reload the prescription data to get the latest state
        const response = await fetch(getVisitPrescriptionUrl(visit.id));
        if (response.ok) {
          const updatedPrescription = await response.json();
          setExistingPrescriptionData(updatedPrescription);
          setCurrentPrescriptionData(updatedPrescription);
        }

        // Mark as saved
        markPrescriptionAsSaved();

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
        const updateData = {
          visit_date: data.visit_date,
          type_id: parseInt(data.visit_type),
          chief_complaint: data.chief_complaint,
          diagnosis: data.diagnosis,
          notes: data.notes,
          status_id: parseInt(data.status)
        };

        const response = await fetch(updateVisitUrl(visit.id), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update visit');
        }

        toast({ title: 'Visit updated successfully' });
      } else {
        // Create new visit

        const visitData = {
          patient_id: patientId,
          visit_date: data.visit_date,
          type_id: parseInt(data.visit_type),
          chief_complaint: data.chief_complaint,
          diagnosis: data.diagnosis,
          notes: data.notes,
          status_id: parseInt(data.status)
        };

        const response = await fetch(addVisitUrl, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(visitData)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create visit');
        }

        const result = await response.json();
        visitId = result?.visitId;

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
        description: error.message || 'Please try again.',
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


  return (
    <div className={cn(language === 'ar' && 'rtl')}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Visit Details Section */}
        {isLoadingVisitData ? (
          <SectionLoading text={t('general.loading') || 'Loading visit form...'} variant="dots" color="blue" />
        ) : (
          <VisitInformationForm
            register={register}
            errors={errors}
            setValue={setValue}
            watch={watch}
            visitTypes={visitTypes}
            visitStatuses={visitStatuses}
          />
        )}

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
              <h3 className="text-lg font-medium mb-4">{t('visit.uploadFile') || 'Upload Files (Optional)'}</h3>
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