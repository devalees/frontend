'use client';

import React from 'react';
import { PrefetchLink, PrefetchLinkProps } from '@/lib/prefetching';
import { usePrefetchSettings } from '@/lib/prefetching';
import { cn } from '@/lib/utils';

interface LinkProps extends PrefetchLinkProps {
  variant?: 'default' | 'primary' | 'secondary' | 'subtle' | 'destructive';
  size?: 'default' | 'small' | 'large';
  underline?: boolean;
  sameTab?: boolean;
}

/**
 * Enhanced link component that combines styling with prefetching capability
 */
export const Link: React.FC<LinkProps> = ({
  href,
  children,
  className = '',
  variant = 'default',
  size = 'default',
  underline = false,
  sameTab = true,
  prefetch: propPrefetch,
  prefetchTimeout: propPrefetchTimeout,
  ...props
}) => {
  const { settings } = usePrefetchSettings();
  
  // Determine if prefetching is enabled based on props and global settings
  const prefetch = propPrefetch !== undefined ? propPrefetch : settings.enabled;
  const prefetchTimeout = propPrefetchTimeout !== undefined 
    ? propPrefetchTimeout 
    : settings.linkHoverDelay;

  // Base styles for link variants
  const baseStyles = cn(
    "inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    {
      // Variants
      "text-primary-600 hover:text-primary-700": variant === 'primary',
      "text-secondary-600 hover:text-secondary-700": variant === 'secondary',
      "text-gray-500 hover:text-gray-700": variant === 'subtle',
      "text-destructive hover:text-destructive/90": variant === 'destructive',
      "text-blue-600 hover:text-blue-700": variant === 'default',
      
      // Sizes
      "text-sm": size === 'small',
      "text-base": size === 'default',
      "text-lg": size === 'large',
      
      // Underline
      "hover:underline": underline,
    },
    className
  );
  
  // External link handling
  const isExternal = href.startsWith('http');
  const externalProps = isExternal && !sameTab 
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <PrefetchLink
      href={href}
      className={baseStyles}
      prefetch={prefetch}
      prefetchTimeout={prefetchTimeout}
      {...externalProps}
      {...props}
    >
      {children}
    </PrefetchLink>
  );
};

export default Link; 