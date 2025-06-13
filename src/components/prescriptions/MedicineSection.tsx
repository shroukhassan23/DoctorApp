
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAutocompleteHistory } from '@/hooks/useAutocompleteHistory';
import { InlineHistorySearch } from './InlineHistorySearch';
import {visitMedicinePatientUrl } from '@/components/constants.js';
interface MedicineSectionProps {
  medicines: any[];
  setMedicines: React.Dispatch<React.SetStateAction<any[]>>;
}

export const MedicineSection = ({ medicines, setMedicines }: MedicineSectionProps) => {
  const { data: medicineOptions } = useQuery({
    queryKey: ['medicines'],
    queryFn: async () => {
   const response =  await fetch(visitMedicinePatientUrl);
           if (!response.ok) throw new Error('Failed to fetch medecines');
           return response.json();
    },
  });

  const {
    dosageHistory,
    durationHistory,
    instructionHistory,
    deleteDosageHistory,
    deleteDurationHistory,
    deleteInstructionHistory,
  } = useAutocompleteHistory();

  const addMedicine = () => {
    setMedicines(prev => [{ medicine_id: '', dosage: '', duration: '', instructions: '' }, ...prev]);
  };

  const removeMedicine = (index: number) => {
    setMedicines(prev => prev.filter((_, i) => i !== index));
  };

  const updateMedicine = (index: number, field: string, value: string) => {
    setMedicines(prev => prev.map((med, i) => 
      i === index ? { ...med, [field]: value } : med
    ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          Medicines
          <Button type="button" onClick={addMedicine} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Medicine
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {medicines.map((medicine, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Medicine {index + 1}</h4>
                {medicines.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeMedicine(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Medicine *</Label>
                  <Select
                    value={medicine.medicine_id}
                 onValueChange={(value) => updateMedicine(index, 'medicine_id', value)}

                  >
                    <SelectTrigger>
                    <SelectValue placeholder="Select medicine">
                  

                   {
                     medicineOptions?.find((med) => String(med.id) === String(medicine.medicine_id))?.name
                     ?? 'Select medicine'
                   }
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
                  <Label>Dosage</Label>
                  <InlineHistorySearch
                    items={dosageHistory || []}
                    value={medicine.dosage || ''}
                    onChange={(value) => updateMedicine(index, 'dosage', value)}
                    onSelect={(value) => updateMedicine(index, 'dosage', value)}
                    onDelete={deleteDosageHistory}
                    placeholder="e.g., 500mg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Duration</Label>
                  <InlineHistorySearch
                    items={durationHistory || []}
                    value={medicine.duration || ''}
                    onChange={(value) => updateMedicine(index, 'duration', value)}
                    onSelect={(value) => updateMedicine(index, 'duration', value)}
                    onDelete={deleteDurationHistory}
                    placeholder="e.g., 7 days"
                  />
                </div>
                
                <div>
                  <Label>Instructions</Label>
                  <InlineHistorySearch
                    items={instructionHistory || []}
                    value={medicine.instructions || ''}
                    onChange={(value) => updateMedicine(index, 'instructions', value)}
                    onSelect={(value) => updateMedicine(index, 'instructions', value)}
                    onDelete={deleteInstructionHistory}
                    placeholder="e.g., Take after meals"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
