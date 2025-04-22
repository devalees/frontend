import React from 'react';
import classNames from 'classnames';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'value'> {
  options: SelectOption[];
  value?: string;
  error?: boolean;
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  className,
  options,
  value,
  error,
  placeholder,
  ...props
}) => {
  return (
    <select
      className={classNames(
        'block w-full rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors duration-200',
        {
          'border-red-300 focus:ring-red-500 focus:border-red-500': error,
          'border-gray-300 focus:ring-primary-500 focus:border-primary-500': !error
        },
        className
      )}
      value={value}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Select; 