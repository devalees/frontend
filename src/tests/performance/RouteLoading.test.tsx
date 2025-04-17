import React from 'react';
// Import core testing utilities directly from vitest
import { describe, it, expect, beforeEach, vi } from 'vitest';
// Import DOM testing utilities from our centralized system
import { render, screen } from '../utils';
import { cleanup } from '@testing-library/react';

import { RouteLoading } from '../../lib/routing';
import { performanceMockInstance } from '../utils';

// Mock global.performance to use our performanceMockInstance utility
Object.defineProperty(global, 'performance', {
  value: performanceMockInstance,
  configurable: true,
});

describe('RouteLoading Performance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    performanceMockInstance.reset();
  });

  afterEach(() => {
    cleanup(); // This will trigger useEffect cleanup functions
  });

  it('should render loading states with correct ARIA roles', () => {
    render(<RouteLoading />);

    const loadingElement = screen.getByTestId('route-loading');
    expect(loadingElement).toHaveAttribute('aria-label', 'Loading route');
    
    // Use getAllByRole since we have multiple status elements
    const statusElements = screen.getAllByRole('status');
    expect(statusElements).toHaveLength(8); // 1 main + 1 spinner + 6 skeletons

    const spinner = screen.getByTestId('spinner');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
    expect(spinner).toHaveAttribute('aria-busy', 'true');

    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons).toHaveLength(6);
    skeletons.forEach(skeleton => {
      expect(skeleton).toHaveAttribute('aria-label', 'Loading content');
      expect(skeleton).toHaveAttribute('aria-busy', 'true');
    });
  });

  it('should render skeleton placeholders efficiently', async () => {
    const { markSpy, measureSpy } = performanceMockInstance.spyOnMetrics();
    
    const { unmount } = render(<RouteLoading showSkeleton={true} />);
    unmount(); // Trigger cleanup to get performance marks

    // Verify performance marks are called in order - adjusted to match implementation
    expect(markSpy).toHaveBeenNthCalledWith(1, 'route-loading-render-start');
    expect(markSpy).toHaveBeenNthCalledWith(2, 'skeleton-render-start');
    expect(markSpy).toHaveBeenNthCalledWith(3, 'skeleton-render-end');
    expect(markSpy).toHaveBeenNthCalledWith(4, 'route-loading-render-end');
    
    // Verify performance measures
    expect(measureSpy).toHaveBeenCalledWith(
      'route-loading-render-time',
      'route-loading-render-start',
      'route-loading-render-end'
    );
    expect(measureSpy).toHaveBeenCalledWith(
      'skeleton-render-time',
      'skeleton-render-start',
      'skeleton-render-end'
    );
  });

  it('should not impact performance when skeletons are disabled', async () => {
    const { markSpy, measureSpy } = performanceMockInstance.spyOnMetrics();
    
    const { unmount } = render(<RouteLoading showSkeleton={false} />);

    const skeletons = screen.queryAllByTestId('skeleton');
    expect(skeletons).toHaveLength(0);

    unmount(); // Trigger cleanup to get performance marks

    // Verify performance marks are called in order - adjusted to match implementation
    expect(markSpy).toHaveBeenNthCalledWith(1, 'route-loading-render-start');
    expect(markSpy).toHaveBeenNthCalledWith(2, 'route-loading-render-end');
    
    // Verify performance measures
    expect(measureSpy).toHaveBeenCalledWith(
      'route-loading-render-time',
      'route-loading-render-start',
      'route-loading-render-end'
    );
    expect(measureSpy).toHaveBeenCalledWith(
      'route-loading-no-skeleton-render-time',
      'route-loading-render-start',
      'route-loading-render-end'
    );
  });
}); 