import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PatientSearchBar } from './PatientSearchBar';
import { SearchBar } from './SearchBar';
import { Filter, Search, Users, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
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

  const statusOptions = [
    { 
      value: 'all', 
      label: t('visit.allStatuses'), 
      icon: Filter, 
      color: 'bg-gray-100 text-gray-800 border-gray-200' 
    },
    { 
      value: 'waiting', 
      label: t('visit.waiting'), 
      icon: Clock, 
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200' 
    },
    { 
      value: 'completed', 
      label: t('visit.completed'), 
      icon: CheckCircle, 
      color: 'bg-green-100 text-green-800 border-green-200' 
    },
    { 
      value: 'cancelled', 
      label: t('visit.cancelled'), 
      icon: XCircle, 
      color: 'bg-red-100 text-red-800 border-red-200' 
    }
  ];

  const currentStatus = statusOptions.find(option => option.value === statusFilter);

  return (
    <Card className={cn("shadow-lg border-0 bg-white", language === 'ar' && 'rtl')}>
      <CardHeader className="pb-4">
        <CardTitle className={cn("flex items-center gap-3 text-xl font-bold", language === 'ar' && 'flex-row-reverse text-right')}>
          <div className="p-2 bg-[#2463EB] rounded-xl shadow-lg">
            <Filter className="w-6 h-6 text-white" />
          </div>
          {t('reports.search')}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6 relative overflow-visible">
        {/* Search Mode Toggle */}
        <div className="space-y-3">
          <Label className={cn("text-sm font-semibold text-gray-700", language === 'ar' && 'text-right')}>
            Search Mode
          </Label>
          <div className={cn("flex gap-4", language === 'ar' && 'flex-row-reverse')}>
            <label 
              className={cn(
                "relative flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200",
                searchMode === 'visits' 
                  ? 'border-[#2463EB] bg-blue-50 shadow-md' 
                  : 'border-gray-200 bg-white hover:border-gray-300',
                language === 'ar' && 'flex-row-reverse'
              )}
            >
              <input
                type="radio"
                name="searchMode"
                checked={searchMode === 'visits'}
                onChange={() => setSearchMode('visits')}
                className="sr-only"
              />
              <div className={cn(
                "flex items-center justify-center w-5 h-5 rounded-full border-2 transition-colors",
                searchMode === 'visits' ? 'border-[#2463EB] bg-[#2463EB]' : 'border-gray-300'
              )}>
                {searchMode === 'visits' && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
              <div className={cn("flex items-center gap-2", language === 'ar' && 'flex-row-reverse')}>
                <Calendar className="w-5 h-5 text-[#2463EB]" />
                <span className={cn("font-medium text-gray-900", language === 'ar' && 'text-right')}>
                  {t('reports.searchVisits')}
                </span>
              </div>
            </label>

            <label 
              className={cn(
                "relative flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200",
                searchMode === 'patients' 
                  ? 'border-[#2463EB] bg-blue-50 shadow-md' 
                  : 'border-gray-200 bg-white hover:border-gray-300',
                language === 'ar' && 'flex-row-reverse'
              )}
            >
              <input
                type="radio"
                name="searchMode"
                checked={searchMode === 'patients'}
                onChange={() => setSearchMode('patients')}
                className="sr-only"
              />
              <div className={cn(
                "flex items-center justify-center w-5 h-5 rounded-full border-2 transition-colors",
                searchMode === 'patients' ? 'border-[#2463EB] bg-[#2463EB]' : 'border-gray-300'
              )}>
                {searchMode === 'patients' && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
              <div className={cn("flex items-center gap-2", language === 'ar' && 'flex-row-reverse')}>
                <Users className="w-5 h-5 text-[#2463EB]" />
                <span className={cn("font-medium text-gray-900", language === 'ar' && 'text-right')}>
                  {t('reports.searchPatients')}
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Search All Visits Option (for visits mode) */}
        {searchMode === 'visits' && (
          <div className="space-y-3">
            <label 
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200",
                searchAllVisits 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300',
                language === 'ar' && 'flex-row-reverse'
              )}
            >
              <input
                type="checkbox"
                checked={searchAllVisits}
                onChange={(e) => setSearchAllVisits(e.target.checked)}
                className="sr-only"
              />
              <div className={cn(
                "flex items-center justify-center w-5 h-5 rounded border-2 transition-colors",
                searchAllVisits 
                  ? 'border-green-500 bg-green-500' 
                  : 'border-gray-300 bg-white'
              )}>
                {searchAllVisits && (
                  <CheckCircle className="w-3 h-3 text-white" />
                )}
              </div>
              <span className={cn("font-medium text-gray-900", language === 'ar' && 'text-right')}>
                {t('reports.searchAll')}
              </span>
              <Badge variant="secondary" className="ml-auto text-xs">
                All dates
              </Badge>
            </label>
          </div>
        )}

        {/* Search Content Based on Mode */}
        {searchMode === 'visits' ? (
          <div className="space-y-4">
            <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-4", language === 'ar' && 'rtl')}>
              {/* Search Bar */}
              <div className="space-y-2">
                <Label className={cn("text-sm font-semibold text-gray-700 flex items-center gap-2", language === 'ar' && 'text-right flex-row-reverse')}>
                  <Search className="w-4 h-4 text-[#2463EB]" />
                  {t('visit.searchVisit')}
                </Label>
                <SearchBar 
                  searchTerm={searchTerm} 
                  onSearchChange={setSearchTerm}
                  placeholder={`${t('reports.searchPlaceholder')} / ${t('patients.phone')}`}
                />
              </div>
              
              {/* Status Filter */}
              <div className="space-y-2">
                <Label htmlFor="status-filter" className={cn("text-sm font-semibold text-gray-700 flex items-center gap-2", language === 'ar' && 'text-right flex-row-reverse')}>
                  <Filter className="w-4 h-4 text-[#2463EB]" />
                  {t('visit.status')}
                </Label>
                <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                  <SelectTrigger className={cn(
                    "h-12 border-gray-300 bg-gray-50 focus:bg-white focus:border-[#2463EB] focus:ring-[#2463EB]/20 shadow-sm",
                    language === 'ar' && 'text-right'
                  )}>
                    <SelectValue>
                      {currentStatus && (
                        <div className={cn("flex items-center gap-2", language === 'ar' && 'flex-row-reverse')}>
                          <currentStatus.icon className="w-4 h-4" />
                          <span>{currentStatus.label}</span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <SelectItem key={option.value} value={option.value}>
                          <div className={cn("flex items-center gap-2", language === 'ar' && 'flex-row-reverse')}>
                            <Icon className="w-4 h-4" />
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters Summary */}
            <div className={cn("flex flex-wrap items-center gap-2", language === 'ar' && 'flex-row-reverse')}>
              <span className={cn("text-sm font-medium text-gray-600", language === 'ar' && 'text-right')}>
               {t('visit.activeFilters')}
              </span>
              <Badge className={currentStatus?.color}>
                {currentStatus?.label}
              </Badge>
              {searchAllVisits && (
                <Badge variant="secondary">All dates</Badge>
              )}
              {searchTerm && (
                <Badge variant="outline">
                  Search: "{searchTerm}"
                </Badge>
              )}
            </div>
          </div>
        ) : (
          <div style={{marginBottom: "500px"}} className="space-y-2 relative">
            <Label className={cn("text-sm font-semibold text-gray-700 flex items-center gap-2", language === 'ar' && 'text-right flex-row-reverse')}>
              <Users className="w-4 h-4 text-[#2463EB]" />
              Search Patients
            </Label>
            <div className="relative z-50">
              <PatientSearchBar 
                onPatientSelected={onPatientSelected}
                onAddNewPatient={onAddNewPatient}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};