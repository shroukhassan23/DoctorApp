
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

  return (
    <Dialog open={!!visit} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className={cn(language === 'ar' && 'text-right')}>
            {t('reports.viewDetails')} - {visit.patients?.name}
          </DialogTitle>
        </DialogHeader>
        <VisitDetail visit={visit} patient={visit.patients} />
      </DialogContent>
    </Dialog>
  );
};
