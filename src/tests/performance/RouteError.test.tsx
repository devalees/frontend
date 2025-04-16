import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import { RouteError } from '../../lib/routing';
import { performanceMockInstance } from '../utils/mockPerformance';

describe('RouteError Performance', () => {
  const mockRetry = vi.fn();
  const errorMessage = 'Test error message';
  const originalPerformance = window.performance;

  beforeEach(() => {
    vi.clearAllMocks();
    performanceMockInstance.reset();
    // Replace window.performance with our mock
    Object.defineProperty(window, 'performance', {
      configurable: true,
      value: {
        mark: performanceMockInstance.mark,
        measure: performanceMockInstance.measure,
        getEntriesByType: performanceMockInstance.getEntriesByType,
        clearMarks: performanceMockInstance.clearMarks,
        clearMeasures: performanceMockInstance.clearMeasures
      }
    });
  });

  afterEach(() => {
    // Restore original window.performance
    Object.defineProperty(window, 'performance', {
      configurable: true,
      value: originalPerformance
    });
  });

  it('should render error message with optimal performance', () => {
    const { markSpy, measureSpy } = performanceMockInstance.spyOnMetrics();
    
    render(
      <RouteError 
        message={errorMessage}
        onRetry={mockRetry}
      />
    );

    // Verify error message is displayed
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();

    // Verify retry button works
    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);
    expect(mockRetry).toHaveBeenCalled();

    // Verify performance marks
    expect(markSpy).toHaveBeenCalledWith('route-error-render-start');
    expect(markSpy).toHaveBeenCalledWith('route-error-render-end');
    expect(measureSpy).toHaveBeenCalledWith(
      'route-error-render-time',
      'route-error-render-start',
      'route-error-render-end'
    );
  });

  it('should handle retry button click efficiently', () => {
    const { markSpy, measureSpy } = performanceMockInstance.spyOnMetrics();
    
    render(
      <RouteError 
        message={errorMessage}
        onRetry={mockRetry}
      />
    );

    const retryButton = screen.getByRole('button', { name: /retry/i });
    
    // Click retry button
    fireEvent.click(retryButton);

    // Verify performance marks for retry action
    expect(markSpy).toHaveBeenCalledWith('route-error-retry-start');
    expect(markSpy).toHaveBeenCalledWith('route-error-retry-end');
    expect(measureSpy).toHaveBeenCalledWith(
      'route-error-retry-time',
      'route-error-retry-start',
      'route-error-retry-end'
    );
  });

  it('should optimize render without retry button', () => {
    const { markSpy, measureSpy } = performanceMockInstance.spyOnMetrics();
    
    render(<RouteError message={errorMessage} />);
    
    const retryButton = screen.queryByRole('button', { name: /retry/i });
    expect(retryButton).not.toBeInTheDocument();

    expect(measureSpy).toHaveBeenCalledWith(
      'route-error-no-retry-render-time',
      'route-error-no-retry-render-start',
      'route-error-no-retry-render-end'
    );
  });

  it('should render error icon with consistent performance', () => {
    const { markSpy, measureSpy } = performanceMockInstance.spyOnMetrics();
    
    render(<RouteError message={errorMessage} />);
    
    const errorIcon = screen.getByRole('alert');
    expect(errorIcon).toBeInTheDocument();

    expect(measureSpy).toHaveBeenCalledWith(
      'route-error-icon-render-time',
      'route-error-icon-render-start',
      'route-error-icon-render-end'
    );
  });
}); 