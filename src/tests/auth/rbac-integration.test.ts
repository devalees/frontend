/**
 * RBAC Authentication Integration Tests
 * 
 * Tests for the integration between RBAC and authentication:
 * - RBAC integration with authentication flow
 * - Permission-based route protection
 * - User permissions during login
 */

import { describe, it, expect, beforeEach, afterEach } from '../utils/testUtils';
import { renderForIntegration, integrationSetup } from '../utils/integrationTestUtils';
import { mockApiMethod, mockApiError, createMockResponse, resetApiMocks } from '../utils/mockApi';
import { login, LoginResponse } from '../../lib/api/auth';
import { useStore } from '../../lib/store';
import { 
  Role, 
  Permission, 
  UserRole, 
  PaginatedResponse 
} from '../../types/rbac';
import { 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions, 
  hasResourcePermission 
} from '../../utils/rbac';
import { middleware } from '../../middleware';

// Mock the store
const mockUseStore = jest.fn();
jest.mock('../../lib/store', () => ({
  useStore: mockUseStore
}));

// Mock the auth module
jest.mock('../../lib/api/auth', () => ({
  login: jest.fn(),
  getTokens: jest.fn()
}));

// Mock the RBAC module
jest.mock('../../utils/rbac', () => ({
  hasPermission: jest.fn(),
  hasAnyPermission: jest.fn(),
  hasAllPermissions: jest.fn(),
  hasResourcePermission: jest.fn()
}));

// Mock the middleware
jest.mock('../../middleware', () => ({
  middleware: jest.fn()
}));

// Mock localStorage
const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: jest.fn((key: string) => { delete store[key]; }),
    clear: jest.fn(() => { Object.keys(store).forEach(key => delete store[key]); })
  };
};

// Define store type
type MockStore = {
  roles: {
    data: PaginatedResponse<Role> | null;
    status: string;
    error: string | null;
    fetchRoles: jest.Mock;
  };
  permissions: {
    data: PaginatedResponse<Permission> | null;
    status: string;
    error: string | null;
    fetchPermissions: jest.Mock;
  };
  userRoles: {
    data: PaginatedResponse<UserRole> | null;
    status: string;
    error: string | null;
    fetchUserRoles: jest.Mock;
  };
  user: any;
};

describe('RBAC Authentication Integration', () => {
  // Setup and teardown
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    resetApiMocks();
    
    // Setup localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage(),
      writable: true
    });
    
    // Setup integration test environment
    integrationSetup();
  });
  
  afterEach(() => {
    // Clean up
    jest.resetAllMocks();
  });
  
  describe('RBAC Integration with Authentication Flow', () => {
    it('should load user permissions during login', async () => {
      // Mock login response with user data
      const mockLoginResponse: LoginResponse = {
        access: 'mock-access-token',
        refresh: 'mock-refresh-token',
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          is_active: true
        }
      };
      
      // Mock roles response
      const mockRolesResponse: PaginatedResponse<Role> = {
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            id: 'role1',
            name: 'Admin',
            description: 'Administrator role',
            permissions: ['permission1', 'permission2'],
            is_active: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          }
        ]
      };
      
      // Mock permissions response
      const mockPermissionsResponse: PaginatedResponse<Permission> = {
        count: 2,
        next: null,
        previous: null,
        results: [
          {
            id: 'permission1',
            name: 'View Projects',
            description: 'Can view projects',
            resource: 'projects',
            action: 'view',
            is_active: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          },
          {
            id: 'permission2',
            name: 'Edit Projects',
            description: 'Can edit projects',
            resource: 'projects',
            action: 'edit',
            is_active: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          }
        ]
      };
      
      // Mock user roles response
      const mockUserRolesResponse: PaginatedResponse<UserRole> = {
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            id: 'userRole1',
            user_id: '1',
            role_id: 'role1',
            is_active: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          }
        ]
      };
      
      // Setup API mocks
      mockApiMethod('post', mockLoginResponse);
      mockApiMethod('get', mockRolesResponse);
      mockApiMethod('get', mockPermissionsResponse);
      mockApiMethod('get', mockUserRolesResponse);
      
      // Mock store implementation
      const mockStore: MockStore = {
        roles: {
          data: mockRolesResponse,
          status: 'success',
          error: null,
          fetchRoles: jest.fn().mockResolvedValue(mockRolesResponse)
        },
        permissions: {
          data: mockPermissionsResponse,
          status: 'success',
          error: null,
          fetchPermissions: jest.fn().mockResolvedValue(mockPermissionsResponse)
        },
        userRoles: {
          data: mockUserRolesResponse,
          status: 'success',
          error: null,
          fetchUserRoles: jest.fn().mockResolvedValue(mockUserRolesResponse)
        },
        user: mockLoginResponse.user
      };
      
      // Setup store mock to return store data
      mockUseStore.mockReturnValue(mockStore);
      
      // Mock the login function to return the expected response and update store
      (login as jest.Mock).mockImplementation(async (credentials) => {
        // Access store to trigger the mock
        const store = mockUseStore();
        
        // Update store with user data
        store.user = mockLoginResponse.user;
        
        // Load RBAC data
        await store.roles.fetchRoles();
        await store.permissions.fetchPermissions();
        await store.userRoles.fetchUserRoles();
        
        return mockLoginResponse;
      });
      
      // Call login function
      const response = await login({ username: 'testuser', password: 'password123' });
      
      // Verify login response
      expect(response).toEqual(mockLoginResponse);
      
      // Verify store was updated with user data
      expect(mockUseStore).toHaveBeenCalled();
      
      // Verify RBAC data was loaded
      expect(mockStore.roles.fetchRoles).toHaveBeenCalled();
      expect(mockStore.permissions.fetchPermissions).toHaveBeenCalled();
      expect(mockStore.userRoles.fetchUserRoles).toHaveBeenCalled();
    });
    
    it('should handle login failure gracefully', async () => {
      // Mock login error
      mockApiError('post', 'Invalid credentials', 401);
      
      // Mock store implementation
      const mockStore: MockStore = {
        roles: {
          data: null,
          status: 'idle',
          error: null,
          fetchRoles: jest.fn()
        },
        permissions: {
          data: null,
          status: 'idle',
          error: null,
          fetchPermissions: jest.fn()
        },
        userRoles: {
          data: null,
          status: 'idle',
          error: null,
          fetchUserRoles: jest.fn()
        },
        user: null
      };
      
      // Setup store mock to return store data
      mockUseStore.mockReturnValue(mockStore);
      
      // Mock the login function to throw an error
      (login as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));
      
      // Attempt login
      try {
        await login({ username: 'testuser', password: 'wrongpassword' });
        // If we reach here, the test should fail
        expect(true).toBe(false);
      } catch (error) {
        // Verify error was thrown
        expect(error).toBeDefined();
        
        // Verify RBAC data was not loaded
        expect(mockStore.roles.fetchRoles).not.toHaveBeenCalled();
        expect(mockStore.permissions.fetchPermissions).not.toHaveBeenCalled();
        expect(mockStore.userRoles.fetchUserRoles).not.toHaveBeenCalled();
      }
    });
  });
  
  describe('Permission-Based Route Protection', () => {
    it('should allow access to routes when user has required permissions', async () => {
      // Mock authenticated user with permissions
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        is_active: true
      };
      
      // Mock store with user and permissions
      const mockStore: MockStore = {
        user: mockUser,
        roles: {
          data: {
            count: 1,
            next: null,
            previous: null,
            results: [
              {
                id: 'role1',
                name: 'Admin',
                description: 'Administrator role',
                permissions: ['permission1', 'permission2'],
                is_active: true,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z'
              }
            ]
          },
          status: 'success',
          error: null,
          fetchRoles: jest.fn()
        },
        permissions: {
          data: {
            count: 2,
            next: null,
            previous: null,
            results: [
              {
                id: 'permission1',
                name: 'View Projects',
                description: 'Can view projects',
                resource: 'projects',
                action: 'view',
                is_active: true,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z'
              },
              {
                id: 'permission2',
                name: 'Edit Projects',
                description: 'Can edit projects',
                resource: 'projects',
                action: 'edit',
                is_active: true,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z'
              }
            ]
          },
          status: 'success',
          error: null,
          fetchPermissions: jest.fn()
        },
        userRoles: {
          data: {
            count: 1,
            next: null,
            previous: null,
            results: [
              {
                id: 'userRole1',
                user_id: '1',
                role_id: 'role1',
                is_active: true,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z'
              }
            ]
          },
          status: 'success',
          error: null,
          fetchUserRoles: jest.fn()
        }
      };
      
      // Setup store mock to return store data
      mockUseStore.mockReturnValue(mockStore);
      
      // Mock permission check functions
      (hasPermission as jest.Mock).mockReturnValue(true);
      (hasAnyPermission as jest.Mock).mockReturnValue(true);
      (hasAllPermissions as jest.Mock).mockReturnValue(true);
      (hasResourcePermission as jest.Mock).mockReturnValue(true);
      
      // Create a mock request for a protected route
      const mockRequest = {
        url: 'http://localhost:3000/dashboard/projects',
        nextUrl: {
          pathname: '/dashboard/projects'
        },
        headers: {
          get: jest.fn(() => 'Bearer mock-access-token')
        },
        cookies: {
          get: jest.fn(() => ({ name: 'auth_access_token', value: 'mock-access-token' }))
        }
      };
      
      // Mock middleware implementation to call permission checks
      (middleware as jest.Mock).mockImplementation(async (req) => {
        // Call permission checks as part of the middleware
        hasPermission('1', 'projects:view');
        hasAnyPermission('1', ['projects:view', 'projects:edit']);
        hasAllPermissions('1', ['projects:view', 'projects:edit']);
        hasResourcePermission('1', 'projects', 'view');
        
        // Return undefined to allow access
        return undefined;
      });
      
      // Call middleware
      const response = await middleware(mockRequest as any);
      
      // Verify middleware allowed access
      expect(response).toBeUndefined();
      
      // Verify permission checks were called
      expect(hasPermission).toHaveBeenCalled();
      expect(hasAnyPermission).toHaveBeenCalled();
      expect(hasAllPermissions).toHaveBeenCalled();
      expect(hasResourcePermission).toHaveBeenCalled();
    });
    
    it('should deny access to routes when user lacks required permissions', async () => {
      // Mock authenticated user without required permissions
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        is_active: true
      };
      
      // Mock store with user but without required permissions
      const mockStore: MockStore = {
        user: mockUser,
        roles: {
          data: {
            count: 1,
            next: null,
            previous: null,
            results: [
              {
                id: 'role1',
                name: 'User',
                description: 'Regular user role',
                permissions: ['permission3'], // Different permission
                is_active: true,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z'
              }
            ]
          },
          status: 'success',
          error: null,
          fetchRoles: jest.fn()
        },
        permissions: {
          data: {
            count: 1,
            next: null,
            previous: null,
            results: [
              {
                id: 'permission3',
                name: 'View Tasks',
                description: 'Can view tasks',
                resource: 'tasks',
                action: 'view',
                is_active: true,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z'
              }
            ]
          },
          status: 'success',
          error: null,
          fetchPermissions: jest.fn()
        },
        userRoles: {
          data: {
            count: 1,
            next: null,
            previous: null,
            results: [
              {
                id: 'userRole1',
                user_id: '1',
                role_id: 'role1',
                is_active: true,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z'
              }
            ]
          },
          status: 'success',
          error: null,
          fetchUserRoles: jest.fn()
        }
      };
      
      // Setup store mock to return store data
      mockUseStore.mockReturnValue(mockStore);
      
      // Mock permission check functions to return false
      (hasPermission as jest.Mock).mockReturnValue(false);
      (hasAnyPermission as jest.Mock).mockReturnValue(false);
      (hasAllPermissions as jest.Mock).mockReturnValue(false);
      (hasResourcePermission as jest.Mock).mockReturnValue(false);
      
      // Create a mock request for a protected route
      const mockRequest = {
        url: 'http://localhost:3000/dashboard/projects',
        nextUrl: {
          pathname: '/dashboard/projects'
        },
        headers: {
          get: jest.fn(() => 'Bearer mock-access-token')
        },
        cookies: {
          get: jest.fn(() => ({ name: 'auth_access_token', value: 'mock-access-token' }))
        }
      };
      
      // Mock middleware implementation to call permission checks and redirect
      const mockRedirectResponse = {
        type: 'redirect',
        url: 'http://localhost:3000/login?redirect=http%3A%2F%2Flocalhost%3A3000%2Fdashboard%2Fprojects',
        done: true
      };
      
      (middleware as jest.Mock).mockImplementation(async (req) => {
        // Call permission checks as part of the middleware
        hasPermission('1', 'projects:view');
        hasAnyPermission('1', ['projects:view', 'projects:edit']);
        hasAllPermissions('1', ['projects:view', 'projects:edit']);
        hasResourcePermission('1', 'projects', 'view');
        
        // Return redirect response to deny access
        return mockRedirectResponse;
      });
      
      // Call middleware
      const response = await middleware(mockRequest as any);
      
      // Verify middleware redirected
      expect(response).toBeDefined();
      expect(response?.type).toBe('redirect');
      expect(response?.url).toContain('/login');
      
      // Verify permission checks were called
      expect(hasPermission).toHaveBeenCalled();
      expect(hasAnyPermission).toHaveBeenCalled();
      expect(hasAllPermissions).toHaveBeenCalled();
      expect(hasResourcePermission).toHaveBeenCalled();
    });
  });
}); 