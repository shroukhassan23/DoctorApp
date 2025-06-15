import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars' | 'skeleton';
  className?: string;
  text?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'gray';
}

// Modern Spinner Loader
const SpinnerLoader = ({ size = 'md', color = 'blue' }: { size: string; color: string }) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    blue: 'border-blue-200 border-t-blue-600',
    green: 'border-green-200 border-t-green-600',
    purple: 'border-purple-200 border-t-purple-600',
    orange: 'border-orange-200 border-t-orange-600',
    gray: 'border-gray-200 border-t-gray-600'
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-3',
        sizeClasses[size as keyof typeof sizeClasses],
        colorClasses[color as keyof typeof colorClasses]
      )}
    />
  );
};

// Bouncing Dots Loader
const DotsLoader = ({ size = 'md', color = 'blue' }: { size: string; color: string }) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
    xl: 'w-5 h-5'
  };

  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600',
    orange: 'bg-orange-600',
    gray: 'bg-gray-600'
  };

  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'rounded-full animate-bounce',
            sizeClasses[size as keyof typeof sizeClasses],
            colorClasses[color as keyof typeof colorClasses]
          )}
          style={{
            animationDelay: `${i * 0.15}s`,
            animationDuration: '0.6s'
          }}
        />
      ))}
    </div>
  );
};

// Pulse Loader
const PulseLoader = ({ size = 'md', color = 'blue' }: { size: string; color: string }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const colorClasses = {
    blue: 'bg-blue-400',
    green: 'bg-green-400',
    purple: 'bg-purple-400',
    orange: 'bg-orange-400',
    gray: 'bg-gray-400'
  };

  return (
    <div className="relative">
      <div
        className={cn(
          'rounded-full animate-ping absolute inline-flex opacity-75',
          sizeClasses[size as keyof typeof sizeClasses],
          colorClasses[color as keyof typeof colorClasses]
        )}
      />
      <div
        className={cn(
          'rounded-full relative inline-flex opacity-100',
          sizeClasses[size as keyof typeof sizeClasses],
          colorClasses[color as keyof typeof colorClasses]
        )}
      />
    </div>
  );
};

// Bars Loader
const BarsLoader = ({ size = 'md', color = 'blue' }: { size: string; color: string }) => {
  const heightClasses = {
    sm: 'h-4',
    md: 'h-6',
    lg: 'h-8',
    xl: 'h-10'
  };

  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600',
    orange: 'bg-orange-600',
    gray: 'bg-gray-600'
  };

  return (
    <div className="flex items-end space-x-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={cn(
            'w-1 animate-pulse rounded-t',
            heightClasses[size as keyof typeof heightClasses],
            colorClasses[color as keyof typeof colorClasses]
          )}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  );
};

// Skeleton Loader
const SkeletonLoader = ({ size = 'md' }: { size: string }) => {
  const heightClasses = {
    sm: 'h-16',
    md: 'h-24',
    lg: 'h-32',
    xl: 'h-40'
  };

  return (
    <div className="animate-pulse">
      <div className="space-y-3">
        <div className="bg-gray-200 rounded-lg h-4 w-3/4"></div>
        <div className="bg-gray-200 rounded-lg h-4 w-1/2"></div>
        <div className={cn('bg-gray-200 rounded-lg w-full', heightClasses[size as keyof typeof heightClasses])}></div>
        <div className="bg-gray-200 rounded-lg h-4 w-2/3"></div>
      </div>
    </div>
  );
};

export const LoadingSpinner = ({ 
  size = 'md', 
  variant = 'spinner', 
  className, 
  text, 
  color = 'blue' 
}: LoadingSpinnerProps) => {
  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return <DotsLoader size={size} color={color} />;
      case 'pulse':
        return <PulseLoader size={size} color={color} />;
      case 'bars':
        return <BarsLoader size={size} color={color} />;
      case 'skeleton':
        return <SkeletonLoader size={size} />;
      default:
        return <SpinnerLoader size={size} color={color} />;
    }
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="flex flex-col items-center gap-3">
        {renderLoader()}
        {text && (
          <p className="text-sm font-medium text-gray-600 animate-pulse">{text}</p>
        )}
      </div>
    </div>
  );
};

// Enhanced Page Loading with background overlay
export const PageLoading = ({ 
  text = 'Loading...', 
  variant = 'spinner', 
  color = 'blue' 
}: { 
  text?: string; 
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars';
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'gray';
}) => (
  <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
    <div className="bg-white rounded-xl shadow-2xl p-8 border border-gray-100">
      <LoadingSpinner size="xl" variant={variant} text={text} color={color} />
    </div>
  </div>
);

// Enhanced Section Loading with gradient background
export const SectionLoading = ({ 
  text, 
  variant = 'spinner', 
  color = 'blue',
  className 
}: { 
  text?: string; 
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars' | 'skeleton';
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'gray';
  className?: string;
}) => (
  <div className={cn(
    "flex items-center justify-center py-12 px-6 rounded-xl",
    "bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200",
    "shadow-sm",
    className
  )}>
    <div className="text-center">
      <LoadingSpinner size="lg" variant={variant} color={color} />
      {text && (
        <p className="mt-4 text-gray-600 font-medium">{text}</p>
      )}
    </div>
  </div>
);

// Enhanced Button Loading
export const ButtonLoading = ({ 
  text = 'Loading...', 
  variant = 'dots', 
  color = 'blue' 
}: { 
  text?: string; 
  variant?: 'spinner' | 'dots' | 'pulse';
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'gray';
}) => (
  <div className="flex items-center gap-3">
    <LoadingSpinner size="sm" variant={variant} color={color} />
    <span className="font-medium">{text}</span>
  </div>
);

// Card Loading with shimmer effect
export const CardLoading = ({ 
  lines = 3, 
  showAvatar = false 
}: { 
  lines?: number; 
  showAvatar?: boolean;
}) => (
  <div className="animate-pulse p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
    <div className="flex items-center space-x-4 mb-4">
      {showAvatar && (
        <div className="rounded-full bg-gray-200 h-12 w-12"></div>
      )}
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-shimmer"></div>
        <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-3/4 animate-shimmer"></div>
      </div>
    </div>
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-shimmer"
          style={{ width: `${Math.random() * 40 + 60}%` }}
        />
      ))}
    </div>
  </div>
);

// Table Loading
export const TableLoading = ({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) => (
  <div className="animate-pulse">
    <div className="bg-gray-100 rounded-lg p-6">
      {/* Header */}
      <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-300 rounded"></div>
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4 mb-3" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="h-3 bg-gray-200 rounded"></div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

// Add shimmer animation to globals.css or add as inline style
const shimmerStyles = `
@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.animate-shimmer {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: shimmer 1.5s infinite linear;
}
`;