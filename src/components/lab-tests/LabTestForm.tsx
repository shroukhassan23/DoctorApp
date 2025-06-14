import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { managementLabTestsUrl, updateLabTestUrl } from '@/components/constants.js';

interface LabTestFormProps {
  labTest?: any;
  onSave: () => void;
}

export const LabTestForm = ({ labTest, onSave }: LabTestFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: labTest || {
      name: '',
      description: ''
    }
  });
  
  const { toast } = useToast();
  const { t, language } = useLanguage();

  const onSubmit = async (data: any) => {
    try {
      const url = labTest ? updateLabTestUrl(labTest.id) : managementLabTestsUrl;
      const method = labTest ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save lab test');
      }

      toast({ title: labTest ? t('labTests.updatedSuccess') : t('labTests.addedSuccess') });
      onSave();
    } catch (error) {
      console.error('Error saving lab test:', error);
      toast({ 
        title: t('labTests.errorSaving'), 
        description: t('form.tryAgain'),
        variant: 'destructive' 
      });
    }
  };

  return (
    <div className={cn(language === 'ar' && "rtl")}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="name" className={cn(language === 'ar' && 'text-right block')}>{t('labTests.testName')} *</Label>
          <Input
            id="name"
            {...register('name', { required: t('labTests.nameRequired') })}
            placeholder={t('labTests.enterName')}
            className={cn(language === 'ar' && 'text-right')}
          />
          {errors.name && <p className={cn("text-red-500 text-sm mt-1", language === 'ar' && 'text-right')}>{String(errors.name.message)}</p>}
        </div>

        <div>
          <Label htmlFor="description" className={cn(language === 'ar' && 'text-right block')}>{t('common.description')}</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder={t('labTests.enterDescription')}
            rows={3}
            className={cn(language === 'ar' && 'text-right')}
          />
        </div>

        <div className={cn("flex space-x-2", language === 'ar' ? 'justify-start flex-row-reverse space-x-reverse' : 'justify-end')}>
          <Button type="submit">
            {labTest ? t('labTests.updateTest') : t('labTests.addTest')}
          </Button>
        </div>
      </form>
    </div>
  );
};