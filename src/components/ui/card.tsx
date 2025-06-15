import * as React from "react"

import { cn } from "@/lib/utils"

// Enhanced Card with variants
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'default' | 'modern' | 'elevated' | 'minimal' | 'bordered';
    hover?: boolean;
  }
>(({ className, variant = 'modern', hover = true, ...props }, ref) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'modern':
        return cn(
          'rounded-xl border border-gray-200/60 bg-white shadow-sm',
          'dark:border-gray-700/60 dark:bg-gray-900',
          hover && 'transition-all duration-200 hover:shadow-lg hover:shadow-gray-200/20 hover:-translate-y-0.5',
          'backdrop-blur-sm'
        );
      case 'elevated':
        return cn(
          'rounded-2xl border-0 bg-white shadow-lg shadow-gray-200/30',
          'dark:bg-gray-900 dark:shadow-gray-900/30',
          hover && 'transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/40 hover:-translate-y-1',
          'backdrop-blur-sm'
        );
      case 'minimal':
        return cn(
          'rounded-lg border border-gray-100 bg-white/80',
          'dark:border-gray-800 dark:bg-gray-900/80',
          hover && 'transition-all duration-200 hover:bg-white hover:border-gray-200',
          'backdrop-blur-sm'
        );
      case 'bordered':
        return cn(
          'rounded-lg border-2 border-gray-200 bg-white',
          'dark:border-gray-700 dark:bg-gray-900',
          hover && 'transition-all duration-200 hover:border-blue-300 hover:shadow-md',
          'shadow-sm'
        );
      default:
        return 'rounded-lg border bg-card text-card-foreground shadow-sm';
    }
  };

  return (
    <div
      ref={ref}
      className={cn(
        getVariantStyles(),
        'text-card-foreground',
        className
      )}
      {...props}
    />
  );
});
Card.displayName = "Card"

// Enhanced CardHeader with variants
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'default' | 'modern' | 'gradient' | 'minimal';
    divider?: boolean;
  }
>(({ className, variant = 'modern', divider = false, ...props }, ref) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'modern':
        return cn(
          'flex flex-col gap-2 p-6',
          divider && 'border-b border-gray-100 dark:border-gray-800 pb-4 mb-2'
        );
      case 'gradient':
        return cn(
          'flex flex-col gap-2 p-6 rounded-t-xl',
          'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50',
          divider && 'border-b border-blue-200/50 dark:border-blue-800/50 pb-4 mb-2'
        );
      case 'minimal':
        return cn(
          'flex flex-col gap-1 p-4',
          divider && 'border-b border-gray-100 dark:border-gray-800 pb-3 mb-3'
        );
      default:
        return cn(
          'flex flex-col space-y-1.5 p-6',
          divider && 'border-b border-gray-200 pb-4'
        );
    }
  };

  return (
    <div
      ref={ref}
      className={cn(getVariantStyles(), className)}
      {...props}
    />
  );
});
CardHeader.displayName = "CardHeader"

// Enhanced CardTitle with size variants and icons
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    icon?: React.ReactNode;
  }
>(({ className, size = 'lg', icon, children, ...props }, ref) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'text-base font-medium leading-relaxed';
      case 'md':
        return 'text-lg font-semibold leading-tight tracking-tight';
      case 'lg':
        return 'text-xl font-bold leading-tight tracking-tight';
      case 'xl':
        return 'text-2xl font-bold leading-tight tracking-tight';
      default:
        return 'text-xl font-bold leading-tight tracking-tight';
    }
  };

  return (
    <h3
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
          <div className="flex-shrink-0 text-blue-600 dark:text-blue-400">
            {icon}
          </div>
          <span>{children}</span>
        </div>
      )}
      {!icon && children}
    </h3>
  );
});
CardTitle.displayName = "CardTitle"

// Enhanced CardDescription with variants
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    variant?: 'default' | 'muted' | 'accent' | 'warning' | 'success';
    size?: 'sm' | 'md' | 'lg';
  }
>(({ className, variant = 'muted', size = 'md', ...props }, ref) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'muted':
        return 'text-gray-600 dark:text-gray-400';
      case 'accent':
        return 'text-blue-600 dark:text-blue-400';
      case 'warning':
        return 'text-orange-600 dark:text-orange-400';
      case 'success':
        return 'text-green-600 dark:text-green-400';
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
    <p
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
CardDescription.displayName = "CardDescription"

// Enhanced CardContent with variants
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'default' | 'padded' | 'compact' | 'spacious';
  }
>(({ className, variant = 'padded', ...props }, ref) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'padded':
        return 'p-6 pt-2';
      case 'compact':
        return 'p-4 pt-2';
      case 'spacious':
        return 'p-8 pt-4';
      default:
        return 'p-6 pt-0';
    }
  };

  return (
    <div 
      ref={ref} 
      className={cn(getVariantStyles(), className)} 
      {...props} 
    />
  );
});
CardContent.displayName = "CardContent"

// Enhanced CardFooter with variants
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'default' | 'actions' | 'info' | 'bordered';
    justify?: 'start' | 'center' | 'end' | 'between';
  }
>(({ className, variant = 'actions', justify = 'end', ...props }, ref) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'actions':
        return 'flex items-center gap-3 p-6 pt-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-b-xl';
      case 'info':
        return 'flex items-center gap-2 p-4 pt-3 text-sm text-gray-600 dark:text-gray-400';
      case 'bordered':
        return 'flex items-center gap-3 p-6 pt-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30';
      default:
        return 'flex items-center p-6 pt-0';
    }
  };

  const getJustifyStyles = () => {
    switch (justify) {
      case 'start':
        return 'justify-start';
      case 'center':
        return 'justify-center';
      case 'between':
        return 'justify-between';
      default:
        return 'justify-end';
    }
  };

  return (
    <div
      ref={ref}
      className={cn(
        getVariantStyles(),
        getJustifyStyles(),
        className
      )}
      {...props}
    />
  );
});
CardFooter.displayName = "CardFooter"

// Preset Card Components for common use cases
export const InfoCard = ({ children, title, description, icon, ...props }: {
  children?: React.ReactNode;
  title: string;
  description?: string;
  icon?: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) => (
  <Card variant="modern" hover {...props}>
    <CardHeader variant="gradient" divider>
      <CardTitle icon={icon}>{title}</CardTitle>
      {description && <CardDescription>{description}</CardDescription>}
    </CardHeader>
    <CardContent variant="padded">
      {children}
    </CardContent>
  </Card>
);

export const ActionCard = ({ children, title, description, actions, ...props }: {
  children?: React.ReactNode;
  title: string;
  description?: string;
  actions?: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) => (
  <Card variant="modern" hover {...props}>
    <CardHeader divider>
      <CardTitle>{title}</CardTitle>
      {description && <CardDescription>{description}</CardDescription>}
    </CardHeader>
    <CardContent variant="padded">
      {children}
    </CardContent>
    {actions && (
      <CardFooter variant="actions">
        {actions}
      </CardFooter>
    )}
  </Card>
);

export const StatsCard = ({ title, value, description, trend, icon, ...props }: {
  title: string;
  value: string | number;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) => (
  <Card variant="elevated" hover {...props}>
    <CardContent variant="padded">
      <div className="flex items-center justify-between">
        <div>
          <CardDescription size="sm">{title}</CardDescription>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
            {value}
          </div>
          {description && (
            <CardDescription size="sm" variant={trend === 'up' ? 'success' : trend === 'down' ? 'warning' : 'muted'}>
              {description}
            </CardDescription>
          )}
        </div>
        {icon && (
          <div className="text-blue-600 dark:text-blue-400">
            {icon}
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }