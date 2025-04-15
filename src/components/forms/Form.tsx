import React, { FormEvent, useState, ChangeEvent } from 'react';
import { cn } from '../../utils/cn';

interface FormProps {
  children: React.ReactNode;
  onSubmit: (data: FormData) => Promise<void> | void;
  className?: string;
  validationRules?: Record<string, (value: string) => string | undefined>;
  'aria-label'?: string;
}

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({ title, children }) => (
  <div role="group" aria-labelledby={`section-${title.toLowerCase()}`} className="space-y-4">
    <h3 id={`section-${title.toLowerCase()}`} className="text-lg font-medium">{title}</h3>
    <div>{children}</div>
  </div>
);

export const Form: React.FC<FormProps> = ({ 
  children, 
  onSubmit, 
  className = '', 
  validationRules = {},
  'aria-label': ariaLabel 
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [liveRegionMessage, setLiveRegionMessage] = useState('');

  const validateField = (name: string, value: string): string | undefined => {
    // First check custom validation rules
    if (validationRules[name]) {
      const customError = validationRules[name](value);
      if (customError) return customError;
    }

    // Then check required field
    if (!value.trim()) {
      return `${name} is required`;
    }
    
    // Finally check built-in validations
    switch (name) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'Please enter a valid email address';
        }
        break;
      case 'password':
        if (value.length < 8) {
          return 'Password must be at least 8 characters long';
        }
        break;
    }
    
    return undefined;
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    
    setErrors(prev => ({
      ...prev,
      [name]: error || ''
    }));

    if (error) {
      setLiveRegionMessage(error);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    
    setErrors(prevErrors => {
      if (!error) {
        const { [name]: removed, ...rest } = prevErrors;
        return rest;
      }
      return { ...prevErrors, [name]: error };
    });

    if (!error) {
      setLiveRegionMessage(`${name} field is now valid`);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    formData.forEach((value, name) => {
      if (typeof value === 'string') {
        const error = validateField(name, value);
        if (error) {
          newErrors[name] = error;
          hasErrors = true;
        }
      }
    });

    if (hasErrors) {
      setErrors(newErrors);
      const firstError = Object.values(newErrors)[0];
      setLiveRegionMessage(`Form validation failed: ${firstError}`);
      return;
    }

    try {
      setIsSubmitting(true);
      setErrors({});  // Clear all errors before submission
      await onSubmit(formData);
      setLiveRegionMessage('Form submitted successfully');
      form.reset(); // Reset form after successful submission
    } catch (error) {
      if (error instanceof Error) {
        setLiveRegionMessage(`Form submission failed: ${error.message}`);
        setErrors({ submit: error.message }); // Add submission error to errors state
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const enhanceChildren = (children: React.ReactNode): React.ReactNode => {
    return React.Children.map(children, child => {
      if (!React.isValidElement(child)) return child;

      if (child.type === FormSection) {
        return React.cloneElement(child, {
          ...child.props,
          children: enhanceChildren(child.props.children)
        });
      }

      if (child.type === 'input' || child.props.type === 'input') {
        const name = child.props.name;
        const error = errors[name];
        const id = `field-${name}`;
        const errorId = `error-${name}`;

        return (
          <div className="form-field">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700">
              {child.props.label || name.charAt(0).toUpperCase() + name.slice(1)}
            </label>
            {React.cloneElement(child, {
              id,
              'aria-invalid': error ? 'true' : 'false',
              'aria-describedby': error ? errorId : undefined,
              'aria-label': child.props.label || name.charAt(0).toUpperCase() + name.slice(1),
              onBlur: handleBlur,
              onChange: handleChange,
              ...child.props
            })}
            {error && (
              <div id={errorId} role="alert" className="mt-1 text-sm text-red-600">
                {error}
              </div>
            )}
          </div>
        );
      }

      if (child.props.children) {
        return React.cloneElement(child, {
          ...child.props,
          children: enhanceChildren(child.props.children)
        });
      }

      return child;
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('space-y-4', className)}
      noValidate
      role="form"
      aria-label={ariaLabel}
    >
      <div
        role="status"
        aria-live="polite"
        className="sr-only"
      >
        {liveRegionMessage}
      </div>
      <div className="space-y-4">
        {enhanceChildren(children)}
        {errors.submit && (
          <div role="alert" className="mt-1 text-sm text-red-600">
            {errors.submit}
          </div>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </form>
  );
};

export default Form;
