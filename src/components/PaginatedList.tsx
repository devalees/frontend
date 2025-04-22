'use client';

import React, { ReactNode } from 'react';
import { usePaginationPrefetch, usePrefetchSettings } from '@/lib/prefetching';
import { Button } from '@/components/ui/Button';
import { NavButton } from '@/components/ui/NavButton';
import { Spinner } from '@/components/ui/Spinner';

interface PaginatedListProps<T> {
  /** Current data items */
  data: T[] | null;
  /** Total number of pages */
  totalPages: number;
  /** Current page number (1-based) */
  currentPage: number;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error?: Error | null;
  /** Function to fetch a specific page */
  fetchPage: (page: number) => Promise<void>;
  /** Function to render an item */
  renderItem: (item: T, index: number) => ReactNode;
  /** Empty state message */
  emptyMessage?: string;
  /** Error message */
  errorMessage?: string;
  /** Whether to use prefetching */
  prefetch?: boolean;
  /** Container className */
  className?: string;
  /** Item wrapper className */
  itemClassName?: string;
  /** Keys for items */
  keyExtractor?: (item: T, index: number) => string;
}

/**
 * Generic paginated list component with prefetching support
 */
export function PaginatedList<T>({
  data,
  totalPages,
  currentPage,
  isLoading,
  error,
  fetchPage,
  renderItem,
  emptyMessage = 'No items found',
  errorMessage = 'Error loading data',
  prefetch: propPrefetch,
  className = '',
  itemClassName = '',
  keyExtractor,
}: PaginatedListProps<T>) {
  // Get global prefetch settings
  const { settings } = usePrefetchSettings();
  
  // Determine if prefetching is enabled based on props and global settings
  const prefetchEnabled = propPrefetch !== undefined ? propPrefetch : settings.enabled;
  
  // Setup pagination prefetching
  const { prefetchedPages } = usePaginationPrefetch({
    currentData: data,
    totalPages,
    currentPage,
    fetchNextPage: fetchPage,
    enabled: prefetchEnabled,
    prefetchOnlyNextPage: settings.prefetchOnlyNextPage,
    prefetchThreshold: settings.paginationThreshold,
  });

  // Handle page navigation
  const handlePageChange = async (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    await fetchPage(page);
  };

  // Render pagination controls
  const renderPagination = () => {
    if (!data || data.length === 0 || totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center space-x-2 mt-4">
        <NavButton
          href={`?page=1`}
          variant="outline"
          size="small"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1 || isLoading}
        >
          First
        </NavButton>
        <NavButton
          href={`?page=${currentPage - 1}`}
          variant="outline"
          size="small"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
        >
          Previous
        </NavButton>
        
        <span className="mx-2">
          Page {currentPage} of {totalPages}
        </span>
        
        <NavButton
          href={`?page=${currentPage + 1}`}
          variant="outline"
          size="small"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
        >
          Next
        </NavButton>
        <NavButton
          href={`?page=${totalPages}`}
          variant="outline"
          size="small"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages || isLoading}
        >
          Last
        </NavButton>
      </div>
    );
  };

  // Render loading state
  if (isLoading && (!data || data.length === 0)) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  // Render error state
  if (error && (!data || data.length === 0)) {
    return (
      <div className="text-center text-red-500 p-4">
        {errorMessage}: {error.message}
      </div>
    );
  }

  // Render empty state
  if (!data || data.length === 0) {
    return <div className="text-center text-gray-500 p-4">{emptyMessage}</div>;
  }

  return (
    <div className={className}>
      {/* Item list */}
      <div className="space-y-2">
        {data.map((item, index) => (
          <div 
            key={keyExtractor ? keyExtractor(item, index) : index}
            className={itemClassName}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
      
      {/* Loading indicator for pagination */}
      {isLoading && (
        <div className="flex justify-center mt-4">
          <Spinner className="w-6 h-6" />
        </div>
      )}
      
      {/* Pagination controls */}
      {renderPagination()}
      
      {/* Prefetch status - for debugging only */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-400 mt-2">
          Prefetched pages: {prefetchedPages.join(', ')}
        </div>
      )}
    </div>
  );
}

export default PaginatedList; 