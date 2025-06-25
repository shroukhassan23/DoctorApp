import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Filter, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface StatusFiltersProps {
  statusFilter: 'all' | 'waiting' | 'completed' | 'cancelled';
  setStatusFilter: (status: 'all' | 'waiting' | 'completed' | 'cancelled') => void;
}

export const StatusFilters = ({
  statusFilter,
  setStatusFilter
}: StatusFiltersProps) => {
  const { t, language } = useLanguage();

  const statusOptions = [
    {
      value: 'all',
      label: t('visit.allStatuses'),
      icon: Filter,
      color: 'bg-gray-100 text-gray-800 border-gray-200'
    },
    {
      value: 'waiting',
      label: t('visit.waiting'),
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    },
    {
      value: 'completed',
      label: t('visit.completed'),
      icon: CheckCircle,
      color: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      value: 'cancelled',
      label: t('visit.cancelled'),
      icon: XCircle,
      color: 'bg-red-100 text-red-800 border-red-200'
    }
  ];

  const currentStatus = statusOptions.find(option => option.value === statusFilter);

  return (
    <Card className={cn("shadow-lg border-0 bg-white", language === 'ar' && 'rtl')}>
    {/*  <CardHeader className="pb-4">
        <CardTitle className={cn("flex items-center gap-3 text-xl font-bold", language === 'ar' && 'text-right')}>
          {language === 'ar' ? (
            <>
              <span>{t('visit.status')}</span>
              <div className="p-2 bg-[#2463EB] rounded-xl shadow-lg">
                <Filter className="w-4 h-6 text-white" />
              </div>
            </>
          ) : (
            <>
              <div className="p-2 bg-[#2463EB] rounded-xl shadow-lg">
                <Filter className="w-4 h-6 text-white" />
              </div>
              {t('visit.status')}
            </>
          )}
        </CardTitle>
      </CardHeader>*/}

      <CardContent className="space-y-4">
        {/* Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="status-filter" className={cn(
            "text-sm font-semibold text-gray-700 flex items-center gap-2",
            language === 'ar' && 'flex-row-reverse justify-end text-right'
          )}>
            <Filter className="w-4 h-4 text-[#2463EB]" />
            {t('visit.status')}
          </Label>
          <Select dir={language === 'ar' ? 'rtl' : 'ltr'} value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger className={cn(
              "w-50 h-8 border-gray-300 bg-gray-50 focus:bg-white focus:border-[#2463EB] focus:ring-[#2463EB]/20 shadow-sm",
              language === 'ar' && 'text-right'
            )}>
              <SelectValue>
                {currentStatus && (
                  <div className={cn("flex items-center gap-2", language === 'ar' && 'flex-row-reverse')}>
                    <currentStatus.icon className="w-4 h-4" />
                    <span>{currentStatus.label}</span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <SelectItem key={option.value} value={option.value}>
                    <div className={cn("flex items-center gap-2", language === 'ar' && 'flex-row-reverse')}>
                      <Icon className="w-4 h-4" />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Active Filter Summary */}
        <div className={cn("flex flex-wrap items-center gap-2", language === 'ar' && 'flex-row-reverse')}>
          <span className={cn("text-sm font-medium text-gray-600", language === 'ar' && 'text-right')}>
            {t('visit.activeFilters')}
          </span>
          <Badge className={currentStatus?.color}>
            {currentStatus?.label}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};