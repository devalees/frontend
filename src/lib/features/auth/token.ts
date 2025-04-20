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
 * Save tokens securely
 * - Access token in memory (cleared on page refresh)
 * - Refresh token in HTTP-only cookie
 */
export const saveTokens = (tokens: AuthTokens): void => {
  // Store access token in memory
  sessionStorage.setItem(ACCESS_TOKEN_KEY, tokens.access);
  
  // Store refresh token in HTTP-only cookie
  Cookies.set(REFRESH_TOKEN_KEY, tokens.refresh, {
    expires: TOKEN_EXPIRY_DAYS,
    secure: true,
    sameSite: 'strict'
  });
};

/**
 * Get tokens from storage
 * Returns null if tokens are not available
 */
export const getTokens = (): AuthTokens | null => {
  const access = sessionStorage.getItem(ACCESS_TOKEN_KEY);
  const refresh = Cookies.get(REFRESH_TOKEN_KEY);
  
  if (!access || !refresh) {
    return null;
  }
  
  return { access, refresh };
};

/**
 * Get access token from memory
 */
export const getAccessToken = (): string | null => {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Get refresh token from cookie
 */
export const getRefreshToken = (): string | null => {
  return Cookies.get(REFRESH_TOKEN_KEY);
};

/**
 * Clear tokens from storage
 */
export const clearTokens = (): void => {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
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
          if (typeof window !== 'undefined') {
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