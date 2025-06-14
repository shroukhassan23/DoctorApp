
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useVisitData } from '@/hooks/useVisitData';
import { VisitInformation } from './visit-detail/VisitInformation';
import { PrescriptionDetails } from './visit-detail/PrescriptionDetails';
import { VisitFiles } from './visit-detail/VisitFiles';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface VisitDetailProps {
  visit: any;
  patient: any;
}

export const VisitDetail = ({ visit, patient }: VisitDetailProps) => {
  const { t, language } = useLanguage();
  
  // Debug logging to see what data we have

  const { prescription, files, isLoadingPrescription, isLoadingFiles } = useVisitData(visit.id);

  return (
    <div className={cn("space-y-6", language === 'ar' && "rtl")}>
      {/* Always show visit information */}
      <VisitInformation visit={visit} />
      
      {/* Show prescription details if they exist */}
      {!isLoadingPrescription && prescription && (
        <PrescriptionDetails prescription={prescription} />
      )}
      
      {/* Show files if they exist */}
      {!isLoadingFiles && files && files.length > 0 && (
        <VisitFiles files={files} />
      )}

      {/* Show loading states */}
      {(isLoadingPrescription || isLoadingFiles) && (
        <Card>
          <CardContent className="pt-6">
            <p className={cn("text-gray-500 text-center", language === 'ar' && 'text-right')}>{t('visit.loadingDetails')}</p>
          </CardContent>
        </Card>
      )}

      {/* Show message when no additional data exists */}
      {!isLoadingPrescription && !isLoadingFiles && !prescription && (!files || files.length === 0) && (
        <Card>
          <CardContent className="pt-6">
            <p className={cn("text-gray-500 text-center", language === 'ar' && 'text-right')}>{t('visit.noPrescriptionFiles')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
