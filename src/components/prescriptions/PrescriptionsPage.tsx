
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, FileText, Eye, Printer, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { PrescriptionForm } from './PrescriptionForm';
import { PrescriptionDetail } from './PrescriptionDetail';
import { PrescriptionPrint } from './PrescriptionPrint';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { formatDateToDDMMYYYY } from '@/lib/dateUtils';

export const PrescriptionsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [printPrescription, setPrintPrescription] = useState(null);
  const [editingPrescription, setEditingPrescription] = useState(null);
  const { toast } = useToast();

  const { data: prescriptions, isLoading, refetch } = useQuery({
    queryKey: ['prescriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prescriptions')
        .select(`
          *,
          patients (name, age, gender),
          prescription_items (
            *,
            medicines (name)
          ),
          prescription_lab_tests (
            *,
            lab_tests (name)
          ),
          prescription_imaging_studies (
            *,
            imaging_studies (name)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const filteredPrescriptions = prescriptions?.filter(prescription =>
    prescription.patients?.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handlePrescriptionSaved = () => {
    refetch();
    setShowForm(false);
    setEditingPrescription(null);
  };

  const handleEditPrescription = (prescription: any) => {
    setEditingPrescription(prescription);
    setShowForm(true);
  };

  const handleDeletePrescription = async (prescriptionId: string) => {
    if (!confirm('Are you sure you want to delete this prescription?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('prescriptions')
        .delete()
        .eq('id', prescriptionId);

      if (error) throw error;

      toast({ title: 'Prescription deleted successfully' });
      refetch();
    } catch (error) {
      console.error('Error deleting prescription:', error);
      toast({ 
        title: 'Error deleting prescription', 
        description: 'Please try again.',
        variant: 'destructive' 
      });
    }
  };

  const handlePrintPrescription = (prescription: any) => {
    setPrintPrescription(prescription);
    setShowPrint(true);
  };

  if (isLoading) {
    return <div className="p-6">Loading prescriptions...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Prescription Management</h1>
        <Dialog open={showForm} onOpenChange={(open) => {
          setShowForm(open);
          if (!open) {
            setEditingPrescription(null);
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingPrescription(null)}>
              <Plus className="w-4 h-4 mr-2" />
              New Prescription
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPrescription ? 'Edit Prescription' : 'Create New Prescription'}
              </DialogTitle>
            </DialogHeader>
            <PrescriptionForm 
              prescription={editingPrescription} 
              onSave={handlePrescriptionSaved} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search prescriptions by patient name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPrescriptions.map((prescription) => (
          <Card key={prescription.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Prescription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium">Patient:</span> {prescription.patients?.name}</p>
                <p><span className="font-medium">Date:</span> {formatDateToDDMMYYYY(prescription.prescription_date)}</p>
                <p><span className="font-medium">Age:</span> {prescription.patients?.age} years</p>
                <p><span className="font-medium">Gender:</span> {prescription.patients?.gender}</p>
              </div>
              <div className="mt-4 flex space-x-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedPrescription(prescription)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Prescription Details</DialogTitle>
                    </DialogHeader>
                    <PrescriptionDetail prescription={prescription} />
                  </DialogContent>
                </Dialog>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEditPrescription(prescription)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handlePrintPrescription(prescription)}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDeletePrescription(prescription.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPrescriptions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No prescriptions found. Create your first prescription to get started.</p>
        </div>
      )}

      {printPrescription && (
        <PrescriptionPrint
          prescription={printPrescription}
          open={showPrint}
          onOpenChange={setShowPrint}
        />
      )}
    </div>
  );
};
