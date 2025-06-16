import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SaveButton, CancelButton } from '@/components/ui/enhanced-button';
import { Pill, DollarSign, Building2, Beaker, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { managementMedicinesUrl, updateMedicineUrl } from '@/components/constants.js';

interface MedicineFormProps {
  medicine?: any;
  onSave: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const MedicineForm = ({ medicine, onSave, onCancel, isLoading }: MedicineFormProps) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: medicine || {
      name: '',
      dosage: '',
      form: '',
      manufacturer: '',
      price: ''
    }
  });

  const isFormLoading = isSubmitting || isLoading;


  const { toast } = useToast();
  const { t, language } = useLanguage();

  const onSubmit = async (data: any) => {
    try {
      const medicineData = {
        ...data,
        price: data.price ? parseFloat(data.price) : null
      };

      const url = medicine ? updateMedicineUrl(medicine.id) : managementMedicinesUrl;
      const method = medicine ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(medicineData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save medicine');
      }

      toast({ title: medicine ? t('medicines.updatedSuccess') : t('medicines.addedSuccess') });
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
      <Card className="shadow-lg border-0 bg-white">
        {/* <CardHeader className="pb-4">
          <CardTitle className={cn("flex items-center gap-3 text-xl font-bold", language === 'ar' && 'flex-row-reverse text-right')}>
            <div className="p-2 bg-[#2463EB] rounded-xl shadow-lg">
              <Pill className="w-6 h-6 text-white" />
            </div>
            {medicine ? 'Edit Medicine' : 'Add New Medicine'}
          </CardTitle>
        </CardHeader> */}

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Medicine Name and Dosage */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className={cn("text-sm font-semibold text-gray-700 flex items-center gap-2", language === 'ar' && 'text-right flex-row-reverse')}
                >
                  <Package className="w-4 h-4 text-[#2463EB]" />
                  {t('medicines.medicineName')} *
                </Label>
                <Input
                id="name"
                  {...register('name', { required: t('medicines.nameRequired') })}
                  placeholder={t('medicines.enterName')}
                  disabled={isFormLoading}
                  className={cn(
                    "h-12 border-gray-300 bg-gray-50 focus:bg-white focus:border-[#2463EB] focus:ring-[#2463EB]/20 shadow-sm",
                    language === 'ar' && 'text-right',
                    isFormLoading && 'opacity-50 cursor-not-allowed'
                  )}
                />
                {errors.name && (
                  <p className={cn("text-red-500 text-sm mt-1 flex items-center gap-1", language === 'ar' && 'text-right flex-row-reverse')}>
                    <span className="text-red-500">⚠️</span>
                    {String(errors.name.message)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="dosage"
                  className={cn("text-sm font-semibold text-gray-700 flex items-center gap-2", language === 'ar' && 'text-right flex-row-reverse')}
                >
                  <Beaker className="w-4 h-4 text-[#2463EB]" />
                  {t('medicines.dosage')}
                </Label>
                <Input
                  id="dosage"
                  {...register('dosage')}
                  placeholder={t('medicines.enterDosage')}
                  className={cn(
                    "h-12 border-gray-300 bg-gray-50 focus:bg-white focus:border-[#2463EB] focus:ring-[#2463EB]/20 shadow-sm",
                    language === 'ar' && 'text-right'
                  )}
                />
              </div>
            </div>

            {/* Form and Manufacturer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="form"
                  className={cn("text-sm font-semibold text-gray-700 flex items-center gap-2", language === 'ar' && 'text-right flex-row-reverse')}
                >
                  <Package className="w-4 h-4 text-[#2463EB]" />
                  {t('medicines.form')}
                </Label>
                <Input
                  id="form"
                  {...register('form')}
                  placeholder={t('medicines.enterForm')}
                  className={cn(
                    "h-12 border-gray-300 bg-gray-50 focus:bg-white focus:border-[#2463EB] focus:ring-[#2463EB]/20 shadow-sm",
                    language === 'ar' && 'text-right'
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="manufacturer"
                  className={cn("text-sm font-semibold text-gray-700 flex items-center gap-2", language === 'ar' && 'text-right flex-row-reverse')}
                >
                  <Building2 className="w-4 h-4 text-[#2463EB]" />
                  {t('medicines.manufacturer')}
                </Label>
                <Input
                  id="manufacturer"
                  {...register('manufacturer')}
                  placeholder={t('medicines.enterManufacturer')}
                  className={cn(
                    "h-12 border-gray-300 bg-gray-50 focus:bg-white focus:border-[#2463EB] focus:ring-[#2463EB]/20 shadow-sm",
                    language === 'ar' && 'text-right'
                  )}
                />
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label
                htmlFor="price"
                className={cn("text-sm font-semibold text-gray-700 flex items-center gap-2", language === 'ar' && 'text-right flex-row-reverse')}
              >
                <DollarSign className="w-4 h-4 text-[#2463EB]" />
                {t('medicines.price')} ($)
              </Label>
              <div className="relative">
                <DollarSign className={cn(
                  "absolute top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400",
                  language === 'ar' ? 'right-4' : 'left-4'
                )} />
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('price', {
                    validate: value => {
                      if (value && parseFloat(value) < 0) {
                        return 'Price cannot be negative';
                      }
                      return true;
                    }
                  })}
                  placeholder={t('medicines.enterPrice')}
                  className={cn(
                    "h-12 border-gray-300 bg-gray-50 focus:bg-white focus:border-[#2463EB] focus:ring-[#2463EB]/20 shadow-sm",
                    language === 'ar' ? 'pr-12 text-right' : 'pl-12'
                  )}
                />
              </div>
              {errors.price && (
                <p className={cn("text-red-500 text-sm mt-1 flex items-center gap-1", language === 'ar' && 'text-right flex-row-reverse')}>
                  <span className="text-red-500">⚠️</span>
                  {String(errors.price.message)}
                </p>
              )}
            </div>

            {/* Form Instructions */}
            <div className={cn("p-4 bg-blue-50 rounded-lg border border-blue-200", language === 'ar' && 'text-right')}>
              <div className={cn("flex items-start gap-2 text-sm text-blue-800", language === 'ar' && 'flex-row-reverse')}>
                <Pill className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium mb-1">{t('medicines.infotip')}</p>
                  <ul className={cn("space-y-1 text-xs", language === 'ar' && 'text-right')}>
                    <li>• {t('medicines.nameRequiredTip')}</li>
                    <li>• {t('medicines.includeDosage')}</li>
                    <li>• {t('medicines.formRefer')}</li>
                    <li>• {t('medicines.priceTip')}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={cn("flex gap-4 pt-4", language === 'ar' ? 'justify-start flex-row-reverse' : 'justify-end')}>
              {onCancel && (
                <CancelButton
                  type="button"
                  onClick={onCancel}
                  disabled={isFormLoading}
                >
                  {t('common.cancel')}
                </CancelButton>
              )}

              <SaveButton
                type="submit"
                loading={isFormLoading}
                disabled={isFormLoading}
              >
                {medicine ? t('medicines.updateMedicine') : t('medicines.addMedicine')}
              </SaveButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};