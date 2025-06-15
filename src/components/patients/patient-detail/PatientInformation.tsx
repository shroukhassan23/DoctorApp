
import React, { useState } from 'react';
import { Edit, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PatientForm } from '../PatientForm';
import { VisitForm } from '../VisitForm';
import { useLanguage } from '@/contexts/LanguageContext';
import { AddButton, EditButton } from '@/components/ui/enhanced-button';
interface PatientInformationProps {
  patient: any;
  onUpdate: () => void;
  onVisitSaved: () => void;
}

export const PatientInformation = ({ patient, onUpdate, onVisitSaved }: PatientInformationProps) => {
  const [showEditForm, setShowEditForm] = useState(false);
  const [showVisitForm, setShowVisitForm] = useState(false);
  const { t, language } = useLanguage();
  const handlePatientUpdate = () => {
    onUpdate();
    setShowEditForm(false);
  };

  const handleVisitSaved = () => {
    onVisitSaved();
    setShowVisitForm(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('patients.info')}</CardTitle>
        <div className="flex gap-2">
          <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
            <DialogTrigger asChild>
              <EditButton size="sm">
                {t('patients.edit')}
              </EditButton>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t('patients.editInfo')}</DialogTitle>
                <DialogDescription>
                  {t('visit.updatePatientDetails')}
                </DialogDescription>
              </DialogHeader>
              <PatientForm patient={patient} onSave={handlePatientUpdate} />
            </DialogContent>
          </Dialog>

          <Dialog open={showVisitForm} onOpenChange={setShowVisitForm}>
            <DialogTrigger asChild>
              <AddButton size="sm">
                {t('patients.addVisit')}
              </AddButton>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t('visit.recordNewVisit')}{patient.name}</DialogTitle>
                <DialogDescription>
                  {t('visit.addNewVisitRecord')}
                </DialogDescription>
              </DialogHeader>
              <VisitForm key={`visit-form-${patient.id}`} patientId={patient.id} onSave={handleVisitSaved} />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="font-medium">{t('patients.name')}:</span> {patient.name}</div>
          <div><span className="font-medium">{t('patients.age')}:</span> {patient.age}{t('patients.years')} </div>
          <div><span className="font-medium">{t('patients.gender')}:</span> {patient.gender}</div>
          <div><span className="font-medium">{t('patients.phone')}:</span> {patient.phone || 'N/A'}</div>
          <div className="col-span-2"><span className="font-medium">{t('patients.address')}:</span> {patient.address || 'N/A'}</div>
          <div className="col-span-2">
            <span className="font-medium">{t('patients.medicalHistory')}</span>
            <p className="mt-1 text-gray-600">{patient.medical_history || t('patients.noMedicalhistory')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
