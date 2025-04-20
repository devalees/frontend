/**
 * Auth Middleware Tests
 * 
 * Tests for the Next.js middleware that handles protected routes:
 * - Route protection
 * - Authentication checks
 * - Redirects for unauthenticated users
 */

import { describe, it, expect, beforeEach, afterEach } from '../../utils/testUtils';
import { middleware } from '../../../middleware';

// Mock Next.js server module
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    redirect: jest.fn((url) => ({ redirected: true, url }))
  }
}));

// Define test environment as a property
(process.env as any).NODE_ENV = 'test';

// Create mock request factory
function createMockRequest(path: string, authenticated = false) {
  const url = `http://localhost:3000${path}`;
  return {
    url,
    nextUrl: {
      pathname: path,
      origin: 'http://localhost:3000',
      toString: () => url,
      searchParams: {
        set: jest.fn()
      }
    },
    headers: {
      get: jest.fn((name) => {
        if (name === 'x-test-auth' && authenticated) {
          return 'authenticated';
        }
        return null;
      })
    },
    cookies: {
      get: jest.fn(() => null),
      getAll: jest.fn(() => [])
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
      const mockRequest = createMockRequest('/dashboard', true);

      // Execute
      const response = await middleware(mockRequest as any);

      // Verify
      expect(response).toBeUndefined();
    });

    it('should redirect to login when accessing protected routes while unauthenticated', async () => {
      // Setup
      const mockRequest = createMockRequest('/dashboard');

      // Execute
      const response = await middleware(mockRequest as any);

      // Verify
      expect(response).toBeDefined();
      expect(response).toEqual({
        type: 'redirect',
        url: 'http://localhost:3000/login?redirect=http%3A%2F%2Flocalhost%3A3000%2F',
        done: true
      });
    });

    it('should allow access to public routes regardless of authentication status', async () => {
      // Setup - Create request with login path
      const mockRequest = createMockRequest('/login');

      // Execute
      const response = await middleware(mockRequest as any);

      // Verify
      expect(response).toBeUndefined();
    });

    it('should handle API routes correctly', async () => {
      // Setup - Create request with API path
      const mockRequest = createMockRequest('/api/protected');

      // Execute
      const response = await middleware(mockRequest as any);

      // Verify
      expect(response).toBeUndefined();
    });

    it('should handle static files correctly', async () => {
      // Setup - Create request with static file path
      const mockRequest = createMockRequest('/_next/static/test.js');

      // Execute
      const response = await middleware(mockRequest as any);

      // Verify
      expect(response).toBeUndefined();
    });
  });
}); 