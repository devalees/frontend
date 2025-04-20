/**
 * Token Storage Utility
 * 
 * This module handles:
 * - Secure token storage in localStorage/cookies
 * - Token refresh operations
 * - Token expiration checks
 * - API request header management
 */

import { AxiosInstance } from 'axios';
import Cookies from 'js-cookie';

// Constants
const ACCESS_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const TOKEN_EXPIRY_DAYS = 7; // Refresh token expiry in days

// Types
export interface AuthTokens {
  access: string;
  refresh: string;
}

/**
 * Check if code is running in browser environment
 */
const isBrowser = (): boolean => {
  return typeof window !== 'undefined';
};

/**
 * Save tokens securely
 * - In development: both tokens in localStorage for simplicity
 * - In production: Access token in localStorage, refresh token in HTTP-only cookie
 */
export const saveTokens = (tokens: AuthTokens): void => {
  if (!isBrowser()) return;

  console.log('Saving tokens:', !!tokens.access, !!tokens.refresh);
  
  // Store access token in localStorage
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access);
  
  // For development simplicity, also store refresh token in localStorage
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
  
  // Also store tokens in cookies for middleware access
  try {
    const isSecure = window.location.protocol === 'https:';
    
    // Set access token in a cookie that middleware can read
    Cookies.set(ACCESS_TOKEN_KEY, tokens.access, {
      expires: TOKEN_EXPIRY_DAYS,
      secure: isSecure,
      sameSite: 'lax',
      path: '/'
    });
    
    // Set refresh token in a cookie
    Cookies.set(REFRESH_TOKEN_KEY, tokens.refresh, {
      expires: TOKEN_EXPIRY_DAYS,
      secure: isSecure,
      sameSite: 'lax',
      path: '/'
    });
    
    // Also set cookies directly for maximum compatibility
    const expiryDate = new Date(Date.now() + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    document.cookie = `${ACCESS_TOKEN_KEY}=${tokens.access}; expires=${expiryDate.toUTCString()}; path=/; ${isSecure ? 'secure; ' : ''}samesite=lax`;
    document.cookie = `${REFRESH_TOKEN_KEY}=${tokens.refresh}; expires=${expiryDate.toUTCString()}; path=/; ${isSecure ? 'secure; ' : ''}samesite=lax`;
    
    console.log('Tokens set in both localStorage and cookies');
  } catch (error) {
    console.warn('Failed to set cookies, falling back to localStorage only:', error);
  }
};

/**
 * Get tokens from storage
 * Returns null if tokens are not available
 */
export const getTokens = (): AuthTokens | null => {
  if (!isBrowser()) return null;

  const access = localStorage.getItem(ACCESS_TOKEN_KEY);
  // Try to get refresh token from cookie first, then fallback to localStorage
  let refresh = Cookies.get(REFRESH_TOKEN_KEY);
  
  // Fallback to localStorage if cookie is not available
  if (!refresh) {
    refresh = localStorage.getItem(REFRESH_TOKEN_KEY) || undefined;
  }
  
  if (!access || !refresh) {
    return null;
  }
  
  return { access, refresh };
};

/**
 * Get access token from localStorage
 */
export const getAccessToken = (): string | null => {
  if (!isBrowser()) return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Get refresh token from cookie or localStorage
 */
export const getRefreshToken = (): string | null => {
  if (!isBrowser()) return null;
  const token = Cookies.get(REFRESH_TOKEN_KEY) || localStorage.getItem(REFRESH_TOKEN_KEY);
  return token || null;
};

/**
 * Clear tokens from storage
 */
export const clearTokens = (): void => {
  if (!isBrowser()) return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_KEY);
};

/**
 * Check if a token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

/**
 * Refresh tokens using the refresh token
 */
export const refreshTokens = async (instance: AxiosInstance): Promise<AuthTokens> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await instance.post('/api/v1/users/refresh-token/', {
      refresh: refreshToken
    });

    const newTokens = response.data;
    saveTokens(newTokens);
    return newTokens;
  } catch (error) {
    clearTokens();
    throw error;
  }
};

/**
 * Setup token refresh interceptor for axios instance
 */
export const setupTokenRefresh = (instance: AxiosInstance): void => {
  if (!isBrowser()) return;
  
  let isRefreshing = false;
  let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: any) => void;
  }> = [];

  const processQueue = (error: any = null) => {
    failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve();
      }
    });
    
    failedQueue = [];
  };

  // Add request interceptor to attach token
  instance.interceptors.request.use(
    (config) => {
      const token = getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Add response interceptor to handle token refresh
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => instance.request(originalRequest))
            .catch(err => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const tokens = await refreshTokens(instance);
          
          // Update Authorization header
          instance.defaults.headers.common['Authorization'] = `Bearer ${tokens.access}`;
          originalRequest.headers['Authorization'] = `Bearer ${tokens.access}`;

          processQueue();
          return instance.request(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError);
          clearTokens();
          if (isBrowser()) {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
}; 