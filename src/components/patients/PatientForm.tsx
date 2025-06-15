import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { patientUrl } from '@/components/constants.js';
import { useLanguage } from '@/contexts/LanguageContext';


interface PatientFormProps {
  patient?: any;
  onSave: () => void;
}

export const PatientForm = ({ patient, onSave }: PatientFormProps) => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: patient || {
      name: '',
      age: '',
      date_of_birth: '',
      gender: '',
      phone: '',
      address: '',
      medical_history: ''
    }
  });

  const { toast } = useToast();
  const selectedGender = watch('gender');
  const dateOfBirth = watch('date_of_birth');
  const { t, language } = useLanguage();

  // حساب العمر بناءً على تاريخ الميلاد
  useEffect(() => {
    if (dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      setValue('age', age.toString());
    }
  }, [dateOfBirth, setValue]);

  // تعيين القيم عند تحميل بيانات المريض
  useEffect(() => {
    if (patient) {
      Object.keys(patient).forEach((key) => {
        if (patient[key] !== undefined) {
          if (key === "date_of_birth") {
            setValue(key, patient[key].split("T")[0]); // YYYY-MM-DD
          } else {
            setValue(key, patient[key]);
          }
        }
      });
    }
  }, [patient, setValue]);

  // لتعيين قيمة gender في select عند تحميل بيانات المريض
useEffect(() => {
  if (patient) {
 // const gender=(patient?.gender==1)? "Male":(patient?.gender==2)?"Female":"Other";
 
    setValue('gender', patient.gender || '');
  }
}, [patient, setValue]);


  const onSubmit = async (data: any) => {
    try {
      const formData = {
        name: data.name?.trim(),
        age: parseInt(data.age) || 0,
        date_of_birth: data.date_of_birth,
        gender: data.gender,
        phone: data.phone?.trim() || null,
        address: data.address?.trim() || null,
        medical_history: data.medical_history?.trim() || null
      };

      if (!formData.name) {
        toast({
          title: t('message.validationError'),
          description: t('message.patientNameRequired'),
          variant: 'destructive'
        });
        return;
      }

      if (!formData.date_of_birth) {
        toast({
          title: t('message.validationError'),
          description: t('message.dateRequired'),
          variant: 'destructive'
        });
        return;
      }

      if (!formData.gender) {
        toast({
          title: 'Validation Error',
          description:  t('message.genderRequired'),
          variant: 'destructive'
        });
        return;
      }

      if (patient) {
        const response = await fetch(`http://localhost:3001/Patients/${patient.id}`, {
          method: "PUT",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Update failed');
        }

        const result = await response.json();
        toast({ title: t('patients.updatedSuccess') });

      } else {
        const response = await fetch(patientUrl, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ patient: formData })
        });

        toast({ title: t('patients.addSuccess') });
      }

      onSave();
    } catch (error) {
      console.error('Error saving patient:', error);
      toast({
        title: t('patients.errorSaving'),
        description: error instanceof Error ? error.message : t('message.pleaseTryAgain'),
        variant: 'destructive'
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">{t('patients.fullName')}*</Label>
          <Input
            id="name"
            {...register('name', { required: 'Name is required' })}
            placeholder={t('patients.enterFullName')}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{String(errors.name.message)}</p>}
        </div>

        <div>
          <Label htmlFor="date_of_birth">{t('patients.dateOfBirth')}*</Label>
          <Input
            id="date_of_birth"
            type="date"
            {...register('date_of_birth', { required: t('message.dateRequired') })}
          />
          {errors.date_of_birth && <p className="text-red-500 text-sm mt-1">{String(errors.date_of_birth.message)}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="age">{t('patients.age')}* (calculated automatically)</Label>
          <Input
            id="age"
            type="number"
            {...register('age')}
            placeholder={t('message.ageCalculated')}
            readOnly
            className="bg-gray-100"
          />
        </div>

        <div>
          <Label htmlFor="gender">{t('patients.gender')}*</Label>
        <Select
  value={selectedGender || ''}
  onValueChange={(value) => setValue('gender', value)}
>
  <SelectTrigger>
    <SelectValue placeholder="Select gender" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="male">Male</SelectItem>
    <SelectItem value="female">Female</SelectItem>
    <SelectItem value="other">Other</SelectItem>
  </SelectContent>
</Select>

          {errors.gender && <p className="text-red-500 text-sm mt-1">{String(errors.gender.message)}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="phone">{t('patients.phone')}*</Label>
        <Input
          id="phone"
          {...register('phone')}
          placeholder={t('patients.enterPhone')}
        />
      </div>

      <div>
        <Label htmlFor="address">{t('patients.address')}*</Label>
        <Textarea
          id="address"
          {...register('address')}
          placeholder={t('patients.enterAddress')}
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="medical_history">{t('patients.medicalHistory')}*</Label>
        <Textarea
          id="medical_history"
          {...register('medical_history')}
          placeholder={t('patients.enterMedicalHistory')}
          rows={4}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit">
          {patient ? t('patients.edit'): t('patients.add')}
        </Button>
      </div>
    </form>
  );
};
