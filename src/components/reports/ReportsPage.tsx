import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { ReportsPageHeader } from './ReportsPageHeader';
import { DateSelector } from './DateSelector';
import { VisitStatsCards } from './VisitStatsCards';
import { ReportsFilters } from './ReportsFilters';
import { ReportsDialogs } from './ReportsDialogs';
import { VisitList } from './VisitList';
import { formatDateToDDMMYYYY } from '@/lib/dateUtils';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { searchText } from '@/lib/arabicUtils';
import { SectionLoading, CardLoading } from '@/components/ui/loading-spinner';


export const ReportsPage = () => {
  const today = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchAllVisits, setSearchAllVisits] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<any>(null);
  const [editingVisit, setEditingVisit] = useState<any>(null);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [searchMode, setSearchMode] = useState<'visits' | 'patients'>('visits');
  const [statusFilter, setStatusFilter] = useState<'all' | 'waiting' | 'completed' | 'cancelled'>('waiting');
  const [viewingPatient, setViewingPatient] = useState<any>(null);
  const { toast } = useToast();
  const { t, language } = useLanguage();

  useEffect(() => {
    console.log('ReportsPage: searchTerm changed to:', searchTerm);
  }, [searchTerm]);

  const { data: visitStats, isLoading, refetch } = useQuery({
    queryKey: ['visit-stats', fromDate, toDate],
    queryFn: async () => {
      const response = await fetch(`http://localhost:3003/reports/visit-stats?from=${fromDate}&to=${toDate}`);
      if (!response.ok) throw new Error('Failed to fetch visit stats');
      return await response.json();
    }
  });


  const { data: visitDetails, refetch: refetchVisits } = useQuery({
    queryKey: ['visit-details', fromDate, toDate, searchAllVisits],
    queryFn: async () => {
      const url = searchAllVisits
        ? 'http://localhost:3003/reports/visits/all'
        : `http://localhost:3003/reports/visits?from=${fromDate}&to=${toDate}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch visit details');
      return await response.json();
    }
  });

  const statusMap: Record<number, string> = {
    1: 'waiting',
    2: 'completed',
    3: 'cancelled'
  };

  const filteredVisits = visitDetails?.filter(visit => {
    const statusText = statusMap[visit.status_id] || 'waiting';
    if (statusFilter !== 'all' && statusText !== statusFilter) {
      return false;
    }

    // Enhanced search filters - includes name, diagnosis, notes, and phone
    const matchesTextSearch = searchText(searchTerm, visit.name || '') ||
      searchText(searchTerm, visit.diagnosis || '') ||
      searchText(searchTerm, visit.notes || '') ||
      (visit.phone && visit.phone.includes(searchTerm));

    const result = !searchTerm || matchesTextSearch;

    if (searchTerm) {
      console.log('Filtering visit:', visit.name, 'searchTerm:', searchTerm, 'matches:', result);
    }

    return result;
  }) || [];

  const handleEditVisit = (visit: any) => {
    setEditingVisit(visit);
  };

  const handleVisitUpdated = () => {
    refetchVisits();
    setEditingVisit(null);
    refetch();
    toast({ title: t('reports.visitUpdated') });
  };

  const handlePatientSelected = (patient: any) => {
    setSelectedPatient(patient);
  };

  const handleAddNewPatient = () => {
    setShowNewPatientForm(true);
  };

  const handlePatientSaved = () => {
    setShowNewPatientForm(false);
    setSelectedPatient(null);
    toast({ title: t('patients.addedSuccess') });
  };

  const handleVisitSaved = () => {
    setSelectedPatient(null);
    refetch();
    refetchVisits();
    toast({ title: t('visit.addedSuccess') });
  };

  const handleStatusUpdated = () => {
    refetch();
    refetchVisits();
  };

  const handleViewPatient = (patient: any) => {
    setViewingPatient(patient);
  };

  return (
    <div className={cn("p-6", language === 'ar' && "rtl")}>
      <ReportsPageHeader fromDate={fromDate} toDate={toDate} />


      <DateSelector
        fromDate={fromDate}
        toDate={toDate}
        onFromDateChange={setFromDate}
        onToDateChange={setToDate}
        onSearch={() => {
          refetch();
          refetchVisits();
        }}
      />


      <div className="mb-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardLoading key={i} lines={2} />
            ))}
          </div>
        ) : (
          <VisitStatsCards visitStats={visitStats} />
        )}
      </div>


      {isLoading ? (
        <div className="mb-6">
          <CardLoading lines={4}  />
        </div>
      ) : (
        <div className="mb-6">
        <ReportsFilters
          searchMode={searchMode}
          setSearchMode={setSearchMode}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchAllVisits={searchAllVisits}
          setSearchAllVisits={setSearchAllVisits}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onPatientSelected={handlePatientSelected}
          onAddNewPatient={handleAddNewPatient}
        />
        </div>
      )}

      {searchMode === 'visits' && (
        <VisitList
          visits={filteredVisits}
          isLoading={isLoading}
          searchTerm={searchTerm}
          onViewVisit={setSelectedVisit}
          onEditVisit={handleEditVisit}
          onVisitUpdated={handleStatusUpdated}
          onViewPatient={handleViewPatient}
        />
      )}

      <ReportsDialogs
        selectedVisit={selectedVisit}
        setSelectedVisit={setSelectedVisit}
        editingVisit={editingVisit}
        setEditingVisit={setEditingVisit}
        selectedPatient={selectedPatient}
        setSelectedPatient={setSelectedPatient}
        showNewPatientForm={showNewPatientForm}
        setShowNewPatientForm={setShowNewPatientForm}
        viewingPatient={viewingPatient}
        setViewingPatient={setViewingPatient}
        onVisitUpdated={handleVisitUpdated}
        onVisitSaved={handleVisitSaved}
        onPatientSaved={handlePatientSaved}
      />
    </div>
  );
};