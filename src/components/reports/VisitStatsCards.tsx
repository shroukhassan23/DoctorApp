
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Users, UserCheck, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface VisitStatsCardsProps {
  visitStats?: {
    totalVisits: number;
    primaryVisits: number;
    followUpVisits: number;
    waitingVisits: number;
  };
}

export const VisitStatsCards = ({ visitStats }: VisitStatsCardsProps) => {
  const { t, language } = useLanguage();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className={cn(language === 'ar' && 'rtl')}>
        <CardContent className="p-6">
          <div className={cn("flex items-center justify-between", language === 'ar' && 'flex-row-reverse')}>
            <div className={cn(language === 'ar' && 'text-right')}>
              <p className="text-sm font-medium text-gray-600">{t('reports.totalVisits')}</p>
              <p className="text-2xl font-bold">{visitStats?.totalVisits || 0}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card className={cn(language === 'ar' && 'rtl')}>
        <CardContent className="p-6">
          <div className={cn("flex items-center justify-between", language === 'ar' && 'flex-row-reverse')}>
            <div className={cn(language === 'ar' && 'text-right')}>
              <p className="text-sm font-medium text-gray-600">{t('reports.primaryConsultations')}</p>
              <p className="text-2xl font-bold text-green-600">{visitStats?.primaryVisits || 0}</p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card className={cn(language === 'ar' && 'rtl')}>
        <CardContent className="p-6">
          <div className={cn("flex items-center justify-between", language === 'ar' && 'flex-row-reverse')}>
            <div className={cn(language === 'ar' && 'text-right')}>
              <p className="text-sm font-medium text-gray-600">{t('reports.followUps')}</p>
              <p className="text-2xl font-bold text-orange-600">{visitStats?.followUpVisits || 0}</p>
            </div>
            <UserCheck className="h-8 w-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>

      <Card className={cn(language === 'ar' && 'rtl')}>
        <CardContent className="p-6">
          <div className={cn("flex items-center justify-between", language === 'ar' && 'flex-row-reverse')}>
            <div className={cn(language === 'ar' && 'text-right')}>
              <p className="text-sm font-medium text-gray-600">{t('reports.waitingVisits')}</p>
              <p className="text-2xl font-bold text-yellow-600">{visitStats?.waitingVisits || 0}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
