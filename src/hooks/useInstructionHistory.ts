
import { useQuery } from '@tanstack/react-query';
import { instructionHistoryUrl } from '@/components/constants.js';

export const useInstructionHistory = () => {
  const { data: instructionHistory } = useQuery({
    queryKey: ['instruction_history'],
    queryFn: async () => {
      try {
        const response = await fetch(instructionHistoryUrl);
        if (!response.ok) {
          throw new Error('Failed to fetch instruction history');
        }
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error fetching instruction history:', error);
        throw error;
      }
    },
  });

  return { instructionHistory };
};