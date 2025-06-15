
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Eye, Trash2, Users, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PatientForm } from './PatientForm';
import { PatientDetail } from './PatientDetail';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { formatDateToDDMMYYYY } from '@/lib/dateUtils';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { patientUrl } from '@/components/constants.js'
import { PageLoading, SectionLoading, TableLoading } from '@/components/ui/loading-spinner';
import { AddButton, DeleteButton, ViewButton } from '../ui/enhanced-button';

export const PatientsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const { t, language } = useLanguage();

  const { data: patients, isLoading, refetch } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const response = await fetch(patientUrl);
      if (!response.ok) throw new Error('Failed to fetch patients');
      return await response.json();
    },
  });

  const filteredPatients = patients?.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone?.includes(searchTerm)
  ) || [];

  const handlePatientSaved = () => {
    refetch();
    setShowForm(false);
  };

  const [deletingPatient, setDeletingPatient] = useState<string | null>(null);


  const handleDelete = async (patientId: string) => {
    setDeletingPatient(patientId);

    try {
      const response = await fetch(`http://localhost:3001/Patients/${patientId}`, {
        method: "DELETE",

      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'deletefailed');
      }

      // const result = await response.json();

      toast({ title: t('message.patientDeleted') });
      refetch();
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast({
        title: t('message.patientDeleteError'),
        description: t('message.error'),
        variant: 'destructive'
      });
    } finally {
      setDeletingPatient(null);
    }
  };

  if (isLoading) {
    return <PageLoading text="Loading patients..." variant="dots" color="blue" />;
  }

  return (
    <div className={cn("p-6", language === 'ar' && "rtl")}>
      <div className={cn("flex justify-between items-center mb-8", language === 'ar' && 'flex-row-reverse rtl')}>
        <div className={cn("flex items-center gap-4", language === 'ar' && 'flex-row-reverse')}>
          <div className="p-3 bg-[#2463EB] rounded-xl shadow-lg">
            <Users className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className={cn("text-3xl font-bold text-gray-900", language === 'ar' && 'text-right')}>
              {t('patients.title')}
            </h1>
            <p className={cn("text-gray-600 mt-1", language === 'ar' && 'text-right')}>
              Manage patient records and medical information
            </p>
          </div>
        </div>

        <AddButton
          size="sm"
          onClick={() => { setSelectedPatient(null); setShowForm(true); }}
        >
          {t('patients.addNew')}
        </AddButton>
      </div>


      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('patients.addNew')}</DialogTitle>
            <DialogDescription>
              Fill in the patient information below.
            </DialogDescription>
          </DialogHeader>
          <PatientForm patient={selectedPatient} onSave={handlePatientSaved} />
        </DialogContent>
      </Dialog>


      <div className="mb-8 p-6 bg-white rounded-xl shadow-md border border-gray-200">
        <div className="space-y-3">
          <label className={cn("text-sm font-semibold text-gray-700 flex items-center gap-2", language === 'ar' && 'text-right flex-row-reverse')}>
            <Search className="w-4 h-4 text-[#2463EB]" />
            Search Patients
          </label>
          <div className="relative">
            <Search className={cn(
              "absolute top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5",
              language === 'ar' ? 'right-4' : 'left-4'
            )} />
            <Input
              placeholder="Search by name, phone, or medical record..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                "h-12 border-gray-300 bg-gray-50 focus:bg-white focus:border-[#2463EB] focus:ring-[#2463EB]/20 shadow-sm",
                language === 'ar' ? 'pr-12 text-right' : 'pl-12'
              )}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <TableLoading rows={6} columns={7} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={cn(language === 'ar' && 'text-right')}>{t('patients.name')}</TableHead>
                <TableHead className={cn(language === 'ar' && 'text-right')}>{t('patients.age')}</TableHead>
                <TableHead className={cn(language === 'ar' && 'text-right')}>{t('patients.gender')}</TableHead>
                <TableHead className={cn(language === 'ar' && 'text-right')}>{t('patients.dateOfBirth')}</TableHead>
                <TableHead className={cn(language === 'ar' && 'text-right')}>{t('patients.phone')}</TableHead>
                <TableHead className={cn(language === 'ar' && 'text-right')}>{t('patients.address')}</TableHead>
                <TableHead className={cn(language === 'ar' ? 'text-left' : 'text-right')}>{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className={cn("font-medium", language === 'ar' && 'text-right')}>{patient.name}</TableCell>
                  <TableCell className={cn(language === 'ar' && 'text-right')}>{patient.age}</TableCell>
                  <TableCell className={cn(language === 'ar' && 'text-right')}>{patient.gender}</TableCell>
                  <TableCell className={cn(language === 'ar' && 'text-right')}>{formatDateToDDMMYYYY(patient.date_of_birth)}</TableCell>
                  <TableCell className={cn(language === 'ar' && 'text-right')}>{patient.phone || 'N/A'}</TableCell>
                  <TableCell className={cn(language === 'ar' && 'text-right')}>{patient.address || 'N/A'}</TableCell>
                  <TableCell className={cn(language === 'ar' ? 'text-left' : 'text-right')}>
                    <div className={cn("flex gap-2", language === 'ar' ? 'justify-start flex-row-reverse gap-reverse' : 'justify-end')}>
                      <Dialog>
                        <DialogTrigger asChild>
                          <ViewButton
                            size="sm"
                            onClick={() => setSelectedPatient(patient)}
                          >
                            {t('patients.viewDetails')}
                          </ViewButton>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{t('patients.viewDetails')} - {patient.name}</DialogTitle>
                            <DialogDescription>
                              {t('patients.viewAndManage')}
                            </DialogDescription>
                          </DialogHeader>
                          <PatientDetail patient={patient} onUpdate={refetch} />
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DeleteButton
                            size="sm"
                            disabled={deletingPatient === patient.id}
                            loading={deletingPatient === patient.id}
                          >
                            {t('common.delete')}
                          </DeleteButton>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t('patients.deleteConfirm')}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('patients.deleteDescription').replace('"{patient.name}"', `"${patient.name}"`)}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(patient.id)}
                              disabled={deletingPatient === patient.id} >
                              {deletingPatient === patient.id ? (
                                <div className="flex items-center gap-2">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  {t('common.deleting')}
                                </div>
                              ) : (
                                t('common.delete')
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {filteredPatients.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">{t('patients.noPatients')}</p>
          </div>
        )}
      </div>
    </div>
  );
};
