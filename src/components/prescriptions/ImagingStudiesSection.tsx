import { useLanguage } from '@/contexts/LanguageContext';
import React, { useState, useEffect, useImperativeHandle, forwardRef, useCallback, useRef, memo, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { visitImagingStudiesPatientUrl } from '@/components/constants.js';
import { SectionLoading } from '@/components/ui/loading-spinner';

interface ImagingStudiesSectionProps {
  initialSelectedImagingStudies?: Array<{ studyId: string; name?: string; notes?: string }>;
  onSelectionChange?: (studies: Array<{ studyId: string; name?: string; notes?: string }>) => void;
}

// Optimized Textarea component with debouncing
const StudyNotesTextarea = memo(({ 
  studyId, 
  notes, 
  placeholder, 
  onNotesChange 
}: {
  studyId: string | number;
  notes: string;
  placeholder: string;
  onNotesChange: (studyId: string | number, notes: string) => void;
}) => {
  const [localNotes, setLocalNotes] = useState(notes);
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  // Update local value when notes change from parent
  useEffect(() => {
    setLocalNotes(notes);
  }, [notes]);

  // Debounced change handler
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalNotes(newValue);
    
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set new timeout for debounced update
    timeoutRef.current = setTimeout(() => {
      onNotesChange(studyId, newValue);
    }, 300); // 300ms debounce
  }, [studyId, onNotesChange]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <Textarea
      id={`notes-${studyId}`}
      value={localNotes}
      onChange={handleChange}
      placeholder={placeholder}
      className="mt-1 min-h-[60px]"
      autoResize={false}
    />
  );
});

StudyNotesTextarea.displayName = 'StudyNotesTextarea';

// Memoized individual study component
const StudyItem = memo(({
  study,
  isSelected,
  studyNotes,
  onStudyChange,
  onNotesChange,
  t
}: {
  study: { id: number; name: string };
  isSelected: boolean;
  studyNotes: string;
  onStudyChange: (studyId: number, checked: boolean) => void;
  onNotesChange: (studyId: number, notes: string) => void;
  t: (key: string) => string;
}) => {
  const handleCheckboxChange = useCallback((checked: boolean) => {
    onStudyChange(study.id, checked);
  }, [study.id, onStudyChange]);

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`study-${study.id}`}
          checked={isSelected}
          onCheckedChange={handleCheckboxChange}
        />
        <Label htmlFor={`study-${study.id}`} className="text-sm">
          {study.name?.trim() || 'Unnamed Study'}
        </Label>
      </div>
      
      {isSelected && (
        <div className="ml-6">
          <Label htmlFor={`notes-${study.id}`} className="text-xs text-gray-600">
            {t('imaging.comment')}
          </Label>
          <StudyNotesTextarea
            studyId={study.id}
            notes={studyNotes}
            placeholder={t('imaging.addComment')}
            onNotesChange={onNotesChange}
          />
        </div>
      )}
    </div>
  );
});

StudyItem.displayName = 'StudyItem';

export const ImagingStudiesSection = React.memo(React.forwardRef<
  { getSelectedStudies: () => Array<{ studyId: string; name?: string; notes?: string }> },
  ImagingStudiesSectionProps
>(({ initialSelectedImagingStudies = [], onSelectionChange }, ref) => {
  const [selectedImagingStudies, setSelectedImagingStudies] = useState(initialSelectedImagingStudies);
  const mountedRef = useRef(true);
  const updateTimeoutRef = useRef<NodeJS.Timeout>();

  const { data: imagingStudies, isLoading: imagingStudiesLoading } = useQuery({
    queryKey: ['imaging_studies'],
    queryFn: async () => {
      const response = await fetch(visitImagingStudiesPatientUrl);
      if (!response.ok) throw new Error('Failed to fetch imaging studies');
      return response.json();
    },
  });

  const { t } = useLanguage();

  // Expose imperative method
  useImperativeHandle(ref, () => ({
    getSelectedStudies: () => selectedImagingStudies
  }), [selectedImagingStudies]);

  // Debounced notification to parent
  const notifyParent = useCallback((newSelection: Array<{ studyId: string; name?: string; notes?: string }>) => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current) {
        onSelectionChange?.(newSelection);
      }
    }, 100);
  }, [onSelectionChange]);

  // Optimized helper functions
  const getStudyNotes = useCallback((studyId: number): string => {
    const study = selectedImagingStudies.find(s => String(s.studyId) === String(studyId));
    return study?.notes || '';
  }, [selectedImagingStudies]);

  const isStudySelected = useCallback((studyId: number): boolean => {
    return selectedImagingStudies.some(s => String(s.studyId) === String(studyId));
  }, [selectedImagingStudies]);

  // Optimized study selection handler
  const onImagingStudyChange = useCallback((studyId: number, checked: boolean) => {
    if (!mountedRef.current) return;
    
    const studyIdStr = String(studyId);
    
    setSelectedImagingStudies(prev => {
      let newSelection;
      
      if (checked) {
        const study = imagingStudies?.find(s => s.id === studyId);
        const existingStudy = prev.find(s => String(s.studyId) === studyIdStr);
        
        if (existingStudy) {
          return prev; // No change if already exists
        } else {
          const newStudy = { 
            studyId: studyIdStr, 
            name: study?.name?.trim(),
            notes: '' 
          };
          newSelection = [...prev, newStudy];
        }
      } else {
        newSelection = prev.filter(s => String(s.studyId) !== studyIdStr);
      }
      
      // Notify parent with debouncing
      notifyParent(newSelection);
      return newSelection;
    });
  }, [imagingStudies, notifyParent]);

  // Optimized notes change handler
  const handleNotesChange = useCallback((studyId: number, notes: string) => {
    if (!mountedRef.current) return;
    
    const studyIdStr = String(studyId);
    setSelectedImagingStudies(prev => {
      const newSelection = prev.map(s => 
        String(s.studyId) === studyIdStr ? { ...s, notes } : s
      );
      
      // Notify parent with debouncing
      notifyParent(newSelection);
      return newSelection;
    });
  }, [notifyParent]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);
  useEffect(() => {
  if (initialSelectedImagingStudies.length > 0 && selectedImagingStudies.length === 0) {
    setSelectedImagingStudies(initialSelectedImagingStudies);
  }
}, [initialSelectedImagingStudies]);


  // Memoized studies list
  const studiesList = useMemo(() => {
    if (!imagingStudies) return null;
    
    return imagingStudies.map((study) => (
      <StudyItem
        key={study.id}
        study={study}
        isSelected={isStudySelected(study.id)}
        studyNotes={getStudyNotes(study.id)}
        onStudyChange={onImagingStudyChange}
        onNotesChange={handleNotesChange}
        t={t}
      />
    ));
  }, [imagingStudies, isStudySelected, getStudyNotes, onImagingStudyChange, handleNotesChange, t]);

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
            {studiesList}
          </div>
        )}
      </CardContent>
    </Card>
  );
}));

ImagingStudiesSection.displayName = 'ImagingStudiesSection';