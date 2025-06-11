
import React from 'react';
import { CalendarDays } from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface ReportsPageHeaderProps {
  selectedDate: string;
}

export const ReportsPageHeader = ({ selectedDate }: ReportsPageHeaderProps) => {
  const { t, language } = useLanguage();

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (isValid(date)) {
        return format(date, 'EEEE, dd/MM/yyyy');
      }
      return 'Invalid Date';
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid Date';
    }
  };

  return (
    <div className={cn("flex items-center justify-between", language === 'ar' && 'flex-row-reverse')}>
      <h1 className={cn("text-3xl font-bold", language === 'ar' && 'text-right')}>{t('reports.title')}</h1>
      <div className={cn("flex items-center gap-2", language === 'ar' && 'flex-row-reverse')}>
        <CalendarDays className="h-5 w-5 text-gray-500" />
        <span className={cn("text-sm text-gray-500", language === 'ar' && 'text-right')}>
          {formatDate(selectedDate)}
        </span>
      </div>
    </div>
  );
};
