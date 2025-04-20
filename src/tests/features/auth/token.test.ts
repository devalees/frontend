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

// Mock sessionStorage
const mockSessionStorage: Record<string, string> = {};

// Mock axios headers
const mockHeaders = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer test-token'
} as unknown as AxiosRequestHeaders;

describe('Token Storage Utility', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn((key: string) => mockSessionStorage[key] || null),
        setItem: jest.fn((key: string, value: string) => { mockSessionStorage[key] = value; }),
        removeItem: jest.fn((key: string) => { delete mockSessionStorage[key]; }),
        clear: jest.fn(() => { Object.keys(mockSessionStorage).forEach(key => delete mockSessionStorage[key]); })
      },
      writable: true
    });
  });

  afterEach(() => {
    // Clear mocks
    Object.keys(mockSessionStorage).forEach(key => delete mockSessionStorage[key]);
  });

  describe('Token Storage', () => {
    it('should save tokens securely', () => {
      const tokens = {
        access: 'test-access-token',
        refresh: 'test-refresh-token'
      };
      
      tokenUtils.saveTokens(tokens);
      
      // Verify access token in sessionStorage
      expect(sessionStorage.setItem).toHaveBeenCalledWith('auth_access_token', tokens.access);
      expect(mockSessionStorage['auth_access_token']).toBe(tokens.access);
      
      // Verify refresh token in cookie
      expect(Cookies.set).toHaveBeenCalledWith(
        'auth_refresh_token',
        tokens.refresh,
        expect.objectContaining({
          expires: 7,
          secure: true,
          sameSite: 'strict'
        })
      );
    });
    
    it('should retrieve tokens from storage', () => {
      // Setup
      mockSessionStorage['auth_access_token'] = 'stored-access-token';
      (Cookies.get as jest.Mock).mockReturnValue('stored-refresh-token');
      
      // Test
      const tokens = tokenUtils.getTokens();
      
      // Verify
      expect(sessionStorage.getItem).toHaveBeenCalledWith('auth_access_token');
      expect(Cookies.get).toHaveBeenCalledWith('auth_refresh_token');
      expect(tokens).toEqual({
        access: 'stored-access-token',
        refresh: 'stored-refresh-token'
      });
    });
    
    it('should return null when tokens are not available', () => {
      // Setup - no tokens in storage
      mockSessionStorage['auth_access_token'] = '';
      (Cookies.get as jest.Mock).mockReturnValue(undefined);
      
      // Test
      const tokens = tokenUtils.getTokens();
      
      // Verify
      expect(tokens).toBeNull();
    });
    
    it('should clear tokens from storage', () => {
      // Setup
      mockSessionStorage['auth_access_token'] = 'test-access-token';
      
      // Test
      tokenUtils.clearTokens();
      
      // Verify
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('auth_access_token');
      expect(Cookies.remove).toHaveBeenCalledWith('auth_refresh_token');
      expect(mockSessionStorage['auth_access_token']).toBeUndefined();
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
      
      (Cookies.get as jest.Mock).mockReturnValue('old-refresh-token');
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
      expect(sessionStorage.setItem).toHaveBeenCalledWith('auth_access_token', newTokens.access);
      expect(Cookies.set).toHaveBeenCalledWith(
        'auth_refresh_token',
        newTokens.refresh,
        expect.any(Object)
      );
    });
    
    it('should handle refresh token failure', async () => {
      // Setup
      (Cookies.get as jest.Mock).mockReturnValue('invalid-refresh-token');
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
        expect(sessionStorage.removeItem).toHaveBeenCalledWith('auth_access_token');
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
    });
    
    it('should setup request interceptor to attach token', () => {
      // Setup
      mockSessionStorage['auth_access_token'] = 'test-token';
      
      // Test
      tokenUtils.setupTokenRefresh(mockAxios);
      
      // Get the request interceptor
      const requestInterceptor = (mockAxios.interceptors.request.use as jest.Mock).mock.calls[0][0] as (config: AxiosRequestConfig) => AxiosRequestConfig;
      
      // Test the interceptor
      const config = { headers: {} as Record<string, string> };
      requestInterceptor(config);
      
      // Verify
      expect(config.headers.Authorization).toBe('Bearer test-token');
    });
    
    it('should handle 401 errors and refresh token', async () => {
      // Setup
      const newTokens = {
        access: 'new-access-token',
        refresh: 'new-refresh-token'
      };
      
      mockSessionStorage['auth_access_token'] = 'expired-token';
      (Cookies.get as jest.Mock).mockReturnValue('valid-refresh-token');
      
      const unauthorizedError = {
        response: { status: 401 },
        config: { headers: mockHeaders, url: '/test' },
        message: 'Unauthorized',
        name: 'AxiosError',
        isAxiosError: true,
        toJSON: () => ({})
      } as AxiosError;
      
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
      
      const requestConfig = {
        headers: mockHeaders,
        method: 'get',
        url: '/test',
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

      (mockAxios.request as jest.Mock<(...args: any[]) => Promise<AxiosResponse>>).mockResolvedValueOnce({ 
        data: 'success',
        status: 200,
        statusText: 'OK',
        headers: {},
        config: requestConfig
      });
      
      // Test
      tokenUtils.setupTokenRefresh(mockAxios);
      
      // Get the response interceptor
      const responseInterceptor = (mockAxios.interceptors.response.use as jest.Mock).mock.calls[0][1] as (error: AxiosError) => Promise<AxiosResponse>;
      
      // Test the interceptor
      const result = await responseInterceptor(unauthorizedError);
      
      // Verify
      expect(result.data).toBe('success');
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/api/v1/users/refresh-token/',
        { refresh: 'valid-refresh-token' }
      );
      expect(mockAxios.request).toHaveBeenCalledWith(expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer new-access-token'
        })
      }));
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