/**
 * Custom error classes for API operations
 * This file defines standardized error types for API-related operations
 */

// Base API Error class
export class ApiError extends Error {
  status: number;
  timestamp: Date;
  
  constructor(message: string, status = 500) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.timestamp = new Date();
    
    // This is needed for instanceof to work correctly with extended Error classes
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

// Network Error (connection issues)
export class NetworkError extends ApiError {
  retryable: boolean;
  
  constructor(message: string) {
    super(message, 0); // Status 0 typically indicates network error
    this.name = 'NetworkError';
    this.retryable = true;
    
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

// Validation Error (invalid inputs)
export class ValidationError extends ApiError {
  errors: Record<string, string[]>;
  
  constructor(message: string, errors: Record<string, string[]>) {
    super(message, 400);
    this.name = 'ValidationError';
    this.errors = errors;
    
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

// Authentication Error (not authenticated)
export class AuthenticationError extends ApiError {
  constructor(message: string) {
    super(message, 401);
    this.name = 'AuthenticationError';
    
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

// Authorization Error (not authorized)
export class AuthorizationError extends ApiError {
  constructor(message: string) {
    super(message, 403);
    this.name = 'AuthorizationError';
    
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

// Not Found Error
export class NotFoundError extends ApiError {
  constructor(message: string) {
    super(message, 404);
    this.name = 'NotFoundError';
    
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

// Server Error (internal server errors)
export class ServerError extends ApiError {
  constructor(message: string) {
    super(message, 500);
    this.name = 'ServerError';
    
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}

/**
 * Format an error for consistent response structure
 * @param error The error to format
 * @returns A formatted error object
 */
export function formatError(error: Error): Record<string, any> {
  if (error instanceof ApiError) {
    const formatted: Record<string, any> = {
      message: error.message,
      type: error.name,
      status: error.status,
      timestamp: error.timestamp.toISOString(),
    };
    
    if (error instanceof ValidationError) {
      formatted.errors = error.errors;
    }
    
    if (error instanceof NetworkError) {
      formatted.retryable = error.retryable;
    }
    
    return formatted;
  }
  
  // Unknown error
  return {
    message: error.message,
    type: 'UnknownError',
    status: 500,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Log an error with appropriate severity level
 * @param error The error to log
 */
export function logError(error: Error): void {
  const formattedError = formatError(error);
  
  if (error instanceof ValidationError) {
    console.warn(`[Validation Error] ${error.message}`, formattedError);
    return;
  }
  
  // All other errors use error level
  console.error(`[${formattedError.type || 'Unknown Error'}] ${error.message}`, formattedError);
} 