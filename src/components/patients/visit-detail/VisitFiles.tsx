
import React from 'react';
import { FileText, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDateToDDMMYYYY } from '@/lib/dateUtils';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface VisitFilesProps {
  files: any[];
}

export const VisitFiles = ({ files }: VisitFilesProps) => {
  const { toast } = useToast();
  const { t, language } = useLanguage();

  if (!files?.length) return null;

  const handleDownload = async (file: any) => {
    try {
      console.log('Downloading file:', file);
      
      const { data, error } = await supabase.storage
        .from('patient-files')
        .download(file.file_path);

      if (error) {
        console.error('Download error:', error);
        throw error;
      }

      // Create a blob URL and trigger download
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

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
                  <p className="text-xs text-gray-400">
                    {t('visit.uploaded')}: {formatDateToDDMMYYYY(file.uploaded_at)}
                  </p>
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
