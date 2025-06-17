
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, Pill, User, Stethoscope, FileText, ScanLine, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/ui/language-toggle';

export const Sidebar = () => {
  const location = useLocation();
  const { t, language } = useLanguage();

  const navigation = [
    { name: t('nav.patients'), href: '/patients', icon: Users },
    { name: t('nav.medicines'), href: '/medicines', icon: Pill },
    { name: t('nav.labTests'), href: '/lab-tests', icon: FileText },
    { name: t('nav.imagingStudies'), href: '/imaging-studies', icon: ScanLine },
    { name: t('nav.reports'), href: '/reports', icon: BarChart3 },
    { name: t('nav.profile'), href: '/profile', icon: User },
  ];

  return (
    <div className={cn("flex flex-col w-64 bg-white shadow-lg", language === 'ar' && "rtl")}>
      <div className="flex items-center justify-center h-16 px-4 bg-blue-600">
        <Stethoscope className="w-8 h-8 text-white mr-2" />
        <h1 className="text-xl font-bold text-white">
          {language === 'ar' ? 'بوابة الطبيب' : 'Doctor Portal'}
        </h1>
      </div>

      <div className="p-4 border-b border-gray-200">
        <LanguageToggle />
      </div>

      <nav className="flex-1 px-4 py-6 gap-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href || (location.pathname === '/' && item.href === '/patients');

          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100',
                language === 'ar' && 'text-right justify-start margin-right-10'
              )}
            >
              {language === 'ar' ? (
                <>
                  <Icon className="w-5 h-5 mr-3" />
                  <span>{item.name}</span>
                </>
              ) : (
                <>
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
