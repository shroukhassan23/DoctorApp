import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
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

export const MedicinesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
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
    }
  };

  if (isLoading) {
    return <div className={cn("p-6", language === 'ar' && "rtl")}>{t('common.loading')} {t('nav.medicines').toLowerCase()}...</div>;
  }

  return (
    <div className={cn("p-6", language === 'ar' && "rtl")}>
      <div className={cn("flex justify-between items-center mb-6", language === 'ar' && 'flex-row-reverse')}>
        <h1 className="text-2xl font-bold text-gray-900">{t('medicines.title')}</h1>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedMedicine(null)} className={cn(language === 'ar' && 'flex-row-reverse')}>
              <Plus className="w-4 h-4 mr-2" />
              {t('medicines.addNew')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className={cn(language === 'ar' && 'text-right')}>
                {selectedMedicine ? t('medicines.editMedicine') : t('medicines.addNew')}
              </DialogTitle>
            </DialogHeader>
            <MedicineForm medicine={selectedMedicine} onSave={handleMedicineSaved} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className={cn("absolute top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4", 
            language === 'ar' ? 'right-3' : 'left-3')} />
          <Input
            placeholder={t('medicines.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={cn(language === 'ar' ? 'pr-10 text-right' : 'pl-10')}
          />
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
                  <div className={cn("flex space-x-2", language === 'ar' ? 'justify-start flex-row-reverse space-x-reverse' : 'justify-end')}>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedMedicine(medicine)}
                          className={cn(language === 'ar' && 'flex-row-reverse')}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          {t('common.edit')}
                        </Button>
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
                        <Button variant="outline" size="sm" className={cn(language === 'ar' && 'flex-row-reverse')}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          {t('common.delete')}
                        </Button>
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
                          <AlertDialogAction onClick={() => handleDelete(medicine.id)}>
                            {t('common.delete')}
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
          <div className="text-center py-12">
            <p className="text-gray-500">{t('medicines.noMedicines')}</p>
          </div>
        )}
      </div>
    </div>
  );
};