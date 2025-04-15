/**
 * Axios Configuration Tests
 * 
 * This file contains tests for the Axios client configuration including:
 * - Instance creation
 * - Base configuration
 * - Interceptors
 */

import axios from 'axios';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createAxiosInstance, configureAxiosDefaults, setupInterceptors } from '../../lib/api/axiosConfig';

// Mock axios
vi.mock('axios', () => {
  const mockAxios = {
    create: vi.fn().mockReturnValue({
      interceptors: {
        request: {
          use: vi.fn(),
        },
        response: {
          use: vi.fn(),
        },
      },
    }),
    defaults: {
      headers: {
        common: {},
      },
      timeout: 10000,
    },
  };
  
  // Return both the default export and named exports
  return {
    default: mockAxios,
    ...mockAxios,
  };
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Axios Configuration', () => {
  let axiosInstance: any;
  
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  describe('Instance Creation', () => {
    it('should create an axios instance with the correct base URL', () => {
      // Create an axios instance with a custom base URL
      const baseURL = 'https://api.example.com';
      axiosInstance = createAxiosInstance(baseURL);
      
      // Expect axios.create to be called with the correct parameters
      expect(axios.create).toHaveBeenCalledWith({
        baseURL,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should create an axios instance with default timeout', () => {
      // Create an axios instance with the default base URL
      axiosInstance = createAxiosInstance();
      
      // Expect axios.create to be called with the default timeout
      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 10000,
        })
      );
    });
  });

  describe('Base Configuration', () => {
    it('should set default headers for all requests', () => {
      // Configure axios defaults
      configureAxiosDefaults();
      
      // Expect the Content-Type header to be set
      expect(axios.defaults.headers.common['Content-Type']).toBe('application/json');
    });

    it('should set default timeout for all requests', () => {
      // Configure axios defaults
      configureAxiosDefaults();
      
      // Expect the timeout to be set
      expect(axios.defaults.timeout).toBe(10000);
    });
  });

  describe('Interceptors', () => {
    it('should add request interceptor for authentication', () => {
      // Create a mock axios instance
      const mockAxiosInstance = {
        interceptors: {
          request: {
            use: vi.fn(),
          },
          response: {
            use: vi.fn(),
          },
        },
      };
      
      // Set up interceptors
      setupInterceptors(mockAxiosInstance as any);
      
      // Expect the request interceptor to be added
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
    });

    it('should add response interceptor for error handling', () => {
      // Create a mock axios instance
      const mockAxiosInstance = {
        interceptors: {
          request: {
            use: vi.fn(),
          },
          response: {
            use: vi.fn(),
          },
        },
      };
      
      // Set up interceptors
      setupInterceptors(mockAxiosInstance as any);
      
      // Expect the response interceptor to be added
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });

    it('should handle authentication token in request interceptor', () => {
      // Create a mock axios instance
      const mockAxiosInstance = {
        interceptors: {
          request: {
            use: vi.fn(),
          },
          response: {
            use: vi.fn(),
          },
        },
      };
      
      // Set up interceptors
      setupInterceptors(mockAxiosInstance as any);
      
      // Get the interceptor function that was passed to use()
      const interceptorFunction = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
      
      // Mock localStorage.getItem to return a token
      localStorageMock.getItem.mockReturnValue('test-token');
      
      // Create a mock config
      const mockConfig = {
        headers: {},
      };
      
      // Call the interceptor function
      const result = interceptorFunction(mockConfig);
      
      // Check if the Authorization header was added
      expect(result.headers.Authorization).toBe('Token test-token');
    });

    it('should handle error responses in response interceptor', async () => {
      // Create a mock axios instance
      const mockAxiosInstance = {
        interceptors: {
          request: {
            use: vi.fn(),
          },
          response: {
            use: vi.fn(),
          },
        },
      };
      
      // Set up interceptors
      setupInterceptors(mockAxiosInstance as any);
      
      // Get the error handler function that was passed to use()
      const errorHandler = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
      
      // Create a mock error
      const mockError = {
        response: {
          status: 401,
          data: {
            message: 'Unauthorized',
          },
        },
      };
      
      // Mock window.location.href
      const originalLocation = window.location;
      // Use a safer approach to mock window.location
      Object.defineProperty(window, 'location', {
        value: { href: '' },
        writable: true,
      });
      
      // Call the error handler function and catch the rejection
      try {
        await errorHandler(mockError);
        // If we get here, the test should fail because we expect a rejection
        expect(true).toBe(false);
      } catch (error) {
        // This is expected
      }
      
      // Check if localStorage.removeItem was called
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
      
      // Restore window.location
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true,
      });
    });
  });
}); 