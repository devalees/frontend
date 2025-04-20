/**
 * Axios Configuration Tests
 * 
 * These tests verify the functionality of the Axios configuration including:
 * - Instance creation
 * - Error handling
 * - Token refresh mechanisms
 * - Fallbacks when features aren't available
 */

import { describe, it, expect, beforeEach, afterEach } from '../../tests/utils';
import axios from 'axios';
import { 
  createAxiosInstance, 
  getEnvironmentConfig, 
  setupInterceptors, 
  configureAxiosDefaults
} from '../../lib/api/axiosConfig';
import * as tokenRefresh from '../../lib/api/tokenRefresh';

// Mock the tokenRefresh module
jest.mock('../../lib/api/tokenRefresh', () => ({
  getAccessToken: jest.fn(),
  getRefreshToken: jest.fn(),
  refreshTokens: jest.fn(),
  clearTokens: jest.fn()
}));

// Mock axios
jest.mock('axios', () => {
  const mockAxios = {
    create: jest.fn().mockReturnThis(),
    defaults: {
      headers: {
        common: {}
      }
    },
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    },
    request: jest.fn().mockImplementation(() => Promise.resolve({ data: 'success' }))
  };
  return mockAxios;
});

// Save original console methods
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;
const originalConsoleDebug = console.debug;

describe('Axios Configuration', () => {
  beforeEach(() => {
    // Mock localStorage
    const mockLocalStorage: Record<string, string> = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key: string) => mockLocalStorage[key] || null),
        setItem: jest.fn((key: string, value: string) => { mockLocalStorage[key] = value; }),
        removeItem: jest.fn((key: string) => { delete mockLocalStorage[key]; })
      },
      writable: true
    });

    // Mock window.location
    const windowLocationSpy = jest.spyOn(window, 'location', 'get');
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true
    });

    // Mock console methods
    console.warn = jest.fn();
    console.error = jest.fn();
    console.debug = jest.fn();

    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore console methods
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
    console.debug = originalConsoleDebug;
    
    // Restore spies
    jest.restoreAllMocks();
  });

  describe('Instance Creation', () => {
    it('should create an axios instance with default configuration', () => {
      const instance = createAxiosInstance();
      
      expect(axios.create).toHaveBeenCalled();
    });

    it('should use environment configuration if no options are provided', () => {
      const envConfig = getEnvironmentConfig();
      const instance = createAxiosInstance();
      
      expect(axios.create).toHaveBeenCalledWith(expect.objectContaining({
        baseURL: envConfig.baseURL,
        timeout: envConfig.timeout,
        headers: envConfig.headers
      }));
    });

    it('should override configuration with provided options', () => {
      const customBaseURL = 'https://api.example.com/';
      const customTimeout = 5000;
      
      const instance = createAxiosInstance(customBaseURL, { timeout: customTimeout });
      
      expect(axios.create).toHaveBeenCalledWith(expect.objectContaining({
        baseURL: customBaseURL,
        timeout: customTimeout
      }));
    });

    it('should fall back to default axios instance if axios.create is not available', () => {
      // Save original axios.create
      const originalCreate = axios.create;
      
      // Remove axios.create
      // @ts-ignore - we're intentionally removing this for testing
      axios.create = undefined;
      
      const instance = createAxiosInstance();
      
      expect(console.warn).toHaveBeenCalledWith('axios.create is not a function, using default axios instance');
      
      // Restore axios.create
      axios.create = originalCreate;
    });

    it('should handle missing axios defaults', () => {
      // Save original properties
      const originalCreate = axios.create;
      const originalDefaults = axios.defaults;
      
      // Remove for testing
      // @ts-ignore - we're intentionally removing these for testing
      axios.create = undefined;
      // @ts-ignore
      axios.defaults = undefined;
      
      const instance = createAxiosInstance();
      
      expect(console.warn).toHaveBeenCalledWith('axios.create is not a function, using default axios instance');
      expect(axios.defaults).toBeDefined();
      
      // Restore original properties
      axios.create = originalCreate;
      axios.defaults = originalDefaults;
    });
  });

  describe('Interceptor Setup', () => {
    it('should skip interceptor setup if interceptors are not available', () => {
      // Save original interceptors
      const originalInterceptors = axios.interceptors;
      
      // Remove interceptors
      // @ts-ignore - we're intentionally removing this for testing
      axios.interceptors = undefined;
      
      setupInterceptors(axios);
      
      expect(console.warn).toHaveBeenCalledWith('Axios interceptors not available, skipping interceptor setup');
      
      // Restore interceptors
      axios.interceptors = originalInterceptors;
    });

    it('should add authorization header from token', () => {
      // Mock token
      (tokenRefresh.getAccessToken as jest.Mock).mockReturnValue('test-token');
      
      setupInterceptors(axios);
      
      // Get request interceptor function
      const requestInterceptor = (axios.interceptors.request.use as jest.Mock).mock.calls[0][0];
      const config = { headers: {} };
      
      // Call the interceptor
      const result = requestInterceptor(config);
      
      expect(result.headers.Authorization).toBe('Bearer test-token');
      expect(tokenRefresh.getAccessToken).toHaveBeenCalled();
    });

    it('should handle 401 errors and attempt token refresh', async () => {
      // Mock refresh token success
      (tokenRefresh.getRefreshToken as jest.Mock).mockReturnValue('refresh-token');
      (tokenRefresh.refreshTokens as jest.Mock).mockResolvedValue({ 
        access: 'new-token', 
        refresh: 'new-refresh-token' 
      });
      
      setupInterceptors(axios);
      
      // Get response error interceptor function
      const responseErrorInterceptor = (axios.interceptors.response.use as jest.Mock).mock.calls[0][1];
      
      // Create error with 401 status
      const error = {
        response: { status: 401, data: {} },
        config: { 
          headers: {}, 
          _retry: false,
          method: 'get',
          url: '/test'
        }
      };
      
      // Call the interceptor but don't await it
      // This allows us to verify the internal functions are called
      // without having to resolve the entire promise chain
      responseErrorInterceptor(error).catch(() => {
        // Ignore errors
      });
      
      // Verify token refresh mechanisms are triggered
      expect(tokenRefresh.getRefreshToken).toHaveBeenCalled();
      expect(tokenRefresh.refreshTokens).toHaveBeenCalled();
    });

    it('should handle token refresh failure', async () => {
      // Mock refresh token failure
      (tokenRefresh.getRefreshToken as jest.Mock).mockReturnValue('refresh-token');
      (tokenRefresh.refreshTokens as jest.Mock).mockRejectedValue(new Error('Refresh failed'));
      
      setupInterceptors(axios);
      
      // Get response error interceptor function
      const responseErrorInterceptor = (axios.interceptors.response.use as jest.Mock).mock.calls[0][1];
      
      // Create error with 401 status
      const error = {
        response: { status: 401, data: {} },
        config: { headers: {}, _retry: false }
      };
      
      // Call the interceptor
      try {
        await responseErrorInterceptor(error);
        // Should not reach here
        expect(true).toBe(false);
      } catch (e) {
        expect(tokenRefresh.clearTokens).toHaveBeenCalled();
        expect(window.location.href).toBe('/login');
      }
    });

    it('should handle other error status codes', async () => {
      setupInterceptors(axios);
      
      // Get response error interceptor function
      const responseErrorInterceptor = (axios.interceptors.response.use as jest.Mock).mock.calls[0][1];
      
      // Test 403 error
      const forbidden = {
        response: { status: 403, data: 'Forbidden' },
        config: {}
      };
      
      try {
        await responseErrorInterceptor(forbidden);
      } catch (e) {
        expect(console.error).toHaveBeenCalledWith('Permission denied:', 'Forbidden');
      }
      
      // Test 404 error
      const notFound = {
        response: { status: 404, data: 'Not Found' },
        config: {}
      };
      
      try {
        await responseErrorInterceptor(notFound);
      } catch (e) {
        expect(console.error).toHaveBeenCalledWith('Resource not found:', 'Not Found');
      }
      
      // Test 500 error
      const serverError = {
        response: { status: 500, data: 'Server Error' },
        config: {}
      };
      
      try {
        await responseErrorInterceptor(serverError);
      } catch (e) {
        expect(console.error).toHaveBeenCalledWith('Server error:', 'Server Error');
      }
    });
  });

  describe('Environment Configuration', () => {
    it('should return default configuration values', () => {
      const config = getEnvironmentConfig();
      
      expect(config.baseURL).toBeDefined();
      expect(config.timeout).toBeDefined();
      expect(config.debug).toBeDefined();
      expect(config.headers).toBeDefined();
    });

    it('should configure different settings based on environment', () => {
      // Save original NODE_ENV
      const originalNodeEnv = process.env.NODE_ENV;
      
      // Mock NODE_ENV instead of directly assigning
      jest.replaceProperty(process.env, 'NODE_ENV', 'development');
      const devConfig = getEnvironmentConfig();
      expect(devConfig.debug).toBe(true);
      expect(devConfig.validateStatus).toBeDefined();
      
      // Mock NODE_ENV for production
      jest.replaceProperty(process.env, 'NODE_ENV', 'production');
      const prodConfig = getEnvironmentConfig();
      expect(prodConfig.debug).toBe(false);
      expect(prodConfig.retry).toBe(true);
      
      // Restore NODE_ENV
      jest.replaceProperty(process.env, 'NODE_ENV', originalNodeEnv);
    });
  });
}); 