
import { useState } from 'react';

export const usePrescriptionState = (visit?: any) => {
  const [prescriptionData, setPrescriptionData] = useState<any>(null);
  const [isPrescriptionSaved, setIsPrescriptionSaved] = useState(false);
  const [existingPrescription, setExistingPrescription] = useState<any>(null);
  const [prescriptionKey, setPrescriptionKey] = useState(0);

  const isEditing = !!visit;

  const updatePrescriptionData = (data: any) => {
    console.log('Updating prescription data and marking as saved:', data);
    setPrescriptionData(data);
    setIsPrescriptionSaved(true);
  };

  const resetPrescriptionKey = () => {
    setPrescriptionKey(prev => prev + 1);
  };

  const setExistingPrescriptionData = (prescription: any) => {
    console.log('Setting existing prescription data and marking as saved:', prescription);
    setExistingPrescription(prescription);
    setIsPrescriptionSaved(true);
    resetPrescriptionKey();
  };

  const markPrescriptionAsSaved = () => {
    console.log('Explicitly marking prescription as saved');
    setIsPrescriptionSaved(true);
  };

  const clearPrescriptionSavedState = () => {
    console.log('Clearing prescription saved state');
    setIsPrescriptionSaved(false);
  };

  return {
    prescriptionData,
    isPrescriptionSaved,
    existingPrescription,
    prescriptionKey,
    isEditing,
    updatePrescriptionData,
    setExistingPrescriptionData,
    resetPrescriptionKey,
    markPrescriptionAsSaved,
    clearPrescriptionSavedState
  };
};
