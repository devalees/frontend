/**
 * Spinner Component
 * 
 * A loading indicator component that displays a spinning animation.
 * Supports different variants, sizes, and positioning options.
 */

import React from 'react';
import { cn } from '../../lib/utils';

export type SpinnerVariant = 'primary' | 'secondary' | 'tertiary';
export type SpinnerSize = 'small' | 'medium' | 'large';
export type SpinnerPosition = 'inline' | 'centered';
export type SpinnerMargin = 'left' | 'right' | 'top' | 'bottom';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The variant of the spinner
   * @default 'primary'
   */
  variant?: SpinnerVariant;
  
  /**
   * The size of the spinner
   * @default 'medium'
   */
  size?: SpinnerSize;
  
  /**
   * The position of the spinner
   * @default 'centered'
   */
  position?: SpinnerPosition;
  
  /**
   * The margin direction of the spinner
   */
  margin?: SpinnerMargin;
  
  /**
   * Custom color for the spinner
   */
  color?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  variant = 'primary',
  size = 'medium',
  position = 'centered',
  margin,
  color,
  className,
  'aria-label': ariaLabel = 'Loading',
  ...props
}) => {
  // Determine color class based on variant or custom color
  const getColorClass = () => {
    if (color) {
      return `text-${color}-600`;
    }
    
    switch (variant) {
      case 'primary':
        return 'text-primary-600';
      case 'secondary':
        return 'text-secondary-600';
      case 'tertiary':
        return 'text-gray-600';
      default:
        return 'text-primary-600';
    }
  };

  // Determine size class
  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'w-4 h-4';
      case 'medium':
        return 'w-6 h-6';
      case 'large':
        return 'w-10 h-10';
      default:
        return 'w-6 h-6';
    }
  };

  // Determine margin class
  const getMarginClass = () => {
    if (!margin) return '';
    
    switch (margin) {
      case 'left':
        return 'ml-2';
      case 'right':
        return 'mr-2';
      case 'top':
        return 'mt-2';
      case 'bottom':
        return 'mb-2';
      default:
        return '';
    }
  };

  // Determine position class
  const getPositionClass = () => {
    return position === 'centered' ? 'flex justify-center items-center' : '';
  };

  // SVG path for the spinner
  const spinnerPath = (
    <path
      fill="currentColor"
      d="M12 4.75V6.25C12 6.80228 12.4477 7.25 13 7.25C13.5523 7.25 14 6.80228 14 6.25V4.75C14 4.19772 13.5523 3.75 13 3.75C12.4477 3.75 12 4.19772 12 4.75Z"
    />
  );

  return (
    <div 
      className={cn(
        getPositionClass(),
        className
      )}
      {...props}
    >
      <svg
        data-testid="spinner"
        className={cn(
          getColorClass(),
          getSizeClass(),
          getMarginClass(),
          'animate-spin duration-1000 ease-linear infinite'
        )}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        aria-label={ariaLabel}
        role="status"
        aria-busy="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}; 