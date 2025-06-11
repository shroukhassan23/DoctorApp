
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Edit, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { DoctorProfileForm } from './DoctorProfileForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export const DoctorProfilePage = () => {
  const [showForm, setShowForm] = useState(false);
  const { t, language } = useLanguage();

  const { data: doctorProfile, isLoading, refetch } = useQuery({
    queryKey: ['doctor-profile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doctor_profile')
        .select('*')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  const handleProfileSaved = () => {
    refetch();
    setShowForm(false);
  };

  if (isLoading) {
    return <div className={cn("p-6", language === 'ar' && 'text-right')}>{t('profile.loadingProfile')}</div>;
  }

  return (
    <div className={cn("p-6 max-w-4xl mx-auto", language === 'ar' && 'rtl')}>
      <div className={cn("flex justify-between items-center mb-6", language === 'ar' && 'flex-row-reverse')}>
        <h1 className={cn("text-2xl font-bold text-gray-900", language === 'ar' && 'text-right')}>{t('profile.title')}</h1>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button>
              {doctorProfile ? <Edit className="w-4 h-4 mr-2" /> : <User className="w-4 h-4 mr-2" />}
              {doctorProfile ? t('profile.editProfile') : t('profile.createProfile')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className={cn(language === 'ar' && 'text-right')}>
                {doctorProfile ? t('profile.editProfile') : t('profile.createProfile')}
              </DialogTitle>
            </DialogHeader>
            <DoctorProfileForm profile={doctorProfile} onSave={handleProfileSaved} />
          </DialogContent>
        </Dialog>
      </div>

      {doctorProfile ? (
        <Card className={cn(language === 'ar' && 'rtl')}>
          <CardHeader>
            <CardTitle className={cn("flex items-center", language === 'ar' && 'flex-row-reverse text-right')}>
              <User className="w-5 h-5 mr-2" />
              {t('profile.doctorInformation')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className={cn("text-sm font-medium text-gray-500", language === 'ar' && 'text-right')}>{t('common.name')}</label>
                  <p className={cn("text-lg font-semibold", language === 'ar' && 'text-right')}>{doctorProfile.name}</p>
                </div>
                <div>
                  <label className={cn("text-sm font-medium text-gray-500", language === 'ar' && 'text-right')}>{t('profile.title')}</label>
                  <p className={cn("text-lg", language === 'ar' && 'text-right')}>{doctorProfile.title}</p>
                </div>
                <div>
                  <label className={cn("text-sm font-medium text-gray-500", language === 'ar' && 'text-right')}>{t('profile.qualification')}</label>
                  <p className={cn("text-lg", language === 'ar' && 'text-right')}>{doctorProfile.qualification || 'N/A'}</p>
                </div>
                <div>
                  <label className={cn("text-sm font-medium text-gray-500", language === 'ar' && 'text-right')}>{t('profile.specialization')}</label>
                  <p className={cn("text-lg", language === 'ar' && 'text-right')}>{doctorProfile.specialization || 'N/A'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={cn("text-sm font-medium text-gray-500", language === 'ar' && 'text-right')}>{t('profile.clinicName')}</label>
                  <p className={cn("text-lg", language === 'ar' && 'text-right')}>{doctorProfile.clinic_name || 'N/A'}</p>
                </div>
                <div>
                  <label className={cn("text-sm font-medium text-gray-500", language === 'ar' && 'text-right')}>{t('profile.clinicAddress')}</label>
                  <p className={cn("text-lg", language === 'ar' && 'text-right')}>{doctorProfile.clinic_address || 'N/A'}</p>
                </div>
                <div>
                  <label className={cn("text-sm font-medium text-gray-500", language === 'ar' && 'text-right')}>{t('profile.phone')}</label>
                  <p className={cn("text-lg", language === 'ar' && 'text-right')}>{doctorProfile.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className={cn("text-sm font-medium text-gray-500", language === 'ar' && 'text-right')}>{t('profile.email')}</label>
                  <p className={cn("text-lg", language === 'ar' && 'text-right')}>{doctorProfile.email || 'N/A'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className={cn(language === 'ar' && 'rtl')}>
          <CardContent className="pt-6">
            <div className={cn("text-center py-12", language === 'ar' && 'text-right')}>
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">{t('profile.noProfile')}</h3>
              <p className="mt-1 text-sm text-gray-500">
                {t('profile.noProfileDescription')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
