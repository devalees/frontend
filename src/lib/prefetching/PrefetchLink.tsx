'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export interface PrefetchLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  prefetch?: boolean;
  prefetchTimeout?: number;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  [x: string]: any; // For any other props that might be passed
}

/**
 * Enhanced Link component that supports prefetching on hover
 * 
 * @param href - The URL to navigate to
 * @param children - The child elements to render inside the link
 * @param className - Optional CSS class name
 * @param prefetch - Whether to enable prefetching (default: true)
 * @param prefetchTimeout - Delay before prefetching starts on hover (default: 100ms)
 * @param onClick - Optional click handler
 */
export const PrefetchLink: React.FC<PrefetchLinkProps> = ({
  href,
  children,
  className = '',
  prefetch = true,
  prefetchTimeout = 100,
  onClick,
  ...props
}) => {
  const [isPrefetching, setIsPrefetching] = useState(false);
  const router = useRouter();
  let prefetchTimer: NodeJS.Timeout | null = null;

  const handleMouseEnter = () => {
    if (!prefetch) return;
    
    // Set a small delay to avoid prefetching when user just moves cursor over link
    prefetchTimer = setTimeout(() => {
      setIsPrefetching(true);
      // Next.js router prefetch (more reliable than using Link's prefetch prop)
      router.prefetch(href);
    }, prefetchTimeout);
  };

  const handleMouseLeave = () => {
    if (prefetchTimer) {
      clearTimeout(prefetchTimer);
      prefetchTimer = null;
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Link
      href={href}
      className={`${className} ${isPrefetching ? 'is-prefetching' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      prefetch={false} // We're manually handling prefetching
      {...props}
    >
      {children}
    </Link>
  );
};

export default PrefetchLink; 