import React from 'react';
import classNames from 'classnames';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const TextArea: React.FC<TextAreaProps> = ({
  className,
  error,
  ...props
}) => {
  return (
    <textarea
      className={classNames(
        'block w-full rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors duration-200',
        {
          'border-red-300 focus:ring-red-500 focus:border-red-500': error,
          'border-gray-300 focus:ring-primary-500 focus:border-primary-500': !error
        },
        className
      )}
      {...props}
    />
  );
};

export default TextArea; 