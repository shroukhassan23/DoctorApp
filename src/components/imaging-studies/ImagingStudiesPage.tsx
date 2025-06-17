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
import { SectionLoading, TableLoading, CardLoading } from '@/components/ui/loading-spinner';

export const ImagingStudiesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingStudy, setEditingStudy] = useState<any>(null);
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

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
    setFormLoading(true);
    refetch();
    setShowForm(false);
    setEditingStudy(null);
    setFormLoading(false);
  };

  const handleDelete = async (studyId: string) => {
    setDeletingId(studyId);

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
    } finally {
      setDeletingId(null);
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
          <TableLoading rows={5} columns={4} />
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
                  <Scan className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className={cn("order-1", language === 'ar' && 'order-2')}>
                <h1 className={cn("text-3xl font-bold text-gray-900", language === 'ar' && 'text-right')}>
                  {t('imaging.title')}
                </h1>
                <p className={cn("text-gray-600 mt-1", language === 'ar' && 'text-right')}>
                  {t('imaging.manage')}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="p-3 bg-[#2463EB] rounded-xl shadow-lg">
                <Scan className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {t('imaging.title')}
                </h1>
                <p className="text-gray-600 mt-1">
                  {t('imaging.manage')}
                </p>
              </div>
            </>
          )}
        </div>

        <div className={cn(language === 'ar' && 'order-first')}>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <AddButton size="sm" loading={formLoading} disabled={formLoading}>
                {t('imaging.addNew')}
              </AddButton>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className={cn(language === 'ar' && 'text-right')}>
                  {t('imaging.addNew')}
                </DialogTitle>
              </DialogHeader>
              <ImagingStudyForm onSave={handleStudySaved} isLoading={formLoading} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Enhanced Search Section */}
      <div className="mb-8 p-6 bg-white rounded-xl shadow-md border border-gray-200">
        <div className="space-y-3">
          <label className={cn(
            "text-sm font-semibold text-gray-700 flex items-center gap-2",
            language === 'ar' && 'flex-row-reverse justify-end text-right'
          )}>            <Scan className="w-4 h-4 text-[#2463EB]" />
            {t('imaging.search')}
          </label>
          <div className="relative">
            <Search className={cn(
              "absolute top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5",
              language === 'ar' ? 'right-4' : 'left-4'
            )} />
            <Input
              placeholder={t('imaging.searchPlaceholder')}
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
                  <div className={cn("flex gap-2", language === 'ar' ? 'justify-start flex-row-reverse space-x-reverse' : 'justify-end')}>
                    <Dialog open={editingStudy?.id === study.id} onOpenChange={(open) => !open && setEditingStudy(null)}>
                      <DialogTrigger asChild>
                        <EditButton
                          size="sm"
                          loading={formLoading && editingStudy?.id === study.id}
                          disabled={formLoading}
                          onClick={() => setEditingStudy(study)}
                        >
                          {t('common.edit')}
                        </EditButton>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className={cn(language === 'ar' && 'text-right')}>{t('imaging.editStudy')}</DialogTitle>
                        </DialogHeader>
                        <ImagingStudyForm imagingStudy={editingStudy} onSave={handleStudySaved} isLoading={formLoading} />
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
                          <AlertDialogAction onClick={() => handleDelete(study.id)} disabled={deletingId === study.id}>
                            {deletingId === study.id ? (
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

        {filteredStudies.length === 0 && (
          <SectionLoading
            text={searchTerm ? t('imaging.noStudiesFound') : t('imaging.noStudies')}
            variant="pulse"
            color="gray"
            className="min-h-[200px]"
          />
        )}
      </div>

      {/* Edit Dialog */}
      {/* {editingStudy && (
        <Dialog open={!!editingStudy} onOpenChange={(open) => !open && setEditingStudy(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className={cn(language === 'ar' && 'text-right')}>{t('imaging.editStudy')}</DialogTitle>
            </DialogHeader>
            <ImagingStudyForm imagingStudy={editingStudy} onSave={handleStudySaved} />
          </DialogContent>
        </Dialog>
      )} */}
    </div>
  );
};