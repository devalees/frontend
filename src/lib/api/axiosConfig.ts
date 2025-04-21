/**
 * Axios Configuration
 * 
 * This file contains the configuration for the Axios client including:
 * - Instance creation
 * - Base configuration
 * - Interceptors
 * - Environment-based configuration
 */

import axios, { 
  AxiosInstance, 
  AxiosRequestConfig, 
  AxiosResponse, 
  AxiosHeaderValue,
  HeadersDefaults,
  AxiosHeaders
} from 'axios';
import * as tokenRefresh from './tokenRefresh';

// Environment variable keys
const ENV_API_URL = 'NEXT_PUBLIC_API_URL';
const ENV_API_TIMEOUT = 'NEXT_PUBLIC_API_TIMEOUT';

// Default configuration
const DEFAULT_TIMEOUT = 10000;
const DEFAULT_BASE_URL = 'http://localhost:8000/api/';

// Extended axios request config with retry options
interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  retry?: boolean;
  retryDelay?: number;
  maxRetries?: number;
  debug?: boolean;
  validateStatus?: (status: number) => boolean;
}

/**
 * Get configuration based on current environment
 * @returns Environment-specific configuration
 */
export function getEnvironmentConfig(): ExtendedAxiosRequestConfig {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isTest = process.env.NODE_ENV === 'test';
  
  // Base configuration
  const config: ExtendedAxiosRequestConfig = {
    baseURL: process.env[ENV_API_URL] || DEFAULT_BASE_URL,
    timeout: parseInt(process.env[ENV_API_TIMEOUT] || DEFAULT_TIMEOUT.toString(), 10),
    debug: isDevelopment || isTest,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  // Development-specific configuration
  if (isDevelopment) {
    config.validateStatus = (status: number) => status < 500;
  }
  
  // Production-specific configuration
  if (!isDevelopment && !isTest) {
    config.retry = true;
    config.retryDelay = 1000;
    config.maxRetries = 3;
  }
  
  // Test-specific configuration
  if (isTest) {
    // Keep default timeout for tests to match test expectations
    config.timeout = DEFAULT_TIMEOUT;
    
    // Only override timeout if explicitly set in environment for tests
    if (process.env[ENV_API_TIMEOUT]) {
      config.timeout = parseInt(process.env[ENV_API_TIMEOUT], 10);
    }
  }
  
  return config;
}

/**
 * Creates an axios instance with the specified configuration
 * @param baseURL - The base URL for the API
 * @param options - Additional axios configuration options
 * @returns An axios instance
 */
export const createAxiosInstance = (
  baseURL?: string, 
  options?: AxiosRequestConfig
): AxiosInstance => {
  // Get environment configuration
  const envConfig = getEnvironmentConfig();
  
  // Build configuration with priority:
  // 1. Explicit options passed to function
  // 2. Environment variables
  // 3. Default values
  const config: AxiosRequestConfig = {
    baseURL: baseURL || envConfig.baseURL,
    timeout: envConfig.timeout,
    headers: envConfig.headers,
    ...options
  };
  
  // Check if we're in a test environment or if axios.create is not available
  if (process.env.NODE_ENV === 'test' && typeof axios.create !== 'function') {
    console.warn('axios.create is not a function, using default axios instance');
    
    // Initialize defaults if they don't exist
    if (!axios.defaults) {
      axios.defaults = {
        headers: {
          common: { 'Content-Type': 'application/json' },
          delete: {},
          get: {},
          head: {},
          post: {},
          put: {},
          patch: {}
        } as HeadersDefaults & { [key: string]: AxiosHeaderValue }
      } as any;
    }
    
    if (!axios.defaults.headers) {
      axios.defaults.headers = {
        common: { 'Content-Type': 'application/json' },
        delete: {},
        get: {},
        head: {},
        post: {},
        put: {},
        patch: {}
      } as HeadersDefaults & { [key: string]: AxiosHeaderValue };
    }
    
    if (!axios.defaults.headers.common) {
      axios.defaults.headers.common = { 'Content-Type': 'application/json' };
    }
    
    // Apply configuration to defaults
    axios.defaults.baseURL = config.baseURL;
    axios.defaults.timeout = config.timeout;
    
    if (config.headers) {
      Object.entries(config.headers).forEach(([key, value]) => {
        if (axios.defaults.headers && axios.defaults.headers.common) {
          axios.defaults.headers.common[key] = value as AxiosHeaderValue;
        }
      });
    }
    
    return axios;
  }
  
  return axios.create(config);
};

/**
 * Configures default settings for all axios requests
 */
export const configureAxiosDefaults = (): void => {
  const envConfig = getEnvironmentConfig();
  
  // Initialize defaults if they don't exist
  if (!axios.defaults) {
    axios.defaults = {
      headers: {
        common: { 'Content-Type': 'application/json' },
        delete: {},
        get: {},
        head: {},
        post: {},
        put: {},
        patch: {}
      } as HeadersDefaults & { [key: string]: AxiosHeaderValue }
    } as any;
  }
  
  if (!axios.defaults.headers) {
    axios.defaults.headers = {
      common: { 'Content-Type': 'application/json' },
      delete: {},
      get: {},
      head: {},
      post: {},
      put: {},
      patch: {}
    } as HeadersDefaults & { [key: string]: AxiosHeaderValue };
  }
  
  if (!axios.defaults.headers.common) {
    axios.defaults.headers.common = { 'Content-Type': 'application/json' };
  }
  
  axios.defaults.headers.common['Content-Type'] = 'application/json';
  axios.defaults.timeout = envConfig.timeout;
  
  // Add additional headers from environment config
  if (envConfig.headers) {
    Object.entries(envConfig.headers).forEach(([key, value]) => {
      if (key !== 'Content-Type') { // Already set above
        axios.defaults.headers.common[key] = value as AxiosHeaderValue;
      }
    });
  }
};

/**
 * Sets up interceptors for the axios instance
 * @param instance - The axios instance to configure
 */
export const setupInterceptors = (instance: AxiosInstance): void => {
  // Skip interceptor setup if interceptors are not available
  if (!instance.interceptors || !instance.interceptors.request || !instance.interceptors.response) {
    console.warn('Axios interceptors not available, skipping interceptor setup');
    return;
  }
  
  // Request interceptor for authentication
  instance.interceptors.request.use(
    (config) => {
      const token = tokenRefresh.getAccessToken();
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Added Authorization header to request:', config.url);
      } else {
        console.warn('No token available for request:', config.url);
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  
  // Response interceptor for error handling
  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error) => {
      const originalRequest = error.config;
      
      // If error is 401 and we haven't tried to refresh token yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          const refreshToken = tokenRefresh.getRefreshToken();
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }
          
          await tokenRefresh.refreshTokens();
          
          // Retry the original request
          return instance(originalRequest);
        } catch (refreshError) {
          // Clear tokens and redirect to login on refresh failure
          tokenRefresh.clearTokens();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        }
      }
      
      // Handle other error status codes
      if (error.response) {
        const { status, data } = error.response;
        
        // Handle 403 Forbidden errors
        if (status === 403) {
          console.error('Permission denied:', data);
        }
        
        // Handle 404 Not Found errors
        if (status === 404) {
          console.error('Resource not found:', data);
        }
        
        // Handle 500 Internal Server errors
        if (status === 500) {
          console.error('Server error:', data);
        }
      }
      
      // For network errors or other issues
      if (error.request) {
        console.error('Network error:', error.message);
      } else {
        console.error('Error:', error.message);
      }
      
      return Promise.reject(error);
    }
  );
};

// Create a default instance with environment config
const axiosInstance = createAxiosInstance();

// Configure defaults
configureAxiosDefaults();

// Set up interceptors
setupInterceptors(axiosInstance);

export default axiosInstance; 