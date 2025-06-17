import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VisitDetail } from './VisitDetail';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PatientInformation } from './patient-detail/PatientInformation';
import { VisitHistory } from './patient-detail/VisitHistory';
import { PatientFiles } from './patient-detail/PatientFiles';
import { getPatientVisitsUrl, getPatientFilesUrl } from '@/components/constants.js';
import { useLanguage } from '@/contexts/LanguageContext';
import { SectionLoading } from '@/components/ui/loading-spinner';

interface PatientDetailProps {
  patient: any;
  onUpdate: () => void;
}

export const PatientDetail = ({ patient, onUpdate }: PatientDetailProps) => {
  const [selectedVisit, setSelectedVisit] = useState<any>(null);
  const { t, language } = useLanguage();
  const { data: visits, isLoading: visitsLoading, refetch: refetchVisits } = useQuery({
    queryKey: ['patient-visits', patient.id],
    queryFn: async () => {
      const response = await fetch(getPatientVisitsUrl(patient.id));
      if (!response.ok) throw new Error('Failed to fetch visits');
      const data = await response.json();
      return data;
    },
  });

  const { data: files, isLoading: filesLoading, refetch: refetchFiles } = useQuery({
    queryKey: ['patient-files', patient.id],
    queryFn: async () => {
      const response = await fetch(getPatientFilesUrl(patient.id));
      if (!response.ok) throw new Error('Failed to fetch files');
      const data = await response.json();
      return data;
    },
  });

  const handleVisitClick = (visit: any) => {
    setSelectedVisit(visit);
  };

  const handleVisitUpdated = () => {
    refetchVisits();
  };

  return (
    <div className="space-y-6">
      <PatientInformation
        patient={patient}
        onUpdate={onUpdate}
        onVisitSaved={refetchVisits}
      />

      <Tabs defaultValue="visits" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="visits">{t('visit.visitHistory')}</TabsTrigger>
          <TabsTrigger value="files">{t('visit.visitDocuments')}</TabsTrigger>
        </TabsList>

        <TabsContent value="visits" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">{t('visit.visitHistory')}</h3>
          </div>

          {visitsLoading ? (
            <SectionLoading text={t('common.loading') || 'Loading visits...'}  variant="dots"  color="green" />
          ) : (
            <VisitHistory
              visits={visits}
              onVisitClick={handleVisitClick}
              onVisitUpdated={handleVisitUpdated}
            />
          )}
        </TabsContent>

        <TabsContent value="files" className="space-y-4">
          {filesLoading ? (
            <SectionLoading text={t('common.loading') || 'Loading files...'}  variant="dots"  color="green" />
          ) : (
            <PatientFiles
              files={files}
              patientId={patient.id}
              onFileUploaded={refetchFiles}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Visit Detail Dialog */}
      {selectedVisit && (
        <Dialog open={!!selectedVisit} onOpenChange={() => setSelectedVisit(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Visit Details - {new Date(selectedVisit.visit_date).toLocaleDateString('en-GB')}</DialogTitle>
            </DialogHeader>
            <VisitDetail visit={selectedVisit} patient={patient} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};