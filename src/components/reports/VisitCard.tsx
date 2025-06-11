
import React from 'react';
import { Calendar, Eye, Pencil, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { VisitStatusSelector } from './VisitStatusSelector';

interface VisitCardProps {
  visit: any;
  onViewDetails: (patient: any) => void;
  onEditVisit: (visit: any) => void;
  onStatusChangeRequest: (visitId: string, newStatus: string, patientName: string) => void;
}

export const VisitCard = ({ 
  visit, 
  onViewDetails, 
  onEditVisit, 
  onStatusChangeRequest 
}: VisitCardProps) => {
  const { t, language } = useLanguage();

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'HH:mm');
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return t('visit.completed');
      case 'cancelled':
        return t('visit.cancelled');
      default:
        return t('visit.waiting');
    }
  };

  return (
    <Card className={cn("hover:bg-gray-50 transition-colors", language === 'ar' && 'rtl')}>
      <CardContent className="pt-4">
        <div className={cn("flex items-start justify-between", language === 'ar' && 'flex-row-reverse')}>
          <div className="space-y-2 w-full cursor-pointer" onClick={() => onViewDetails(visit.patients)}>
            <div className={cn("flex items-center justify-between", language === 'ar' && 'flex-row-reverse')}>
              <div className={cn("flex items-center gap-3", language === 'ar' && 'flex-row-reverse')}>
                <div className={cn("flex items-center text-sm text-gray-600", language === 'ar' && 'flex-row-reverse')}>
                  <Calendar className="w-4 h-4 mr-2" />
                  {formatDate(visit.visit_date)}
                </div>
                <h3 className={cn("font-medium", language === 'ar' && 'text-right')}>{visit.patients?.name}</h3>
                <span className={cn(`px-2 py-1 rounded-full text-xs font-medium`, 
                  visit.visit_type === 'primary' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-orange-100 text-orange-700',
                  language === 'ar' && 'text-right')}>
                  {visit.visit_type === 'primary' ? t('visit.primaryConsultation') : t('visit.followUp')}
                </span>
              </div>
              
              {/* Status moved to the right side */}
              <span className={cn(`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(visit.status || 'waiting')}`, 
                language === 'ar' && 'text-right')}>
                {getStatusText(visit.status || 'waiting')}
              </span>
            </div>

            <div className={cn("flex items-center text-sm text-gray-500", language === 'ar' && 'flex-row-reverse')}>
              <Clock className="w-4 h-4 mr-2" />
              <span>{formatDateTime(visit.created_at)}</span>
            </div>
            
            {/* Patient Demographics */}
            <div className={cn("text-sm", language === 'ar' && 'text-right')}>
              <span className="font-medium">{t('patients.age')}:</span> {visit.patients?.age} • 
              <span className="font-medium ml-2">{t('patients.gender')}:</span> {visit.patients?.gender}
              {visit.patients?.address && (
                <>
                  • <span className="font-medium ml-2">{t('patients.address')}:</span> {visit.patients.address.length > 50 ? `${visit.patients.address.substring(0, 50)}...` : visit.patients.address}
                </>
              )}
            </div>
            
            {visit.diagnosis && (
              <div className={cn("text-sm", language === 'ar' && 'text-right')}>
                <span className="font-medium">{t('visit.diagnosis')}:</span> {visit.diagnosis.length > 100 ? `${visit.diagnosis.substring(0, 100)}...` : visit.diagnosis}
              </div>
            )}
          </div>
          
          <div className={cn("flex flex-col items-center space-y-3 ml-4 min-w-fit", language === 'ar' && 'mr-4 ml-0')}>
            <VisitStatusSelector
              visitId={visit.id}
              currentStatus={visit.status || 'waiting'}
              patientName={visit.patients?.name || 'Unknown Patient'}
              onStatusChangeRequest={onStatusChangeRequest}
            />
            
            <div className={cn("flex items-center space-x-2", language === 'ar' && 'flex-row-reverse space-x-reverse')}>
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(visit.patients);
                }}
              >
                <Eye className="w-4 h-4 mr-2" />
                {t('reports.viewDetails')}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditVisit(visit);
                }}
              >
                <Pencil className="w-4 h-4 mr-2" />
                {t('common.edit')}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
