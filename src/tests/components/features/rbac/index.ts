/**
 * RBAC Component Tests
 * 
 * This file exports all RBAC component tests.
 */

// Import tests
import './RoleList.test';
import './RoleForm.test';
import './PermissionList.test';
import './PermissionForm.test';
import './UserRoleList.test';
import './UserRoleForm.test';

// Import resource management tests
import './resources';

// Import organization context tests
import './organization-contexts';

// Import audit log tests
import './audit-logs';

// Export tests
export * from './RoleList.test';
export * from './RoleForm.test';
export * from './PermissionList.test';
export * from './PermissionForm.test';
export * from './UserRoleList.test';
export * from './UserRoleForm.test';
export * from './resources';
export * from './organization-contexts';
export * from './audit-logs'; 