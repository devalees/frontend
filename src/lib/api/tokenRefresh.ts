/**
 * Token Refresh Utility
 * 
 * This file handles:
 * - Token storage and retrieval
 * - Token refresh operations
 * - Token expiration checks
 */

import axios, { AxiosInstance } from 'axios';

interface Tokens {
  access: string;
  refresh: string;
}

// Save tokens to localStorage
export const saveTokens = (tokens: Tokens): void => {
  localStorage.setItem('auth_token', tokens.access);
  localStorage.setItem('refresh_token', tokens.refresh);
};

// Get tokens from localStorage
export const getTokens = (): Tokens | null => {
  const access = localStorage.getItem('auth_token');
  const refresh = localStorage.getItem('refresh_token');
  
  if (!access || !refresh) {
    return null;
  }
  
  return { access, refresh };
};

// Get access token from localStorage
export const getAccessToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Get refresh token from localStorage
export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refresh_token');
};

// Clear tokens from localStorage
export const clearTokens = (): void => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
};

// Setup token refresh interceptor
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

  instance.interceptors.response.use(
    response => response,
    async error => {
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
          const tokens = getTokens();
          if (!tokens?.refresh) {
            throw new Error('No refresh token available');
          }

          const response = await instance.post('/api/v1/users/refresh-token/', {
            refresh: tokens.refresh
          });

          const newTokens = response.data;
          saveTokens(newTokens);

          // Update Authorization header
          instance.defaults.headers.common['Authorization'] = `Bearer ${newTokens.access}`;
          originalRequest.headers['Authorization'] = `Bearer ${newTokens.access}`;

          processQueue();
          return instance.request(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError);
          clearTokens();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
};

// Check if token is expired
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

// Refresh token function
export const refreshTokens = async (instance: AxiosInstance = axios): Promise<Tokens> => {
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