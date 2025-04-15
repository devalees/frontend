import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiError, NetworkError, ValidationError, AuthenticationError, AuthorizationError, NotFoundError, ServerError } from '../../api/errors';
import { formatError, logError } from '../../api/errorHandling';

describe('API Error Handling', () => {
  describe('Error Types', () => {
    it('should create ApiError with correct properties', () => {
      const error = new ApiError('Test error', 400);
      expect(error).toBeInstanceOf(ApiError);
      expect(error.message).toBe('Test error');
      expect(error.status).toBe(400);
      expect(error.timestamp).toBeInstanceOf(Date);
    });

    it('should create NetworkError with correct properties', () => {
      const error = new NetworkError('Network error');
      expect(error).toBeInstanceOf(NetworkError);
      expect(error.message).toBe('Network error');
      expect(error.status).toBe(0);
    });

    it('should create ValidationError with correct properties', () => {
      const errors = { field: ['required'] };
      const error = new ValidationError('Validation failed', errors);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe('Validation failed');
      expect(error.status).toBe(400);
      expect(error.errors).toEqual(errors);
    });

    it('should create AuthenticationError with correct properties', () => {
      const error = new AuthenticationError('Invalid credentials');
      expect(error).toBeInstanceOf(AuthenticationError);
      expect(error.message).toBe('Invalid credentials');
      expect(error.status).toBe(401);
    });

    it('should create AuthorizationError with correct properties', () => {
      const error = new AuthorizationError('Insufficient permissions');
      expect(error).toBeInstanceOf(AuthorizationError);
      expect(error.message).toBe('Insufficient permissions');
      expect(error.status).toBe(403);
    });

    it('should create NotFoundError with correct properties', () => {
      const error = new NotFoundError('Resource not found');
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.message).toBe('Resource not found');
      expect(error.status).toBe(404);
    });

    it('should create ServerError with correct properties', () => {
      const error = new ServerError('Internal server error');
      expect(error).toBeInstanceOf(ServerError);
      expect(error.message).toBe('Internal server error');
      expect(error.status).toBe(500);
    });
  });

  describe('Error Formatting', () => {
    it('should format ApiError correctly', () => {
      const error = new ApiError('Test error', 400);
      const formatted = formatError(error);
      expect(formatted).toEqual({
        message: 'Test error',
        status: 400,
        type: 'ApiError',
        timestamp: expect.any(String)
      });
    });

    it('should format ValidationError with field errors', () => {
      const error = new ValidationError('Validation failed', { field: ['required'] });
      const formatted = formatError(error);
      expect(formatted).toEqual({
        message: 'Validation failed',
        status: 400,
        type: 'ValidationError',
        errors: { field: ['required'] },
        timestamp: expect.any(String)
      });
    });

    it('should format unknown errors as generic ApiError', () => {
      const error = new Error('Unknown error');
      const formatted = formatError(error);
      expect(formatted).toEqual({
        message: 'Unknown error',
        status: 500,
        type: 'ApiError',
        timestamp: expect.any(String)
      });
    });
  });

  describe('Error Logging', () => {
    const consoleSpy = {
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn()
    };

    beforeEach(() => {
      vi.spyOn(console, 'error').mockImplementation(consoleSpy.error);
      vi.spyOn(console, 'warn').mockImplementation(consoleSpy.warn);
      vi.spyOn(console, 'info').mockImplementation(consoleSpy.info);
    });

    it('should log ApiError with correct level and format', () => {
      const error = new ApiError('Test error', 400);
      logError(error);
      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringContaining('Test error'),
        expect.objectContaining({
          status: 400,
          type: 'ApiError'
        })
      );
    });

    it('should log ValidationError with field errors', () => {
      const error = new ValidationError('Validation failed', { field: ['required'] });
      logError(error);
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        expect.stringContaining('Validation failed'),
        expect.objectContaining({
          status: 400,
          type: 'ValidationError',
          errors: { field: ['required'] }
        })
      );
    });

    it('should log NetworkError with retry information', () => {
      const error = new NetworkError('Network error');
      logError(error);
      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringContaining('Network error'),
        expect.objectContaining({
          status: 0,
          type: 'NetworkError',
          retryable: true
        })
      );
    });
  });
}); 