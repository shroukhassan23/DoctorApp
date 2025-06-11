
import { supabase } from '@/integrations/supabase/client';

export const updateExistingPrescription = async (prescriptionData: any, existingPrescription: any) => {
  // Update existing prescription immediately for editing mode
  const { error: prescriptionError } = await supabase
    .from('prescriptions')
    .update({
      notes: prescriptionData.notes || '',
    })
    .eq('id', existingPrescription.id);

  if (prescriptionError) throw prescriptionError;

  // Delete existing items
  await supabase.from('prescription_items').delete().eq('prescription_id', existingPrescription.id);
  await supabase.from('prescription_lab_tests').delete().eq('prescription_id', existingPrescription.id);
  await supabase.from('prescription_imaging_studies').delete().eq('prescription_id', existingPrescription.id);

  // Add medicines
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
      const { error: medicineError } = await supabase
        .from('prescription_items')
        .insert(medicineItems);
      if (medicineError) throw medicineError;
    }
  }

  // Add lab tests
  if (prescriptionData.selectedLabTests?.length > 0) {
    const labTestItems = prescriptionData.selectedLabTests.map((test: any) => ({
      prescription_id: existingPrescription.id,
      lab_test_id: test.testId
    }));

    const { error: labTestError } = await supabase
      .from('prescription_lab_tests')
      .insert(labTestItems);
    if (labTestError) throw labTestError;
  }

  // Add imaging studies
  if (prescriptionData.selectedImagingStudies?.length > 0) {
    const imagingStudyItems = prescriptionData.selectedImagingStudies.map((study: any) => ({
      prescription_id: existingPrescription.id,
      imaging_study_id: study.studyId,
      notes: study.notes || null
    }));

    const { error: imagingStudyError } = await supabase
      .from('prescription_imaging_studies')
      .insert(imagingStudyItems);
    if (imagingStudyError) throw imagingStudyError;
  }
};

export const loadExistingPrescription = async (visitId: string) => {
  if (!visitId) return null;

  try {
    const { data: prescription, error } = await supabase
      .from('prescriptions')
      .select(`
        *,
        prescription_items (
          *,
          medicines (*)
        ),
        prescription_lab_tests (
          *,
          lab_tests (*)
        ),
        prescription_imaging_studies (
          *,
          imaging_studies (*)
        )
      `)
      .eq('visit_id', visitId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error loading prescription:', error);
      return null;
    }

    return prescription;
  } catch (error) {
    console.error('Error loading prescription:', error);
    return null;
  }
};
