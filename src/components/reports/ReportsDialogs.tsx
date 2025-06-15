
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { VisitDetail } from '@/components/patients/VisitDetail';
import { VisitForm } from '@/components/patients/VisitForm';
import { PatientForm } from '@/components/patients/PatientForm';
import { PatientDetail } from '@/components/patients/PatientDetail';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface ReportsDialogsProps {
  selectedVisit: any;
  setSelectedVisit: (visit: any) => void;
  editingVisit: any;
  setEditingVisit: (visit: any) => void;
  selectedPatient: any;
  setSelectedPatient: (patient: any) => void;
  showNewPatientForm: boolean;
  setShowNewPatientForm: (show: boolean) => void;
  viewingPatient: any;
  setViewingPatient: (patient: any) => void;
  onVisitUpdated: () => void;
  onVisitSaved: () => void;
  onPatientSaved: () => void;
}

export const ReportsDialogs = ({
  selectedVisit,
  setSelectedVisit,
  editingVisit,
  setEditingVisit,
  selectedPatient,
  setSelectedPatient,
  showNewPatientForm,
  setShowNewPatientForm,
  viewingPatient,
  setViewingPatient,
  onVisitUpdated,
  onVisitSaved,
  onPatientSaved
}: ReportsDialogsProps) => {
  const { t, language } = useLanguage();

  return (
    <>
      {/* Visit Detail Dialog */}
      {selectedVisit && (
        <Dialog open={!!selectedVisit} onOpenChange={() => setSelectedVisit(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className={cn(language === 'ar' && 'text-right')}>
                {t('reports.viewDetails')} - {selectedVisit.patient_name}
              </DialogTitle>
            </DialogHeader>
            <VisitDetail visit={selectedVisit} patient={{ name: selectedVisit.patient_name, id: selectedVisit.patient_id }} />
          </DialogContent>
        </Dialog>
      )}

      {/* Patient Detail Dialog */}
      {viewingPatient && (
        <Dialog open={!!viewingPatient} onOpenChange={() => setViewingPatient(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className={cn(language === 'ar' && 'text-right')}>
                {t('reports.viewDetails')} - {viewingPatient.name}
              </DialogTitle>
            </DialogHeader>
            <PatientDetail patient={viewingPatient} onUpdate={() => {}} />
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Visit Dialog */}
      {editingVisit && (
        <Dialog open={!!editingVisit} onOpenChange={() => setEditingVisit(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className={cn(language === 'ar' && 'text-right')}>
                {t('reports.editVisit')} - {editingVisit.patients_name}
              </DialogTitle>
            </DialogHeader>
            <VisitForm 
              patientId={editingVisit.patients.id || editingVisit.patient_id} 
              visit={editingVisit}
              onSave={onVisitUpdated} 
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Add Visit to Selected Patient Dialog */}
      {selectedPatient && (
        <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className={cn(language === 'ar' && 'text-right')}>
                {t('reports.addVisitToPatient')} - {selectedPatient.name}
              </DialogTitle>
            </DialogHeader>
            <VisitForm 
              patientId={selectedPatient.id} 
              onSave={onVisitSaved} 
            />
          </DialogContent>
        </Dialog>
      )}

      {/* New Patient Form Dialog */}
      {showNewPatientForm && (
        <Dialog open={showNewPatientForm} onOpenChange={() => setShowNewPatientForm(false)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className={cn(language === 'ar' && 'text-right')}>
                {t('patients.addNew')}
              </DialogTitle>
            </DialogHeader>
            <PatientForm onSave={onPatientSaved} />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
