import React, { useState } from 'react';
import { Upload, FileText, Trash2, Eye, X, Download, ZoomIn, ZoomOut, Music, Film, FileImage, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { FileUpload } from '../FileUpload';
import { useToast } from '@/hooks/use-toast';
import { downloadPatientFileUrl, deletePatientFileUrl, previewPatientFileUrl } from '@/components/constants.js';
import { useLanguage } from '@/contexts/LanguageContext';
import { EnhancedFilePreviewer } from '@/components/ui/file-preview';
interface PatientFilesProps {
  files: any[];
  patientId: string;
  onFileUploaded: () => void;
}

export const PatientFiles = ({ files, patientId, onFileUploaded }: PatientFilesProps) => {
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<any>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const handleFileUploaded = () => {
    onFileUploaded();
    setShowFileUpload(false);
  };

  // Function to properly decode filename if it's corrupted
  const decodeFilename = (filename: string) => {
    try {
      // Handle UTF-8 encoding issues
      if (filename.includes('�') || /[\u00C0-\u024F\u1E00-\u1EFF]/.test(filename)) {
        // Try multiple decoding strategies
        try {
          return decodeURIComponent(escape(filename));
        } catch {
          return new TextDecoder('utf-8', { fatal: false }).decode(
            new TextEncoder().encode(filename)
          );
        }
      }
      return filename;
    } catch (error) {
      console.warn('Failed to decode filename:', filename);
      return filename.replace(/[^\w\-_.]/g, '_') + '_decoded';
    }
  };

  // Function to get clean filename for display
  const getDisplayFilename = (filename: string) => {
    const decoded = decodeFilename(filename);
    // If still corrupted, try to extract a meaningful name
    if (decoded.includes('�') || /[ÙØªØ§Ø¨]/.test(decoded)) {
      // Extract file extension
      const extension = decoded.split('.').pop() || '';
      return `Document.${extension}`;
    }
    return decoded;
  };

  const handleDownload = (file: any) => {
    const downloadUrl = downloadPatientFileUrl(patientId, file.id);
    // Create a temporary link to trigger download with proper filename
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = getDisplayFilename(file.file_name);
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = (file: any) => {
    setPreviewFile(file);
    setZoomLevel(100);
  };

  const closePreview = () => {
    setPreviewFile(null);
    setZoomLevel(100);
  };

  const handleDelete = async (fileId: string) => {
    setIsDeleting(fileId);
    try {
      const response = await fetch(deletePatientFileUrl(patientId, fileId), {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Delete failed');
      }

      toast({ title: t('message.fileDeleted') });
      onFileUploaded(); // Refresh the files list
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: t('message.fileDeleteError'),
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Function to get file icon based on type
  const getFileIcon = (filename: string, fileType: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
  
    if (fileType?.includes('pdf') || extension === 'pdf') {
      return <FileText className="w-5 h-5 text-red-500" />;
    }
    if (fileType?.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) {
      return <FileImage className="w-5 h-5 text-green-500" />;
    }
    if (fileType?.includes('spreadsheet') || ['xlsx', 'xls', 'csv'].includes(extension || '')) {
      return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
    }
    if (fileType?.includes('word') || ['doc', 'docx'].includes(extension || '')) {
      return <FileText className="w-5 h-5 text-blue-500" />;
    }
    if (fileType?.includes('presentation') || ['ppt', 'pptx'].includes(extension || '')) {
      return <FileText className="w-5 h-5 text-orange-500" />;
    }
    if (fileType?.includes('video') || ['mp4', 'avi', 'mov', 'webm'].includes(extension || '')) {
      return <Film className="w-5 h-5 text-purple-500" />;
    }
    if (fileType?.includes('audio') || ['mp3', 'wav', 'ogg'].includes(extension || '')) {
      return <Music className="w-5 h-5 text-pink-500" />;
    }
    return <FileText className="w-5 h-5 text-gray-500" />;
  };
  // Function to check if file can be previewed
  const canPreview = (fileType: string, filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
    const documentTypes = ['application/pdf', 'text/plain'];
    const documentExtensions = ['pdf', 'txt', 'md'];
    const videoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/webm'];
    const videoExtensions = ['mp4', 'avi', 'mov', 'webm'];
    const audioTypes = ['audio/mp3', 'audio/wav', 'audio/ogg'];
    const audioExtensions = ['mp3', 'wav', 'ogg', 'aac'];
    
    // Office documents can be "previewed" through online viewers
    const officeTypes = ['application/vnd.openxmlformats-officedocument', 'application/msword'];
    const officeExtensions = ['docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt'];
  
    return (
      imageTypes.some(type => fileType?.includes(type)) ||
      imageExtensions.includes(extension || '') ||
      documentTypes.some(type => fileType?.includes(type)) ||
      documentExtensions.includes(extension || '') ||
      videoTypes.some(type => fileType?.includes(type)) ||
      videoExtensions.includes(extension || '') ||
      audioTypes.some(type => fileType?.includes(type)) ||
      audioExtensions.includes(extension || '') ||
      officeTypes.some(type => fileType?.includes(type)) ||
      officeExtensions.includes(extension || '')
    );
  };

  // Function to get file URL for preview
  const getFileUrl = (file: any) => {
    return previewPatientFileUrl(patientId, file.id);
  };

  // Preview component
  const FilePreview = ({ file }: { file: any }) => {
    
    const fileUrl = getFileUrl(file);
    const displayFilename = getDisplayFilename(file.file_name);
    const extension = displayFilename.split('.').pop()?.toLowerCase();
    const isImage = file.file_type?.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '');
    const isPdf = file.file_type?.includes('pdf') || extension === 'pdf';
    const isText = file.file_type?.includes('text') || extension === 'txt';

    return (
      <div className="relative w-full h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center space-x-3">
            {getFileIcon(displayFilename, file.file_type)}
            <div>
              <h3 className="font-medium text-sm">{displayFilename}</h3>
              <p className="text-xs text-gray-500">
                {formatFileSize(file.file_size)} • {new Date(file.uploaded_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isImage && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoomLevel(Math.max(25, zoomLevel - 25))}
                  disabled={zoomLevel <= 25}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-600">{zoomLevel}%</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoomLevel(Math.min(200, zoomLevel + 25))}
                  disabled={zoomLevel >= 200}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </>
            )}
            <Button style={{marginRight: '50px'}} variant="outline" size="sm" onClick={() => handleDownload(file)}>
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 bg-gray-100">
          {isImage && (
            <div className="flex justify-center">
              <img
                src={fileUrl}
                alt={displayFilename}
                style={{ transform: `scale(${zoomLevel / 100})` }}
                className="max-w-none transition-transform duration-200"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-image.png';
                }}
              />
            </div>
          )}

          {isPdf && (
            <div className="w-full h-96">
              <iframe
                src={fileUrl}
                className="w-full h-full border border-gray-300 rounded"
                title={displayFilename}
                style={{ minHeight: '500px' }}
              />
            </div>
          )}

          {isText && (
            <div className="bg-white p-4 rounded border">
              <iframe
                src={fileUrl}
                className="w-full h-96 border-0"
                title={displayFilename}
              />
            </div>
          )}

          {!isImage && !isPdf && !isText && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <FileText className="w-16 h-16 mb-4" />
              <p className="text-lg font-medium">Preview not available</p>
              <p className="text-sm">This file type cannot be previewed</p>
              <Button
                onClick={() => handleDownload(file)}
                className="mt-4"
              >
                Download to view
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{t('patients.generalFiles')}</h3>
        <Dialog open={showFileUpload} onOpenChange={setShowFileUpload}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              {t('visit.uploadFile')}
            </Button>
          </DialogTrigger>
          <DialogContent aria-describedby="upload-dialog-description">
            <DialogHeader>
              <DialogTitle>{t('patients.generalFiles')}</DialogTitle>
              <DialogDescription>
                Upload a file to attach to this patient's record. Supported formats include images, PDFs, and documents.
              </DialogDescription>
            </DialogHeader>
            <FileUpload patientId={patientId} onUpload={handleFileUploaded} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {files?.map((file) => {
          const displayFilename = getDisplayFilename(file.file_name);
          const canPreviewFile = canPreview(file.file_type, displayFilename);

          return (
            <Card key={file.id}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(displayFilename, file.file_type)}
                    <div className="flex-1">
                      <p className="font-medium break-all" title={displayFilename}>
                        {displayFilename}
                      </p>
                      {file.description && (
                        <p className="text-sm text-gray-600">{file.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <span>Size: {formatFileSize(file.file_size)}</span>
                        <span>Uploaded: {new Date(file.uploaded_at).toLocaleDateString()}</span>
                        {canPreviewFile && (
                          <span className="text-blue-500">• Previewable</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {canPreviewFile && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(file)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        {t('visit.previewFile')}
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(file)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      {t('visit.downloadFile')}
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isDeleting === file.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete File</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{displayFilename}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(file.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {!files?.length && (
          <p className="text-gray-500 text-center py-8">No general files uploaded yet.</p>
        )}
      </div>

      {/* File Preview Dialog */}
      {previewFile && (
        <Dialog open={!!previewFile} onOpenChange={closePreview}>
          <DialogContent className="max-w-4xl w-full h-[80vh] p-0">
            <DialogHeader className="sr-only">
              <DialogTitle>File Preview: {getDisplayFilename(previewFile.file_name)}</DialogTitle>
              <DialogDescription>
                Preview of {getDisplayFilename(previewFile.file_name)} - {formatFileSize(previewFile.file_size)}
              </DialogDescription>
            </DialogHeader>
            <EnhancedFilePreviewer
  file={previewFile}
  fileUrl={getFileUrl(previewFile)}
  onDownload={() => handleDownload(previewFile)}
  onClose={closePreview}
/>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};