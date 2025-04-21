/**
 * RBAC Store Slice
 * 
 * Manages Role-Based Access Control (RBAC) state:
 * - Role management
 * - Permission management
 * - User role management
 * - Resource management
 * - Resource access management
 * - Organization context management
 * - Audit log management
 */

import { create } from 'zustand';
import { 
  Role, 
  Permission, 
  UserRole, 
  Resource, 
  ResourceAccess, 
  OrganizationContext, 
  AuditLog, 
  PaginatedResponse 
} from '../../../types/rbac';
import * as rbacApi from '../../../lib/api/rbac';

// Define state types for each entity
interface EntityState<T> {
  status: 'idle' | 'loading' | 'success' | 'error';
  data: T | null;
  error: string | null;
}

interface RBACState {
  // Data
  roles: EntityState<PaginatedResponse<Role>>;
  permissions: EntityState<PaginatedResponse<Permission>>;
  userRoles: EntityState<PaginatedResponse<UserRole>>;
  resources: EntityState<PaginatedResponse<Resource>>;
  resourceAccesses: EntityState<PaginatedResponse<ResourceAccess>>;
  organizationContexts: EntityState<PaginatedResponse<OrganizationContext>>;
  auditLogs: EntityState<PaginatedResponse<AuditLog>>;
  
  // Actions
  // Role actions
  fetchRoles: () => Promise<void>;
  createRole: (role: Partial<Role>) => Promise<void>;
  updateRole: (id: string, role: Partial<Role>) => Promise<void>;
  deleteRole: (id: string) => Promise<void>;
  getRoleById: (id: string) => Role | undefined;
  
  // Permission actions
  fetchPermissions: () => Promise<void>;
  createPermission: (permission: Partial<Permission>) => Promise<void>;
  updatePermission: (id: string, permission: Partial<Permission>) => Promise<void>;
  deletePermission: (id: string) => Promise<void>;
  getPermissionById: (id: string) => Permission | undefined;
  
  // UserRole actions
  fetchUserRoles: () => Promise<void>;
  createUserRole: (userRole: Partial<UserRole>) => Promise<void>;
  updateUserRole: (id: string, userRole: Partial<UserRole>) => Promise<void>;
  deleteUserRole: (id: string) => Promise<void>;
  activateUserRole: (id: string) => Promise<void>;
  deactivateUserRole: (id: string) => Promise<void>;
  delegateUserRole: (id: string, targetUserId: string) => Promise<void>;
  getUserRoleById: (id: string) => UserRole | undefined;
  
  // Resource actions
  fetchResources: () => Promise<void>;
  createResource: (resource: Partial<Resource>) => Promise<void>;
  updateResource: (id: string, resource: Partial<Resource>) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;
  grantAccess: (id: string, roleId: string, permissionId: string) => Promise<void>;
  revokeAccess: (id: string, roleId: string, permissionId: string) => Promise<void>;
  getResourceById: (id: string) => Resource | undefined;
  
  // ResourceAccess actions
  fetchResourceAccesses: () => Promise<void>;
  createResourceAccess: (resourceAccess: Partial<ResourceAccess>) => Promise<void>;
  updateResourceAccess: (id: string, resourceAccess: Partial<ResourceAccess>) => Promise<void>;
  deleteResourceAccess: (id: string) => Promise<void>;
  activateResourceAccess: (id: string) => Promise<void>;
  deactivateResourceAccess: (id: string) => Promise<void>;
  getResourceAccessById: (id: string) => ResourceAccess | undefined;
  
  // OrganizationContext actions
  fetchOrganizationContexts: () => Promise<void>;
  createOrganizationContext: (organizationContext: Partial<OrganizationContext>) => Promise<void>;
  updateOrganizationContext: (id: string, organizationContext: Partial<OrganizationContext>) => Promise<void>;
  deleteOrganizationContext: (id: string) => Promise<void>;
  activateOrganizationContext: (id: string) => Promise<void>;
  deactivateOrganizationContext: (id: string) => Promise<void>;
  getOrganizationContextById: (id: string) => OrganizationContext | undefined;
  
  // AuditLog actions
  fetchAuditLogs: () => Promise<void>;
  getAuditLogById: (id: string) => AuditLog | undefined;
}

// Helper function to create initial entity state
const createInitialEntityState = <T>(): EntityState<T> => ({
  status: 'idle',
  data: null,
  error: null
});

// Create RBAC slice
export const createRbacSlice = (set: any, get: any, store: any) => ({
  // Initial state
  roles: createInitialEntityState<PaginatedResponse<Role>>(),
  permissions: createInitialEntityState<PaginatedResponse<Permission>>(),
  userRoles: createInitialEntityState<PaginatedResponse<UserRole>>(),
  resources: createInitialEntityState<PaginatedResponse<Resource>>(),
  resourceAccesses: createInitialEntityState<PaginatedResponse<ResourceAccess>>(),
  organizationContexts: createInitialEntityState<PaginatedResponse<OrganizationContext>>(),
  auditLogs: createInitialEntityState<PaginatedResponse<AuditLog>>(),

  // Role actions
  fetchRoles: async () => {
    try {
      set({ roles: { ...get().roles, status: 'loading', error: null } });
      const response = await rbacApi.getRoles();
      set({ roles: { status: 'success', data: response, error: null } });
    } catch (error) {
      set({ roles: { status: 'error', data: null, error: error instanceof Error ? error.message : 'Failed to fetch roles' } });
    }
  },

  createRole: async (role: Partial<Role>) => {
    try {
      set({ roles: { ...get().roles, status: 'loading', error: null } });
      const newRole = await rbacApi.createRole(role);
      const currentData = get().roles.data;
      if (currentData) {
        set({ roles: { status: 'success', data: { ...currentData, results: [...currentData.results, newRole] }, error: null } });
      }
    } catch (error) {
      set({ roles: { status: 'error', data: get().roles.data, error: error instanceof Error ? error.message : 'Failed to create role' } });
    }
  },

  updateRole: async (id: string, role: Partial<Role>) => {
    try {
      set({ roles: { ...get().roles, status: 'loading', error: null } });
      const updatedRole = await rbacApi.updateRole(id, role);
      const currentData = get().roles.data;
      if (currentData) {
        set({ roles: { status: 'success', data: { ...currentData, results: currentData.results.map(r => r.id === id ? updatedRole : r) }, error: null } });
      }
    } catch (error) {
      set({ roles: { status: 'error', data: get().roles.data, error: error instanceof Error ? error.message : 'Failed to update role' } });
    }
  },

  deleteRole: async (id: string) => {
    try {
      set({ roles: { ...get().roles, status: 'loading', error: null } });
      await rbacApi.deleteRole(id);
      const currentData = get().roles.data;
      if (currentData) {
        set({ roles: { status: 'success', data: { ...currentData, results: currentData.results.filter(r => r.id !== id) }, error: null } });
      }
    } catch (error) {
      set({ roles: { status: 'error', data: get().roles.data, error: error instanceof Error ? error.message : 'Failed to delete role' } });
    }
  },

  getRoleById: (id: string) => {
    const roles = get().roles.data?.results;
    return roles?.find(role => role.id === id);
  },

  // Permission actions
  fetchPermissions: async () => {
    try {
      set({ permissions: { ...get().permissions, status: 'loading', error: null } });
      const response = await rbacApi.getPermissions();
      set({ permissions: { status: 'success', data: response, error: null } });
    } catch (error) {
      set({ permissions: { status: 'error', data: null, error: error instanceof Error ? error.message : 'Failed to fetch permissions' } });
    }
  },

  createPermission: async (permission: Partial<Permission>) => {
    try {
      set({ permissions: { ...get().permissions, status: 'loading', error: null } });
      const newPermission = await rbacApi.createPermission(permission);
      const currentData = get().permissions.data;
      if (currentData) {
        set({ permissions: { status: 'success', data: { ...currentData, results: [...currentData.results, newPermission] }, error: null } });
      }
    } catch (error) {
      set({ permissions: { status: 'error', data: get().permissions.data, error: error instanceof Error ? error.message : 'Failed to create permission' } });
    }
  },

  updatePermission: async (id: string, permission: Partial<Permission>) => {
    try {
      set({ permissions: { ...get().permissions, status: 'loading', error: null } });
      const updatedPermission = await rbacApi.updatePermission(id, permission);
      const currentData = get().permissions.data;
      if (currentData) {
        set({ permissions: { status: 'success', data: { ...currentData, results: currentData.results.map(p => p.id === id ? updatedPermission : p) }, error: null } });
      }
    } catch (error) {
      set({ permissions: { status: 'error', data: get().permissions.data, error: error instanceof Error ? error.message : 'Failed to update permission' } });
    }
  },

  deletePermission: async (id: string) => {
    try {
      set({ permissions: { ...get().permissions, status: 'loading', error: null } });
      await rbacApi.deletePermission(id);
      const currentData = get().permissions.data;
      if (currentData) {
        set({ permissions: { status: 'success', data: { ...currentData, results: currentData.results.filter(p => p.id !== id) }, error: null } });
      }
    } catch (error) {
      set({ permissions: { status: 'error', data: get().permissions.data, error: error instanceof Error ? error.message : 'Failed to delete permission' } });
    }
  },

  getPermissionById: (id: string) => {
    const permissions = get().permissions.data?.results;
    return permissions?.find(permission => permission.id === id);
  },

  // UserRole actions
  fetchUserRoles: async () => {
    try {
      set({ userRoles: { ...get().userRoles, status: 'loading', error: null } });
      const response = await rbacApi.getUserRoles();
      set({ userRoles: { status: 'success', data: response, error: null } });
    } catch (error) {
      set({ userRoles: { status: 'error', data: null, error: error instanceof Error ? error.message : 'Failed to fetch user roles' } });
    }
  },

  createUserRole: async (userRole: Partial<UserRole>) => {
    try {
      set({ userRoles: { ...get().userRoles, status: 'loading', error: null } });
      const newUserRole = await rbacApi.createUserRole(userRole);
      const currentData = get().userRoles.data;
      if (currentData) {
        set({ userRoles: { status: 'success', data: { ...currentData, results: [...currentData.results, newUserRole] }, error: null } });
      }
    } catch (error) {
      set({ userRoles: { status: 'error', data: get().userRoles.data, error: error instanceof Error ? error.message : 'Failed to create user role' } });
    }
  },

  updateUserRole: async (id: string, userRole: Partial<UserRole>) => {
    try {
      set({ userRoles: { ...get().userRoles, status: 'loading', error: null } });
      const updatedUserRole = await rbacApi.updateUserRole(id, userRole);
      const currentData = get().userRoles.data;
      if (currentData) {
        set({ userRoles: { status: 'success', data: { ...currentData, results: currentData.results.map(ur => ur.id === id ? updatedUserRole : ur) }, error: null } });
      }
    } catch (error) {
      set({ userRoles: { status: 'error', data: get().userRoles.data, error: error instanceof Error ? error.message : 'Failed to update user role' } });
    }
  },

  deleteUserRole: async (id: string) => {
    try {
      set({ userRoles: { ...get().userRoles, status: 'loading', error: null } });
      await rbacApi.deleteUserRole(id);
      const currentData = get().userRoles.data;
      if (currentData) {
        set({ userRoles: { status: 'success', data: { ...currentData, results: currentData.results.filter(ur => ur.id !== id) }, error: null } });
      }
    } catch (error) {
      set({ userRoles: { status: 'error', data: get().userRoles.data, error: error instanceof Error ? error.message : 'Failed to delete user role' } });
    }
  },

  activateUserRole: async (id: string) => {
    try {
      set({ userRoles: { ...get().userRoles, status: 'loading', error: null } });
      const activatedUserRole = await rbacApi.activateUserRole(id);
      const currentData = get().userRoles.data;
      if (currentData) {
        set({ userRoles: { status: 'success', data: { ...currentData, results: currentData.results.map(ur => ur.id === id ? activatedUserRole : ur) }, error: null } });
      }
    } catch (error) {
      set({ userRoles: { status: 'error', data: get().userRoles.data, error: error instanceof Error ? error.message : 'Failed to activate user role' } });
    }
  },

  deactivateUserRole: async (id: string) => {
    try {
      set({ userRoles: { ...get().userRoles, status: 'loading', error: null } });
      const deactivatedUserRole = await rbacApi.deactivateUserRole(id);
      const currentData = get().userRoles.data;
      if (currentData) {
        set({ userRoles: { status: 'success', data: { ...currentData, results: currentData.results.map(ur => ur.id === id ? deactivatedUserRole : ur) }, error: null } });
      }
    } catch (error) {
      set({ userRoles: { status: 'error', data: get().userRoles.data, error: error instanceof Error ? error.message : 'Failed to deactivate user role' } });
    }
  },

  delegateUserRole: async (id: string, targetUserId: string) => {
    try {
      set({ userRoles: { ...get().userRoles, status: 'loading', error: null } });
      const delegatedUserRole = await rbacApi.delegateUserRole(id, targetUserId);
      const currentData = get().userRoles.data;
      if (currentData) {
        set({ userRoles: { status: 'success', data: { ...currentData, results: [...currentData.results, delegatedUserRole] }, error: null } });
      }
    } catch (error) {
      set({ userRoles: { status: 'error', data: get().userRoles.data, error: error instanceof Error ? error.message : 'Failed to delegate user role' } });
    }
  },

  getUserRoleById: (id: string) => {
    const userRoles = get().userRoles.data?.results;
    return userRoles?.find(userRole => userRole.id === id);
  },

  // Resource actions
  fetchResources: async () => {
    try {
      set({ resources: { ...get().resources, status: 'loading', error: null } });
      const response = await rbacApi.listResources();
      set({ resources: { status: 'success', data: response, error: null } });
    } catch (error) {
      set({ resources: { status: 'error', data: null, error: error instanceof Error ? error.message : 'Failed to fetch resources' } });
    }
  },

  createResource: async (resource: Partial<Resource>) => {
    try {
      set({ resources: { ...get().resources, status: 'loading', error: null } });
      const newResource = await rbacApi.createResource(resource);
      const currentData = get().resources.data;
      if (currentData) {
        set({ resources: { status: 'success', data: { ...currentData, results: [...currentData.results, newResource] }, error: null } });
      }
    } catch (error) {
      set({ resources: { status: 'error', data: get().resources.data, error: error instanceof Error ? error.message : 'Failed to create resource' } });
    }
  },

  updateResource: async (id: string, resource: Partial<Resource>) => {
    try {
      set({ resources: { ...get().resources, status: 'loading', error: null } });
      const updatedResource = await rbacApi.updateResource(id, resource);
      const currentData = get().resources.data;
      if (currentData) {
        set({ resources: { status: 'success', data: { ...currentData, results: currentData.results.map(r => r.id === id ? updatedResource : r) }, error: null } });
      }
    } catch (error) {
      set({ resources: { status: 'error', data: get().resources.data, error: error instanceof Error ? error.message : 'Failed to update resource' } });
    }
  },

  deleteResource: async (id: string) => {
    try {
      set({ resources: { ...get().resources, status: 'loading', error: null } });
      await rbacApi.deleteResource(id);
      const currentData = get().resources.data;
      if (currentData) {
        set({ resources: { status: 'success', data: { ...currentData, results: currentData.results.filter(r => r.id !== id) }, error: null } });
      }
    } catch (error) {
      set({ resources: { status: 'error', data: get().resources.data, error: error instanceof Error ? error.message : 'Failed to delete resource' } });
    }
  },

  grantAccess: async (id: string, roleId: string, permissionId: string) => {
    try {
      set({ resourceAccesses: { ...get().resourceAccesses, status: 'loading', error: null } });
      const newResourceAccess = await rbacApi.grantAccess(id, roleId, permissionId);
      const currentData = get().resourceAccesses.data;
      if (currentData) {
        set({ resourceAccesses: { status: 'success', data: { ...currentData, results: [...currentData.results, newResourceAccess] }, error: null } });
      }
    } catch (error) {
      set({ resourceAccesses: { status: 'error', data: get().resourceAccesses.data, error: error instanceof Error ? error.message : 'Failed to grant access' } });
    }
  },

  revokeAccess: async (id: string, roleId: string, permissionId: string) => {
    try {
      set({ resourceAccesses: { ...get().resourceAccesses, status: 'loading', error: null } });
      await rbacApi.revokeAccess(id, roleId, permissionId);
      const currentData = get().resourceAccesses.data;
      if (currentData) {
        set({ resourceAccesses: { status: 'success', data: { ...currentData, results: currentData.results.filter(ra => !(ra.resource_id === id && ra.role_id === roleId && ra.permission_id === permissionId)) }, error: null } });
      }
    } catch (error) {
      set({ resourceAccesses: { status: 'error', data: get().resourceAccesses.data, error: error instanceof Error ? error.message : 'Failed to revoke access' } });
    }
  },

  getResourceById: (id: string) => {
    const resources = get().resources.data?.results;
    return resources?.find(resource => resource.id === id);
  },

  // ResourceAccess actions
  fetchResourceAccesses: async () => {
    try {
      set({ resourceAccesses: { ...get().resourceAccesses, status: 'loading', error: null } });
      const response = await rbacApi.getResourceAccesses();
      set({ resourceAccesses: { status: 'success', data: response, error: null } });
    } catch (error) {
      set({ resourceAccesses: { status: 'error', data: null, error: error instanceof Error ? error.message : 'Failed to fetch resource access' } });
    }
  },

  createResourceAccess: async (resourceAccess: Partial<ResourceAccess>) => {
    try {
      set({ resourceAccesses: { ...get().resourceAccesses, status: 'loading', error: null } });
      const newResourceAccess = await rbacApi.createResourceAccess(resourceAccess);
      const currentData = get().resourceAccesses.data;
      if (currentData) {
        set({ resourceAccesses: { status: 'success', data: { ...currentData, results: [...currentData.results, newResourceAccess] }, error: null } });
      }
    } catch (error) {
      set({ resourceAccesses: { status: 'error', data: get().resourceAccesses.data, error: error instanceof Error ? error.message : 'Failed to create resource access' } });
    }
  },

  updateResourceAccess: async (id: string, resourceAccess: Partial<ResourceAccess>) => {
    try {
      set({ resourceAccesses: { ...get().resourceAccesses, status: 'loading', error: null } });
      const updatedResourceAccess = await rbacApi.updateResourceAccess(id, resourceAccess);
      const currentData = get().resourceAccesses.data;
      if (currentData) {
        set({ resourceAccesses: { status: 'success', data: { ...currentData, results: currentData.results.map(ra => ra.id === id ? updatedResourceAccess : ra) }, error: null } });
      }
    } catch (error) {
      set({ resourceAccesses: { status: 'error', data: get().resourceAccesses.data, error: error instanceof Error ? error.message : 'Failed to update resource access' } });
    }
  },

  deleteResourceAccess: async (id: string) => {
    try {
      set({ resourceAccesses: { ...get().resourceAccesses, status: 'loading', error: null } });
      await rbacApi.deleteResourceAccess(id);
      const currentData = get().resourceAccesses.data;
      if (currentData) {
        set({ resourceAccesses: { status: 'success', data: { ...currentData, results: currentData.results.filter(ra => ra.id !== id) }, error: null } });
      }
    } catch (error) {
      set({ resourceAccesses: { status: 'error', data: get().resourceAccesses.data, error: error instanceof Error ? error.message : 'Failed to delete resource access' } });
    }
  },

  activateResourceAccess: async (id: string) => {
    try {
      set({ resourceAccesses: { ...get().resourceAccesses, status: 'loading', error: null } });
      const activatedResourceAccess = await rbacApi.activateResourceAccess(id);
      const currentData = get().resourceAccesses.data;
      if (currentData) {
        set({ resourceAccesses: { status: 'success', data: { ...currentData, results: currentData.results.map(ra => ra.id === id ? activatedResourceAccess : ra) }, error: null } });
      }
    } catch (error) {
      set({ resourceAccesses: { status: 'error', data: get().resourceAccesses.data, error: error instanceof Error ? error.message : 'Failed to activate resource access' } });
    }
  },

  deactivateResourceAccess: async (id: string) => {
    try {
      set({ resourceAccesses: { ...get().resourceAccesses, status: 'loading', error: null } });
      const deactivatedResourceAccess = await rbacApi.deactivateResourceAccess(id);
      const currentData = get().resourceAccesses.data;
      if (currentData) {
        set({ resourceAccesses: { status: 'success', data: { ...currentData, results: currentData.results.map(ra => ra.id === id ? deactivatedResourceAccess : ra) }, error: null } });
      }
    } catch (error) {
      set({ resourceAccesses: { status: 'error', data: get().resourceAccesses.data, error: error instanceof Error ? error.message : 'Failed to deactivate resource access' } });
    }
  },

  getResourceAccessById: (id: string) => {
    const resourceAccesses = get().resourceAccesses.data?.results;
    return resourceAccesses?.find(access => access.id === id);
  },

  // OrganizationContext actions
  fetchOrganizationContexts: async () => {
    try {
      set({ organizationContexts: { ...get().organizationContexts, status: 'loading', error: null } });
      const response = await rbacApi.getOrganizationContexts();
      set({ organizationContexts: { status: 'success', data: response, error: null } });
    } catch (error) {
      set({ organizationContexts: { status: 'error', data: null, error: error instanceof Error ? error.message : 'Failed to fetch organization contexts' } });
    }
  },

  createOrganizationContext: async (organizationContext: Partial<OrganizationContext>) => {
    try {
      set({ organizationContexts: { ...get().organizationContexts, status: 'loading', error: null } });
      const newOrganizationContext = await rbacApi.createOrganizationContext(organizationContext);
      const currentData = get().organizationContexts.data;
      if (currentData) {
        set({ organizationContexts: { status: 'success', data: { ...currentData, results: [...currentData.results, newOrganizationContext] }, error: null } });
      }
    } catch (error) {
      set({ organizationContexts: { status: 'error', data: get().organizationContexts.data, error: error instanceof Error ? error.message : 'Failed to create organization context' } });
    }
  },

  updateOrganizationContext: async (id: string, organizationContext: Partial<OrganizationContext>) => {
    try {
      set({ organizationContexts: { ...get().organizationContexts, status: 'loading', error: null } });
      const updatedOrganizationContext = await rbacApi.updateOrganizationContext(id, organizationContext);
      const currentData = get().organizationContexts.data;
      if (currentData) {
        set({ organizationContexts: { status: 'success', data: { ...currentData, results: currentData.results.map(oc => oc.id === id ? updatedOrganizationContext : oc) }, error: null } });
      }
    } catch (error) {
      set({ organizationContexts: { status: 'error', data: get().organizationContexts.data, error: error instanceof Error ? error.message : 'Failed to update organization context' } });
    }
  },

  deleteOrganizationContext: async (id: string) => {
    try {
      set({ organizationContexts: { ...get().organizationContexts, status: 'loading', error: null } });
      await rbacApi.deleteOrganizationContext(id);
      const currentData = get().organizationContexts.data;
      if (currentData) {
        set({ organizationContexts: { status: 'success', data: { ...currentData, results: currentData.results.filter(oc => oc.id !== id) }, error: null } });
      }
    } catch (error) {
      set({ organizationContexts: { status: 'error', data: get().organizationContexts.data, error: error instanceof Error ? error.message : 'Failed to delete organization context' } });
    }
  },

  activateOrganizationContext: async (id: string) => {
    try {
      set({ organizationContexts: { ...get().organizationContexts, status: 'loading', error: null } });
      const activatedOrganizationContext = await rbacApi.activateOrganizationContext(id);
      const currentData = get().organizationContexts.data;
      if (currentData) {
        set({ organizationContexts: { status: 'success', data: { ...currentData, results: currentData.results.map(oc => oc.id === id ? activatedOrganizationContext : oc) }, error: null } });
      }
    } catch (error) {
      set({ organizationContexts: { status: 'error', data: get().organizationContexts.data, error: error instanceof Error ? error.message : 'Failed to activate organization context' } });
    }
  },

  deactivateOrganizationContext: async (id: string) => {
    try {
      set({ organizationContexts: { ...get().organizationContexts, status: 'loading', error: null } });
      const deactivatedOrganizationContext = await rbacApi.deactivateOrganizationContext(id);
      const currentData = get().organizationContexts.data;
      if (currentData) {
        set({ organizationContexts: { status: 'success', data: { ...currentData, results: currentData.results.map(oc => oc.id === id ? deactivatedOrganizationContext : oc) }, error: null } });
      }
    } catch (error) {
      set({ organizationContexts: { status: 'error', data: get().organizationContexts.data, error: error instanceof Error ? error.message : 'Failed to deactivate organization context' } });
    }
  },

  getOrganizationContextById: (id: string) => {
    const organizationContexts = get().organizationContexts.data?.results;
    return organizationContexts?.find(context => context.id === id);
  },

  // AuditLog actions
  fetchAuditLogs: async () => {
    try {
      set({ auditLogs: { ...get().auditLogs, status: 'loading', error: null } });
      const response = await rbacApi.getAuditLogs();
      set({ auditLogs: { status: 'success', data: response, error: null } });
    } catch (error) {
      set({ auditLogs: { status: 'error', data: null, error: error instanceof Error ? error.message : 'Failed to fetch audit logs' } });
    }
  },

  getAuditLogById: (id: string) => {
    const auditLogs = get().auditLogs.data?.results;
    return auditLogs?.find(auditLog => auditLog.id === id);
  }
});

// Selectors
export const selectRoleById = (state: RBACState, id: string) => state.roles.data?.results.find((role) => role.id === id);
export const selectRoleByName = (state: RBACState, name: string) => state.roles.data?.results.find((role) => role.name === name);
export const selectRoleDetails = (state: RBACState, id: string) => state.roles.data?.results.find((r) => r.id === id);

export const selectPermissionById = (state: RBACState, id: string) => state.permissions.data?.results.find((permission) => permission.id === id);
export const selectPermissionByName = (state: RBACState, name: string) => state.permissions.data?.results.find((permission) => permission.name === name);
export const selectPermissionDetails = (state: RBACState, id: string) => state.permissions.data?.results.find((p) => p.id === id);

export const selectUserRoleById = (state: RBACState, id: string) => state.userRoles.data?.results.find((userRole) => userRole.id === id);
export const selectUserRoleByUserId = (state: RBACState, userId: string) => state.userRoles.data?.results.find((userRole) => userRole.user_id === userId); 