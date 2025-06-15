import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, 
  AlertTriangle, 
  FileText, 
  FileSpreadsheet,
  Presentation,
  ExternalLink,
  RefreshCw,
  Eye,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface OfflineOfficeViewerProps {
  file: {
    id: string;
    file_name: string;
    file_type: string;
    file_size: number;
  };
  fileUrl: string;
  onDownload: () => void;
}

const OfflineOfficeViewer = ({ file, fileUrl, onDownload }: OfflineOfficeViewerProps) => {
  const [viewerMethod, setViewerMethod] = useState<'download' | 'browser' | 'preview'>('download');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const displayFilename = file.file_name;
  const extension = displayFilename.split('.').pop()?.toLowerCase() || '';

  const getFileTypeInfo = () => {
    if (['xlsx', 'xls', 'csv', 'ods'].includes(extension)) {
      return {
        type: 'spreadsheet',
        icon: <FileSpreadsheet className="w-8 h-8 text-green-600" />,
        name: 'Spreadsheet',
        description: 'Excel or CSV file containing tabular data'
      };
    }
    
    if (['docx', 'doc', 'odt', 'rtf'].includes(extension)) {
      return {
        type: 'document',
        icon: <FileText className="w-8 h-8 text-blue-500" />,
        name: 'Document',
        description: 'Word document or text file'
      };
    }
    
    if (['pptx', 'ppt', 'odp'].includes(extension)) {
      return {
        type: 'presentation',
        icon: <Presentation className="w-8 h-8 text-orange-500" />,
        name: 'Presentation',
        description: 'PowerPoint presentation file'
      };
    }
    
    return {
      type: 'document',
      icon: <FileText className="w-8 h-8 text-gray-500" />,
      name: 'Office Document',
      description: 'Microsoft Office document'
    };
  };

  const fileTypeInfo = getFileTypeInfo();

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Check if browser can handle the file type
  const canBrowserOpen = () => {
    // Only text-based files can be opened directly in browser
    return ['txt', 'csv', 'rtf'].includes(extension);
  };

  // Check if file can have text preview
  const canTextPreview = () => {
    // Only allow text preview for truly text-based files
    return ['txt', 'csv', 'rtf', 'html', 'xml', 'json'].includes(extension);
  };

  // Try to open in browser (for CSV/RTF files)
  const handleBrowserOpen = () => {
    if (canBrowserOpen()) {
      window.open(fileUrl, '_blank');
    }
  };

  // Alternative viewers for different file types
  const renderAlternativeViewers = () => {
    return (
      <div className="space-y-4 max-h-[60vh] overflow-y-auto">
        {/* File Information Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              {fileTypeInfo.icon}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base truncate">{displayFilename}</h3>
                <p className="text-gray-600 text-sm">{fileTypeInfo.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-1 flex-wrap">
                  <span>{fileTypeInfo.name}</span>
                  <span>{formatFileSize(file.file_size)}</span>
                  <span className="uppercase">{extension} file</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Viewing Options */}
        <Tabs value={viewerMethod} onValueChange={(value) => setViewerMethod(value as any)}>
          <TabsList className={`grid w-full ${canTextPreview() ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <TabsTrigger value="download">Download & Open</TabsTrigger>
            <TabsTrigger value="browser" disabled={!canBrowserOpen()}>
              Browser View
            </TabsTrigger>
            {canTextPreview() && (
              <TabsTrigger value="preview">Text Preview</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="download" className="space-y-4">
            <Alert>
              <Download className="h-4 w-4" />
              <AlertDescription>
                For the best viewing experience, download the file and open it with the appropriate application 
                (Microsoft Office, LibreOffice, etc.).
              </AlertDescription>
            </Alert>

            <div className="flex flex-col items-center justify-center py-8 bg-gray-50 rounded-lg">
              {fileTypeInfo.icon}
              <h3 className="text-base font-medium mt-4 mb-2">Download Required</h3>
              <p className="text-gray-600 text-center mb-4 max-w-md text-sm">
                Office documents need to be downloaded and opened with compatible software for proper viewing.
              </p>
              
              <div className="flex gap-3">
                <Button onClick={onDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Download File
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => window.open(fileUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in New Tab
                </Button>
              </div>

              <div className="mt-4 text-xs text-gray-500 text-center">
                <p>Recommended applications:</p>
                <div className="mt-1">
                  {fileTypeInfo.type === 'spreadsheet' && <span>Excel • LibreOffice Calc • Google Sheets</span>}
                  {fileTypeInfo.type === 'document' && <span>Word • LibreOffice Writer • Google Docs</span>}
                  {fileTypeInfo.type === 'presentation' && <span>PowerPoint • LibreOffice Impress • Google Slides</span>}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="browser" className="space-y-4">
            {canBrowserOpen() ? (
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    This file type can be opened directly in your browser.
                  </AlertDescription>
                </Alert>

                <Button onClick={handleBrowserOpen} className="w-full">
                  <Eye className="w-4 h-4 mr-2" />
                  Open in Browser
                </Button>

                {/* For CSV files, try to display as table */}
                {extension === 'csv' && (
                  <div className="bg-white border rounded-lg h-64">
                    <iframe
                      src={fileUrl}
                      className="w-full h-full border-0 rounded-lg"
                      title={displayFilename}
                    />
                  </div>
                )}
              </div>
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This file type cannot be opened directly in the browser. Please use the download option.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {canTextPreview() && (
            <TabsContent value="preview" className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Displaying text content preview. Formatting may not be preserved.
                </AlertDescription>
              </Alert>

              <TextPreviewAttempt fileUrl={fileUrl} fileName={displayFilename} />
            </TabsContent>
          )}
        </Tabs>

        {/* Additional Information */}
        <Card>
          <CardContent className="p-3">
            <h4 className="font-medium mb-2 text-sm">Offline Viewing Tips:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Download the file for the best viewing experience</li>
              <li>• Use LibreOffice (free) if you don't have Microsoft Office</li>
              <li>• Google Workspace can open many Office formats online</li>
              <li>• Some mobile apps can preview Office documents</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  };

  return renderAlternativeViewers();
};

// Component to attempt text preview extraction
const TextPreviewAttempt = ({ fileUrl, fileName }: { fileUrl: string; fileName: string }) => {
  const [content, setContent] = useState<string>('');
  const [tableData, setTableData] = useState<string[][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const attemptTextExtraction = async () => {
      try {
        const extension = fileName.split('.').pop()?.toLowerCase();
        
        // Only attempt text extraction for truly text-based files
        if (!['txt', 'csv', 'rtf', 'html', 'xml', 'json'].includes(extension || '')) {
          setError('This file type cannot be previewed as text. Binary office documents (DOCX, XLSX, PPTX) contain encoded data that cannot be displayed as readable text.');
          setLoading(false);
          return;
        }

        const response = await fetch(fileUrl);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${response.status}`);
        }

        const text = await response.text();
        
        // For CSV files, parse into table
        if (extension === 'csv') {
          const lines = text.split('\n').slice(0, 50); // Limit to first 50 rows
          const rows = lines
            .filter(line => line.trim()) // Remove empty lines
            .map(line => {
              // Simple CSV parsing (doesn't handle quotes properly, but good enough for preview)
              return line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''));
            });
          
          if (rows.length > 0) {
            setTableData(rows);
            setLoading(false);
            return;
          }
        }

        // For other text files
        if (text.trim()) {
          setContent(text.substring(0, 5000)); // Limit preview to first 5000 characters
        } else {
          setError('File appears to be empty or contains no readable text content');
        }
      } catch (err) {
        console.error('Text extraction error:', err);
        setError('Unable to extract text preview from this file. The file may be corrupted or not accessible.');
      } finally {
        setLoading(false);
      }
    };

    attemptTextExtraction();
  }, [fileUrl, fileName]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Extracting preview...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Render CSV table
  if (tableData.length > 0) {
    return (
      <div className="border rounded-lg overflow-auto max-h-64">
        <table className="w-full text-sm">
          <tbody>
            {tableData.map((row, index) => (
              <tr key={index} className={index === 0 ? 'bg-gray-100 font-medium' : ''}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="border border-gray-200 px-2 py-1">
                    {cell || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-gray-500 p-2 bg-gray-50">
          Preview limited to first 50 rows. Download file to view complete content.
        </p>
      </div>
    );
  }

  // Render text content
  return (
    <div className="bg-white border rounded-lg p-4 max-h-64 overflow-auto">
      <pre className="text-sm whitespace-pre-wrap font-mono text-gray-800">{content}</pre>
      {content.length >= 5000 && (
        <p className="text-xs text-gray-500 mt-2 pt-2 border-t">
          Preview truncated at 5000 characters. Download file to view complete content.
        </p>
      )}
    </div>
  );
};

export default OfflineOfficeViewer;