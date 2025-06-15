import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface DateSelectorProps {
  fromDate: string;
  toDate: string;
  onFromDateChange: (date: string) => void;
  onToDateChange: (date: string) => void;
  onSearch: () => void;
}

export const DateSelector = ({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onSearch
}: DateSelectorProps) => {
  const { t, language } = useLanguage();

  return (
    <Card className={cn(language === 'ar' && 'rtl')}>
      <CardHeader>
        <CardTitle className={cn(language === 'ar' && 'text-right')}>
          {t('reports.selectDateRange')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn("flex gap-4 items-end flex-wrap", language === 'ar' && 'flex-row-reverse')}>
          <div>
            <Label htmlFor="from-date" className={cn(language === 'ar' && 'text-right')}>
              {t('reports.from')}
            </Label>
            <Input
              id="from-date"
              type="date"
              value={fromDate}
              onChange={(e) => onFromDateChange(e.target.value)}
              className="w-auto"
            />
          </div>
          <div>
            <Label htmlFor="to-date" className={cn(language === 'ar' && 'text-right')}>
              {t('reports.to')}
            </Label>
            <Input
              id="to-date"
              type="date"
              value={toDate}
              onChange={(e) => onToDateChange(e.target.value)}
              className="w-auto"
            />
          </div>
          <Button onClick={onSearch}>
            {t('common.search')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
