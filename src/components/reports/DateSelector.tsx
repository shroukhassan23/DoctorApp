import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchButton } from '@/components/ui/enhanced-button';
import { Calendar, CalendarRange } from 'lucide-react';
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

  return (
    <Card className={cn("shadow-lg border-0 bg-white", language === 'ar' && 'rtl')}>
      
      <CardContent className="pb-4 space-y-6">
        <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end", language === 'ar' && 'lg:grid-cols-reverse')}>
          {/* From Date */}
          <div className="space-y-2">
            <Label 
              htmlFor="from-date" 
              className={cn("text-sm font-semibold text-gray-700 flex items-center gap-2", language === 'ar' && 'text-right flex-row-reverse')}
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
                  "h-12 border-gray-300 bg-gray-50 focus:bg-white focus:border-[#2463EB] focus:ring-[#2463EB]/20 shadow-sm",
                  language === 'ar' && 'text-right'
                )}
              />
            </div>
          </div>

          {/* To Date */}
          <div className="space-y-2">
            <Label 
              htmlFor="to-date" 
              className={cn("text-sm font-semibold text-gray-700 flex items-center gap-2", language === 'ar' && 'text-right flex-row-reverse')}
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
                  "h-12 border-gray-300 bg-gray-50 focus:bg-white focus:border-[#2463EB] focus:ring-[#2463EB]/20 shadow-sm",
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
              disabled={!fromDate || !toDate}
              size="lg"
              className="w-full md:w-auto px-8"
            >
              {t('common.search')}
            </SearchButton>
          </div>
        </div>

        {/* Date Range Summary */}
        {fromDate && toDate && (
          <div className={cn("mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200", language === 'ar' && 'text-right')}>
            <div className={cn("flex items-center gap-2 text-sm text-blue-800", language === 'ar' && 'flex-row-reverse')}>
              <CalendarRange className="w-4 h-4" />
              <span className="font-medium">
                Selected Range: {fromDate} to {toDate}
              </span>
            </div>
          </div>
        )}

        {/* Validation Message */}
        {fromDate && toDate && new Date(fromDate) > new Date(toDate) && (
          <div className={cn("mt-2 p-3 bg-red-50 rounded-lg border border-red-200", language === 'ar' && 'text-right')}>
            <p className="text-sm text-red-800 font-medium">
              ⚠️ "From" date cannot be later than "To" date
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};