import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { VisitCard } from './VisitCard';
import { StatusChangeConfirmDialog } from './StatusChangeConfirmDialog';
import { updateVisitUrl } from '@/components/constants.js';

interface VisitListProps {
  visits: any[];
  isLoading: boolean;
  searchTerm: string;
  onViewVisit: (visit: any) => void;
  onEditVisit: (visit: any) => void;
  onVisitUpdated?: () => void;
  onViewPatient: (patient: any) => void;
}

export const VisitList = ({
  visits,
  isLoading,
  searchTerm,
  onViewVisit,
  onEditVisit,
  onVisitUpdated,
  onViewPatient
}: VisitListProps) => {
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const [statusChangeConfirm, setStatusChangeConfirm] = useState<{
    visitId: number;
    newStatus: string;
    patientName: string;
  } | null>(null);

  if (isLoading) {
    return (
      <div className={cn("text-center py-8", language === 'ar' && 'text-right')}>
        {t('reports.loadingVisits')}
      </div>
    );
  }

  if (visits.length === 0) {
    return (
      <div className={cn("text-center py-8", language === 'ar' && 'text-right')}>
        <p className="text-gray-500">
          {searchTerm ? t('reports.noVisitsSearch') : t('reports.noVisitsDate')}
        </p>
      </div>
    );
  }

  const handleStatusChangeRequest = (
    visitId: number,
    newStatus: string,
    patientName: string
  ) => {
    setStatusChangeConfirm({
      visitId,
      newStatus,
      patientName
    });
  };

  const handleConfirmStatusChange = async () => {
    if (!statusChangeConfirm) return;

    try {
      const statusId = getStatusId(statusChangeConfirm.newStatus);

      const response = await fetch(updateVisitUrl(statusChangeConfirm.visitId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status_id: statusId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update visit status');
      }

      toast({ title: t('visit.statusUpdated') });

      if (onVisitUpdated) onVisitUpdated();
    } catch (error) {
      console.error('Error updating visit status:', error);
      toast({
        title: t('reports.errorUpdating'),
        description: t('form.tryAgain'),
        variant: 'destructive'
      });
    } finally {
      setStatusChangeConfirm(null);
    }
  };

  const getStatusId = (status: string) => {
    const normalized = status.toLowerCase();
    const statusMap: Record<string, number> = {
      'waiting': 1,
      'completed': 2,
      'cancelled': 3,
      'انتظار': 1,
      'منتهية': 2,
      'ملغاة': 3
    };
    return statusMap[normalized] || 1;
  };

  const handleViewPatientDetails = (patient: any) => {
    onViewPatient(patient);
  };

  const handleCloseStatusConfirm = () => {
    setStatusChangeConfirm(null);
  };

  return (
    <>
      <div className="space-y-4">
        {visits.map((visit) => (
          <VisitCard
            key={visit.id}
            visit={visit}
            onViewDetails={handleViewPatientDetails}
             onEditVisit={() => onEditVisit({ ...visit, patient: { name: visit.patient_name } })}
            onStatusChangeRequest={(visitId: number, newStatus: string) =>
              handleStatusChangeRequest(visitId, newStatus, visit.patient_name)
            }
          />
        ))}
      </div>

      <StatusChangeConfirmDialog
        isOpen={!!statusChangeConfirm}
        onClose={handleCloseStatusConfirm}
        onConfirm={handleConfirmStatusChange}
        patientName={statusChangeConfirm?.patientName || ''}
        newStatus={statusChangeConfirm?.newStatus || ''}
      />
    </>
  );
};
