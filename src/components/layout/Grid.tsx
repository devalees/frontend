import React from 'react';
import { cn } from '../../lib/utils';

// Types for responsive values
type ResponsiveValue<T> = T | {
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
};

// Grid component props
export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Number of columns in the grid
   * @default 12
   */
  cols?: number | ResponsiveValue<number>;
  
  /**
   * Gap between grid items
   * @default 4
   */
  gap?: number | ResponsiveValue<number>;
  
  /**
   * Vertical alignment of grid items
   * @default 'start'
   */
  align?: 'start' | 'center' | 'end' | 'stretch' | ResponsiveValue<'start' | 'center' | 'end' | 'stretch'>;
  
  /**
   * Horizontal alignment of grid items
   * @default 'start'
   */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly' | ResponsiveValue<'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'>;
}

// GridItem component props
export interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Number of columns this item should span
   * @default 1
   */
  span?: number | ResponsiveValue<number>;
  
  /**
   * Column start position
   */
  start?: number | ResponsiveValue<number>;
  
  /**
   * Column end position
   */
  end?: number | ResponsiveValue<number>;
}

/**
 * Grid component for creating responsive grid layouts
 */
export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ 
    className, 
    cols = 12, 
    gap = 4, 
    align = 'start', 
    justify = 'start',
    children,
    ...props 
  }, ref) => {
    // Helper function to generate responsive classes
    const getResponsiveClasses = <T extends string | number>(
      value: T | ResponsiveValue<T>,
      prefix: string,
      getValueClass: (val: T) => string
    ): string => {
      if (typeof value === 'object') {
        return Object.entries(value)
          .map(([breakpoint, val]) => {
            if (breakpoint === 'sm') {
              return getValueClass(val as T);
            }
            return `${breakpoint}:${getValueClass(val as T)}`;
          })
          .join(' ');
      }
      return getValueClass(value);
    };

    // Generate grid classes
    const gridClasses = cn(
      'grid',
      getResponsiveClasses(cols, 'grid-cols-', (val) => `grid-cols-${val}`),
      getResponsiveClasses(gap, 'gap-', (val) => `gap-${val}`),
      getResponsiveClasses(align, 'items-', (val) => `items-${val}`),
      getResponsiveClasses(justify, 'justify-', (val) => `justify-${val}`),
      className
    );

    return (
      <div 
        ref={ref} 
        className={gridClasses} 
        data-testid="grid"
        {...props}
      >
        {children}
      </div>
    );
  }
);

Grid.displayName = 'Grid';

/**
 * GridItem component for grid children
 */
export const GridItem = React.forwardRef<HTMLDivElement, GridItemProps>(
  ({ 
    className, 
    span, 
    start, 
    end,
    children,
    ...props 
  }, ref) => {
    // Helper function to generate responsive classes
    const getResponsiveClasses = <T extends string | number>(
      value: T | ResponsiveValue<T> | undefined,
      prefix: string,
      getValueClass: (val: T) => string
    ): string => {
      if (!value) return '';
      if (typeof value === 'object') {
        return Object.entries(value)
          .map(([breakpoint, val]) => {
            if (breakpoint === 'sm') {
              return getValueClass(val as T);
            }
            return `${breakpoint}:${getValueClass(val as T)}`;
          })
          .join(' ');
      }
      return getValueClass(value);
    };

    // Generate grid item classes
    const gridItemClasses = cn(
      getResponsiveClasses(span, 'col-span-', (val) => `col-span-${val}`),
      getResponsiveClasses(start, 'col-start-', (val) => `col-start-${val}`),
      getResponsiveClasses(end, 'col-end-', (val) => `col-end-${val}`),
      className
    );

    return (
      <div 
        ref={ref} 
        className={gridItemClasses} 
        data-testid="grid-item"
        {...props}
      >
        {children}
      </div>
    );
  }
);

GridItem.displayName = 'GridItem';
