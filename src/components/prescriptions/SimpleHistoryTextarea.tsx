import React, { useCallback } from 'react';
import { InlineHistoryTextarea } from './InlineHistoryTextarea';
import { useAutocompleteHistory } from '@/hooks/useAutocompleteHistory';

interface SimpleHistoryTextareaProps {
  id?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  historyType: 'diagnosis' | 'notes';
}

export const SimpleHistoryTextarea = ({ 
  id, 
  placeholder, 
  value, 
  onChange, 
  historyType 
}: SimpleHistoryTextareaProps) => {
  const { diagnosisHistory, notesHistory, deleteDiagnosisHistory, deleteNotesHistory } = useAutocompleteHistory();
  
  const getHistory = useCallback(() => {
    switch (historyType) {
      case 'diagnosis':
        return diagnosisHistory || [];
      case 'notes':
        return notesHistory || [];
      default:
        return [];
    }
  }, [diagnosisHistory, notesHistory, historyType]);

  const getDeleteFunction = useCallback(() => {
    switch (historyType) {
      case 'diagnosis':
        return deleteDiagnosisHistory;
      case 'notes':
        return deleteNotesHistory;
      default:
        return undefined;
    }
  }, [deleteDiagnosisHistory, deleteNotesHistory, historyType]);

  // Memoize the onChange to prevent re-renders
  const handleChange = useCallback((newValue: string) => {
    onChange(newValue);
  }, [onChange]);

  const handleSelect = useCallback((selectedValue: string) => {
    onChange(selectedValue);
  }, [onChange]);

  return (
    <InlineHistoryTextarea
      id={id}
      items={getHistory()}
      value={value}
      onChange={handleChange}
      onSelect={handleSelect}
      onDelete={getDeleteFunction()}
      placeholder={placeholder}
    />
  );
};