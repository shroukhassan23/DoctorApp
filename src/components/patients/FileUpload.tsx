import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { X, Upload } from 'lucide-react';
import { uploadPatientFileUrl } from '@/components/constants.js';
import { useLanguage } from '@/contexts/LanguageContext';

interface FileUploadProps {
  patientId: string;
  visitId?: string;
  onUpload: (fileData?: any) => void;
  isEmbedded?: boolean;
}

export const FileUpload = ({ patientId, visitId, onUpload, isEmbedded = false }: FileUploadProps) => {
  const { register, handleSubmit, reset, watch } = useForm();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const description = watch('description');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
  };

  const onSubmit = async (data: any) => {
    if (!selectedFile) {
      toast({ 
        title: t('message.nofile'), 
        description: t('message.pleaseSelectFile'),
        variant: 'destructive' 
      });
      return;
    }

    setIsUploading(true);

    if (isEmbedded) {
      // In embedded mode, just prepare the file data
      const fileData = {
        file: selectedFile,
        description: data.description || ''
      };
      
      setUploadedFiles(prev => {
        const updated = [...prev, fileData];
        return updated;
      });
      
      onUpload(fileData);
      setSelectedFile(null);
      reset();
      
      // Reset the file input
      const fileInput = document.getElementById('file') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
      toast({ title: t('message.fileAdded') });
      setIsUploading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('description', data.description || '');
      if (visitId) {
        formData.append('visitId', visitId);
      }

      const response = await fetch(uploadPatientFileUrl(patientId), {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();

      toast({ title: t('message.fileUploaded') });
      reset();
      setSelectedFile(null);
      
      // Reset the file input
      const fileInput = document.getElementById('file') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
      onUpload();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({ 
        title: t('message.fileUploadError'), 
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive' 
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => {
      const updated = prev.filter((_, i) => i !== index);
      return updated;
    });
  };

  // Handle add file button click for embedded mode
  const handleAddFile = () => {
    const formData = new FormData();
    const descriptionValue = (document.getElementById('description') as HTMLTextAreaElement)?.value || '';
    
    onSubmit({ description: descriptionValue });
  };

  return (
    <div className="space-y-4">
      {/* Remove the form wrapper when embedded */}
      {isEmbedded ? (
        <div className="space-y-4">
          <div>
            <Label htmlFor="file">{t('visit.selectFiles')}*</Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
            />
            {selectedFile && (
              <p className="text-sm text-green-600 mt-1">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="description">{t('visit.description')}</Label>
            <Textarea
              id="description"
              placeholder={t('visit.enterDescription')}
              rows={2}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button 
              type="button"
              onClick={handleAddFile}
              disabled={!selectedFile || isUploading}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {isUploading ? t('message.add') : t('visit.addFile')}
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="file">{t('visit.selectFiles')}*</Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.mp4,.mp3,.xlsx,.csv,.xls"
            />
            {selectedFile && (
              <p className="text-sm text-green-600 mt-1">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="description">{t('visit.description')}</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder={t('visit.enterDescription')}
              rows={2}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button 
              type="submit" 
              disabled={!selectedFile || isUploading}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {isUploading ? t('message.upload') : t('visit.uploadFile')}
            </Button>
          </div>
        </form>
      )}

      {isEmbedded && uploadedFiles.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium mb-2">Files to Upload ({uploadedFiles.length}):</h4>
          <div className="space-y-2">
            {uploadedFiles.map((fileItem, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-md bg-gray-50">
                <div className="flex-1">
                  <p className="font-medium text-sm">{fileItem.file.name}</p>
                  <p className="text-xs text-gray-500">
                    {fileItem.file.type} • {(fileItem.file.size / 1024).toFixed(1)} KB
                  </p>
                  {fileItem.description && (
                    <p className="text-xs text-gray-600 mt-1">{fileItem.description}</p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="ml-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};