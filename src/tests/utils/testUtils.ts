import { jest, expect, describe, it, test, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import { render as rtlRender, RenderOptions, screen, fireEvent, waitFor, act, cleanup } from '@testing-library/react';
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

// Re-export everything from @testing-library/react
export * from '@testing-library/react';

// Re-export testing functions from @jest/globals
export {
  jest,
  expect,
  describe,
  it,
  test,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll
};

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
 * Enhanced renderHook implementation for testing
 * This implementation provides better support for testing hooks with state updates
 */
export function renderHook<TProps, TResult>(
  render: (initialProps: TProps) => TResult,
  options?: {
    wrapper?: React.ComponentType<{ children: React.ReactNode }>;
    initialProps?: TProps;
  }
) {
  let currentProps = options?.initialProps || {} as TProps;
  let currentResult: TResult;
  let error: Error | null = null;

  try {
    currentResult = render(currentProps);
  } catch (e) {
    error = e as Error;
    currentResult = {} as TResult;
  }

  const result = {
    current: currentResult,
    error,
  };

  return {
    result,
    rerender: (newProps?: TProps) => {
      currentProps = newProps || currentProps;
      try {
        currentResult = render(currentProps);
        error = null;
      } catch (e) {
        error = e as Error;
      }
      return {
        result: {
          current: currentResult,
          error,
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

// Cleanup after each test
afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

// Helper to create mock API responses
export const createMockApiResponse = <T>(data: T, status = 200) => {
  return {
    data,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: {},
    config: {},
  };
};

// Helper to create mock error responses
export const createMockErrorResponse = (status = 400, message = 'Bad Request') => {
  return {
    response: {
      data: { message },
      status,
      statusText: message,
      headers: {},
      config: {},
    },
  };
};

// Helper to wait for promises to resolve
export const flushPromises = () => new Promise(resolve => setImmediate(resolve));

// Helper to mock local storage
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
  };
};

// Helper to mock fetch
export const mockFetch = (data: unknown) => {
  return jest.fn().mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(data),
    })
  );
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