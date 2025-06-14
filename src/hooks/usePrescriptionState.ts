
import { useState } from 'react';

export const usePrescriptionState = (visit?: any) => {
  const [prescriptionData, setPrescriptionData] = useState<any>(null);
  const [isPrescriptionSaved, setIsPrescriptionSaved] = useState(false);
  const [existingPrescription, setExistingPrescription] = useState<any>(null);
  const [prescriptionKey, setPrescriptionKey] = useState(0);

  const isEditing = !!visit;

  const updatePrescriptionData = (data: any) => {
    setPrescriptionData(data);
    setIsPrescriptionSaved(true);
  };

  const resetPrescriptionKey = () => {
    setPrescriptionKey(prev => prev + 1);
  };

  const setExistingPrescriptionData = (prescription: any) => {
    setExistingPrescription(prescription);
    setIsPrescriptionSaved(true);
    resetPrescriptionKey();
  };

  const markPrescriptionAsSaved = () => {
    setIsPrescriptionSaved(true);
  };

  const clearPrescriptionSavedState = () => {
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
