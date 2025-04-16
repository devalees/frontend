import React, { useEffect } from 'react';
import { Spinner } from '../../components/ui/Spinner';
import { Skeleton } from '../../components/ui/Skeleton';

export interface RouteLoadingProps {
  /**
   * Whether to show skeleton placeholders
   */
  showSkeleton?: boolean;
}

export const RouteLoading: React.FC<RouteLoadingProps> = ({ showSkeleton = true }) => {
  useEffect(() => {
    performance.mark('route-loading-render-start');
    return () => {
      performance.mark('route-loading-render-end');
      performance.measure(
        'route-loading-render-time',
        'route-loading-render-start',
        'route-loading-render-end'
      );
    };
  }, []);

  useEffect(() => {
    if (showSkeleton) {
      performance.mark('skeleton-render-start');
      return () => {
        performance.mark('skeleton-render-end');
        performance.measure(
          'skeleton-render-time',
          'skeleton-render-start',
          'skeleton-render-end'
        );
      };
    } else {
      performance.mark('route-loading-render-start');
      return () => {
        performance.mark('route-loading-render-end');
        performance.measure(
          'route-loading-no-skeleton-render-time',
          'route-loading-render-start',
          'route-loading-render-end'
        );
      };
    }
  }, [showSkeleton]);

  return (
    <div data-testid="route-loading" role="status" aria-label="Loading route">
      <div className="flex items-center justify-center p-4">
        <Spinner />
      </div>
      
      {showSkeleton && (
        <div className="space-y-4 p-4">
          <Skeleton data-testid="skeleton" height="h-8" width="w-1/4" />
          <Skeleton data-testid="skeleton" height="h-4" width="w-3/4" />
          <Skeleton data-testid="skeleton" height="h-32" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton data-testid="skeleton" height="h-48" />
            <Skeleton data-testid="skeleton" height="h-48" />
            <Skeleton data-testid="skeleton" height="h-48" />
          </div>
        </div>
      )}
    </div>
  );
}; 