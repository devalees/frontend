import React from 'react';
import clsx from 'clsx';

export type InputType = 
  | 'text' 
  | 'number' 
  | 'email' 
  | 'password' 
  | 'search' 
  | 'tel' 
  | 'url' 
  | 'date' 
  | 'time' 
  | 'datetime-local';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  type?: InputType;
  error?: boolean;
  success?: boolean;
  errorMessage?: string;
  'aria-label'?: string;
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  type = 'text',
  error = false,
  success = false,
  errorMessage,
  'aria-label': ariaLabel,
  className,
  ...props
}) => {
  // Generate a unique ID for the error message
  const errorId = errorMessage ? `error-${Math.random().toString(36).substring(2, 9)}` : undefined;

  // Base styles
  const baseClasses = 'block w-full rounded-md border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors duration-200';

  // State styles
  const stateClasses = {
    error: 'border-red-500 focus:ring-red-500 focus:border-red-500',
    success: 'border-green-500 focus:ring-green-500 focus:border-green-500',
    default: 'border-gray-300 focus:ring-primary-500 focus:border-primary-500',
  };

  // Determine which state class to use
  const stateClass = error 
    ? stateClasses.error 
    : success 
      ? stateClasses.success 
      : stateClasses.default;

  // Combine all classes
  const inputClasses = clsx(baseClasses, stateClass, className);

  return (
    <div className="relative">
      <input
        type={type}
        className={inputClasses}
        aria-label={ariaLabel}
        aria-invalid={error}
        aria-describedby={errorId}
        {...props}
      />
      {error && errorMessage && (
        <p id={errorId} className="mt-1 text-sm text-red-600">
          {errorMessage}
        </p>
      )}
    </div>
  );
};
