import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { VisitStatusSelector } from './VisitStatusSelector';

interface VisitCardProps {
  visit: any;
  onViewDetails: (patient: any) => void;
  onEditVisit: (visit: any) => void;
  onStatusChangeRequest: (visitId: number, newStatus: string, patientName: string) => void;
}

export const VisitCard = ({
  visit,
  onViewDetails,
  onEditVisit,
  onStatusChangeRequest
}: VisitCardProps) => {
  const { t, language } = useLanguage();

  const statusText = (statusId: number) => {
    const map: Record<number, string> = {
      1: 'waiting',
      2: 'completed',
      3: 'cancelled'
    };
    return map[statusId] || 'waiting';
  };

  return (
    <Card
      className={`p-4 border rounded-md shadow-sm ${
        language === 'ar' ? 'text-right' : 'text-left'
      }`}
    >
      <p className="mb-1">
        <strong>{t('visit.visitId')}:</strong> {visit.visit_id}
      </p>
      <p className="mb-1">
        <strong>{t('patients.name')}:</strong> {visit.name || t('patient.unknown')}
      </p>
      <p className="mb-1">
        <strong>{t('visit.date')}:</strong>{' '}
        {new Date(visit.visit_date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
      </p>
      <p className="mb-3">
        <strong>{t('visit.status')}:</strong>{' '}
        <VisitStatusSelector
          visitId={visit.visit_id}
          currentStatus={statusText(visit.status_id)}
          patientName={visit.patient_name || ''}
          onStatusChangeRequest={onStatusChangeRequest}
        />
      </p>
      <div className="flex gap-2 flex-wrap">
        <Button size="sm" onClick={() => onViewDetails(visit)}>
          {t('common.view')}
        </Button>
        <Button size="sm" variant="outline" onClick={() => {onEditVisit(visit)
           console.log('Edit clicked', visit);
        }}>
          
          {t('common.edit')}
        </Button>
      </div>
    </Card>
  );
};
