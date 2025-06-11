
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useInstructionHistory = () => {
  const { data: instructionHistory } = useQuery({
    queryKey: ['instruction_history'],
    queryFn: async () => {
      // Get unique instructions from prescription_items
      const { data, error } = await supabase
        .from('prescription_items')
        .select('instructions')
        .not('instructions', 'is', null)
        .not('instructions', 'eq', '');
      
      if (error) throw error;
      
      // Get unique instructions and count frequency
      const instructionCounts = data.reduce((acc: Record<string, number>, item) => {
        const instruction = item.instructions?.trim();
        if (instruction) {
          acc[instruction] = (acc[instruction] || 0) + 1;
        }
        return acc;
      }, {});

      // Sort by frequency and return top 20
      return Object.entries(instructionCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([instruction]) => instruction);
    },
  });

  return { instructionHistory };
};
