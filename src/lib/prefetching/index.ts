/**
 * Prefetching Module
 * 
 * This module contains utilities for implementing prefetching across the application:
 * - PrefetchLink: Enhanced Link component that prefetches on hover
 * - usePaginationPrefetch: Hook for prefetching pagination data
 * - PrefetchProvider: Context provider for global prefetching settings
 * - usePrefetchSettings: Hook to access prefetching settings
 */

export { PrefetchLink, default as PrefetchLinkComponent } from './PrefetchLink';
export { usePaginationPrefetch } from './usePaginationPrefetch';
export { 
  PrefetchProvider, 
  usePrefetchSettings,
  default as PrefetchProviderComponent 
} from './prefetchProvider';

// Types
export type { PaginationPrefetchOptions } from './usePaginationPrefetch';
export type { PrefetchLinkProps } from './PrefetchLink'; 