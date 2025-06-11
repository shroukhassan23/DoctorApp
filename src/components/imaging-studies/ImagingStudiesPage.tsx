
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { ImagingStudyForm } from './ImagingStudyForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export const ImagingStudiesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingStudy, setEditingStudy] = useState<any>(null);
  const { toast } = useToast();
  const { t, language } = useLanguage();

  const { data: imagingStudies, isLoading, refetch } = useQuery({
    queryKey: ['imaging_studies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('imaging_studies')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
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
      const { error } = await supabase
        .from('imaging_studies')
        .delete()
        .eq('id', studyId);
      
      if (error) throw error;
      
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
      <div className={cn("flex justify-between items-center mb-6", language === 'ar' && 'flex-row-reverse')}>
        <h1 className="text-2xl font-bold text-gray-900">{t('imaging.title')}</h1>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button className={cn(language === 'ar' && 'flex-row-reverse')}>
              <Plus className="w-4 h-4 mr-2" />
              {t('imaging.addNew')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className={cn(language === 'ar' && 'text-right')}>{t('imaging.addNew')}</DialogTitle>
            </DialogHeader>
            <ImagingStudyForm onSave={handleStudySaved} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className={cn("absolute top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4", 
            language === 'ar' ? 'right-3' : 'left-3')} />
          <Input
            placeholder={t('imaging.searchPlaceholder')}
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
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingStudy(study)}
                          className={cn(language === 'ar' && 'flex-row-reverse')}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          {t('common.edit')}
                        </Button>
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
                        <Button variant="outline" size="sm" className={cn(language === 'ar' && 'flex-row-reverse')}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          {t('common.delete')}
                        </Button>
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
