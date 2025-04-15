/**
 * Request Builders
 * 
 * This file contains utilities for building API requests, including:
 * - Request creation functions
 * - URL parameter handling
 * - Input validation
 */

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

// HTTP method enum used by the request builder
export enum RequestMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE'
}

// Configuration interface for creating requests
export interface RequestConfig {
  method: RequestMethod;
  endpoint: string;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
  withCredentials?: boolean;
}

// Type for parameter validation formats
export interface ParamFormatConfig {
  type: string;
  format: string;
}

// Type for parameter formats configuration
export interface ParamFormatsConfig {
  [key: string]: ParamFormatConfig;
}

/**
 * Creates an API request function based on configuration
 * 
 * @param config Request configuration
 * @returns A function that executes the request
 */
export function createRequest<ResponseType = any, RequestDataType = any>(
  config: RequestConfig
): (data?: RequestDataType) => Promise<ResponseType> {
  return async (data?: RequestDataType): Promise<ResponseType> => {
    const requestConfig: AxiosRequestConfig = {
      method: config.method,
      url: config.endpoint,
      headers: config.headers,
      timeout: config.timeout,
      withCredentials: config.withCredentials
    };

    // Add data for non-GET requests
    if (data && config.method !== RequestMethod.GET) {
      requestConfig.data = data;
    }

    // Add params if provided
    if (config.params) {
      requestConfig.params = config.params;
    }

    const response = await axios.request(requestConfig);
    return response.data;
  };
}

/**
 * Builds a URL with query parameters
 * 
 * @param baseUrl Base URL
 * @param params Query parameters
 * @returns URL with encoded query parameters
 */
export function buildUrlWithParams(
  baseUrl: string,
  params: Record<string, any>
): string {
  // Return the base URL if there are no parameters
  if (!params || Object.keys(params).length === 0) {
    return baseUrl;
  }

  // Create a URL object to handle existing parameters
  const url = new URL(baseUrl, 'http://example.com');
  
  // Iterate through parameters and append them to the URL
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      // Handle array parameters
      value.forEach((item) => {
        url.searchParams.append(key, String(item));
      });
    } else {
      // Handle regular parameters
      url.searchParams.append(key, String(value));
    }
  });
  
  // Return only the pathname and search parts (remove the base)
  return url.pathname + url.search;
}

/**
 * Validates if a value matches a specific format
 * 
 * @param value Value to validate
 * @param format Format to check against
 * @returns Whether the value matches the format
 */
function validateFormat(value: any, format: string): boolean {
  switch (format) {
    case 'email':
      // Simple email validation regex
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    case 'url':
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    case 'uuid':
      // UUID validation regex
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
    case 'date':
      return !isNaN(Date.parse(value));
    case 'phone':
      // Basic phone number validation
      return /^\+?[0-9\s-()]{7,}$/.test(value);
    default:
      return true;
  }
}

/**
 * Validates if a value is of the expected type
 * 
 * @param value Value to validate
 * @param type Expected type
 * @returns Whether the value is of the expected type
 */
function validateType(value: any, type: string): boolean {
  switch (type) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number';
    case 'boolean':
      return typeof value === 'boolean';
    case 'object':
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    case 'array':
      return Array.isArray(value);
    case 'date':
      return value instanceof Date;
    default:
      return true;
  }
}

/**
 * Validates request parameters
 * 
 * @param params Parameters to validate
 * @param requiredParams List of required parameter names
 * @param paramTypes Parameter type validation configuration
 * @param paramFormats Parameter format validation configuration
 */
export function validateRequestParams(
  params: Record<string, any>,
  requiredParams: string[],
  paramTypes?: Record<string, string>,
  paramFormats?: ParamFormatsConfig
): void {
  // Validate required parameters
  for (const param of requiredParams) {
    if (params[param] === undefined) {
      throw new Error(`Missing required parameter: ${param}`);
    }
  }

  // Validate parameter types if specified
  if (paramTypes) {
    for (const [param, type] of Object.entries(paramTypes)) {
      if (params[param] !== undefined && !validateType(params[param], type)) {
        throw new Error(`Parameter ${param} should be of type ${type}`);
      }
    }
  }

  // Validate parameter formats if specified
  if (paramFormats) {
    for (const [param, config] of Object.entries(paramFormats)) {
      if (
        params[param] !== undefined && 
        validateType(params[param], config.type) && 
        !validateFormat(params[param], config.format)
      ) {
        throw new Error(`Parameter ${param} should match format ${config.format}`);
      }
    }
  }
}
