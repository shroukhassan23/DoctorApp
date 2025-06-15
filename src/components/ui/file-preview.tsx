import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Maximize2, 
  Minimize2,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Eye,
  FileSpreadsheet,
  FileImage,
  Film,
  Music,
  Archive,
  Presentation
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import OfflineOfficeViewer from './office-viewer';

interface EnhancedFilePreviewerProps {
  file: {
    id: string;
    file_name: string;
    file_type: string;
    file_size: number;
    uploaded_at: string;
  };
  fileUrl: string;
  onDownload: () => void;
  onClose?: () => void;
}

export const EnhancedFilePreviewer = ({ 
  file, 
  fileUrl, 
  onDownload, 
  onClose 
}: EnhancedFilePreviewerProps) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to properly decode filename
  const decodeFilename = (filename: string) => {
    try {
      if (filename.includes('�') || /[\u00C0-\u024F\u1E00-\u1EFF]/.test(filename)) {
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

  const getDisplayFilename = (filename: string) => {
    const decoded = decodeFilename(filename);
    if (decoded.includes('�') || /[ÙØªØ§Ø¨]/.test(decoded)) {
      const extension = decoded.split('.').pop() || '';
      return `Document.${extension}`;
    }
    return decoded;
  };

  const displayFilename = getDisplayFilename(file.file_name);
  const extension = displayFilename.split('.').pop()?.toLowerCase() || '';

  // Enhanced file type detection
  const getFileTypeInfo = () => {
    const fileType = file.file_type?.toLowerCase() || '';
    
    // Images
    if (fileType.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff'].includes(extension)) {
      return {
        type: 'image',
        icon: <FileImage className="w-5 h-5 text-green-500" />,
        canPreview: true,
        category: 'Image'
      };
    }
    
    // PDFs
    if (fileType.includes('pdf') || extension === 'pdf') {
      return {
        type: 'pdf',
        icon: <FileText className="w-5 h-5 text-red-500" />,
        canPreview: true,
        category: 'PDF Document'
      };
    }
    
    // Excel files
    if (fileType.includes('spreadsheet') || fileType.includes('excel') || 
        ['xlsx', 'xls', 'csv', 'ods'].includes(extension)) {
      return {
        type: 'spreadsheet',
        icon: <FileSpreadsheet className="w-5 h-5 text-green-600" />,
        canPreview: false,
        category: 'Spreadsheet',
        needsOfflineViewer: true
      };
    }
    
    // Word documents
    if (fileType.includes('word') || fileType.includes('document') || 
        ['docx', 'doc', 'odt', 'rtf'].includes(extension)) {
      return {
        type: 'document',
        icon: <FileText className="w-5 h-5 text-blue-500" />,
        canPreview: false,
        category: 'Document',
        needsOfflineViewer: true
      };
    }
    
    // PowerPoint
    if (fileType.includes('presentation') || ['pptx', 'ppt', 'odp'].includes(extension)) {
      return {
        type: 'presentation',
        icon: <Presentation className="w-5 h-5 text-orange-500" />,
        canPreview: false,
        category: 'Presentation',
        needsOfflineViewer: true
      };
    }
    
    // Videos
    if (fileType.includes('video') || ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(extension)) {
      return {
        type: 'video',
        icon: <Film className="w-5 h-5 text-purple-500" />,
        canPreview: true,
        category: 'Video'
      };
    }
    
    // Audio
    if (fileType.includes('audio') || ['mp3', 'wav', 'ogg', 'aac', 'flac'].includes(extension)) {
      return {
        type: 'audio',
        icon: <Music className="w-5 h-5 text-pink-500" />,
        canPreview: true,
        category: 'Audio'
      };
    }
    
    // Text files
    if (fileType.includes('text') || ['txt', 'md', 'json', 'xml', 'html', 'css', 'js'].includes(extension)) {
      return {
        type: 'text',
        icon: <FileText className="w-5 h-5 text-gray-500" />,
        canPreview: true,
        category: 'Text Document'
      };
    }
    
    // Archives
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
      return {
        type: 'archive',
        icon: <Archive className="w-5 h-5 text-yellow-600" />,
        canPreview: false,
        category: 'Archive'
      };
    }
    
    // Default
    return {
      type: 'unknown',
      icon: <FileText className="w-5 h-5 text-gray-500" />,
      canPreview: false,
      category: 'Unknown'
    };
  };

  const fileTypeInfo = getFileTypeInfo();

  // Handle loading state based on file type - MOVED TO useEffect
  useEffect(() => {
    console.log(`File type detected: ${fileTypeInfo.type}`);
    console.log(`File URL: ${fileUrl}`);
    
    // For non-previewable files, set loading to false immediately
    if (!fileTypeInfo.canPreview || 
        fileTypeInfo.type === 'unknown' || 
        fileTypeInfo.type === 'spreadsheet' || 
        fileTypeInfo.type === 'document' || 
        fileTypeInfo.type === 'presentation') {
      console.log('Non-previewable file type, setting loading to false');
      setLoading(false);
      return;
    }

    // For videos and audio, reduce timeout
    if (fileTypeInfo.type === 'video' || fileTypeInfo.type === 'audio') {
      console.log(`${fileTypeInfo.type} detected, setting 4 second timeout before showing`);
      const mediaTimeout = setTimeout(() => {
        console.log(`${fileTypeInfo.type} timeout reached, showing media`);
        setLoading(false);
      }, 4000); // 4 seconds for media files

      return () => {
        console.log(`Cleaning up ${fileTypeInfo.type} timeout`);
        clearTimeout(mediaTimeout);
      };
    }

    // For images, reduce timeout 
    if (fileTypeInfo.type === 'image') {
      console.log('Image detected, setting 3 second timeout before showing');
      const imageTimeout = setTimeout(() => {
        console.log('Image timeout reached, showing image');
        setLoading(false); // Just show the image, don't set error
      }, 3000); // 3 seconds for images

      return () => {
        console.log('Cleaning up image timeout');
        clearTimeout(imageTimeout);
      };
    }

    // For PDFs, reduce timeout and handle differently
    if (fileTypeInfo.type === 'pdf') {
      console.log('PDF detected, setting 3 second timeout before showing');
      const pdfTimeout = setTimeout(() => {
        console.log('PDF timeout reached, showing PDF');
        setLoading(false); // Just show the PDF, don't set error
      }, 3000); // Reduced to 3 seconds

      return () => {
        console.log('Cleaning up PDF timeout');
        clearTimeout(pdfTimeout);
      };
    }

    // For other previewable files, set a general timeout
    const generalTimeout = setTimeout(() => {
      console.log('General timeout reached');
      setLoading(false);
      setError('File loading timeout. Try downloading the file instead.');
    }, 10000);

    return () => clearTimeout(generalTimeout);
  }, [fileTypeInfo.type, fileUrl]);

  // Test file accessibility for previewable files
  useEffect(() => {
    if (fileTypeInfo.canPreview && 
        (fileTypeInfo.type === 'image' || fileTypeInfo.type === 'pdf' || 
         fileTypeInfo.type === 'video' || fileTypeInfo.type === 'audio')) {
      
      console.log('Testing file accessibility...');
      fetch(fileUrl, { method: 'HEAD' })
        .then(response => {
          console.log('File access test response:', response.status, response.headers.get('content-type'));
          if (!response.ok) {
            setError(`File not accessible (${response.status})`);
            setLoading(false);
          }
        })
        .catch(err => {
          console.error('File access test error:', err);
          setError('Network error - cannot load file');
          setLoading(false);
        });
    }
  }, [fileUrl, fileTypeInfo.canPreview, fileTypeInfo.type]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleZoom = (direction: 'in' | 'out') => {
    if (direction === 'in') {
      setZoomLevel(Math.min(300, zoomLevel + 25));
    } else {
      setZoomLevel(Math.max(25, zoomLevel - 25));
    }
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const renderPreview = () => {
    switch (fileTypeInfo.type) {
      case 'image':
        return (
          <div className="flex justify-center items-center h-full max-h-[50vh] bg-gray-100 rounded-lg overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                <p className="text-sm text-gray-600 mb-4">Loading image...</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setLoading(false)}
                >
                  Show Image Now
                </Button>
              </div>
            ) : (
              <img
                src={fileUrl}
                alt={displayFilename}
                style={{ 
                  transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
                className="transition-transform duration-200"
                onLoad={() => {
                  console.log('Image loaded successfully');
                  // Don't set loading here, let timeout handle it
                }}
                onError={() => {
                  console.log('Image failed to load');
                  setError('Failed to load image');
                }}
              />
            )}
          </div>
        );

      case 'pdf':
        return (
          <div className="w-full h-full max-h-[50vh] bg-gray-100 rounded-lg">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                <p className="text-sm text-gray-600 mb-4">Preparing PDF preview...</p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setLoading(false)}
                  >
                    Show PDF Now
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onDownload}
                  >
                    Download PDF
                  </Button>
                </div>
              </div>
            ) : (
              <iframe
                src={fileUrl}
                className="w-full h-full min-h-[400px] max-h-[50vh] border-0 rounded-lg"
                title={displayFilename}
                style={{ backgroundColor: 'white' }}
              />
            )}
          </div>
        );

      case 'video':
        return (
          <div className="flex justify-center bg-black rounded-lg h-full max-h-[50vh]">
            {loading ? (
              <div className="flex flex-col items-center justify-center text-white">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                <p className="text-sm mb-4">Loading video...</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setLoading(false)}
                >
                  Show Video Now
                </Button>
              </div>
            ) : (
              <video
                controls
                className="max-w-full max-h-full object-contain"
                onLoadedData={() => {
                  console.log('Video loaded successfully');
                  // Don't set loading here, let timeout handle it
                }}
                onError={() => {
                  console.log('Video failed to load');
                  setError('Failed to load video');
                }}
              >
                <source src={fileUrl} type={file.file_type} />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        );

      case 'audio':
        return (
          <div className="flex flex-col items-center justify-center min-h-[200px] bg-gray-100 rounded-lg">
            {loading ? (
              <div className="flex flex-col items-center justify-center">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                <p className="text-sm text-gray-600 mb-4">Loading audio...</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setLoading(false)}
                >
                  Show Audio Now
                </Button>
              </div>
            ) : (
              <>
                <Music className="w-16 h-16 text-gray-400 mb-4" />
                <audio
                  controls
                  className="w-full max-w-md"
                  onLoadedData={() => {
                    console.log('Audio loaded successfully');
                    // Don't set loading here, let timeout handle it
                  }}
                  onError={() => {
                    console.log('Audio failed to load');
                    setError('Failed to load audio');
                  }}
                >
                  <source src={fileUrl} type={file.file_type} />
                  Your browser does not support the audio tag.
                </audio>
              </>
            )}
          </div>
        );

      case 'text':
        return (
          <div className="bg-white border rounded-lg min-h-[400px]">
            <iframe
              src={fileUrl}
              className="w-full h-full min-h-[400px] border-0 rounded-lg"
              title={displayFilename}
              onLoad={() => {
                console.log('Text file loaded successfully');
                setLoading(false);
              }}
              onError={() => {
                console.log('Text file failed to load');
                setLoading(false);
                setError('Failed to load text file');
              }}
            />
          </div>
        );

      case 'spreadsheet':
      case 'document':
      case 'presentation':
        return <OfflineOfficeViewer file={file} fileUrl={fileUrl} onDownload={onDownload} />;

      default:
        return (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-gray-500">
            {fileTypeInfo.icon}
            <div className="mt-4 text-center">
              <p className="text-lg font-medium">Preview not available</p>
              <p className="text-sm">This file type cannot be previewed in the browser</p>
              <Button onClick={onDownload} className="mt-4">
                <Download className="w-4 h-4 mr-2" />
                Download to view
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={cn(
      "flex flex-col h-full max-h-full overflow-hidden",
      isFullscreen ? "fixed inset-0 z-50 bg-white" : "max-h-[80vh]"
    )}>
      {/* Header */}
      <Card className="flex-shrink-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {fileTypeInfo.icon}
              <div className="min-w-0 flex-1">
                <CardTitle className="text-lg truncate">{displayFilename}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1 flex-wrap">
                  <span>{fileTypeInfo.category}</span>
                  <span>{formatFileSize(file.file_size)}</span>
                  <span>{new Date(file.uploaded_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Controls */}
            {/* <div className="flex items-center gap-2 flex-shrink-0" style={{margin: '0 50px'}}>
              {fileTypeInfo.type === 'image' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleZoom('out')}
                    disabled={zoomLevel <= 25}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm min-w-[3rem] text-center">{zoomLevel}%</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleZoom('in')}
                    disabled={zoomLevel >= 300}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRotate}
                  >
                    <RotateCw className="w-4 h-4" />
                  </Button>
                </>
              )}

              <Separator orientation="vertical" className="h-8" />

              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onDownload}
              >
                <Download className="w-4 h-4" />
              </Button>

              {onClose && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                >
                  Close
                </Button>
              )}
            </div> */}
          </div>
        </CardHeader>
      </Card>

      {/* Content */}
      <div className="flex-1 p-4 overflow-auto min-h-0">
        {loading && (
          <div className="flex items-center justify-center h-full min-h-[300px]">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-2">Loading preview...</span>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && !error && renderPreview()}
      </div>
    </div>
  );
};