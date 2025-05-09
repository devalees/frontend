/**
 * Fixed Test Utilities
 */
import { render as rtlRender, screen, fireEvent, waitFor, act, cleanup } from '@testing-library/react';
import { within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll, jest } from '@jest/globals';
import React from 'react';

// Export testing library utilities
export {
  screen,
  waitFor,
  fireEvent,
  act,
  cleanup,
  within,
  userEvent,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
  jest
};

/**
 * Custom render function that includes providers if needed
 */
export const render = (ui: React.ReactElement, options = {}) => {
  return rtlRender(ui, options);
};

/**
 * Custom renderHook function that works with React hooks
 * This is a replacement for @testing-library/react-hooks
 */
export function renderHook<Result, Props>(
  callback: (props: Props) => Result,
  options: { initialProps?: Props } = {}
) {
  const { initialProps } = options;
  
  // Result ref to hold the hook result
  let resultRef: { current: Result | null } = { current: null };
  
  // Component to wrap the hook
  const TestComponent = ({ hookProps }: { hookProps?: Props }) => {
    resultRef.current = callback(hookProps || initialProps as Props);
    return null;
  };
  
  // Use React.createElement instead of JSX to avoid syntax issues
  const utils = render(React.createElement(TestComponent, { hookProps: initialProps }));
  
  return {
    ...utils,
    result: {
      get current() { 
        return resultRef.current as Result; 
      }
    },
    rerender: (props?: Props) => utils.rerender(React.createElement(TestComponent, { hookProps: props }))
  };
}

/**
 * Component test utilities
 */
export const componentTestUtils = {
  render,
  screen,
  userEvent,
  waitFor,
  act,
  fireEvent,
};

/**
 * Hook test utilities
 */
export const hookTestUtils = {
  renderHook,
  act,
  waitFor,
};

/**
 * Integration test utilities
 */
export const integrationTestUtils = {
  render,
  screen,
  userEvent,
  waitFor,
  act,
  fireEvent,
};

/**
 * Custom render method with wrapper
 */
export const customRender = (ui: React.ReactElement, options = {}) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return children;
  };

  return rtlRender(ui, { wrapper: Wrapper, ...options });
};

/**
 * Wait for a condition to be true
 */
export function waitForCondition(
  condition: () => boolean,
  timeout = 1000,
  interval = 50
): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const check = () => {
      if (condition()) {
        resolve();
        return;
      }
      
      if (Date.now() - startTime > timeout) {
        reject(new Error(`Timeout waiting for condition (${timeout}ms)`));
        return;
      }
      
      setTimeout(check, interval);
    };
    
    check();
  });
}

/**
 * Resolve after a specified time
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
} 