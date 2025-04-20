/**
 * Mock API Utilities
 * 
 * This file provides utilities for mocking API requests in tests:
 * - Mock responses
 * - Mock errors
 * - API method mocking
 * - API mocker for multiple endpoints
 */

import { jest } from '@jest/globals';
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { createErrorResponse } from './fixtures';

// Define HTTP method types
export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

/**
 * Creates a mock response with the specified data and status code
 */
export function createMockResponse<T>(
  data: T, 
  status = 200, 
  statusText = '', 
  headers = { 'Content-Type': 'application/json' }
): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: statusText || (status === 200 ? 'OK' : 'Error'),
    headers,
    config: { headers: {} } as InternalAxiosRequestConfig
  };
}

/**
 * Creates a mock error with the specified message, status code, and error code
 */
export function createMockError(
  message = 'Request failed',
  status = 500,
  code = 'INTERNAL_SERVER_ERROR'
): AxiosError {
  const error = new Error(message) as AxiosError;
  error.response = {
    data: createErrorResponse(message, code, status),
    status,
    statusText: message,
    headers: { 'Content-Type': 'application/json' },
    config: { headers: {} } as InternalAxiosRequestConfig
  } as AxiosResponse;
  error.code = code;
  error.isAxiosError = true;
  return error;
}

/**
 * Mocks an API method to return a successful response
 * 
 * @param method The HTTP method to mock (get, post, put, patch, delete)
 * @param response The response data to return
 * @param status The HTTP status code to return (default: 200)
 * @returns The mocked function
 */
export function mockApiMethod<T>(method: HttpMethod, response: T, status = 200) {
  // @ts-ignore - Ignore type issues with mockResolvedValue
  const mockedFn = jest.fn().mockResolvedValue(createMockResponse(response, status));
  // In our Jest setup, axios is already mocked, so we're just overriding its implementation
  (axios as any)[method] = mockedFn;
  return mockedFn;
}

/**
 * Mocks an API method to return an error response
 * 
 * @param method The HTTP method to mock (get, post, put, patch, delete)
 * @param message The error message
 * @param status The HTTP status code (default: 500)
 * @param code The error code (default: INTERNAL_SERVER_ERROR)
 * @returns The mocked function
 */
export function mockApiError(
  method: HttpMethod,
  message = 'Request failed',
  status = 500,
  code = 'INTERNAL_SERVER_ERROR'
) {
  // @ts-ignore - Ignore type issues with mockRejectedValue
  const mockedFn = jest.fn().mockRejectedValue(createMockError(message, status, code));
  // In our Jest setup, axios is already mocked, so we're just overriding its implementation
  (axios as any)[method] = mockedFn;
  return mockedFn;
}

/**
 * Reset all API mocks
 */
export function resetApiMocks() {
  jest.resetAllMocks();
}

/**
 * API Mocker for advanced mocking scenarios
 * 
 * This class provides utilities for mocking multiple endpoints
 * and managing the mocks throughout the test lifecycle.
 */
export class ApiMocker {
  private mocks: Map<string, jest.Mock>;

  constructor() {
    this.mocks = new Map();
  }

  /**
   * Gets the URL pattern used for matching
   * 
   * @param method HTTP method
   * @param endpoint API endpoint
   */
  private getPatternKey(method: HttpMethod, endpoint: string): string {
    return `${method.toUpperCase()}:${endpoint}`;
  }

  /**
   * Mocks a successful API response for a specific endpoint
   * 
   * @param method HTTP method
   * @param endpoint API endpoint (can contain wildcards with *)
   * @param response The response data
   * @param status HTTP status code (default: 200)
   */
  mockEndpoint<T>(
    method: HttpMethod,
    endpoint: string,
    response: T,
    status = 200
  ): jest.Mock {
    const key = this.getPatternKey(method, endpoint);
    // @ts-ignore - Ignore type issues with mockResolvedValue
    const mock = jest.fn().mockResolvedValue(createMockResponse(response, status));
    
    // @ts-ignore - Ignore type mismatch with map
    this.mocks.set(key, mock);
    // Set up the mock on axios
    (axios as any)[method] = (url: string, ...args: any[]) => {
      // Find the matching mock based on the URL pattern
      const matchingMock = this.findMatchingMock(method, url);
      if (matchingMock) {
        return matchingMock(url, ...args);
      }
      
      // Default mock response if no specific mock is found
      return Promise.resolve(createMockResponse({}, 200));
    };
    
    return mock;
  }

  /**
   * Mocks an error response for a specific endpoint
   * 
   * @param method HTTP method
   * @param endpoint API endpoint (can contain wildcards with *)
   * @param message Error message
   * @param status HTTP status code (default: 500)
   * @param code Error code (default: INTERNAL_SERVER_ERROR)
   */
  mockEndpointError(
    method: HttpMethod,
    endpoint: string,
    message: string,
    status = 500,
    code = 'INTERNAL_SERVER_ERROR'
  ): jest.Mock {
    const key = this.getPatternKey(method, endpoint);
    // @ts-ignore - Ignore type issues with mockRejectedValue
    const mock = jest.fn().mockRejectedValue(createMockError(message, status, code));
    
    // @ts-ignore - Ignore type mismatch with map
    this.mocks.set(key, mock);
    // Set up the mock on axios
    (axios as any)[method] = (url: string, ...args: any[]) => {
      // Find the matching mock based on the URL pattern
      const matchingMock = this.findMatchingMock(method, url);
      if (matchingMock) {
        return matchingMock(url, ...args);
      }
      
      // Default mock response if no specific mock is found
      return Promise.reject(createMockError('Not found', 404, 'NOT_FOUND'));
    };
    
    return mock;
  }

  /**
   * Finds a matching mock based on the method and URL
   * 
   * @param method HTTP method
   * @param url URL to match against
   */
  private findMatchingMock(method: HttpMethod, url: string): jest.Mock | null {
    // Convert to an array to avoid MapIterator issue
    const entries = Array.from(this.mocks.entries());
    for (const [key, mock] of entries) {
      const [mockMethod, mockEndpoint] = key.split(':');
      
      if (mockMethod !== method.toUpperCase()) {
        continue;
      }
      
      // Convert endpoint pattern to regex
      const pattern = mockEndpoint.replace(/\//g, '\\/').replace(/\*/g, '.*');
      const regex = new RegExp(`^${pattern}$`);
      
      if (regex.test(url)) {
        return mock;
      }
    }
    
    return null;
  }

  /**
   * Resets all mocks
   */
  reset(): void {
    this.mocks.clear();
    resetApiMocks();
  }
} 