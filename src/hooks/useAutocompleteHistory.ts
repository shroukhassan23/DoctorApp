
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAutocompleteHistory = () => {
  const queryClient = useQueryClient();

  const { data: dosageHistory } = useQuery({
    queryKey: ['dosage_history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dosage_history')
        .select('text')
        .order('usage_count', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data.map(item => item.text);
    },
  });

  const { data: durationHistory } = useQuery({
    queryKey: ['duration_history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('duration_history')
        .select('text')
        .order('usage_count', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data.map(item => item.text);
    },
  });

  const { data: diagnosisHistory } = useQuery({
    queryKey: ['diagnosis_history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('diagnosis_history')
        .select('text')
        .order('usage_count', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data.map(item => item.text);
    },
  });

  const { data: notesHistory } = useQuery({
    queryKey: ['notes_history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notes_history')
        .select('text')
        .order('usage_count', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data.map(item => item.text);
    },
  });

  const { data: instructionHistory } = useQuery({
    queryKey: ['instruction_history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('instruction_history')
        .select('text')
        .order('usage_count', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data.map(item => item.text);
    },
  });

  const updateDosageHistory = async (text: string) => {
    if (!text.trim()) return;
    
    try {
      const { data: existing } = await supabase
        .from('dosage_history')
        .select('id, usage_count')
        .eq('text', text.trim())
        .single();

      if (existing) {
        await supabase
          .from('dosage_history')
          .update({ 
            usage_count: existing.usage_count + 1,
            last_used: new Date().toISOString()
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('dosage_history')
          .insert({ text: text.trim() });
      }
    } catch (error) {
      console.error('Error updating dosage history:', error);
    }
  };

  const updateDurationHistory = async (text: string) => {
    if (!text.trim()) return;
    
    try {
      const { data: existing } = await supabase
        .from('duration_history')
        .select('id, usage_count')
        .eq('text', text.trim())
        .single();

      if (existing) {
        await supabase
          .from('duration_history')
          .update({ 
            usage_count: existing.usage_count + 1,
            last_used: new Date().toISOString()
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('duration_history')
          .insert({ text: text.trim() });
      }
    } catch (error) {
      console.error('Error updating duration history:', error);
    }
  };

  const updateDiagnosisHistory = async (text: string) => {
    if (!text.trim()) return;
    
    try {
      const { data: existing } = await supabase
        .from('diagnosis_history')
        .select('id, usage_count')
        .eq('text', text.trim())
        .single();

      if (existing) {
        await supabase
          .from('diagnosis_history')
          .update({ 
            usage_count: existing.usage_count + 1,
            last_used: new Date().toISOString()
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('diagnosis_history')
          .insert({ text: text.trim() });
      }
    } catch (error) {
      console.error('Error updating diagnosis history:', error);
    }
  };

  const updateNotesHistory = async (text: string) => {
    if (!text.trim()) return;
    
    try {
      const { data: existing } = await supabase
        .from('notes_history')
        .select('id, usage_count')
        .eq('text', text.trim())
        .single();

      if (existing) {
        await supabase
          .from('notes_history')
          .update({ 
            usage_count: existing.usage_count + 1,
            last_used: new Date().toISOString()
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('notes_history')
          .insert({ text: text.trim() });
      }
    } catch (error) {
      console.error('Error updating notes history:', error);
    }
  };

  const updateInstructionHistory = async (text: string) => {
    if (!text.trim()) return;
    
    try {
      const { data: existing } = await supabase
        .from('instruction_history')
        .select('id, usage_count')
        .eq('text', text.trim())
        .single();

      if (existing) {
        await supabase
          .from('instruction_history')
          .update({ 
            usage_count: existing.usage_count + 1,
            last_used: new Date().toISOString()
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('instruction_history')
          .insert({ text: text.trim() });
      }
    } catch (error) {
      console.error('Error updating instruction history:', error);
    }
  };

  const deleteDosageHistory = async (text: string) => {
    try {
      await supabase
        .from('dosage_history')
        .delete()
        .eq('text', text.trim());
      queryClient.invalidateQueries({ queryKey: ['dosage_history'] });
    } catch (error) {
      console.error('Error deleting dosage history:', error);
    }
  };

  const deleteDurationHistory = async (text: string) => {
    try {
      await supabase
        .from('duration_history')
        .delete()
        .eq('text', text.trim());
      queryClient.invalidateQueries({ queryKey: ['duration_history'] });
    } catch (error) {
      console.error('Error deleting duration history:', error);
    }
  };

  const deleteDiagnosisHistory = async (text: string) => {
    try {
      await supabase
        .from('diagnosis_history')
        .delete()
        .eq('text', text.trim());
      queryClient.invalidateQueries({ queryKey: ['diagnosis_history'] });
    } catch (error) {
      console.error('Error deleting diagnosis history:', error);
    }
  };

  const deleteNotesHistory = async (text: string) => {
    try {
      await supabase
        .from('notes_history')
        .delete()
        .eq('text', text.trim());
      queryClient.invalidateQueries({ queryKey: ['notes_history'] });
    } catch (error) {
      console.error('Error deleting notes history:', error);
    }
  };

  const deleteInstructionHistory = async (text: string) => {
    try {
      await supabase
        .from('instruction_history')
        .delete()
        .eq('text', text.trim());
      queryClient.invalidateQueries({ queryKey: ['instruction_history'] });
    } catch (error) {
      console.error('Error deleting instruction history:', error);
    }
  };

  return {
    dosageHistory,
    durationHistory,
    diagnosisHistory,
    notesHistory,
    instructionHistory,
    updateDosageHistory,
    updateDurationHistory,
    updateDiagnosisHistory,
    updateNotesHistory,
    updateInstructionHistory,
    deleteDosageHistory,
    deleteDurationHistory,
    deleteDiagnosisHistory,
    deleteNotesHistory,
    deleteInstructionHistory,
  };
};
