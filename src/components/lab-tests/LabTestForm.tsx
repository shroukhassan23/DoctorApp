import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { SaveButton, CancelButton } from '@/components/ui/enhanced-button';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { managementLabTestsUrl, updateLabTestUrl } from '@/components/constants.js';
import { 
  TestTube, 
  FileText, 
  AlertCircle,
  Plus,
  Edit,
  Info,
  Microscope
} from 'lucide-react';

interface LabTestFormProps {
  labTest?: any;
  onSave: () => void;
  onCancel?: () => void;
}

export const LabTestForm = ({ labTest, onSave, onCancel }: LabTestFormProps) => {
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: labTest || {
      name: '',
      description: ''
    }
  });
  
  const { toast } = useToast();
  const { t, language } = useLanguage();

  // Set values when loading lab test data
  useEffect(() => {
    if (labTest) {
      Object.keys(labTest).forEach((key) => {
        if (labTest[key] !== undefined) {
          setValue(key, labTest[key]);
        }
      });
    }
  }, [labTest, setValue]);

  const onSubmit = async (data: any) => {
    try {
      const formData = {
        name: data.name?.trim(),
        description: data.description?.trim() || null
      };

      if (!formData.name) {
        toast({
          title: t('message.validationError'),
          description: 'Lab test name is required.',
          variant: 'destructive'
        });
        return;
      }

      const url = labTest ? updateLabTestUrl(labTest.id) : managementLabTestsUrl;
      const method = labTest ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save lab test');
      }

      toast({ 
        title: labTest ? 'Lab test updated successfully' : 'Lab test added successfully'
      });
      onSave();
    } catch (error) {
      console.error('Error saving lab test:', error);
      toast({ 
        title: 'Error saving lab test',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive' 
      });
    }
  };

  // Get form completion percentage
  const formValues = watch();
  const requiredFields = ['name'];
  const completedFields = requiredFields.filter(field => formValues[field]).length;
  const completionPercentage = Math.round((completedFields / requiredFields.length) * 100);

  return (
    <div className={cn("max-h-[80vh] flex flex-col", language === 'ar' && 'rtl')}>
      {/* Compact Header */}
      <div className={cn("p-4 bg-gradient-to-r from-white to-blue-50/30 border-b flex-shrink-0", language === 'ar' && 'flex-row-reverse')}>
        <div className={cn("flex items-center gap-3", language === 'ar' && 'flex-row-reverse')}>
          <div className="p-2 bg-[#2463EB] rounded-lg">
            {labTest ? <Edit className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
          </div>
          <div className="flex-1">
            <h2 className={cn("text-lg font-bold text-gray-900", language === 'ar' && 'text-right')}>
              {labTest ? t('labTests.editTest') : t('labTests.addNew')}
            </h2>
            <p className={cn("text-sm text-gray-600", language === 'ar' && 'text-right')}>
              {labTest ? t('labTests.updateDetails') : t('labTests.addNew')}
            </p>
          </div>
          <Badge variant="secondary" className={cn(
            "px-2 py-1 text-xs",
            completionPercentage === 100 ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
          )}>
            {completionPercentage}% Complete
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
          {/* Section Header */}
          <div className={cn("flex items-center gap-3 mb-4", language === 'ar' && 'flex-row-reverse text-right')}>
            <div className="p-2 bg-blue-100 rounded-lg">
              <TestTube className="w-4 h-4 text-[#2463EB]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{t('labTests.details')}</h3>
            {errors && Object.keys(errors).length > 0 && (
              <Badge variant="destructive" className="ml-auto">
                <AlertCircle className="w-3 h-3 mr-1" />
                {Object.keys(errors).length} Error{Object.keys(errors).length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {/* Test Name */}
          <div className="space-y-2">
            <Label 
              htmlFor="name" 
              className={cn("text-sm font-semibold text-gray-700 flex items-center gap-2", language === 'ar' && 'text-right flex-row-reverse')}
            >
              <Microscope className="w-4 h-4 text-[#2463EB]" />
              {t('labTests.testName')} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              {...register('name', { required: 'Lab test name is required' })}
              placeholder="Enter lab test name (e.g., Complete Blood Count, Lipid Panel)"
              className={cn(
                "h-9 border-gray-300 bg-gray-50 focus:bg-white focus:border-[#2463EB] focus:ring-[#2463EB]/20 shadow-sm text-sm",
                errors.name && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                language === 'ar' && 'text-right'
              )}
            />
            {errors.name && (
              <p className={cn("text-red-500 text-sm mt-1 flex items-center gap-1", language === 'ar' && 'text-right flex-row-reverse')}>
                <AlertCircle className="w-3 h-3" />
                {String(errors.name.message)}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label 
              htmlFor="description" 
              className={cn("text-sm font-semibold text-gray-700 flex items-center gap-2", language === 'ar' && 'text-right flex-row-reverse')}
            >
              <FileText className="w-4 h-4 text-[#2463EB]" />
              {t('common.description')} <span className="text-gray-400 text-xs">(Optional)</span>
            </Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder={t('labTests.enterDetails')}
              rows={3}
              className={cn(
                "border-gray-300 bg-gray-50 focus:bg-white focus:border-[#2463EB] focus:ring-[#2463EB]/20 shadow-sm resize-none text-sm",
                language === 'ar' && 'text-right'
              )}
            />
          </div>

          {/* Test Categories Examples */}
          <div className={cn("p-3 bg-blue-50 rounded-lg border border-blue-200", language === 'ar' && 'text-right')}>
            <div className={cn("flex items-start gap-2 text-xs text-blue-800", language === 'ar' && 'flex-row-reverse')}>
              <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium mb-1">Common Lab Test Categories:</p>
                <div className={cn("grid grid-cols-2 gap-2 text-xs", language === 'ar' && 'text-right')}>
                  <div>
                    <p className="font-medium">Blood Tests:</p>
                    <p className="text-blue-700">CBC, Lipid Panel, Glucose</p>
                  </div>
                  <div>
                    <p className="font-medium">Chemistry:</p>
                    <p className="text-blue-700">Liver Panel, Kidney Function</p>
                  </div>
                  <div>
                    <p className="font-medium">Immunology:</p>
                    <p className="text-blue-700">Allergy Tests, Antibodies</p>
                  </div>
                  <div>
                    <p className="font-medium">Microbiology:</p>
                    <p className="text-blue-700">Culture Tests, Sensitivity</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Guidelines */}
          <div className={cn("p-3 bg-blue-50 rounded-lg border border-blue-200", language === 'ar' && 'text-right')}>
            <div className={cn("flex items-start gap-2 text-xs text-blue-800", language === 'ar' && 'flex-row-reverse')}>
              <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium mb-1">Lab Test Guidelines:</p>
                <p className={cn("text-xs", language === 'ar' && 'text-right')}>
                  • Use clear, standardized test names • Include test purpose in description • Ensure name matches laboratory standards
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
            disabled={isSubmitting}
            className="px-4 py-2"
          >
            Cancel
          </CancelButton>
        )}
        
        <SaveButton 
          type="submit"
          loading={isSubmitting}
          disabled={isSubmitting}
          className="px-6 py-2"
          onClick={handleSubmit(onSubmit)}
        >
          {labTest ? t('labTests.updateTest') : t('labTests.addTest')}
        </SaveButton>
      </div>
    </div>
  );
};