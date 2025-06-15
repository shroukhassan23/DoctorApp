import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Edit,
  User,
  Stethoscope,
  MapPin,
  Phone,
  Mail,
  Building2,
  GraduationCap,
  Award,
  Clock,
  Calendar,
  UserPlus,
  Star,
  Shield,
  Activity,
  Settings,
  Contact
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DoctorProfileForm } from './DoctorProfileForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { doctorProfileUrl } from '@/components/constants.js';

export const DoctorProfilePage = () => {
  const [showForm, setShowForm] = useState(false);
  const { t, language } = useLanguage();

  const { data: doctorProfile, isLoading, refetch } = useQuery({
    queryKey: ['doctor-profile'],
    queryFn: async () => {
      const response = await fetch(doctorProfileUrl);
      if (response.status === 404) {
        return null; // No profile created yet
      }
      if (!response.ok) throw new Error('Failed to fetch doctor profile');
      return await response.json();
    },
  });

  const handleProfileSaved = () => {
    refetch();
    setShowForm(false);
  };

  if (isLoading) {
    return (
      <div className={cn("p-6", language === 'ar' && 'text-right')}>
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded-lg w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-64 bg-gray-200 rounded-xl"></div>
                <div className="h-48 bg-gray-200 rounded-xl"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6", language === 'ar' && 'rtl')}>
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className={cn("flex justify-between items-center mb-8 p-6 bg-white rounded-xl shadow-md border border-gray-200", language === 'ar' && 'flex-row-reverse rtl')}>
          <div className={cn("flex items-center gap-4", language === 'ar' && 'flex-row-reverse')}>
            <div className="p-3 bg-[#2463EB] rounded-xl shadow-lg">
              <Settings className="w-7 h-7 text-white" />
            </div>
            <div className="space-y-1">
              <h1 className={cn("text-3xl font-bold text-black", language === 'ar' && 'text-right')}>
                {t('profile.title')}
              </h1>
              <p className={cn("text-gray-600 text-sm", language === 'ar' && 'text-right')}>
                {doctorProfile ? 'Manage your professional information' : 'Create your professional profile'}
              </p>
            </div>
          </div>

          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {doctorProfile ? <Edit className="w-5 h-5 mr-2" /> : <UserPlus className="w-5 h-5 mr-2" />}
                {doctorProfile ? t('profile.editProfile') : t('profile.createProfile')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className={cn("text-xl font-semibold", language === 'ar' && 'text-right')}>
                  {doctorProfile ? t('profile.editProfile') : t('profile.createProfile')}
                </DialogTitle>
              </DialogHeader>
              <DoctorProfileForm profile={doctorProfile} onSave={handleProfileSaved} />
            </DialogContent>
          </Dialog>
        </div>

        {doctorProfile ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Profile Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Doctor Information Card */}
              <Card className={cn("shadow-xl border-0 bg-gradient-to-br from-white to-blue-50/30 backdrop-blur-sm", language === 'ar' && 'rtl')}>
                <CardHeader className="pb-4">
                  <div className={cn("flex items-center justify-between", language === 'ar' && 'flex-row-reverse')}>
                    <div className={cn("flex items-center space-x-4", language === 'ar' && 'space-x-reverse')}>
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <CardTitle className={cn("text-2xl font-bold text-gray-900", language === 'ar' && 'text-right')}>
                          {doctorProfile.name}
                        </CardTitle>
                        <p className={cn("text-lg font-medium text-blue-600", language === 'ar' && 'text-right')}>
                          {doctorProfile.title}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                      <Shield className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Professional Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <GraduationCap className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <label className={cn("text-sm font-semibold text-gray-700 uppercase tracking-wide", language === 'ar' && 'text-right')}>
                            {t('profile.qualification')}
                          </label>
                          <p className={cn("text-base text-gray-900 font-medium", language === 'ar' && 'text-right')}>
                            {doctorProfile.qualification || 'Not specified'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Stethoscope className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <label className={cn("text-sm font-semibold text-gray-700 uppercase tracking-wide", language === 'ar' && 'text-right')}>
                            {t('profile.specialization')}
                          </label>
                          <p className={cn("text-base text-gray-900 font-medium", language === 'ar' && 'text-right')}>
                            {doctorProfile.specialization || 'Not specified'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <Phone className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <label className={cn("text-sm font-semibold text-gray-700 uppercase tracking-wide", language === 'ar' && 'text-right')}>
                            {t('profile.phone')}
                          </label>
                          <p className={cn("text-base text-gray-900 font-medium", language === 'ar' && 'text-right')}>
                            {doctorProfile.phone || 'Not provided'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Mail className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <label className={cn("text-sm font-semibold text-gray-700 uppercase tracking-wide", language === 'ar' && 'text-right')}>
                            {t('profile.email')}
                          </label>
                          <p className={cn("text-base text-gray-900 font-medium break-all", language === 'ar' && 'text-right')}>
                            {doctorProfile.email || 'Not provided'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Clinic Information Card */}
              <Card className={cn("shadow-xl border-0 bg-gradient-to-br from-white to-indigo-50/30", language === 'ar' && 'rtl')}>
                <CardHeader>
                  <CardTitle className={cn("flex items-center text-xl font-bold", language === 'ar' && 'flex-row-reverse text-right')}>
                    <Building2 className="w-6 h-6 mr-3 text-indigo-600" />
                    Clinic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Building2 className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <label className={cn("text-sm font-semibold text-gray-700 uppercase tracking-wide", language === 'ar' && 'text-right')}>
                          {t('profile.clinicName')}
                        </label>
                        <p className={cn("text-base text-gray-900 font-medium", language === 'ar' && 'text-right')}>
                          {doctorProfile.clinic_name || 'Not specified'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <label className={cn("text-sm font-semibold text-gray-700 uppercase tracking-wide", language === 'ar' && 'text-right')}>
                          {t('profile.clinicAddress')}
                        </label>
                        <p className={cn("text-base text-gray-900 font-medium", language === 'ar' && 'text-right')}>
                          {doctorProfile.clinic_address || 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Profile Summary Card */}
              <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-green-50/30">
                <CardHeader>
                  <CardTitle className={cn("flex items-center text-lg font-bold", language === 'ar' && 'flex-row-reverse text-right')}>
                    <User className="w-5 h-5 mr-2 text-green-600" />
                    Profile Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Profile Status</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                      Complete
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Stethoscope className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Specialization</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {doctorProfile.specialization ? 'Set' : 'Not Set'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Building2 className="w-4 h-4 text-orange-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Clinic Info</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {doctorProfile.clinic_name ? 'Complete' : 'Incomplete'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions Card */}
              {/* <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-purple-50/30">
                <CardHeader>
                  <CardTitle className={cn("flex items-center text-lg font-bold", language === 'ar' && 'flex-row-reverse text-right')}>
                    <Activity className="w-5 h-5 mr-2 text-purple-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start h-12 bg-white hover:bg-gray-50 border-gray-200"
                      onClick={() => setShowForm(true)}
                    >
                      <Edit className="w-4 h-4 mr-3 text-blue-600" />
                      <span className="text-sm font-medium">Edit Profile</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start h-12 bg-white hover:bg-gray-50 border-gray-200"
                    >
                      <User className="w-4 h-4 mr-3 text-green-600" />
                      <span className="text-sm font-medium">View Patients</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start h-12 bg-white hover:bg-gray-50 border-gray-200"
                    >
                      <Calendar className="w-4 h-4 mr-3 text-purple-600" />
                      <span className="text-sm font-medium">Schedule</span>
                    </Button>
                  </div>
                </CardContent>
              </Card> */}
            </div>
          </div>
        ) : (
          // Empty State
          <Card className={cn("shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50", language === 'ar' && 'rtl')}>
            <CardContent className="pt-12 pb-12">
              <div className={cn("text-center max-w-md mx-auto", language === 'ar' && 'text-right')}>
                <div className="relative mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto">
                    <User className="w-12 h-12 text-blue-600" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <UserPlus className="w-4 h-4 text-white" />
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('profile.noProfile')}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {t('profile.noProfileDescription')}
                </p>

                <Dialog open={showForm} onOpenChange={setShowForm}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                      <UserPlus className="w-5 h-5 mr-2" />
                      {t('profile.createProfile')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className={cn("text-xl font-semibold", language === 'ar' && 'text-right')}>
                        {t('profile.createProfile')}
                      </DialogTitle>
                    </DialogHeader>
                    <DoctorProfileForm profile={doctorProfile} onSave={handleProfileSaved} />
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};