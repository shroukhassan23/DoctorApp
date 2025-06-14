import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Plus, User } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { patientUrl } from '@/components/constants.js';

interface PatientSearchBarProps {
  onPatientSelected: (patient: any) => void;
  onAddNewPatient: () => void;
}

export const PatientSearchBar = ({ onPatientSelected, onAddNewPatient }: PatientSearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const { t, language } = useLanguage();

  const { data: patients, isLoading } = useQuery({
    queryKey: ['patient-search', searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];
      
      const response = await fetch(`${patientUrl}/search?q=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) throw new Error('Failed to search patients');
      return await response.json();
    },
    enabled: searchTerm.length > 0
  });

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setShowResults(value.length > 0);
  };

  const handlePatientSelect = (patient: any) => {
    onPatientSelected(patient);
    setSearchTerm('');
    setShowResults(false);
  };

  const handleAddNew = () => {
    onAddNewPatient();
    setSearchTerm('');
    setShowResults(false);
  };

  return (
    <div className="relative">
      <div className={cn("relative", language === 'ar' && 'rtl')}>
        <Search className={cn("absolute top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4", 
          language === 'ar' ? 'right-3' : 'left-3')} />
        <Input
          placeholder={t('reports.searchPatientsPlaceholder')}
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className={cn(language === 'ar' ? 'pr-10 text-right' : 'pl-10')}
          onFocus={() => setShowResults(searchTerm.length > 0)}
        />
      </div>

      {showResults && (
        <Card className="absolute z-10 w-full mt-1 max-h-80 overflow-y-auto">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                {t('common.loading')}...
              </div>
            ) : patients && patients.length > 0 ? (
              <div className="divide-y">
                {patients.map((patient) => (
                  <div
                    key={patient.id}
                    className={cn(
                      "p-4 hover:bg-gray-50 cursor-pointer transition-colors",
                      language === 'ar' && 'text-right'
                    )}
                    onClick={() => handlePatientSelect(patient)}
                  >
                    <div className={cn("flex items-center gap-3", language === 'ar' && 'flex-row-reverse')}>
                      <User className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        <div className="font-medium">{patient.name}</div>
                        <div className="text-sm text-gray-500">
                          {patient.phone && `${t('patients.phone')}: ${patient.phone}`}
                          {patient.phone && ' • '}
                          {t('patients.age')}: {patient.age} • {patient.gender}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4">
                <div className={cn("text-center text-gray-500 mb-3", language === 'ar' && 'text-right')}>
                  {t('reports.noPatientFound')}
                </div>
                <Button 
                  onClick={handleAddNew}
                  className={cn("w-full", language === 'ar' && 'flex-row-reverse')}
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('reports.addNewPatient')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Click outside to close */}
      {showResults && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
};