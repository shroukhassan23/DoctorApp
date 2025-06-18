import React from 'react';
import { CalendarDays, FileText } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface ReportsPageHeaderProps {
  fromDate: string;
  toDate: string;
}

export const ReportsPageHeader = ({ fromDate, toDate }: ReportsPageHeaderProps) => {
  const { t, language } = useLanguage();

  const formatDateRange = (from: string, to: string) => {
    try {
      if (!from || !to) return 'No date selected';

      const fromDate = new Date(from);
      const toDate = new Date(to);

      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        return 'Invalid Date';
      }

      const formatOptions: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      };

      const locale = language === 'ar' ? 'ar-EG' : 'en-US';
      const fromFormatted = fromDate.toLocaleDateString(locale, formatOptions);
      const toFormatted = toDate.toLocaleDateString(locale, formatOptions);

      // If same date, show only once
      if (from === to) {
        return fromFormatted;
      }

      return `${fromFormatted} - ${toFormatted}`;
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid Date';
    }
  };

  return (
    <div className={cn("flex items-center justify-between mb-8", language === 'ar' && 'flex-row-reverse')}>
      <div className="flex items-center gap-4">
        {language === 'ar' ? (
          <>
            <div className={cn("order-2", language === 'ar' && 'order-1')}>
              <div className="p-3 bg-[#2463EB] rounded-xl shadow-lg">
                <FileText className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className={cn("order-1", language === 'ar' && 'order-2')}>
              <h1 className={cn("text-3xl font-bold text-gray-900", language === 'ar' && 'text-right')}>
                {t('reports.title')}
              </h1>
              <p className={cn("text-gray-600 mt-1", language === 'ar' && 'text-right')}>
                {t('reports.generate')}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="p-3 bg-[#2463EB] rounded-xl shadow-lg">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t('reports.title')}
              </h1>
              <p className="text-gray-600 mt-1">
                {t('reports.generate')}
              </p>
            </div>
          </>
        )}
      </div>

      <div className={cn(
        "flex items-center gap-3 px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm",
        language === 'ar' && 'order-first flex-row-reverse'
      )}>
        <CalendarDays className="h-5 w-5 text-[#2463EB]" />
        <div className={cn("text-sm", language === 'ar' && 'text-right')}>
          <span className="font-medium text-gray-700">{t('reports.selectedRange')}:</span>
          <span className={cn("text-gray-600", language === 'ar' ? 'mr-2' : 'ml-2')}>
            {formatDateRange(fromDate, toDate)}
          </span>
        </div>
      </div>
    </div>
  );
};