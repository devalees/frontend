/**
 * Auth Middleware Tests
 * 
 * Tests for the Next.js middleware that handles protected routes:
 * - Route protection
 * - Authentication checks
 * - Redirects for unauthenticated users
 */

import { describe, it, expect, beforeEach, afterEach } from '../../utils/testUtils';
import { getTokens } from '../../../lib/features/auth/token';
import { middleware } from '../../../middleware';

// Mock Next.js server module
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    redirect: jest.fn()
  }
}));

// Mock the token utility
jest.mock('../../../lib/features/auth/token', () => ({
  getTokens: jest.fn()
}));

// Define test environment as a property
(process.env as any).NODE_ENV = 'test';

// Create mock request factory
function createMockRequest(path: string) {
  const url = `http://localhost:3000${path}`;
  return {
    url,
    nextUrl: {
      pathname: path,
      origin: 'http://localhost:3000',
      toString: () => url
    }
  };
}

describe('Auth Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Protected Routes', () => {
    it('should allow access to protected routes when authenticated', async () => {
      // Setup
      const mockRequest = createMockRequest('/dashboard');
      (getTokens as jest.Mock).mockReturnValue({
        access: 'valid-token',
        refresh: 'valid-refresh-token'
      });

      // Execute
      const response = await middleware(mockRequest as any);

      // Verify
      expect(response).toBeUndefined();
    });

    it('should redirect to login when accessing protected routes while unauthenticated', async () => {
      // Setup
      const mockRequest = createMockRequest('/dashboard');
      (getTokens as jest.Mock).mockReturnValue(null);

      // Execute
      const response = await middleware(mockRequest as any);

      // Verify
      expect(response).toBeDefined();
      expect(response).toEqual({
        type: 'redirect',
        url: 'http://localhost:3000/login?redirect=http%3A%2F%2Flocalhost%3A3000%2Fdashboard',
        done: true
      });
    });

    it('should allow access to public routes regardless of authentication status', async () => {
      // Setup - Create request with login path
      const mockRequest = createMockRequest('/login');
      (getTokens as jest.Mock).mockReturnValue(null);

      // Execute
      const response = await middleware(mockRequest as any);

      // Verify
      expect(response).toBeUndefined();
    });

    it('should handle API routes correctly', async () => {
      // Setup - Create request with API path
      const mockRequest = createMockRequest('/api/protected');
      (getTokens as jest.Mock).mockReturnValue(null);

      // Execute
      const response = await middleware(mockRequest as any);

      // Verify
      expect(response).toBeUndefined();
    });

    it('should handle static files correctly', async () => {
      // Setup - Create request with static file path
      const mockRequest = createMockRequest('/_next/static/test.js');
      (getTokens as jest.Mock).mockReturnValue(null);

      // Execute
      const response = await middleware(mockRequest as any);

      // Verify
      expect(response).toBeUndefined();
    });
  });
}); 