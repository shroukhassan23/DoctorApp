import React, { useState, useEffect, useCallback } from 'react';
import { SectionLoading } from '@/components/ui/loading-spinner';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { useAutocompleteHistory } from '@/hooks/useAutocompleteHistory';
import { InlineHistorySearch } from './InlineHistorySearch';
import { visitMedicinePatientUrl } from '@/components/constants.js';
import { useLanguage } from '@/contexts/LanguageContext';
import { AddButton, IconButton } from '../ui/enhanced-button';

interface MedicineSectionProps {
  medicines: any[];
  setMedicines: React.Dispatch<React.SetStateAction<any[]>>;
}

export const MedicineSection = ({ medicines, setMedicines }: MedicineSectionProps) => {

  const { data: medicineOptions, isLoading: medicinesLoading } = useQuery({
    queryKey: ['medicines'],
    queryFn: async () => {

      const response = await fetch(visitMedicinePatientUrl);
      if (!response.ok) throw new Error('Failed to fetch medecines');
      return response.json();
    },
  });
  const { t, language } = useLanguage();
  const {
    dosageHistory,
    durationHistory,
    instructionHistory,
    deleteDosageHistory,
    deleteDurationHistory,
    deleteInstructionHistory,
  } = useAutocompleteHistory();

  // Local state to prevent parent re-renders
  const [localMedicines, setLocalMedicines] = useState(medicines);

  const getCurrentMedicines = useCallback(() => {
    return localMedicines;
  }, [localMedicines]);

  // Update local state when parent medicines change (for initial load)
  useEffect(() => {
    setLocalMedicines(medicines);
  }, [medicines]);

  // Expose getCurrentMedicines function to parent
  useEffect(() => {
    if (setMedicines && typeof setMedicines === 'function') {
      (setMedicines as any).getCurrentMedicines = getCurrentMedicines;
    }
  }, [getCurrentMedicines, setMedicines]);

  // Update only local state - no parent re-render
  const updateMedicine = useCallback((index: number, field: string, value: string) => {
    setLocalMedicines(prev => prev.map((med, i) =>
      i === index ? { ...med, [field]: value } : med
    ));
  }, []);

  // Commit changes to parent when medicine selection changes
  const updateMedicineSelection = useCallback((index: number, medicineId: string) => {
    const newMedicines = localMedicines.map((med, i) =>
      i === index ? { ...med, medicine_id: medicineId } : med
    );
    setLocalMedicines(newMedicines);
    setMedicines(newMedicines); // Commit immediately for medicine selection
  }, [localMedicines, setMedicines]);

  // Add medicine - commit to parent immediately
  const addMedicine = () => {
    const newMedicines = [{ medicine_id: '', dosage: '', duration: '', instructions: '' }, ...localMedicines];
    setLocalMedicines(newMedicines);
    setMedicines(newMedicines); // Commit immediately
  };

  // Remove medicine - commit to parent immediately
  const removeMedicine = (index: number) => {
    const newMedicines = localMedicines.filter((_, i) => i !== index);
    setLocalMedicines(newMedicines);
    setMedicines(newMedicines); // Commit immediately
  };

  // Expose commit function for parent to call on form submission
  useEffect(() => {
    // Add commitChanges function to the setMedicines ref if needed
    if (setMedicines && typeof setMedicines === 'function') {
      (setMedicines as any).commitChanges = () => {
        setMedicines(localMedicines);
      };
    }
  }, [localMedicines, setMedicines]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          {t('medicines.title')}
          <AddButton type="button" onClick={addMedicine} size="sm">
  {t('prescription.medicines')}
</AddButton>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {medicinesLoading ? (
          <SectionLoading text={t('common.loading') || 'Loading medicines...'} variant="pulse" color="orange"/>
        ) : (
          <div className="space-y-4">
            {localMedicines.map((medicine, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{t('medicines.medicine')}{index + 1}</h4>
                  {localMedicines.length > 1 && (
                    <IconButton
                    icon={Trash2}
                    variant="danger"
                    size="sm"
                    onClick={() => removeMedicine(index)}
                    tooltip="Remove medicine"
                  />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>{t('medicines.medicineName')} *</Label>
                    <Select
                      value={localMedicines[index]?.medicine_id}
                      onValueChange={(value) => updateMedicineSelection(index, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('medicines.select')}>
                          {medicineOptions?.find((med) => String(med.id) === String(medicine.medicine_id))?.name ?? t('medicines.select')}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {medicineOptions?.map((med) => (
                          <SelectItem key={med.id} value={String(med.id)}>
                            {med.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>{t('medicines.dosage')}</Label>
                    <InlineHistorySearch
                      items={dosageHistory || []}
                      value={localMedicines[index]?.dosage || ''}
                      onChange={(value) => updateMedicine(index, 'dosage', value)}
                      onSelect={(value) => updateMedicine(index, 'dosage', value)}
                      onDelete={deleteDosageHistory}
                      placeholder={t('medicines.enterDosage')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>{t('medicines.duration')}</Label>
                    <InlineHistorySearch
                      items={durationHistory || []}
                      value={localMedicines[index]?.duration || ''}
                      onChange={(value) => updateMedicine(index, 'duration', value)}
                      onSelect={(value) => updateMedicine(index, 'duration', value)}
                      onDelete={deleteDurationHistory}
                      placeholder={t('medicines.enterDuration')}
                    />
                  </div>

                  <div>
                    <Label>{t('medicines.instructions')}</Label>
                    <InlineHistorySearch
                      items={instructionHistory || []}
                      value={localMedicines[index]?.instructions || ''}
                      onChange={(value) => updateMedicine(index, 'instructions', value)}
                      onSelect={(value) => updateMedicine(index, 'instructions', value)}
                      onDelete={deleteInstructionHistory}
                      placeholder={t('medicines.enterInstructions')}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
