/**
 * RBAC API
 * 
 * API functions for Role-Based Access Control (RBAC) operations:
 * - Roles
 * - Permissions
 * - UserRoles
 * - Resources
 * - ResourceAccess
 * - OrganizationContext
 * - AuditLog
 */

import axios from 'axios';
import { 
  Role, 
  Permission, 
  UserRole, 
  Resource, 
  ResourceAccess, 
  OrganizationContext, 
  AuditLog,
  PaginatedResponse,
  PaginationParams
} from '../../types/rbac';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Helper function to handle API errors
const handleError = (error: any) => {
  if (!error.response) {
    if (error.request) {
      throw new Error('Network error');
    }
    throw new Error('Error setting up request');
  }

  const { status, config } = error.response;
  const url = config?.url || '';
  
  // Extract resource type from URL path
  const getResourceType = (url: string): string => {
    const apiPath = url.split('/api/')[1];
    if (!apiPath) return 'Resource';
    
    const pathParts = apiPath.split('/');
    const resourceType = pathParts[0]; // e.g., 'roles', 'permissions'
    if (!resourceType) return 'Resource';
    
    // Convert to singular and capitalize
    const singular = resourceType.endsWith('s') ? resourceType.slice(0, -1) : resourceType;
    const formatted = singular.split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
    
    return formatted;
  };

  const resourceType = getResourceType(url);

  switch (status) {
    case 400:
      throw new Error(`Invalid ${resourceType.toLowerCase()} data`);
    case 401:
      throw new Error('Authentication required');
    case 403:
      throw new Error(`Not authorized to access this ${resourceType.toLowerCase()}`);
    case 404:
      throw new Error(`${resourceType} not found`);
    case 409:
      throw new Error(`${resourceType} already exists`);
    case 422:
      throw new Error(`Invalid ${resourceType.toLowerCase()} data format`);
    case 500:
      throw new Error('Internal server error');
    default:
      throw new Error(`Server error: ${status}`);
  }
};

// Roles API
export const getRoles = async (): Promise<PaginatedResponse<Role>> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/v1/rbac/roles/`);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error; // This line will never be reached, but TypeScript needs it
  }
};

export const getRole = async (id: string): Promise<Role> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/v1/rbac/roles/${id}/`);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const createRole = async (role: Partial<Role>): Promise<Role> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/v1/rbac/roles/`, role);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const updateRole = async (id: string, role: Partial<Role>): Promise<Role> => {
  try {
    const response = await axios.put(`${API_BASE_URL}/v1/rbac/roles/${id}/`, role);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const deleteRole = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/v1/rbac/roles/${id}/`);
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// Permissions API
export const getPermissions = async (): Promise<PaginatedResponse<Permission>> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/v1/rbac/permissions/`);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const getPermission = async (id: string): Promise<Permission> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/v1/rbac/permissions/${id}/`);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const createPermission = async (permission: Partial<Permission>): Promise<Permission> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/v1/rbac/permissions/`, permission);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const updatePermission = async (id: string, permission: Partial<Permission>): Promise<Permission> => {
  try {
    const response = await axios.put(`${API_BASE_URL}/v1/rbac/permissions/${id}/`, permission);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const deletePermission = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/v1/rbac/permissions/${id}/`);
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// UserRoles API
export const getUserRoles = async (): Promise<PaginatedResponse<UserRole>> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/v1/rbac/user-roles/`);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const getUserRole = async (id: string): Promise<UserRole> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/v1/rbac/user-roles/${id}/`);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const createUserRole = async (userRole: Partial<UserRole>): Promise<UserRole> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/v1/rbac/user-roles/`, userRole);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const deleteUserRole = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/v1/rbac/user-roles/${id}/`);
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const activateUserRole = async (id: string): Promise<UserRole> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/v1/rbac/user-roles/${id}/activate/`);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const deactivateUserRole = async (id: string): Promise<UserRole> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/v1/rbac/user-roles/${id}/deactivate/`);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const delegateUserRole = async (id: string, targetUserId: string): Promise<UserRole> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/v1/rbac/user-roles/${id}/delegate/`, { target_user_id: targetUserId });
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// Resources API
export const listResources = async (params?: PaginationParams): Promise<PaginatedResponse<Resource>> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/v1/rbac/resources/`, { params });
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const getResource = async (id: string): Promise<Resource> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/v1/rbac/resources/${id}/`);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const createResource = async (data: Partial<Resource>): Promise<Resource> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/v1/rbac/resources/`, data);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const updateResource = async (id: string, data: Partial<Resource>): Promise<Resource> => {
  try {
    const response = await axios.put(`${API_BASE_URL}/v1/rbac/resources/${id}/`, data);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const deleteResource = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/v1/rbac/resources/${id}/`);
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const grantAccess = async (id: string, roleId: string, permissionId: string): Promise<ResourceAccess> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/v1/rbac/resources/${id}/grant_access/`, { role_id: roleId, permission_id: permissionId });
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const revokeAccess = async (id: string, roleId: string, permissionId: string): Promise<void> => {
  try {
    await axios.post(`${API_BASE_URL}/v1/rbac/resources/${id}/revoke_access/`, { role_id: roleId, permission_id: permissionId });
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// ResourceAccess API
export const getResourceAccesses = async (): Promise<PaginatedResponse<ResourceAccess>> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/v1/rbac/resource-accesses/`);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const getResourceAccess = async (id: string): Promise<ResourceAccess> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/v1/rbac/resource-accesses/${id}/`);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const createResourceAccess = async (resourceAccess: Partial<ResourceAccess>): Promise<ResourceAccess> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/v1/rbac/resource-accesses/`, resourceAccess);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const updateResourceAccess = async (id: string, resourceAccess: Partial<ResourceAccess>): Promise<ResourceAccess> => {
  try {
    const response = await axios.put(`${API_BASE_URL}/v1/rbac/resource-accesses/${id}/`, resourceAccess);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const deleteResourceAccess = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/v1/rbac/resource-accesses/${id}/`);
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const activateResourceAccess = async (id: string): Promise<ResourceAccess> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/v1/rbac/resource-accesses/${id}/activate/`);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const deactivateResourceAccess = async (id: string): Promise<ResourceAccess> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/v1/rbac/resource-accesses/${id}/deactivate/`);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// OrganizationContext API
export const getOrganizationContexts = async (): Promise<PaginatedResponse<OrganizationContext>> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/v1/rbac/organization-contexts/`);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const getOrganizationContext = async (id: string): Promise<OrganizationContext> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/v1/rbac/organization-contexts/${id}/`);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const createOrganizationContext = async (context: Partial<OrganizationContext>): Promise<OrganizationContext> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/v1/rbac/organization-contexts/`, context);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const updateOrganizationContext = async (id: string, context: Partial<OrganizationContext>): Promise<OrganizationContext> => {
  try {
    const response = await axios.put(`${API_BASE_URL}/v1/rbac/organization-contexts/${id}/`, context);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const deleteOrganizationContext = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/v1/rbac/organization-contexts/${id}/`);
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const activateOrganizationContext = async (id: string): Promise<OrganizationContext> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/v1/rbac/organization-contexts/${id}/activate/`);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const deactivateOrganizationContext = async (id: string): Promise<OrganizationContext> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/v1/rbac/organization-contexts/${id}/deactivate/`);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const getOrganizationContextAncestors = async (id: string): Promise<OrganizationContext[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/v1/rbac/organization-contexts/${id}/ancestors/`);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const getOrganizationContextDescendants = async (id: string): Promise<OrganizationContext[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/v1/rbac/organization-contexts/${id}/descendants/`);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const getOrganizationContextChildren = async (id: string): Promise<OrganizationContext[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/v1/rbac/organization-contexts/${id}/children/`);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const getOrganizationContextParents = async (id: string): Promise<OrganizationContext[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/v1/rbac/organization-contexts/${id}/parents/`);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// AuditLog API
export const getAuditLogs = async (): Promise<PaginatedResponse<AuditLog>> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/v1/rbac/audits/`);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const getAuditLog = async (id: string): Promise<AuditLog> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/v1/rbac/audits/${id}/`);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const getComplianceReport = async (): Promise<any> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/v1/rbac/audits/compliance_report/`);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const cleanupExpiredAuditLogs = async (): Promise<void> => {
  try {
    await axios.post(`${API_BASE_URL}/v1/rbac/audits/cleanup_expired/`);
  } catch (error) {
    handleError(error);
    throw error;
  }
}; 