import { useLanguage } from '@/contexts/LanguageContext';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {visitImagingStudiesPatientUrl } from '@/components/constants.js';
import { SectionLoading } from '@/components/ui/loading-spinner';

interface ImagingStudiesSectionProps {
  selectedImagingStudies: Array<{ studyId: string; name?: string; notes?: string }>;
  setSelectedImagingStudies: React.Dispatch<React.SetStateAction<Array<{ studyId: string; name?: string; notes?: string }>>>;
}

export const ImagingStudiesSection = ({ selectedImagingStudies, setSelectedImagingStudies }: ImagingStudiesSectionProps) => {
  const { data: imagingStudies, isLoading: imagingStudiesLoading } = useQuery({
    queryKey: ['imaging_studies'],
    queryFn: async () => {
     const response =  await fetch(visitImagingStudiesPatientUrl);
                if (!response.ok) throw new Error('Failed to fetch imaging studies');
                return response.json();
    },
  });

  const { t, language } = useLanguage();

  const getStudyNotes = (studyId: number | string) => {
    const study = selectedImagingStudies.find(s => String(s.studyId) === String(studyId));
    return study?.notes || '';
  };

  const isStudySelected = (studyId: number | string) => {
    return selectedImagingStudies.some(s => String(s.studyId) === String(studyId));
  };

  const onImagingStudyChange = (studyId: number | string, checked: boolean, notes?: string) => {
    const studyIdStr = String(studyId);
    
    if (checked) {
      const study = imagingStudies?.find(s => s.id === Number(studyId));
      const existingStudy = selectedImagingStudies.find(s => String(s.studyId) === studyIdStr);
      
      if (existingStudy) {
        // Update existing study with new notes
        setSelectedImagingStudies(prev => prev.map(s => 
          String(s.studyId) === studyIdStr ? { ...s, notes: notes || s.notes } : s
        ));
      } else {
        // Add new study
        setSelectedImagingStudies(prev => [...prev, { 
          studyId: studyIdStr, 
          name: study?.name?.trim(), // Trim whitespace from names
          notes: notes || '' 
        }]);
      }
    } else {
      setSelectedImagingStudies(prev => prev.filter(s => String(s.studyId) !== studyIdStr));
    }
  };

  const handleNotesChange = (studyId: number | string, notes: string) => {
    onImagingStudyChange(studyId, true, notes);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('imaging.imaging')}</CardTitle>
      </CardHeader>
      <CardContent>
  {imagingStudiesLoading ? (
    <SectionLoading text={t('general.loading') || 'Loading imaging studies...'} />
  ) : (
    <div className="space-y-4">
      {imagingStudies?.map((study) => (
        <div key={study.id} className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`study-${study.id}`}
              checked={isStudySelected(study.id)}
              onCheckedChange={(checked) => onImagingStudyChange(study.id, checked as boolean, getStudyNotes(study.id))}
            />
            <Label htmlFor={`study-${study.id}`} className="text-sm">
              {study.name?.trim() || 'Unnamed Study'}
            </Label>
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
  )}
</CardContent>
    </Card>
  );
};