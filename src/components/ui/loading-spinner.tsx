import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export const LoadingSpinner = ({ size = 'md', className, text }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="flex flex-col items-center gap-2">
        <div
          className={cn(
            'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
            sizeClasses[size]
          )}
        />
        {text && (
          <p className="text-sm text-gray-600">{text}</p>
        )}
      </div>
    </div>
  );
};

export const PageLoading = ({ text = 'Loading...' }: { text?: string }) => (
  <div className="flex items-center justify-center min-h-[400px]">
    <LoadingSpinner size="lg" text={text} />
  </div>
);

export const ButtonLoading = ({ text = 'Loading...' }: { text?: string }) => (
  <div className="flex items-center gap-2">
    <LoadingSpinner size="sm" />
    <span>{text}</span>
  </div>
);

export const SectionLoading = ({ text }: { text?: string }) => (
  <div className="flex items-center justify-center py-8">
    <LoadingSpinner size="md" text={text} />
  </div>
);