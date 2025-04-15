import React from 'react';
import clsx from 'clsx';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  'aria-label'?: string;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  onClick,
  'aria-label': ariaLabel,
  className,
}) => {
  // Variant styles
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700',
    secondary: 'bg-secondary-600 text-white hover:bg-secondary-700',
    tertiary: 'bg-transparent text-gray-700 hover:bg-gray-100',
  };

  // Size styles
  const sizeClasses = {
    small: 'px-2 py-1 text-sm',
    medium: 'px-4 py-2',
    large: 'px-6 py-3 text-lg',
  };

  // State styles
  const stateClasses = {
    disabled: 'opacity-50 cursor-not-allowed',
    loading: 'relative',
    base: 'rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
  };

  const buttonClasses = clsx(
    stateClasses.base,
    variantClasses[variant],
    sizeClasses[size],
    (disabled || loading) && stateClasses.disabled,
    loading && stateClasses.loading,
    className
  );

  // Handle keyboard events
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' && onClick && !disabled && !loading) {
      onClick();
    }
  };

  return (
    <button
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
      aria-busy={loading}
      type="button"
    >
      {loading && (
        <span
          data-testid="spinner"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <svg
            className="h-4 w-4 animate-spin text-current"
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
        </span>
      )}
      <span className={loading ? 'invisible' : 'visible'}>{children}</span>
    </button>
  );
};
