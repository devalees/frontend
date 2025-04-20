/**
 * Test utilities entry point - temporary version 
 * with e2eTestUtils import removed
 */

// Re-export testing libraries
import { screen, waitFor, fireEvent, act, cleanup } from '@testing-library/react';
import { within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

// Re-export Jest
import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll, jest } from '@jest/globals';

// Re-export test utilities
import * as testUtils from './testUtils';
import * as fixtures from './fixtures';
import * as mockApi from './mockApi';
// Don't export e2eTestUtils which has JSX parsing issues
// import * as e2eTestUtils from './e2eTestUtils';

// Export testing libraries
export { screen, waitFor, fireEvent, act, cleanup, within, userEvent };

// Export Jest
export { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll, jest };

// Export test utilities
export const { render, renderHook } = testUtils;
export const { 
  createUserFixture, createAdminFixture, 
  createTodoFixture, createTodosFixture, 
  createProjectFixture, createPaginatedResponse, createErrorResponse 
} = fixtures;
export const { 
  createMockResponse, createMockError, 
  mockApiMethod, mockApiError, resetApiMocks, ApiMocker
} = mockApi;

/**
 * Create a mock component with the given display name
 */
export function createMockComponent(displayName: string) {
  const component = () => null;
  component.displayName = displayName;
  return component;
}

/**
 * Create a mock hook that returns the given value
 */
export function createMockHook<T>(returnValue: T) {
  return () => returnValue;
}

/**
 * Create a mock store with the given state
 */
export function createMockStore<T extends Record<string, any>>(initialState: T) {
  const state = { ...initialState };
  const subscribers: Array<() => void> = [];
  
  return {
    getState: () => state,
    setState: (newState: Partial<T>) => {
      Object.assign(state, newState);
      subscribers.forEach(fn => fn());
    },
    subscribe: (fn: () => void) => {
      subscribers.push(fn);
      return () => {
        const index = subscribers.indexOf(fn);
        if (index > -1) {
          subscribers.splice(index, 1);
        }
      };
    }
  };
}

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
 * Mock fetch response
 */
export function mockFetchResponse<T>(data: T, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data
  };
}

/**
 * Resolve after a specified time
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
} 