'use client';

import React, { createContext, useContext, useState } from 'react';
import { cn } from '@/lib/utils';

// Context to share tab state
type TabsContextValue = {
  value: string;
  onValueChange: (value: string) => void;
};

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

function useTabs() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs component');
  }
  return context;
}

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  defaultValue?: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

export function Tabs({
  value,
  defaultValue,
  onValueChange,
  className,
  children,
  ...props
}: TabsProps) {
  // If no value is provided, use internal state
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  
  const currentValue = value || internalValue;
  const handleValueChange = onValueChange || setInternalValue;

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      <div className={cn('space-y-2', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function TabsList({ className, children, ...props }: TabsListProps) {
  return (
    <div
      className={cn(
        'flex border-b border-gray-200 overflow-x-auto',
        className
      )}
      role="tablist"
      {...props}
    >
      {children}
    </div>
  );
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  children: React.ReactNode;
}

export function TabsTrigger({ className, value, children, ...props }: TabsTriggerProps) {
  const { value: selectedValue, onValueChange } = useTabs();
  const isSelected = selectedValue === value;

  return (
    <button
      role="tab"
      aria-selected={isSelected}
      className={cn(
        'px-4 py-2 font-medium text-sm transition-all focus:outline-none',
        isSelected 
          ? 'border-b-2 border-primary-600 text-primary-600' 
          : 'text-gray-600 hover:text-gray-800',
        className
      )}
      onClick={() => onValueChange(value)}
      {...props}
    >
      {children}
    </button>
  );
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
}

export function TabsContent({ className, value, children, ...props }: TabsContentProps) {
  const { value: selectedValue } = useTabs();
  const isSelected = selectedValue === value;

  if (!isSelected) return null;

  return (
    <div
      role="tabpanel"
      className={cn('mt-2', className)}
      {...props}
    >
      {children}
    </div>
  );
} 