
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import {visitLabTestsPatientUrl } from '@/components/constants.js';
interface LabTestsSectionProps {
  selectedLabTests: Array<{ testId: string; name?: string }>;
  setSelectedLabTests: React.Dispatch<React.SetStateAction<Array<{ testId: string; name?: string }>>>;
}

export const LabTestsSection = ({ selectedLabTests, setSelectedLabTests }: LabTestsSectionProps) => {
  const { data: labTests } = useQuery({
    queryKey: ['lab_tests'],
    queryFn: async () => {
const response =  await fetch(visitLabTestsPatientUrl);
           if (!response.ok) throw new Error('Failed to fetch medecines');
           return response.json();
    },
  });
 const { t, language } = useLanguage();
  const isTestSelected = (testId: string) => {
    return selectedLabTests.some(t => t.testId === testId);
  };

  const onLabTestChange = (testId: string, checked: boolean) => {
    if (checked) {
      const test = labTests?.find(t => t.id === testId);
      setSelectedLabTests(prev => [...prev, { testId, name: test?.name }]);
    } else {
      setSelectedLabTests(prev => prev.filter(t => t.testId !== testId));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('labTests.tests')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {labTests?.map((test) => (
            <div key={test.id} className="flex items-center space-x-2">
              <Checkbox
                id={test.id}
                checked={isTestSelected(test.id)}
                onCheckedChange={(checked) => onLabTestChange(test.id, checked as boolean)}
              />
              <Label htmlFor={test.id} className="text-sm">{test.name}</Label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
