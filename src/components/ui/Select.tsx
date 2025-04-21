import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Check } from 'lucide-react';

/* Select Component */
interface SelectProps {
  children: React.ReactNode;
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  children,
  value,
  onValueChange,
  disabled = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={selectRef} className={cn("relative", className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && (child.type === SelectTrigger || child.type === SelectContent)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            isOpen,
            setIsOpen,
            value,
            onValueChange,
            disabled,
          });
        }
        return null;
      })}
    </div>
  );
};

/* SelectTrigger Component */
interface SelectTriggerProps {
  children: React.ReactNode;
  id?: string;
  isOpen?: boolean;
  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  disabled?: boolean;
  className?: string;
}

export const SelectTrigger: React.FC<SelectTriggerProps> = ({
  children,
  id,
  isOpen = false,
  setIsOpen,
  disabled = false,
  className,
}) => {
  return (
    <button
      type="button"
      id={id}
      onClick={() => setIsOpen && setIsOpen(!isOpen)}
      disabled={disabled}
      className={cn(
        "flex items-center justify-between w-full px-4 py-2 text-sm font-medium border border-gray-300 rounded-md bg-white",
        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      aria-haspopup="listbox"
      aria-expanded={isOpen}
    >
      {children}
      <ChevronDown className="w-4 h-4 ml-2" />
    </button>
  );
};

/* SelectValue Component */
interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

export const SelectValue: React.FC<SelectValueProps> = ({
  placeholder,
  className,
}) => {
  return (
    <span className={cn("block truncate", className)}>
      {placeholder || "Select an option"}
    </span>
  );
};

/* SelectContent Component */
interface SelectContentProps {
  children: React.ReactNode;
  isOpen?: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

export const SelectContent: React.FC<SelectContentProps> = ({
  children,
  isOpen = false,
  value,
  onValueChange,
  className,
}) => {
  if (!isOpen) return null;
  
  return (
    <div 
      className={cn(
        "absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg",
        className
      )}
    >
      <ul 
        className="py-1 max-h-60 overflow-auto"
        role="listbox"
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === SelectItem) {
            return React.cloneElement(child as React.ReactElement<any>, {
              isSelected: child.props.value === value,
              onSelect: () => {
                if (onValueChange) {
                  onValueChange(child.props.value);
                }
              },
            });
          }
          return null;
        })}
      </ul>
    </div>
  );
};

/* SelectItem Component */
interface SelectItemProps {
  children: React.ReactNode;
  value: string;
  isSelected?: boolean;
  onSelect?: () => void;
  disabled?: boolean;
  className?: string;
}

export const SelectItem: React.FC<SelectItemProps> = ({
  children,
  value,
  isSelected = false,
  onSelect,
  disabled = false,
  className,
}) => {
  return (
    <li
      role="option"
      aria-selected={isSelected}
      onClick={disabled ? undefined : onSelect}
      className={cn(
        "px-4 py-2 text-sm cursor-pointer flex items-center justify-between",
        isSelected ? "bg-primary-50 text-primary-600" : "text-gray-700",
        disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100",
        className
      )}
    >
      <span>{children}</span>
      {isSelected && <Check className="w-4 h-4 text-primary-600" />}
    </li>
  );
}; 