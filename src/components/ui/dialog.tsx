import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

// Enhanced Dialog Content with customizable close button
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    hideCloseButton?: boolean;
    closeButtonVariant?: 'default' | 'modern' | 'subtle' | 'ios' | 'animated';
  }
>(({ className, children, hideCloseButton = false, closeButtonVariant = 'modern', ...props }, ref) => {
  
  const getCloseButtonStyles = () => {
    switch (closeButtonVariant) {
      case 'modern':
  return cn(
    'absolute w-9 h-9 p-0 rounded-lg',
    'bg-gray-900/5 hover:bg-gray-900/10 dark:bg-gray-100/5 dark:hover:bg-gray-100/10',
    'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100',
    'transition-all duration-200',
    'border border-gray-200/50 hover:border-gray-300/50',
    'shadow-sm hover:shadow-md backdrop-blur-sm',
    'focus:ring-2 focus:ring-gray-300 focus:outline-none',
    'ring-offset-background',
    'flex items-center justify-center',
    'rtl:right-auto rtl:left-4 ltr:right-4 ltr:left-auto top-4'
  );
      
      case 'subtle':
        return cn(
          'absolute right-4 top-4 w-8 h-8 p-0 rounded-full',
          'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800',
          'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300',
          'transition-all duration-200 transform hover:scale-110',
          'focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2',
          'ring-offset-background',
          'flex items-center justify-center' 
        );
      
      case 'ios':
        return cn(
          'absolute right-4 top-4 w-7 h-7 p-0 rounded-full',
          'bg-gray-100/80 hover:bg-gray-200/80 backdrop-blur-sm',
          'text-gray-600 hover:text-gray-800',
          'transition-all duration-200 transform hover:scale-105 active:scale-95',
          'border border-gray-200/50',
          'shadow-sm hover:shadow-md',
          'focus:outline-none focus:ring-2 focus:ring-gray-300',
          'ring-offset-background',
          'flex items-center justify-center' 
        );
      
      case 'animated':
        return cn(
          'absolute right-4 top-4 w-8 h-8 p-0 rounded-full group',
          'bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-200',
          'text-gray-500 hover:text-red-500',
          'transition-all duration-300 transform hover:scale-110 hover:rotate-90',
          'focus:ring-4 focus:ring-red-200 focus:outline-none',
          'shadow-sm hover:shadow-md',
          'ring-offset-background',
          'flex items-center justify-center' 
        );
      
      default:
        return cn(
          'absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background',
          'transition-opacity hover:opacity-100',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          'disabled:pointer-events-none',
          'data-[state=open]:bg-accent data-[state=open]:text-muted-foreground',
          'flex items-center justify-center' 
        );
    }
  };

  const getIconStyles = () => {
    switch (closeButtonVariant) {
      case 'animated':
        return 'h-4 w-4 transition-transform duration-300 group-hover:rotate-90';
      case 'ios':
        return 'h-4 w-4 stroke-2';
      case 'modern':
      case 'subtle':
        return 'h-4 w-4';
      default:
        return 'h-4 w-4';
    }
  };

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
          className
        )}
        {...props}
      >
        {children}
        {!hideCloseButton && (
          <DialogPrimitive.Close className={getCloseButtonStyles()}>
            <X className={getIconStyles()} />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
})
DialogContent.displayName = DialogPrimitive.Content.displayName

// Enhanced Dialog Header with different variants
const DialogHeader = ({
  className,
  variant = 'modern',
  showDivider = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'centered' | 'with-icon' | 'compact' | 'modern';
  showDivider?: boolean;
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'centered':
        return 'flex flex-col space-y-2 text-center items-center';
      case 'with-icon':
        return 'flex flex-col space-y-2 text-left';
      case 'compact':
        return 'flex flex-col space-y-1 text-left';
      case 'modern':
        return 'flex flex-col space-y-3 text-left pb-6 border-b-2 border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 -mx-6 -mt-6 px-6 pt-6 mb-6';
      default:
        return 'flex flex-col space-y-1.5 text-center sm:text-left';
    }
  };

  return (
    <div
      className={cn(
        getVariantStyles(),
        showDivider && 'pb-4 border-b border-gray-200',
        className
      )}
      {...props}
    />
  );
};
DialogHeader.displayName = "DialogHeader"

// Enhanced Dialog Footer with better spacing and variants
const DialogFooter = ({
  className,
  variant = 'default',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'centered' | 'full-width' | 'spaced';
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'centered':
        return 'flex flex-row justify-center space-x-3';
      case 'full-width':
        return 'grid grid-cols-2 gap-3';
      case 'spaced':
        return 'flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-3';
      default:
        return 'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2';
    }
  };

  return (
    <div
      className={cn(
        getVariantStyles(),
        'pt-4',
        className
      )}
      {...props}
    />
  );
};
DialogFooter.displayName = "DialogFooter"

// Enhanced Dialog Title with size variants
const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> & {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    icon?: React.ReactNode;
  }
>(({ className, size = 'lg', icon, children, ...props }, ref) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'text-base font-medium leading-relaxed';
      case 'lg':
        return 'text-xl font-bold leading-tight tracking-tight';
      case 'xl':
        return 'text-2xl font-bold leading-tight tracking-tight';
      default:
        return 'text-lg font-semibold leading-none tracking-tight';
    }
  };

  return (
    <DialogPrimitive.Title
      ref={ref}
      className={cn(
        getSizeStyles(),
        'text-gray-900 dark:text-gray-100',
        className
      )}
      {...props}
    >
      {icon && (
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 text-blue-900 dark:text-blue-100">
            {icon}
          </div>
          <span>{children}</span>
        </div>
      )}
      {!icon && children}
    </DialogPrimitive.Title>
  );
});
DialogTitle.displayName = DialogPrimitive.Title.displayName

// Enhanced Dialog Description with variants
const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description> & {
    variant?: 'default' | 'muted' | 'warning' | 'success' | 'error';
    size?: 'sm' | 'md' | 'lg';
  }
>(({ className, variant = 'muted', size = 'md', ...props }, ref) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'muted':
        return 'text-blue-600/70 dark:text-blue-400/70';
      case 'warning':
        return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-3 py-2 rounded-lg border border-orange-200 dark:border-orange-800';
      case 'success':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg border border-green-200 dark:border-green-800';
      case 'error':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800';
      default:
        return 'text-muted-foreground';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'text-xs';
      case 'lg':
        return 'text-base';
      default:
        return 'text-sm';
    }
  };

  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn(
        getSizeStyles(),
        getVariantStyles(),
        'leading-relaxed',
        className
      )}
      {...props}
    />
  );
});
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}