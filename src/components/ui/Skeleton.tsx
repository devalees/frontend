/**
 * Skeleton Component
 * 
 * A loading placeholder component that displays a pulsing animation.
 * Supports different variants, sizes, and responsiveness options.
 */

import React from 'react';
import { cn } from '../../lib/utils';

export type SkeletonVariant = 'default' | 'primary' | 'secondary';
export type SkeletonRounded = 'rounded' | 'rounded-sm' | 'rounded-lg' | 'rounded-full';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The variant of the skeleton
   * @default 'default'
   */
  variant?: SkeletonVariant;
  
  /**
   * Custom color for the skeleton
   */
  color?: string;
  
  /**
   * Custom width for the skeleton
   */
  width?: string;
  
  /**
   * Custom height for the skeleton
   */
  height?: string;
  
  /**
   * Custom border radius for the skeleton
   */
  rounded?: SkeletonRounded;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'default',
  color,
  width,
  height,
  rounded = 'rounded',
  className,
  'aria-label': ariaLabel = 'Loading content',
  ...props
}) => {
  // Determine color class based on variant or custom color
  const getColorClass = () => {
    if (color) {
      return `bg-${color}-100`;
    }
    
    switch (variant) {
      case 'primary':
        return 'bg-primary-100';
      case 'secondary':
        return 'bg-secondary-100';
      default:
        return 'bg-gray-200';
    }
  };

  // Determine width class
  const getWidthClass = () => {
    return width || 'w-full';
  };

  // Determine height class
  const getHeightClass = () => {
    return height || 'h-4';
  };

  return (
    <div 
      data-testid="skeleton"
      className={cn(
        getColorClass(),
        getWidthClass(),
        getHeightClass(),
        rounded,
        'animate-pulse duration-1000 ease-in-out infinite',
        className
      )}
      role="status"
      aria-busy="true"
      aria-label={ariaLabel}
      {...props}
    />
  );
}; 