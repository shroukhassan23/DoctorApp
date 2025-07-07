import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { ReportsPageHeader } from './ReportsPageHeader';
import { DailyDateSelector } from './DailyDateSelector';
import { VisitStatsCards } from './VisitStatsCards';
import { StatusFilters } from './statusFilter';
import { ReportsDialogs } from './ReportsDialogs';
import { VisitList } from './VisitList';
import { formatDateToDDMMYYYY } from '@/lib/dateUtils';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { searchText } from '@/lib/arabicUtils';
import { SectionLoading, CardLoading } from '@/components/ui/loading-spinner';
import { reportsTestUrl, reportsVisitStatsUrl, reportsVisitsUrl } from '@/components/constants.js';


const API_BASE_URL = 'http://localhost:3003';

export const DailyReportsPage = () => {
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
    console.log('🔍 ReportsPage: searchTerm changed to:', searchTerm);
  }, [searchTerm]);

  // Test connection first
  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch(reportsTestUrl);
        const data = await response.json();
        console.log('✅ Service connection test:', data);
      } catch (error) {
        console.error('❌ Service connection failed:', error);
      }
    };
    testConnection();
  }, []);

  const { data: visitStats, isLoading: statsLoading, refetch, error: statsError } = useQuery({
    queryKey: ['visit-stats', fromDate, toDate],
    queryFn: async () => {
      const url = `${reportsVisitStatsUrl}?from=${fromDate}&to=${toDate}`;
      console.log('📊 Fetching visit stats from:', url);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch visit stats: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      console.log('📊 Visit stats received:', data);
      return data;
    },
    retry: 3,
    retryDelay: 1000
  });

  const { data: visitDetails, isLoading: visitsLoading, refetch: refetchVisits, error: visitsError } = useQuery({
    queryKey: ['visit-details', fromDate, toDate, searchAllVisits],
    queryFn: async () => {
      const url = `${reportsVisitsUrl}?from=${fromDate}&to=${toDate}`;
      console.log('📋 Fetching visit details from:', url);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch visit details: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      console.log('📋 Visit details received:', data);
      return data;
    },
    retry: 3,
    retryDelay: 1000
  });

  const isLoading = statsLoading || visitsLoading;

  // Show errors in console
  useEffect(() => {
    if (statsError) {
      console.error('❌ Stats Error:', statsError);
    }
    if (visitsError) {
      console.error('❌ Visits Error:', visitsError);
    }
  }, [statsError, visitsError]);

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
      console.log('🔍 Filtering visit:', visit.name, 'searchTerm:', searchTerm, 'matches:', result);
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

      <DailyDateSelector
        reportDate={fromDate}
        onSearch={() => {
          console.log('🔍 Manual search triggered');
          refetch();
          refetchVisits();
        }}
        onReportDateChange={(date: string) => {
          console.log('📅 Date changed to:', date);
          setFromDate(date);
          setToDate(date);
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

      {/* Debug Info - شيل دا في الإنتاج */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-4 bg-gray-100 rounded">
          <h3 className="font-bold">Debug Info:</h3>
          <p>Stats Loading: {statsLoading ? 'Yes' : 'No'}</p>
          <p>Visits Loading: {visitsLoading ? 'Yes' : 'No'}</p>
          <p>Stats Error: {statsError ? statsError.message : 'None'}</p>
          <p>Visits Error: {visitsError ? visitsError.message : 'None'}</p>
          <p>Visit Stats: {JSON.stringify(visitStats)}</p>
          <p>Visit Details Count: {visitDetails?.length || 0}</p>
        </div>
      )}

      {isLoading ? (
        <div className="mb-6">
          <CardLoading lines={4} />
        </div>
      ) : (
        <div className="mb-6">
          <StatusFilters
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
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