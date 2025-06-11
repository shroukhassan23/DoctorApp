
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PatientSearchBar } from './PatientSearchBar';
import { SearchBar } from './SearchBar';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface ReportsFiltersProps {
  searchMode: 'visits' | 'patients';
  setSearchMode: (mode: 'visits' | 'patients') => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchAllVisits: boolean;
  setSearchAllVisits: (value: boolean) => void;
  statusFilter: 'all' | 'waiting' | 'completed' | 'cancelled';
  setStatusFilter: (status: 'all' | 'waiting' | 'completed' | 'cancelled') => void;
  onPatientSelected: (patient: any) => void;
  onAddNewPatient: () => void;
}

export const ReportsFilters = ({
  searchMode,
  setSearchMode,
  searchTerm,
  setSearchTerm,
  searchAllVisits,
  setSearchAllVisits,
  statusFilter,
  setStatusFilter,
  onPatientSelected,
  onAddNewPatient
}: ReportsFiltersProps) => {
  const { t, language } = useLanguage();

  return (
    <div className="space-y-4">
      <div className={cn("flex items-center gap-4", language === 'ar' && 'flex-row-reverse')}>
        <div className={cn("flex items-center space-x-2", language === 'ar' && 'flex-row-reverse space-x-reverse')}>
          <input
            type="radio"
            id="searchVisits"
            name="searchMode"
            checked={searchMode === 'visits'}
            onChange={() => setSearchMode('visits')}
            className="rounded"
          />
          <label htmlFor="searchVisits" className={cn("text-sm", language === 'ar' && 'text-right')}>
            {t('reports.searchVisits')}
          </label>
        </div>
        
        <div className={cn("flex items-center space-x-2", language === 'ar' && 'flex-row-reverse space-x-reverse')}>
          <input
            type="radio"
            id="searchPatients"
            name="searchMode"
            checked={searchMode === 'patients'}
            onChange={() => setSearchMode('patients')}
            className="rounded"
          />
          <label htmlFor="searchPatients" className={cn("text-sm", language === 'ar' && 'text-right')}>
            {t('reports.searchPatients')}
          </label>
        </div>

        {searchMode === 'visits' && (
          <div className={cn("flex items-center space-x-2", language === 'ar' && 'flex-row-reverse space-x-reverse')}>
            <input
              type="checkbox"
              id="searchAll"
              checked={searchAllVisits}
              onChange={(e) => setSearchAllVisits(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="searchAll" className={cn("text-sm", language === 'ar' && 'text-right')}>
              {t('reports.searchAll')}
            </label>
          </div>
        )}
      </div>

      {searchMode === 'visits' ? (
        <div className="space-y-4">
          <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", language === 'ar' && 'rtl')}>
            <div>
              <SearchBar 
                searchTerm={searchTerm} 
                onSearchChange={setSearchTerm}
                placeholder={`${t('reports.searchPlaceholder')} / ${t('patients.phone')}`}
              />
            </div>
            
            <div>
              <Label htmlFor="status-filter" className={cn(language === 'ar' && 'text-right')}>
                {t('visit.status')}
              </Label>
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className={cn(language === 'ar' && 'text-right')}>
                  <SelectValue placeholder={t('visit.selectStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('visit.allStatuses')}</SelectItem>
                  <SelectItem value="waiting">{t('visit.waiting')}</SelectItem>
                  <SelectItem value="completed">{t('visit.completed')}</SelectItem>
                  <SelectItem value="cancelled">{t('visit.cancelled')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      ) : (
        <PatientSearchBar 
          onPatientSelected={onPatientSelected}
          onAddNewPatient={onAddNewPatient}
        />
      )}
    </div>
  );
};
