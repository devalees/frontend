/**
 * Mock API utilities for simplifying API mocking in tests
 * 
 * This file provides utilities for mocking API responses in tests.
 * It helps with consistent API mocking patterns and reduces duplication.
 */

import { vi } from 'vitest';
import axios, { AxiosRequestConfig } from 'axios';
import { createErrorResponse } from './fixtures';

// Type definitions
type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';
type MockResponse<T> = {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: Record<string, any>;
};

/**
 * Creates a mock API response
 */
export function createMockResponse<T>(
  data: T,
  status = 200,
  statusText = 'OK',
  headers: Record<string, string> = { 'Content-Type': 'application/json' }
): MockResponse<T> {
  return {
    data,
    status,
    statusText,
    headers,
    config: {}
  };
}

/**
 * Creates a mock API error
 */
export function createMockError(
  message = 'Request failed',
  status = 500,
  code = 'INTERNAL_SERVER_ERROR'
) {
  const error = new Error(message) as any;
  error.response = {
    data: createErrorResponse(message, code, status),
    status,
    statusText: message,
    headers: { 'Content-Type': 'application/json' },
    config: {}
  };
  error.isAxiosError = true;
  return error;
}

/**
 * Mock implementation for axios methods
 */
export function mockApiMethod<T>(method: HttpMethod, response: T, status = 200) {
  return vi.spyOn(axios, method).mockResolvedValue(
    createMockResponse(response, status)
  );
}

/**
 * Mock implementation for axios methods that rejects with an error
 */
export function mockApiError(
  method: HttpMethod,
  message = 'Request failed',
  status = 500,
  code = 'INTERNAL_SERVER_ERROR'
) {
  return vi.spyOn(axios, method).mockRejectedValue(
    createMockError(message, status, code)
  );
}

/**
 * Reset all API mocks
 */
export function resetApiMocks() {
  vi.resetAllMocks();
}

/**
 * API mocker class for more complex scenarios
 */
export class ApiMocker {
  private mocks: Record<string, any> = {};

  /**
   * Mock a successful API call
   */
  mockSuccess<T>(method: HttpMethod, endpoint: string, response: T, status = 200) {
    const key = `${method}:${endpoint}`;
    
    // We need to completely mock the method to handle any arguments
    this.mocks[key] = vi.spyOn(axios, method).mockImplementation((...args: any[]) => {
      // First argument is URL or config with URL
      let url: string | undefined;
      if (typeof args[0] === 'string') {
        url = args[0]; // URL is passed directly
      } else if (args[0]?.url) {
        url = args[0].url; // URL is in config object
      }
      
      if (url && url.includes(endpoint)) {
        return Promise.resolve(createMockResponse(response, status));
      }
      
      // If not matched, continue with real implementation or reject with clear message
      return Promise.reject(new Error(`No mock found for URL: ${url || 'unknown'}`));
    });
    
    return this;
  }

  /**
   * Mock a failed API call
   */
  mockError(
    method: HttpMethod,
    endpoint: string,
    message = 'Request failed',
    status = 500,
    code = 'INTERNAL_SERVER_ERROR'
  ) {
    const key = `${method}:${endpoint}`;
    
    // We need to completely mock the method to handle any arguments
    this.mocks[key] = vi.spyOn(axios, method).mockImplementation((...args: any[]) => {
      // First argument is URL or config with URL
      let url: string | undefined;
      if (typeof args[0] === 'string') {
        url = args[0]; // URL is passed directly
      } else if (args[0]?.url) {
        url = args[0].url; // URL is in config object
      }
      
      if (url && url.includes(endpoint)) {
        return Promise.reject(createMockError(message, status, code));
      }
      
      // If not matched, continue with real implementation or reject with clear message
      return Promise.reject(new Error(`No mock found for URL: ${url || 'unknown'}`));
    });
    
    return this;
  }

  /**
   * Reset all mocks
   */
  reset() {
    Object.values(this.mocks).forEach(mock => mock.mockReset());
    this.mocks = {};
    return this;
  }
} 