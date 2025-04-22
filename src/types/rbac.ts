/**
 * RBAC Types
 * 
 * Type definitions for Role-Based Access Control (RBAC) entities:
 * - Role
 * - Permission
 * - UserRole
 * - Resource
 * - ResourceAccess
 * - OrganizationContext
 * - AuditLog
 */

// Base entity interface for common fields
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

// Role entity
export interface Role extends BaseEntity {
  name: string;
  description: string;
  is_active: boolean;
  activated_at?: string;
  deactivated_at?: string;
  permissions: string[];
}

// Permission entity
export interface Permission extends BaseEntity {
  name: string;
  description: string;
  is_active: boolean;
  activated_at?: string;
  deactivated_at?: string;
  resource: string;
  action: string;
}

// UserRole entity
export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  is_active: boolean;
  delegated_by?: string;
  created_at: string;
  updated_at: string;
}

// Resource entity
export interface Resource extends BaseEntity {
  name: string;
  description: string;
  is_active: boolean;
  activated_at?: string;
  deactivated_at?: string;
  type: string;
}

// ResourceAccess entity
export interface ResourceAccess extends BaseEntity {
  resource_id: string;
  role_id: string;
  permission_id: string;
  is_active: boolean;
  activated_at?: string;
  deactivated_at?: string;
}

// OrganizationContext entity
export interface OrganizationContext extends BaseEntity {
  name: string;
  description: string;
  parent_id: string | null;
  is_active: boolean;
  activated_at?: string;
  deactivated_at?: string;
  level?: number;
}

// AuditLog entity
export interface AuditLog {
  id: string;
  user_id: string;
  action: 'create' | 'update' | 'delete';
  entity_type: string;
  entity_id: string;
  changes: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Paginated response type
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
} 