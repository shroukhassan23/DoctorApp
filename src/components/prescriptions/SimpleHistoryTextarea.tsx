
import React from 'react';
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
  
  const getHistory = () => {
    switch (historyType) {
      case 'diagnosis':
        return diagnosisHistory || [];
      case 'notes':
        return notesHistory || [];
      default:
        return [];
    }
  };

  const getDeleteFunction = () => {
    switch (historyType) {
      case 'diagnosis':
        return deleteDiagnosisHistory;
      case 'notes':
        return deleteNotesHistory;
      default:
        return undefined;
    }
  };

  return (
    <InlineHistoryTextarea
      id={id}
      items={getHistory()}
      value={value}
      onChange={onChange}
      onSelect={onChange}
      onDelete={getDeleteFunction()}
      placeholder={placeholder}
    />
  );
};
