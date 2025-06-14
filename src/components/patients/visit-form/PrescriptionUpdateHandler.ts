import { 
  addprescriptionUrl, 
  addPrescriptionMedicinesUrl,
  addPrescriptionLabTestsUrl,
  addPrescriptionImagingStudiesUrl,
  getVisitPrescriptionUrl,
  updatePrescriptionUrl,
  deletePrescriptionItemsUrl,
  deletePrescriptionLabTestsUrl,
  deletePrescriptionImagingStudiesUrl
} from '@/components/constants.js';

export const updateExistingPrescription = async (prescriptionData: any, existingPrescription: any) => {
  // Update existing prescription for editing mode
  const updateResponse = await fetch(updatePrescriptionUrl(existingPrescription.id), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      notes: prescriptionData.notes || '',
      diagnosis: prescriptionData.diagnosis || ''
    })
  });

  if (!updateResponse.ok) {
    const errorData = await updateResponse.json();
    throw new Error(errorData.error || 'Failed to update prescription');
  }

  // Delete existing items
  await fetch(deletePrescriptionItemsUrl(existingPrescription.id), { method: 'DELETE' });
  await fetch(deletePrescriptionLabTestsUrl(existingPrescription.id), { method: 'DELETE' });
  await fetch(deletePrescriptionImagingStudiesUrl(existingPrescription.id), { method: 'DELETE' });

  // Add new medicines
  if (prescriptionData.medicines?.length > 0) {
    const medicineItems = prescriptionData.medicines
      .filter((med: any) => med.medicine_id)
      .map((med: any) => ({
        prescription_id: existingPrescription.id,
        medicine_id: med.medicine_id,
        dosage: med.dosage || '',
        frequency: '',
        duration: med.duration || '',
        instructions: med.instructions || ''
      }));

    if (medicineItems.length > 0) {
      const medicineResponse = await fetch(addPrescriptionMedicinesUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ medicines: medicineItems })
      });

      if (!medicineResponse.ok) {
        throw new Error('Failed to update prescription medicines');
      }
    }
  }

  // Add new lab tests
  if (prescriptionData.selectedLabTests?.length > 0) {
    const labTestItems = prescriptionData.selectedLabTests.map((test: any) => ({
      prescription_id: existingPrescription.id,
      lab_test_id: test.testId
    }));

    const labTestResponse = await fetch(addPrescriptionLabTestsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ labTests: labTestItems })
    });

    if (!labTestResponse.ok) {
      throw new Error('Failed to update prescription lab tests');
    }
  }

  // Add new imaging studies
  if (prescriptionData.selectedImagingStudies?.length > 0) {
    const imagingStudyItems = prescriptionData.selectedImagingStudies.map((study: any) => ({
      prescription_id: existingPrescription.id,
      imaging_studies_id: study.studyId,
      comments: study.notes || null
    }));

    const imagingResponse = await fetch(addPrescriptionImagingStudiesUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ imagingStudies: imagingStudyItems })
    });

    if (!imagingResponse.ok) {
      throw new Error('Failed to update prescription imaging studies');
    }
  }
};

export const loadExistingPrescription = async (visitId: string) => {
  if (!visitId) return null;

  try {
    const response = await fetch(getVisitPrescriptionUrl(visitId));
    
    if (response.status === 404) {
      return null; // No prescription found for this visit
    }
    
    if (!response.ok) {
      throw new Error('Failed to load prescription');
    }

    const prescription = await response.json();
    return prescription;
  } catch (error) {
    console.error('Error loading prescription:', error);
    return null;
  }
};