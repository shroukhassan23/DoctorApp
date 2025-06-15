import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EnhancedDialogCloseProps {
  onClose: () => void;
  variant?: 'default' | 'subtle' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const EnhancedDialogClose = ({ 
  onClose, 
  variant = 'default', 
  size = 'md',
  className 
}: EnhancedDialogCloseProps) => {
  const sizeClasses = {
    sm: 'w-6 h-6 p-1',
    md: 'w-8 h-8 p-1.5',
    lg: 'w-10 h-10 p-2'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const variantClasses = {
    default: 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 border border-gray-200',
    subtle: 'bg-transparent hover:bg-gray-100 text-gray-400 hover:text-gray-600',
    danger: 'bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 border border-red-200'
  };

  return (
    <Button
      onClick={onClose}
      className={cn(
        'absolute top-4 right-4 z-10 rounded-full',
        'transition-all duration-200 transform hover:scale-110',
        'focus:ring-4 focus:ring-gray-200 focus:outline-none',
        'shadow-sm hover:shadow-md',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      variant="ghost"
    >
      <X className={cn('transition-transform duration-200', iconSizes[size])} />
      <span className="sr-only">Close dialog</span>
    </Button>
  );
};

// Custom Dialog Header with enhanced close button
export const EnhancedDialogHeader = ({ 
  children, 
  onClose, 
  closeVariant = 'default',
  className 
}: {
  children: React.ReactNode;
  onClose: () => void;
  closeVariant?: 'default' | 'subtle' | 'danger';
  className?: string;
}) => (
  <div className={cn('relative pb-4', className)}>
    {children}
    <EnhancedDialogClose onClose={onClose} variant={closeVariant} />
  </div>
);

// Alternative floating close button (outside dialog)
export const FloatingDialogClose = ({ 
  onClose, 
  className 
}: {
  onClose: () => void;
  className?: string;
}) => (
  <Button
    onClick={onClose}
    className={cn(
      'fixed top-4 right-4 z-50 w-10 h-10 p-0 rounded-full',
      'bg-white/90 hover:bg-white border border-gray-200',
      'text-gray-600 hover:text-gray-800',
      'transition-all duration-200 transform hover:scale-110',
      'shadow-lg hover:shadow-xl backdrop-blur-sm',
      'focus:ring-4 focus:ring-gray-200 focus:outline-none',
      className
    )}
    variant="ghost"
  >
    <X className="w-5 h-5" />
    <span className="sr-only">Close dialog</span>
  </Button>
);

// Animated X that transforms on hover
export const AnimatedDialogClose = ({ 
  onClose, 
  className 
}: {
  onClose: () => void;
  className?: string;
}) => (
  <Button
    onClick={onClose}
    className={cn(
      'absolute top-4 right-4 z-10 w-8 h-8 p-0 rounded-full',
      'bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-200',
      'text-gray-500 hover:text-red-500',
      'transition-all duration-300 transform hover:scale-110 hover:rotate-90',
      'focus:ring-4 focus:ring-red-200 focus:outline-none',
      'shadow-sm hover:shadow-md',
      'group',
      className
    )}
    variant="ghost"
  >
    <X className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
    <span className="sr-only">Close dialog</span>
  </Button>
);

// Modern close button with backdrop effect
export const ModernDialogClose = ({ 
  onClose, 
  className 
}: {
  onClose: () => void;
  className?: string;
}) => (
  <div className="absolute top-0 right-0 p-4">
    <Button
      onClick={onClose}
      className={cn(
        'w-9 h-9 p-0 rounded-lg',
        'bg-gray-900/5 hover:bg-gray-900/10 dark:bg-gray-100/5 dark:hover:bg-gray-100/10',
        'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100',
        'transition-all duration-200',
        'border border-gray-200/50 hover:border-gray-300/50',
        'shadow-sm hover:shadow-md backdrop-blur-sm',
        'focus:ring-2 focus:ring-gray-300 focus:outline-none',
        className
      )}
      variant="ghost"
    >
      <X className="w-4 h-4" />
      <span className="sr-only">Close dialog</span>
    </Button>
  </div>
);

// iOS-style close button
export const IOSDialogClose = ({ 
  onClose, 
  className 
}: {
  onClose: () => void;
  className?: string;
}) => (
  <Button
    onClick={onClose}
    className={cn(
      'absolute top-4 right-4 z-10 w-7 h-7 p-0 rounded-full',
      'bg-gray-100/80 hover:bg-gray-200/80 backdrop-blur-sm',
      'text-gray-600 hover:text-gray-800',
      'transition-all duration-200 transform hover:scale-105 active:scale-95',
      'border border-gray-200/50',
      'shadow-sm hover:shadow-md',
      className
    )}
    variant="ghost"
  >
    <X className="w-4 h-4 stroke-2" />
    <span className="sr-only">Close dialog</span>
  </Button>
);