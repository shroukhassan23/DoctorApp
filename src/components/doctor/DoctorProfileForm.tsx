
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

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
      if (profile) {
        const { error } = await supabase
          .from('doctor_profile')
          .update(data)
          .eq('id', profile.id);
        
        if (error) throw error;
        toast({ title: t('profile.updatedSuccess') });
      } else {
        const { error } = await supabase
          .from('doctor_profile')
          .insert([data]);
        
        if (error) throw error;
        toast({ title: t('profile.createdSuccess') });
      }
      
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
