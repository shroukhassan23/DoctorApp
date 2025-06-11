
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PrescriptionDetailProps {
  prescription: any;
}

export const PrescriptionDetail = ({ prescription }: PrescriptionDetailProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-blue-700">Patient Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {prescription.patients?.name}</p>
              <p><span className="font-medium">Age:</span> {prescription.patients?.age} years</p>
              <p><span className="font-medium">Gender:</span> {prescription.patients?.gender}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-blue-700">Prescription Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><span className="font-medium">Date:</span> {new Date(prescription.prescription_date).toLocaleDateString()}</p>
              <p><span className="font-medium">Prescription ID:</span> {prescription.id}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {prescription.prescription_items?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-blue-700">Prescribed Medicines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {prescription.prescription_items.map((item: any, index: number) => (
                <div key={item.id} className="border-l-4 border-blue-500 pl-4 py-3 bg-blue-50">
                  <p className="font-medium">{index + 1}. {item.medicines.name}</p>
                  <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                    <p><span className="font-medium">Dosage:</span> {item.dosage}</p>
                    <p><span className="font-medium">Duration:</span> {item.duration}</p>
                  </div>
                  {item.instructions && (
                    <p className="text-sm mt-2"><span className="font-medium">Instructions:</span> {item.instructions}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {prescription.prescription_lab_tests?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-green-700">Lab Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {prescription.prescription_lab_tests.map((test: any, index: number) => (
                <div key={test.id} className="border-l-4 border-green-500 pl-4 py-2 bg-green-50">
                  <p className="font-medium">{index + 1}. {test.lab_tests.name}</p>
                  {test.notes && (
                    <p className="text-sm text-gray-600 mt-1"><span className="font-medium">Notes:</span> {test.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {prescription.prescription_imaging_studies?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-purple-700">Imaging Studies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {prescription.prescription_imaging_studies.map((study: any, index: number) => (
                <div key={study.id} className="border-l-4 border-purple-500 pl-4 py-3 bg-purple-50">
                  <p className="font-medium">{index + 1}. {study.imaging_studies.name}</p>
                  {study.notes && (
                    <p className="text-sm text-gray-600 mt-1"><span className="font-medium">Notes:</span> {study.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {prescription.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-gray-700">Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{prescription.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
