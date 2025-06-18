import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, TestTube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LabTestForm } from './LabTestForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { managementLabTestsUrl, deleteLabTestUrl } from '@/components/constants.js';
import { AddButton, DeleteButton, EditButton } from '../ui/enhanced-button';
import { SectionLoading, TableLoading, CardLoading } from '@/components/ui/loading-spinner';

export const LabTestsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTest, setEditingTest] = useState<any>(null);
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const { data: labTests, isLoading, refetch } = useQuery({
    queryKey: ['lab_tests'],
    queryFn: async () => {
      const response = await fetch(managementLabTestsUrl);
      if (!response.ok) throw new Error('Failed to fetch lab tests');
      return await response.json();
    },
  });

  const filteredLabTests = labTests?.filter(test =>
    test.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleLabTestSaved = () => {
    setFormLoading(true);
    refetch();
    setShowForm(false);
    setEditingTest(null);
    setFormLoading(false);
  };

  const handleDelete = async (testId: string) => {
    setDeletingId(testId);
    try {
      const response = await fetch(deleteLabTestUrl(testId), {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Delete failed');
      }

      toast({ title: t('labTests.deletedSuccess') });
      refetch();
    } catch (error) {
      console.error('Error deleting lab test:', error);
      toast({
        title: t('labTests.errorDeleting'),
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
                  <TestTube className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className={cn("order-1", language === 'ar' && 'order-2')}>
                <h1 className={cn("text-3xl font-bold text-gray-900", language === 'ar' && 'text-right')}>
                  {t('labTests.title')}
                </h1>
                <p className={cn("text-gray-600 mt-1", language === 'ar' && 'text-right')}>
                  {t('labtests.manage')}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="p-3 bg-[#2463EB] rounded-xl shadow-lg">
                <TestTube className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {t('labTests.title')}
                </h1>
                <p className="text-gray-600 mt-1">
                  {t('labtests.manage')}
                </p>
              </div>
            </>
          )}
        </div>

        <div className={cn(language === 'ar' && 'order-first')}>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <AddButton size="sm"
                loading={formLoading}
                disabled={formLoading} >
                {t('labTests.addNew')}
              </AddButton>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className={cn(language === 'ar' && 'text-right')}>
                  {t('labTests.addNew')}
                </DialogTitle>
              </DialogHeader>
              <LabTestForm onSave={handleLabTestSaved} isLoading={formLoading} />
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
          )}>            <TestTube className="w-4 h-4 text-[#2463EB]" />
            {t('labTests.search')}
          </label>
          <div className="relative">
            <Search className={cn(
              "absolute top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5",
              language === 'ar' ? 'right-4' : 'left-4'
            )} />
            <Input
              placeholder={t('labTests.searchPlaceholder')}
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
            {filteredLabTests.map((test) => (
              <TableRow key={test.id}>
                <TableCell className={cn("font-medium", language === 'ar' && 'text-right')}>{test.name}</TableCell>
                <TableCell className={cn(language === 'ar' && 'text-right')}>{test.description || 'N/A'}</TableCell>
                <TableCell className={cn(language === 'ar' && 'text-right')}>{formatDate(test.created_at)}</TableCell>
                <TableCell className={cn(language === 'ar' ? 'text-left' : 'text-right')}>
                  <div className={cn("flex gap-2", language === 'ar' ? 'justify-start flex-row-reverse space-x-reverse' : 'justify-end')}>
                    <Dialog open={editingTest?.id === test.id} onOpenChange={(open) => !open && setEditingTest(null)}>
                      <DialogTrigger asChild>
                        <EditButton
                          size="sm"
                          loading={formLoading && editingTest?.id === test.id}
                          disabled={formLoading}
                          onClick={() => setEditingTest(test)}
                        >
                          {t('common.edit')}
                        </EditButton>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className={cn(language === 'ar' && 'text-right')}>{t('labTests.editTest')}</DialogTitle>
                        </DialogHeader>
                        <LabTestForm labTest={editingTest} onSave={handleLabTestSaved}
                          isLoading={formLoading} />
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
                            {t('common.cannotUndo')} {t('labTests.deleteConfirm').replace('{name}', test.name)}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className={cn(language === 'ar' && 'flex-row-reverse')}>
                          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(test.id)} disabled={deletingId === test.id}>
                            {deletingId === test.id ? (
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

        {filteredLabTests.length === 0 && !isLoading && (
          <SectionLoading
            text={searchTerm ? t('labTests.noTestsFound') : t('labTests.noTests')}
            variant="pulse"
            color="gray"
            className="min-h-[200px]"
          />
        )}
      </div>
    </div>
  );
};