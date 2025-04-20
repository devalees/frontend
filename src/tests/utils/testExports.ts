/**
 * Test Exports
 * 
 * This file exports all the necessary test utilities for authentication tests
 */

// Export from mockApi
export { 
  mockApiMethod,
  mockApiError,
  createMockResponse,
  resetApiMocks,
  ApiMocker
} from './mockApi';

// Export testing-library functions
export { 
  render, 
  screen, 
  waitFor, 
  act, 
  fireEvent
} from '@testing-library/react';

// Export user-event
export { default as userEvent } from '@testing-library/user-event';

// Export mock adapter
export { default as MockAdapter } from 'axios-mock-adapter'; 