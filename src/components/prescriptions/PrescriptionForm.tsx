import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { patientUrl } from '@/components/constants.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { MedicineSection } from './MedicineSection';
import { LabTestsSection } from './LabTestsSection';
import { ImagingStudiesSection } from './ImagingStudiesSection';
import { SimpleHistoryTextarea } from './SimpleHistoryTextarea';
import { useLanguage } from '@/contexts/LanguageContext';

interface PrescriptionFormProps {
  patientId?: string;
  visitId?: string;
  prescription?: any;
  onSave: (data: any) => void;
  isEmbedded?: boolean;
}

export const PrescriptionForm = ({ 
  patientId, 
  visitId, 
  prescription, 
  onSave, 
  isEmbedded = false 
}: PrescriptionFormProps) => {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [selectedLabTests, setSelectedLabTests] = useState<any[]>([]);
  const [selectedImagingStudies, setSelectedImagingStudies] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState(patientId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
    const { t, language } = useLanguage();
  
  const { register, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      prescription_date: new Date().toISOString().split('T')[0],
      notes: '',
      diagnosis: ''
    }
  });

  const { toast } = useToast();

  // Only fetch patients if we're in standalone mode (not embedded) and no patientId is provided
  const { data: patients } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const response = await fetch(patientUrl);
      if (!response.ok) throw new Error('Failed to fetch patients');
      return await response.json();
    },
    enabled: !isEmbedded && !patientId
  });
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // +1 because months are 0-based
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
  // Load existing prescription data when editing
  useEffect(() => {
    if (prescription) {
reset({
  prescription_date: prescription.prescription_date 
    ? formatDate(prescription.prescription_date)
    : formatDate(new Date().toISOString()),
  notes: prescription.notes || '',
  diagnosis: prescription.diagnosis || ''
});


      // Load medicines
      if (prescription.prescription_items) {
        const loadedMedicines = prescription.prescription_items.map((item: any) => ({
          medicine_id: item.medicine_id,
          dosage: item.dosage,
          duration: item.duration,
          instructions: item.instructions,
          medicines: item.medicines
        }));
        setMedicines(loadedMedicines);
      }

      // Load lab tests
      if (prescription.prescription_lab_tests) {
        const loadedLabTests = prescription.prescription_lab_tests.map((test: any) => ({
          testId: test.lab_test_id,
          name: test.lab_tests?.name
        }));
        setSelectedLabTests(loadedLabTests);
      }

      // Load imaging studies
      if (prescription.prescription_imaging_studies) {
        const loadedImagingStudies = prescription.prescription_imaging_studies.map((study: any) => ({
          studyId: String(study.imaging_study_id || study.imaging_studies_id), 
          name: study.imaging_studies?.name?.trim() || '',
          notes: study.comments || study.notes || '' 
        }));
        setSelectedImagingStudies(loadedImagingStudies);
      }

      // Set patient ID if available
      if (prescription.patient_id) {
        setSelectedPatientId(prescription.patient_id);
      }
    }
  }, [prescription, reset]);

  const onSubmit = async (data: any) => {
    // For embedded mode or when editing, use the provided patientId or prescription's patient_id
    const targetPatientId = patientId || prescription?.patient_id || selectedPatientId;
    
    if (!targetPatientId) {
      toast({ 
        title: 'Error', 
        description: 'Please select a patient.',
        variant: 'destructive' 
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const prescriptionData = {
        ...data,
        patient_id: targetPatientId,
        medicines,
        selectedLabTests,
        selectedImagingStudies,
        visit_id: visitId
      };

      onSave(prescriptionData);
    } catch (error) {
      console.error('Error saving prescription:', error);
      toast({ 
        title: 'Error saving prescription', 
        description: 'Please try again.',
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const FormContent = () => (
    <>
      {/* Only show patient selection if not embedded and no patientId provided and not editing */}
      {!isEmbedded && !patientId && !prescription && (
        <div>
  
          <Label htmlFor="patient">{t('patients.patient')}*</Label>
          <Select
            value={selectedPatientId}
            onValueChange={(value) => setSelectedPatientId(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select patient" />
            </SelectTrigger>
            <SelectContent>
              {patients?.map((patient) => (
                <SelectItem key={patient.id} value={patient.id}>
                  {patient.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label htmlFor="prescription_date">{t('prescription.date')}</Label>
        <Input
          id="prescription_date"
          type="date"
          {...register('prescription_date', { required: 'Date is required' })}
        />
      </div>

      <div>
        <Label htmlFor="diagnosis">{t('prescription.diagnosis')}</Label>
        {/* <SimpleHistoryTextarea
          id="diagnosis"
          placeholder={t('prescription.enterDiagnosis')}
          value={watch('diagnosis')}
          onChange={(value) => setValue('diagnosis', value)}
          historyType="diagnosis"
        /> */}
        <Textarea
          id="diagnosis"
          placeholder={t('prescription.enterDiagnosis')}
          {...register('diagnosis')}
        />
      </div>

      <MedicineSection 
        medicines={medicines} 
        setMedicines={setMedicines} 
      />

      <LabTestsSection 
        selectedLabTests={selectedLabTests}
        setSelectedLabTests={setSelectedLabTests}
      />

      <ImagingStudiesSection 
        selectedImagingStudies={selectedImagingStudies}
        setSelectedImagingStudies={setSelectedImagingStudies}
      />

      <div>
        <Label htmlFor="notes">{t('prescription.notes')}</Label>
        <Textarea
          id="notes"
          placeholder={t('prescription.enterNotes')}
          {...register('notes')}
        />
      </div>

      <div className="flex justify-end">
        <Button 
          type={isEmbedded ? "button" : "submit"} 
          disabled={isSubmitting} 
          onClick={isEmbedded ? handleSubmit(onSubmit) : undefined}
        >
          {isSubmitting ? 'Saving...' : prescription ? t('prescription.update') : t('prescription.save')}
        </Button>
      </div>
    </>
  );

  return (
    <Card className={isEmbedded ? 'border-0 shadow-none' : ''}>
      {!isEmbedded && (
        <CardHeader>
          <CardTitle>{prescription ? t('prescription.edit') : t('prescription.new')}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={isEmbedded ? 'p-0' : ''}>
        {isEmbedded ? (
          <div className="space-y-6">
            <FormContent />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormContent />
          </form>
        )}
      </CardContent>
    </Card>
  );
};