import React from 'react';
import { FileText, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { formatDateToDDMMYYYY } from '@/lib/dateUtils';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface VisitFilesProps {
  files: any[];
  patientId: string;
}

export const VisitFiles = ({ files, patientId }: VisitFilesProps) => {
  const { toast } = useToast();
  const { t, language } = useLanguage();

  if (!files?.length) return null;

  const handleDownload = async (file: any) => {
    try {
      // Use your MySQL file download endpoint
      const downloadUrl = `http://localhost:3002/patients/${patientId}/files/${file.id}/download`;
      
      // Open the download URL in a new tab/window
      window.open(downloadUrl, '_blank');

      toast({ title: t('message.fileDownloaded') });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({ 
        title: t('message.fileUploadError'), 
        description: t('message.error'),
        variant: 'destructive' 
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className={cn(language === 'ar' && "rtl")}>
      <CardHeader>
        <CardTitle className={cn("flex items-center gap-2", language === 'ar' && 'flex-row-reverse')}>
          <FileText className="w-5 h-5" />
          {t('visit.files')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {files.map((file) => (
            <div key={file.id} className={cn("flex items-center justify-between p-3 border rounded-lg", language === 'ar' && 'flex-row-reverse')}>
              <div className={cn("flex items-center space-x-3", language === 'ar' && 'flex-row-reverse space-x-reverse')}>
                <FileText className="w-5 h-5 text-blue-500" />
                <div className={cn(language === 'ar' && 'text-right')}>
                  <p className="font-medium">{file.file_name}</p>
                  {file.description && (
                    <p className="text-sm text-gray-600">{file.description}</p>
                  )}
                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    <span>Size: {formatFileSize(file.file_size)}</span>
                    <span>{t('visit.uploaded')}: {formatDateToDDMMYYYY(file.uploaded_at)}</span>
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDownload(file)}
                className={cn(language === 'ar' && 'flex-row-reverse')}
              >
                <Download className="w-4 h-4 mr-2" />
                {t('common.download')}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};