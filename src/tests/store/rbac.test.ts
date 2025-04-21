/**
 * RBAC Store Tests
 * 
 * Tests for Role-Based Access Control (RBAC) store:
 * - Role management
 * - Permission management
 * - User role management
 * - Resource management
 * - Resource access management
 * - Organization context management
 * - Audit log management
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { createRbacSlice } from '../../lib/store/slices/rbacSlice';
import * as rbacApi from '../../lib/api/rbac';
import { Role, Permission, UserRole, Resource, ResourceAccess, PaginatedResponse } from '../../types/rbac';
import { create } from 'zustand';

// Mock the API functions
jest.mock('../../lib/api/rbac', () => ({
  getRoles: jest.fn(),
  createRole: jest.fn(),
  updateRole: jest.fn(),
  deleteRole: jest.fn(),
  getPermissions: jest.fn(),
  createPermission: jest.fn(),
  updatePermission: jest.fn(),
  deletePermission: jest.fn(),
  getUserRoles: jest.fn(),
  createUserRole: jest.fn(),
  updateUserRole: jest.fn(),
  deleteUserRole: jest.fn(),
  activateUserRole: jest.fn(),
  deactivateUserRole: jest.fn(),
  delegateUserRole: jest.fn(),
  listResources: jest.fn(),
  createResource: jest.fn(),
  updateResource: jest.fn(),
  deleteResource: jest.fn(),
  grantAccess: jest.fn(),
  revokeAccess: jest.fn(),
  getResourceAccesses: jest.fn(),
  createResourceAccess: jest.fn(),
  updateResourceAccess: jest.fn(),
  deleteResourceAccess: jest.fn(),
  activateResourceAccess: jest.fn(),
  deactivateResourceAccess: jest.fn(),
  getOrganizationContexts: jest.fn(),
  createOrganizationContext: jest.fn(),
  updateOrganizationContext: jest.fn(),
  deleteOrganizationContext: jest.fn(),
  activateOrganizationContext: jest.fn(),
  deactivateOrganizationContext: jest.fn(),
  getAuditLogs: jest.fn(),
}));

describe('RBAC Store', () => {
  const store = create(createRbacSlice);
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Role Management', () => {
    const mockRole: Role = {
      id: '1',
      name: 'Admin',
      description: 'Administrator role',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    };

    const mockPaginatedRoles: PaginatedResponse<Role> = {
      count: 1,
      next: null,
      previous: null,
      results: [mockRole]
    };

    it('should fetch roles successfully', async () => {
      jest.mocked(rbacApi.getRoles).mockResolvedValue(mockPaginatedRoles);
      
      await store.getState().fetchRoles();
      
      expect(rbacApi.getRoles).toHaveBeenCalled();
      expect(store.getState().roles.status).toBe('success');
      expect(store.getState().roles.data).toEqual(mockPaginatedRoles);
    });

    it('should create a role successfully', async () => {
      const newRole: Partial<Role> = {
        name: 'Editor',
        description: 'Editor role'
      };
      
      jest.mocked(rbacApi.createRole).mockResolvedValue({ ...newRole, id: '2', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' } as Role);
      
      await store.getState().createRole(newRole);
      
      expect(rbacApi.createRole).toHaveBeenCalledWith(newRole);
    });

    it('should update a role successfully', async () => {
      const updatedRole: Partial<Role> = {
        name: 'Updated Admin',
        description: 'Updated description'
      };
      
      jest.mocked(rbacApi.updateRole).mockResolvedValue({ ...mockRole, ...updatedRole });
      
      await store.getState().updateRole('1', updatedRole);
      
      expect(rbacApi.updateRole).toHaveBeenCalledWith('1', updatedRole);
    });

    it('should delete a role successfully', async () => {
      jest.mocked(rbacApi.deleteRole).mockResolvedValue(undefined);
      
      await store.getState().deleteRole('1');
      
      expect(rbacApi.deleteRole).toHaveBeenCalledWith('1');
    });
  });

  describe('Permission Management', () => {
    const mockPermission: Permission = {
      id: '1',
      name: 'read',
      description: 'Read permission',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    };

    const mockPaginatedPermissions: PaginatedResponse<Permission> = {
      count: 1,
      next: null,
      previous: null,
      results: [mockPermission]
    };

    it('should fetch permissions successfully', async () => {
      jest.mocked(rbacApi.getPermissions).mockResolvedValue(mockPaginatedPermissions);
      
      await store.getState().fetchPermissions();
      
      expect(rbacApi.getPermissions).toHaveBeenCalled();
      expect(store.getState().permissions.status).toBe('success');
      expect(store.getState().permissions.data).toEqual(mockPaginatedPermissions);
    });

    it('should create a permission successfully', async () => {
      const newPermission: Partial<Permission> = {
        name: 'write',
        description: 'Write permission'
      };
      
      jest.mocked(rbacApi.createPermission).mockResolvedValue({ ...newPermission, id: '2', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' } as Permission);
      
      await store.getState().createPermission(newPermission);
      
      expect(rbacApi.createPermission).toHaveBeenCalledWith(newPermission);
    });
  });

  describe('Resource Management', () => {
    const mockResource: Resource = {
      id: '1',
      name: 'Document',
      description: 'Document resource',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    };

    const mockPaginatedResources: PaginatedResponse<Resource> = {
      count: 1,
      next: null,
      previous: null,
      results: [mockResource]
    };

    it('should fetch resources successfully', async () => {
      jest.mocked(rbacApi.listResources).mockResolvedValue(mockPaginatedResources);
      
      await store.getState().fetchResources();
      
      expect(rbacApi.listResources).toHaveBeenCalled();
      expect(store.getState().resources.status).toBe('success');
      expect(store.getState().resources.data).toEqual(mockPaginatedResources);
    });

    it('should create a resource successfully', async () => {
      const newResource: Partial<Resource> = {
        name: 'File',
        description: 'File resource'
      };
      
      jest.mocked(rbacApi.createResource).mockResolvedValue({ ...newResource, id: '2', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' } as Resource);
      
      await store.getState().createResource(newResource);
      
      expect(rbacApi.createResource).toHaveBeenCalledWith(newResource);
    });
  });

  describe('Resource Access Management', () => {
    const mockResourceAccess: ResourceAccess = {
      id: '1',
      resource_id: '1',
      role_id: '1',
      permission_id: '1',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    };

    const mockPaginatedResourceAccesses: PaginatedResponse<ResourceAccess> = {
      count: 1,
      next: null,
      previous: null,
      results: [mockResourceAccess]
    };

    it('should fetch resource accesses successfully', async () => {
      jest.mocked(rbacApi.getResourceAccesses).mockResolvedValue(mockPaginatedResourceAccesses);
      
      await store.getState().fetchResourceAccesses();
      
      expect(rbacApi.getResourceAccesses).toHaveBeenCalled();
      expect(store.getState().resourceAccesses.status).toBe('success');
      expect(store.getState().resourceAccesses.data).toEqual(mockPaginatedResourceAccesses);
    });

    it('should create a resource access successfully', async () => {
      const newResourceAccess: Partial<ResourceAccess> = {
        resource_id: '2',
        role_id: '2',
        permission_id: '2'
      };
      
      jest.mocked(rbacApi.createResourceAccess).mockResolvedValue({ ...newResourceAccess, id: '2', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' } as ResourceAccess);
      
      await store.getState().createResourceAccess(newResourceAccess);
      
      expect(rbacApi.createResourceAccess).toHaveBeenCalledWith(newResourceAccess);
    });
  });
});
