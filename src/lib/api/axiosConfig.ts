/**
 * Axios Configuration
 * 
 * This file contains the configuration for the Axios client including:
 * - Instance creation
 * - Base configuration
 * - Interceptors
 * - Environment-based configuration
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Environment variable keys
const ENV_API_URL = 'NEXT_PUBLIC_API_URL';
const ENV_API_TIMEOUT = 'NEXT_PUBLIC_API_TIMEOUT';

// Default configuration
const DEFAULT_TIMEOUT = 10000;
const DEFAULT_BASE_URL = 'http://localhost:8000/api/';

/**
 * Environment-specific configuration interface
 */
export interface EnvironmentConfig {
  baseURL: string;
  timeout: number;
  debug: boolean;
  headers?: Record<string, string>;
  [key: string]: any;
}

/**
 * Get configuration based on current environment
 * @returns Environment-specific configuration
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isTest = process.env.NODE_ENV === 'test';
  
  // Base configuration
  const config: EnvironmentConfig = {
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
  options?: Partial<AxiosRequestConfig>
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
  
  return axios.create(config);
};

/**
 * Configures default settings for all axios requests
 */
export const configureAxiosDefaults = (): void => {
  const envConfig = getEnvironmentConfig();
  
  axios.defaults.headers.common['Content-Type'] = 'application/json';
  axios.defaults.timeout = envConfig.timeout;
  
  // Add additional headers from environment config
  if (envConfig.headers) {
    Object.entries(envConfig.headers).forEach(([key, value]) => {
      if (key !== 'Content-Type') { // Already set above
        axios.defaults.headers.common[key] = value;
      }
    });
  }
};

/**
 * Sets up interceptors for the axios instance
 * @param instance - The axios instance to configure
 */
export const setupInterceptors = (instance: AxiosInstance): void => {
  // Request interceptor for authentication
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Get the token from localStorage
      const token = localStorage.getItem('auth_token');
      
      // If token exists, add it to the Authorization header
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Token ${token}`;
      }
      
      // Add request logging in debug mode
      const envConfig = getEnvironmentConfig();
      if (envConfig.debug) {
        console.debug('Request:', config.method?.toUpperCase(), config.url);
      }
      
      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      // Add response logging in debug mode
      const envConfig = getEnvironmentConfig();
      if (envConfig.debug) {
        console.debug('Response:', response.status, response.config.url);
      }
      
      return response;
    },
    (error: AxiosError) => {
      // Handle specific error cases
      if (error.response) {
        const { status, data } = error.response;
        
        // Handle 401 Unauthorized errors (token expired or invalid)
        if (status === 401) {
          // Clear the token and redirect to login
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        
        // Handle 403 Forbidden errors
        if (status === 403) {
          // Handle permission denied
          console.error('Permission denied:', data);
        }
        
        // Handle 404 Not Found errors
        if (status === 404) {
          // Handle resource not found
          console.error('Resource not found:', data);
        }
        
        // Handle 500 Internal Server errors
        if (status === 500) {
          // Handle server errors
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