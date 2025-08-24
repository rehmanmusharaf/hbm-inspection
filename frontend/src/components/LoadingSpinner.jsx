import React from 'react';
import clsx from 'clsx';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className={clsx('flex items-center justify-center', className)}>
      <div
        className={clsx(
          'animate-spin rounded-full border-2 border-secondary-200 border-t-primary-600',
          sizeClasses[size]
        )}
      />
    </div>
  );
};

export default LoadingSpinner;