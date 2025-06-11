
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface MedicineFormProps {
  medicine?: any;
  onSave: () => void;
}

export const MedicineForm = ({ medicine, onSave }: MedicineFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: medicine || {
      name: '',
      dosage: '',
      form: '',
      manufacturer: '',
      price: ''
    }
  });
  
  const { toast } = useToast();
  const { t, language } = useLanguage();

  const onSubmit = async (data: any) => {
    try {
      const medicineData = {
        ...data,
        price: data.price ? parseFloat(data.price) : null
      };

      if (medicine) {
        const { error } = await supabase
          .from('medicines')
          .update(medicineData)
          .eq('id', medicine.id);
        
        if (error) throw error;
        toast({ title: t('medicines.updatedSuccess') });
      } else {
        const { error } = await supabase
          .from('medicines')
          .insert([medicineData]);
        
        if (error) throw error;
        toast({ title: t('medicines.addedSuccess') });
      }
      
      onSave();
    } catch (error) {
      console.error('Error saving medicine:', error);
      toast({ 
        title: t('medicines.errorSaving'), 
        description: t('form.tryAgain'),
        variant: 'destructive' 
      });
    }
  };

  return (
    <div className={cn(language === 'ar' && "rtl")}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name" className={cn(language === 'ar' && 'text-right block')}>{t('medicines.medicineName')} *</Label>
            <Input
              id="name"
              {...register('name', { required: t('medicines.nameRequired') })}
              placeholder={t('medicines.enterName')}
              className={cn(language === 'ar' && 'text-right')}
            />
            {errors.name && <p className={cn("text-red-500 text-sm mt-1", language === 'ar' && 'text-right')}>{String(errors.name.message)}</p>}
          </div>
          
          <div>
            <Label htmlFor="dosage" className={cn(language === 'ar' && 'text-right block')}>{t('medicines.dosage')}</Label>
            <Input
              id="dosage"
              {...register('dosage')}
              placeholder={t('medicines.enterDosage')}
              className={cn(language === 'ar' && 'text-right')}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="form" className={cn(language === 'ar' && 'text-right block')}>{t('medicines.form')}</Label>
            <Input
              id="form"
              {...register('form')}
              placeholder={t('medicines.enterForm')}
              className={cn(language === 'ar' && 'text-right')}
            />
          </div>
          
          <div>
            <Label htmlFor="manufacturer" className={cn(language === 'ar' && 'text-right block')}>{t('medicines.manufacturer')}</Label>
            <Input
              id="manufacturer"
              {...register('manufacturer')}
              placeholder={t('medicines.enterManufacturer')}
              className={cn(language === 'ar' && 'text-right')}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="price" className={cn(language === 'ar' && 'text-right block')}>{t('medicines.price')} ($)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            {...register('price')}
            placeholder={t('medicines.enterPrice')}
            className={cn(language === 'ar' && 'text-right')}
          />
        </div>

        <div className={cn("flex space-x-2", language === 'ar' ? 'justify-start flex-row-reverse space-x-reverse' : 'justify-end')}>
          <Button type="submit">
            {medicine ? t('medicines.updateMedicine') : t('medicines.addMedicine')}
          </Button>
        </div>
      </form>
    </div>
  );
};
