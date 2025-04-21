/**
 * RBAC API Service
 * 
 * This file contains API endpoints for Role-Based Access Control (RBAC):
 * - Role management
 * - Permission management
 * - User role management
 * - Resource management
 * - Resource access management
 * - Organization context management
 * - Audit log management
 */

import axios from 'axios';
import type { AxiosError } from 'axios';
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
import { 
  ApiError, 
  ValidationError, 
  AuthenticationError, 
  AuthorizationError, 
  NotFoundError, 
  ServerError,
  NetworkError,
  logError
} from './errors';

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const RBAC_BASE_URL = `${API_BASE_URL}/rbac`;

// Role endpoints
const ROLES_URL = `${RBAC_BASE_URL}/roles/`;
const ROLE_DETAIL_URL = (id: string) => `${RBAC_BASE_URL}/roles/${id}/`;
const ROLE_PERMISSIONS_URL = (id: string) => `${RBAC_BASE_URL}/roles/${id}/permissions/`;

// Permission endpoints
const PERMISSIONS_URL = `${RBAC_BASE_URL}/permissions/`;
const PERMISSION_DETAIL_URL = (id: string) => `${RBAC_BASE_URL}/permissions/${id}/`;

// User role endpoints
const USER_ROLES_URL = `${RBAC_BASE_URL}/user-roles/`;
const USER_ROLE_DETAIL_URL = (id: string) => `${RBAC_BASE_URL}/user-roles/${id}/`;
const USER_ROLE_ACTIVATE_URL = (id: string) => `${RBAC_BASE_URL}/user-roles/${id}/activate/`;
const USER_ROLE_DEACTIVATE_URL = (id: string) => `${RBAC_BASE_URL}/user-roles/${id}/deactivate/`;
const USER_ROLE_DELEGATE_URL = (id: string) => `${RBAC_BASE_URL}/user-roles/${id}/delegate/`;

// Resource endpoints
const RESOURCES_URL = `${RBAC_BASE_URL}/resources/`;
const RESOURCE_DETAIL_URL = (id: string) => `${RBAC_BASE_URL}/resources/${id}/`;
const RESOURCE_GRANT_ACCESS_URL = (id: string) => `${RBAC_BASE_URL}/resources/${id}/grant_access/`;
const RESOURCE_REVOKE_ACCESS_URL = (id: string) => `${RBAC_BASE_URL}/resources/${id}/revoke_access/`;

// Resource access endpoints
const RESOURCE_ACCESSES_URL = `${RBAC_BASE_URL}/resource-accesses/`;
const RESOURCE_ACCESS_DETAIL_URL = (id: string) => `${RBAC_BASE_URL}/resource-accesses/${id}/`;
const RESOURCE_ACCESS_ACTIVATE_URL = (id: string) => `${RBAC_BASE_URL}/resource-accesses/${id}/activate/`;
const RESOURCE_ACCESS_DEACTIVATE_URL = (id: string) => `${RBAC_BASE_URL}/resource-accesses/${id}/deactivate/`;

// Organization context endpoints
const ORGANIZATION_CONTEXTS_URL = `${RBAC_BASE_URL}/organization-contexts/`;
const ORGANIZATION_CONTEXT_DETAIL_URL = (id: string) => `${RBAC_BASE_URL}/organization-contexts/${id}/`;
const ORGANIZATION_CONTEXT_ACTIVATE_URL = (id: string) => `${RBAC_BASE_URL}/organization-contexts/${id}/activate/`;
const ORGANIZATION_CONTEXT_DEACTIVATE_URL = (id: string) => `${RBAC_BASE_URL}/organization-contexts/${id}/deactivate/`;
const ORGANIZATION_CONTEXT_ANCESTORS_URL = (id: string) => `${RBAC_BASE_URL}/organization-contexts/${id}/ancestors/`;
const ORGANIZATION_CONTEXT_DESCENDANTS_URL = (id: string) => `${RBAC_BASE_URL}/organization-contexts/${id}/descendants/`;
const ORGANIZATION_CONTEXT_CHILDREN_URL = (id: string) => `${RBAC_BASE_URL}/organization-contexts/${id}/children/`;
const ORGANIZATION_CONTEXT_PARENTS_URL = (id: string) => `${RBAC_BASE_URL}/organization-contexts/${id}/parents/`;

// Audit log endpoints
const AUDIT_LOGS_URL = `${RBAC_BASE_URL}/audits/`;
const AUDIT_LOG_DETAIL_URL = (id: string) => `${RBAC_BASE_URL}/audits/${id}/`;
const AUDIT_LOG_COMPLIANCE_REPORT_URL = `${RBAC_BASE_URL}/audits/compliance_report/`;
const AUDIT_LOG_CLEANUP_EXPIRED_URL = `${RBAC_BASE_URL}/audits/cleanup_expired/`;

/**
 * Type guard for AxiosError
 */
function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as any).isAxiosError === true
  );
}

/**
 * API Error Response interface
 */
interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

/**
 * Generic function to handle API errors
 * @param error The error to handle
 * @throws Appropriate error type based on the error response
 */
function handleApiError(error: unknown): never {
  if (isAxiosError(error)) {
    const { response, message } = error;
    const status = response?.status || 0;
    const data = response?.data as ApiErrorResponse;

    // Network error
    if (!response) {
      throw new NetworkError(message || 'Network error occurred');
    }

    // Handle specific error types
    switch (status) {
      case 401:
        throw new AuthenticationError(data?.message || 'Authentication required');
      case 403:
        throw new AuthorizationError(data?.message || 'Permission denied');
      case 404:
        throw new NotFoundError(data?.message || 'Resource not found');
      case 500:
        throw new ServerError(data?.message || 'Server error');
      default:
        throw new ApiError(data?.message || 'API error', status);
    }
  }
  
  // Non-Axios error
  if (error instanceof Error) {
    logError(error);
  } else {
    logError(new Error(String(error)));
  }
  throw new ApiError('Unknown error occurred');
}

// Role API methods
export async function getRoles(params?: Record<string, any>): Promise<PaginatedResponse<Role>> {
  try {
    const response = await axios.get(ROLES_URL, { params });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function getRole(id: string): Promise<Role> {
  try {
    const response = await axios.get(ROLE_DETAIL_URL(id));
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function createRole(role: Partial<Role>): Promise<Role> {
  try {
    const response = await axios.post(ROLES_URL, role);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function updateRole(id: string, role: Partial<Role>): Promise<Role> {
  try {
    const response = await axios.put(ROLE_DETAIL_URL(id), role);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function deleteRole(id: string): Promise<void> {
  try {
    await axios.delete(ROLE_DETAIL_URL(id));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function getRolePermissions(id: string): Promise<Permission[]> {
  try {
    const response = await axios.get(ROLE_PERMISSIONS_URL(id));
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

// Permission API methods
export async function getPermissions(params?: Record<string, any>): Promise<PaginatedResponse<Permission>> {
  try {
    const response = await axios.get(PERMISSIONS_URL, { params });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function getPermission(id: string): Promise<Permission> {
  try {
    const response = await axios.get(PERMISSION_DETAIL_URL(id));
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function createPermission(permission: Partial<Permission>): Promise<Permission> {
  try {
    const response = await axios.post(PERMISSIONS_URL, permission);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function updatePermission(id: string, permission: Partial<Permission>): Promise<Permission> {
  try {
    const response = await axios.put(PERMISSION_DETAIL_URL(id), permission);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function deletePermission(id: string): Promise<void> {
  try {
    await axios.delete(PERMISSION_DETAIL_URL(id));
  } catch (error) {
    return handleApiError(error);
  }
}

// User Role API methods
export async function getUserRoles(params?: Record<string, any>): Promise<PaginatedResponse<UserRole>> {
  try {
    const response = await axios.get(USER_ROLES_URL, { params });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function getUserRole(id: string): Promise<UserRole> {
  try {
    const response = await axios.get(USER_ROLE_DETAIL_URL(id));
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function createUserRole(userRole: Partial<UserRole>): Promise<UserRole> {
  try {
    const response = await axios.post(USER_ROLES_URL, userRole);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function updateUserRole(id: string, userRole: Partial<UserRole>): Promise<UserRole> {
  try {
    const response = await axios.put(USER_ROLE_DETAIL_URL(id), userRole);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function deleteUserRole(id: string): Promise<void> {
  try {
    await axios.delete(USER_ROLE_DETAIL_URL(id));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function activateUserRole(id: string): Promise<UserRole> {
  try {
    const response = await axios.post(USER_ROLE_ACTIVATE_URL(id));
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function deactivateUserRole(id: string): Promise<UserRole> {
  try {
    const response = await axios.post(USER_ROLE_DEACTIVATE_URL(id));
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function delegateUserRole(id: string, data: { target_user_id: string }): Promise<UserRole> {
  try {
    const response = await axios.post(USER_ROLE_DELEGATE_URL(id), data);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

// Resource API methods
export async function getResources(params?: Record<string, any>): Promise<PaginatedResponse<Resource>> {
  try {
    const response = await axios.get(RESOURCES_URL, { params });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function getResource(id: string): Promise<Resource> {
  try {
    const response = await axios.get(RESOURCE_DETAIL_URL(id));
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function createResource(resource: Partial<Resource>): Promise<Resource> {
  try {
    const response = await axios.post(RESOURCES_URL, resource);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function updateResource(id: string, resource: Partial<Resource>): Promise<Resource> {
  try {
    const response = await axios.put(RESOURCE_DETAIL_URL(id), resource);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function deleteResource(id: string): Promise<void> {
  try {
    await axios.delete(RESOURCE_DETAIL_URL(id));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function grantResourceAccess(id: string, data: { role_id: string; permission_id: string }): Promise<ResourceAccess> {
  try {
    const response = await axios.post(RESOURCE_GRANT_ACCESS_URL(id), data);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function revokeResourceAccess(id: string, data: { role_id: string; permission_id: string }): Promise<void> {
  try {
    await axios.post(RESOURCE_REVOKE_ACCESS_URL(id), data);
  } catch (error) {
    return handleApiError(error);
  }
}

// Resource Access API methods
export async function getResourceAccesses(params?: Record<string, any>): Promise<PaginatedResponse<ResourceAccess>> {
  try {
    const response = await axios.get(RESOURCE_ACCESSES_URL, { params });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function getResourceAccess(id: string): Promise<ResourceAccess> {
  try {
    const response = await axios.get(RESOURCE_ACCESS_DETAIL_URL(id));
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function createResourceAccess(resourceAccess: Partial<ResourceAccess>): Promise<ResourceAccess> {
  try {
    const response = await axios.post(RESOURCE_ACCESSES_URL, resourceAccess);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function updateResourceAccess(id: string, resourceAccess: Partial<ResourceAccess>): Promise<ResourceAccess> {
  try {
    const response = await axios.put(RESOURCE_ACCESS_DETAIL_URL(id), resourceAccess);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function deleteResourceAccess(id: string): Promise<void> {
  try {
    await axios.delete(RESOURCE_ACCESS_DETAIL_URL(id));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function activateResourceAccess(id: string): Promise<ResourceAccess> {
  try {
    const response = await axios.post(RESOURCE_ACCESS_ACTIVATE_URL(id));
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function deactivateResourceAccess(id: string): Promise<ResourceAccess> {
  try {
    const response = await axios.post(RESOURCE_ACCESS_DEACTIVATE_URL(id));
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

// Organization Context API methods
export async function getOrganizationContexts(params?: Record<string, any>): Promise<PaginatedResponse<OrganizationContext>> {
  try {
    const response = await axios.get(ORGANIZATION_CONTEXTS_URL, { params });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function getOrganizationContext(id: string): Promise<OrganizationContext> {
  try {
    const response = await axios.get(ORGANIZATION_CONTEXT_DETAIL_URL(id));
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function createOrganizationContext(orgContext: Partial<OrganizationContext>): Promise<OrganizationContext> {
  try {
    const response = await axios.post(ORGANIZATION_CONTEXTS_URL, orgContext);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function updateOrganizationContext(id: string, orgContext: Partial<OrganizationContext>): Promise<OrganizationContext> {
  try {
    const response = await axios.put(ORGANIZATION_CONTEXT_DETAIL_URL(id), orgContext);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function deleteOrganizationContext(id: string): Promise<void> {
  try {
    await axios.delete(ORGANIZATION_CONTEXT_DETAIL_URL(id));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function activateOrganizationContext(id: string): Promise<OrganizationContext> {
  try {
    const response = await axios.post(ORGANIZATION_CONTEXT_ACTIVATE_URL(id));
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function deactivateOrganizationContext(id: string): Promise<OrganizationContext> {
  try {
    const response = await axios.post(ORGANIZATION_CONTEXT_DEACTIVATE_URL(id));
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function getOrganizationContextAncestors(id: string): Promise<OrganizationContext[]> {
  try {
    const response = await axios.get(ORGANIZATION_CONTEXT_ANCESTORS_URL(id));
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function getOrganizationContextDescendants(id: string): Promise<OrganizationContext[]> {
  try {
    const response = await axios.get(ORGANIZATION_CONTEXT_DESCENDANTS_URL(id));
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function getOrganizationContextChildren(id: string): Promise<OrganizationContext[]> {
  try {
    const response = await axios.get(ORGANIZATION_CONTEXT_CHILDREN_URL(id));
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function getOrganizationContextParents(id: string): Promise<OrganizationContext[]> {
  try {
    const response = await axios.get(ORGANIZATION_CONTEXT_PARENTS_URL(id));
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

// Audit Log API methods
export async function getAuditLogs(params?: Record<string, any>): Promise<PaginatedResponse<AuditLog>> {
  try {
    const response = await axios.get(AUDIT_LOGS_URL, { params });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function getAuditLog(id: string): Promise<AuditLog> {
  try {
    const response = await axios.get(AUDIT_LOG_DETAIL_URL(id));
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function getComplianceReport(params?: Record<string, any>): Promise<any> {
  try {
    const response = await axios.get(AUDIT_LOG_COMPLIANCE_REPORT_URL, { params });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function cleanupExpiredAuditLogs(): Promise<void> {
  try {
    await axios.post(AUDIT_LOG_CLEANUP_EXPIRED_URL);
  } catch (error) {
    return handleApiError(error);
  }
} 