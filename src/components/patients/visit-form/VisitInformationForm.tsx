import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { visitStatusPatientUrl, visitTypesPatientUrl } from '@/components/constants.js';
import { SimpleHistoryTextarea } from '@/components/prescriptions/SimpleHistoryTextarea';
import { Calendar, Activity, Stethoscope, FileText, ClipboardList, AlertCircle } from 'lucide-react';

interface VisitInformationFormProps {
  register: any;
  errors: any;
  setValue: any;
  watch: any;
  visitTypes?: any[];
  visitStatuses?: any[];
}

export const VisitInformationForm = ({
  register,
  errors,
  setValue,
  watch,
  visitTypes: propVisitTypes,
  visitStatuses: propVisitStatuses
}: VisitInformationFormProps) => {
  const { t, language } = useLanguage();
  const [visitStatuses, setVisitStatuses] = useState<{ id: number, name: string }[]>([]);
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(false);
  const [visitTypes, setVisitTypes] = useState<{ id: number, name: string }[]>([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);

  useEffect(() => {
    // Always use props data if available
    if (propVisitTypes && propVisitTypes.length > 0) {
      setVisitTypes(propVisitTypes);
    }

    if (propVisitStatuses && propVisitStatuses.length > 0) {
      setVisitStatuses(propVisitStatuses);
    }
  }, [propVisitTypes, propVisitStatuses]);

  return (
    <div className={cn("w-full space-y-6", language === 'ar' && 'rtl')}>
      {/* Basic Information Grid */}
      <div className={cn("grid grid-cols-1 lg:grid-cols-3 gap-6", language === 'ar' && 'rtl')}>
        {/* Visit Date */}
        <div className="space-y-2">
          <Label 
            htmlFor="visit_date" 
            className={cn("text-sm font-semibold text-gray-700 flex items-center gap-2", language === 'ar' && 'text-right flex-row-reverse')}
          >
            <Calendar className="w-4 h-4 text-[#2463EB]" />
            {t('visit.date')} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="visit_date"
            type="date"
            {...register('visit_date', { required: t('form.required') })}
            className={cn(
              "h-12 border-gray-300 bg-gray-50 focus:bg-white focus:border-[#2463EB] focus:ring-[#2463EB]/20 shadow-sm",
              errors.visit_date && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
              language === 'ar' && 'text-right'
            )}
          />
          {errors.visit_date && (
            <p className={cn("text-red-500 text-sm mt-1 flex items-center gap-1", language === 'ar' && 'text-right flex-row-reverse')}>
              <AlertCircle className="w-3 h-3" />
              {errors.visit_date.message}
            </p>
          )}
        </div>

        {/* Visit Type */}
        <div className="space-y-2">
          <Label 
            htmlFor="visit_type" 
            className={cn("text-sm font-semibold text-gray-700 flex items-center gap-2", language === 'ar' && 'text-right flex-row-reverse')}
          >
            <Activity className="w-4 h-4 text-[#2463EB]" />
            {t('visit.type')} <span className="text-red-500">*</span>
          </Label>
          <Select
            value={(() => {
              const val = watch('visit_type') || '';
              return val;
            })()}
            onValueChange={(value) => {
              if (value && value !== '') {
                setValue('visit_type', value);
              }
            }}
          >
            <SelectTrigger className={cn(
              "h-12 border-gray-300 bg-gray-50 focus:bg-white focus:border-[#2463EB] focus:ring-[#2463EB]/20 shadow-sm",
              errors.visit_type && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
              language === 'ar' && 'text-right'
            )}>
              <SelectValue
                placeholder={isLoadingTypes ? t('common.loading') : t('visit.selectType')}
              />
            </SelectTrigger>
            <SelectContent>
              {isLoadingTypes ? (
                <SelectItem value="loading" disabled>
                  {t('common.loading')}...
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
          {errors.visit_type && (
            <p className={cn("text-red-500 text-sm mt-1 flex items-center gap-1", language === 'ar' && 'text-right flex-row-reverse')}>
              <AlertCircle className="w-3 h-3" />
              {errors.visit_type.message}
            </p>
          )}
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label 
            htmlFor="status" 
            className={cn("text-sm font-semibold text-gray-700 flex items-center gap-2", language === 'ar' && 'text-right flex-row-reverse')}
          >
            <ClipboardList className="w-4 h-4 text-[#2463EB]" />
            {t('visit.status')} <span className="text-red-500">*</span>
          </Label>
          <Select
            value={(() => {
              const val = watch('status') || '';
              return val;
            })()}
            onValueChange={(value) => {
              if (value && value !== '') {
                setValue('status', value);
              }
            }}
          >
            <SelectTrigger className={cn(
              "h-12 border-gray-300 bg-gray-50 focus:bg-white focus:border-[#2463EB] focus:ring-[#2463EB]/20 shadow-sm",
              errors.status && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
              language === 'ar' && 'text-right'
            )}>
              <SelectValue
                placeholder={isLoadingStatuses ? t('common.loading') : t('visit.selectStatus')}
              />
            </SelectTrigger>
            <SelectContent>
              {isLoadingStatuses ? (
                <SelectItem value="loading" disabled>
                  {t('common.loading')}...
                </SelectItem>
              ) : (
                <>
                  {visitStatuses?.map((status) => (
                    <SelectItem key={status.id} value={status.id.toString()}>
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
          {errors.status && (
            <p className={cn("text-red-500 text-sm mt-1 flex items-center gap-1", language === 'ar' && 'text-right flex-row-reverse')}>
              <AlertCircle className="w-3 h-3" />
              {errors.status.message}
            </p>
          )}
        </div>
      </div>

      {/* Chief Complaint */}
      <div className="space-y-2">
        <Label 
          htmlFor="chief_complaint" 
          className={cn("text-sm font-semibold text-gray-700 flex items-center gap-2", language === 'ar' && 'text-right flex-row-reverse')}
        >
          <Stethoscope className="w-4 h-4 text-[#2463EB]" />
          {t('visit.chiefComplaint')} <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="chief_complaint"
          placeholder={t('visit.enterChiefComplaint')}
          {...register('chief_complaint', { required: t('form.required') })}
          className={cn(
            "min-h-[100px] border-gray-300 bg-gray-50 focus:bg-white focus:border-[#2463EB] focus:ring-[#2463EB]/20 shadow-sm",
            errors.chief_complaint && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
            language === 'ar' && 'text-right'
          )}
        />
        {errors.chief_complaint && (
          <p className={cn("text-red-500 text-sm mt-1 flex items-center gap-1", language === 'ar' && 'text-right flex-row-reverse')}>
            <AlertCircle className="w-3 h-3" />
            {errors.chief_complaint.message}
          </p>
        )}
      </div>

      {/* Diagnosis */}
      <div className="space-y-2">
        <Label 
          htmlFor="diagnosis" 
          className={cn("text-sm font-semibold text-gray-700 flex items-center gap-2", language === 'ar' && 'text-right flex-row-reverse')}
        >
          <FileText className="w-4 h-4 text-[#2463EB]" />
          {t('visit.diagnosis')} <span className="text-red-500">*</span>
        </Label>
        <div className={cn(
          "rounded-lg border border-gray-300 bg-gray-50 focus-within:bg-white focus-within:border-[#2463EB] focus-within:ring-2 focus-within:ring-[#2463EB]/20 shadow-sm transition-all duration-200",
          errors.diagnosis && "border-red-500 focus-within:border-red-500 focus-within:ring-red-500/20"
        )}>
       <Textarea
  id="diagnosis"
  name="diagnosis"
  placeholder={t('visit.enterDiagnosis')}
  value={watch('diagnosis') || ''}
  onChange={(e) => setValue('diagnosis', e.target.value, { shouldValidate: true })}
  className={cn(
    "min-h-[100px] border-0 bg-transparent focus:ring-0",
    language === 'ar' && 'text-right'
  )}
/>
        </div>
        {errors.diagnosis && (
          <p className={cn("text-red-500 text-sm mt-1 flex items-center gap-1", language === 'ar' && 'text-right flex-row-reverse')}>
            <AlertCircle className="w-3 h-3" />
            {errors.diagnosis.message}
          </p>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label 
          htmlFor="notes" 
          className={cn("text-sm font-semibold text-gray-700 flex items-center gap-2", language === 'ar' && 'text-right flex-row-reverse')}
        >
          <FileText className="w-4 h-4 text-gray-500" />
          {t('visit.notes')} <span className="text-gray-400 text-xs">{t('common.optional')}</span>
        </Label>
        <Textarea
          id="notes"
          placeholder={t('visit.enterNotes')}
          {...register('notes')}
          className={cn(
            "min-h-[80px] border-gray-300 bg-gray-50 focus:bg-white focus:border-[#2463EB] focus:ring-[#2463EB]/20 shadow-sm",
            language === 'ar' && 'text-right'
          )}
        />
      </div>

      {/* Form Tips */}
      <div className={cn("p-4 bg-blue-50 rounded-lg border border-blue-200", language === 'ar' && 'text-right')}>
        <div className={cn("flex items-start gap-2 text-sm text-blue-800", language === 'ar' && 'flex-row-reverse')}>
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium mb-1">Form Guidelines:</p>
            <ul className={cn("space-y-1 text-xs", language === 'ar' && 'text-right')}>
              <li>• Fields marked with <span className="text-red-500">*</span> are required</li>
              <li>• Chief complaint should describe the patient's main concern</li>
              <li>• Diagnosis should include your clinical assessment</li>
              <li>• Notes are optional but helpful for future reference</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};