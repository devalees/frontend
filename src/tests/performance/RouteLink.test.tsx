import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import { RouteLink } from '../../lib/routing';
import { performanceMockInstance } from '../utils/mockPerformance';

vi.mock('../../lib/routing/chunkLoader', () => ({
  getRouteChunks: vi.fn(),
  preloadChunk: vi.fn()
}));

// Mock global.performance to use our performanceMockInstance utility
Object.defineProperty(global, 'performance', {
  value: performanceMockInstance,
  configurable: true,
});

describe('RouteLink Performance', () => {
  const mockChunk = {
    id: 'test-chunk',
    name: 'test-chunk',
    path: '/chunks/test.js',
    size: 1024
  };

  beforeEach(() => {
    vi.clearAllMocks();
    performanceMockInstance.reset();
  });

  it('should preload route chunks efficiently on hover', async () => {
    const { markSpy, measureSpy } = performanceMockInstance.spyOnMetrics();
    const { getRouteChunks, preloadChunk } = await import('../../lib/routing/chunkLoader');
    
    // Configure mocks with synchronous resolution
    vi.mocked(getRouteChunks).mockReturnValue(Promise.resolve([mockChunk]));
    vi.mocked(preloadChunk).mockReturnValue(Promise.resolve(undefined));

    render(
      <RouteLink 
        href="/test-route"
        preload={true}
      >
        Test Link
      </RouteLink>
    );

    const link = screen.getByText('Test Link');
    
    // Trigger hover
    fireEvent.mouseEnter(link);
    
    // We need to wait for the async handling to complete since fireEvent is synchronous
    await waitFor(() => {
      // Verify chunk loading
      expect(getRouteChunks).toHaveBeenCalledWith('/test-route');
      expect(preloadChunk).toHaveBeenCalledWith(mockChunk);
    });

    // Verify performance marks
    expect(markSpy).toHaveBeenCalledWith('route-link-preload-start');
    expect(markSpy).toHaveBeenCalledWith('route-link-preload-end');
    expect(measureSpy).toHaveBeenCalledWith(
      'route-link-preload-time',
      'route-link-preload-start',
      'route-link-preload-end'
    );
  });

  it('should handle click events with optimal performance', async () => {
    const { markSpy, measureSpy } = performanceMockInstance.spyOnMetrics();
    const { getRouteChunks } = await import('../../lib/routing/chunkLoader');
    
    vi.mocked(getRouteChunks).mockResolvedValue([mockChunk]);

    render(
      <RouteLink 
        href="/test-route"
        onClick={() => {}}
      >
        Test Link
      </RouteLink>
    );

    const link = screen.getByText('Test Link');
    
    // Click the link
    fireEvent.click(link);

    // Verify performance marks
    expect(markSpy).toHaveBeenCalledWith('route-link-click-start');
    expect(markSpy).toHaveBeenCalledWith('route-link-click-end');
    expect(measureSpy).toHaveBeenCalledWith(
      'route-link-click-time',
      'route-link-click-start',
      'route-link-click-end'
    );
  });
}); 