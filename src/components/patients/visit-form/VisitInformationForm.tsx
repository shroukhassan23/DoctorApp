
import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { visitStatusPatientUrl,visitTypesPatientUrl } from '@/components/constants.js';
interface VisitInformationFormProps {
  register: any;
  errors: any;
  setValue: any;
  watch: any;
}

export const VisitInformationForm = ({ register, errors, setValue, watch }: VisitInformationFormProps) => {
  const { t, language } = useLanguage();
const [visitStatuses, setVisitStatuses] = useState<{id: number, value: string, name: string}[]>([]);
const [isLoadingStatuses, setIsLoadingStatuses] = useState(false);
const [visitTypes, setVisitTypes] = useState<{id: number, name: string}[]>([]);
const [isLoadingTypes, setIsLoadingTypes] = useState(false);
useEffect(() => {
  const loadData = async () => {
    try {
      const types = await fetch(visitTypesPatientUrl).then(res => res.json());
      setVisitTypes(types); // هنا نمرر البيانات مباشرة
      
      const statuses = await fetch(visitStatusPatientUrl).then(res => res.json());
      setVisitStatuses(statuses);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  loadData();
}, []);
  return (
    <div className={cn("space-y-4", language === 'ar' && 'rtl')}>
      <h3 className={cn("text-lg font-medium", language === 'ar' && 'text-right')}>{t('visit.details')}</h3>
      
      <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", language === 'ar' && 'rtl')}>
        <div>
          <Label htmlFor="visit_date" className={cn(language === 'ar' && 'text-right')}>{t('visit.date')}</Label>
          <Input
            id="visit_date"
            type="date"
            {...register('visit_date', { required: t('form.required') })}
            className={cn(language === 'ar' && 'text-right')}
          />
          {errors.visit_date && <span className="text-red-500 text-sm">{errors.visit_date.message}</span>}
        </div>

        <div>
          <Label htmlFor="visit_type" className={cn(language === 'ar' && 'text-right')}>{t('visit.type')}</Label>
  <Select
  value={watch('visit_type')}
  onValueChange={(value) => setValue('visit_type', value)}
>
  <SelectTrigger className={cn(language === 'ar' && 'text-right')}>
    <SelectValue 
      placeholder={isLoadingTypes ? t('general.loading') : t('visit.selectType')} 
    />
  </SelectTrigger>
  <SelectContent>
    {isLoadingTypes ? (
      <SelectItem value="loading" disabled>
        {t('general.loading')}...
      </SelectItem>
    ) : (
      <>
        {visitTypes?.map((type) => (
          <SelectItem key={type.id} value={type.id.toString()}>
            {type.name}
          </SelectItem>
        ))}
        {!visitTypes?.length && (
          <SelectItem value="no-data" disabled>
            {t('general.noDataAvailable')}
          </SelectItem>
        )}
      </>
    )}
  </SelectContent>
</Select>
        </div>

        <div>
          <Label htmlFor="status" className={cn(language === 'ar' && 'text-right')}>{t('visit.status')}</Label>
          <Select
  value={watch('status')}
  onValueChange={(value) => setValue('status', value)}
>
  <SelectTrigger className={cn(language === 'ar' && 'text-right')}>
    <SelectValue 
      placeholder={isLoadingStatuses ? t('general.loading') : t('visit.selectStatus')} 
    />
  </SelectTrigger>
  <SelectContent>
    {isLoadingStatuses ? (
      <SelectItem value="loading" disabled>
        {t('general.loading')}...
      </SelectItem>
    ) : (
      <>
        {visitStatuses?.map((status) => (
          <SelectItem key={status.id} value={status.value || status.id.toString()}>
            {status.name}
          </SelectItem>
        ))}
        {!visitStatuses?.length && (
          <SelectItem value="no-data" disabled>
            {t('general.noDataAvailable')}
          </SelectItem>
        )}
      </>
    )}
  </SelectContent>
</Select>
        </div>
      </div>

      <div>
        <Label htmlFor="chief_complaint" className={cn(language === 'ar' && 'text-right')}>{t('visit.chiefComplaint')}</Label>
        <Textarea
          id="chief_complaint"
          placeholder={t('visit.enterChiefComplaint')}
          {...register('chief_complaint')}
          className={cn(language === 'ar' && 'text-right')}
        />
      </div>

      <div>
        <Label htmlFor="diagnosis" className={cn(language === 'ar' && 'text-right')}>{t('visit.diagnosis')}</Label>
        <Textarea
          id="diagnosis"
          placeholder={t('visit.enterDiagnosis')}
          {...register('diagnosis')}
          className={cn(language === 'ar' && 'text-right')}
        />
      </div>

      <div>
        <Label htmlFor="notes" className={cn(language === 'ar' && 'text-right')}>{t('visit.notes')}</Label>
        <Textarea
          id="notes"
          placeholder={t('visit.enterNotes')}
          {...register('notes')}
          className={cn(language === 'ar' && 'text-right')}
        />
      </div>
    </div>
  );
};
