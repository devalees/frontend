import { jest, expect, describe, it, test, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import { render as rtlRender, RenderOptions, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';
import fs from 'fs';
import path from 'path';

/**
 * Mock Performance API for testing
 */
export const mockPerformance = {
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByName: jest.fn().mockReturnValue([]),
  getEntriesByType: jest.fn().mockReturnValue([]),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
  now: jest.fn().mockReturnValue(Date.now()),
};

// Re-export everything
export * from '@testing-library/react';

// Extend the expect interface
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveTextContent(text: string): R;
      toBeVisible(): R;
      toHaveClass(className: string): R;
      toHaveStyle(style: Record<string, any>): R;
    }
  }
}

// Create a custom render function
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
  initialState?: Record<string, any>;
}

export function render(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) {
  const { route, initialState, ...renderOptions } = options;

  // Set up any providers needed (e.g., Router, Redux, etc.)
  function Wrapper({ children }: { children: React.ReactNode }) {
    return children;
  }

  return {
    ...rtlRender(ui, { wrapper: Wrapper, ...renderOptions }),
  };
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
    unmount: jest.fn(),
  };
}

// Re-export everything
export { screen, fireEvent, waitFor, act };

// Export mocking utilities
export const mockFn = jest.fn;
export const mockImplementation = jest.fn;
export const mockResolvedValue = jest.fn().mockResolvedValue;
export const mockRejectedValue = jest.fn().mockRejectedValue;

// Export assertion utilities
export {
  expect,
  describe,
  it,
  test,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
};

const rootDir = process.cwd();

/**
 * Read and parse a configuration file
 */
export const readConfigFile = (filePath: string) => {
  try {
    const fullPath = path.join(rootDir, filePath);
    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    
    if (filePath.endsWith('.js')) {
      // For JS files, we need to evaluate them
      const module = { exports: {} };
      eval(`(function(module, exports) { ${content} })(module, module.exports)`);
      return module.exports;
    }
    
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading config file:', error);
    return null;
  }
};

/**
 * Read and parse a JSON file
 */
export const readJsonFile = (filePath: string) => {
  try {
    const content = fs.readFileSync(path.join(rootDir, filePath), 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading JSON file:', error);
    return null;
  }
}; 