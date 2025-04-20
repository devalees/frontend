export class ApiError extends Error {
  status: number;
  timestamp: Date;

  constructor(message: string, status: number = 500) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.timestamp = new Date();
  }
}

export class NetworkError extends ApiError {
  retryable: boolean;

  constructor(message: string) {
    super(message, 0);
    this.name = 'NetworkError';
    this.retryable = true;
  }
}

export class ValidationError extends ApiError {
  errors: Record<string, string[]>;

  constructor(message: string, errors: Record<string, string[]>) {
    super(message, 400);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string) {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string) {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string) {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

export class ServerError extends ApiError {
  constructor(message: string) {
    super(message, 500);
    this.name = 'ServerError';
  }
}

export const formatError = (error: ApiError) => {
  return {
    message: error.message,
    status: error.status,
    type: error.name,
    timestamp: error.timestamp.toISOString(),
    ...(error instanceof ValidationError && { errors: error.errors }),
    ...(error instanceof NetworkError && { retryable: error.retryable })
  };
};

export const logError = (error: ApiError) => {
  const formattedError = formatError(error);
  
  if (error instanceof ValidationError) {
    console.warn(`[${error.name}] ${error.message}`, formattedError);
  } else {
    console.error(`[${error.name}] ${error.message}`, formattedError);
  }
}; 