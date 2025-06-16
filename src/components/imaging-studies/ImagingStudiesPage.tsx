import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, Scan } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImagingStudyForm } from './ImagingStudyForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { managementImagingStudiesUrl, deleteImagingStudyUrl } from '@/components/constants.js';
import { AddButton, DeleteButton, EditButton } from '../ui/enhanced-button';

export const ImagingStudiesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingStudy, setEditingStudy] = useState<any>(null);
  const { toast } = useToast();
  const { t, language } = useLanguage();

  const { data: imagingStudies, isLoading, refetch } = useQuery({
    queryKey: ['imaging_studies'],
    queryFn: async () => {
      const response = await fetch(managementImagingStudiesUrl);
      if (!response.ok) throw new Error('Failed to fetch imaging studies');
      return await response.json();
    },
  });

  const filteredStudies = imagingStudies?.filter(study =>
    study.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleStudySaved = () => {
    refetch();
    setShowForm(false);
    setEditingStudy(null);
  };

  const handleDelete = async (studyId: string) => {
    try {
      const response = await fetch(deleteImagingStudyUrl(studyId), {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Delete failed');
      }

      toast({ title: t('imaging.deletedSuccess') });
      refetch();
    } catch (error) {
      console.error('Error deleting imaging study:', error);
      toast({
        title: t('imaging.errorDeleting'),
        description: t('form.tryAgain'),
        variant: 'destructive'
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return <div className={cn("p-6", language === 'ar' && "rtl")}>{t('common.loading')} {t('nav.imagingStudies').toLowerCase()}...</div>;
  }

  return (
    <div className={cn("p-6", language === 'ar' && "rtl")}>


<div className={cn("flex justify-between items-center mb-8", language === 'ar' && 'flex-row-reverse rtl')}>
  <div className={cn("flex items-center gap-4", language === 'ar' && 'flex-row-reverse')}>
    <div className="p-3 bg-[#2463EB] rounded-xl shadow-lg">
      <Scan className="w-7 h-7 text-white" />
    </div>
    <div>
      <h1 className={cn("text-3xl font-bold text-gray-900", language === 'ar' && 'text-right')}>
        {t('imaging.title')}
      </h1>
      <p className={cn("text-gray-600 mt-1", language === 'ar' && 'text-right')}>
       {t('imaging.manage')}
      </p>
    </div>
  </div>

  <Dialog open={showForm} onOpenChange={setShowForm}>
    <DialogTrigger asChild>
      <AddButton size="sm">
        {t('imaging.addNew')}
      </AddButton>
    </DialogTrigger>
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className={cn(language === 'ar' && 'text-right')}>
          {t('imaging.addNew')}
        </DialogTitle>
      </DialogHeader>
      <ImagingStudyForm onSave={handleStudySaved} />
    </DialogContent>
  </Dialog>
</div>

{/* Enhanced Search Section */}
<div className="mb-8 p-6 bg-white rounded-xl shadow-md border border-gray-200">
  <div className="space-y-3">
    <label className={cn("text-sm font-semibold text-gray-700 flex items-center gap-2", language === 'ar' && 'text-right flex-row-reverse')}>
      <Scan className="w-4 h-4 text-[#2463EB]" />
      {t('imaging.search')}
    </label>
    <div className="relative">
      <Search className={cn(
        "absolute top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5",
        language === 'ar' ? 'right-4' : 'left-4'
      )} />
      <Input
        placeholder=    {t('imaging.searchPlaceholder')}
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
              <TableHead className={cn(language === 'ar' && 'text-right')}>{t('common.description')}</TableHead>
              <TableHead className={cn(language === 'ar' && 'text-right')}>{t('common.created')}</TableHead>
              <TableHead className={cn(language === 'ar' ? 'text-left' : 'text-right')}>{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudies.map((study) => (
              <TableRow key={study.id}>
                <TableCell className={cn("font-medium", language === 'ar' && 'text-right')}>{study.name}</TableCell>
                <TableCell className={cn(language === 'ar' && 'text-right')}>{study.description || 'N/A'}</TableCell>
                <TableCell className={cn(language === 'ar' && 'text-right')}>{formatDate(study.created_at)}</TableCell>
                <TableCell className={cn(language === 'ar' ? 'text-left' : 'text-right')}>
                  <div className={cn("flex space-x-2", language === 'ar' ? 'justify-start flex-row-reverse space-x-reverse' : 'justify-end')}>
                    <Dialog open={editingStudy?.id === study.id} onOpenChange={(open) => !open && setEditingStudy(null)}>
                      <DialogTrigger asChild>
                        <EditButton
                          size="sm"
                          onClick={() => setEditingStudy(study)}
                        >
                          {t('common.edit')}
                        </EditButton>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className={cn(language === 'ar' && 'text-right')}>{t('imaging.editStudy')}</DialogTitle>
                        </DialogHeader>
                        <ImagingStudyForm imagingStudy={editingStudy} onSave={handleStudySaved} />
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
                            {t('common.cannotUndo')} {t('imaging.deleteConfirm').replace('{name}', study.name)}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className={cn(language === 'ar' && 'flex-row-reverse')}>
                          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(study.id)}>
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

        {filteredStudies.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">{t('imaging.noStudies')}</p>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      {editingStudy && (
        <Dialog open={!!editingStudy} onOpenChange={(open) => !open && setEditingStudy(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className={cn(language === 'ar' && 'text-right')}>{t('imaging.editStudy')}</DialogTitle>
            </DialogHeader>
            <ImagingStudyForm imagingStudy={editingStudy} onSave={handleStudySaved} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};