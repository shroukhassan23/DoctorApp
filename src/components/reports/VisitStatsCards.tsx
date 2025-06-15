import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Users, UserCheck, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface VisitStatsCardsProps {
  visitStats?: {
    totalVisits: number;
    primaryVisits: number;
    followUpVisits: number;
    waitingVisits: number;
  };
  previousStats?: {
    totalVisits: number;
    primaryVisits: number;
    followUpVisits: number;
    waitingVisits: number;
  };
}

export const VisitStatsCards = ({ visitStats, previousStats }: VisitStatsCardsProps) => {
  const { t, language } = useLanguage();

  // Calculate percentage change
  const calculateChange = (current: number, previous: number) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  const stats = [
    {
      id: 'total',
      title: t('reports.totalVisits'),
      value: visitStats?.totalVisits || 0,
      previousValue: previousStats?.totalVisits || 0,
      icon: FileText,
      bgGradient: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-600',
      iconBg: 'bg-blue-100'
    },
    {
      id: 'primary',
      title: t('reports.primaryConsultations'),
      value: visitStats?.primaryVisits || 0,
      previousValue: previousStats?.primaryVisits || 0,
      icon: Users,
      bgGradient: 'from-green-500 to-green-600',
      bgLight: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-600',
      iconBg: 'bg-green-100'
    },
    {
      id: 'followup',
      title: t('reports.followUps'),
      value: visitStats?.followUpVisits || 0,
      previousValue: previousStats?.followUpVisits || 0,
      icon: UserCheck,
      bgGradient: 'from-orange-500 to-orange-600',
      bgLight: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-600',
      iconBg: 'bg-orange-100'
    },
    {
      id: 'waiting',
      title: t('reports.waitingVisits'),
      value: visitStats?.waitingVisits || 0,
      previousValue: previousStats?.waitingVisits || 0,
      icon: Clock,
      bgGradient: 'from-yellow-500 to-yellow-600',
      bgLight: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-600',
      iconBg: 'bg-yellow-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const changePercentage = calculateChange(stat.value, stat.previousValue);
        const isPositive = changePercentage > 0;
        const isNegative = changePercentage < 0;

        return (
          <Card 
            key={stat.id}
            className={cn(
              "relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0",
              stat.bgLight,
              language === 'ar' && 'rtl'
            )}
          >
            {/* Gradient top border */}
            <div className={cn("h-1 bg-gradient-to-r", stat.bgGradient)} />
            
            <CardContent className="p-6">
              <div className={cn("flex items-center justify-between", language === 'ar' && 'flex-row-reverse')}>
                <div className={cn("space-y-2", language === 'ar' && 'text-right')}>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                    {stat.title}
                  </p>
                  <div className="space-y-1">
                    <p className={cn("text-3xl font-bold", stat.textColor)}>
                      {stat.value.toLocaleString()}
                    </p>
                    
                    {/* Change indicator */}
                    {previousStats && (
                      <div className={cn("flex items-center gap-1 text-xs", language === 'ar' && 'flex-row-reverse')}>
                        {isPositive && (
                          <>
                            <TrendingUp className="w-3 h-3 text-green-500" />
                            <span className="text-green-600 font-medium">
                              +{changePercentage.toFixed(1)}%
                            </span>
                          </>
                        )}
                        {isNegative && (
                          <>
                            <TrendingDown className="w-3 h-3 text-red-500" />
                            <span className="text-red-600 font-medium">
                              {changePercentage.toFixed(1)}%
                            </span>
                          </>
                        )}
                        {!isPositive && !isNegative && (
                          <span className="text-gray-500 font-medium">No change</span>
                        )}
                        <span className="text-gray-500">vs previous</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Icon container */}
                <div className={cn("relative", language === 'ar' && 'order-first')}>
                  <div className={cn("p-4 rounded-xl shadow-md", stat.iconBg)}>
                    <Icon className={cn("w-8 h-8", stat.textColor)} />
                  </div>
                  
                  {/* Pulse animation for waiting visits */}
                  {stat.id === 'waiting' && stat.value > 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse">
                      <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress bar for visual representation */}
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={cn("h-2 rounded-full bg-gradient-to-r transition-all duration-1000", stat.bgGradient)}
                    style={{ 
                      width: `${Math.min((stat.value / Math.max(...stats.map(s => s.value))) * 100, 100)}%` 
                    }}
                  />
                </div>
              </div>

              {/* Additional info */}
              <div className={cn("mt-3 text-xs text-gray-500", language === 'ar' && 'text-right')}>
                {stat.id === 'total' && 'All consultation types'}
                {stat.id === 'primary' && 'New patient visits'}
                {stat.id === 'followup' && 'Return appointments'}
                {stat.id === 'waiting' && 'Pending consultations'}
              </div>
            </CardContent>

            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-20 h-20 opacity-5">
              <Icon className="w-full h-full" />
            </div>
          </Card>
        );
      })}
    </div>
  );
};