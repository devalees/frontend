/**
 * RBAC API Tests
 * 
 * Tests for Role-Based Access Control (RBAC) API endpoints:
 * - Role management
 * - Permission management
 * - User role management
 * - Resource management
 * - Resource access management
 * - Organization context management
 * - Audit log management
 */

import { jest } from '@jest/globals';
import axios from 'axios';
import { ApiMocker, createMockResponse, createMockError } from '../utils/mockApi';
import { pureFunctionTests } from '../utils/functionTestUtils';
import * as rbacApi from '../../lib/api/rbac';
import { 
  Role, 
  Permission, 
  UserRole, 
  Resource, 
  ResourceAccess, 
  OrganizationContext, 
  AuditLog,
  PaginatedResponse 
} from '../../types/rbac';

// Mock data
const mockRole: Role = {
  id: '1',
  name: 'Admin',
  description: 'Administrator role',
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const mockPermission: Permission = {
  id: '1',
  name: 'create_user',
  codename: 'create_user',
  description: 'Create user permission',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const mockUserRole: UserRole = {
  id: '1',
  user_id: '1',
  role_id: '1',
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const mockResource: Resource = {
  id: '1',
  name: 'Project',
  type: 'entity',
  description: 'Project resource',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const mockResourceAccess: ResourceAccess = {
  id: '1',
  resource_id: '1',
  role_id: '1',
  permission_id: '1',
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const mockOrganizationContext: OrganizationContext = {
  id: '1',
  name: 'Engineering',
  parent_id: null,
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const mockAuditLog: AuditLog = {
  id: '1',
  user_id: '1',
  action: 'create',
  resource_type: 'Role',
  resource_id: '1',
  details: { name: ['', 'Admin'] },
  created_at: new Date().toISOString()
};

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  isAxiosError: jest.fn()
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('RBAC API', () => {
  let apiMocker: ApiMocker;

  beforeEach(() => {
    apiMocker = new ApiMocker();
    // Reset axios mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    apiMocker.reset();
    jest.restoreAllMocks();
  });

  describe('Role API', () => {
    it('should fetch roles list', async () => {
      const mockResponse: PaginatedResponse<Role> = {
        count: 1,
        next: null,
        previous: null,
        results: [mockRole]
      };

      mockedAxios.get.mockResolvedValueOnce({ data: mockResponse });
      const result = await rbacApi.getRoles();
      expect(result).toEqual(mockResponse);
    });

    it('should fetch single role', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockRole });
      const result = await rbacApi.getRole('1');
      expect(result).toEqual(mockRole);
    });

    it('should create role', async () => {
      const newRole = { name: 'Editor', description: 'Editor role' };
      mockedAxios.post.mockResolvedValueOnce({ data: mockRole });
      const result = await rbacApi.createRole(newRole);
      expect(result).toEqual(mockRole);
    });

    it('should update role', async () => {
      const updatedRole = { ...mockRole, name: 'Super Admin' };
      mockedAxios.put.mockResolvedValueOnce({ data: updatedRole });
      const result = await rbacApi.updateRole('1', { name: 'Super Admin' });
      expect(result).toEqual(updatedRole);
    });

    it('should delete role', async () => {
      mockedAxios.delete.mockResolvedValueOnce({ data: null });
      await expect(rbacApi.deleteRole('1')).resolves.not.toThrow();
    });

    it('should handle role not found error', async () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 404,
          data: { message: 'Role not found' }
        }
      };
      mockedAxios.get.mockRejectedValueOnce(error);
      await expect(rbacApi.getRole('999')).rejects.toThrow('Role not found');
    });
  });

  describe('Permission API', () => {
    it('should fetch permissions list', async () => {
      const mockResponse: PaginatedResponse<Permission> = {
        count: 1,
        next: null,
        previous: null,
        results: [mockPermission]
      };
      mockedAxios.get.mockResolvedValueOnce({ data: mockResponse });
      const result = await rbacApi.getPermissions();
      expect(result).toEqual(mockResponse);
    });

    it('should fetch single permission', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockPermission });
      const result = await rbacApi.getPermission('1');
      expect(result).toEqual(mockPermission);
    });

    it('should create permission', async () => {
      const newPermission = { name: 'edit_users', description: 'Can edit users' };
      mockedAxios.post.mockResolvedValueOnce({ data: mockPermission });
      const result = await rbacApi.createPermission(newPermission);
      expect(result).toEqual(mockPermission);
    });

    it('should update permission', async () => {
      const updatedPermission = { ...mockPermission, name: 'manage_users' };
      mockedAxios.put.mockResolvedValueOnce({ data: updatedPermission });
      const result = await rbacApi.updatePermission('1', { name: 'manage_users' });
      expect(result).toEqual(updatedPermission);
    });

    it('should delete permission', async () => {
      mockedAxios.delete.mockResolvedValueOnce({ data: null });
      await expect(rbacApi.deletePermission('1')).resolves.not.toThrow();
    });
  });

  describe('User Role API', () => {
    it('should fetch user roles list', async () => {
      const mockResponse: PaginatedResponse<UserRole> = {
        count: 1,
        next: null,
        previous: null,
        results: [mockUserRole]
      };
      mockedAxios.get.mockResolvedValueOnce({ data: mockResponse });
      const result = await rbacApi.getUserRoles();
      expect(result).toEqual(mockResponse);
    });

    it('should fetch single user role', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockUserRole });
      const result = await rbacApi.getUserRole('1');
      expect(result).toEqual(mockUserRole);
    });

    it('should create user role', async () => {
      const newUserRole = { user_id: '1', role_id: '1' };
      mockedAxios.post.mockResolvedValueOnce({ data: mockUserRole });
      const result = await rbacApi.createUserRole(newUserRole);
      expect(result).toEqual(mockUserRole);
    });

    it('should delete user role', async () => {
      mockedAxios.delete.mockResolvedValueOnce({ data: null });
      await expect(rbacApi.deleteUserRole('1')).resolves.not.toThrow();
    });
  });

  describe('Resource API', () => {
    it('should fetch resources list', async () => {
      const mockResponse: PaginatedResponse<Resource> = {
        count: 1,
        next: null,
        previous: null,
        results: [mockResource]
      };
      mockedAxios.get.mockResolvedValueOnce({ data: mockResponse });
      const result = await rbacApi.getResources();
      expect(result).toEqual(mockResponse);
    });

    it('should fetch single resource', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockResource });
      const result = await rbacApi.getResource('1');
      expect(result).toEqual(mockResource);
    });

    it('should create resource', async () => {
      const newResource = { name: 'Document', type: 'document', description: 'Document resource' };
      mockedAxios.post.mockResolvedValueOnce({ data: mockResource });
      const result = await rbacApi.createResource(newResource);
      expect(result).toEqual(mockResource);
    });

    it('should delete resource', async () => {
      mockedAxios.delete.mockResolvedValueOnce({ data: null });
      await expect(rbacApi.deleteResource('1')).resolves.not.toThrow();
    });
  });

  describe('Resource Access API', () => {
    it('should fetch resource accesses list', async () => {
      const mockResponse: PaginatedResponse<ResourceAccess> = {
        count: 1,
        next: null,
        previous: null,
        results: [mockResourceAccess]
      };
      mockedAxios.get.mockResolvedValueOnce({ data: mockResponse });
      const result = await rbacApi.getResourceAccesses();
      expect(result).toEqual(mockResponse);
    });

    it('should fetch single resource access', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockResourceAccess });
      const result = await rbacApi.getResourceAccess('1');
      expect(result).toEqual(mockResourceAccess);
    });

    it('should create resource access', async () => {
      const newResourceAccess = { resource_id: '1', role_id: '1', permission_id: '1' };
      mockedAxios.post.mockResolvedValueOnce({ data: mockResourceAccess });
      const result = await rbacApi.createResourceAccess(newResourceAccess);
      expect(result).toEqual(mockResourceAccess);
    });

    it('should delete resource access', async () => {
      mockedAxios.delete.mockResolvedValueOnce({ data: null });
      await expect(rbacApi.deleteResourceAccess('1')).resolves.not.toThrow();
    });
  });

  describe('Organization Context API', () => {
    it('should fetch organization contexts list', async () => {
      const mockResponse: PaginatedResponse<OrganizationContext> = {
        count: 1,
        next: null,
        previous: null,
        results: [mockOrganizationContext]
      };
      mockedAxios.get.mockResolvedValueOnce({ data: mockResponse });
      const result = await rbacApi.getOrganizationContexts();
      expect(result).toEqual(mockResponse);
    });

    it('should fetch single organization context', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockOrganizationContext });
      const result = await rbacApi.getOrganizationContext('1');
      expect(result).toEqual(mockOrganizationContext);
    });

    it('should create organization context', async () => {
      const newOrgContext = { name: 'Engineering', parent_id: null };
      mockedAxios.post.mockResolvedValueOnce({ data: mockOrganizationContext });
      const result = await rbacApi.createOrganizationContext(newOrgContext);
      expect(result).toEqual(mockOrganizationContext);
    });

    it('should update organization context', async () => {
      const updatedOrgContext = { ...mockOrganizationContext, name: 'Engineering Team' };
      mockedAxios.put.mockResolvedValueOnce({ data: updatedOrgContext });
      const result = await rbacApi.updateOrganizationContext('1', { name: 'Engineering Team' });
      expect(result).toEqual(updatedOrgContext);
    });

    it('should delete organization context', async () => {
      mockedAxios.delete.mockResolvedValueOnce({ data: null });
      await expect(rbacApi.deleteOrganizationContext('1')).resolves.not.toThrow();
    });
  });

  describe('Audit Log API', () => {
    it('should fetch audit logs list', async () => {
      const mockResponse: PaginatedResponse<AuditLog> = {
        count: 1,
        next: null,
        previous: null,
        results: [mockAuditLog]
      };
      mockedAxios.get.mockResolvedValueOnce({ data: mockResponse });
      const result = await rbacApi.getAuditLogs();
      expect(result).toEqual(mockResponse);
    });

    it('should fetch single audit log', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockAuditLog });
      const result = await rbacApi.getAuditLog('1');
      expect(result).toEqual(mockAuditLog);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      const error = {
        isAxiosError: true,
        message: 'Network Error'
      };
      mockedAxios.get.mockRejectedValueOnce(error);
      await expect(rbacApi.getRoles()).rejects.toThrow('Network Error');
    });

    it('should handle authentication errors', async () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 401,
          data: { message: 'Authentication required' }
        }
      };
      mockedAxios.get.mockRejectedValueOnce(error);
      await expect(rbacApi.getRoles()).rejects.toThrow('Authentication required');
    });

    it('should handle authorization errors', async () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 403,
          data: { message: 'Permission denied' }
        }
      };
      mockedAxios.post.mockRejectedValueOnce(error);
      await expect(rbacApi.createRole({ name: 'Admin' })).rejects.toThrow('Permission denied');
    });

    it('should handle server errors', async () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 500,
          data: { message: 'Internal server error' }
        }
      };
      mockedAxios.get.mockRejectedValueOnce(error);
      await expect(rbacApi.getRoles()).rejects.toThrow('Internal server error');
    });
  });
}); 