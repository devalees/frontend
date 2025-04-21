/**
 * RBAC Permission Check Utility
 * 
 * This file provides utility functions and hooks for checking permissions:
 * - hasPermission: Check if a user has a specific permission
 * - hasAnyPermission: Check if a user has any of the specified permissions
 * - hasAllPermissions: Check if a user has all of the specified permissions
 * - hasResourcePermission: Check if a user has permission for a specific resource and action
 * - usePermission: React hook for checking if a user has a specific permission
 * - useAnyPermission: React hook for checking if a user has any of the specified permissions
 * - useAllPermissions: React hook for checking if a user has all of the specified permissions
 * - useResourcePermission: React hook for checking if a user has permission for a specific resource and action
 */

import { useStore } from '../lib/store';
import { 
  Role, 
  Permission, 
  UserRole,
  PaginatedResponse
} from '../types/rbac';
import { useMemo } from 'react';

// Define the store type for RBAC
interface RBACStore {
  roles: {
    data: PaginatedResponse<Role> | null;
  };
  permissions: {
    data: PaginatedResponse<Permission> | null;
  };
  userRoles: {
    data: PaginatedResponse<UserRole> | null;
  };
}

/**
 * Get user's role from the store
 * 
 * @param store - The RBAC store
 * @param userId - The ID of the user
 * @returns The user's role or null if not found
 */
const getUserRole = (store: RBACStore, userId: string): Role | null => {
  const userRole = store.userRoles.data?.results.find(
    (ur: UserRole) => ur.user_id === userId && ur.is_active
  );
  
  if (!userRole) {
    return null;
  }
  
  const role = store.roles.data?.results.find(
    (r: Role) => r.id === userRole.role_id && r.is_active
  );
  
  return role || null;
};

/**
 * Check if a user has a specific permission
 * 
 * @param userId - The ID of the user
 * @param permissionId - The ID of the permission to check
 * @returns True if the user has the permission, false otherwise
 */
export const hasPermission = (userId: string, permissionId: string): boolean => {
  const store = useStore() as RBACStore;
  const role = getUserRole(store, userId);
  
  if (!role) {
    return false;
  }
  
  return role.permissions.includes(permissionId);
};

/**
 * Check if a user has any of the specified permissions
 * 
 * @param userId - The ID of the user
 * @param permissionIds - The IDs of the permissions to check
 * @returns True if the user has any of the permissions, false otherwise
 */
export const hasAnyPermission = (userId: string, permissionIds: string[]): boolean => {
  if (!permissionIds.length) {
    return false;
  }
  
  const store = useStore() as RBACStore;
  const role = getUserRole(store, userId);
  
  if (!role) {
    return false;
  }
  
  return permissionIds.some(permissionId => role.permissions.includes(permissionId));
};

/**
 * Check if a user has all of the specified permissions
 * 
 * @param userId - The ID of the user
 * @param permissionIds - The IDs of the permissions to check
 * @returns True if the user has all of the permissions, false otherwise
 */
export const hasAllPermissions = (userId: string, permissionIds: string[]): boolean => {
  if (!permissionIds.length) {
    return true;
  }
  
  const store = useStore() as RBACStore;
  const role = getUserRole(store, userId);
  
  if (!role) {
    return false;
  }
  
  return permissionIds.every(permissionId => role.permissions.includes(permissionId));
};

/**
 * Check if a user has permission for a specific resource and action
 * 
 * @param userId - The ID of the user
 * @param resource - The resource to check
 * @param action - The action to check
 * @returns True if the user has the permission, false otherwise
 */
export const hasResourcePermission = (userId: string, resource: string, action: string): boolean => {
  const store = useStore() as RBACStore;
  
  // Find the permission for the resource and action
  const permission = store.permissions.data?.results.find(
    (p: Permission) => p.resource === resource && p.action === action && p.is_active
  );
  
  if (!permission) {
    return false;
  }
  
  const role = getUserRole(store, userId);
  
  if (!role) {
    return false;
  }
  
  return role.permissions.includes(permission.id);
};

/**
 * React hook for checking if a user has a specific permission
 * 
 * @param userId - The ID of the user
 * @param permissionId - The ID of the permission to check
 * @returns True if the user has the permission, false otherwise
 */
export const usePermission = (userId: string, permissionId: string): boolean => {
  const store = useStore() as RBACStore;
  
  return useMemo(() => {
    return hasPermission(userId, permissionId);
  }, [userId, permissionId, store.roles.data, store.userRoles.data]);
};

/**
 * React hook for checking if a user has any of the specified permissions
 * 
 * @param userId - The ID of the user
 * @param permissionIds - The IDs of the permissions to check
 * @returns True if the user has any of the permissions, false otherwise
 */
export const useAnyPermission = (userId: string, permissionIds: string[]): boolean => {
  const store = useStore() as RBACStore;
  
  return useMemo(() => {
    return hasAnyPermission(userId, permissionIds);
  }, [userId, permissionIds, store.roles.data, store.userRoles.data]);
};

/**
 * React hook for checking if a user has all of the specified permissions
 * 
 * @param userId - The ID of the user
 * @param permissionIds - The IDs of the permissions to check
 * @returns True if the user has all of the permissions, false otherwise
 */
export const useAllPermissions = (userId: string, permissionIds: string[]): boolean => {
  const store = useStore() as RBACStore;
  
  return useMemo(() => {
    return hasAllPermissions(userId, permissionIds);
  }, [userId, permissionIds, store.roles.data, store.userRoles.data]);
};

/**
 * React hook for checking if a user has permission for a specific resource and action
 * 
 * @param userId - The ID of the user
 * @param resource - The resource to check
 * @param action - The action to check
 * @returns True if the user has the permission, false otherwise
 */
export const useResourcePermission = (userId: string, resource: string, action: string): boolean => {
  const store = useStore() as RBACStore;
  
  return useMemo(() => {
    return hasResourcePermission(userId, resource, action);
  }, [userId, resource, action, store.roles.data, store.userRoles.data, store.permissions.data]);
}; 