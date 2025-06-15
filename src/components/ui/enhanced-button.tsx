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
  onClick?: (event?: React.MouseEvent<HTMLButtonElement>) => void;
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
        'bg-blue-600 hover:bg-blue-700',
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
        'bg-green-600 hover:bg-green-700',
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
        'bg-red-600 hover:bg-red-700',
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
        'bg-orange-600 hover:bg-orange-700',
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
        'bg-indigo-600 hover:bg-indigo-700',
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
export const AddButton = React.forwardRef<
  HTMLDivElement,
  Omit<EnhancedButtonProps, 'children'> & { children?: string; className?: string }
>(({ children = 'Add', className, size, loading, ...props }, ref) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <div ref={ref}>
      <Button
        {...props}
        disabled={props.disabled || loading}
        className={cn(
          'bg-[#2463eb] hover:bg-[#1d4ed8]',
          'text-white font-semibold shadow-lg hover:shadow-xl',
          'transition-all duration-200 transform hover:scale-105',
          'border-0 focus:ring-4 focus:ring-blue-300',
          sizeClasses[size || 'sm'],
          (props.disabled || loading) && 'opacity-50 cursor-not-allowed transform-none',
          className
        )}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <Plus className="w-4 h-4 mr-1" />
            {children}
          </div>
        ) : (
          <>
            <Plus className="w-4 h-4 mr-1" />
            {children}
          </>
        )}
      </Button>
    </div>
  );
});

AddButton.displayName = 'AddButton';

export const SaveButton = ({ children = 'Save', ...props }: Omit<EnhancedButtonProps, 'children'> & { children?: string }) => (
  <SuccessButton {...props}>
    <Save className="w-4 h-4 mr-1" />
    {children}
  </SuccessButton>
);

export const EditButton = React.forwardRef<
  HTMLDivElement,
  Omit<EnhancedButtonProps, 'children'> & { children?: string; className?: string }
>(({ children = 'Edit', className, size, loading, ...props }, ref) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <div ref={ref}>
      <Button
        {...props}
        disabled={props.disabled || loading}
        className={cn(
          'bg-[#475569] hover:bg-[#334155]', // blue-gray color
          'text-white font-semibold shadow-lg hover:shadow-xl',
          'transition-all duration-200 transform hover:scale-105',
          sizeClasses[size || 'sm'],
          (props.disabled || loading) && 'opacity-50 cursor-not-allowed transform-none',
          className
        )}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <Edit className="w-4 h-4 mr-1" />
            {children}
          </div>
        ) : (
          <>
            <Edit className="w-4 h-4 mr-1" />
            {children}
          </>
        )}
      </Button>
    </div>
  );
});

EditButton.displayName = 'EditButton';

export const ViewButton = React.forwardRef<
  HTMLDivElement,
  Omit<EnhancedButtonProps, 'children'> & { children?: string; className?: string }
>(({ children = 'View Details', className, size, loading, ...props }, ref) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <div ref={ref}>
      <Button
        {...props}
        disabled={props.disabled || loading}
        className={cn(
          'bg-[#1C4ED8] hover:bg-[#1e40af]',
          'text-white font-semibold shadow-lg hover:shadow-xl',
          'transition-all duration-200 transform hover:scale-105',
          'border-0 focus:ring-4 focus:ring-blue-300',
          sizeClasses[size || 'sm'],
          (props.disabled || loading) && 'opacity-50 cursor-not-allowed transform-none',
          className
        )}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <Eye className="w-4 h-4 mr-1" />
            {children}
          </div>
        ) : (
          <>
            <Eye className="w-4 h-4 mr-1" />
            {children}
          </>
        )}
      </Button>
    </div>
  );
});

ViewButton.displayName = 'ViewButton';


export const DeleteButton = React.forwardRef<
  HTMLDivElement,
  Omit<EnhancedButtonProps, 'children'> & { children?: string; className?: string }
>(({ children = 'Delete', className, size, loading, ...props }, ref) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <div ref={ref}>
      <Button
        {...props}
        disabled={props.disabled || loading}
        className={cn(
          'bg-red-600 hover:bg-red-700',
          'text-white font-semibold shadow-lg hover:shadow-xl',
          'transition-all duration-200 transform hover:scale-105',
          'border-0 focus:ring-4 focus:ring-red-300',
          sizeClasses[size || 'sm'],
          (props.disabled || loading) && 'opacity-50 cursor-not-allowed transform-none',
          className
        )}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <Trash2 className="w-4 h-4 mr-1" />
            {children}
          </div>
        ) : (
          <>
            <Trash2 className="w-4 h-4 mr-1" />
            {children}
          </>
        )}
      </Button>
    </div>
  );
});


export const CancelButton = ({ children = 'Cancel', ...props }: Omit<EnhancedButtonProps, 'children'> & { children?: string }) => (
  <SecondaryButton {...props}>
    <X className="w-4 h-4 mr-1" />
    {children}
  </SecondaryButton>
);

export const ConfirmButton = ({ children = 'Confirm', ...props }: Omit<EnhancedButtonProps, 'children'> & { children?: string }) => (
  <SuccessButton {...props}>
    <Check className="w-4 h-4 mr-1" />
    {children}
  </SuccessButton>
);

export const DownloadButton = ({ children = 'Download', ...props }: Omit<EnhancedButtonProps, 'children'> & { children?: string }) => (
  <SecondaryButton {...props}>
    <Download className="w-4 h-4 mr-1" />
    {children}
  </SecondaryButton>
);

export const UploadButton = ({ children = 'Upload', ...props }: Omit<EnhancedButtonProps, 'children'> & { children?: string }) => (
  <PrimaryButton {...props}>
    <Upload className="w-4 h-4 mr-1" />
    {children}
  </PrimaryButton>
);

export const PrintButton = ({ children = 'Print', className, size, ...props }: Omit<EnhancedButtonProps, 'children'> & { children?: string; className?: string }) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <Button
      {...props}
      className={cn(
        'bg-[#2463eb] hover:bg-[#1d4ed8]',
        'text-white font-semibold shadow-lg hover:shadow-xl',
        'transition-all duration-200 transform hover:scale-105',
        'border-0 focus:ring-4 focus:ring-blue-300',
        sizeClasses[size || 'sm'],
        props.disabled && 'opacity-50 cursor-not-allowed transform-none',
        className
      )}
    >
      {props.loading ? (
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <Printer className="w-4 h-4 mr-1" />
          {children}
        </div>
      ) : (
        <>
          <Printer className="w-4 h-4 mr-1" />
          {children}
        </>
      )}
    </Button>
  );
};

export const RefreshButton = ({ children = 'Refresh', ...props }: Omit<EnhancedButtonProps, 'children'> & { children?: string }) => (
  <SecondaryButton {...props}>
    <RefreshCw className="w-4 h-4 mr-1" />
    {children}
  </SecondaryButton>
);

export const SearchButton = ({ children = 'Search', ...props }: Omit<EnhancedButtonProps, 'children'> & { children?: string }) => (
  <PrimaryButton {...props}>
    <Search className="w-4 h-4 mr-1" />
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
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-gray-400 text-gray-700',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    warning: 'bg-orange-600 hover:bg-orange-700 text-white',
    info: 'bg-indigo-600 hover:bg-indigo-700 text-white'
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