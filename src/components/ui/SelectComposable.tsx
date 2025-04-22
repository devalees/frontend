/**
 * SelectComposable Component
 * 
 * A composable select component that allows for more flexible and custom select elements.
 * This is an alternative to the basic Select component, following a pattern similar to
 * Radix UI or shadcn/ui's composable components.
 */

import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

interface SelectContextProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const SelectContext = createContext<SelectContextProps | undefined>(undefined);

const useSelectContext = () => {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error('Select components must be used within a Select component');
  }
  return context;
};

interface SelectProps {
  children: React.ReactNode;
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  children,
  value,
  onValueChange,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectContext.Provider
      value={{
        open,
        setOpen,
        value,
        onChange: onValueChange,
        disabled,
      }}
    >
      <div className="relative w-full">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const SelectTrigger: React.FC<SelectTriggerProps> = ({
  children,
  className,
  id,
}) => {
  const { open, setOpen, disabled } = useSelectContext();

  return (
    <button
      type="button"
      id={id}
      onClick={() => !disabled && setOpen(!open)}
      className={cn(
        'flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
        {
          'cursor-not-allowed opacity-50': disabled,
        },
        className
      )}
      disabled={disabled}
      aria-expanded={open}
      data-testid="select-trigger"
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
};

interface SelectValueProps {
  placeholder?: string;
}

export const SelectValue: React.FC<SelectValueProps> = ({
  placeholder = "Select an option"
}) => {
  const { value } = useSelectContext();

  return (
    <span className={cn('flex-1 truncate', { 'text-gray-400': !value })}>
      {value || placeholder}
    </span>
  );
};

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

export const SelectContent: React.FC<SelectContentProps> = ({
  children,
  className,
}) => {
  const { open, setOpen } = useSelectContext();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className={cn(
        'absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-300 bg-white py-1 shadow-lg',
        className
      )}
      data-testid="select-content"
    >
      {children}
    </div>
  );
};

interface SelectItemProps {
  children: React.ReactNode;
  value: string;
  disabled?: boolean;
  className?: string;
}

export const SelectItem: React.FC<SelectItemProps> = ({
  children,
  value,
  disabled = false,
  className,
}) => {
  const { value: selectedValue, onChange, setOpen } = useSelectContext();
  const isSelected = selectedValue === value;

  const handleSelect = () => {
    if (!disabled) {
      onChange(value);
      setOpen(false);
    }
  };

  return (
    <div
      onClick={handleSelect}
      className={cn(
        'relative flex cursor-pointer select-none items-center px-3 py-2',
        {
          'bg-primary-50 text-primary-500': isSelected,
          'text-gray-900 hover:bg-gray-100': !isSelected && !disabled,
          'cursor-not-allowed opacity-50': disabled,
        },
        className
      )}
      role="option"
      aria-selected={isSelected}
      data-testid={`select-item-${value}`}
    >
      {children}
    </div>
  );
}; 