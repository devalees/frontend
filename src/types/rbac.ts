/**
 * RBAC Types
 * 
 * This file contains type definitions for the Role-Based Access Control (RBAC) system.
 */

/**
 * Base interface for paginated responses
 */
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * Role interface representing a role in the system
 */
export interface Role {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  permissions?: Permission[];
}

/**
 * Permission interface representing a permission in the system
 */
export interface Permission {
  id: string;
  name: string;
  codename: string;
  description: string;
  created_at: string;
  updated_at: string;
}

/**
 * UserRole interface representing a user's role assignment
 */
export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  role?: Role;
}

/**
 * Resource interface representing a resource in the system
 */
export interface Resource {
  id: string;
  name: string;
  type: string;
  description: string;
  created_at: string;
  updated_at: string;
}

/**
 * ResourceAccess interface representing access to a resource
 */
export interface ResourceAccess {
  id: string;
  resource_id: string;
  role_id: string;
  permission_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  resource?: Resource;
  role?: Role;
  permission?: Permission;
}

/**
 * OrganizationContext interface representing an organization context
 */
export interface OrganizationContext {
  id: string;
  name: string;
  parent_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  children?: OrganizationContext[];
}

/**
 * AuditLog interface representing an audit log entry
 */
export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: Record<string, any>;
  created_at: string;
} 