import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import DatePicker from 'react-datepicker';

interface DailyDateSelectorProps {
  reportDate: string;
  onReportDateChange: (date: string) => void;
  onSearch: () => void;
  loading?: boolean;
}

export const DailyDateSelector = ({
  reportDate,
  onReportDateChange,
  onSearch,
  loading = false
}: DailyDateSelectorProps) => {
  const { t, language } = useLanguage();

  const formatDateForDisplay = (isoDate: string) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleDateInputChange = (input: string) => {
    const [day, month, year] = input.split('/');
    if (day && month && year) {
      const isoString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      onReportDateChange(isoString);
      setTimeout(onSearch, 100);
    }
  };

  return (
    <Card className={cn("shadow-lg border-0 bg-white mb-6", language === 'ar' && 'rtl')}>
      <CardHeader className="pb-4">
        <CardTitle className={cn("flex items-center gap-3 text-xl font-bold", language === 'ar' && 'text-right')}>
          {language === 'ar' ? (
            <>
              <span>{t('reports.reportDate') || 'تاريخ التقرير'}</span>
              <div className="p-2 bg-[#2463EB] rounded-xl shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </>
          ) : (
            <>
              <div className="p-2 bg-[#2463EB] rounded-xl shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              {t('reports.reportDate') || 'Report Date'}
            </>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="pb-4 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="space-y-2 w-full sm:w-auto">
            <Label
              htmlFor="report-date"
              className={cn(
                "text-sm font-semibold text-gray-700 flex items-center gap-2",
                language === 'ar' && 'flex-row-reverse justify-end text-right'
              )}
            >
              <Calendar className="w-4 h-4 text-[#2463EB]" />
              {t('reports.selectDate') || 'اختر التاريخ'}
            </Label>
            <div className="relative">
              <DatePicker
  selected={reportDate ? new Date(reportDate) : null}
  onChange={(date: Date | null) => {
    if (date) {
      const isoString = date.toISOString().split('T')[0];
      onReportDateChange(isoString);
      setTimeout(onSearch, 100);
    }
  }}
  dateFormat="dd/MM/yyyy"
  placeholderText="DD/MM/YYYY"
  className={cn(
    "h-12 w-full sm:w-48 border-gray-300 bg-gray-50 focus:bg-white focus:border-[#2463EB] focus:ring-[#2463EB]/20 shadow-sm transition-colors",
    language === 'ar' && 'text-right'
  )}
  popperClassName="date-picker-popper"
  popperPlacement="bottom-start"
  portalId="date-picker-portal"
/>

            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
