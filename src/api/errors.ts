/**
 * Base API error class that all other API errors extend from
 */
export class ApiError extends Error {
  public status: number;
  public timestamp: Date;
  public type: string;

  constructor(message: string, status: number = 500) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.timestamp = new Date();
    this.type = this.constructor.name;
  }
}

/**
 * Error for network-related issues
 */
export class NetworkError extends ApiError {
  public retryable: boolean;

  constructor(message: string, retryable: boolean = true) {
    super(message, 0);
    this.name = 'NetworkError';
    this.retryable = retryable;
  }
}

/**
 * Error for validation failures
 */
export class ValidationError extends ApiError {
  public errors: Record<string, string[]>;

  constructor(message: string, errors: Record<string, string[]>) {
    super(message, 400);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/**
 * Error for authentication failures
 */
export class AuthenticationError extends ApiError {
  constructor(message: string) {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

/**
 * Error for authorization failures
 */
export class AuthorizationError extends ApiError {
  constructor(message: string) {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

/**
 * Error for resource not found
 */
export class NotFoundError extends ApiError {
  constructor(message: string) {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Error for server-side issues
 */
export class ServerError extends ApiError {
  constructor(message: string) {
    super(message, 500);
    this.name = 'ServerError';
  }
} 