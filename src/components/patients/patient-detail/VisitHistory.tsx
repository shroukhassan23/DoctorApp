import React, { useState } from 'react';
import { Calendar, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { VisitForm } from '../VisitForm';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { deleteVisitUrl } from '@/components/constants.js';
import { useLanguage } from '@/contexts/LanguageContext';
import { DeleteButton, EditButton } from '@/components/ui/enhanced-button';


interface VisitHistoryProps {
  visits: any[];
  onVisitClick: (visit: any) => void;
  onVisitUpdated: () => void;
}

export const VisitHistory = ({ visits, onVisitClick, onVisitUpdated }: VisitHistoryProps) => {
  const [editingVisit, setEditingVisit] = useState<any>(null);
  const { toast } = useToast();
  const { t, language } = useLanguage();
  
  // Check if current language is Arabic
  const isRTL = language === 'ar';
  
  const handleDeleteVisit = async (visitId: string) => {
    try {
      const response = await fetch(deleteVisitUrl(visitId), {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Delete failed');
      }

      toast({ title: t('visit.deletedSuccess')});
      onVisitUpdated();
    } catch (error) {
      console.error('Error deleting visit:', error);
      toast({
        title: 'Error deleting visit',
        description: 'Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleVisitUpdated = () => {
    onVisitUpdated();
    setEditingVisit(null);
    toast({ title: t('visit.updatedSuccess') });
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <div className={`space-y-3 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {visits?.map((visit) => (
        <Card key={visit.id} className="hover:bg-gray-50 transition-colors">
          <CardContent className="pt-4">
            <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="space-y-2 w-full cursor-pointer" onClick={() => onVisitClick(visit)}>
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex items-center text-sm text-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Calendar className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {formatDate(visit.visit_date)}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${visit.type_id === 1 || visit.visit_type === 'primary'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-orange-100 text-orange-700'
                    }`}>
                    {visit.type_name || (visit.type_id === 1 ? 'Primary' : 'Follow-up')}
                  </span>
                </div>

                {visit.chief_complaint && visit.chief_complaint.trim() !== '' && (
                  <div className={`text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                    <span className="font-medium">{t('visit.chiefComplaint')}:</span> {visit.chief_complaint.length > 100 ? `${visit.chief_complaint.substring(0, 100)}...` : visit.chief_complaint}
                  </div>
                )}

                {visit.diagnosis && visit.diagnosis.trim() !== '' && (
                  <div className={`text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                    <span className="font-medium">{t('visit.diagnosis')}:</span> {visit.diagnosis.length > 100 ? `${visit.diagnosis.substring(0, 100)}...` : visit.diagnosis}
                  </div>
                )}

                {visit.notes && visit.notes.trim() !== '' && (
                  <div className={`text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                    <span className="font-medium">{t('visit.notes')}:</span> {visit.notes.length > 100 ? `${visit.notes.substring(0, 100)}...` : visit.notes}
                  </div>
                )}

                {(!visit.chief_complaint || visit.chief_complaint.trim() === '') &&
                  (!visit.diagnosis || visit.diagnosis.trim() === '') &&
                  (!visit.notes || visit.notes.trim() === '') && (
                    <div className={`text-sm text-gray-500 italic ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t('visit.noAdditionalDetails')}
                    </div>
                  )}
              </div>

              <div className={`flex space-x-2 ${isRTL ? 'ml-4 mr-4 mt-20 space-x-reverse' : 'ml-4'}`}>
                <EditButton
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingVisit(visit);
                  }}
                >
                  {t('patients.edit')}
                </EditButton>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DeleteButton
                      size="sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {t('visit.delete')}
                    </DeleteButton>
                  </AlertDialogTrigger>
                  <AlertDialogContent dir={isRTL ? 'rtl' : 'ltr'}>
                    <AlertDialogHeader>
                      <AlertDialogTitle className={isRTL ? 'text-right' : 'text-left'}>
                        {t('common.areYouSure')}
                      </AlertDialogTitle>
                      <AlertDialogDescription className={isRTL ? 'text-right' : 'text-left'}>
                        {t('common.cannotUndo')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className={isRTL ? 'flex-row-reverse' : ''}>
                      <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                      <DeleteButton onClick={() => handleDeleteVisit(visit.id)}>
                        {t('common.delete')}
                      </DeleteButton>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {!visits?.length && (
        <p className={`text-gray-500 text-center py-8 ${isRTL ? 'text-right' : 'text-left'}`}>
          {t('visit.noVisits')}
        </p>
      )}

      {/* Edit Visit Dialog */}
      {editingVisit && (
        <Dialog open={!!editingVisit} onOpenChange={() => setEditingVisit(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
            <DialogHeader>
              <DialogTitle className={isRTL ? 'text-right' : 'text-left'}>
                {t('reports.editVisit')} - {formatDate(editingVisit.visit_date)}
              </DialogTitle>
            </DialogHeader>
            <VisitForm
              patientId={editingVisit.patient_id}
              visit={editingVisit}
              onSave={handleVisitUpdated}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};