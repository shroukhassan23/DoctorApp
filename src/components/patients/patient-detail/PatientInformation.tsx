
import React, { useState } from 'react';
import { Edit, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PatientForm } from '../PatientForm';
import { VisitForm } from '../VisitForm';

interface PatientInformationProps {
  patient: any;
  onUpdate: () => void;
  onVisitSaved: () => void;
}

export const PatientInformation = ({ patient, onUpdate, onVisitSaved }: PatientInformationProps) => {
  const [showEditForm, setShowEditForm] = useState(false);
  const [showVisitForm, setShowVisitForm] = useState(false);

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
        <CardTitle>Patient Information</CardTitle>
        <div className="flex space-x-2">
          <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Patient Information</DialogTitle>
                <DialogDescription>
                  Update patient details and medical information.
                </DialogDescription>
              </DialogHeader>
              <PatientForm patient={patient} onSave={handlePatientUpdate} />
            </DialogContent>
          </Dialog>

          <Dialog open={showVisitForm} onOpenChange={setShowVisitForm}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Visit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Record New Visit for {patient.name}</DialogTitle>
                <DialogDescription>
                  Add a new visit record with diagnosis, treatment, and notes.
                </DialogDescription>
              </DialogHeader>
              <VisitForm patientId={patient.id} onSave={handleVisitSaved} />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="font-medium">Name:</span> {patient.name}</div>
          <div><span className="font-medium">Age:</span> {patient.age} years</div>
          <div><span className="font-medium">Gender:</span> {patient.gender}</div>
          <div><span className="font-medium">Phone:</span> {patient.phone || 'N/A'}</div>
          <div className="col-span-2"><span className="font-medium">Address:</span> {patient.address || 'N/A'}</div>
          <div className="col-span-2">
            <span className="font-medium">Medical History:</span>
            <p className="mt-1 text-gray-600">{patient.medical_history || 'No medical history recorded'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
