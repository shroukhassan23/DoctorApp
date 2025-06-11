
import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

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
      const { data, error } = await supabase
        .from('doctor_profile')
        .select('*')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
  });

  const { data: patient } = useQuery({
    queryKey: ['patient', prescription?.patient_id],
    queryFn: async () => {
      if (!prescription?.patient_id) return null;
      
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', prescription.patient_id)
        .single();
      
      if (error) throw error;
      return data;
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
            <title>Prescription - ${patient?.name || 'Patient'}</title>
            <style>
              * { box-sizing: border-box; margin: 0; padding: 0; }
              body { 
                font-family: Arial, sans-serif; 
                line-height: 1.4; 
                color: #333;
                background: white;
              }
              .prescription { 
                max-width: 800px; 
                margin: 20px auto; 
                padding: 30px;
                background: white;
              }
              .doctor-info { 
                text-align: center; 
                margin-bottom: 30px; 
                padding-bottom: 20px; 
                border-bottom: 2px solid #333; 
              }
              .doctor-name { 
                font-size: 28px; 
                font-weight: bold; 
                margin-bottom: 8px;
                color: #2563eb;
              }
              .doctor-title { 
                font-size: 18px; 
                margin-bottom: 5px;
                font-weight: 600;
              }
              .doctor-details { 
                font-size: 14px; 
                line-height: 1.6;
              }
              .patient-info { 
                display: flex; 
                justify-content: space-between; 
                margin-bottom: 30px;
                padding: 15px;
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 8px;
              }
              .patient-data, .prescription-date { 
                flex: 1;
              }
              .patient-data p, .prescription-date p {
                margin-bottom: 5px;
                font-size: 14px;
              }
              .section-title { 
                font-size: 20px; 
                font-weight: bold; 
                margin: 25px 0 15px; 
                border-bottom: 2px solid #2563eb; 
                padding-bottom: 8px;
                color: #2563eb;
              }
              .medicine-item { 
                margin-bottom: 20px; 
                padding: 15px;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                background: #fafafa;
              }
              .medicine-name { 
                font-weight: bold; 
                font-size: 16px;
                color: #1f2937;
                margin-bottom: 8px;
              }
              .medicine-details { 
                margin-left: 0;
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 8px;
              }
              .medicine-details p {
                font-size: 14px;
                padding: 4px 0;
              }
              .lab-tests, .imaging-studies { 
                margin-top: 20px; 
              }
              .lab-tests ul, .imaging-studies ul {
                list-style: none;
                padding: 0;
              }
              .test-item, .study-item { 
                margin-bottom: 12px;
                padding: 10px 15px;
                background: #f0f9ff;
                border-left: 4px solid #0ea5e9;
                border-radius: 0 4px 4px 0;
              }
              .notes { 
                margin-top: 25px;
                padding: 20px;
                background: #fffbeb;
                border: 1px solid #fbbf24;
                border-radius: 8px;
              }
              .notes p {
                line-height: 1.6;
                font-size: 14px;
              }
              .signature { 
                margin-top: 60px; 
                display: flex; 
                justify-content: flex-end; 
              }
              .signature-line { 
                width: 250px; 
                border-top: 2px solid #333; 
                text-align: center; 
                padding-top: 10px;
                font-weight: 600;
                font-size: 14px;
              }
              @media print {
                body { margin: 0; }
                .prescription { margin: 0; padding: 20px; }
                .no-print { display: none; }
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
      }, 100);
      
    } catch (error) {
      console.error('Error during print:', error);
      printWindow.close();
    }
  };

  if (!prescription) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Prescription Preview</DialogTitle>
        </DialogHeader>

        <div className="flex justify-end mb-4 no-print">
          <Button onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>

        <div ref={printRef} className="p-6 border rounded-lg bg-white">
          <div className="prescription">
            {/* Doctor Information */}
            <div className="doctor-info">
              <h2 className="doctor-name">{doctorProfile?.name || 'Dr. [Name]'}</h2>
              <p className="doctor-title">
                {doctorProfile?.title && `${doctorProfile.title} `}
                {doctorProfile?.specialization || 'Medical Practitioner'}
              </p>
              <div className="doctor-details">
                {doctorProfile?.qualification && <div>{doctorProfile.qualification}</div>}
                {doctorProfile?.clinic_name && <div><strong>Clinic:</strong> {doctorProfile.clinic_name}</div>}
                {doctorProfile?.clinic_address && <div><strong>Address:</strong> {doctorProfile.clinic_address}</div>}
                {doctorProfile?.phone && <div><strong>Phone:</strong> {doctorProfile.phone}</div>}
                {doctorProfile?.email && <div><strong>Email:</strong> {doctorProfile.email}</div>}
              </div>
            </div>

            {/* Patient Information */}
            <div className="patient-info">
              <div className="patient-data">
                <p><strong>Patient Name:</strong> {patient?.name || 'N/A'}</p>
                <p><strong>Age:</strong> {patient?.age || 'N/A'} years</p>
                <p><strong>Gender:</strong> {patient?.gender || 'N/A'}</p>
                {patient?.phone && <p><strong>Phone:</strong> {patient.phone}</p>}
              </div>
              <div className="prescription-date">
                <p><strong>Prescription Date:</strong> {formatDate(prescription.prescription_date)}</p>
                <p><strong>Prescription ID:</strong> {prescription.id.slice(-8).toUpperCase()}</p>
              </div>
            </div>

            {/* Medications */}
            {prescription.prescription_items?.length > 0 && (
              <div>
                <h3 className="section-title">℞ Medications</h3>
                {prescription.prescription_items.map((item: any, index: number) => (
                  <div key={index} className="medicine-item">
                    <div className="medicine-name">
                      {index + 1}. {item.medicines?.name || 'Medicine Name'}
                    </div>
                    <div className="medicine-details">
                      {item.dosage && <p><strong>Dosage:</strong> {item.dosage}</p>}
                      {item.duration && <p><strong>Duration:</strong> {item.duration}</p>}
                      {item.frequency && <p><strong>Frequency:</strong> {item.frequency}</p>}
                      {item.instructions && <p><strong>Instructions:</strong> {item.instructions}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Lab Tests */}
            {prescription.prescription_lab_tests?.length > 0 && (
              <div className="lab-tests">
                <h3 className="section-title">🔬 Laboratory Tests</h3>
                <ul>
                  {prescription.prescription_lab_tests.map((test: any, index: number) => (
                    <li key={index} className="test-item">
                      • {test.lab_tests?.name || 'Lab Test'}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Imaging Studies */}
            {prescription.prescription_imaging_studies?.length > 0 && (
              <div className="imaging-studies">
                <h3 className="section-title">📸 Imaging Studies</h3>
                <ul>
                  {prescription.prescription_imaging_studies.map((study: any, index: number) => (
                    <li key={index} className="study-item">
                      • {study.imaging_studies?.name || 'Imaging Study'}
                      {study.notes && <span> - {study.notes}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Notes */}
            {prescription.notes && (
              <div className="notes">
                <h3 className="section-title">📝 Additional Notes</h3>
                <p>{prescription.notes}</p>
              </div>
            )}

            {/* Signature */}
            <div className="signature">
              <div className="signature-line">
                Doctor's Signature
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
