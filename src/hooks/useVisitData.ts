import { useQuery } from '@tanstack/react-query';
import { getVisitPrescriptionUrl } from '@/components/constants.js';

// Add these endpoints to your constants.js file
const getVisitFilesUrl = (visitId: string) => `http://localhost:3002/visits/${visitId}/files`;

export const useVisitData = (visitId: string) => {
  const { data: prescription, isLoading: isLoadingPrescription, error: prescriptionError } = useQuery({
    queryKey: ['visit-prescription', visitId],
    queryFn: async () => {
      try {
        const response = await fetch(getVisitPrescriptionUrl(visitId));
        if (!response.ok) {
          if (response.status === 404) {
            // No prescription found for this visit
            return null;
          }
          throw new Error('Failed to fetch prescription');
        }
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error fetching prescription:', error);
        if (error.message.includes('404')) {
          return null; // No prescription found
        }
        throw error;
      }
    },
  });

  const { data: files, isLoading: isLoadingFiles, error: filesError } = useQuery({
    queryKey: ['visit-files', visitId],
    queryFn: async () => {
      try {
        const response = await fetch(getVisitFilesUrl(visitId));
        if (!response.ok) {
          if (response.status === 404) {
            return [];
          }
          throw new Error('Failed to fetch files');
        }
        const data = await response.json();
        return data || [];
      } catch (error) {
        console.error('Error fetching files:', error);
        if (error.message.includes('404')) {
          return [];
        }
        throw error;
      }
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