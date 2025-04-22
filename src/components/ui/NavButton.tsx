'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, ButtonProps } from '@/components/ui/Button';
import { usePrefetchSettings } from '@/lib/prefetching/prefetchProvider';

export interface NavButtonProps extends Omit<ButtonProps, 'href'> {
  /**
   * The URL to navigate to
   */
  href: string;
  /**
   * Whether to enable prefetching on hover
   * @default true
   */
  prefetch?: boolean;
  /**
   * Delay before prefetching starts on hover
   * @default from global settings
   */
  prefetchTimeout?: number;
}

/**
 * Navigation Button with prefetching capabilities
 * 
 * This component extends the base Button component with navigation functionality
 * and prefetches the destination page on hover for faster navigation, matching
 * the behavior of PrefetchLink.
 * 
 * @example
 * ```tsx
 * <NavButton href="/dashboard">Go to Dashboard</NavButton>
 * <NavButton href="/settings" variant="outline" prefetchTimeout={200}>Settings</NavButton>
 * ```
 */
export const NavButton = React.forwardRef<HTMLButtonElement, NavButtonProps>(
  ({ 
    href, 
    prefetch = true, 
    prefetchTimeout, 
    onClick, 
    className = '',
    children,
    ...props 
  }, ref) => {
    // Get global prefetch settings
    const { settings } = usePrefetchSettings();
    
    // Use provided timeout or fall back to global setting
    const hoverDelay = prefetchTimeout ?? settings.linkHoverDelay;
    
    // Only enable prefetching if both component prop and global setting are true
    const prefetchEnabled = prefetch && settings.enabled;
    
    const [isPrefetching, setIsPrefetching] = useState(false);
    const router = useRouter();
    let prefetchTimer: NodeJS.Timeout | null = null;

    const handleMouseEnter = () => {
      if (!prefetchEnabled || props.disabled) return;
      
      // Set a small delay to avoid prefetching when user just moves cursor over button
      prefetchTimer = setTimeout(() => {
        setIsPrefetching(true);
        // Next.js router prefetch (matching PrefetchLink implementation)
        router.prefetch(href);
      }, hoverDelay);
    };

    const handleMouseLeave = () => {
      if (prefetchTimer) {
        clearTimeout(prefetchTimer);
        prefetchTimer = null;
      }
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Call the original onClick handler if provided
      if (onClick) {
        onClick(e);
      }
      
      // Navigate to the destination if not prevented and not disabled
      if (!e.defaultPrevented && !props.disabled) {
        router.push(href);
      }
    };

    return (
      <Button
        ref={ref}
        className={`${className} ${isPrefetching ? 'is-prefetching' : ''}`}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

NavButton.displayName = 'NavButton';

export default NavButton; 