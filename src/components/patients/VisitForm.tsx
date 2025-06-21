import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
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
  Calendar, 
  User, 
  Stethoscope, 
  FileText, 
  Upload, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Activity
} from 'lucide-react';

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
      console.log('Visit object properties:', Object.keys(visit));
      console.log('Visit ID:', visit.id);
      console.log('Visit visit_id:', visit.visit_id);
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
      console.log('load existing visit',visit)
      const response = await fetch(getVisitPrescriptionUrl(visit.id));
      console.log('Fetching prescription for visit ID:', visit.id);
      if (response.ok) {
        const prescription = await response.json();
        console.log('prescription response:', prescription);
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
        toast({ title: t('prescription.updateSuccess') });

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
        toast({ title: t('prescription.savedSuccess') });
      }
    } catch (error) {
      console.error('Error saving prescription:', error);
      toast({
        title: t('prescription.notSavedSuccess'),
        description: t('message.pleaseTryAgain'),
        variant: 'destructive'
      });
      return;
    }
  };

  const handleFileUploaded = (fileData: any) => {
    setUploadedFiles(prev => [...prev, fileData]);
    toast({ title: t('message.prepared') });
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
        title:  t('prescription.notSavedSuccess'),
        description: t('message.savePrescription'),
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

        toast({ title: t('visit.updatedSuccess') });
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

        toast({ title: t('visit.recordeSuccess') });
      }

      onSave();
    } catch (error) {
      console.error('Error saving visit:', error);
      toast({
        title: t('visit.saveFail'),
        description: error.message || t('message.pleaseTryAgain'),
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
    
    // الحل: استخدم الأسماء الصحيحة
    prescription_lab_tests: prescriptionToPrint.selectedLabTests?.map((test: any) => ({
      lab_tests: { name: test.name || test.testName || 'Lab Test' } // استخدم test.name الأول
    })) || [],
    
    prescription_imaging_studies: prescriptionToPrint.selectedImagingStudies?.map((study: any) => ({
      imaging_studies: { name: study.name || study.studyName || 'Imaging Study' }, // استخدم study.name الأول
      notes: study.notes || ''
    })) || []
  };
};
  // Determine if we should show the print button
  const shouldShowPrintButton = isPrescriptionSaved || !!existingPrescription || !!currentPrescriptionData;
  const hasPrescriptionContent = prescriptionData !== null || existingPrescription !== null || currentPrescriptionData !== null;

  // Get form completion status
  const formValues = watch();
  const requiredFields = ['visit_date', 'visit_type', 'chief_complaint', 'diagnosis', 'status'];
  const completedFields = requiredFields.filter(field => formValues[field]).length;
  const completionPercentage = Math.round((completedFields / requiredFields.length) * 100);

  return (
    <div className={cn("w-full space-y-6", language === 'ar' && 'rtl')}>
      {/* Header Card */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-white to-blue-50/30">
        <CardHeader className="pb-4">
          <div className={cn("flex items-center justify-between")}>
            <div className={cn("flex items-center gap-4")}>
              <div className="p-3 bg-[#2463EB] rounded-xl shadow-lg">
                {isEditing ? <Activity className="w-7 h-7 text-white" /> : <Stethoscope className="w-7 h-7 text-white" />}
              </div>
              <div>
                <CardTitle className={cn("text-2xl font-bold text-gray-900", language === 'ar' && 'text-right')}>
                  {isEditing ? t('visit.editRecord') : t('visit.new')}
                </CardTitle>
                <p className={cn("text-gray-600", language === 'ar' && 'text-right')}>
                  {isEditing ? t('visit.updateInfo') : t('patients.recordDetails')}
                </p>
              </div>
            </div>
            
            {/* Status Badges */}
            <div className={cn("flex items-center gap-2", language === 'ar' && 'flex-row-reverse')}>
              <Badge variant="secondary" className={cn(
                "px-3 py-1",
                completionPercentage === 100 ? "bg-green-100 text-green-800 border-green-200" : "bg-orange-100 text-orange-800 border-orange-200"
              )}>
                <CheckCircle className="w-3 h-3 mr-1" />
                {completionPercentage}% {t('common.completed')}
              </Badge>
              
              {shouldShowPrintButton && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">
                  <FileText className="w-3 h-3 mr-1" />
                 {t('prescription.ready')}
                </Badge>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Visit Details Section */}
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="pb-6">
            <CardTitle className={cn("flex items-center gap-3 text-xl font-bold")}>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-[#2463EB]" />
              </div>
              {t('visit.information')}
              {errors && Object.keys(errors).length > 0 && (
                <Badge variant="destructive" className="ml-auto">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {Object.keys(errors).length} Error{Object.keys(errors).length > 1 ? 's' : ''}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
            <CardContent>
              {isLoadingVisitData ? (
                <SectionLoading text={t('common.loading') || 'Loading visit form...'} variant="dots" color="blue" />
              ) : (
                <div className="w-full">
                  {/* Required Fields Info */}
                  <div className={cn("mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200", language === 'ar' && 'text-right')}>
                    <div className={cn("flex items-start gap-2 text-sm text-blue-800")}>
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium mb-1">{t('common.required')}</p>
                        <p className="text-xs">
                          {t('visit.visitDate')}, {t('visit.visitType')}, {t('visit.chiefComplaint')},{t('visit.diagnosis')},{t('visit.guidelines')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <VisitInformationForm
                    register={register}
                    errors={errors}
                    setValue={setValue}
                    watch={watch}
                    visitTypes={visitTypes}
                    visitStatuses={visitStatuses}
                  />
                </div>
              )}
            </CardContent>
        </Card>

        {/* Prescription Section */}
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="pb-6">
            <CardTitle className={cn("flex items-center gap-3 text-xl font-bold")}>
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              {t('prescription.treatment')}
              {shouldShowPrintButton && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 ml-auto">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {t('common.saved')}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="w-full">
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
            </div>
          </CardContent>
        </Card>

        {!isEditing && (
          <Card className="shadow-lg border-0 bg-white">
            <CardHeader className="pb-6">
              <CardTitle className={cn("flex items-center gap-3 text-xl font-bold", language === 'ar' && 'flex-row-reverse text-right')}>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Upload className="w-5 h-5 text-purple-600" />
                </div>
                {t('common.attach')}
                <Badge variant="secondary" className="ml-auto">
                 {t('common.optional')} 
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <div className="w-full space-y-6">
                <p className={cn("text-gray-600 text-sm", language === 'ar' && 'text-right')}>
                  {t('common.uploadFile')}
                </p>
                <div className="w-full">
                  <FileUpload
                    patientId={patientId}
                    onUpload={handleFileUploaded}
                    isEmbedded={true}
                  />
                </div>
                {uploadedFiles.length > 0 && (
                  <div className={cn("mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200", language === 'ar' && 'text-right')}>
                    <div className={cn("flex items-center gap-2 text-sm text-blue-800", language === 'ar' && 'flex-row-reverse')}>
                      <Upload className="w-4 h-4" />
                      <span className="font-medium">
                        {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} ready for upload
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <Card className="shadow-lg border-0 bg-white">
          <CardContent className="px-8 py-8">
            <div className="w-full">
              <VisitFormActions
                isSubmitting={isSubmitting}
                isPrescriptionSaved={shouldShowPrintButton}
                hasPrescriptionContent={hasPrescriptionContent}
                isEditing={isEditing}
                onPrintPrescription={handlePrintPrescription}
              />
            </div>
          </CardContent>
        </Card>
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