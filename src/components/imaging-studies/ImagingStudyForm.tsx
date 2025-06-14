import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { managementImagingStudiesUrl, updateImagingStudyUrl } from '@/components/constants.js';

interface ImagingStudyFormProps {
  imagingStudy?: any;
  onSave: () => void;
}

export const ImagingStudyForm = ({ imagingStudy, onSave }: ImagingStudyFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: imagingStudy || {
      name: '',
      description: ''
    }
  });
  
  const { toast } = useToast();
  const { t, language } = useLanguage();

  const onSubmit = async (data: any) => {
    try {
      const url = imagingStudy ? updateImagingStudyUrl(imagingStudy.id) : managementImagingStudiesUrl;
      const method = imagingStudy ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save imaging study');
      }

      toast({ title: imagingStudy ? t('imaging.updatedSuccess') : t('imaging.addedSuccess') });
      onSave();
    } catch (error) {
      console.error('Error saving imaging study:', error);
      toast({ 
        title: t('imaging.errorSaving'), 
        description: t('form.tryAgain'),
        variant: 'destructive' 
      });
    }
  };

  return (
    <div className={cn(language === 'ar' && "rtl")}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="name" className={cn(language === 'ar' && 'text-right block')}>{t('imaging.studyName')} *</Label>
          <Input
            id="name"
            {...register('name', { required: t('imaging.nameRequired') })}
            placeholder={t('imaging.enterName')}
            className={cn(language === 'ar' && 'text-right')}
          />
          {errors.name && <p className={cn("text-red-500 text-sm mt-1", language === 'ar' && 'text-right')}>{String(errors.name.message)}</p>}
        </div>

        <div>
          <Label htmlFor="description" className={cn(language === 'ar' && 'text-right block')}>{t('common.description')}</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder={t('imaging.enterDescription')}
            rows={3}
            className={cn(language === 'ar' && 'text-right')}
          />
        </div>

        <div className={cn("flex space-x-2", language === 'ar' ? 'justify-start flex-row-reverse space-x-reverse' : 'justify-end')}>
          <Button type="submit">
            {imagingStudy ? t('imaging.updateStudy') : t('imaging.addStudy')}
          </Button>
        </div>
      </form>
    </div>
  );
};