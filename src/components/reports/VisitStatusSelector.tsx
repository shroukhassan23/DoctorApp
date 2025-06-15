import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';

interface VisitStatusSelectorProps {
  visitId: number;
  currentStatus: string;
  patientName: string;
  onStatusChangeRequest: (visitId: number, newStatus: string, patientName: string) => void;
}

export const VisitStatusSelector = ({
  visitId,
  currentStatus,
  patientName,
  onStatusChangeRequest,
}: VisitStatusSelectorProps) => {
  const { t, language } = useLanguage();
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);

  const handleStatusChange = (newStatus: string) => {
    if (newStatus !== currentStatus) {
      onStatusChangeRequest(visitId, newStatus, patientName);
      setSelectedStatus(newStatus);
    }
  };

  return (
    <Select value={selectedStatus} onValueChange={handleStatusChange}>
      <SelectTrigger className="w-[120px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent side={language === 'ar' ? 'left' : 'right'}>
        <SelectItem value="waiting">{t('visit.waiting')}</SelectItem>
        <SelectItem value="completed">{t('visit.completed')}</SelectItem>
        <SelectItem value="cancelled">{t('visit.cancelled')}</SelectItem>
      </SelectContent>
    </Select>
  );
};
