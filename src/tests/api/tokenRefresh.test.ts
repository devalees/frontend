/**
 * Token Refresh Mechanism Tests
 *
 * These tests verify the functionality of the automatic token refresh system
 * for handling expired JWT tokens and refreshing them transparently.
 */

import { describe, it, expect, beforeEach, afterEach } from '../../tests/utils';
import axios from 'axios';
import { setupTokenRefresh, clearTokens, getAccessToken, getRefreshToken, saveTokens } from '../../lib/api/tokenRefresh';

// Mock axios
jest.mock('axios', () => {
  const mockAxios = {
    create: jest.fn(() => mockAxios),
    get: jest.fn(),
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
  };
  return mockAxios;
});

// Mock localStorage
const mockLocalStorage: Record<string, string> = {};

beforeEach(() => {
  // Reset mocks before each test
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
  jest.clearAllMocks();
  Object.keys(mockLocalStorage).forEach(key => delete mockLocalStorage[key]);
});

describe('Token Storage and Management', () => {
  it('should save tokens to localStorage', () => {
    const tokens = {
      access: 'test-access-token',
      refresh: 'test-refresh-token'
    };
    
    saveTokens(tokens);
    
    expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', tokens.access);
    expect(localStorage.setItem).toHaveBeenCalledWith('refresh_token', tokens.refresh);
    expect(mockLocalStorage['auth_token']).toBe(tokens.access);
    expect(mockLocalStorage['refresh_token']).toBe(tokens.refresh);
  });
  
  it('should retrieve tokens from localStorage', () => {
    // Setup
    mockLocalStorage['auth_token'] = 'stored-access-token';
    mockLocalStorage['refresh_token'] = 'stored-refresh-token';
    
    // Test
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();
    
    // Verify
    expect(localStorage.getItem).toHaveBeenCalledWith('auth_token');
    expect(localStorage.getItem).toHaveBeenCalledWith('refresh_token');
    expect(accessToken).toBe('stored-access-token');
    expect(refreshToken).toBe('stored-refresh-token');
  });
  
  it('should clear tokens from localStorage', () => {
    // Setup
    mockLocalStorage['auth_token'] = 'test-access-token';
    mockLocalStorage['refresh_token'] = 'test-refresh-token';
    
    // Test
    clearTokens();
    
    // Verify
    expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
    expect(localStorage.removeItem).toHaveBeenCalledWith('refresh_token');
    expect(mockLocalStorage['auth_token']).toBeUndefined();
    expect(mockLocalStorage['refresh_token']).toBeUndefined();
  });
});

describe('Token Refresh Mechanism', () => {
  it('should intercept 401 errors and attempt to refresh token', async () => {
    // Setup
    mockLocalStorage['auth_token'] = 'expired-token';
    mockLocalStorage['refresh_token'] = 'valid-refresh-token';
    
    // Setup axios mocks
    const unauthorizedError = { 
      response: { status: 401 }, 
      config: { headers: {}, url: '/test' } 
    };
    
    // First request fails with 401
    (axios.get as jest.Mock).mockRejectedValueOnce(unauthorizedError);
    
    // Refresh token succeeds
    (axios.post as jest.Mock).mockResolvedValueOnce({ 
      data: { 
        access: 'new-access-token',
        refresh: 'new-refresh-token'
      }
    });
    
    // Mock the retry request to succeed
    (axios.request as jest.Mock).mockResolvedValueOnce({
      status: 200, 
      data: { data: 'success' }
    });
    
    // Configure token refresh
    setupTokenRefresh(axios);
    
    // Simulate axios interceptor by calling the response error handler directly
    const responseErrorHandler = (axios.interceptors.response.use as jest.Mock).mock.calls[0][1];
    const result = await responseErrorHandler(unauthorizedError);
    
    // Verify
    expect(result.status).toBe(200);
    expect(result.data).toEqual({ data: 'success' });
    expect(mockLocalStorage['auth_token']).toBe('new-access-token');
    expect(mockLocalStorage['refresh_token']).toBe('new-refresh-token');
  });
  
  it('should redirect to login when refresh token is invalid or expired', async () => {
    // Setup
    mockLocalStorage['auth_token'] = 'expired-token';
    mockLocalStorage['refresh_token'] = 'expired-refresh-token';
    
    // Mock window.location
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: '' }
    });
    
    // Setup axios mocks
    const unauthorizedError = { 
      response: { status: 401 }, 
      config: { headers: {}, url: '/test' } 
    };
    
    // First request fails with 401
    (axios.get as jest.Mock).mockRejectedValueOnce(unauthorizedError);
    
    // Refresh token also fails
    (axios.post as jest.Mock).mockRejectedValueOnce({ 
      response: { status: 401 } 
    });
    
    // Configure token refresh
    setupTokenRefresh(axios);
    
    // Simulate axios interceptor by calling the response error handler directly
    const responseErrorHandler = (axios.interceptors.response.use as jest.Mock).mock.calls[0][1];
    
    try {
      await responseErrorHandler(unauthorizedError);
      // Should not reach here
      expect(true).toBe(false);
    } catch (error) {
      // Verify
      expect(mockLocalStorage['auth_token']).toBeUndefined();
      expect(mockLocalStorage['refresh_token']).toBeUndefined();
      expect(window.location.href).toBe('/login');
    }
    
    // Restore window.location
    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation
    });
  });
  
  it('should not attempt to refresh for non-401 errors', async () => {
    // Setup
    mockLocalStorage['auth_token'] = 'valid-token';
    mockLocalStorage['refresh_token'] = 'valid-refresh-token';
    
    // Spy on the localStorage getItem and setItem methods
    const getItemSpy = jest.spyOn(localStorage, 'getItem');
    const setItemSpy = jest.spyOn(localStorage, 'setItem');
    
    // Setup axios mock with non-401 error
    const notFoundError = { 
      response: { status: 404 }, 
      config: { headers: {}, url: '/test' } 
    };
    
    // Request fails with 404
    (axios.get as jest.Mock).mockRejectedValueOnce(notFoundError);
    
    // Configure token refresh
    setupTokenRefresh(axios);
    
    // Simulate axios interceptor by calling the response error handler directly
    const responseErrorHandler = (axios.interceptors.response.use as jest.Mock).mock.calls[0][1];
    
    try {
      await responseErrorHandler(notFoundError);
      // Should not reach here
      expect(true).toBe(false);
    } catch (error) {
      // Verify that getRefreshToken was never called
      expect(getItemSpy).not.toHaveBeenCalledWith('refresh_token');
      // Verify that tokens were not updated
      expect(setItemSpy).not.toHaveBeenCalledWith('auth_token', expect.any(String));
      expect(setItemSpy).not.toHaveBeenCalledWith('refresh_token', expect.any(String));
    }
  });
  
  it('should retry the original request with the new token after refresh', async () => {
    // Setup
    mockLocalStorage['auth_token'] = 'expired-token';
    mockLocalStorage['refresh_token'] = 'valid-refresh-token';
    
    // Create a spy to track request headers
    const requestSpy = jest.fn();
    
    // Setup axios mocks
    const unauthorizedError = { 
      response: { status: 401 }, 
      config: { 
        headers: { Authorization: 'Bearer expired-token' }, 
        url: '/test',
        method: 'get' 
      } 
    };
    
    // Call the spy for the initial request
    requestSpy('Bearer expired-token');
    
    // First request fails with 401
    (axios.get as jest.Mock).mockImplementationOnce(() => {
      return Promise.reject(unauthorizedError);
    });
    
    // Refresh token succeeds
    (axios.post as jest.Mock).mockResolvedValueOnce({ 
      data: { 
        access: 'new-access-token',
        refresh: 'new-refresh-token'
      }
    });
    
    // Retry succeeds
    (axios.request as jest.Mock).mockImplementationOnce((config) => {
      requestSpy(config?.headers?.Authorization);
      return Promise.resolve({ status: 200, data: { data: 'success' } });
    });
    
    // Configure token refresh
    setupTokenRefresh(axios);
    
    // Simulate axios interceptor by calling the response error handler directly
    const responseErrorHandler = (axios.interceptors.response.use as jest.Mock).mock.calls[0][1];
    
    // Test
    const result = await responseErrorHandler(unauthorizedError);
    
    // Verify
    expect(result.status).toBe(200);
    expect(requestSpy).toHaveBeenCalledTimes(2);
    expect(requestSpy).toHaveBeenNthCalledWith(1, 'Bearer expired-token');
    expect(requestSpy).toHaveBeenNthCalledWith(2, 'Bearer new-access-token');
  });
  
  it('should allow parallel requests to be queued during token refresh', async () => {
    // Setup
    mockLocalStorage['auth_token'] = 'expired-token';
    mockLocalStorage['refresh_token'] = 'valid-refresh-token';
    
    // Setup axios mocks
    const unauthorizedError1 = { 
      response: { status: 401 }, 
      config: { headers: {}, url: '/test1', method: 'get' } 
    };
    
    const unauthorizedError2 = { 
      response: { status: 401 }, 
      config: { headers: {}, url: '/test2', method: 'get' } 
    };
    
    // First requests fail with 401
    (axios.get as jest.Mock).mockRejectedValueOnce(unauthorizedError1);
    (axios.get as jest.Mock).mockRejectedValueOnce(unauthorizedError2);
    
    // Refresh token succeeds
    (axios.post as jest.Mock).mockResolvedValueOnce({ 
      data: { 
        access: 'new-access-token',
        refresh: 'new-refresh-token'
      }
    });
    
    // Retries succeed
    (axios.request as jest.Mock)
      .mockResolvedValueOnce({ 
        status: 200, 
        data: { data: 'success1' } 
      })
      .mockResolvedValueOnce({ 
        status: 200, 
        data: { data: 'success2' } 
      });
    
    // Configure token refresh
    setupTokenRefresh(axios);
    
    // Simulate axios interceptor by calling the response error handler directly
    const responseErrorHandler = (axios.interceptors.response.use as jest.Mock).mock.calls[0][1];
    
    // Test two parallel requests
    const promise1 = responseErrorHandler(unauthorizedError1);
    const promise2 = responseErrorHandler(unauthorizedError2);
    
    const [result1, result2] = await Promise.all([promise1, promise2]);
    
    // Verify both requests succeeded with new token
    expect(result1.status).toBe(200);
    expect(result1.data).toEqual({ data: 'success1' });
    expect(result2.status).toBe(200);
    expect(result2.data).toEqual({ data: 'success2' });
    
    // Verify refresh token was only called once
    expect(axios.post).toHaveBeenCalledTimes(1);
  });
}); 