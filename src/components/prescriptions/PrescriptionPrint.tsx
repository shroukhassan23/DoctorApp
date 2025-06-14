import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { doctorProfileUrl, getPatientByIdUrl } from '@/components/constants.js';

interface PrescriptionPrintProps {
  prescription: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PrescriptionPrint = ({ prescription, open, onOpenChange }: PrescriptionPrintProps) => {
  const printRef = useRef<HTMLDivElement>(null);

  const { data: doctorProfile } = useQuery({
    queryKey: ['doctor-profile'],
    queryFn: async () => {
      const response = await fetch(doctorProfileUrl);
      if (!response.ok) {
        if (response.status === 404) {
          return null; // No profile created yet
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

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) {
      console.error('Print content not found');
      return;
    }

    // Create a new window for printing
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
              
              .prescription { 
                max-width: 21cm;
                min-height: 29.7cm;
                margin: 0 auto; 
                padding: 2cm;
                background: #ffffff;
                position: relative;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
              }
              
              /* Header with elegant design */
              .header {
                position: relative;
                margin-bottom: 40px;
                padding-bottom: 30px;
              }
              
              .header::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: linear-gradient(90deg, #2563eb 0%, #1d4ed8 50%, #2563eb 100%);
                border-radius: 2px;
              }
              
              .clinic-name {
                font-size: 32px;
                font-weight: 700;
                color: #1e40af;
                margin-bottom: 8px;
                letter-spacing: -0.5px;
              }
              
              .doctor-info {
                text-align: center;
              }
              
              .doctor-name {
                font-size: 24px;
                font-weight: 600;
                color: #374151;
                margin-bottom: 4px;
              }
              
              .doctor-title {
                font-size: 16px;
                color: #6b7280;
                margin-bottom: 16px;
                font-weight: 500;
              }
              
              .contact-info {
                display: flex;
                justify-content: center;
                gap: 30px;
                flex-wrap: wrap;
                font-size: 13px;
                color: #6b7280;
              }
              
              .contact-item {
                display: flex;
                align-items: center;
                gap: 6px;
              }
              
              /* Patient Info Card */
              .patient-card {
                background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                padding: 24px;
                margin-bottom: 32px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.04);
              }
              
              .patient-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 16px;
              }
              
              .patient-name {
                font-size: 20px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 4px;
              }
              
              .prescription-id {
                font-size: 12px;
                color: #6b7280;
                background: #ffffff;
                padding: 4px 12px;
                border-radius: 20px;
                border: 1px solid #d1d5db;
                font-weight: 500;
              }
              
              .patient-details {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 16px;
              }
              
              .detail-item {
                display: flex;
                flex-direction: column;
                gap: 2px;
              }
              
              .detail-label {
                font-size: 12px;
                color: #6b7280;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              
              .detail-value {
                font-size: 14px;
                color: #374151;
                font-weight: 600;
              }
              
              /* Section Headers */
              .section {
                margin-bottom: 32px;
              }
              
              .section-header {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 20px;
                padding-bottom: 12px;
                border-bottom: 2px solid #e5e7eb;
              }
              
              .section-icon {
                width: 24px;
                height: 24px;
                background: #2563eb;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                color: white;
                font-weight: 600;
              }
              
              .section-title {
                font-size: 18px;
                font-weight: 600;
                color: #374151;
                margin: 0;
              }
              
              /* Diagnosis Section */
              .diagnosis-content {
                background: #fefce8;
                border: 1px solid #fbbf24;
                border-radius: 8px;
                padding: 20px;
                font-size: 15px;
                line-height: 1.6;
                color: #92400e;
              }
              
              /* Medications */
              .medication-list {
                display: flex;
                flex-direction: column;
                gap: 16px;
              }
              
              .medication-item {
                background: #ffffff;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                padding: 20px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                transition: all 0.2s ease;
              }
              
              .medication-item:hover {
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              }
              
              .medication-header {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 12px;
              }
              
              .medication-number {
                background: #2563eb;
                color: white;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                font-weight: 600;
              }
              
              .medication-name {
                font-size: 18px;
                font-weight: 600;
                color: #1f2937;
                flex: 1;
              }
              
              .medication-details {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 12px;
                margin-top: 12px;
              }
              
              .detail-pill {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 8px 12px;
                font-size: 13px;
              }
              
              .detail-pill strong {
                color: #374151;
                font-weight: 600;
              }
              
              /* Tests and Studies */
              .test-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                gap: 12px;
              }
              
              .test-item {
                background: #f0f9ff;
                border: 1px solid #0ea5e9;
                border-left: 4px solid #0ea5e9;
                border-radius: 8px;
                padding: 16px;
                font-size: 14px;
                font-weight: 500;
                color: #0c4a6e;
              }
              
              .imaging-item {
                background: #f0fdf4;
                border: 1px solid #22c55e;
                border-left: 4px solid #22c55e;
                border-radius: 8px;
                padding: 16px;
                font-size: 14px;
                font-weight: 500;
                color: #14532d;
              }
              
              /* Notes Section */
              .notes-content {
                background: #fefefe;
                border: 2px dashed #d1d5db;
                border-radius: 12px;
                padding: 24px;
                font-size: 15px;
                line-height: 1.7;
                color: #374151;
                font-style: italic;
              }
              
              /* Footer */
              .footer {
                margin-top: 50px;
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
              }
              
              .date-issued {
                font-size: 13px;
                color: #6b7280;
              }
              
              .signature-section {
                text-align: center;
                min-width: 200px;
              }
              
              .signature-line {
                width: 200px;
                height: 60px;
                border-bottom: 2px solid #374151;
                margin-bottom: 8px;
                position: relative;
              }
              
              .signature-label {
                font-size: 13px;
                color: #374151;
                font-weight: 600;
              }
              
              .doctor-stamp {
                margin-top: 8px;
                font-size: 12px;
                color: #6b7280;
              }
              
              /* Watermark */
              .watermark {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-45deg);
                font-size: 120px;
                color: rgba(37, 99, 235, 0.03);
                font-weight: 900;
                z-index: 0;
                pointer-events: none;
                letter-spacing: 10px;
              }
              
              .content {
                position: relative;
                z-index: 1;
              }
              
              /* Print Styles */
              @media print {
                body { 
                  margin: 0; 
                  background: white;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                .prescription { 
                  margin: 0; 
                  padding: 1.5cm;
                  box-shadow: none;
                  min-height: auto;
                }
                .no-print { 
                  display: none !important; 
                }
                .medication-item {
                  break-inside: avoid;
                }
                .section {
                  break-inside: avoid;
                }
              }
              
              /* Responsive */
              @media (max-width: 768px) {
                .prescription {
                  padding: 1cm;
                }
                .contact-info {
                  flex-direction: column;
                  gap: 8px;
                }
                .patient-details {
                  grid-template-columns: 1fr;
                }
                .medication-details {
                  grid-template-columns: 1fr;
                }
              }
            </style>
          </head>
          <body>
            ${content.innerHTML}
          </body>
        </html>
      `);
      
      printWindow.document.close();
      
      // Wait for content to load, then print
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Medical Prescription Preview</DialogTitle>
          <DialogDescription>
            Review the prescription details before printing. Click print to generate a professional copy.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end mb-4 no-print">
          <Button onClick={handlePrint} size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Printer className="w-5 h-5 mr-2" />
            Print Prescription
          </Button>
        </div>

        <div ref={printRef} className="border rounded-lg bg-white overflow-hidden">
          <div className="prescription">
            <div className="watermark">RX</div>
            
            <div className="content">
              {/* Header */}
              <div className="header">
                <div className="doctor-info">
                  <h1 className="clinic-name">
                    {doctorProfile?.clinic_name || 'Medical Clinic'}
                  </h1>
                  <h2 className="doctor-name">
                    {doctorProfile?.name || 'Dr. [Doctor Name]'}
                  </h2>
                  <p className="doctor-title">
                    {doctorProfile?.title && `${doctorProfile.title} • `}
                    {doctorProfile?.specialization || 'Medical Practitioner'}
                    {doctorProfile?.qualification && ` • ${doctorProfile.qualification}`}
                  </p>
                  
                  <div className="contact-info">
                    {doctorProfile?.clinic_address && (
                      <div className="contact-item">
                        <span>📍</span>
                        <span>{doctorProfile.clinic_address}</span>
                      </div>
                    )}
                    {doctorProfile?.phone && (
                      <div className="contact-item">
                        <span>📞</span>
                        <span>{doctorProfile.phone}</span>
                      </div>
                    )}
                    {doctorProfile?.email && (
                      <div className="contact-item">
                        <span>✉️</span>
                        <span>{doctorProfile.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Patient Information */}
              <div className="patient-card">
                <div className="patient-header">
                  <div>
                    <h3 className="patient-name">{patient?.name || 'Patient Name'}</h3>
                  </div>
                  <div className="prescription-id">
                    Rx #{prescription.id ? prescription.id.toString().padStart(6, '0') : 'DRAFT'}
                  </div>
                </div>
                
                <div className="patient-details">
                  <div className="detail-item">
                    <span className="detail-label">Age</span>
                    <span className="detail-value">{patient?.age || 'N/A'} years</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Gender</span>
                    <span className="detail-value">{patient?.gender || 'N/A'}</span>
                  </div>
                  {patient?.phone && (
                    <div className="detail-item">
                      <span className="detail-label">Phone</span>
                      <span className="detail-value">{patient.phone}</span>
                    </div>
                  )}
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
              <div className="footer">
                <div className="date-issued">
                  Date Issued: {formatDate(prescription.prescription_date)}
                </div>
                <div className="signature-section">
                  <div className="signature-line"></div>
                  <div className="signature-label">Doctor's Signature</div>
                  <div className="doctor-stamp">
                    {doctorProfile?.name || 'Dr. [Name]'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};