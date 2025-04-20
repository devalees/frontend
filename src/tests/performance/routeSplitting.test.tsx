import React from 'react';
// Import core testing utilities directly from vitest
import { jest } from "@jest/globals";
// Import DOM testing utilities from our centralized system
import { render, screen, waitFor, act } from '../utils';
import { prettyDOM  } from '../../tests/utils';

// Import the actual components we're testing
import { RouteLink, RouteError, RouteLoading } from '../../lib/routing';
import { getRouteChunks, preloadChunk } from '../../lib/routing/chunkLoader';

// Import test utilities
import { performanceMockInstance, createRouteFixture, createChunkFixture } from '../utils';

// Mock the chunk loader
jest.mock('../../lib/routing/chunkLoader', () => ({
  getRouteChunks: jest.fn(),
  preloadChunk: jest.fn()
}));

// Mock global.performance to use our performanceMockInstance utility
Object.defineProperty(global, 'performance', {
  value: performanceMockInstance,
  configurable: true,
});

describe('Route-based Code Splitting', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    performanceMockInstance.reset();
    
    // Debug: Log mock resets
    console.log('=== Test Setup ===');
    console.log('Mocks reset:', {
      getRouteChunks: (getRouteChunks as jest.Mock).mock.calls.length,
      preloadChunk: (preloadChunk as jest.Mock).mock.calls.length
    });
  });

  it('should lazy load route component when navigating', async () => {
    // Arrange
    const route = createRouteFixture();
    const chunk = createChunkFixture();
    
    // Debug: Log test fixtures
    console.log('=== Test Fixtures ===');
    console.log('Route:', route);
    console.log('Chunk:', chunk);
    
    (getRouteChunks as jest.Mock).mockResolvedValue([chunk]);
    (preloadChunk as jest.Mock).mockResolvedValue(undefined);
    
    const { markSpy, measureSpy } = performanceMockInstance.spyOnMetrics();
    console.log('Performance spies initialized');
    
    // Act
    const { container } = render(
      <RouteLink href={route.path} data-testid="test-route-link">
        {route.title}
      </RouteLink>
    );

    // Debug: Log initial render
    console.log('=== Initial Render ===');
    console.log('DOM:', prettyDOM(container));

    // Initial state
    const link = screen.getByTestId('test-route-link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', route.path);
    
    // Debug: Log link element
    console.log('Link element:', {
      testId: link.getAttribute('data-testid'),
      href: link.getAttribute('href'),
      text: link.textContent
    });
    
    // Trigger route loading
    await act(async () => {
      console.log('Clicking link...');
      await link.click();
    });

    // Debug: Log after click
    console.log('=== After Click ===');
    console.log('Performance marks:', markSpy.mock.calls);
    console.log('Performance measures:', measureSpy.mock.calls);

    // Assert
    await waitFor(() => {
      // Debug: Log assertions
      console.log('=== Assertions ===');
      console.log('getRouteChunks calls:', (getRouteChunks as jest.Mock).mock.calls);
      console.log('preloadChunk calls:', (preloadChunk as jest.Mock).mock.calls);
      
      expect(getRouteChunks).toHaveBeenCalledWith(route.path);
      expect(preloadChunk).toHaveBeenCalledWith(chunk);
      expect(markSpy).toHaveBeenCalledWith('route-link-load-start');
      expect(markSpy).toHaveBeenCalledWith('route-link-load-end');
      expect(measureSpy).toHaveBeenCalledWith(
        'route-link-load-time',
        'route-link-load-start',
        'route-link-load-end'
      );
    });
  });
}); 