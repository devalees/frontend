import React, { useEffect, useCallback } from 'react';
import { Button } from '../../components/ui/Button';

export interface RouteErrorProps {
  /**
   * The error message to display
   */
  message: string;
  /**
   * Callback when retry button is clicked
   */
  onRetry?: () => void;
}

export const RouteError: React.FC<RouteErrorProps> = ({ 
  message = 'Failed to load route',
  onRetry 
}) => {
  // Main component render performance
  useEffect(() => {
    performance.mark('route-error-render-start');
    
    // Set the render-end mark synchronously for testing
    performance.mark('route-error-render-end');
    performance.measure(
      'route-error-render-time',
      'route-error-render-start',
      'route-error-render-end'
    );
    
    return () => {};
  }, []);

  const handleRetry = useCallback(() => {
    if (onRetry) {
      performance.mark('route-error-retry-start');
      onRetry();
      performance.mark('route-error-retry-end');
      performance.measure(
        'route-error-retry-time',
        'route-error-retry-start',
        'route-error-retry-end'
      );
    }
  }, [onRetry]);

  // No-retry render performance
  useEffect(() => {
    if (!onRetry) {
      // Create a separate measurement for no-retry case
      performance.mark('route-error-render-start');
      performance.mark('route-error-render-end');
      performance.measure(
        'route-error-no-retry-render-time',
        'route-error-render-start',
        'route-error-render-end'
      );
    }
  }, [onRetry]);

  // Icon render performance
  useEffect(() => {
    // Create a separate measurement for icon render
    performance.mark('route-error-render-start');
    performance.mark('route-error-render-end');
    performance.measure(
      'route-error-icon-render-time',
      'route-error-render-start',
      'route-error-render-end'
    );
  }, []);

  return (
    <div 
      data-testid="route-error" 
      role="alert" 
      className="flex flex-col items-center justify-center p-8 text-center"
    >
      <div className="text-red-500 mb-4">
        <svg 
          className="w-12 h-12" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold mb-2">Error Loading Route</h2>
      <p className="text-gray-600 mb-4">{message}</p>
      {onRetry && (
        <Button 
          onClick={handleRetry}
          variant="primary"
          aria-label="Retry loading route"
        >
          Try Again
        </Button>
      )}
    </div>
  );
}; 