import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { patientUrl } from '@/components/constants.js';


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
          title: 'Validation Error',
          description: 'Patient name is required.',
          variant: 'destructive'
        });
        return;
      }

      if (!formData.date_of_birth) {
        toast({
          title: 'Validation Error',
          description: 'Date of birth is required.',
          variant: 'destructive'
        });
        return;
      }

      if (!formData.gender) {
        toast({
          title: 'Validation Error',
          description: 'Gender is required.',
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
        toast({ title: 'تم تحديث بيانات المريض بنجاح' });

      } else {
        const response = await fetch(patientUrl, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ patient: formData })
        });

        toast({ title: 'Patient added successfully' });
      }

      onSave();
    } catch (error) {
      console.error('Error saving patient:', error);
      toast({
        title: 'Error saving patient',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            {...register('name', { required: 'Name is required' })}
            placeholder="Enter patient's full name"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{String(errors.name.message)}</p>}
        </div>

        <div>
          <Label htmlFor="date_of_birth">Date of Birth *</Label>
          <Input
            id="date_of_birth"
            type="date"
            {...register('date_of_birth', { required: 'Date of birth is required' })}
          />
          {errors.date_of_birth && <p className="text-red-500 text-sm mt-1">{String(errors.date_of_birth.message)}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="age">Age (calculated automatically)</Label>
          <Input
            id="age"
            type="number"
            {...register('age')}
            placeholder="Age will be calculated from date of birth"
            readOnly
            className="bg-gray-100"
          />
        </div>

        <div>
          <Label htmlFor="gender">Gender *</Label>
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
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          {...register('phone')}
          placeholder="Enter phone number"
        />
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          {...register('address')}
          placeholder="Enter patient's address"
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="medical_history">Medical History</Label>
        <Textarea
          id="medical_history"
          {...register('medical_history')}
          placeholder="Enter medical history, allergies, chronic conditions, etc."
          rows={4}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit">
          {patient ? 'Update Patient' : 'Add Patient'}
        </Button>
      </div>
    </form>
  );
};
