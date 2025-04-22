import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ className = '', error, ...props }) => {
  return (
    <input
      type="checkbox"
      className={`h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 ${
        error ? 'border-red-500' : ''
      } ${className}`}
      {...props}
    />
  );
}; 