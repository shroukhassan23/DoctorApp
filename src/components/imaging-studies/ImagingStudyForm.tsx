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
import { managementImagingStudiesUrl, updateImagingStudyUrl } from '@/components/constants.js';
import { 
  Scan, 
  FileText, 
  AlertCircle,
  Plus,
  Edit,
  Info,
  Camera,
  Eye,
  Brain,
  Heart
} from 'lucide-react';

interface ImagingStudyFormProps {
  imagingStudy?: any;
  onSave: () => void;
  onCancel?: () => void;
}

export const ImagingStudyForm = ({ imagingStudy, onSave, onCancel }: ImagingStudyFormProps) => {
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: imagingStudy || {
      name: '',
      description: ''
    }
  });
  
  const { toast } = useToast();
  const { t, language } = useLanguage();

  // Set values when loading imaging study data
  useEffect(() => {
    if (imagingStudy) {
      Object.keys(imagingStudy).forEach((key) => {
        if (imagingStudy[key] !== undefined) {
          setValue(key, imagingStudy[key]);
        }
      });
    }
  }, [imagingStudy, setValue]);

  const onSubmit = async (data: any) => {
    try {
      const formData = {
        name: data.name?.trim(),
        description: data.description?.trim() || null
      };

      if (!formData.name) {
        toast({
          title: t('message.validationError'),
          description: 'Imaging study name is required.',
          variant: 'destructive'
        });
        return;
      }

      const url = imagingStudy ? updateImagingStudyUrl(imagingStudy.id) : managementImagingStudiesUrl;
      const method = imagingStudy ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save imaging study');
      }

      toast({ 
        title: imagingStudy ? 'Imaging study updated successfully' : 'Imaging study added successfully'
      });
      onSave();
    } catch (error) {
      console.error('Error saving imaging study:', error);
      toast({ 
        title: 'Error saving imaging study',
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
            {imagingStudy ? <Edit className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
          </div>
          <div className="flex-1">
            <h2 className={cn("text-lg font-bold text-gray-900", language === 'ar' && 'text-right')}>
              {imagingStudy ? t('imaging.editStudy') : t('imaging.addNew')}
            </h2>
            <p className={cn("text-sm text-gray-600", language === 'ar' && 'text-right')}>
              {imagingStudy ? t('imaging.updateDetails') : t('imaging.create')}
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
          {/* Section Header */}
          <div className={cn("flex items-center gap-3 mb-4", language === 'ar' && 'flex-row-reverse text-right')}>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Scan className="w-4 h-4 text-[#2463EB]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{t('imaging.detail')}</h3>
            {errors && Object.keys(errors).length > 0 && (
              <Badge variant="destructive" className="ml-auto">
                <AlertCircle className="w-3 h-3 mr-1" />
                {Object.keys(errors).length} Error{Object.keys(errors).length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {/* Study Name */}
          <div className="space-y-2">
            <Label 
              htmlFor="name" 
              className={cn("text-sm font-semibold text-gray-700 flex items-center gap-2", language === 'ar' && 'text-right flex-row-reverse')}
            >
              <Camera className="w-4 h-4 text-[#2463EB]" />
              {t('imaging.studyName')} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              {...register('name', { required: 'Imaging study name is required' })}
              placeholder={t('imaging.enterName')}
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
              {t('common.description')} <span className="text-gray-400 text-xs">{t('common.optional')}</span>
            </Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder={t('imaging.enterStudyDescription')}
              rows={3}
              className={cn(
                "border-gray-300 bg-gray-50 focus:bg-white focus:border-[#2463EB] focus:ring-[#2463EB]/20 shadow-sm resize-none text-sm",
                language === 'ar' && 'text-right'
              )}
            />
          </div>

          {/* Imaging Modalities Examples */}
          <div className={cn("p-3 bg-blue-50 rounded-lg border border-blue-200", language === 'ar' && 'text-right')}>
            <div className={cn("flex items-start gap-2 text-xs text-blue-800", language === 'ar' && 'flex-row-reverse')}>
              <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium mb-1">Common Imaging Modalities:</p>
                <div className={cn("grid grid-cols-2 gap-2 text-xs", language === 'ar' && 'text-right')}>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-[#2463EB]" />
                    <div>
                      <p className="font-medium">X-Ray:</p>
                      <p className="text-blue-700">Chest, Bone, Joint imaging</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Brain className="w-3 h-3 text-[#2463EB]" />
                    <div>
                      <p className="font-medium">MRI:</p>
                      <p className="text-blue-700">Brain, Spine, Soft tissue</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Scan className="w-3 h-3 text-[#2463EB]" />
                    <div>
                      <p className="font-medium">CT Scan:</p>
                      <p className="text-blue-700">Abdomen, Chest, Head</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3 text-[#2463EB]" />
                    <div>
                      <p className="font-medium">Ultrasound:</p>
                      <p className="text-blue-700">Cardiac, Abdominal, Pelvic</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Study Types Reference */}
          <div className={cn("p-3 bg-indigo-50 rounded-lg border border-indigo-200", language === 'ar' && 'text-right')}>
            <div className={cn("flex items-start gap-2 text-xs text-indigo-800", language === 'ar' && 'flex-row-reverse')}>
              <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium mb-1">Study Examples by Body System:</p>
                <div className={cn("text-xs space-y-1", language === 'ar' && 'text-right')}>
                  <p><span className="font-medium">Cardiovascular:</span> Echocardiogram, Cardiac CT, Angiography</p>
                  <p><span className="font-medium">Neurological:</span> Brain MRI, CT Head, Spine imaging</p>
                  <p><span className="font-medium">Pulmonary:</span> Chest X-Ray, CT Chest, Pulmonary angiogram</p>
                  <p><span className="font-medium">Musculoskeletal:</span> Bone X-Ray, Joint MRI, Bone scan</p>
                </div>
              </div>
            </div>
          </div>

          {/* Guidelines */}
          <div className={cn("p-3 bg-blue-50 rounded-lg border border-blue-200", language === 'ar' && 'text-right')}>
            <div className={cn("flex items-start gap-2 text-xs text-blue-800", language === 'ar' && 'flex-row-reverse')}>
              <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium mb-1">Imaging Study Guidelines:</p>
                <p className={cn("text-xs", language === 'ar' && 'text-right')}>
                  • Use standard medical imaging terminology • Include anatomical location and imaging method • Specify contrast usage if applicable
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
          {imagingStudy ? t('imaging.updateStudy') : t('imaging.addStudy')}
        </SaveButton>
      </div>
    </div>
  );
};