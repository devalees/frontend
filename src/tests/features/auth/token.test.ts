/**
 * Token Storage Utility Tests
 * 
 * Tests for secure token storage and refresh functionality
 */

import { describe, it, expect, beforeEach, afterEach } from '../../utils/testUtils';
import { jest } from '@jest/globals';
import { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig, AxiosHeaders, AxiosRequestHeaders } from 'axios';
import Cookies from 'js-cookie';
import * as tokenUtils from '../../../lib/features/auth/token';

// Mock js-cookie
jest.mock('js-cookie', () => ({
  __esModule: true,
  default: {
    set: jest.fn(),
    get: jest.fn(),
    remove: jest.fn()
  }
}));

// Mock localStorage
const mockLocalStorage: Record<string, string> = {};

// Mock axios headers
const mockHeaders = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer test-token'
} as unknown as AxiosRequestHeaders;

describe('Token Storage Utility', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key: string) => mockLocalStorage[key] || null),
        setItem: jest.fn((key: string, value: string) => { mockLocalStorage[key] = value; }),
        removeItem: jest.fn((key: string) => { delete mockLocalStorage[key]; }),
        clear: jest.fn(() => { Object.keys(mockLocalStorage).forEach(key => delete mockLocalStorage[key]); })
      },
      writable: true
    });
  });

  afterEach(() => {
    // Clear mocks
    Object.keys(mockLocalStorage).forEach(key => delete mockLocalStorage[key]);
  });

  describe('Token Storage', () => {
    it('should save tokens securely', () => {
      const tokens = {
        access: 'test-access-token',
        refresh: 'test-refresh-token'
      };
      
      tokenUtils.saveTokens(tokens);
      
      // Verify access token in localStorage
      expect(localStorage.setItem).toHaveBeenCalledWith('auth_access_token', tokens.access);
      expect(mockLocalStorage['auth_access_token']).toBe(tokens.access);
      
      // In our implementation, we also store refresh token in localStorage
      expect(localStorage.setItem).toHaveBeenCalledWith('auth_refresh_token', tokens.refresh);
      expect(mockLocalStorage['auth_refresh_token']).toBe(tokens.refresh);
      
      // Verify refresh token in cookie (we use both in our implementation)
      expect(Cookies.set).toHaveBeenCalledWith(
        'auth_refresh_token',
        tokens.refresh,
        expect.objectContaining({
          expires: 7,
          sameSite: 'lax'
        })
      );
    });
    
    it('should retrieve tokens from storage', () => {
      // Setup
      mockLocalStorage['auth_access_token'] = 'stored-access-token';
      mockLocalStorage['auth_refresh_token'] = 'stored-refresh-token';
      (Cookies.get as jest.Mock).mockReturnValue(undefined); // Simulate no cookie
      
      // Test
      const tokens = tokenUtils.getTokens();
      
      // Verify
      expect(localStorage.getItem).toHaveBeenCalledWith('auth_access_token');
      expect(tokens).toEqual({
        access: 'stored-access-token',
        refresh: 'stored-refresh-token'
      });
    });
    
    it('should return null when tokens are not available', () => {
      // Setup - no tokens in storage
      mockLocalStorage['auth_access_token'] = '';
      mockLocalStorage['auth_refresh_token'] = '';
      (Cookies.get as jest.Mock).mockReturnValue(undefined);
      
      // Test
      const tokens = tokenUtils.getTokens();
      
      // Verify
      expect(tokens).toBeNull();
    });
    
    it('should clear tokens from storage', () => {
      // Setup
      mockLocalStorage['auth_access_token'] = 'test-access-token';
      mockLocalStorage['auth_refresh_token'] = 'test-refresh-token';
      
      // Test
      tokenUtils.clearTokens();
      
      // Verify
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_access_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_refresh_token');
      expect(Cookies.remove).toHaveBeenCalledWith('auth_refresh_token');
      expect(mockLocalStorage['auth_access_token']).toBeUndefined();
      expect(mockLocalStorage['auth_refresh_token']).toBeUndefined();
    });
  });

  describe('Token Expiration', () => {
    it('should correctly identify expired tokens', () => {
      // Create an expired token (exp: 1 hour ago)
      const expiredToken = createTestToken(Date.now() - 3600000);
      
      expect(tokenUtils.isTokenExpired(expiredToken)).toBe(true);
    });
    
    it('should correctly identify valid tokens', () => {
      // Create a valid token (exp: 1 hour from now)
      const validToken = createTestToken(Date.now() + 3600000);
      
      expect(tokenUtils.isTokenExpired(validToken)).toBe(false);
    });
    
    it('should handle invalid token format', () => {
      expect(tokenUtils.isTokenExpired('invalid-token')).toBe(true);
    });
  });

  describe('Token Refresh', () => {
    let mockAxios: AxiosInstance;
    
    beforeEach(() => {
      mockAxios = {
        post: jest.fn(),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        },
        defaults: {
          headers: {
            common: {}
          }
        }
      } as unknown as AxiosInstance;
    });
    
    it('should refresh tokens successfully', async () => {
      // Setup
      const newTokens = {
        access: 'new-access-token',
        refresh: 'new-refresh-token'
      };
      
      // Mock getRefreshToken to return a token
      mockLocalStorage['auth_refresh_token'] = 'old-refresh-token';
      (Cookies.get as jest.Mock).mockReturnValue(undefined);
      
      const mockConfig = {
        headers: mockHeaders,
        method: 'post',
        url: '/auth/refresh',
        data: undefined,
        baseURL: '',
        timeout: 0,
        withCredentials: false,
        xsrfCookieName: 'XSRF-TOKEN',
        xsrfHeaderName: 'X-XSRF-TOKEN',
        maxContentLength: -1,
        maxBodyLength: -1,
        validateStatus: () => true,
        transitional: {
          silentJSONParsing: true,
          forcedJSONParsing: true,
          clarifyTimeoutError: false
        }
      } as InternalAxiosRequestConfig;

      (mockAxios.post as jest.Mock<(...args: any[]) => Promise<AxiosResponse>>).mockResolvedValueOnce({ 
        data: newTokens,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: mockConfig
      });
      
      // Test
      const result = await tokenUtils.refreshTokens(mockAxios);
      
      // Verify
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/api/v1/users/refresh-token/',
        { refresh: 'old-refresh-token' }
      );
      expect(result).toEqual(newTokens);
      expect(localStorage.setItem).toHaveBeenCalledWith('auth_access_token', newTokens.access);
      expect(localStorage.setItem).toHaveBeenCalledWith('auth_refresh_token', newTokens.refresh);
    });
    
    it('should handle refresh token failure', async () => {
      // Setup
      mockLocalStorage['auth_refresh_token'] = 'invalid-refresh-token';
      (Cookies.get as jest.Mock).mockReturnValue(undefined);
      
      (mockAxios.post as jest.Mock<(...args: any[]) => Promise<never>>).mockRejectedValueOnce({
        response: { status: 401 },
        message: 'Invalid token',
        name: 'AxiosError',
        config: {
          headers: mockHeaders
        } as AxiosRequestConfig,
        isAxiosError: true,
        toJSON: () => ({})
      } as AxiosError);
      
      // Test and verify
      try {
        await tokenUtils.refreshTokens(mockAxios);
        fail('Expected refreshTokens to throw an error');
      } catch (error: any) {
        expect(error.message).toBe('Invalid token');
        expect(localStorage.removeItem).toHaveBeenCalledWith('auth_access_token');
        expect(localStorage.removeItem).toHaveBeenCalledWith('auth_refresh_token');
        expect(Cookies.remove).toHaveBeenCalledWith('auth_refresh_token');
      }
    });
  });

  describe('Token Refresh Interceptor', () => {
    let mockAxios: AxiosInstance;
    
    beforeEach(() => {
      mockAxios = {
        post: jest.fn(),
        request: jest.fn(),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        },
        defaults: {
          headers: {
            common: {}
          }
        }
      } as unknown as AxiosInstance;
      
      // Mock getAccessToken
      mockLocalStorage['auth_access_token'] = 'test-token';
    });
    
    it('should setup request interceptor to attach token', () => {
      // Setup request interceptor
      let requestInterceptor: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig;
      (mockAxios.interceptors.request.use as jest.Mock).mockImplementation((interceptor) => {
        requestInterceptor = interceptor;
        return 0;
      });
      
      // Setup response interceptor
      (mockAxios.interceptors.response.use as jest.Mock).mockImplementation(() => 0);
      
      // Call the setup function
      tokenUtils.setupTokenRefresh(mockAxios);
      
      // Execute the request interceptor with a config
      const config = { headers: {} } as InternalAxiosRequestConfig;
      
      // Type assertion to handle the type error
      const requestHandler = (mockAxios.interceptors.request.use as jest.Mock).mock.calls[0][0] as (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig;
      requestHandler(config);
      
      // Verify
      expect(config.headers.Authorization).toBe('Bearer test-token');
    });
    
    it('should handle 401 errors and refresh token', async () => {
      // TODO: Implement this test if needed
    });
  });
});

// Helper function to create test JWT tokens
function createTestToken(expiryTime: number): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ exp: expiryTime / 1000 }));
  const signature = 'test-signature';
  
  return `${header}.${payload}.${signature}`;
} 