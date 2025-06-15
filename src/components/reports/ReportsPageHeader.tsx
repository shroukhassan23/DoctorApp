
import React from 'react';
import { CalendarDays, FileText } from 'lucide-react';
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
    <div className={cn("flex items-center justify-between mb-8", language === 'ar' && 'flex-row-reverse rtl')}>
  <div className={cn("flex items-center gap-4", language === 'ar' && 'flex-row-reverse')}>
    <div className="p-3 bg-[#2463EB] rounded-xl shadow-lg">
      <FileText className="w-7 h-7 text-white" />
    </div>
    <div>
      <h1 className={cn("text-3xl font-bold text-gray-900", language === 'ar' && 'text-right')}>
        {t('reports.title')}
      </h1>
      <p className={cn("text-gray-600 mt-1", language === 'ar' && 'text-right')}>
        Generate and view medical reports and analytics
      </p>
    </div>
  </div>

  <div className={cn("flex items-center gap-3 px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm", language === 'ar' && 'flex-row-reverse')}>
    <CalendarDays className="h-5 w-5 text-[#2463EB]" />
    <div className={cn("text-sm", language === 'ar' && 'text-right')}>
      <span className="font-medium text-gray-700">Selected Date:</span>
      <span className="ml-2 text-gray-600">
        {selectedDate ? formatDate(selectedDate) : 'No date selected'}
      </span>
    </div>
  </div>
</div>
  );
};
