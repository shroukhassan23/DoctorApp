import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchButton } from '@/components/ui/enhanced-button';
import { Calendar, CalendarRange, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface DateSelectorProps {
  fromDate: string;
  toDate: string;
  onFromDateChange: (date: string) => void;
  onToDateChange: (date: string) => void;
  onSearch: () => void;
  loading?: boolean;
}

export const DateSelector = ({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onSearch,
  loading = false
}: DateSelectorProps) => {
  const { t, language } = useLanguage();

  const [dateError, setDateError] = React.useState(false);

  const isValidDateRange = fromDate && toDate && new Date(fromDate) <= new Date(toDate);

  React.useEffect(() => {
    if (!fromDate || !toDate) {
      setDateError(false);
      return;
    }
    setDateError(new Date(fromDate) > new Date(toDate));
  }, [fromDate, toDate]);

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className={cn("shadow-lg border-0 bg-white mb-6", language === 'ar' && 'rtl')}>
      <CardHeader className="pb-4">
        <CardTitle className={cn("flex items-center gap-3 text-xl font-bold", language === 'ar' && 'flex-row-reverse text-right')}>
          <div className="p-2 bg-[#2463EB] rounded-xl shadow-lg">
            <CalendarRange className="w-6 h-6 text-white" />
          </div>
          {t('reports.dateRange')}
        </CardTitle>
      </CardHeader>

      <CardContent className="pb-4 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
          {/* From Date */}
          <div className="space-y-2">
            <Label
              htmlFor="from-date"
              className="text-sm font-semibold text-gray-700 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-[#2463EB]" />
              {t('reports.from')}
            </Label>
            <div className="relative">
              <Input
                id="from-date"
                type="date"
                value={fromDate}
                onChange={(e) => onFromDateChange(e.target.value)}
                className={cn(
                  "h-12 border-gray-300 bg-gray-50 focus:bg-white focus:border-[#2463EB] focus:ring-[#2463EB]/20 shadow-sm transition-colors",
                  dateError && "border-red-300 bg-red-50",
                  language === 'ar' && 'text-right'
                )}
              />
            </div>
          </div>

          {/* To Date */}
          <div className="space-y-2">
            <Label
              htmlFor="to-date"
              className="text-sm font-semibold text-gray-700 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-[#2463EB]" />
                            {t('reports.to')}

            </Label>
            <div className="relative">
              <Input
                id="to-date"
                type="date"
                value={toDate}
                onChange={(e) => onToDateChange(e.target.value)}
                className={cn(
                  "h-12 border-gray-300 bg-gray-50 focus:bg-white focus:border-[#2463EB] focus:ring-[#2463EB]/20 shadow-sm transition-colors",
                  dateError && "border-red-300 bg-red-50",
                  language === 'ar' && 'text-right'
                )}
              />
            </div>
          </div>

          {/* Search Button */}
          <div className="flex justify-start md:justify-end lg:justify-center">
            <SearchButton
              onClick={onSearch}
              loading={loading}
              disabled={!fromDate || !toDate || dateError}
              size="lg"
              className="w-full md:w-auto px-8"
            >
              {t('common.search')}
            </SearchButton>
          </div>
        </div>

        {/* Date Range Summary */}
        {isValidDateRange && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <CalendarRange className="w-4 h-4" />
              <span className="font-medium">
                {t('reports.selectedRange')} {formatDateForDisplay(fromDate)} {t('reports.to')} {formatDateForDisplay(toDate)}
              </span>
            </div>
          </div>
        )}

        {/* Validation Error Message */}
        {dateError && (
          <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-800 font-medium">
                "From" date cannot be later than "To" date
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
