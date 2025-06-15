import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, FileText, Eye, Printer, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PrescriptionForm } from './PrescriptionForm';
import { PrescriptionDetail } from './PrescriptionDetail';
import { PrescriptionPrint } from './PrescriptionPrint';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { formatDateToDDMMYYYY } from '@/lib/dateUtils';
import { useLanguage } from '@/contexts/LanguageContext';
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
      // Get all prescriptions with patient and related data
      const response = await fetch('http://localhost:3002/prescriptions/all');
      if (!response.ok) throw new Error('Failed to fetch prescriptions');
      return await response.json();
    },
  });
  const { t, language } = useLanguage();
  const filteredPrescriptions = prescriptions?.filter(prescription =>
    prescription.patient_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
    try {
      const response = await fetch(`http://localhost:3002/prescriptions/${prescriptionId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Delete failed');
      }

      toast({ title: t('prescription.deleteSuccess') });
      refetch();
    } catch (error) {
      console.error('Error deleting prescription:', error);
      toast({ 
        title: t('prescription.errorDelete'), 
        description: t('message.pleaseTryAgain'),
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
                {editingPrescription ? t('prescription.edit') : t('prescription.new')}
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
                <p><span className="font-medium">Patient:</span> {prescription.patient_name}</p>
                <p><span className="font-medium">Date:</span> {formatDateToDDMMYYYY(prescription.prescription_date)}</p>
                <p><span className="font-medium">Age:</span> {prescription.patient_age} years</p>
                <p><span className="font-medium">Gender:</span> {prescription.patient_gender}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
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
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle> {t('common.areYouSure')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('common.areYouSure')} {t('common.cannotUndo')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeletePrescription(prescription.id)}>
                      {t('common.delete')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPrescriptions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">t('prescription.notFound').</p>
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