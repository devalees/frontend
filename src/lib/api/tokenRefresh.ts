/**
 * Token Refresh Mechanism
 * 
 * This module handles JWT token refresh functionality:
 * - Detects expired tokens from 401 responses
 * - Automatically refreshes tokens using refresh token
 * - Retries failed requests with new token
 * - Manages token storage and retrieval
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Token storage keys
const ACCESS_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Auth endpoints
const REFRESH_TOKEN_URL = '/auth/refresh';
const LOGIN_PAGE = '/login';

/**
 * Token pair interface
 */
export interface TokenPair {
  access: string;
  refresh: string;
}

/**
 * Get access token from localStorage
 * @returns Access token or null if not found
 */
export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * Get refresh token from localStorage
 * @returns Refresh token or null if not found
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Save tokens to localStorage
 * @param tokens - Token pair containing access and refresh tokens
 */
export function saveTokens(tokens: TokenPair): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
}

/**
 * Clear all tokens from localStorage
 */
export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * Check if a response indicates an expired token
 * @param error - Axios error
 * @returns True if token is expired
 */
function isTokenExpiredError(error: AxiosError): boolean {
  return error.response?.status === 401;
}

// Flag to track if token refresh is in progress
let isRefreshing = false;

// Queue of failed requests to retry after token refresh
let refreshSubscribers: Array<(token: string) => void> = [];

/**
 * Subscribe to token refresh
 * @param callback - Function to call when token is refreshed
 */
function subscribeTokenRefresh(callback: (token: string) => void): void {
  refreshSubscribers.push(callback);
}

/**
 * Notify all subscribers that token has been refreshed
 * @param token - New access token
 */
function onTokenRefreshed(token: string): void {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
}

/**
 * Reject all subscribers if token refresh fails
 * @param error - Error that caused refresh to fail
 */
function onTokenRefreshFailed(error: any): void {
  refreshSubscribers.forEach(callback => callback(''));
  refreshSubscribers = [];
  
  // Clear tokens and redirect to login
  clearTokens();
  window.location.href = LOGIN_PAGE;
}

/**
 * Refresh tokens using refresh token
 * @returns Promise resolving to new tokens
 */
export async function refreshTokens(): Promise<TokenPair> {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  
  try {
    const response = await axios.post<TokenPair>(REFRESH_TOKEN_URL, { refresh_token: refreshToken });
    const newTokens = response.data;
    saveTokens(newTokens);
    return newTokens;
  } catch (error) {
    clearTokens();
    throw error;
  }
}

/**
 * Set up token refresh mechanism for an axios instance
 * @param instance - Axios instance to configure
 */
export function setupTokenRefresh(instance: AxiosInstance): void {
  // Add request interceptor to add token to requests
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getAccessToken();
      
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Token ${token}`;
      }
      
      return config;
    },
    (error: AxiosError) => Promise.reject(error)
  );
  
  // Add response interceptor to handle token expiration
  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      // Get original request
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
      
      // Only process if error indicates token expiration and request hasn't been retried
      if (isTokenExpiredError(error) && !originalRequest._retry) {
        // If refresh is already in progress, queue this request
        if (isRefreshing) {
          return new Promise<AxiosResponse>((resolve, reject) => {
            subscribeTokenRefresh((token: string) => {
              if (token) {
                // Replace old token with new token
                originalRequest.headers.Authorization = `Token ${token}`;
                // Retry the request
                resolve(instance(originalRequest));
              } else {
                // Token refresh failed
                reject(error);
              }
            });
          });
        }
        
        // Start token refresh
        originalRequest._retry = true;
        isRefreshing = true;
        
        try {
          // Attempt token refresh
          const newTokens = await refreshTokens();
          // Notify all subscribers of new token
          onTokenRefreshed(newTokens.access);
          // Update request with new token
          originalRequest.headers.Authorization = `Token ${newTokens.access}`;
          // Reset refreshing flag
          isRefreshing = false;
          // Retry the request with new token
          return instance(originalRequest);
        } catch (refreshError) {
          // Handle token refresh failure
          isRefreshing = false;
          onTokenRefreshFailed(refreshError);
          return Promise.reject(error);
        }
      }
      
      // For other errors, pass through
      return Promise.reject(error);
    }
  );
} 