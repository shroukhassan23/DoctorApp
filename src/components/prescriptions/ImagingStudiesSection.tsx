
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import {visitImagingStudiesPatientUrl } from '@/components/constants.js';
interface ImagingStudiesSectionProps {
  selectedImagingStudies: Array<{ studyId: string; name?: string; notes?: string }>;
  setSelectedImagingStudies: React.Dispatch<React.SetStateAction<Array<{ studyId: string; name?: string; notes?: string }>>>;
}

export const ImagingStudiesSection = ({ selectedImagingStudies, setSelectedImagingStudies }: ImagingStudiesSectionProps) => {
  const { data: imagingStudies } = useQuery({
    queryKey: ['imaging_studies'],
    queryFn: async () => {
     const response =  await fetch(visitImagingStudiesPatientUrl);
                if (!response.ok) throw new Error('Failed to fetch medecines');
                return response.json();
    },
  });

  const getStudyNotes = (studyId: string) => {
    const study = selectedImagingStudies.find(s => s.studyId === studyId);
    return study?.notes || '';
  };

  const isStudySelected = (studyId: string) => {
    return selectedImagingStudies.some(s => s.studyId === studyId);
  };

  const onImagingStudyChange = (studyId: string, checked: boolean, notes?: string) => {
    if (checked) {
      const study = imagingStudies?.find(s => s.id === studyId);
      const existingStudy = selectedImagingStudies.find(s => s.studyId === studyId);
      
      if (existingStudy) {
        // Update existing study with new notes
        setSelectedImagingStudies(prev => prev.map(s => 
          s.studyId === studyId ? { ...s, notes: notes || s.notes } : s
        ));
      } else {
        // Add new study
        setSelectedImagingStudies(prev => [...prev, { 
          studyId, 
          name: study?.name, 
          notes: notes || '' 
        }]);
      }
    } else {
      setSelectedImagingStudies(prev => prev.filter(s => s.studyId !== studyId));
    }
  };

  const handleNotesChange = (studyId: string, notes: string) => {
    onImagingStudyChange(studyId, true, notes);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Imaging Studies</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {imagingStudies?.map((study) => (
            <div key={study.id} className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={study.id}
                  checked={isStudySelected(study.id)}
                  onCheckedChange={(checked) => onImagingStudyChange(study.id, checked as boolean, getStudyNotes(study.id))}
                />
                <Label htmlFor={study.id} className="text-sm">{study.name}</Label>
              </div>
              {isStudySelected(study.id) && (
                <div className="ml-6">
                  <Label htmlFor={`notes-${study.id}`} className="text-xs text-gray-600">Comments</Label>
                  <Textarea
                    id={`notes-${study.id}`}
                    value={getStudyNotes(study.id)}
                    onChange={(e) => handleNotesChange(study.id, e.target.value)}
                    placeholder="Add comments for this imaging study..."
                    className="mt-1 min-h-[60px]"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
