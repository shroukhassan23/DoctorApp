
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  placeholder?: string;
}

export const SearchBar = ({ searchTerm, onSearchChange, placeholder }: SearchBarProps) => {
  const { t, language } = useLanguage();
  const defaultPlaceholder = t('common.search');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('SearchBar: Input changed to:', value); // Debug log
    onSearchChange(value);
  };

  return (
    <div className="mb-6">
      <div className={cn("relative", language === 'ar' && 'rtl')}>
        <Search className={cn("absolute top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4", 
          language === 'ar' ? 'right-3' : 'left-3')} />
        <Input
          placeholder={placeholder || defaultPlaceholder}
          value={searchTerm}
          onChange={handleChange}
          className={cn(language === 'ar' ? 'pr-10 text-right' : 'pl-10')}
        />
      </div>
    </div>
  );
};
