# RBAC Feature - Simplified Implementation Plan

## Simplification Principles
1. Focus on one feature at a time
2. Reuse existing components and utilities
3. Use centralized testing utilities for all tests
4. Follow the existing project architecture

## Implementation Phases

### Phase 1: Core RBAC Types and API Integration
1. **Set Up Tests**
   - [x] Create RBAC type tests using centralized testing utilities
     - File: `src/tests/types/rbac.test.ts`
     - Import utilities from `src/tests/utils/` (NOT directly from testing libraries)
     - Test type definitions and interfaces

   - [x] Create RBAC API tests
     - File: `src/tests/api/rbac.test.ts`
     - Use `mockApi.ts` for API mocking
     - Test API methods for all RBAC endpoints
     - Test error handling and response parsing

2. **Define RBAC Types**
   - [x] Create RBAC type definitions
     - File: `src/types/rbac.ts`
     - Define interfaces for Role, Permission, UserRole, Resource, ResourceAccess, OrganizationContext, AuditLog
     - Define PaginatedResponse type for list endpoints

3. **Create RBAC API Service**
   - [x] Implement API service for RBAC
     - File: `src/lib/api/rbac.ts`
     - Implement methods for all RBAC endpoints
     - Use axios for API requests
     - Handle authentication and error responses

### Phase 2: RBAC State Management
1. **Set Up Tests**
   - [x] Create RBAC store tests
     - File: `src/tests/store/rbac.test.ts`
     - Use centralized testing utilities
     - Test store actions and state management
     - Test store selectors and computed properties

2. **Create RBAC Store**
   - [x] Implement RBAC store with Zustand
     - File: `src/lib/store/slices/rbacSlice.ts`
     - Create store slices for each RBAC entity
     - Implement actions for fetching, creating, updating, and deleting
     - Handle loading states and error handling

3. **Create RBAC Hooks**
   - [x] Implement RBAC hooks
     - File: `src/hooks/useRbac.ts`
     - Create hooks for each RBAC entity
     - Provide access to store and API methods
     - Handle loading states and error handling

### Phase 3: RBAC UI Components
1. **Set Up Tests**
   - [x] Create RBAC component tests
     - Directory: `src/tests/components/features/rbac/`
     - Test each component individually
     - Test component integration with hooks and store
     - Use `componentTestUtils.ts` for component testing

2. **Create Role Management Components**
   - [x] Implement role list component
     - File: `src/components/features/rbac/RoleList.tsx`
     - Display roles in a table or list
     - Support filtering and pagination
     - Add actions for edit, delete, and view permissions

   - [x] Implement role form component
     - File: `src/components/features/rbac/RoleForm.tsx`
     - Create form for adding/editing roles
     - Use existing form components
     - Add validation and error handling

3. **Create Permission Management Components**
   - [x] Implement permission list component
     - File: `src/components/features/rbac/PermissionList.tsx`
     - Display permissions in a table or list
     - Support filtering and pagination
     - Add actions for edit and delete

   - [x] Implement permission form component
     - File: `src/components/features/rbac/PermissionForm.tsx`
     - Create form for adding/editing permissions
     - Use existing form components
     - Add validation and error handling

4. **Create User Role Management Components**
   - [x] Implement user role list component
     - File: `src/components/features/rbac/UserRoleList.tsx`
     - Display user roles in a table or list
     - Support filtering and pagination
     - Add actions for activate, deactivate, and delegate

   - [x] Implement user role form component
     - File: `src/components/features/rbac/UserRoleForm.tsx`
     - Create form for assigning roles to users
     - Use existing form components
     - Add validation and error handling

### Phase 4: RBAC Pages
1. **Set Up Tests**
   - [x] Create RBAC page tests
     - Directory: `src/tests/app/rbac/`
     - Test page rendering and navigation
     - Test page integration with components and hooks

2. **Create Role Management Page**
   - [x] Implement roles page
     - File: `src/app/(dashboard)/rbac/roles/page.tsx`
     - Use role list and form components
     - Add navigation and breadcrumbs
     - Handle role management actions

3. **Create Permission Management Page**
   - [x] Implement permissions page
     - File: `src/app/(dashboard)/rbac/permissions/page.tsx`
     - Use permission list and form components
     - Add navigation and breadcrumbs
     - Handle permission management actions

4. **Create User Role Management Page**
   - [x] Implement user roles page
     - File: `src/app/(dashboard)/rbac/user-roles/page.tsx`
     - Use user role list and form components
     - Add navigation and breadcrumbs
     - Handle user role management actions

### Phase 5: Resource Management
1. **Set Up Tests**
   - [x] Create resource management component tests
     - Directory: `src/tests/components/features/rbac/resources/`
     - Test each component individually
     - Test component integration with hooks and store
     - Use `componentTestUtils.ts` for component testing

2. **Create Resource Management Components**
   - [x] Implement resource list component
     - File: `src/components/features/rbac/ResourceList.tsx`
     - Display resources in a table or list
     - Support filtering and pagination
     - Add actions for edit, delete, and manage access

   - [x] Implement resource form component
     - File: `src/components/features/rbac/ResourceForm.tsx`
     - Create form for adding/editing resources
     - Use existing form components
     - Add validation and error handling

3. **Create Resource Access Components**
   - [x] Implement resource access list component
     - File: `src/components/features/rbac/ResourceAccessList.tsx`
     - Display resource access entries in a table or list
     - Support filtering and pagination
     - Add actions for edit, delete, activate, and deactivate

   - [x] Implement resource access form component
     - File: `src/components/features/rbac/ResourceAccessForm.tsx`
     - Create form for granting/revoking resource access
     - Use existing form components
     - Add validation and error handling

### Phase 6: Organization Context Management
1. **Set Up Tests**
   - [ ] Create organization context component tests
     - Directory: `src/tests/components/features/rbac/organization-contexts/`
     - Test each component individually
     - Test component integration with hooks and store
     - Use `componentTestUtils.ts` for component testing

2. **Create Organization Context Components**
   - [ ] Implement organization context list component
     - File: `src/components/features/rbac/OrganizationContextList.tsx`
     - Display organization contexts in a table or list
     - Support filtering and pagination
     - Add actions for edit, delete, activate, and deactivate

   - [ ] Implement organization context form component
     - File: `src/components/features/rbac/OrganizationContextForm.tsx`
     - Create form for adding/editing organization contexts
     - Use existing form components
     - Add validation and error handling

### Phase 7: Audit Log Management
1. **Set Up Tests**
   - [ ] Create audit log component tests
     - Directory: `src/tests/components/features/rbac/audit-logs/`
     - Test each component individually
     - Test component integration with hooks and store
     - Use `componentTestUtils.ts` for component testing

2. **Create Audit Log Components**
   - [ ] Implement audit log list component
     - File: `src/components/features/rbac/AuditLogList.tsx`
     - Display audit logs in a table or list
     - Support filtering, pagination, and date range selection
     - Add actions for view details

   - [ ] Implement audit log viewer component
     - File: `src/components/features/rbac/AuditLogViewer.tsx`
     - Display detailed audit log information
     - Support for compliance reports
     - Add filtering and export options

### Phase 8: Permission Check Utility
1. **Set Up Tests**
   - [ ] Create permission check utility tests
     - File: `src/tests/utils/rbac.test.ts`
     - Test permission check functions
     - Test permission-based rendering hooks

2. **Create Permission Check Utility**
   - [ ] Implement permission check utility
     - File: `src/utils/rbac.ts`
     - Create functions for checking permissions
     - Create hooks for permission-based rendering
     - Integrate with user profile and roles

### Phase 9: Integration with Authentication
1. **Set Up Tests**
   - [ ] Create authentication integration tests
     - File: `src/tests/auth/rbac-integration.test.ts`
     - Test RBAC integration with authentication flow
     - Test permission-based route protection
     - Use `integrationTestUtils.ts` for integration testing

2. **Update Authentication Flow**
   - [ ] Integrate RBAC with authentication
     - Update login flow to include RBAC permissions
     - Store user permissions in auth store
     - Add permission checks to protected routes

3. **Implement Permission-Based Route Protection**
   - [ ] Create permission-based route protection
     - File: `src/middleware.ts` (update existing middleware)
     - Check permissions for protected routes
     - Redirect unauthorized users

### Phase 10: Resource and Organization Context Pages
1. **Set Up Tests**
   - [ ] Create resource management page tests
     - Directory: `src/tests/app/rbac/resources/`
     - Test page rendering and navigation
     - Test page integration with components and hooks

2. **Create Resource Management Pages**
   - [ ] Implement resources page
     - File: `src/app/(dashboard)/rbac/resources/page.tsx`
     - Use resource list and form components
     - Add navigation and breadcrumbs
     - Handle resource management actions

   - [ ] Implement resource access page
     - File: `src/app/(dashboard)/rbac/resource-accesses/page.tsx`
     - Use resource access list and form components
     - Add navigation and breadcrumbs
     - Handle resource access management actions

### Phase 11: Organization Context and Audit Log Pages
1. **Set Up Tests**
   - [ ] Create organization context page tests
     - Directory: `src/tests/app/rbac/organization-contexts/`
     - Test page rendering and navigation
     - Test page integration with components and hooks

   - [ ] Create audit log page tests
     - Directory: `src/tests/app/rbac/audit-logs/`
     - Test page rendering and navigation
     - Test page integration with components and hooks

2. **Create Organization Context Page**
   - [ ] Implement organization contexts page
     - File: `src/app/(dashboard)/rbac/organization-contexts/page.tsx`
     - Use organization context list and form components
     - Add navigation and breadcrumbs
     - Handle organization context management actions

3. **Create Audit Log Page**
   - [ ] Implement audit logs page
     - File: `src/app/(dashboard)/rbac/audit-logs/page.tsx`
     - Use audit log list and viewer components
     - Add navigation and breadcrumbs
     - Handle audit log management actions

## Testing Guidelines
- Use centralized testing utilities from `src/tests/utils/`
- NO direct imports from testing libraries
- Use `componentTestUtils.ts` for React component tests
- Use `functionTestUtils.ts` for utility function tests
- Use `integrationTestUtils.ts` for integration tests
- Use `mockApi.ts` for mocking API responses

## API Integration Details
Based on `/home/ehab/Desktop/backend/docs/front-end/rbac.md`:

### Role Endpoints
- **List Roles**: `GET /api/v1/rbac/roles/`
- **Get Role**: `GET /api/v1/rbac/roles/{id}/`
- **Create Role**: `POST /api/v1/rbac/roles/`
- **Update Role**: `PUT/PATCH /api/v1/rbac/roles/{id}/`
- **Delete Role**: `DELETE /api/v1/rbac/roles/{id}/`
- **Get Role Permissions**: `GET /api/v1/rbac/roles/{id}/permissions/`

### Permission Endpoints
- **List Permissions**: `GET /api/v1/rbac/permissions/`
- **Get Permission**: `GET /api/v1/rbac/permissions/{id}/`
- **Create Permission**: `POST /api/v1/rbac/permissions/`
- **Update Permission**: `PUT/PATCH /api/v1/rbac/permissions/{id}/`
- **Delete Permission**: `DELETE /api/v1/rbac/permissions/{id}/`

### User Role Endpoints
- **List User Roles**: `GET /api/v1/rbac/user-roles/`
- **Get User Role**: `GET /api/v1/rbac/user-roles/{id}/`
- **Create User Role**: `POST /api/v1/rbac/user-roles/`
- **Update User Role**: `PUT/PATCH /api/v1/rbac/user-roles/{id}/`
- **Delete User Role**: `DELETE /api/v1/rbac/user-roles/{id}/`
- **Activate User Role**: `POST /api/v1/rbac/user-roles/{id}/activate/`
- **Deactivate User Role**: `POST /api/v1/rbac/user-roles/{id}/deactivate/`
- **Delegate User Role**: `POST /api/v1/rbac/user-roles/{id}/delegate/`

### Resource Endpoints
- **List Resources**: `GET /api/v1/rbac/resources/`
- **Get Resource**: `GET /api/v1/rbac/resources/{id}/`
- **Create Resource**: `POST /api/v1/rbac/resources/`
- **Update Resource**: `PUT/PATCH /api/v1/rbac/resources/{id}/`
- **Delete Resource**: `DELETE /api/v1/rbac/resources/{id}/`
- **Grant Access**: `POST /api/v1/rbac/resources/{id}/grant_access/`
- **Revoke Access**: `POST /api/v1/rbac/resources/{id}/revoke_access/`

### Resource Access Endpoints
- **List Resource Access**: `GET /api/v1/rbac/resource-accesses/`
- **Get Resource Access**: `GET /api/v1/rbac/resource-accesses/{id}/`
- **Create Resource Access**: `POST /api/v1/rbac/resource-accesses/`
- **Update Resource Access**: `PUT/PATCH /api/v1/rbac/resource-accesses/{id}/`
- **Delete Resource Access**: `DELETE /api/v1/rbac/resource-accesses/{id}/`
- **Activate Resource Access**: `POST /api/v1/rbac/resource-accesses/{id}/activate/`
- **Deactivate Resource Access**: `POST /api/v1/rbac/resource-accesses/{id}/deactivate/`

### Organization Context Endpoints
- **List Organization Contexts**: `GET /api/v1/rbac/organization-contexts/`
- **Get Organization Context**: `GET /api/v1/rbac/organization-contexts/{id}/`
- **Create Organization Context**: `POST /api/v1/rbac/organization-contexts/`
- **Update Organization Context**: `PUT/PATCH /api/v1/rbac/organization-contexts/{id}/`
- **Delete Organization Context**: `DELETE /api/v1/rbac/organization-contexts/{id}/`
- **Activate Organization Context**: `POST /api/v1/rbac/organization-contexts/{id}/activate/`
- **Deactivate Organization Context**: `POST /api/v1/rbac/organization-contexts/{id}/deactivate/`
- **Get Ancestors**: `GET /api/v1/rbac/organization-contexts/{id}/ancestors/`
- **Get Descendants**: `GET /api/v1/rbac/organization-contexts/{id}/descendants/`
- **Get Children**: `GET /api/v1/rbac/organization-contexts/{id}/children/`
- **Get Parents**: `GET /api/v1/rbac/organization-contexts/{id}/parents/`

### Audit Log Endpoints
- **List Audit Logs**: `GET /api/v1/rbac/audits/`
- **Get Audit Log**: `GET /api/v1/rbac/audits/{id}/`
- **Compliance Report**: `GET /api/v1/rbac/audits/compliance_report/`
- **Cleanup Expired**: `POST /api/v1/rbac/audits/cleanup_expired/`

Status Key:
- [ ] To Do
- [x] Completed 