/**
 * Token Refresh Mechanism Tests
 *
 * These tests verify the functionality of the automatic token refresh system
 * for handling expired JWT tokens and refreshing them transparently.
 */

jest.mock('axios');

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { setupTokenRefresh, clearTokens, getAccessToken, getRefreshToken, saveTokens } from '../../lib/api/tokenRefresh';

// Type definitions
type MockAxiosResponse<T = any> = Promise<AxiosResponse<T>>;
type MockAxiosError = Partial<AxiosError>;
type MockInterceptor = (error: AxiosError) => Promise<AxiosResponse>;

// Mock response factories
const mockResponse = <T>(data: T, status = 200): AxiosResponse<T> => {
  console.log(`Creating mock response with data:`, data, `status:`, status);
  return {
    data,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: {},
    config: {
      headers: {}
    } as InternalAxiosRequestConfig
  };
};

const mockError = (status = 401, url = '/test'): MockAxiosError => {
  console.log(`Creating mock error with status:`, status, `url:`, url);
  return {
    response: {
      status,
      statusText: 'Error',
      data: null,
      headers: {},
      config: {
        headers: {},
        url
      } as InternalAxiosRequestConfig
    },
    config: {
      headers: {},
      url
    } as InternalAxiosRequestConfig,
    isAxiosError: true,
    name: 'AxiosError',
    message: 'Error'
  };
};

describe('Token Refresh Tests', () => {
  let storage: { [key: string]: string };
  let mockAxios: jest.Mocked<typeof axios>;
  let interceptor: MockInterceptor;

  beforeEach(() => {
    console.log('Setting up test environment');
    // Setup localStorage mock
    storage = {};
    const mockStorage = {
      getItem: jest.fn((key: string) => {
        console.log(`localStorage.getItem called with key:`, key);
        return storage[key] || null;
      }),
      setItem: jest.fn((key: string, value: string) => {
        console.log(`localStorage.setItem called with key:`, key, `value:`, value);
        storage[key] = value;
      }),
      removeItem: jest.fn((key: string) => {
        console.log(`localStorage.removeItem called with key:`, key);
        delete storage[key];
      }),
      clear: jest.fn(() => {
        console.log('localStorage.clear called');
        storage = {};
      })
    };

    Object.defineProperty(window, 'localStorage', { value: mockStorage });

    // Setup axios mock
    console.log('Setting up axios mock');
    mockAxios = {
      ...jest.mocked(axios),
      create: jest.fn().mockReturnThis(),
      get: jest.fn(),
      post: jest.fn(),
      request: jest.fn(),
      interceptors: {
        request: {
          use: jest.fn()
        },
        response: {
          use: jest.fn((_, errorHandler) => {
            console.log('Setting up response interceptor');
            interceptor = errorHandler as MockInterceptor;
            return 1;
          })
        }
      },
      defaults: {
        headers: {
          common: {}
        }
      }
    } as unknown as jest.Mocked<typeof axios>;

    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    console.log('Cleaning up after test');
    storage = {};
  });

  describe('Token Storage', () => {
    it('should save tokens to localStorage', () => {
      console.log('Running test: should save tokens to localStorage');
      const tokens = {
        access: 'test-access-token',
        refresh: 'test-refresh-token'
      };
      
      saveTokens(tokens);
      
      expect(window.localStorage.setItem).toHaveBeenCalledWith('auth_token', tokens.access);
      expect(window.localStorage.setItem).toHaveBeenCalledWith('refresh_token', tokens.refresh);
      expect(storage['auth_token']).toBe(tokens.access);
      expect(storage['refresh_token']).toBe(tokens.refresh);
    });

    it('should retrieve tokens from localStorage', () => {
      console.log('Running test: should retrieve tokens from localStorage');
      storage['auth_token'] = 'stored-access-token';
      storage['refresh_token'] = 'stored-refresh-token';
      
      const accessToken = getAccessToken();
      const refreshToken = getRefreshToken();
      
      expect(window.localStorage.getItem).toHaveBeenCalledWith('auth_token');
      expect(window.localStorage.getItem).toHaveBeenCalledWith('refresh_token');
      expect(accessToken).toBe('stored-access-token');
      expect(refreshToken).toBe('stored-refresh-token');
    });

    it('should clear tokens from localStorage', () => {
      console.log('Running test: should clear tokens from localStorage');
      storage['auth_token'] = 'test-access-token';
      storage['refresh_token'] = 'test-refresh-token';
      
      clearTokens();
      
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('auth_token');
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('refresh_token');
      expect(storage['auth_token']).toBeUndefined();
      expect(storage['refresh_token']).toBeUndefined();
    });
  });

  describe('Token Refresh Mechanism', () => {
    it('should handle token refresh on 401 error', async () => {
      console.log('Running test: should handle token refresh on 401 error');
      // Setup initial tokens
      storage['auth_token'] = 'expired-token';
      storage['refresh_token'] = 'valid-refresh-token';

      // Setup mock responses
      const error = mockError(401);
      const refreshResponse = mockResponse({ access: 'new-access-token', refresh: 'new-refresh-token' });
      const successResponse = mockResponse({ data: 'success' });

      // Configure mocks
      console.log('Configuring axios mocks');
      mockAxios.get.mockRejectedValueOnce(error);
      mockAxios.post.mockResolvedValueOnce(refreshResponse);
      mockAxios.request.mockResolvedValueOnce(successResponse);

      // Setup token refresh
      console.log('Setting up token refresh');
      setupTokenRefresh(mockAxios);

      // Simulate request with expired token
      console.log('Simulating request with expired token');
      const result = await interceptor(error as AxiosError);

      // Verify results
      console.log('Verifying results');
      expect(result.status).toBe(200);
      expect(result.data).toEqual({ data: 'success' });
      expect(storage['auth_token']).toBe('new-access-token');
      expect(storage['refresh_token']).toBe('new-refresh-token');
    });

    it('should redirect to login when refresh token fails', async () => {
      console.log('Running test: should redirect to login when refresh token fails');
      // Setup initial tokens
      storage['auth_token'] = 'expired-token';
      storage['refresh_token'] = 'expired-refresh-token';

      // Mock window.location
      console.log('Mocking window.location');
      const mockLocation = { href: '' };
      Object.defineProperty(window, 'location', { value: mockLocation, writable: true });

      // Setup mock responses
      const error = mockError(401);
      const refreshError = mockError(401);

      // Configure mocks
      console.log('Configuring axios mocks');
      mockAxios.get.mockRejectedValueOnce(error);
      mockAxios.post.mockRejectedValueOnce(refreshError);

      // Setup token refresh
      console.log('Setting up token refresh');
      setupTokenRefresh(mockAxios);

      try {
        console.log('Attempting to handle error');
        await interceptor(error as AxiosError);
        fail('Should have thrown an error');
      } catch (e) {
        console.log('Error caught as expected');
        expect(storage['auth_token']).toBeUndefined();
        expect(storage['refresh_token']).toBeUndefined();
        expect(mockLocation.href).toBe('/login');
      }
    });

    it('should not attempt refresh for non-401 errors', async () => {
      console.log('Running test: should not attempt refresh for non-401 errors');
      // Setup initial tokens
      storage['auth_token'] = 'valid-token';
      storage['refresh_token'] = 'valid-refresh-token';

      // Setup mock responses
      const error = mockError(404);

      // Configure mocks
      console.log('Configuring axios mocks');
      mockAxios.get.mockRejectedValueOnce(error);

      // Setup token refresh
      console.log('Setting up token refresh');
      setupTokenRefresh(mockAxios);

      try {
        console.log('Attempting to handle error');
        await interceptor(error as AxiosError);
        fail('Should have thrown an error');
      } catch (e) {
        console.log('Error caught as expected');
        expect(mockAxios.post).not.toHaveBeenCalled();
        expect(storage['auth_token']).toBe('valid-token');
        expect(storage['refresh_token']).toBe('valid-refresh-token');
      }
    });

    it('should handle parallel requests during token refresh', async () => {
      console.log('Running test: should handle parallel requests during token refresh');
      // Setup initial tokens
      storage['auth_token'] = 'expired-token';
      storage['refresh_token'] = 'valid-refresh-token';

      // Setup mock responses
      const error1 = mockError(401, '/test1');
      const error2 = mockError(401, '/test2');
      const refreshResponse = mockResponse({ access: 'new-access-token', refresh: 'new-refresh-token' });
      const successResponse1 = mockResponse({ data: 'success1' });
      const successResponse2 = mockResponse({ data: 'success2' });

      // Configure mocks
      console.log('Configuring axios mocks');
      mockAxios.get
        .mockRejectedValueOnce(error1)
        .mockRejectedValueOnce(error2);
      mockAxios.post.mockResolvedValueOnce(refreshResponse);
      mockAxios.request
        .mockResolvedValueOnce(successResponse1)
        .mockResolvedValueOnce(successResponse2);

      // Setup token refresh
      console.log('Setting up token refresh');
      setupTokenRefresh(mockAxios);

      // Make parallel requests
      console.log('Making parallel requests');
      const [result1, result2] = await Promise.all([
        interceptor(error1 as AxiosError),
        interceptor(error2 as AxiosError)
      ]);

      // Verify results
      console.log('Verifying results');
      expect(result1.data).toEqual({ data: 'success1' });
      expect(result2.data).toEqual({ data: 'success2' });
      expect(mockAxios.post).toHaveBeenCalledTimes(1);
      expect(storage['auth_token']).toBe('new-access-token');
      expect(storage['refresh_token']).toBe('new-refresh-token');
    });
  });
}); 