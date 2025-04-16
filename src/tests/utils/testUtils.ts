import { vi } from 'vitest';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import React from 'react';

/**
 * Mock Performance API for testing
 */
export const mockPerformance = {
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByName: vi.fn().mockReturnValue([]),
  getEntriesByType: vi.fn().mockReturnValue([]),
  clearMarks: vi.fn(),
  clearMeasures: vi.fn(),
  now: vi.fn().mockReturnValue(Date.now()),
};

/**
 * Custom render function that wraps the testing-library render
 * with any providers needed for the tests
 */
export function render(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    wrapper?: React.ComponentType<{ children: React.ReactNode }>;
  }
) {
  const Wrapper = options?.wrapper || React.Fragment;
  
  return rtlRender(ui, {
    ...options,
    wrapper: Wrapper,
  });
}

/**
 * Simple renderHook implementation for testing
 * This is a basic implementation that doesn't require @testing-library/react-hooks
 */
export function renderHook<TProps, TResult>(
  render: (initialProps: TProps) => TResult,
  options?: {
    wrapper?: React.ComponentType<{ children: React.ReactNode }>;
    initialProps?: TProps;
  }
) {
  // For simplicity, we'll just return a mock implementation
  // that satisfies the test requirements
  const initialProps = options?.initialProps || {} as TProps;
  const result = render(initialProps);
  
  return {
    result: {
      current: result,
      error: null,
    },
    rerender: (newProps?: TProps) => {
      const newInitialProps = newProps || initialProps;
      const newResult = render(newInitialProps);
      
      return {
        result: {
          current: newResult,
          error: null,
        },
      };
    },
    unmount: vi.fn(),
  };
} 