/**
 * RBAC Permission Check Utility Tests
 * 
 * Tests for the RBAC permission check utility functions and hooks
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { 
  Role, 
  Permission, 
  UserRole, 
  Resource, 
  ResourceAccess 
} from '@/types/rbac';
import { 
  pureFunctionTests, 
  testWithCases, 
  testException 
} from './functionTestUtils';
import { renderHook } from '@testing-library/react';
import { useStore } from '../../lib/store';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasResourcePermission,
  usePermission,
  useAnyPermission,
  useAllPermissions,
  useResourcePermission,
} from '../../utils/rbac';

// Mock the store module
jest.mock('../../lib/store');

const mockStoreData = {
  roles: {
    data: {
      results: [
        {
          id: 'role1',
          name: 'Admin',
          description: 'Administrator role',
          permissions: ['permission1', 'permission2', 'permission3'],
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
    },
  },
  permissions: {
    data: {
      results: [
        {
          id: 'permission1',
          name: 'Read Users',
          description: 'Can read users',
          resource: 'user',
          action: 'read',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 'permission2',
          name: 'Write Users',
          description: 'Can write users',
          resource: 'user',
          action: 'write',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 'permission3',
          name: 'Delete Users',
          description: 'Can delete users',
          resource: 'user',
          action: 'delete',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ],
      total: 3,
      page: 1,
      limit: 10,
    },
  },
  userRoles: {
    data: {
      results: [
        {
          id: 'userRole1',
          user_id: 'user1',
          role_id: 'role1',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
    },
  },
};

// Properly type the mock store
const mockUseStore = jest.mocked(useStore);

describe('RBAC Utility Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseStore.mockReturnValue(mockStoreData);
  });

  describe('hasPermission', () => {
    it('should return true if user has the permission', () => {
      expect(hasPermission('user1', 'permission1')).toBe(true);
    });

    it('should return false if user does not have the permission', () => {
      expect(hasPermission('user1', 'permission4')).toBe(false);
    });

    it('should return false if user does not exist', () => {
      expect(hasPermission('user2', 'permission1')).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true if user has any of the permissions', () => {
      expect(hasAnyPermission('user1', ['permission1', 'permission4'])).toBe(true);
    });

    it('should return false if user has none of the permissions', () => {
      expect(hasAnyPermission('user1', ['permission4', 'permission5'])).toBe(false);
    });

    it('should return false if permissions array is empty', () => {
      expect(hasAnyPermission('user1', [])).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true if user has all permissions', () => {
      expect(hasAllPermissions('user1', ['permission1', 'permission2'])).toBe(true);
    });

    it('should return false if user does not have all permissions', () => {
      expect(hasAllPermissions('user1', ['permission1', 'permission4'])).toBe(false);
    });

    it('should return true if permissions array is empty', () => {
      expect(hasAllPermissions('user1', [])).toBe(true);
    });
  });

  describe('hasResourcePermission', () => {
    it('should return true if user has permission for resource and action', () => {
      expect(hasResourcePermission('user1', 'user', 'read')).toBe(true);
    });

    it('should return false if user does not have permission for resource and action', () => {
      expect(hasResourcePermission('user1', 'user', 'unknown')).toBe(false);
    });
  });

  describe('usePermission', () => {
    it('should return true if user has the permission', () => {
      const { result } = renderHook(() => usePermission('user1', 'permission1'));
      expect(result.current).toBe(true);
    });

    it('should return false if user does not have the permission', () => {
      const { result } = renderHook(() => usePermission('user1', 'permission4'));
      expect(result.current).toBe(false);
    });
  });

  describe('useAnyPermission', () => {
    it('should return true if user has any of the permissions', () => {
      const { result } = renderHook(() => useAnyPermission('user1', ['permission1', 'permission4']));
      expect(result.current).toBe(true);
    });

    it('should return false if user has none of the permissions', () => {
      const { result } = renderHook(() => useAnyPermission('user1', ['permission4', 'permission5']));
      expect(result.current).toBe(false);
    });
  });

  describe('useAllPermissions', () => {
    it('should return true if user has all permissions', () => {
      const { result } = renderHook(() => useAllPermissions('user1', ['permission1', 'permission2']));
      expect(result.current).toBe(true);
    });

    it('should return false if user does not have all permissions', () => {
      const { result } = renderHook(() => useAllPermissions('user1', ['permission1', 'permission4']));
      expect(result.current).toBe(false);
    });
  });

  describe('useResourcePermission', () => {
    it('should return true if user has permission for resource and action', () => {
      const { result } = renderHook(() => useResourcePermission('user1', 'user', 'read'));
      expect(result.current).toBe(true);
    });

    it('should return false if user does not have permission for resource and action', () => {
      const { result } = renderHook(() => useResourcePermission('user1', 'user', 'unknown'));
      expect(result.current).toBe(false);
    });
  });
}); 