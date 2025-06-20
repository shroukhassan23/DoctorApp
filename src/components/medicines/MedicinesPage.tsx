import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, Pill } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MedicineForm } from './MedicineForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { managementMedicinesUrl, deleteMedicineUrl } from '@/components/constants.js';
import { AddButton, DeleteButton, EditButton } from '../ui/enhanced-button';
import { CardLoading, SectionLoading, TableLoading } from '../ui/loading-spinner';

export const MedicinesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const { t, language } = useLanguage();

  const { data: medicines, isLoading, refetch } = useQuery({
    queryKey: ['medicines'],
    queryFn: async () => {
      const response = await fetch(managementMedicinesUrl);
      if (!response.ok) throw new Error('Failed to fetch medicines');
      return await response.json();
    },
  });

  const filteredMedicines = medicines?.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleMedicineSaved = () => {
    refetch();
    setShowForm(false);
    setSelectedMedicine(null);
  };

  const handleDelete = async (medicineId: string) => {
    setDeletingId(medicineId);
    try {
      const response = await fetch(deleteMedicineUrl(medicineId), {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Delete failed');
      }

      toast({ title: t('medicines.deletedSuccess') });
      refetch();
    } catch (error) {
      console.error('Error deleting medicine:', error);
      toast({
        title: t('medicines.errorDeleting'),
        description: t('form.tryAgain'),
        variant: 'destructive'
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className={cn("p-6", language === 'ar' && "rtl")}>
        {/* Header skeleton */}
        <div className={cn("flex justify-between items-center mb-8", language === 'ar' && 'flex-row-reverse')}>
          <CardLoading lines={2} showAvatar />
          <div className="w-32 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>

        {/* Search bar skeleton */}
        <CardLoading lines={1} />

        {/* Table loading */}
        <div className="bg-white rounded-lg shadow">
          <TableLoading rows={6} columns={6} />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("p-6", language === 'ar' && "rtl")}>
      <div className={cn("flex justify-between items-center mb-8", language === 'ar' && 'flex-row-reverse')}>
        <div className="flex items-center gap-4">
          {language === 'ar' ? (
            <>
              <div className={cn("order-2", language === 'ar' && 'order-1')}>
                <div className="p-3 bg-[#2463EB] rounded-xl shadow-lg">
                  <Pill className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className={cn("order-1", language === 'ar' && 'order-2')}>
                <h1 className={cn("text-3xl font-bold text-gray-900", language === 'ar' && 'text-right')}>
                  {t('medicines.title')}
                </h1>
                <p className={cn("text-gray-600 mt-1", language === 'ar' && 'text-right')}>
                  {t('medicines.manage')}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="p-3 bg-[#2463EB] rounded-xl shadow-lg">
                <Pill className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {t('medicines.title')}
                </h1>
                <p className="text-gray-600 mt-1">
                  {t('medicines.manage')}
                </p>
              </div>
            </>
          )}
        </div>

        <div className={cn(language === 'ar' && 'order-first')}>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <AddButton
                size="sm"
                onClick={() => { setSelectedMedicine(null) }}
              >
                {t('medicines.addNew')}
              </AddButton>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className={cn(language === 'ar' && 'text-right')}>
                  {selectedMedicine ? t('medicines.editMedicine') : t('medicines.addNew')}
                </DialogTitle>
              </DialogHeader>
              <MedicineForm medicine={selectedMedicine} onSave={handleMedicineSaved} isLoading={false} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mb-8 p-6 bg-white rounded-xl shadow-md border border-gray-200">
        <div className="space-y-3">
          <label className={cn(
            "text-sm font-semibold text-gray-700 flex items-center gap-2",
            language === 'ar' && 'flex-row-reverse justify-end text-right'
          )}>
            <Search className="w-4 h-4 text-[#2463EB]" />
            {t('medicines.search')}
          </label>
          <div className="relative">
            <Search className={cn(
              "absolute top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5",
              language === 'ar' ? 'right-4' : 'left-4'
            )} />
            <Input
              placeholder={t('medicines.searchPlaceholder')}
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={cn(language === 'ar' && 'text-right')}>{t('common.name')}</TableHead>
              <TableHead className={cn(language === 'ar' && 'text-right')}>{t('medicines.dosage')}</TableHead>
              <TableHead className={cn(language === 'ar' && 'text-right')}>{t('medicines.form')}</TableHead>
              <TableHead className={cn(language === 'ar' && 'text-right')}>{t('medicines.manufacturer')}</TableHead>
              <TableHead className={cn(language === 'ar' && 'text-right')}>{t('medicines.price')}</TableHead>
              <TableHead className={cn(language === 'ar' ? 'text-left' : 'text-right')}>{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMedicines.map((medicine) => (
              <TableRow key={medicine.id}>
                <TableCell className={cn("font-medium", language === 'ar' && 'text-right')}>{medicine.name}</TableCell>
                <TableCell className={cn(language === 'ar' && 'text-right')}>{medicine.dosage || 'N/A'}</TableCell>
                <TableCell className={cn(language === 'ar' && 'text-right')}>{medicine.form || 'N/A'}</TableCell>
                <TableCell className={cn(language === 'ar' && 'text-right')}>{medicine.manufacturer || 'N/A'}</TableCell>
                <TableCell className={cn(language === 'ar' && 'text-right')}>{medicine.price ? `$${medicine.price}` : 'N/A'}</TableCell>
                <TableCell className={cn(language === 'ar' ? 'text-left' : 'text-right')}>
                  <div className={cn("flex gap-2", language === 'ar' ? 'justify-start flex-row-reverse space-x-reverse' : 'justify-end')}>
                    <Dialog>
                      <DialogTrigger asChild>
                        <EditButton
                          size="sm"
                          onClick={() => setSelectedMedicine(medicine)}
                        >
                          {t('common.edit')}
                        </EditButton>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className={cn(language === 'ar' && 'text-right')}>{t('medicines.editMedicine')}</DialogTitle>
                        </DialogHeader>
                        <MedicineForm medicine={medicine} onSave={handleMedicineSaved} />
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DeleteButton size="sm">
                          {t('common.delete')}
                        </DeleteButton>
                      </AlertDialogTrigger>
                      <AlertDialogContent className={cn(language === 'ar' && 'rtl')}>
                        <AlertDialogHeader>
                          <AlertDialogTitle className={cn(language === 'ar' && 'text-right')}>{t('common.areYouSure')}</AlertDialogTitle>
                          <AlertDialogDescription className={cn(language === 'ar' && 'text-right')}>
                            {t('common.cannotUndo')} {t('medicines.deleteConfirm').replace('{name}', medicine.name)}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className={cn(language === 'ar' && 'flex-row-reverse')}>
                          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(medicine.id)} disabled={deletingId === medicine.id}>
                            {deletingId === medicine.id ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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

        {filteredMedicines.length === 0 && (
          <SectionLoading
            text={searchTerm ? t('medicines.noMedicinesFound') : t('medicines.noMedicines')}
            variant="pulse"
            color="gray"
            className="min-h-[200px]"
          />
        )}
      </div>
    </div>
  );
};