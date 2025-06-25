import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchButton } from '@/components/ui/enhanced-button';
import { Calendar, CalendarRange, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";

// Custom styles to ensure DatePicker appears above all elements
const datePickerStyles = `
  .react-datepicker-wrapper {
    position: relative;
    z-index: 1000;
  }
  .react-datepicker-popper {
    z-index: 9999 !important;
    position: fixed !important;
  }
  .react-datepicker {
    z-index: 9999 !important;
    border: 1px solid #e5e7eb !important;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
    font-family: inherit !important;
  }
  .react-datepicker__triangle {
    z-index: 9999 !important;
  }
  .react-datepicker__header {
    background-color: #f9fafb !important;
    border-bottom: 1px solid #e5e7eb !important;
  }
  .react-datepicker__current-month {
    color: #374151 !important;
    font-weight: 600 !important;
  }
  .react-datepicker__day--selected {
    background-color: #2463EB !important;
  }
  .react-datepicker__day--selected:hover {
    background-color: #1d4ed8 !important;
  }
  .react-datepicker__day:hover {
    background-color: #eff6ff !important;
  }
`;

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
  
  // Convert string dates to Date objects for DatePicker
  const fromDateObj = fromDate ? new Date(fromDate) : null;
  const toDateObj = toDate ? new Date(toDate) : null;

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

  // Format date for server (YYYY-MM-DD)
  const formatDateForServer = (date: Date) => {
    return format(date, 'yyyy-MM-dd');
  };

  const handleFromDateChange = (date: Date) => {
    if (date) {
      const formattedDate = formatDateForServer(date);
      onFromDateChange(formattedDate);
    } else {
      onFromDateChange('');
    }
  };

  const handleToDateChange = (date: Date) => {
    if (date) {
      const formattedDate = formatDateForServer(date);
      onToDateChange(formattedDate);
    } else {
      onToDateChange('');
    }
  };

  return (
    <>
      {/* Inject custom styles */}
      <style dangerouslySetInnerHTML={{ __html: datePickerStyles }} />
      
      {/* Portal container for DatePicker */}
      <div id="date-picker-portal"></div>
      
      <Card className={cn("shadow-lg border-0 bg-white mb-6", language === 'ar' && 'rtl')}>
        <CardHeader className="pb-4">
        <CardTitle className={cn("flex items-center gap-3 text-xl font-bold", language === 'ar' && 'text-right')}>
          {language === 'ar' ? (
            <>
              <span>{t('reports.dateRange')}</span>
              <div className="p-2 bg-[#2463EB] rounded-xl shadow-lg">
                <CalendarRange className="w-6 h-6 text-white" />
              </div>
            </>
          ) : (
            <>
              <div className="p-2 bg-[#2463EB] rounded-xl shadow-lg">
                <CalendarRange className="w-6 h-6 text-white" />
              </div>
              {t('reports.dateRange')}
            </>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="pb-4 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 items-end">
          {/* From Date */}
          <div className="space-y-2">
            <Label
              htmlFor="from-date"
              className={cn(
                "text-sm font-semibold text-gray-700 flex items-center gap-2",
                language === 'ar' && 'flex-row-reverse justify-end text-right'
              )}
            >
              <Calendar className="w-4 h-4 text-[#2463EB]" />
              {t('reports.from')}
            </Label>
            <div className="relative z-[1000]">
              <DatePicker
                selected={fromDateObj}
                onChange={handleFromDateChange}
                dateFormat="dd/MM/yyyy"
                placeholderText="DD/MM/YYYY"
                className="w-50 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2463EB] focus:border-transparent"
                maxDate={toDateObj || undefined}
                popperClassName="date-picker-popper"
                popperPlacement="bottom-start"
                portalId="date-picker-portal"
              />
            </div>
          </div>

          {/* To Date */}
          <div className="space-y-2">
            <Label
              htmlFor="to-date"
              className={cn(
                "text-sm font-semibold text-gray-700 flex items-center gap-2",
                language === 'ar' && 'flex-row-reverse justify-end text-right'
              )}
            >
              <Calendar className="w-4 h-4 text-[#2463EB]" />
              {t('reports.to')}
            </Label>
            <div className="relative z-[1000]">
              <DatePicker
                selected={toDateObj}
                onChange={handleToDateChange}
                dateFormat="dd/MM/yyyy"
                placeholderText="DD/MM/YYYY"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2463EB] focus:border-transparent"
                minDate={fromDateObj || undefined}
                popperClassName="date-picker-popper"
                popperPlacement="bottom-start"
                portalId="date-picker-portal"
              />
            </div>
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
    </>
  );
};