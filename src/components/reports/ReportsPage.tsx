import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
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
    queryKey: ['visit-stats', selectedDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patient_visits')
        .select('visit_type, patient_id, status')
        .eq('visit_date', selectedDate);

      if (error) throw error;

      const primaryVisits = data?.filter(visit => visit.visit_type === 'primary').length || 0;
      const followUpVisits = data?.filter(visit => visit.visit_type === 'follow_up').length || 0;
      const totalVisits = data?.length || 0;
      const waitingVisits = data?.filter(visit => (visit.status || 'waiting') === 'waiting').length || 0;

      return {
        primaryVisits,
        followUpVisits,
        totalVisits,
        waitingVisits
      };
    }
  });

  const { data: visitDetails, refetch: refetchVisits } = useQuery({
    queryKey: ['visit-details', selectedDate, searchAllVisits],
    queryFn: async () => {
      let query = supabase
        .from('patient_visits')
        .select(`
          id,
          visit_type,
          visit_date,
          chief_complaint,
          diagnosis,
          notes,
          status,
          created_at,
          patients!inner(id, name, age, gender, phone, address)
        `)
        .order('visit_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (!searchAllVisits) {
        query = query.eq('visit_date', selectedDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const filteredVisits = visitDetails?.filter(visit => {
    // Status filter
    if (statusFilter !== 'all' && (visit.status || 'waiting') !== statusFilter) {
      return false;
    }

    // Enhanced search filters - includes name, diagnosis, notes, and phone
    const matchesTextSearch = searchText(searchTerm, visit.patients?.name || '') ||
      searchText(searchTerm, visit.diagnosis || '') ||
      searchText(searchTerm, visit.notes || '') ||
      (visit.patients?.phone && visit.patients.phone.includes(searchTerm));

    return !searchTerm || matchesTextSearch;
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
    <div className={cn("container mx-auto p-6 space-y-6", language === 'ar' && 'rtl')}>
      <ReportsPageHeader selectedDate={formatDateToDDMMYYYY(selectedDate)} />

      <DateSelector 
        selectedDate={selectedDate} 
        onDateChange={setSelectedDate} 
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
