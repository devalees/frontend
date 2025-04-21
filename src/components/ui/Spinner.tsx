/**
 * Spinner Component
 * 
 * A loading indicator component that displays a spinning animation.
 * Supports different variants, sizes, and positioning options.
 */

import React from 'react';
import { cn } from '@/lib/utils';

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

const variantClasses = {
  primary: 'text-primary-600',
  secondary: 'text-secondary-600',
  tertiary: 'text-gray-600',
};

const sizeClasses = {
  small: 'h-4 w-4',
  medium: 'h-6 w-6',
  large: 'h-10 w-10',
};

const marginClasses = {
  left: 'ml-2',
  right: 'mr-2',
  top: 'mt-2',
  bottom: 'mb-2',
};

export function Spinner({
  className,
  variant = 'primary',
  size = 'medium',
  position = 'centered',
  margin,
  color,
  ...props
}: SpinnerProps) {
  const wrapperClasses = cn(
    position === 'centered' && 'flex justify-center items-center'
  );

  const spinnerClasses = cn(
    'animate-spin duration-1000 ease-linear infinite',
    color ? `text-${color}-600` : variantClasses[variant],
    sizeClasses[size],
    margin && marginClasses[margin],
    className
  );

  return (
    <div className={wrapperClasses}>
      <div
        data-testid="spinner"
        role="status"
        aria-busy="true"
        className={spinnerClasses}
        {...props}
      >
        <svg
          className="text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
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
    </div>
  );
} 