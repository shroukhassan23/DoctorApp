
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { VisitDetail } from './VisitDetail';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PatientInformation } from './patient-detail/PatientInformation';
import { VisitHistory } from './patient-detail/VisitHistory';
import { PatientFiles } from './patient-detail/PatientFiles';

interface PatientDetailProps {
  patient: any;
  onUpdate: () => void;
}

export const PatientDetail = ({ patient, onUpdate }: PatientDetailProps) => {
  const [selectedVisit, setSelectedVisit] = useState<any>(null);

  console.log('PatientDetail - patient data:', patient);

  const { data: visits, refetch: refetchVisits } = useQuery({
    queryKey: ['patient-visits', patient.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patient_visits')
        .select('*')
        .eq('patient_id', patient.id)
        .order('visit_date', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      console.log('Fetched visits:', data);
      return data;
    },
  });

  const { data: files, refetch: refetchFiles } = useQuery({
    queryKey: ['patient-files', patient.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patient_files')
        .select('*')
        .eq('patient_id', patient.id)
        .is('visit_id', null)
        .order('uploaded_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const handleVisitClick = (visit: any) => {
    console.log('Selected visit:', visit);
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
          <TabsTrigger value="visits">Visit History</TabsTrigger>
          <TabsTrigger value="files">Files & Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="visits" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Visit History</h3>
          </div>
          
          <VisitHistory 
            visits={visits} 
            onVisitClick={handleVisitClick}
            onVisitUpdated={handleVisitUpdated}
          />
        </TabsContent>
        
        <TabsContent value="files" className="space-y-4">
          <PatientFiles 
            files={files} 
            patientId={patient.id} 
            onFileUploaded={refetchFiles}
          />
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
