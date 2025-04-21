import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Spinner } from './Spinner';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary-500',
  {
    variants: {
      variant: {
        default: 'bg-primary-600 text-white hover:bg-primary-700',
        secondary: 'bg-secondary-600 text-white hover:bg-secondary-700',
        tertiary: 'bg-transparent text-gray-700 hover:bg-gray-100',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'underline-offset-4 hover:underline text-primary',
      },
      size: {
        default: 'h-10 px-4 py-2',
        small: 'h-9 px-2 py-1 text-sm',
        large: 'h-11 px-6 py-3 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    
    // Add disabled classes when disabled
    const buttonClasses = cn(
      buttonVariants({ variant, size, className }),
      (props.disabled || loading) && 'opacity-50 cursor-not-allowed'
    );
    
    // Handle keyboard events for accessibility
    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (props.onClick && !props.disabled && !loading) {
          props.onClick(e as unknown as React.MouseEvent<HTMLButtonElement>);
        }
      }
      props.onKeyDown?.(e);
    };
    
    return (
      <Comp
        className={buttonClasses}
        ref={ref}
        disabled={loading || props.disabled}
        aria-busy={loading}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {loading ? <Spinner data-testid="spinner" className="mr-2 h-4 w-4" /> : null}
        {children}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
