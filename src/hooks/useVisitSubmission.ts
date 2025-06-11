
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useVisitSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const savePrescriptionToDatabase = async (prescriptionData: any, patientId: string, visitId: string) => {
    const { data: newPrescription, error: prescriptionError } = await supabase
      .from('prescriptions')
      .insert([{
        patient_id: patientId,
        prescription_date: prescriptionData.prescription_date || new Date().toISOString().split('T')[0],
        notes: prescriptionData.notes || '',
        visit_id: visitId
      }])
      .select()
      .single();

    if (prescriptionError) throw prescriptionError;

    // Add prescription items (medicines, lab tests, imaging studies)
    if (prescriptionData.medicines?.length > 0) {
      const medicineItems = prescriptionData.medicines
        .filter((med: any) => med.medicine_id)
        .map((med: any) => ({
          prescription_id: newPrescription.id,
          medicine_id: med.medicine_id,
          dosage: med.dosage || '',
          frequency: '',
          duration: med.duration || '',
          instructions: med.instructions || ''
        }));

      if (medicineItems.length > 0) {
        const { error: medicineError } = await supabase
          .from('prescription_items')
          .insert(medicineItems);
        if (medicineError) throw medicineError;
      }
    }

    // Add lab tests if any
    if (prescriptionData.selectedLabTests?.length > 0) {
      const labTestItems = prescriptionData.selectedLabTests.map((test: any) => ({
        prescription_id: newPrescription.id,
        lab_test_id: test.testId
      }));

      const { error: labTestError } = await supabase
        .from('prescription_lab_tests')
        .insert(labTestItems);
      if (labTestError) throw labTestError;
    }

    // Add imaging studies if any
    if (prescriptionData.selectedImagingStudies?.length > 0) {
      const imagingStudyItems = prescriptionData.selectedImagingStudies.map((study: any) => ({
        prescription_id: newPrescription.id,
        imaging_study_id: study.studyId,
        notes: study.notes || null
      }));

      const { error: imagingStudyError } = await supabase
        .from('prescription_imaging_studies')
        .insert(imagingStudyItems);
      if (imagingStudyError) throw imagingStudyError;
    }
  };

  const uploadFiles = async (uploadedFiles: any[], patientId: string, visitId: string) => {
    for (const fileData of uploadedFiles) {
      if (fileData.file) {
        // Check if storage bucket exists, if not create it
        const { data: buckets } = await supabase.storage.listBuckets();
        const bucketExists = buckets?.some(bucket => bucket.name === 'patient-files');
        
        if (!bucketExists) {
          console.log('Creating patient-files bucket...');
          const { error: bucketError } = await supabase.storage.createBucket('patient-files', {
            public: true,
            allowedMimeTypes: ['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
            fileSizeLimit: 10485760 // 10MB
          });
          
          if (bucketError) {
            console.error('Error creating bucket:', bucketError);
            throw bucketError;
          }
        }

        const fileExt = fileData.file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${patientId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('patient-files')
          .upload(filePath, fileData.file);

        if (uploadError) throw uploadError;

        const { error: dbError } = await supabase
          .from('patient_files')
          .insert([{
            patient_id: patientId,
            visit_id: visitId,
            file_name: fileData.file.name,
            file_type: fileData.file.type,
            file_size: fileData.file.size,
            file_path: filePath,
            description: fileData.description || ''
          }]);

        if (dbError) throw dbError;
      }
    }
  };

  return {
    isSubmitting,
    setIsSubmitting,
    savePrescriptionToDatabase,
    uploadFiles,
    toast
  };
};
