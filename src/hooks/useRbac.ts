/**
 * RBAC Hooks
 * 
 * This file provides hooks for Role-Based Access Control (RBAC) operations:
 * - Role management
 * - Permission management
 * - User role management
 * - Resource management
 * - Resource access management
 * - Organization context management
 * - Audit log management
 */

import { useState, useCallback, useEffect } from 'react';
import { useStore } from '../lib/store';
import { 
  Role, 
  Permission, 
  UserRole, 
  Resource, 
  ResourceAccess, 
  OrganizationContext, 
  AuditLog, 
  PaginatedResponse 
} from '../types/rbac';
import * as rbacApi from '../lib/api/rbac';
import { RootState } from '../lib/store/slices';

interface Store extends RootState {
  roles: {
    data: PaginatedResponse<Role> | null;
    fetchRoles: () => Promise<void>;
    createRole: (role: Partial<Role>) => Promise<void>;
    updateRole: (id: string, role: Partial<Role>) => Promise<void>;
    deleteRole: (id: string) => Promise<void>;
  };
  permissions: {
    data: PaginatedResponse<Permission> | null;
    fetchPermissions: () => Promise<void>;
    createPermission: (permission: Partial<Permission>) => Promise<void>;
    updatePermission: (id: string, permission: Partial<Permission>) => Promise<void>;
    deletePermission: (id: string) => Promise<void>;
  };
  userRoles: {
    data: PaginatedResponse<UserRole> | null;
    fetchUserRoles: () => Promise<void>;
    createUserRole: (userRole: Partial<UserRole>) => Promise<void>;
  };
  resources: {
    data: PaginatedResponse<Resource> | null;
    fetchResources: () => Promise<void>;
    createResource: (resource: Partial<Resource>) => Promise<void>;
  };
  resourceAccesses: {
    data: PaginatedResponse<ResourceAccess> | null;
    fetchResourceAccesses: () => Promise<void>;
    createResourceAccess: (access: Partial<ResourceAccess>) => Promise<void>;
  };
  organizationContexts: {
    data: PaginatedResponse<OrganizationContext> | null;
    fetchOrganizationContexts: () => Promise<void>;
    createOrganizationContext: (context: Partial<OrganizationContext>) => Promise<void>;
    updateOrganizationContext: (id: string, context: Partial<OrganizationContext>) => Promise<void>;
    deleteOrganizationContext: (id: string) => Promise<void>;
    activateOrganizationContext: (id: string) => Promise<void>;
    deactivateOrganizationContext: (id: string) => Promise<void>;
  };
  auditLogs: {
    data: PaginatedResponse<AuditLog> | null;
    fetchAuditLogs: () => Promise<void>;
  };
}

interface HookState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
}

interface SingleHookState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export const useRbac = () => {
  const store = useStore() as Store;
  console.log('useRbac hook initialized with store:', store);

  // Roles
  const [roles, setRoles] = useState<HookState<Role>>({
    data: [],
    loading: false,
    error: null
  });

  const fetchRoles = useCallback(async () => {
    console.log('Fetching roles from store');
    setRoles(prev => ({ ...prev, loading: true, error: null }));
    try {
      await store.roles.fetchRoles();
      const storeRoles = store.roles.data?.results || [];
      console.log('Roles fetched from store:', storeRoles);
      setRoles({ data: storeRoles, loading: false, error: null });
    } catch (error) {
      console.error('Error fetching roles:', error);
      setRoles(prev => ({ ...prev, loading: false, error: error instanceof Error ? error.message : 'Failed to fetch roles' }));
    }
  }, [store]);

  const createRole = useCallback(async (role: Partial<Role>) => {
    console.log('Creating role:', role);
    setRoles(prev => ({ ...prev, loading: true, error: null }));
    try {
      await store.roles.createRole(role);
      const storeRoles = store.roles.data?.results || [];
      console.log('Role created, updated roles:', storeRoles);
      setRoles({ data: storeRoles, loading: false, error: null });
    } catch (error) {
      console.error('Error creating role:', error);
      setRoles(prev => ({ ...prev, loading: false, error: error instanceof Error ? error.message : 'Failed to create role' }));
    }
  }, [store]);

  const updateRole = useCallback(async (id: string, role: Partial<Role>) => {
    console.log('Updating role:', id, role);
    setRoles(prev => ({ ...prev, loading: true, error: null }));
    try {
      await store.roles.updateRole(id, role);
      const storeRoles = store.roles.data?.results || [];
      console.log('Role updated, updated roles:', storeRoles);
      setRoles({ data: storeRoles, loading: false, error: null });
    } catch (error) {
      console.error('Error updating role:', error);
      setRoles(prev => ({ ...prev, loading: false, error: error instanceof Error ? error.message : 'Failed to update role' }));
    }
  }, [store]);

  const removeRole = useCallback(async (id: string) => {
    console.log('Removing role:', id);
    setRoles(prev => ({ ...prev, loading: true, error: null }));
    try {
      await store.roles.deleteRole(id);
      const storeRoles = store.roles.data?.results || [];
      console.log('Role removed, updated roles:', storeRoles);
      setRoles({ data: storeRoles, loading: false, error: null });
    } catch (error) {
      console.error('Error removing role:', error);
      setRoles(prev => ({ ...prev, loading: false, error: error instanceof Error ? error.message : 'Failed to delete role' }));
    }
  }, [store]);

  // Permissions
  const [permissions, setPermissions] = useState<HookState<Permission>>({
    data: [],
    loading: false,
    error: null
  });

  const fetchPermissions = useCallback(async () => {
    console.log('Fetching permissions from store');
    setPermissions(prev => ({ ...prev, loading: true, error: null }));
    try {
      await store.permissions.fetchPermissions();
      const storePermissions = store.permissions.data?.results || [];
      console.log('Permissions fetched from store:', storePermissions);
      setPermissions({ data: storePermissions, loading: false, error: null });
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setPermissions(prev => ({ ...prev, loading: false, error: error instanceof Error ? error.message : 'Failed to fetch permissions' }));
    }
  }, [store]);

  const createPermission = useCallback(async (permission: Partial<Permission>) => {
    console.log('Creating permission:', permission);
    setPermissions(prev => ({ ...prev, loading: true, error: null }));
    try {
      await store.permissions.createPermission(permission);
      const storePermissions = store.permissions.data?.results || [];
      console.log('Permission created, updated permissions:', storePermissions);
      setPermissions({ data: storePermissions, loading: false, error: null });
    } catch (error) {
      console.error('Error creating permission:', error);
      setPermissions(prev => ({ ...prev, loading: false, error: error instanceof Error ? error.message : 'Failed to create permission' }));
    }
  }, [store]);

  const updatePermission = useCallback(async (id: string, permission: Partial<Permission>) => {
    console.log('Updating permission:', id, permission);
    setPermissions(prev => ({ ...prev, loading: true, error: null }));
    try {
      await store.permissions.updatePermission(id, permission);
      const storePermissions = store.permissions.data?.results || [];
      console.log('Permission updated, updated permissions:', storePermissions);
      setPermissions({ data: storePermissions, loading: false, error: null });
    } catch (error) {
      console.error('Error updating permission:', error);
      setPermissions(prev => ({ ...prev, loading: false, error: error instanceof Error ? error.message : 'Failed to update permission' }));
    }
  }, [store]);

  const deletePermission = useCallback(async (id: string) => {
    console.log('Deleting permission:', id);
    setPermissions(prev => ({ ...prev, loading: true, error: null }));
    try {
      await store.permissions.deletePermission(id);
      const storePermissions = store.permissions.data?.results || [];
      console.log('Permission deleted, updated permissions:', storePermissions);
      setPermissions({ data: storePermissions, loading: false, error: null });
    } catch (error) {
      console.error('Error deleting permission:', error);
      setPermissions(prev => ({ ...prev, loading: false, error: error instanceof Error ? error.message : 'Failed to delete permission' }));
    }
  }, [store]);

  // User Roles
  const [userRoles, setUserRoles] = useState<HookState<UserRole>>({
    data: [],
    loading: false,
    error: null
  });

  const fetchUserRoles = useCallback(async () => {
    console.log('Fetching user roles from store');
    setUserRoles(prev => ({ ...prev, loading: true, error: null }));
    try {
      await store.userRoles.fetchUserRoles();
      const storeUserRoles = store.userRoles.data?.results || [];
      console.log('User roles fetched from store:', storeUserRoles);
      setUserRoles({ data: storeUserRoles, loading: false, error: null });
    } catch (error) {
      console.error('Error fetching user roles:', error);
      setUserRoles(prev => ({ ...prev, loading: false, error: error instanceof Error ? error.message : 'Failed to fetch user roles' }));
    }
  }, [store]);

  const createUserRole = useCallback(async (userRole: Partial<UserRole>) => {
    console.log('Creating user role:', userRole);
    setUserRoles(prev => ({ ...prev, loading: true, error: null }));
    try {
      await store.userRoles.createUserRole(userRole);
      const storeUserRoles = store.userRoles.data?.results || [];
      console.log('User role created, updated user roles:', storeUserRoles);
      setUserRoles({ data: storeUserRoles, loading: false, error: null });
    } catch (error) {
      console.error('Error creating user role:', error);
      setUserRoles(prev => ({ ...prev, loading: false, error: error instanceof Error ? error.message : 'Failed to create user role' }));
    }
  }, [store]);

  // Resources
  const [resources, setResources] = useState<HookState<Resource>>({
    data: [],
    loading: false,
    error: null
  });

  const fetchResources = useCallback(async () => {
    console.log('Fetching resources from store');
    setResources(prev => ({ ...prev, loading: true, error: null }));
    try {
      await store.resources.fetchResources();
      const storeResources = store.resources.data?.results || [];
      console.log('Resources fetched from store:', storeResources);
      setResources({ data: storeResources, loading: false, error: null });
    } catch (error) {
      console.error('Error fetching resources:', error);
      setResources(prev => ({ ...prev, loading: false, error: error instanceof Error ? error.message : 'Failed to fetch resources' }));
    }
  }, [store]);

  const createResource = useCallback(async (resource: Partial<Resource>) => {
    console.log('Creating resource:', resource);
    setResources(prev => ({ ...prev, loading: true, error: null }));
    try {
      await store.resources.createResource(resource);
      const storeResources = store.resources.data?.results || [];
      console.log('Resource created, updated resources:', storeResources);
      setResources({ data: storeResources, loading: false, error: null });
    } catch (error) {
      console.error('Error creating resource:', error);
      setResources(prev => ({ ...prev, loading: false, error: error instanceof Error ? error.message : 'Failed to create resource' }));
    }
  }, [store]);

  // Resource Access
  const [resourceAccess, setResourceAccess] = useState<HookState<ResourceAccess>>({
    data: [],
    loading: false,
    error: null
  });

  const fetchResourceAccess = useCallback(async () => {
    console.log('Fetching resource access from store');
    setResourceAccess(prev => ({ ...prev, loading: true, error: null }));
    try {
      await store.resourceAccesses.fetchResourceAccesses();
      const storeResourceAccess = store.resourceAccesses.data?.results || [];
      console.log('Resource access fetched from store:', storeResourceAccess);
      setResourceAccess({ data: storeResourceAccess, loading: false, error: null });
    } catch (error) {
      console.error('Error fetching resource access:', error);
      setResourceAccess(prev => ({ ...prev, loading: false, error: error instanceof Error ? error.message : 'Failed to fetch resource access' }));
    }
  }, [store]);

  const createResourceAccess = useCallback(async (access: Partial<ResourceAccess>) => {
    console.log('Creating resource access:', access);
    setResourceAccess(prev => ({ ...prev, loading: true, error: null }));
    try {
      await store.resourceAccesses.createResourceAccess(access);
      const storeResourceAccess = store.resourceAccesses.data?.results || [];
      console.log('Resource access created, updated resource access:', storeResourceAccess);
      setResourceAccess({ data: storeResourceAccess, loading: false, error: null });
    } catch (error) {
      console.error('Error creating resource access:', error);
      setResourceAccess(prev => ({ ...prev, loading: false, error: error instanceof Error ? error.message : 'Failed to create resource access' }));
    }
  }, [store]);

  // Organization Contexts
  const [organizationContexts, setOrganizationContexts] = useState<HookState<OrganizationContext>>({
    data: [],
    loading: false,
    error: null
  });

  const fetchOrganizationContexts = useCallback(async () => {
    console.log('Fetching organization contexts from store');
    setOrganizationContexts(prev => ({ ...prev, loading: true, error: null }));
    try {
      await store.organizationContexts.fetchOrganizationContexts();
      const storeContexts = store.organizationContexts.data?.results || [];
      console.log('Organization contexts fetched from store:', storeContexts);
      setOrganizationContexts({ data: storeContexts, loading: false, error: null });
    } catch (error) {
      console.error('Error fetching organization contexts:', error);
      setOrganizationContexts(prev => ({ ...prev, loading: false, error: error instanceof Error ? error.message : 'Failed to fetch organization contexts' }));
    }
  }, [store]);

  const createOrganizationContext = useCallback(async (context: Partial<OrganizationContext>) => {
    console.log('Creating organization context:', context);
    setOrganizationContexts(prev => ({ ...prev, loading: true, error: null }));
    try {
      await store.organizationContexts.createOrganizationContext(context);
      const storeContexts = store.organizationContexts.data?.results || [];
      console.log('Organization context created, updated contexts:', storeContexts);
      setOrganizationContexts({ data: storeContexts, loading: false, error: null });
    } catch (error) {
      console.error('Error creating organization context:', error);
      setOrganizationContexts(prev => ({ ...prev, loading: false, error: error instanceof Error ? error.message : 'Failed to create organization context' }));
    }
  }, [store]);

  const updateOrganizationContext = useCallback(async (id: string, context: Partial<OrganizationContext>) => {
    console.log('Updating organization context:', id, context);
    setOrganizationContexts(prev => ({ ...prev, loading: true, error: null }));
    try {
      await store.organizationContexts.updateOrganizationContext(id, context);
      const storeContexts = store.organizationContexts.data?.results || [];
      console.log('Organization context updated, updated contexts:', storeContexts);
      setOrganizationContexts({ data: storeContexts, loading: false, error: null });
    } catch (error) {
      console.error('Error updating organization context:', error);
      setOrganizationContexts(prev => ({ ...prev, loading: false, error: error instanceof Error ? error.message : 'Failed to update organization context' }));
    }
  }, [store]);

  const deleteOrganizationContext = useCallback(async (id: string) => {
    console.log('Deleting organization context:', id);
    setOrganizationContexts(prev => ({ ...prev, loading: true, error: null }));
    try {
      await store.organizationContexts.deleteOrganizationContext(id);
      const storeContexts = store.organizationContexts.data?.results || [];
      console.log('Organization context deleted, updated contexts:', storeContexts);
      setOrganizationContexts({ data: storeContexts, loading: false, error: null });
    } catch (error) {
      console.error('Error deleting organization context:', error);
      setOrganizationContexts(prev => ({ ...prev, loading: false, error: error instanceof Error ? error.message : 'Failed to delete organization context' }));
    }
  }, [store]);

  const activateOrganizationContext = useCallback(async (id: string) => {
    console.log('Activating organization context:', id);
    setOrganizationContexts(prev => ({ ...prev, loading: true, error: null }));
    try {
      await store.organizationContexts.activateOrganizationContext(id);
      const storeContexts = store.organizationContexts.data?.results || [];
      console.log('Organization context activated, updated contexts:', storeContexts);
      setOrganizationContexts({ data: storeContexts, loading: false, error: null });
    } catch (error) {
      console.error('Error activating organization context:', error);
      setOrganizationContexts(prev => ({ ...prev, loading: false, error: error instanceof Error ? error.message : 'Failed to activate organization context' }));
    }
  }, [store]);

  const deactivateOrganizationContext = useCallback(async (id: string) => {
    console.log('Deactivating organization context:', id);
    setOrganizationContexts(prev => ({ ...prev, loading: true, error: null }));
    try {
      await store.organizationContexts.deactivateOrganizationContext(id);
      const storeContexts = store.organizationContexts.data?.results || [];
      console.log('Organization context deactivated, updated contexts:', storeContexts);
      setOrganizationContexts({ data: storeContexts, loading: false, error: null });
    } catch (error) {
      console.error('Error deactivating organization context:', error);
      setOrganizationContexts(prev => ({ ...prev, loading: false, error: error instanceof Error ? error.message : 'Failed to deactivate organization context' }));
    }
  }, [store]);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<HookState<AuditLog>>({
    data: [],
    loading: false,
    error: null
  });

  const fetchAuditLogs = useCallback(async () => {
    console.log('Fetching audit logs from store');
    setAuditLogs(prev => ({ ...prev, loading: true, error: null }));
    try {
      await store.auditLogs.fetchAuditLogs();
      const storeAuditLogs = store.auditLogs.data?.results || [];
      console.log('Audit logs fetched from store:', storeAuditLogs);
      setAuditLogs({ data: storeAuditLogs, loading: false, error: null });
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      setAuditLogs(prev => ({ ...prev, loading: false, error: error instanceof Error ? error.message : 'Failed to fetch audit logs' }));
    }
  }, [store]);

  const createAuditLog = useCallback(async (log: Partial<AuditLog>) => {
    console.log('Creating audit log:', log);
    setAuditLogs(prev => ({ ...prev, loading: true, error: null }));
    try {
      // Since there's no createAuditLog API method, we'll just update the local state
      const newLog: AuditLog = {
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...log
      } as AuditLog;
      setAuditLogs(prev => ({ ...prev, data: [...prev.data, newLog], loading: false, error: null }));
    } catch (error) {
      console.error('Error creating audit log:', error);
      setAuditLogs(prev => ({ ...prev, loading: false, error: error instanceof Error ? error.message : 'Failed to create audit log' }));
    }
  }, []);

  // Initialize data on mount
  useEffect(() => {
    console.log('useRbac hook mounted, initializing data');
    fetchRoles();
    fetchPermissions();
    fetchUserRoles();
    fetchResources();
    fetchResourceAccess();
    fetchOrganizationContexts();
    fetchAuditLogs();
  }, [fetchRoles, fetchPermissions, fetchUserRoles, fetchResources, fetchResourceAccess, fetchOrganizationContexts, fetchAuditLogs]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activateUserRole = async (userRoleId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Implement API call to activate user role
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to activate user role');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deactivateUserRole = async (userRoleId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Implement API call to deactivate user role
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deactivate user role');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const delegateUserRole = async (userRoleId: string, delegatedBy: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Implement API call to delegate user role
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delegate user role');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const submitUserRole = async (userRole: Partial<UserRole>): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Implement API call to submit user role
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit user role');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    roles: {
      ...roles,
      fetch: fetchRoles,
      create: createRole,
      update: updateRole,
      remove: removeRole
    },
    permissions: {
      ...permissions,
      fetch: fetchPermissions,
      create: createPermission,
      update: updatePermission,
      delete: deletePermission
    },
    userRoles: {
      ...userRoles,
      fetch: fetchUserRoles,
      create: createUserRole
    },
    resources: {
      ...resources,
      fetch: fetchResources,
      create: createResource
    },
    resourceAccess: {
      ...resourceAccess,
      fetch: fetchResourceAccess,
      create: createResourceAccess
    },
    organizationContexts,
    fetchOrganizationContexts,
    createOrganizationContext,
    updateOrganizationContext,
    deleteOrganizationContext,
    activateOrganizationContext,
    deactivateOrganizationContext,
    auditLogs: {
      ...auditLogs,
      fetch: fetchAuditLogs,
      create: createAuditLog
    },
    loading,
    error,
    activateUserRole,
    deactivateUserRole,
    delegateUserRole,
    submitUserRole,
  };
}; 