
import React, { useState } from 'react';
import { Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileUpload } from '../FileUpload';

interface PatientFilesProps {
  files: any[];
  patientId: string;
  onFileUploaded: () => void;
}

export const PatientFiles = ({ files, patientId, onFileUploaded }: PatientFilesProps) => {
  const [showFileUpload, setShowFileUpload] = useState(false);

  const handleFileUploaded = () => {
    onFileUploaded();
    setShowFileUpload(false);
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">General Files & Documents</h3>
        <Dialog open={showFileUpload} onOpenChange={setShowFileUpload}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Upload File
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload General File</DialogTitle>
            </DialogHeader>
            <FileUpload patientId={patientId} onUpload={handleFileUploaded} />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-3">
        {files?.map((file) => (
          <Card key={file.id}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium">{file.file_name}</p>
                    <p className="text-sm text-gray-600">{file.description}</p>
                    <p className="text-xs text-gray-400">
                      Uploaded: {new Date(file.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {!files?.length && (
          <p className="text-gray-500 text-center py-8">No general files uploaded yet.</p>
        )}
      </div>
    </>
  );
};
