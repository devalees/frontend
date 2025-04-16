/**
 * Token Refresh Mechanism Tests
 *
 * These tests verify the functionality of the automatic token refresh system
 * for handling expired JWT tokens and refreshing them transparently.
 */

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { setupTokenRefresh, clearTokens, getAccessToken, getRefreshToken, saveTokens } from '../../lib/api/tokenRefresh';
import axiosInstance from '../../lib/api/axiosConfig';

// Mock axios and localStorage
const mock = new MockAdapter(axios);
const mockLocalStorage: Record<string, string> = {};

beforeEach(() => {
  // Reset mocks before each test
  mock.reset();
  
  // Mock localStorage
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn((key: string) => mockLocalStorage[key] || null),
      setItem: vi.fn((key: string, value: string) => { mockLocalStorage[key] = value; }),
      removeItem: vi.fn((key: string) => { delete mockLocalStorage[key]; }),
      clear: vi.fn(() => { Object.keys(mockLocalStorage).forEach(key => delete mockLocalStorage[key]); })
    },
    writable: true
  });
});

afterEach(() => {
  vi.clearAllMocks();
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
    
    // Set up our mocked endpoints
    mock.onGet('/test').replyOnce(401); // First request fails with 401
    mock.onPost('/auth/refresh').replyOnce(200, { 
      access: 'new-access-token',
      refresh: 'new-refresh-token'
    });
    mock.onGet('/test').replyOnce(200, { data: 'success' }); // Retry succeeds
    
    // Configure token refresh
    const instance = axios.create();
    setupTokenRefresh(instance);
    
    // Test
    const response = await instance.get('/test');
    
    // Verify
    expect(response.status).toBe(200);
    expect(response.data).toEqual({ data: 'success' });
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
    
    // Set up our mocked endpoints
    mock.onGet('/test').replyOnce(401); // Request fails with 401
    mock.onPost('/auth/refresh').replyOnce(401); // Refresh attempt also fails
    
    // Configure token refresh
    const instance = axios.create();
    setupTokenRefresh(instance);
    
    // Test
    try {
      await instance.get('/test');
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
    const getItemSpy = vi.spyOn(localStorage, 'getItem');
    const setItemSpy = vi.spyOn(localStorage, 'setItem');
    
    // Set up our mocked endpoints
    mock.onGet('/test').replyOnce(404); // Not found error
    
    // Configure token refresh
    const instance = axios.create();
    setupTokenRefresh(instance);
    
    // Test
    try {
      await instance.get('/test');
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
    const requestSpy = vi.fn();
    
    // Set up our mocked endpoints
    mock.onGet('/test').replyOnce((config: any) => {
      requestSpy(config.headers?.Authorization);
      return [401]; // First request fails with 401
    });
    mock.onPost('/auth/refresh').replyOnce(200, { 
      access: 'new-access-token',
      refresh: 'new-refresh-token'
    });
    mock.onGet('/test').replyOnce((config: any) => {
      requestSpy(config.headers?.Authorization);
      return [200, { data: 'success' }]; // Retry succeeds
    });
    
    // Configure token refresh
    const instance = axios.create();
    setupTokenRefresh(instance);
    
    // Test
    const response = await instance.get('/test');
    
    // Verify
    expect(response.status).toBe(200);
    expect(response.data).toEqual({ data: 'success' });
    expect(requestSpy).toHaveBeenNthCalledWith(1, 'Token expired-token');
    expect(requestSpy).toHaveBeenNthCalledWith(2, 'Token new-access-token');
  });
  
  it('should allow parallel requests to be queued during token refresh', async () => {
    // Setup
    mockLocalStorage['auth_token'] = 'expired-token';
    mockLocalStorage['refresh_token'] = 'valid-refresh-token';
    
    // Set up our mocked endpoints
    mock.onGet('/test1').replyOnce(401); // First request fails with 401
    mock.onGet('/test2').replyOnce(401); // Second request also fails with 401
    
    // Refresh endpoint should only be called once
    let refreshCalled = 0;
    mock.onPost('/auth/refresh').reply(() => {
      refreshCalled++;
      return [200, { 
        access: 'new-access-token',
        refresh: 'new-refresh-token'
      }];
    });
    
    // Subsequent requests succeed
    mock.onGet('/test1').replyOnce(200, { data: 'success1' });
    mock.onGet('/test2').replyOnce(200, { data: 'success2' });
    
    // Configure token refresh
    const instance = axios.create();
    setupTokenRefresh(instance);
    
    // Test - make parallel requests
    const [response1, response2] = await Promise.all([
      instance.get('/test1'),
      instance.get('/test2')
    ]);
    
    // Verify
    expect(refreshCalled).toBe(1); // Only one refresh call should happen
    expect(response1.status).toBe(200);
    expect(response1.data).toEqual({ data: 'success1' });
    expect(response2.status).toBe(200);
    expect(response2.data).toEqual({ data: 'success2' });
    expect(mockLocalStorage['auth_token']).toBe('new-access-token');
  });
}); 