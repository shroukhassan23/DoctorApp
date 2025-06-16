import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { VisitStatusSelector } from './VisitStatusSelector';
import { ViewButton, EditButton, SaveButton } from '@/components/ui/enhanced-button';
import { cn } from '@/lib/utils';
import { 
  Calendar, 
  User, 
  Hash, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface VisitCardProps {
  visit: any;
  onViewDetails: (visit: any) => void;  // For visit details
  onViewPatient?: (patient: any) => void;  // For patient details
  onEditVisit: (visit: any) => void;
  onStatusChangeRequest: (visitId: number, newStatus: string, patientName: string) => void;
}

export const VisitCard = ({
  visit,
  onViewDetails,
  onViewPatient,
  onEditVisit,
  onStatusChangeRequest
}: VisitCardProps) => {
  const { t, language } = useLanguage();

  const statusText = (statusId: number) => {
    const map: Record<number, string> = {
      1: 'waiting',
      2: 'completed',
      3: 'cancelled'
    };
    return map[statusId] || 'waiting';
  };

  const getStatusBadge = (statusId: number) => {
    const status = statusText(statusId);
    const statusConfig = {
      waiting: {
        variant: 'secondary' as const,
        className: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: <Clock className="w-3 h-3" />
      },
      completed: {
        variant: 'secondary' as const,
        className: 'bg-green-100 text-green-800 border-green-200',
        icon: <CheckCircle className="w-3 h-3" />
      },
      cancelled: {
        variant: 'secondary' as const,
        className: 'bg-red-100 text-red-800 border-red-200',
        icon: <XCircle className="w-3 h-3" />
      }
    };

    const config = statusConfig[status] || statusConfig.waiting;
    
    return (
      <Badge variant={config.variant} className={cn("flex items-center gap-1", config.className)}>
        {config.icon}
        {t(`visit.status.${status}`)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className={cn(
      "p-6 border-0 shadow-md hover:shadow-lg transition-all duration-200 bg-white",
      language === 'ar' && 'rtl'
    )}>
      {/* Header */}
      <div className={cn("flex justify-between items-start mb-4", language === 'ar' && 'flex-row-reverse')}>
        <div className={cn("flex items-center gap-3", language === 'ar' && 'flex-row-reverse')}>
          <div className="p-2 bg-[#2463EB] rounded-lg">
            <Hash className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className={cn("font-semibold text-gray-900", language === 'ar' && 'text-right')}>
              {t('visit.visitId')}: {visit.visit_id}
            </h3>
            <p className={cn("text-sm text-gray-600", language === 'ar' && 'text-right')}>
              Medical Visit Record
            </p>
          </div>
        </div>
        {getStatusBadge(visit.status_id)}
      </div>

      {/* Visit Information */}
      <div className="space-y-3 mb-4">
        {/* Patient Name */}
        <div className={cn("flex items-center gap-3", language === 'ar' && 'flex-row-reverse')}>
          <div className="p-1.5 bg-blue-100 rounded">
            <User className="w-3 h-3 text-[#2463EB]" />
          </div>
          <div className="flex-1">
            <span className={cn("text-sm font-semibold text-gray-900", language === 'ar' && 'text-right block')}>
              {visit.name || t('patient.unknown')}
            </span>
          </div>
        </div>

        {/* Visit Date */}
        <div className={cn("flex items-center gap-3", language === 'ar' && 'flex-row-reverse')}>
          <div className="p-1.5 bg-blue-100 rounded">
            <Calendar className="w-3 h-3 text-[#2463EB]" />
          </div>
          <div className="flex-1">
            <span className={cn("text-sm font-semibold text-gray-900", language === 'ar' && 'text-right block')}>
              {formatDate(visit.visit_date)}
            </span>
          </div>
        </div>

        {/* Status Selector */}
        <div className={cn("flex items-center gap-3", language === 'ar' && 'flex-row-reverse')}>
          <div className="p-1.5 bg-blue-100 rounded">
            <AlertCircle className="w-3 h-3 text-[#2463EB]" />
          </div>
          <div className="flex-1">
            <VisitStatusSelector
              visitId={visit.visit_id}
              currentStatus={statusText(visit.status_id)}
              patientName={visit.patient_name || ''}
              onStatusChangeRequest={onStatusChangeRequest}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={cn("flex gap-2 pt-4 border-t border-gray-100", language === 'ar' ? 'justify-start' : 'justify-end')}>
        <ViewButton
          size="sm"
          onClick={() => onViewDetails(visit)}
        >
          View Visit
        </ViewButton>
        
        {onViewPatient && (
          <SaveButton
            size="sm"
            onClick={() => onViewPatient({
              id: visit.patient_id,
              name: visit.name,
              age: visit.age,
              gender: visit.gender,
              phone: visit.phone,
              address: visit.address,
              medical_history: visit.medical_history
            })}
          >
            View Patient
          </SaveButton>
        )}
        
        <EditButton
          size="sm"
          onClick={() => {
            onEditVisit(visit);
            console.log('Edit clicked', visit);
          }}
        >
          Edit
        </EditButton>
      </div>
    </Card>
  );
};