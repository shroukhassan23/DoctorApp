import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Check, 
  Download, 
  Upload, 
  Search,
  Printer,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Settings,
  User,
  Calendar,
  FileText,
  Mail,
  Phone
} from 'lucide-react';

interface EnhancedButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

// Primary Action Button (Add, Create, Save)
export const PrimaryButton = ({ 
  children, 
  onClick, 
  disabled, 
  loading, 
  size = 'md', 
  className,
  type = 'button'
}: EnhancedButtonProps) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800',
        'text-white font-semibold shadow-lg hover:shadow-xl',
        'transition-all duration-200 transform hover:scale-105',
        'border-0 focus:ring-4 focus:ring-blue-300',
        sizeClasses[size],
        disabled && 'opacity-50 cursor-not-allowed transform-none',
        className
      )}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          {children}
        </div>
      ) : (
        children
      )}
    </Button>
  );
};

// Success Button (Save, Confirm)
export const SuccessButton = ({ 
  children, 
  onClick, 
  disabled, 
  loading, 
  size = 'md', 
  className,
  type = 'button'
}: EnhancedButtonProps) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800',
        'text-white font-semibold shadow-lg hover:shadow-xl',
        'transition-all duration-200 transform hover:scale-105',
        'border-0 focus:ring-4 focus:ring-green-300',
        sizeClasses[size],
        disabled && 'opacity-50 cursor-not-allowed transform-none',
        className
      )}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          {children}
        </div>
      ) : (
        children
      )}
    </Button>
  );
};

// Danger Button (Delete, Remove)
export const DangerButton = ({ 
  children, 
  onClick, 
  disabled, 
  loading, 
  size = 'md', 
  className,
  type = 'button'
}: EnhancedButtonProps) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800',
        'text-white font-semibold shadow-lg hover:shadow-xl',
        'transition-all duration-200 transform hover:scale-105',
        'border-0 focus:ring-4 focus:ring-red-300',
        sizeClasses[size],
        disabled && 'opacity-50 cursor-not-allowed transform-none',
        className
      )}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          {children}
        </div>
      ) : (
        children
      )}
    </Button>
  );
};

// Secondary Button (Edit, View, Cancel)
export const SecondaryButton = ({ 
  children, 
  onClick, 
  disabled, 
  loading, 
  size = 'md', 
  className,
  type = 'button'
}: EnhancedButtonProps) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      variant="outline"
      className={cn(
        'bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-gray-400',
        'text-gray-700 hover:text-gray-900 font-medium shadow-sm hover:shadow-md',
        'transition-all duration-200 transform hover:scale-105',
        'focus:ring-4 focus:ring-gray-200',
        sizeClasses[size],
        disabled && 'opacity-50 cursor-not-allowed transform-none',
        className
      )}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
          {children}
        </div>
      ) : (
        children
      )}
    </Button>
  );
};

// Warning Button (Update, Modify)
export const WarningButton = ({ 
  children, 
  onClick, 
  disabled, 
  loading, 
  size = 'md', 
  className,
  type = 'button'
}: EnhancedButtonProps) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800',
        'text-white font-semibold shadow-lg hover:shadow-xl',
        'transition-all duration-200 transform hover:scale-105',
        'border-0 focus:ring-4 focus:ring-orange-300',
        sizeClasses[size],
        disabled && 'opacity-50 cursor-not-allowed transform-none',
        className
      )}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          {children}
        </div>
      ) : (
        children
      )}
    </Button>
  );
};

// Info Button (View, Details)
export const InfoButton = ({ 
  children, 
  onClick, 
  disabled, 
  loading, 
  size = 'md', 
  className,
  type = 'button'
}: EnhancedButtonProps) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800',
        'text-white font-semibold shadow-lg hover:shadow-xl',
        'transition-all duration-200 transform hover:scale-105',
        'border-0 focus:ring-4 focus:ring-indigo-300',
        sizeClasses[size],
        disabled && 'opacity-50 cursor-not-allowed transform-none',
        className
      )}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          {children}
        </div>
      ) : (
        children
      )}
    </Button>
  );
};

// Specific Action Buttons with Icons
export const AddButton = ({ children = 'Add', ...props }: Omit<EnhancedButtonProps, 'children'> & { children?: string }) => (
  <PrimaryButton {...props}>
    <Plus className="w-4 h-4 mr-2" />
    {children}
  </PrimaryButton>
);

export const SaveButton = ({ children = 'Save', ...props }: Omit<EnhancedButtonProps, 'children'> & { children?: string }) => (
  <SuccessButton {...props}>
    <Save className="w-4 h-4 mr-2" />
    {children}
  </SuccessButton>
);

export const EditButton = ({ children = 'Edit', ...props }: Omit<EnhancedButtonProps, 'children'> & { children?: string }) => (
  <WarningButton {...props}>
    <Edit className="w-4 h-4 mr-2" />
    {children}
  </WarningButton>
);

export const ViewButton = ({ children = 'View Details', ...props }: Omit<EnhancedButtonProps, 'children'> & { children?: string }) => (
  <InfoButton {...props}>
    <Eye className="w-4 h-4 mr-2" />
    {children}
  </InfoButton>
);

export const DeleteButton = ({ children = 'Delete', ...props }: Omit<EnhancedButtonProps, 'children'> & { children?: string }) => (
  <DangerButton {...props}>
    <Trash2 className="w-4 h-4 mr-2" />
    {children}
  </DangerButton>
);

export const CancelButton = ({ children = 'Cancel', ...props }: Omit<EnhancedButtonProps, 'children'> & { children?: string }) => (
  <SecondaryButton {...props}>
    <X className="w-4 h-4 mr-2" />
    {children}
  </SecondaryButton>
);

export const ConfirmButton = ({ children = 'Confirm', ...props }: Omit<EnhancedButtonProps, 'children'> & { children?: string }) => (
  <SuccessButton {...props}>
    <Check className="w-4 h-4 mr-2" />
    {children}
  </SuccessButton>
);

export const DownloadButton = ({ children = 'Download', ...props }: Omit<EnhancedButtonProps, 'children'> & { children?: string }) => (
  <SecondaryButton {...props}>
    <Download className="w-4 h-4 mr-2" />
    {children}
  </SecondaryButton>
);

export const UploadButton = ({ children = 'Upload', ...props }: Omit<EnhancedButtonProps, 'children'> & { children?: string }) => (
  <PrimaryButton {...props}>
    <Upload className="w-4 h-4 mr-2" />
    {children}
  </PrimaryButton>
);

export const PrintButton = ({ children = 'Print', ...props }: Omit<EnhancedButtonProps, 'children'> & { children?: string }) => (
  <SecondaryButton {...props}>
    <Printer className="w-4 h-4 mr-2" />
    {children}
  </SecondaryButton>
);

export const RefreshButton = ({ children = 'Refresh', ...props }: Omit<EnhancedButtonProps, 'children'> & { children?: string }) => (
  <SecondaryButton {...props}>
    <RefreshCw className="w-4 h-4 mr-2" />
    {children}
  </SecondaryButton>
);

export const SearchButton = ({ children = 'Search', ...props }: Omit<EnhancedButtonProps, 'children'> & { children?: string }) => (
  <PrimaryButton {...props}>
    <Search className="w-4 h-4 mr-2" />
    {children}
  </PrimaryButton>
);

// Icon-only buttons (for compact spaces)
export const IconButton = ({ 
    icon: Icon, 
    variant = 'secondary',
    size = 'md',
    tooltip,
    className,
    ...props 
  }: {
    icon: React.ComponentType<{ className?: string }>;
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info';
    tooltip?: string;
  } & Omit<EnhancedButtonProps, 'children'>) => {
    const sizeClasses = {
      sm: 'p-1.5',
      md: 'p-2',
      lg: 'p-3'
    };
  
    const variantClasses = {
      primary: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white',
      secondary: 'bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-gray-400 text-gray-700',
      danger: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white',
      success: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white',
      warning: 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white',
      info: 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white'
    };
  
    return (
      <Button
        {...props}
        title={tooltip}
        className={cn(
          'aspect-square font-semibold shadow-lg hover:shadow-xl',
          'transition-all duration-200 transform hover:scale-105',
          'border-0 focus:ring-4',
          sizeClasses[size],
          variantClasses[variant],
          props.disabled && 'opacity-50 cursor-not-allowed transform-none',
          className
        )}
      >
        <Icon className="w-4 h-4" />
      </Button>
    );
  };