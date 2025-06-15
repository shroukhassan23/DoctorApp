import React, { useState } from 'react';
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

  const filteredVisits = visitDetails?.filter(visit => {
    // Status filter
    if (statusFilter !== 'all' && (visit.status || 'waiting') !== statusFilter) {
      return false;
    }

    // Enhanced search filters - includes name, diagnosis, notes, and phone
    const matchesTextSearch = searchText(searchTerm, visit.patient_name || '') ||
      searchText(searchTerm, visit.diagnosis || '') ||
      searchText(searchTerm, visit.notes || '') ||
      (visit.patient_phone && visit.patient_phone.includes(searchTerm));

    return !searchTerm || matchesTextSearch;
  }) || [];

const handleEditVisit = (visit: any) => {
  setEditingVisit({
    ...visit,
    patient: {
      name: visit.patient_name || '',
    },
  });
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
     <ReportsPageHeader selectedDate={`${formatDateToDDMMYYYY(fromDate)} - ${formatDateToDDMMYYYY(toDate)}`} />


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


      <VisitStatsCards visitStats={visitStats} />

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