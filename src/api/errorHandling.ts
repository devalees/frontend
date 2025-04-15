import { ApiError, NetworkError, ValidationError } from './errors';

/**
 * Interface for formatted error output
 */
export interface FormattedError {
  message: string;
  status: number;
  type: string;
  timestamp: string;
  errors?: Record<string, string[]>;
  retryable?: boolean;
}

/**
 * Format an error into a standardized structure
 * @param error The error to format
 * @returns A formatted error object
 */
export function formatError(error: Error): FormattedError {
  // If it's already an ApiError, format it directly
  if (error instanceof ApiError) {
    const formatted: FormattedError = {
      message: error.message,
      status: error.status,
      type: error.type,
      timestamp: error.timestamp.toISOString()
    };

    // Add validation errors if present
    if (error instanceof ValidationError) {
      formatted.errors = error.errors;
    }

    // Add retryable flag if present
    if (error instanceof NetworkError) {
      formatted.retryable = error.retryable;
    }

    return formatted;
  }

  // For unknown errors, convert to generic ApiError
  return {
    message: error.message || 'Unknown error',
    status: 500,
    type: 'ApiError',
    timestamp: new Date().toISOString()
  };
}

/**
 * Log an error with appropriate severity level
 * @param error The error to log
 */
export function logError(error: Error): void {
  const formatted = formatError(error);

  // Determine log level based on error type
  if (error instanceof ValidationError) {
    // Validation errors are warnings
    console.warn(`[${formatted.type}] ${formatted.message}`, formatted);
  } else if (error instanceof NetworkError) {
    // Network errors are errors with retry information
    console.error(`[${formatted.type}] ${formatted.message}`, {
      ...formatted,
      retryable: formatted.retryable
    });
  } else if (error instanceof ApiError) {
    // Other API errors are errors
    console.error(`[${formatted.type}] ${formatted.message}`, formatted);
  } else {
    // Unknown errors are errors
    console.error(`[Unknown Error] ${formatted.message}`, formatted);
  }
} 