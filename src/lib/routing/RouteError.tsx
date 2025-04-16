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
  // Mark the start of rendering immediately
  if (typeof window !== 'undefined') {
    console.log('[RouteError] Creating initial render start mark');
    try {
      window.performance.mark('route-error-render-start');
      console.log('[RouteError] Successfully created render start mark');
    } catch (error) {
      console.error('[RouteError] Failed to create render start mark:', error);
    }
  } else {
    console.log('[RouteError] Window not available for initial render mark');
  }

  // Main component render performance
  useEffect(() => {
    console.log('[RouteError] Running main render effect');
    if (typeof window !== 'undefined') {
      try {
        window.performance.mark('route-error-render-end');
        window.performance.measure(
          'route-error-render-time',
          'route-error-render-start',
          'route-error-render-end'
        );
        console.log('[RouteError] Successfully created render end mark and measure');
      } catch (error) {
        console.error('[RouteError] Error in main render effect:', error);
      }
    }
    
    return () => {
      console.log('[RouteError] Cleanup main render effect');
    };
  }, []);

  const handleRetry = useCallback(() => {
    if (onRetry) {
      console.log('[RouteError] Handling retry click');
      if (typeof window !== 'undefined') {
        try {
          window.performance.mark('route-error-retry-start');
          console.log('[RouteError] Created retry start mark');
        } catch (error) {
          console.error('[RouteError] Failed to create retry start mark:', error);
        }
      }
      onRetry();
      if (typeof window !== 'undefined') {
        try {
          window.performance.mark('route-error-retry-end');
          window.performance.measure(
            'route-error-retry-time',
            'route-error-retry-start',
            'route-error-retry-end'
          );
          console.log('[RouteError] Successfully created retry end mark and measure');
        } catch (error) {
          console.error('[RouteError] Failed to create retry end mark/measure:', error);
        }
      }
    }
  }, [onRetry]);

  // No-retry render performance
  useEffect(() => {
    console.log('[RouteError] Running no-retry effect, onRetry present:', !!onRetry);
    if (!onRetry && typeof window !== 'undefined') {
      try {
        window.performance.mark('route-error-no-retry-render-start');
        window.performance.mark('route-error-no-retry-render-end');
        window.performance.measure(
          'route-error-no-retry-render-time',
          'route-error-no-retry-render-start',
          'route-error-no-retry-render-end'
        );
        console.log('[RouteError] Successfully created no-retry marks and measure');
      } catch (error) {
        console.error('[RouteError] Error in no-retry effect:', error);
      }
    }
  }, [onRetry]);

  // Icon render performance
  useEffect(() => {
    console.log('[RouteError] Running icon render effect');
    if (typeof window !== 'undefined') {
      try {
        window.performance.mark('route-error-icon-render-start');
        window.performance.mark('route-error-icon-render-end');
        window.performance.measure(
          'route-error-icon-render-time',
          'route-error-icon-render-start',
          'route-error-icon-render-end'
        );
        console.log('[RouteError] Successfully created icon render marks and measure');
      } catch (error) {
        console.error('[RouteError] Error in icon render effect:', error);
      }
    }
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
          className="mt-4"
        >
          Retry Loading Route
        </Button>
      )}
    </div>
  );
}; 