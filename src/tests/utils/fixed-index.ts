/**
 * Fixed Test Utilities Index
 * 
 * This file exports all test utilities without the reference to the undefined 'user' variable.
 */

// Re-export utilities from mockApi
export { 
  mockApiMethod,
  mockApiError,
  createMockResponse,
  resetApiMocks,
  ApiMocker
} from './mockApi';

// Import and re-export from react-testing-library
import { 
  render as rtlRender, 
  screen, 
  waitFor, 
  act, 
  fireEvent,
  within,
  cleanup 
} from '@testing-library/react';

// Import and re-export userEvent from our mock instead
import userEvent from './mockUserEvent';

// React hooks - direct imports
import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useReducer
} from 'react';

// Import test utilities
import { render, renderHook } from './testUtils';

// Re-export fixtures
import {
  createUserFixture,
  createAdminFixture, 
  createTodoFixture, 
  createTodosFixture, 
  createProjectFixture, 
  createPaginatedResponse, 
  createErrorResponse
} from './fixtures';

// Export testing library utilities
export {
  // From testing-library
  screen,
  waitFor,
  act,
  fireEvent,
  within,
  cleanup,
  
  // User events
  userEvent,
  
  // From testUtils
  render,
  renderHook,
  
  // From React
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useReducer,
  
  // From fixtures
  createUserFixture,
  createAdminFixture,
  createTodoFixture,
  createTodosFixture,
  createProjectFixture,
  createPaginatedResponse,
  createErrorResponse
};

// Custom render method with wrapper
export const customRender = (ui: React.ReactElement, options = {}) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return children;
  };

  return rtlRender(ui, { wrapper: Wrapper, ...options });
};

// Mock API response helper
export const mockApiResponse = (data: any, status = 200) => ({
  data,
  status,
  statusText: status === 200 ? 'OK' : 'Error',
  headers: {},
  config: {},
});

// Export component test utilities
export const componentTestUtils = {
  customRender,
  screen,
  userEvent, // Using userEvent instead of user
  waitFor,
  act,
  fireEvent,
};

// Hook test utilities
export const hookTestUtils = {
  customRender,
  act,
  waitFor,
};

// Integration test utilities
export const integrationTestUtils = {
  customRender,
  screen,
  userEvent, // Using userEvent instead of user
  waitFor,
  act,
  fireEvent,
  mockApiResponse,
};

// Mock functions
export const mockFn = jest.fn;
export const spyOn = jest.spyOn; 