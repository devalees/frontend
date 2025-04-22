'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Configuration options for the usePaginationPrefetch hook
 */
export interface PaginationPrefetchOptions<T> {
  /**
   * Current data for the current page
   */
  currentData: T[] | null;
  
  /**
   * Total number of pages
   */
  totalPages: number;
  
  /**
   * Current page number (1-based)
   */
  currentPage: number;
  
  /**
   * Function to fetch the next page data
   */
  fetchNextPage: (page: number) => Promise<void>;
  
  /**
   * Whether to enable prefetching
   * @default true
   */
  enabled?: boolean;
  
  /**
   * Whether to prefetch only the next page or all possible pages
   * @default true
   */
  prefetchOnlyNextPage?: boolean;
  
  /**
   * Threshold at which to start prefetching, based on items remaining
   * @default 3
   */
  prefetchThreshold?: number;
  
  /**
   * Whether to prefetch on mount (will prefetch next page immediately)
   * @default true
   */
  prefetchOnMount?: boolean;
}

/**
 * Hook for prefetching pagination data
 * 
 * This hook will:
 * 1. Prefetch the next page data when user is about to reach the end of current page
 * 2. Prefetch the next page on mount if enabled
 * 3. Track prefetch status to avoid redundant prefetches
 */
export function usePaginationPrefetch<T>({
  currentData,
  totalPages,
  currentPage,
  fetchNextPage,
  enabled = true,
  prefetchOnlyNextPage = true,
  prefetchThreshold = 3,
  prefetchOnMount = true,
}: PaginationPrefetchOptions<T>) {
  const [prefetchedPages, setPrefetchedPages] = useState<number[]>([]);
  const isInitialMount = useRef(true);

  // Function to prefetch a specific page
  const prefetchPage = async (page: number) => {
    // Skip if disabled, invalid page, or already prefetched
    if (
      !enabled ||
      page <= 0 ||
      page > totalPages ||
      page === currentPage ||
      prefetchedPages.includes(page)
    ) {
      return;
    }

    try {
      // Add to prefetched pages before fetch to prevent duplicate fetches
      setPrefetchedPages((prev) => [...prev, page]);
      await fetchNextPage(page);
    } catch (error) {
      // Remove from prefetched pages on error
      setPrefetchedPages((prev) => prev.filter((p) => p !== page));
      console.error(`Error prefetching page ${page}:`, error);
    }
  };

  // Prefetch on mount if enabled
  useEffect(() => {
    if (isInitialMount.current && prefetchOnMount && enabled && currentPage < totalPages) {
      prefetchPage(currentPage + 1);
      isInitialMount.current = false;
    }
  }, [currentPage, totalPages, enabled, prefetchOnMount]);

  // Reset prefetched pages when current page changes
  useEffect(() => {
    // Keep only pages that are still relevant (next pages)
    setPrefetchedPages((prev) => 
      prev.filter((page) => page > currentPage && page <= totalPages)
    );
  }, [currentPage, totalPages]);

  // Prefetch when approaching end of current page data
  useEffect(() => {
    if (!currentData || !enabled || currentPage >= totalPages) return;

    // Calculate if we're near the end of the current page data
    const remainingItems = currentData.length - (currentData.length - prefetchThreshold);
    const shouldPrefetch = remainingItems <= prefetchThreshold;

    if (shouldPrefetch && currentPage < totalPages) {
      // Prefetch only the next page if specified
      if (prefetchOnlyNextPage) {
        prefetchPage(currentPage + 1);
      } else {
        // Prefetch multiple pages (advanced use case)
        for (let page = currentPage + 1; page <= Math.min(currentPage + 2, totalPages); page++) {
          prefetchPage(page);
        }
      }
    }
  }, [currentData, currentPage, totalPages, prefetchThreshold, enabled, prefetchOnlyNextPage]);

  return {
    prefetchedPages,
    prefetchPage
  };
}

export default usePaginationPrefetch; 