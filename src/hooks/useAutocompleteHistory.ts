import { useQuery, useQueryClient } from '@tanstack/react-query';
import { historyBaseUrl, dosageHistoryUrl, durationHistoryUrl, diagnosisHistoryUrl, notesHistoryUrl, instructionHistoryUrl } from '@/components/constants.js';

export const useAutocompleteHistory = () => {
  const queryClient = useQueryClient();

  const { data: dosageHistory } = useQuery({
    queryKey: ['dosage_history'],
    queryFn: async () => {
      const response = await fetch(dosageHistoryUrl);
      if (!response.ok) throw new Error('Failed to fetch dosage history');
      const data = await response.json();
      return data.map((item: any) => item.text);
    },
  });

  const { data: durationHistory } = useQuery({
    queryKey: ['duration_history'],
    queryFn: async () => {
      const response = await fetch(durationHistoryUrl);
      if (!response.ok) throw new Error('Failed to fetch duration history');
      const data = await response.json();
      return data.map((item: any) => item.text);
    },
  });

  const { data: diagnosisHistory } = useQuery({
    queryKey: ['diagnosis_history'],
    queryFn: async () => {
      const response = await fetch(diagnosisHistoryUrl);
      if (!response.ok) throw new Error('Failed to fetch diagnosis history');
      const data = await response.json();
      return data.map((item: any) => item.text);
    },
  });

  const { data: notesHistory } = useQuery({
    queryKey: ['notes_history'],
    queryFn: async () => {
      const response = await fetch(notesHistoryUrl);
      if (!response.ok) throw new Error('Failed to fetch notes history');
      const data = await response.json();
      return data.map((item: any) => item.text);
    },
  });

  const { data: instructionHistory } = useQuery({
    queryKey: ['instruction_history'],
    queryFn: async () => {
      const response = await fetch(instructionHistoryUrl);
      if (!response.ok) throw new Error('Failed to fetch instruction history');
      const data = await response.json();
      return data.map((item: any) => item.text);
    },
  });

  const updateDosageHistory = async (text: string) => {
    if (!text.trim()) return;
    
    try {
      await fetch(dosageHistoryUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() })
      });
      queryClient.invalidateQueries({ queryKey: ['dosage_history'] });
    } catch (error) {
      console.error('Error updating dosage history:', error);
    }
  };

  const updateDurationHistory = async (text: string) => {
    if (!text.trim()) return;
    
    try {
      await fetch(durationHistoryUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() })
      });
      queryClient.invalidateQueries({ queryKey: ['duration_history'] });
    } catch (error) {
      console.error('Error updating duration history:', error);
    }
  };

  const updateDiagnosisHistory = async (text: string) => {
    if (!text.trim()) return;
    
    try {
      await fetch(diagnosisHistoryUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() })
      });
      queryClient.invalidateQueries({ queryKey: ['diagnosis_history'] });
    } catch (error) {
      console.error('Error updating diagnosis history:', error);
    }
  };

  const updateNotesHistory = async (text: string) => {
    if (!text.trim()) return;
    
    try {
      await fetch(notesHistoryUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() })
      });
      queryClient.invalidateQueries({ queryKey: ['notes_history'] });
    } catch (error) {
      console.error('Error updating notes history:', error);
    }
  };

  const updateInstructionHistory = async (text: string) => {
    if (!text.trim()) return;
    
    try {
      await fetch(instructionHistoryUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() })
      });
      queryClient.invalidateQueries({ queryKey: ['instruction_history'] });
    } catch (error) {
      console.error('Error updating instruction history:', error);
    }
  };

  const deleteDosageHistory = async (text: string) => {
    try {
      await fetch(dosageHistoryUrl, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() })
      });
      queryClient.invalidateQueries({ queryKey: ['dosage_history'] });
    } catch (error) {
      console.error('Error deleting dosage history:', error);
    }
  };

  const deleteDurationHistory = async (text: string) => {
    try {
      await fetch(durationHistoryUrl, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() })
      });
      queryClient.invalidateQueries({ queryKey: ['duration_history'] });
    } catch (error) {
      console.error('Error deleting duration history:', error);
    }
  };

  const deleteDiagnosisHistory = async (text: string) => {
    try {
      await fetch(diagnosisHistoryUrl, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() })
      });
      queryClient.invalidateQueries({ queryKey: ['diagnosis_history'] });
    } catch (error) {
      console.error('Error deleting diagnosis history:', error);
    }
  };

  const deleteNotesHistory = async (text: string) => {
    try {
      await fetch(notesHistoryUrl, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() })
      });
      queryClient.invalidateQueries({ queryKey: ['notes_history'] });
    } catch (error) {
      console.error('Error deleting notes history:', error);
    }
  };

  const deleteInstructionHistory = async (text: string) => {
    try {
      await fetch(instructionHistoryUrl, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() })
      });
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