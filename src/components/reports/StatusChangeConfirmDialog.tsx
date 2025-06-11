
import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface StatusChangeConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  patientName: string;
  newStatus: string;
}

export const StatusChangeConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  patientName, 
  newStatus 
}: StatusChangeConfirmDialogProps) => {
  const { t, language } = useLanguage();

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return t('visit.completed');
      case 'cancelled':
        return t('visit.cancelled');
      default:
        return t('visit.waiting');
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className={cn(language === 'ar' && 'rtl')}>
        <AlertDialogHeader>
          <AlertDialogTitle className={cn(language === 'ar' && 'text-right')}>
            {t('visit.changeStatus')}
          </AlertDialogTitle>
          <AlertDialogDescription className={cn(language === 'ar' && 'text-right')}>
            Are you sure you want to change the status of {patientName}'s visit to "{getStatusText(newStatus)}"?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className={cn(language === 'ar' && 'flex-row-reverse')}>
          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {t('common.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
