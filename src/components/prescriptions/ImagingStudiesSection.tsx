import { useLanguage } from '@/contexts/LanguageContext';
import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {visitImagingStudiesPatientUrl } from '@/components/constants.js';
import { SectionLoading } from '@/components/ui/loading-spinner';


interface ImagingStudiesSectionProps {
  initialSelectedImagingStudies?: Array<{ studyId: string; name?: string; notes?: string }>;
  onSelectionChange?: (studies: Array<{ studyId: string; name?: string; notes?: string }>) => void;
}

export const ImagingStudiesSection =  React.forwardRef<
  { getSelectedStudies: () => Array<{ studyId: string; name?: string; notes?: string }> },
  ImagingStudiesSectionProps
>(({ initialSelectedImagingStudies = [], onSelectionChange }, ref) => {
  // LOCAL state - no more prop drilling!
  const [selectedImagingStudies, setSelectedImagingStudies] = useState(initialSelectedImagingStudies);

  const { data: imagingStudies, isLoading: imagingStudiesLoading } = useQuery({
    queryKey: ['imaging_studies'],
    queryFn: async () => {
      const response = await fetch(visitImagingStudiesPatientUrl);
      if (!response.ok) throw new Error('Failed to fetch imaging studies');
      return response.json();
    },
  });

  const { t, language } = useLanguage();

  // Expose a method to get current selection to parent
  useImperativeHandle(ref, () => ({
    getSelectedStudies: () => selectedImagingStudies
  }));

  // Update local state when initial data changes
  useEffect(() => {
    if (initialSelectedImagingStudies.length > 0) {
      setSelectedImagingStudies(initialSelectedImagingStudies);
    }
  }, [initialSelectedImagingStudies]);

  // Optional: Notify parent of changes (only if needed)
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedImagingStudies);
    }
  }, [selectedImagingStudies, onSelectionChange]);

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
        setSelectedImagingStudies(prev => prev.map(s => 
          String(s.studyId) === studyIdStr ? { ...s, notes: notes || s.notes } : s
        ));
      } else {
        setSelectedImagingStudies(prev => [...prev, { 
          studyId: studyIdStr, 
          name: study?.name?.trim(),
          notes: notes || '' 
        }]);
      }
    } else {
      setSelectedImagingStudies(prev => prev.filter(s => String(s.studyId) !== studyIdStr));
    }
  };

  const handleNotesChange = (studyId: number | string, notes: string) => {
    const studyIdStr = String(studyId);
    setSelectedImagingStudies(prev => prev.map(s => 
      String(s.studyId) === studyIdStr ? { ...s, notes } : s
    ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('imaging.imaging')}</CardTitle>
      </CardHeader>
      <CardContent>
        {imagingStudiesLoading ? (
          <SectionLoading text={t('common.loading') || 'Loading imaging studies...'} variant="pulse" color="orange" />
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
                
                {/* Only show textarea when study is selected */}
                {isStudySelected(study.id) && (
                  <div className="ml-6">
                    <Label htmlFor={`notes-${study.id}`} className="text-xs text-gray-600">
                      {t('imaging.comment')}
                    </Label>
                    <Textarea
                      id={`notes-${study.id}`}
                      value={getStudyNotes(study.id)}
                      onChange={(e) => handleNotesChange(study.id, e.target.value)}
                      placeholder={t('imaging.addComment')}
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
});
