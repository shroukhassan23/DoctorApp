
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useVisitData = (visitId: string) => {
  const { data: prescription, isLoading: isLoadingPrescription, error: prescriptionError } = useQuery({
    queryKey: ['visit-prescription', visitId],
    queryFn: async () => {
      console.log('Fetching prescription for visit:', visitId);
      const { data, error } = await supabase
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
      
      if (error) {
        console.error('Error fetching prescription:', error);
        throw error;
      }
      console.log('Fetched prescription data:', data);
      return data;
    },
  });

  const { data: files, isLoading: isLoadingFiles, error: filesError } = useQuery({
    queryKey: ['visit-files', visitId],
    queryFn: async () => {
      console.log('Fetching files for visit:', visitId);
      const { data, error } = await supabase
        .from('patient_files')
        .select('*')
        .eq('visit_id', visitId)
        .order('uploaded_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching files:', error);
        throw error;
      }
      console.log('Fetched files data:', data);
      return data || [];
    },
  });

  return { 
    prescription, 
    files, 
    isLoadingPrescription, 
    isLoadingFiles,
    prescriptionError,
    filesError
  };
};
