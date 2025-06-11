
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { X, Upload } from 'lucide-react';

interface FileUploadProps {
  patientId: string;
  visitId?: string;
  onUpload: (fileData?: any) => void;
  isEmbedded?: boolean;
}

export const FileUpload = ({ patientId, visitId, onUpload, isEmbedded = false }: FileUploadProps) => {
  const { handleSubmit, reset } = useForm();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('File selected:', file?.name);
    setSelectedFile(file || null);
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (!selectedFile) {
      toast({ 
        title: 'No file selected', 
        description: 'Please select a file to upload.',
        variant: 'destructive' 
      });
      return;
    }

    setIsUploading(true);

    if (isEmbedded) {
      // In embedded mode, just prepare the file data
      const fileData = {
        file: selectedFile,
        description: ''
      };
      
      console.log('Adding file to embedded list:', fileData);
      setUploadedFiles(prev => {
        const updated = [...prev, fileData];
        console.log('Updated file list:', updated);
        return updated;
      });
      
      onUpload(fileData);
      setSelectedFile(null);
      
      // Reset the file input
      const fileInput = document.getElementById('file') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
      toast({ title: 'File added successfully' });
      setIsUploading(false);
      return;
    }

    try {
      // Check if storage bucket exists, if not create it
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'patient-files');
      
      if (!bucketExists) {
        console.log('Creating patient-files bucket...');
        const { error: bucketError } = await supabase.storage.createBucket('patient-files', {
          public: true,
          allowedMimeTypes: ['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
          fileSizeLimit: 10485760 // 10MB
        });
        
        if (bucketError) {
          console.error('Error creating bucket:', bucketError);
          throw bucketError;
        }
      }

      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${patientId}/${fileName}`;

      console.log('Uploading file to path:', filePath);

      const { error: uploadError } = await supabase.storage
        .from('patient-files')
        .upload(filePath, selectedFile);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { error: dbError } = await supabase
        .from('patient_files')
        .insert([{
          patient_id: patientId,
          visit_id: visitId || null,
          file_name: selectedFile.name,
          file_type: selectedFile.type,
          file_size: selectedFile.size,
          file_path: filePath,
          description: ''
        }]);

      if (dbError) {
        console.error('Database error:', dbError);
        throw dbError;
      }

      toast({ title: 'File uploaded successfully' });
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
        title: 'Error uploading file', 
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive' 
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index: number) => {
    console.log('Removing file at index:', index);
    setUploadedFiles(prev => {
      const updated = prev.filter((_, i) => i !== index);
      console.log('Updated file list after removal:', updated);
      return updated;
    });
  };

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="file">Select File *</Label>
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

        <div className="flex justify-end space-x-2">
          <Button 
            type="submit" 
            disabled={!selectedFile || isUploading}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {isUploading ? 'Adding...' : isEmbedded ? 'Add File' : 'Upload File'}
          </Button>
        </div>
      </form>

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
