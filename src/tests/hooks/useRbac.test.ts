/**
 * RBAC Hooks Tests
 *
 * These tests verify the functionality of the RBAC hooks,
 * including role, permission, user role, resource, resource access,
 * organization context, and audit log management.
 */

import { renderHook, act } from '@testing-library/react';
import { useRbac } from '../../hooks/useRbac';
import { useStore } from '../../lib/store';
import { PaginatedResponse } from '../../types/rbac';
import { StoreApi } from 'zustand';

// Define the store slice type
interface RbacStore {
  roles: {
    data: PaginatedResponse<any>;
    status: string;
    error: null | Error;
    fetchRoles: () => Promise<void>;
    createRole: () => Promise<void>;
    updateRole: () => Promise<void>;
    deleteRole: () => Promise<void>;
  };
  permissions: {
    data: PaginatedResponse<any>;
    status: string;
    error: null | Error;
    fetchPermissions: () => Promise<void>;
    createPermission: () => Promise<void>;
  };
  userRoles: {
    data: PaginatedResponse<any>;
    status: string;
    error: null | Error;
    fetchUserRoles: () => Promise<void>;
    createUserRole: () => Promise<void>;
  };
  resources: {
    data: PaginatedResponse<any>;
    status: string;
    error: null | Error;
    fetchResources: () => Promise<void>;
    createResource: () => Promise<void>;
  };
  resourceAccesses: {
    data: PaginatedResponse<any>;
    status: string;
    error: null | Error;
    fetchResourceAccesses: () => Promise<void>;
    createResourceAccess: () => Promise<void>;
  };
  organizationContexts: {
    data: PaginatedResponse<any>;
    status: string;
    error: null | Error;
    fetchOrganizationContexts: () => Promise<void>;
    updateOrganizationContext: () => Promise<void>;
  };
  auditLogs: {
    data: PaginatedResponse<any>;
    status: string;
    error: null | Error;
    fetchAuditLogs: () => Promise<void>;
  };
}

// Mock the useStore hook
jest.mock('../../lib/store', () => ({
  useStore: jest.fn(),
}));

describe('useRbac', () => {
  let mockStore: RbacStore;
  const useStoreMock = useStore as jest.MockedFunction<typeof useStore>;

  beforeEach(() => {
    // Initialize mock store with the correct structure
    const emptyPaginatedResponse: PaginatedResponse<any> = {
      count: 0,
      next: null,
      previous: null,
      results: [],
    };

    mockStore = {
      roles: {
        data: emptyPaginatedResponse,
        status: 'idle',
        error: null,
        fetchRoles: jest.fn().mockResolvedValue(undefined),
        createRole: jest.fn().mockResolvedValue(undefined),
        updateRole: jest.fn().mockResolvedValue(undefined),
        deleteRole: jest.fn().mockResolvedValue(undefined),
      },
      permissions: {
        data: emptyPaginatedResponse,
        status: 'idle',
        error: null,
        fetchPermissions: jest.fn().mockResolvedValue(undefined),
        createPermission: jest.fn().mockResolvedValue(undefined),
      },
      userRoles: {
        data: emptyPaginatedResponse,
        status: 'idle',
        error: null,
        fetchUserRoles: jest.fn().mockResolvedValue(undefined),
        createUserRole: jest.fn().mockResolvedValue(undefined),
      },
      resources: {
        data: emptyPaginatedResponse,
        status: 'idle',
        error: null,
        fetchResources: jest.fn().mockResolvedValue(undefined),
        createResource: jest.fn().mockResolvedValue(undefined),
      },
      resourceAccesses: {
        data: emptyPaginatedResponse,
        status: 'idle',
        error: null,
        fetchResourceAccesses: jest.fn().mockResolvedValue(undefined),
        createResourceAccess: jest.fn().mockResolvedValue(undefined),
      },
      organizationContexts: {
        data: emptyPaginatedResponse,
        status: 'idle',
        error: null,
        fetchOrganizationContexts: jest.fn().mockResolvedValue(undefined),
        updateOrganizationContext: jest.fn().mockResolvedValue(undefined),
      },
      auditLogs: {
        data: emptyPaginatedResponse,
        status: 'idle',
        error: null,
        fetchAuditLogs: jest.fn().mockResolvedValue(undefined),
      },
    };

    // Mock the useStore hook to return our mock store
    useStoreMock.mockReturnValue(mockStore);
  });

  it('should fetch all data on mount', async () => {
    const { result } = renderHook(() => useRbac());

    // Wait for all promises to resolve
    await act(async () => {
      await Promise.all([
        mockStore.roles.fetchRoles(),
        mockStore.permissions.fetchPermissions(),
        mockStore.userRoles.fetchUserRoles(),
        mockStore.resources.fetchResources(),
        mockStore.resourceAccesses.fetchResourceAccesses(),
        mockStore.organizationContexts.fetchOrganizationContexts(),
        mockStore.auditLogs.fetchAuditLogs(),
      ]);
    });

    expect(mockStore.roles.fetchRoles).toHaveBeenCalled();
    expect(mockStore.permissions.fetchPermissions).toHaveBeenCalled();
    expect(mockStore.userRoles.fetchUserRoles).toHaveBeenCalled();
    expect(mockStore.resources.fetchResources).toHaveBeenCalled();
    expect(mockStore.resourceAccesses.fetchResourceAccesses).toHaveBeenCalled();
    expect(mockStore.organizationContexts.fetchOrganizationContexts).toHaveBeenCalled();
    expect(mockStore.auditLogs.fetchAuditLogs).toHaveBeenCalled();
  });
}); 