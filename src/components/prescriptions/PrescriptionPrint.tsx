import React, { useRef, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, Settings } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { doctorProfileUrl, getPatientByIdUrl } from '@/components/constants.js';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  PrintSettings, 
  usePrintSettings 
} from './PrintSettings';

interface PrescriptionPrintProps {
  prescription: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const defaultPrintSettings: PrintSettings = {
  paperSize: 'A4',
  orientation: 'portrait',
  margins: 'normal',
  fontSize: 'medium',
  includeHeader: true,
  includeFooter: true,
  colorMode: 'color',
  quality: 'normal'
};

export const PrescriptionPrint = ({ prescription, open, onOpenChange }: PrescriptionPrintProps) => {
  const printRef = useRef<HTMLDivElement>(null);
  const { t, language } = useLanguage();
  
const { settings: printSettings } = usePrintSettings();

  
  const [showPrintSettings, setShowPrintSettings] = useState(false);

  const { data: doctorProfile } = useQuery({
    queryKey: ['doctor-profile'],
    queryFn: async () => {
      const response = await fetch(doctorProfileUrl);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch doctor profile');
      }
      return await response.json();
    }
  });

  const { data: patient } = useQuery({
    queryKey: ['patient', prescription?.patient_id],
    queryFn: async () => {
      if (!prescription?.patient_id) return null;

      const response = await fetch(getPatientByIdUrl(prescription.patient_id));
      if (!response.ok) throw new Error('Failed to fetch patient');
      return await response.json();
    },
    enabled: !!prescription?.patient_id
  });

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch {
      return dateString;
    }
  };

  // Generate dynamic styles based on print settings
  const generatePrintStyles = (settings: PrintSettings) => {
    const paperSizes = {
      A4: { width: '21cm', height: '29.7cm' },
      A5: { width: '14.8cm', height: '21cm' },
      Letter: { width: '21.6cm', height: '27.9cm' },
      Legal: { width: '21.6cm', height: '35.6cm' }
    };

    const marginSizes = {
      narrow: '0.5cm',
      normal: '1.5cm',
      wide: '2.5cm'
    };

    const fontSizes = {
      small: {
        base: '10px',
        title: '18px',
        heading: '14px',
        subheading: '12px',
        small: '8px'
      },
      medium: {
        base: '12px',
        title: '22px',
        heading: '16px',
        subheading: '14px',
        small: '10px'
      },
      large: {
        base: '14px',
        title: '26px',
        heading: '18px',
        subheading: '16px',
        small: '12px'
      }
    };

    const paper = paperSizes[settings.paperSize];
    const isLandscape = settings.orientation === 'landscape';
    const fonts = fontSizes[settings.fontSize];

    return `
      .prescription-container {
        max-width: ${isLandscape ? paper.height : paper.width};
        min-height: ${isLandscape ? paper.width : paper.height};
        margin: 0 auto;
        background: #ffffff;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        border-radius: 8px;
        overflow: hidden;
        transform-origin: top center;
        ${settings.fontSize === 'small' ? 'transform: scale(0.9);' : ''}
        ${settings.fontSize === 'large' ? 'transform: scale(1.1);' : ''}
      }
      
      .prescription { 
        width: 100%;
        min-height: ${isLandscape ? paper.width : paper.height};
        padding: ${marginSizes[settings.margins]};
        background: #ffffff;
        position: relative;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        line-height: 1.4; 
        color: ${settings.colorMode === 'grayscale' ? '#000000' : '#1f2937'};
        font-size: ${fonts.base};
        ${settings.colorMode === 'grayscale' ? 'filter: grayscale(100%);' : ''}
      }
      
      .header {
        position: relative;
        margin-bottom: 20px;
        padding-bottom: 15px;
        ${!settings.includeHeader ? 'display: none;' : ''}
      }
      
      .footer {
        margin-top: 25px;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        ${!settings.includeFooter ? 'display: none;' : ''}
      }
      
      .header::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: ${settings.colorMode === 'grayscale' 
          ? '#000000' 
          : 'linear-gradient(90deg, #2563eb 0%, #1d4ed8 50%, #2563eb 100%)'};
        border-radius: 1px;
      }
      
      .clinic-name {
        font-size: ${fonts.title};
        font-weight: 700;
        color: ${settings.colorMode === 'grayscale' ? '#000000' : '#1e40af'};
        margin-bottom: 6px;
        letter-spacing: -0.3px;
        text-align: center;
      }
      
      .doctor-info {
        text-align: center;
      }
      
      .doctor-name {
        font-size: ${fonts.heading};
        font-weight: 600;
        color: ${settings.colorMode === 'grayscale' ? '#000000' : '#374151'};
        margin-bottom: 4px;
      }
      
      .doctor-title {
        font-size: ${fonts.subheading};
        color: ${settings.colorMode === 'grayscale' ? '#333333' : '#6b7280'};
        margin-bottom: 10px;
        font-weight: 500;
      }
      
      .contact-info {
        display: flex;
        justify-content: center;
        gap: 20px;
        flex-wrap: wrap;
        font-size: ${fonts.small};
        color: ${settings.colorMode === 'grayscale' ? '#333333' : '#6b7280'};
      }
      
      .contact-item {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      
      .patient-card {
        background: ${settings.colorMode === 'grayscale' 
          ? '#f8f8f8' 
          : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'};
        border: 1px solid ${settings.colorMode === 'grayscale' ? '#cccccc' : '#e2e8f0'};
        border-radius: 10px;
        padding: 15px;
        margin-bottom: 20px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      }
      
      .patient-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 10px;
      }
      
      .patient-name {
        font-size: ${fonts.heading};
        font-weight: 600;
        color: ${settings.colorMode === 'grayscale' ? '#000000' : '#1f2937'};
        margin-bottom: 3px;
      }
      
      .prescription-id {
        font-size: ${fonts.small};
        color: ${settings.colorMode === 'grayscale' ? '#333333' : '#6b7280'};
        background: #ffffff;
        padding: 4px 10px;
        border-radius: 15px;
        border: 1px solid ${settings.colorMode === 'grayscale' ? '#cccccc' : '#d1d5db'};
        font-weight: 500;
      }
      
      .patient-details {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
        gap: 10px;
      }
      
      .detail-item {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      
      .detail-label {
        font-size: ${fonts.small};
        color: ${settings.colorMode === 'grayscale' ? '#333333' : '#6b7280'};
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .detail-value {
        font-size: ${fonts.subheading};
        color: ${settings.colorMode === 'grayscale' ? '#000000' : '#374151'};
        font-weight: 600;
      }
      
      .section {
        margin-bottom: 20px;
      }
      
      .section-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid ${settings.colorMode === 'grayscale' ? '#cccccc' : '#e5e7eb'};
      }
      
      .section-icon {
        width: 22px;
        height: 22px;
        background: ${settings.colorMode === 'grayscale' ? '#333333' : '#2563eb'};
        border-radius: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        color: white;
        font-weight: 600;
      }
      
      .section-title {
        font-size: ${fonts.heading};
        font-weight: 600;
        color: ${settings.colorMode === 'grayscale' ? '#000000' : '#374151'};
        margin: 0;
      }
      
      .diagnosis-content {
        background: ${settings.colorMode === 'grayscale' ? '#f5f5f5' : '#fefce8'};
        border: 1px solid ${settings.colorMode === 'grayscale' ? '#cccccc' : '#fbbf24'};
        border-radius: 8px;
        padding: 15px;
        font-size: ${fonts.subheading};
        line-height: 1.5;
        color: ${settings.colorMode === 'grayscale' ? '#000000' : '#92400e'};
      }
      
      .medication-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      
      .medication-item {
        background: #ffffff;
        border: 1px solid ${settings.colorMode === 'grayscale' ? '#cccccc' : '#e5e7eb'};
        border-radius: 10px;
        padding: 12px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      }
      
      .medication-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
      }
      
      .medication-number {
        background: ${settings.colorMode === 'grayscale' ? '#333333' : '#2563eb'};
        color: white;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${fonts.small};
        font-weight: 600;
      }
      
      .medication-name {
        font-size: ${fonts.heading};
        font-weight: 600;
        color: ${settings.colorMode === 'grayscale' ? '#000000' : '#1f2937'};
        flex: 1;
      }
      
      .medication-details {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 8px;
        margin-top: 8px;
      }
      
      .detail-pill {
        background: ${settings.colorMode === 'grayscale' ? '#f5f5f5' : '#f8fafc'};
        border: 1px solid ${settings.colorMode === 'grayscale' ? '#cccccc' : '#e2e8f0'};
        border-radius: 8px;
        padding: 6px 10px;
        font-size: ${fonts.subheading};
      }
      
      .detail-pill strong {
        color: ${settings.colorMode === 'grayscale' ? '#000000' : '#374151'};
        font-weight: 600;
      }
      
      .test-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 10px;
      }
      
      .test-item {
        background: ${settings.colorMode === 'grayscale' ? '#f5f5f5' : '#f0f9ff'};
        border: 1px solid ${settings.colorMode === 'grayscale' ? '#cccccc' : '#0ea5e9'};
        border-left: 4px solid ${settings.colorMode === 'grayscale' ? '#666666' : '#0ea5e9'};
        border-radius: 8px;
        padding: 10px;
        font-size: ${fonts.subheading};
        font-weight: 500;
        color: ${settings.colorMode === 'grayscale' ? '#000000' : '#0c4a6e'};
      }
      
      .imaging-item {
        background: ${settings.colorMode === 'grayscale' ? '#f5f5f5' : '#f0fdf4'};
        border: 1px solid ${settings.colorMode === 'grayscale' ? '#cccccc' : '#22c55e'};
        border-left: 4px solid ${settings.colorMode === 'grayscale' ? '#666666' : '#22c55e'};
        border-radius: 8px;
        padding: 10px;
        font-size: ${fonts.subheading};
        font-weight: 500;
        color: ${settings.colorMode === 'grayscale' ? '#000000' : '#14532d'};
      }
      
      .notes-content {
        background: #fefefe;
        border: 1px dashed ${settings.colorMode === 'grayscale' ? '#cccccc' : '#d1d5db'};
        border-radius: 10px;
        padding: 15px;
        font-size: ${fonts.subheading};
        line-height: 1.5;
        color: ${settings.colorMode === 'grayscale' ? '#000000' : '#374151'};
        font-style: italic;
      }
      
      .date-issued {
        font-size: ${fonts.small};
        color: ${settings.colorMode === 'grayscale' ? '#333333' : '#6b7280'};
      }
      
      .signature-section {
        text-align: center;
        min-width: 150px;
      }
      
      .signature-line {
        width: 150px;
        height: 50px;
        border-bottom: 2px solid ${settings.colorMode === 'grayscale' ? '#000000' : '#374151'};
        margin-bottom: 5px;
        position: relative;
      }
      
      .signature-label {
        font-size: ${fonts.small};
        color: ${settings.colorMode === 'grayscale' ? '#000000' : '#374151'};
        font-weight: 600;
      }
      
      .doctor-stamp {
        margin-top: 5px;
        font-size: ${fonts.small};
        color: ${settings.colorMode === 'grayscale' ? '#333333' : '#6b7280'};
      }
      
      .watermark {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        font-size: ${settings.fontSize === 'small' ? '60px' : settings.fontSize === 'large' ? '100px' : '80px'};
        color: ${settings.colorMode === 'grayscale' 
          ? 'rgba(0, 0, 0, 0.02)' 
          : 'rgba(37, 99, 235, 0.02)'};
        font-weight: 900;
        z-index: 0;
        pointer-events: none;
        letter-spacing: 8px;
      }
      
      .content {
        position: relative;
        z-index: 1;
      }
      
      @media print {
        body { 
          margin: 0; 
          background: white;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .prescription-container {
          box-shadow: none;
          border-radius: 0;
          transform: none !important;
          max-width: none;
        }
        .prescription { 
          margin: 0; 
          padding: ${marginSizes[settings.margins]};
          box-shadow: none;
          min-height: auto;
          page-break-inside: avoid;
        }
        .no-print { 
          display: none !important; 
        }
        .medication-item, .section {
          break-inside: avoid;
          page-break-inside: avoid;
        }
        @page {
          size: ${settings.paperSize} ${settings.orientation};
          margin: 0;
        }
      }
      
      @media (max-width: 768px) {
        .prescription-container {
          transform: scale(0.8);
        }
        .prescription {
          padding: 1cm;
        }
        .contact-info {
          flex-direction: column;
          gap: 4px;
        }
        .patient-details, .medication-details {
          grid-template-columns: 1fr;
        }
      }
    `;
  };

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) {
      console.error('Print content not found');
      return;
    }
console.log(generatePrintStyles(printSettings))
    const printWindow = window.open('', '_blank', 'width=800,height=600');

    if (!printWindow) {
      console.error('Could not open print window');
      return;
    }

    try {
      printWindow.document.write(`
        <html>
          <head>
            <title>Medical Prescription - ${patient?.name || 'Patient'}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
              
              * { 
                box-sizing: border-box; 
                margin: 0; 
                padding: 0; 
              }
              
              body { 
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                line-height: 1.5; 
                color: #1f2937;
                background: #ffffff;
                font-size: 14px;
              }
              
              ${generatePrintStyles(printSettings)}
            </style>
          </head>
          <body>
            ${content.innerHTML}
          </body>
        </html>
      `);

      printWindow.document.close();

      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }, 250);

    } catch (error) {
      console.error('Error during print:', error);
      printWindow.close();
    }
  };



  if (!prescription) return null;

  return (
    <div className={cn("flex gap-2", language === 'ar' ? 'justify-start flex-row-reverse' : 'justify-end')}>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className={cn(language === 'ar' && 'text-right')}> 
              {t('prescription.prescriptionPreview')}
            </DialogTitle>
            <DialogDescription className={cn(language === 'ar' && 'text-right')}>
              {t('prescription.printDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-3 mb-4 no-print">
          
            <Button onClick={handlePrint} size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Printer className="w-5 h-5 mr-2" />
              Print Now
            </Button>
          </div>

          {/* عرض الإعدادات الحالية */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 no-print">
            <div className="text-sm text-blue-800">
              <strong>Current Settings:</strong> {printSettings.paperSize} • {printSettings.orientation} • 
              Font: {printSettings.fontSize} • {printSettings.colorMode}
              {!printSettings.includeHeader && ' • No Header'}
              {!printSettings.includeFooter && ' • No Footer'}
            </div>
          </div>

          <div ref={printRef} className="border rounded-lg bg-white overflow-hidden">
            <style>{generatePrintStyles(printSettings)}</style>
            <div className="prescription-container">
              <div className="prescription">
            
                <div className="content">
                
                 </div>
                

                  {/* Patient Information */}
                  <div className="patient-card">
                    <div className="patient-header">
                      <div>
                        <h3 className="patient-name">{patient?.name || 'Patient Name'}</h3>
                      </div>
                      <div className="prescription-id">
                        ID: {prescription.id || 'N/A'}
                      </div>
                    </div>

                    <div className="patient-details">
            
                      <div className="detail-item">
                        <span className="detail-label">Gender</span>
                        <span className="detail-value">{patient?.gender || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Date</span>
                        <span className="detail-value">{formatDate(prescription.prescription_date)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Diagnosis */}
                  {prescription.diagnosis && (
                    <div className="section">
                      <div className="section-header">
                        <div className="section-icon">📋</div>
                        <h3 className="section-title">Diagnosis</h3>
                      </div>
                      <div className="diagnosis-content">
                        {prescription.diagnosis}
                      </div>
                    </div>
                  )}

                  {/* Medications */}
                  {prescription.prescription_items?.length > 0 && (
                    <div className="section">
                      <div className="section-header">
                        <div className="section-icon">💊</div>
                        <h3 className="section-title">Prescribed Medications</h3>
                      </div>
                      <div className="medication-list">
                        {prescription.prescription_items.map((item: any, index: number) => (
                          <div key={index} className="medication-item">
                            <div className="medication-header">
                              <div className="medication-number">{index + 1}</div>
                              <div className="medication-name">
                                {item.medicines?.name || item.medicine_name || 'Medicine Name'}
                              </div>
                            </div>
                            <div className="medication-details">
                              {item.dosage && (
                                <div className="detail-pill">
                                  <strong>Dosage:</strong> {item.dosage}
                                </div>
                              )}
                              {item.frequency && (
                                <div className="detail-pill">
                                  <strong>Frequency:</strong> {item.frequency}
                                </div>
                              )}
                              {item.duration && (
                                <div className="detail-pill">
                                  <strong>Duration:</strong> {item.duration}
                                </div>
                              )}
                              {item.instructions && (
                                <div className="detail-pill" style={{ gridColumn: '1 / -1' }}>
                                  <strong>Instructions:</strong> {item.instructions}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lab Tests */}
                  {prescription.prescription_lab_tests?.length > 0 && (
                    <div className="section">
                      <div className="section-header">
                        <div className="section-icon">🔬</div>
                        <h3 className="section-title">Laboratory Tests</h3>
                      </div>
                      <div className="test-grid">
                        {prescription.prescription_lab_tests.map((test: any, index: number) => (
                          <div key={index} className="test-item">
                            {test.lab_tests?.name || test.test_name || 'Lab Test'}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Imaging Studies */}
                  {prescription.prescription_imaging_studies?.length > 0 && (
                    <div className="section">
                      <div className="section-header">
                        <div className="section-icon">📸</div>
                        <h3 className="section-title">Imaging Studies</h3>
                      </div>
                      <div className="test-grid">
                        {prescription.prescription_imaging_studies.map((study: any, index: number) => (
                          <div key={index} className="imaging-item">
                            {study.imaging_studies?.name || study.study_name || 'Imaging Study'}
                            {study.notes && <div style={{ marginTop: '8px', fontSize: '13px' }}>Note: {study.notes}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Notes */}
                  {prescription.notes && (
                    <div className="section">
                      <div className="section-header">
                        <div className="section-icon">📝</div>
                        <h3 className="section-title">Additional Notes</h3>
                      </div>
                      <div className="notes-content">
                        {prescription.notes}
                      </div>
                    </div>
                  )}
                  {/* Footer */}
                  {printSettings.includeFooter && (
                    <div className="footer">
                      <div className="date-issued">
                        Date Issued: {formatDate(prescription.prescription_date)}
                      </div>
                      <div className="signature-section">
                        <div className="signature-line"></div>
                        <div className="signature-label">Doctor's Signature</div>
                      <div className="doctor-stamp">
                        {doctorProfile?.name || 'Dr. [Name]'}
                        {doctorProfile?.license_number && (
                          <div>License: {doctorProfile.license_number}</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
 
    </div>
  );
};