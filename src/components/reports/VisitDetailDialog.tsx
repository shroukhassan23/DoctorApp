import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { VisitDetail } from '@/components/patients/VisitDetail';

interface VisitDetailDialogProps {
  visit: any | null;
  onClose: () => void;
}

export const VisitDetailDialog = ({ visit, onClose }: VisitDetailDialogProps) => {
  const { t, language } = useLanguage();

  if (!visit) return null;

  // استخدمي patient_name و patient_id من الـ visit
  const patient = {
    name: visit.patient_name || '---',
    id: visit.patient_id,
  };

  return (
    <Dialog open={!!visit} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className={cn(language === 'ar' && 'text-right')}>
            {t('reports.viewDetails')} - {patient.name}
          </DialogTitle>
        </DialogHeader>
        <VisitDetail visit={visit} patient={patient} />
      </DialogContent>
    </Dialog>
  );
};
