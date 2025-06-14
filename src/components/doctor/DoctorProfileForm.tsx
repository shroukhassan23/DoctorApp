import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { doctorProfileUrl } from '@/components/constants.js';

interface DoctorProfileFormProps {
  profile?: any;
  onSave: () => void;
}

export const DoctorProfileForm = ({ profile, onSave }: DoctorProfileFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: profile || {
      name: '',
      title: '',
      qualification: '',
      specialization: '',
      clinic_name: '',
      clinic_address: '',
      phone: '',
      email: ''
    }
  });
  
  const { toast } = useToast();
  const { t, language } = useLanguage();

  const onSubmit = async (data: any) => {
    try {
      const response = await fetch(doctorProfileUrl, {
        method: 'POST', // The endpoint handles both create and update
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save profile');
      }

      const result = await response.json();
      toast({ title: profile ? t('profile.updatedSuccess') : t('profile.createdSuccess') });
      onSave();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({ 
        title: t('profile.errorSaving'), 
        description: t('form.tryAgain'),
        variant: 'destructive' 
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn("space-y-4", language === 'ar' && 'rtl')}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name" className={cn(language === 'ar' && 'text-right')}>{t('profile.fullName')} *</Label>
          <Input
            id="name"
            {...register('name', { required: t('profile.nameRequired') })}
            placeholder={t('profile.enterFullName')}
            className={cn(language === 'ar' && 'text-right')}
          />
          {errors.name && <p className={cn("text-red-500 text-sm mt-1", language === 'ar' && 'text-right')}>{String(errors.name.message)}</p>}
        </div>
        
        <div>
          <Label htmlFor="title" className={cn(language === 'ar' && 'text-right')}>{t('profile.title')} *</Label>
          <Input
            id="title"
            {...register('title', { required: t('profile.titleRequired') })}
            placeholder={t('profile.enterTitle')}
            className={cn(language === 'ar' && 'text-right')}
          />
          {errors.title && <p className={cn("text-red-500 text-sm mt-1", language === 'ar' && 'text-right')}>{String(errors.title.message)}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="qualification" className={cn(language === 'ar' && 'text-right')}>{t('profile.qualification')}</Label>
          <Input
            id="qualification"
            {...register('qualification')}
            placeholder={t('profile.enterQualification')}
            className={cn(language === 'ar' && 'text-right')}
          />
        </div>
        
        <div>
          <Label htmlFor="specialization" className={cn(language === 'ar' && 'text-right')}>{t('profile.specialization')}</Label>
          <Input
            id="specialization"
            {...register('specialization')}
            placeholder={t('profile.enterSpecialization')}
            className={cn(language === 'ar' && 'text-right')}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="clinic_name" className={cn(language === 'ar' && 'text-right')}>{t('profile.clinicName')}</Label>
        <Input
          id="clinic_name"
          {...register('clinic_name')}
          placeholder={t('profile.enterClinicName')}
          className={cn(language === 'ar' && 'text-right')}
        />
      </div>

      <div>
        <Label htmlFor="clinic_address" className={cn(language === 'ar' && 'text-right')}>{t('profile.clinicAddress')}</Label>
        <Textarea
          id="clinic_address"
          {...register('clinic_address')}
          placeholder={t('profile.enterClinicAddress')}
          className={cn(language === 'ar' && 'text-right')}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone" className={cn(language === 'ar' && 'text-right')}>{t('profile.phone')}</Label>
          <Input
            id="phone"
            {...register('phone')}
            placeholder={t('profile.enterPhone')}
            className={cn(language === 'ar' && 'text-right')}
          />
        </div>
        
        <div>
          <Label htmlFor="email" className={cn(language === 'ar' && 'text-right')}>{t('profile.email')}</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder={t('profile.enterEmail')}
            className={cn(language === 'ar' && 'text-right')}
          />
        </div>
      </div>

      <div className={cn("flex justify-end space-x-2", language === 'ar' && 'flex-row-reverse space-x-reverse')}>
        <Button type="submit">
          {profile ? t('profile.updateProfile') : t('profile.createProfile')}
        </Button>
      </div>
    </form>
  );
};