
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { VisitCard } from './VisitCard';
import { StatusChangeConfirmDialog } from './StatusChangeConfirmDialog';

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
    visitId: string;
    newStatus: string;
    patientName: string;
  } | null>(null);

  if (isLoading) {
    return <div className={cn("text-center py-8", language === 'ar' && 'text-right')}>{t('reports.loadingVisits')}</div>;
  }

  if (visits.length === 0) {
    if (searchTerm) {
      return (
        <div className={cn("text-center py-8", language === 'ar' && 'text-right')}>
          <p className="text-gray-500">{t('reports.noVisitsSearch')}</p>
        </div>
      );
    }

    return (
      <div className={cn("text-center py-8", language === 'ar' && 'text-right')}>
        <p className="text-gray-500">{t('reports.noVisitsDate')}</p>
      </div>
    );
  }

  const handleStatusChangeRequest = (visitId: string, newStatus: string, patientName: string) => {
    setStatusChangeConfirm({
      visitId,
      newStatus,
      patientName
    });
  };

  const handleConfirmStatusChange = async () => {
    if (!statusChangeConfirm) return;

    try {
      const { error } = await supabase
        .from('patient_visits')
        .update({ status: statusChangeConfirm.newStatus })
        .eq('id', statusChangeConfirm.visitId);

      if (error) throw error;

      toast({ title: t('visit.statusUpdated') });
      if (onVisitUpdated) {
        onVisitUpdated();
      }
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
            onEditVisit={onEditVisit}
            onStatusChangeRequest={handleStatusChangeRequest}
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
