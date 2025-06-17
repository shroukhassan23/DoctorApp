import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { SaveButton, CancelButton } from '@/components/ui/enhanced-button';
import { useToast } from '@/hooks/use-toast';
import { patientUrl } from '@/components/constants.js';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import {
  User,
  Calendar,
  Users,
  Phone,
  MapPin,
  FileText,
  AlertCircle,
  UserPlus,
  Edit,
  Info,
  Baby
} from 'lucide-react';
import { PatientsPage } from './PatientsPage';

interface PatientFormProps {
  patient?: any;
  onSave: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const PatientForm = ({ patient, onSave, onCancel, isLoading }: PatientFormProps) => {
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm({
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
  const isFormLoading = isSubmitting || (isLoading ?? false);


  const { toast } = useToast();
  const selectedGender = watch('gender');
  const dateOfBirth = watch('date_of_birth');
  const { t, language } = useLanguage();

  // Calculate age based on date of birth
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

  // Set values when loading patient data
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

  // Set gender value in select when loading patient data
  useEffect(() => {
    if (patient) {
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
          description: t('message.genderRequired'),
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

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to add patient');
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to add patient');
        }

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

  // Get form completion percentage
  const formValues = watch();
  const requiredFields = ['name', 'date_of_birth', 'gender'];
  const completedFields = requiredFields.filter(field => formValues[field]).length;
  const completionPercentage = Math.round((completedFields / requiredFields.length) * 100);

  return (
    <div className={cn("max-h-[80vh] flex flex-col", language === 'ar' && 'rtl')}>
      {/* Compact Header */}
      <div className={cn("p-4 bg-gradient-to-r from-white to-blue-50/30 border-b flex-shrink-0", language === 'ar' && 'flex-row-reverse')}>
        <div className={cn("flex items-center gap-3", language === 'ar' && 'flex-row-reverse')}>
          <div className="p-2 bg-[#2463EB] rounded-lg">
            {patient ? <Edit className="w-5 h-5 text-white" /> : <UserPlus className="w-5 h-5 text-white" />}
          </div>
          <div className="flex-1">
            <h2 className={cn("text-lg font-bold text-gray-900", language === 'ar' && 'text-right')}>
              {patient ? t('patients.editInfo') : t('patients.addNew')}
            </h2>
            <p className={cn("text-sm text-gray-600", language === 'ar' && 'text-right')}>
              {patient ? t('patients.updateDetails') : t('patients.enterDetails')}
            </p>
          </div>
          <Badge variant="secondary" className={cn(
            "px-2 py-1 text-xs",
            completionPercentage === 100 ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
          )}>
            {completionPercentage}% {t('common.completed')}
          </Badge>
        </div>

        {/* Compact Progress Bar */}
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Scrollable Form Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className={cn("text-sm font-semibold text-gray-700 flex items-center gap-2", language === 'ar' && 'text-right flex-row-reverse')}
              >
                <User className="w-4 h-4 text-[#2463EB]" />
                {t('patients.fullName')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                {...register('name', { required: 'Name is required' })}
                placeholder={t('patients.enterFullName')}
                disabled={isFormLoading}
                className={cn(
                  "h-9 border-gray-300 bg-gray-50 focus:bg-white focus:border-[#2463EB] focus:ring-[#2463EB]/20 shadow-sm text-sm",
                  errors.name && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                  language === 'ar' && 'text-right',
                  isFormLoading && 'opacity-50 cursor-not-allowed'
                )}
              />
              {errors.name && (
                <p className={cn("text-red-500 text-sm mt-1 flex items-center gap-1", language === 'ar' && 'text-right flex-row-reverse')}>
                  <AlertCircle className="w-3 h-3" />
                  {String(errors.name.message)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="date_of_birth"
                className={cn("text-sm font-semibold text-gray-700 flex items-center gap-2", language === 'ar' && 'text-right flex-row-reverse')}
              >
                <Calendar className="w-4 h-4 text-[#2463EB]" />
                {t('patients.dateOfBirth')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="date_of_birth"
                type="date"
                {...register('date_of_birth', { required: 'Date of birth is required' })}
                disabled={isFormLoading}
                className={cn(
                  "h-9 border-gray-300 bg-gray-50 focus:bg-white focus:border-[#2463EB] focus:ring-[#2463EB]/20 shadow-sm text-sm",
                  errors.date_of_birth && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                  language === 'ar' && 'text-right',
                  isFormLoading && 'opacity-50 cursor-not-allowed'
                )}
              />
              {errors.date_of_birth && (
                <p className={cn("text-red-500 text-sm mt-1 flex items-center gap-1", language === 'ar' && 'text-right flex-row-reverse')}>
                  <AlertCircle className="w-3 h-3" />
                  {String(errors.date_of_birth.message)}
                </p>
              )}
            </div>
          </div>

          {/* Age and Gender */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="age"
                className={cn("text-sm font-semibold text-gray-700 flex items-center gap-2", language === 'ar' && 'text-right flex-row-reverse')}
              >
                <Baby className="w-4 h-4 text-[#2463EB]" />
                {t('patients.age')} <span className="text-gray-400 text-xs">(auto-calculated)</span>
              </Label>
              <Input
                id="age"
                type="number"
                {...register('age')}
                placeholder={t('message.ageCalculated')}
                readOnly
                disabled={isFormLoading}
                className={cn(
                  "h-9 border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed text-sm",
                  language === 'ar' && 'text-right',
                  isFormLoading && 'opacity-50'
                )}
              />
              <p className={cn("text-xs text-gray-500", language === 'ar' && 'text-right')}>
                Auto-calculated from date of birth
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="gender"
                className={cn("text-sm font-semibold text-gray-700 flex items-center gap-2", language === 'ar' && 'text-right flex-row-reverse')}
              >
                <Users className="w-4 h-4 text-[#2463EB]" />
                {t('patients.gender')} <span className="text-red-500">*</span>
              </Label>
              <Select
                value={selectedGender || ''}
                onValueChange={(value) => setValue('gender', value)}
                disabled={isFormLoading}
              >
                <SelectTrigger className={cn(
                  "h-9 border-gray-300 bg-gray-50 focus:bg-white focus:border-[#2463EB] focus:ring-[#2463EB]/20 shadow-sm text-sm",
                  errors.gender && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                  language === 'ar' && 'text-right'
                )}>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className={cn("text-red-500 text-sm mt-1 flex items-center gap-1", language === 'ar' && 'text-right flex-row-reverse')}>
                  <AlertCircle className="w-3 h-3" />
                  {String(errors.gender.message)}
                </p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-2">
            <Label
              htmlFor="phone"
              className={cn("text-sm font-semibold text-gray-700 flex items-center gap-2", language === 'ar' && 'text-right flex-row-reverse')}
            >
              <Phone className="w-4 h-4 text-[#2463EB]" />
              {t('patients.phone')} <span className="text-gray-400 text-xs">{t('common.optional')}</span>
            </Label>
            <div className="relative">
              <Phone className={cn(
                "absolute top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400",
                language === 'ar' ? 'right-3' : 'left-3'
              )} />
              <Input
                id="phone"
                {...register('phone')}
                placeholder={t('patients.enterPhone')}
                disabled={isFormLoading}
                className={cn(
                  "h-9 border-gray-300 bg-gray-50 focus:bg-white focus:border-[#2463EB] focus:ring-[#2463EB]/20 shadow-sm text-sm",
                  language === 'ar' ? 'pr-10 text-right' : 'pl-10',
                  isFormLoading && 'opacity-50 cursor-not-allowed'
                )}
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label
              htmlFor="address"
              className={cn("text-sm font-semibold text-gray-700 flex items-center gap-2", language === 'ar' && 'text-right flex-row-reverse')}
            >
              <MapPin className="w-4 h-4 text-[#2463EB]" />
              {t('patients.address')} <span className="text-gray-400 text-xs">{t('common.optional')}</span>
            </Label>
            <Textarea
              id="address"
              {...register('address')}
              placeholder={t('patients.enterAddress')}
              rows={2}
              disabled={isFormLoading}
              className={cn(
                "border-gray-300 bg-gray-50 focus:bg-white focus:border-[#2463EB] focus:ring-[#2463EB]/20 shadow-sm resize-none text-sm",
                language === 'ar' && 'text-right',
                isFormLoading && 'opacity-50 cursor-not-allowed'
              )}
            />
          </div>

          {/* Medical History */}
          <div className="space-y-2">
            <Label
              htmlFor="medical_history"
              className={cn("text-sm font-semibold text-gray-700 flex items-center gap-2", language === 'ar' && 'text-right flex-row-reverse')}
            >
              <FileText className="w-4 h-4 text-[#2463EB]" />
              {t('patients.medicalHistory')} <span className="text-gray-400 text-xs">{t('common.optional')}</span>
            </Label>
            <Textarea
              id="medical_history"
              {...register('medical_history')}
              placeholder={t('patients.enterMedicalHistory')}
              rows={2}
              disabled={isFormLoading}
              className={cn(
                "border-gray-300 bg-gray-50 focus:bg-white focus:border-[#2463EB] focus:ring-[#2463EB]/20 shadow-sm resize-none text-sm",
                language === 'ar' && 'text-right',
                isFormLoading && 'opacity-50 cursor-not-allowed'
              )}
            />
          </div>

          {/* Compact Form Guidelines */}
          <div className={cn("p-3 bg-blue-50 rounded-lg border border-blue-200", language === 'ar' && 'text-right')}>
            <div className={cn("flex items-start gap-2 text-xs text-blue-800", language === 'ar' && 'flex-row-reverse')}>
              <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium mb-1">Guidelines:</p>
                <p className={cn("text-xs", language === 'ar' && 'text-right')}>
                  Fields marked with <span className="text-red-500">*</span> are required. Age is auto-calculated.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Fixed Action Buttons at Bottom */}
      <div className={cn("border-t bg-gray-50 p-4 flex gap-3 flex-shrink-0", language === 'ar' ? 'justify-start flex-row-reverse' : 'justify-end')}>
        {onCancel && (
          <CancelButton
            type="button"
            onClick={onCancel}
            disabled={isFormLoading}
            className="px-4 py-2"
          >
            Cancel
          </CancelButton>
        )}

        <SaveButton
          type="submit"
          loading={isFormLoading}  // This will show loading for both isSubmitting AND isLoading
          disabled={isFormLoading}
          className="px-6 py-2"
          onClick={handleSubmit(onSubmit)}
        >
          {patient ? t('patients.edit') : t('patients.add')}
        </SaveButton>
      </div>
    </div>
  );
};