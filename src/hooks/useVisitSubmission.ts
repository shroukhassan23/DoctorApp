import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  addprescriptionUrl,
  addPrescriptionMedicinesUrl,
  addPrescriptionLabTestsUrl,
  addPrescriptionImagingStudiesUrl
} from '@/components/constants.js';

export const useVisitSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const savePrescriptionToDatabase = async (prescriptionData: any, patientId: string, visitId: string) => {
    // Save the main prescription record
    const response = await fetch(addprescriptionUrl, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        patient_id: patientId,
        prescription_date: prescriptionData.prescription_date || new Date().toISOString().split('T')[0],
        notes: prescriptionData.notes || '',
        diagnosis: prescriptionData.diagnosis || '',
        visit_id: visitId
      })
    });
                 
    const result = await response.json();
    const prescriptionId = result?.prescriptionId;

    if (!prescriptionId) {
      throw new Error('Failed to get prescription ID');
    }

    // Add prescription medicines
    if (prescriptionData.medicines?.length > 0) {
      const medicineItems = prescriptionData.medicines
        .filter((med: any) => med.medicine_id)
        .map((med: any) => ({
          prescription_id: prescriptionId,
          medicine_id: med.medicine_id,
          dosage: med.dosage || '',
          frequency: med.frequency || '',
          duration: med.duration || '',
          instructions: med.instructions || ''
        }));

      if (medicineItems.length > 0) {
        const medicineResponse = await fetch(addPrescriptionMedicinesUrl, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ medicines: medicineItems })
        });

        if (!medicineResponse.ok) {
          const errorData = await medicineResponse.json();
          console.error('Medicine error:', errorData);
          throw new Error('Failed to save prescription medicines');
        }
      }
    }

    // Add lab tests if any
    if (prescriptionData.selectedLabTests?.length > 0) {
      const labTestItems = prescriptionData.selectedLabTests.map((test: any) => ({
        prescription_id: prescriptionId,
        lab_test_id: test.testId
      }));

      const labTestResponse = await fetch(addPrescriptionLabTestsUrl, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ labTests: labTestItems })
      });

      if (!labTestResponse.ok) {
        const errorData = await labTestResponse.json();
        console.error('Lab test error:', errorData);
        throw new Error('Failed to save prescription lab tests');
      }
    }

    // Add imaging studies if any
    if (prescriptionData.selectedImagingStudies?.length > 0) {
      // Map the frontend data structure to match database expectations
      const imagingStudyItems = prescriptionData.selectedImagingStudies.map((study: any) => ({
        prescription_id: prescriptionId,
        imaging_studies_id: study.studyId, // Changed to match database column name
        comments: study.notes || null // Changed from 'notes' to 'comments' to match database
      }));


      const imagingResponse = await fetch(addPrescriptionImagingStudiesUrl, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imagingStudies: imagingStudyItems })
      });

      if (!imagingResponse.ok) {
        const errorData = await imagingResponse.json();
        console.error('Imaging studies error:', errorData);
        throw new Error(`Failed to save prescription imaging studies: ${errorData.error}`);
      }
    }

    return prescriptionId;
  };

  const uploadFiles = async (uploadedFiles: any[], patientId: string, visitId: string) => {
    for (const fileData of uploadedFiles) {
      if (fileData.file) {
        const formData = new FormData();
        formData.append('file', fileData.file);
        formData.append('description', fileData.description || '');
        formData.append('visitId', visitId);

        const response = await fetch(`http://localhost:3002/patients/${patientId}/files`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'File upload failed');
        }

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