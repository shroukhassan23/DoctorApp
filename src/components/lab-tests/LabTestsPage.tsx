
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { LabTestForm } from './LabTestForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export const LabTestsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTest, setEditingTest] = useState<any>(null);
  const { toast } = useToast();
  const { t, language } = useLanguage();

  const { data: labTests, isLoading, refetch } = useQuery({
    queryKey: ['lab_tests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lab_tests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const filteredLabTests = labTests?.filter(test =>
    test.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleLabTestSaved = () => {
    refetch();
    setShowForm(false);
    setEditingTest(null);
  };

  const handleDelete = async (testId: string) => {
    try {
      const { error } = await supabase
        .from('lab_tests')
        .delete()
        .eq('id', testId);
      
      if (error) throw error;
      
      toast({ title: t('labTests.deletedSuccess') });
      refetch();
    } catch (error) {
      console.error('Error deleting lab test:', error);
      toast({ 
        title: t('labTests.errorDeleting'), 
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
    return <div className={cn("p-6", language === 'ar' && "rtl")}>{t('common.loading')} {t('nav.labTests').toLowerCase()}...</div>;
  }

  return (
    <div className={cn("p-6", language === 'ar' && "rtl")}>
      <div className={cn("flex justify-between items-center mb-6", language === 'ar' && 'flex-row-reverse')}>
        <h1 className="text-2xl font-bold text-gray-900">{t('labTests.title')}</h1>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button className={cn(language === 'ar' && 'flex-row-reverse')}>
              <Plus className="w-4 h-4 mr-2" />
              {t('labTests.addNew')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className={cn(language === 'ar' && 'text-right')}>{t('labTests.addNew')}</DialogTitle>
            </DialogHeader>
            <LabTestForm onSave={handleLabTestSaved} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className={cn("absolute top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4", 
            language === 'ar' ? 'right-3' : 'left-3')} />
          <Input
            placeholder={t('labTests.searchPlaceholder')}
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
            {filteredLabTests.map((test) => (
              <TableRow key={test.id}>
                <TableCell className={cn("font-medium", language === 'ar' && 'text-right')}>{test.name}</TableCell>
                <TableCell className={cn(language === 'ar' && 'text-right')}>{test.description || 'N/A'}</TableCell>
                <TableCell className={cn(language === 'ar' && 'text-right')}>{formatDate(test.created_at)}</TableCell>
                <TableCell className={cn(language === 'ar' ? 'text-left' : 'text-right')}>
                  <div className={cn("flex space-x-2", language === 'ar' ? 'justify-start flex-row-reverse space-x-reverse' : 'justify-end')}>
                    <Dialog open={editingTest?.id === test.id} onOpenChange={(open) => !open && setEditingTest(null)}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingTest(test)}
                          className={cn(language === 'ar' && 'flex-row-reverse')}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          {t('common.edit')}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className={cn(language === 'ar' && 'text-right')}>{t('labTests.editTest')}</DialogTitle>
                        </DialogHeader>
                        <LabTestForm labTest={editingTest} onSave={handleLabTestSaved} />
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
                            {t('common.cannotUndo')} {t('labTests.deleteConfirm').replace('{name}', test.name)}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className={cn(language === 'ar' && 'flex-row-reverse')}>
                          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(test.id)}>
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
        
        {filteredLabTests.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">{t('labTests.noTests')}</p>
          </div>
        )}
      </div>
      
      {/* Edit Dialog */}
      {editingTest && (
        <Dialog open={!!editingTest} onOpenChange={(open) => !open && setEditingTest(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className={cn(language === 'ar' && 'text-right')}>{t('labTests.editTest')}</DialogTitle>
            </DialogHeader>
            <LabTestForm labTest={editingTest} onSave={handleLabTestSaved} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
