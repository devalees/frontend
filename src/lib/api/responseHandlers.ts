/**
 * Response Handlers
 * 
 * This file contains utilities for handling API responses, including:
 * - Response parsing
 * - Data transformation
 * - Error handling
 */

import { AxiosResponse, AxiosError } from 'axios';

// API Response interface
export interface ApiResponse<T = any> {
  data: T;
  status: string;
  message: string;
  statusCode: number;
}

// API Error interface
export interface ApiError {
  message: string;
  statusCode: number;
  errors: Array<{ field: string; message: string }>;
  isNetworkError: boolean;
}

// API Error Response Data interface
interface ApiErrorResponseData {
  status?: string;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

// Data transformer type
export type DataTransformer<TInput, TOutput> = (input: TInput) => TOutput;

/**
 * Parses an Axios response into a standardized API response
 * 
 * @param response The Axios response
 * @param dataField Optional field name to extract from the response data
 * @returns A standardized API response
 */
export function parseResponse<T>(
  response: AxiosResponse,
  dataField?: string
): ApiResponse<T> {
  const { data, status } = response;
  
  let responseData: any;
  
  // Handle empty response (204 No Content)
  if (status === 204 && !dataField) {
    responseData = undefined;
  } 
  // Handle paginated response
  else if (data.data && data.pagination && !dataField) {
    responseData = {
      data: data.data,
      pagination: data.pagination
    };
  }
  // Handle custom data field
  else if (dataField) {
    responseData = data[dataField];
  }
  // Handle standard data field
  else {
    responseData = data.data || data;
  }
  
  return {
    data: responseData as T,
    status: data.status || 'success',
    message: data.message || '',
    statusCode: status
  };
}

/**
 * Transforms response data using a transformation function
 * 
 * @param data The data to transform
 * @param transformer The transformation function
 * @returns The transformed data
 */
export function transformResponseData<TInput, TOutput>(
  data: TInput,
  transformer: DataTransformer<TInput extends Array<infer U> ? U : TInput, TOutput extends Array<infer V> ? V : TOutput>
): TOutput {
  // Handle null or undefined data
  if (data === null || data === undefined) {
    return null as unknown as TOutput;
  }
  
  // Handle array data
  if (Array.isArray(data)) {
    return data.map(item => transformer(item)) as unknown as TOutput;
  }
  
  // Handle single object data
  return transformer(data as any) as TOutput;
}

/**
 * Handles API errors and converts them to a standardized format
 * 
 * @param error The Axios error
 * @returns A standardized API error
 */
export function handleResponseError(error: AxiosError): ApiError {
  // Network or timeout errors have no response
  if (!error.response) {
    // Check for timeout error
    const isTimeout = error.message?.includes('timeout');
    
    return {
      message: isTimeout ? 'Request timed out. Please try again.' : error.message || 'Network Error',
      statusCode: 0,
      errors: [],
      isNetworkError: true
    };
  }
  
  // Handle API errors with a response
  const { response } = error;
  const { status } = response;
  const data = response.data as ApiErrorResponseData;
  
  return {
    message: data?.message || response.statusText || 'An error occurred',
    statusCode: status,
    errors: data?.errors || [],
    isNetworkError: false
  };
} 