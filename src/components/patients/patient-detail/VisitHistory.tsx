
import React, { useState } from 'react';
import { Calendar, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { VisitForm } from '../VisitForm';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface VisitHistoryProps {
  visits: any[];
  onVisitClick: (visit: any) => void;
  onVisitUpdated: () => void;
}

export const VisitHistory = ({ visits, onVisitClick, onVisitUpdated }: VisitHistoryProps) => {
  const [editingVisit, setEditingVisit] = useState<any>(null);
  const { toast } = useToast();

  const handleDeleteVisit = async (visitId: string) => {
    try {
      const { error } = await supabase
        .from('patient_visits')
        .delete()
        .eq('id', visitId);
      
      if (error) throw error;
      
      toast({ title: 'Visit deleted successfully' });
      onVisitUpdated();
    } catch (error) {
      console.error('Error deleting visit:', error);
      toast({ 
        title: 'Error deleting visit', 
        description: 'Please try again.',
        variant: 'destructive' 
      });
    }
  };

  const handleVisitUpdated = () => {
    onVisitUpdated();
    setEditingVisit(null);
    toast({ title: 'Visit updated successfully' });
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-3">
      {visits?.map((visit) => (
        <Card key={visit.id} className="hover:bg-gray-50 transition-colors">
          <CardContent className="pt-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2 w-full cursor-pointer" onClick={() => onVisitClick(visit)}>
                <div className="flex items-center gap-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDate(visit.visit_date)}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    visit.visit_type === 'primary' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {visit.visit_type === 'primary' ? 'Primary' : 'Follow-up'}
                  </span>
                </div>
                
                {visit.chief_complaint && visit.chief_complaint.trim() !== '' && (
                  <div className="text-sm">
                    <span className="font-medium">Chief Complaint:</span> {visit.chief_complaint.length > 100 ? `${visit.chief_complaint.substring(0, 100)}...` : visit.chief_complaint}
                  </div>
                )}
                
                {visit.diagnosis && visit.diagnosis.trim() !== '' && (
                  <div className="text-sm">
                    <span className="font-medium">Diagnosis:</span> {visit.diagnosis.length > 100 ? `${visit.diagnosis.substring(0, 100)}...` : visit.diagnosis}
                  </div>
                )}
                
                {visit.notes && visit.notes.trim() !== '' && (
                  <div className="text-sm">
                    <span className="font-medium">Notes:</span> {visit.notes.length > 100 ? `${visit.notes.substring(0, 100)}...` : visit.notes}
                  </div>
                )}
                
                {(!visit.chief_complaint || visit.chief_complaint.trim() === '') && 
                 (!visit.diagnosis || visit.diagnosis.trim() === '') && 
                 (!visit.notes || visit.notes.trim() === '') && (
                  <div className="text-sm text-gray-500 italic">
                    No additional details recorded
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2 ml-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingVisit(visit);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the visit record and all associated data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteVisit(visit.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {!visits?.length && (
        <p className="text-gray-500 text-center py-8">No visits recorded yet.</p>
      )}

      {/* Edit Visit Dialog */}
      {editingVisit && (
        <Dialog open={!!editingVisit} onOpenChange={() => setEditingVisit(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Visit - {formatDate(editingVisit.visit_date)}</DialogTitle>
            </DialogHeader>
            <VisitForm 
              patientId={editingVisit.patient_id} 
              visit={editingVisit}
              onSave={handleVisitUpdated} 
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
