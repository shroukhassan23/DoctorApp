
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface DateSelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export const DateSelector = ({ selectedDate, onDateChange }: DateSelectorProps) => {
  const { t, language } = useLanguage();

  return (
    <Card className={cn(language === 'ar' && 'rtl')}>
      <CardHeader>
        <CardTitle className={cn(language === 'ar' && 'text-right')}>{t('reports.selectDate')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn("flex gap-4 items-end", language === 'ar' && 'flex-row-reverse')}>
          <div>
            <Label htmlFor="report-date" className={cn(language === 'ar' && 'text-right')}>{t('reports.reportDate')}</Label>
            <Input
              id="report-date"
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-auto"
            />
          </div>
          <Button onClick={() => onDateChange(new Date().toISOString().split('T')[0])}>
            {t('common.today')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
