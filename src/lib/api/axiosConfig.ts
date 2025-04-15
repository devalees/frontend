/**
 * Axios Configuration
 * 
 * This file contains the configuration for the Axios client including:
 * - Instance creation
 * - Base configuration
 * - Interceptors
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Default configuration
const DEFAULT_TIMEOUT = 10000;
const DEFAULT_BASE_URL = 'http://localhost:8000/api/';

/**
 * Creates an axios instance with the specified configuration
 * @param baseURL - The base URL for the API
 * @returns An axios instance
 */
export const createAxiosInstance = (baseURL: string = DEFAULT_BASE_URL): AxiosInstance => {
  return axios.create({
    baseURL,
    timeout: DEFAULT_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

/**
 * Configures default settings for all axios requests
 */
export const configureAxiosDefaults = (): void => {
  axios.defaults.headers.common['Content-Type'] = 'application/json';
  axios.defaults.timeout = DEFAULT_TIMEOUT;
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
      
      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
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

// Create a default instance
const axiosInstance = createAxiosInstance();

// Configure defaults
configureAxiosDefaults();

// Set up interceptors
setupInterceptors(axiosInstance);

export default axiosInstance; 