# Entity Feature - Simplified Implementation Plan

## Simplification Principles
1. Focus on one feature at a time
2. Reuse existing components and utilities
3. Use centralized testing utilities for all tests
4. Follow the existing project architecture

## Implementation Phases

### Phase 1: Core Entity Types and API Integration ✅
1. **Set Up Tests**
   - [x] Create Entity type tests using centralized testing utilities
     - File: `src/tests/types/entity.test.ts`
     - Import utilities from `src/tests/utils/` (NOT directly from testing libraries)
     - Test type definitions and interfaces

   - [x] Create Entity API tests
     - File: `src/tests/api/entity.test.ts`
     - Use `createMockResponse` for API mocking
     - Test API methods for all Entity endpoints (41 tests passing)
     - Test error handling and response parsing
     - Completed test coverage:
       - Organization API (12 tests)
       - Department API (9 tests)
       - Team API (7 tests)
       - Team Member API (6 tests)
       - Organization Settings API (7 tests)

2. **Define Entity Types**
   - [x] Create Entity type definitions
     - File: `src/types/entity.ts`
     - Define interfaces for Organization, Department, Team, TeamMember, OrganizationSettings
     - Define PaginatedResponse type for list endpoints

3. **Create Entity API Service**
   - [x] Implement API service for Entity
     - File: `src/lib/api/entity.ts`
     - Implement methods for all Entity endpoints
     - Use axios for API requests
     - Handle authentication and error responses
     - Completed API methods:
       - Organization management (CRUD + analytics)
       - Department management (CRUD + hierarchy)
       - Team management (CRUD + members)
       - Team Member management (CRUD)
       - Organization Settings management (CRUD)

### Phase 2: Entity State Management ✅
1. **Set Up Tests**
   - [x] Create Entity store tests
     - File: `src/tests/store/entity.test.ts`
     - Use centralized testing utilities
     - Test store actions and state management
     - Test store selectors and computed properties
     - Fixed issues with API mocking and response handling
     - All tests now passing successfully

2. **Create Entity Store**
   - [x] Implement Entity store with Zustand
     - File: `src/store/slices/entitySlice.ts`
     - Create store slices for each Entity type
     - Implement actions for fetching, creating, updating, and deleting
     - Handle loading states and error handling
     - Fixed response handling to correctly access `results` property from paginated responses
     - Exported `EntityState` interface for use in tests

3. **Create Entity Hooks**
   - [x] Implement Entity hooks
     - File: `src/hooks/useEntity.ts`
     - Create hooks for each Entity type
     - Provide access to store and API methods
     - Handle loading states and error handling

### Phase 3: Organization Management (In Progress)
1. **Set Up Tests**
   - [x] Create Organization component tests
     - Directory: `src/tests/components/features/entity/organizations/`
     - Test files created but failing due to missing component implementations:
       - `OrganizationForm.test.tsx` - Module not found error
       - `OrganizationList.test.tsx` - Module not found error
       - `OrganizationDetail.test.tsx` - Missing UI elements (edit/delete buttons)
     - Need to fix test setup and implement missing components

2. **Create Organization Components**
   - [x] Implement organization list component
     - File: `src/components/features/entity/organizations/OrganizationList.tsx`
     - Display organizations in a table or list
     - Support filtering and pagination
     - Add actions for edit, delete, and view details

   - [x] Implement organization form component
     - File: `src/components/features/entity/organizations/OrganizationForm.tsx`
     - Create form for adding/editing organizations
     - Use existing form components
     - Add validation and error handling

   - [x] Implement organization detail component
     - File: `src/components/features/entity/organizations/OrganizationDetail.tsx`
     - Display organization details
     - Show related departments and teams
     - Add actions for managing organization
     - Ensure edit and delete buttons are present for tests

3. **Create Organization Pages**
   - [x] Implement organizations page
     - File: `src/app/(dashboard)/entities/organizations/page.tsx`
     - Use organization list component
     - Add navigation and breadcrumbs
     - Handle organization management actions

   - [ ] Implement organization detail page
     - File: `src/app/(dashboard)/entities/organizations/[id]/page.tsx`
     - Use organization detail component
     - Add navigation and breadcrumbs
     - Handle organization detail actions

   - [ ] Implement organization edit page
     - File: `src/app/(dashboard)/entities/organizations/[id]/edit/page.tsx`
     - Use organization form component
     - Add navigation and breadcrumbs
     - Handle organization edit actions

### Phase 4: Department Management
1. **Set Up Tests**
   - [ ] Create Department component tests
     - Directory: `src/tests/components/features/entity/departments/`
     - Test each component individually
     - Test component integration with hooks and store
     - Use `componentTestUtils.ts` for component testing

2. **Create Department Components**
   - [ ] Implement department list component
     - File: `src/components/features/entity/departments/DepartmentList.tsx`
     - Display departments in a table or list
     - Support filtering and pagination
     - Add actions for edit, delete, and view details

   - [ ] Implement department form component
     - File: `src/components/features/entity/departments/DepartmentForm.tsx`
     - Create form for adding/editing departments
     - Use existing form components
     - Add validation and error handling

   - [ ] Implement department detail component
     - File: `src/components/features/entity/departments/DepartmentDetail.tsx`
     - Display department details
     - Show related teams and members
     - Add actions for managing department

3. **Create Department Pages**
   - [ ] Implement departments page
     - File: `src/app/(dashboard)/entities/departments/page.tsx`
     - Use department list component
     - Add navigation and breadcrumbs
     - Handle department management actions

   - [ ] Implement department detail page
     - File: `src/app/(dashboard)/entities/departments/[id]/page.tsx`
     - Use department detail component
     - Add navigation and breadcrumbs
     - Handle department detail actions

   - [ ] Implement department edit page
     - File: `src/app/(dashboard)/entities/departments/[id]/edit/page.tsx`
     - Use department form component
     - Add navigation and breadcrumbs
     - Handle department edit actions

### Phase 5: Team Management
1. **Set Up Tests**
   - [ ] Create Team component tests
     - Directory: `src/tests/components/features/entity/teams/`
     - Test each component individually
     - Test component integration with hooks and store
     - Use `componentTestUtils.ts` for component testing

2. **Create Team Components**
   - [ ] Implement team list component
     - File: `src/components/features/entity/teams/TeamList.tsx`
     - Display teams in a table or list
     - Support filtering and pagination
     - Add actions for edit, delete, and view details

   - [ ] Implement team form component
     - File: `src/components/features/entity/teams/TeamForm.tsx`
     - Create form for adding/editing teams
     - Use existing form components
     - Add validation and error handling

   - [ ] Implement team detail component
     - File: `src/components/features/entity/teams/TeamDetail.tsx`
     - Display team details
     - Show related members
     - Add actions for managing team

3. **Create Team Pages**
   - [ ] Implement teams page
     - File: `src/app/(dashboard)/entities/teams/page.tsx`
     - Use team list component
     - Add navigation and breadcrumbs
     - Handle team management actions

   - [ ] Implement team detail page
     - File: `src/app/(dashboard)/entities/teams/[id]/page.tsx`
     - Use team detail component
     - Add navigation and breadcrumbs
     - Handle team detail actions

   - [ ] Implement team edit page
     - File: `src/app/(dashboard)/entities/teams/[id]/edit/page.tsx`
     - Use team form component
     - Add navigation and breadcrumbs
     - Handle team edit actions

### Phase 6: Team Member Management
1. **Set Up Tests**
   - [ ] Create Team Member component tests
     - Directory: `src/tests/components/features/entity/team-members/`
     - Test each component individually
     - Test component integration with hooks and store
     - Use `componentTestUtils.ts` for component testing

2. **Create Team Member Components**
   - [ ] Implement team member list component
     - File: `src/components/features/entity/team-members/TeamMemberList.tsx`
     - Display team members in a table or list
     - Support filtering and pagination
     - Add actions for edit, delete, and view details

   - [ ] Implement team member form component
     - File: `src/components/features/entity/team-members/TeamMemberForm.tsx`
     - Create form for adding/editing team members
     - Use existing form components
     - Add validation and error handling

   - [ ] Implement team member detail component
     - File: `src/components/features/entity/team-members/TeamMemberDetail.tsx`
     - Display team member details
     - Show related teams and roles
     - Add actions for managing team member

3. **Create Team Member Pages**
   - [ ] Implement team members page
     - File: `src/app/(dashboard)/entities/team-members/page.tsx`
     - Use team member list component
     - Add navigation and breadcrumbs
     - Handle team member management actions

   - [ ] Implement team member detail page
     - File: `src/app/(dashboard)/entities/team-members/[id]/page.tsx`
     - Use team member detail component
     - Add navigation and breadcrumbs
     - Handle team member detail actions

   - [ ] Implement team member edit page
     - File: `src/app/(dashboard)/entities/team-members/[id]/edit/page.tsx`
     - Use team member form component
     - Add navigation and breadcrumbs
     - Handle team member edit actions

### Phase 7: Organization Settings Management
1. **Set Up Tests**
   - [ ] Create Organization Settings component tests
     - Directory: `src/tests/components/features/entity/organization-settings/`
     - Test each component individually
     - Test component integration with hooks and store
     - Use `componentTestUtils.ts` for component testing

2. **Create Organization Settings Components**
   - [ ] Implement organization settings form component
     - File: `src/components/features/entity/organization-settings/OrganizationSettingsForm.tsx`
     - Create form for managing organization settings
     - Use existing form components
     - Add validation and error handling

   - [ ] Implement organization settings detail component
     - File: `src/components/features/entity/organization-settings/OrganizationSettingsDetail.tsx`
     - Display organization settings details
     - Add actions for managing settings

3. **Create Organization Settings Pages**
   - [ ] Implement organization settings page
     - File: `src/app/(dashboard)/entities/organization-settings/page.tsx`
     - Use organization settings form component
     - Add navigation and breadcrumbs
     - Handle organization settings management actions

   - [ ] Implement organization settings edit page
     - File: `src/app/(dashboard)/entities/organization-settings/[id]/edit/page.tsx`
     - Use organization settings form component
     - Add navigation and breadcrumbs
     - Handle organization settings edit actions

### Phase 8: Entity Analytics and Reporting
1. **Set Up Tests**
   - [ ] Create Entity Analytics component tests
     - Directory: `src/tests/components/features/entity/analytics/`
     - Test each component individually
     - Test component integration with hooks and store
     - Use `componentTestUtils.ts` for component testing

2. **Create Entity Analytics Components**
   - [ ] Implement organization analytics component
     - File: `src/components/features/entity/analytics/OrganizationAnalytics.tsx`
     - Display organization analytics
     - Show key metrics and charts
     - Add actions for exporting data

   - [ ] Implement organization activity component
     - File: `src/components/features/entity/analytics/OrganizationActivity.tsx`
     - Display organization activity
     - Show recent activities and engagement metrics
     - Add actions for filtering and exporting

   - [ ] Implement organization performance component
     - File: `src/components/features/entity/analytics/OrganizationPerformance.tsx`
     - Display organization performance
     - Show team and department performance
     - Add actions for filtering and exporting

   - [ ] Implement organization growth component
     - File: `src/components/features/entity/analytics/OrganizationGrowth.tsx`
     - Display organization growth
     - Show member, team, and department growth
     - Add actions for filtering and exporting

3. **Create Entity Analytics Pages**
   - [ ] Implement organization analytics page
     - File: `src/app/(dashboard)/entities/organizations/[id]/analytics/page.tsx`
     - Use organization analytics components
     - Add navigation and breadcrumbs
     - Handle analytics actions

### Phase 9: Entity Hierarchy Visualization
1. **Set Up Tests**
   - [ ] Create Entity Hierarchy component tests
     - Directory: `src/tests/components/features/entity/hierarchy/`
     - Test each component individually
     - Test component integration with hooks and store
     - Use `componentTestUtils.ts` for component testing

2. **Create Entity Hierarchy Components**
   - [ ] Implement organization hierarchy component
     - File: `src/components/features/entity/hierarchy/OrganizationHierarchy.tsx`
     - Display organization hierarchy
     - Show departments and teams in a tree structure
     - Add actions for navigating and managing hierarchy

   - [ ] Implement department hierarchy component
     - File: `src/components/features/entity/hierarchy/DepartmentHierarchy.tsx`
     - Display department hierarchy
     - Show teams in a tree structure
     - Add actions for navigating and managing hierarchy

3. **Create Entity Hierarchy Pages**
   - [ ] Implement organization hierarchy page
     - File: `src/app/(dashboard)/entities/organizations/[id]/hierarchy/page.tsx`
     - Use organization hierarchy component
     - Add navigation and breadcrumbs
     - Handle hierarchy actions

   - [ ] Implement department hierarchy page
     - File: `src/app/(dashboard)/entities/departments/[id]/hierarchy/page.tsx`
     - Use department hierarchy component
     - Add navigation and breadcrumbs
     - Handle hierarchy actions

### Phase 10: Entity Search and Filtering
1. **Set Up Tests**
   - [ ] Create Entity Search component tests
     - Directory: `src/tests/components/features/entity/search/`
     - Test each component individually
     - Test component integration with hooks and store
     - Use `componentTestUtils.ts`

## Testing Guidelines
- Use centralized testing utilities from `src/tests/utils/`
- NO direct imports from testing libraries
- Use `componentTestUtils.ts` for React component tests
- Use `functionTestUtils.ts` for utility function tests
- Use `integrationTestUtils.ts` for integration tests
- Use `createMockResponse` for API mocking

## API Integration Details
Based on `/home/ehab/Desktop/backend/docs/front-end/entity.md`:

### Organization Endpoints
- **List Organizations**: `GET /api/v1/entity/organizations/` ✅
- **Get Organization**: `GET /api/v1/entity/organizations/{id}/` ✅
- **Create Organization**: `POST /api/v1/entity/organizations/` ✅
- **Update Organization**: `PUT/PATCH /api/v1/entity/organizations/{id}/` ✅
- **Delete Organization**: `DELETE /api/v1/entity/organizations/{id}/` ✅
- **Hard Delete Organization**: `DELETE /api/v1/entity/organizations/{id}/hard_delete/` ✅
- **Get Organization Departments**: `GET /api/v1/entity/organizations/{id}/department/` ✅
- **Get Organization Team Members**: `GET /api/v1/entity/organizations/{id}/team_member/` ✅
- **Get Organization Analytics**: `GET /api/v1/entity/organizations/{id}/analytics/` ✅
- **Get Organization Activity**: `GET /api/v1/entity/organizations/{id}/activity/` ✅
- **Get Organization Performance**: `GET /api/v1/entity/organizations/{id}/performance/` ✅
- **Get Organization Growth**: `GET /api/v1/entity/organizations/{id}/growth/` ✅

### Department Endpoints
- **List Departments**: `GET /api/v1/entity/departments/` ✅
- **Get Department**: `GET /api/v1/entity/departments/{id}/` ✅
- **Create Department**: `POST /api/v1/entity/departments/` ✅
- **Update Department**: `PUT/PATCH /api/v1/entity/departments/{id}/` ✅
- **Delete Department**: `DELETE /api/v1/entity/departments/{id}/` ✅
- **Hard Delete Department**: `DELETE /api/v1/entity/departments/{id}/hard_delete/` ✅
- **Get Department Teams**: `GET /api/v1/entity/departments/{id}/team/` ✅
- **Get Department Team Members**: `GET /api/v1/entity/departments/{id}/team_member/` ✅
- **Get Child Departments**: `GET /api/v1/entity/departments/{id}/child_department/` ✅

### Team Endpoints
- **List Teams**: `GET /api/v1/entity/teams/` ✅
- **Get Team**: `GET /api/v1/entity/teams/{id}/` ✅
- **Create Team**: `POST /api/v1/entity/teams/` ✅
- **Update Team**: `PUT/PATCH /api/v1/entity/teams/{id}/` ✅
- **Delete Team**: `DELETE /api/v1/entity/teams/{id}/` ✅
- **Hard Delete Team**: `DELETE /api/v1/entity/teams/{id}/hard_delete/` ✅
- **Get Team Members**: `GET /api/v1/entity/teams/{id}/team_member/` ✅

### Team Member Endpoints
- **List Team Members**: `GET /api/v1/entity/team-members/` ✅
- **Get Team Member**: `GET /api/v1/entity/team-members/{id}/` ✅
- **Create Team Member**: `POST /api/v1/entity/team-members/` ✅
- **Update Team Member**: `PUT/PATCH /api/v1/entity/team-members/{id}/` ✅
- **Delete Team Member**: `DELETE /api/v1/entity/team-members/{id}/` ✅
- **Hard Delete Team Member**: `DELETE /api/v1/entity/team-members/{id}/hard_delete/` ✅

### Organization Settings Endpoints
- **List Organization Settings**: `GET /api/v1/entity/organization-settings/` ✅
- **Get Organization Settings**: `GET /api/v1/entity/organization-settings/{id}/` ✅
- **Create Organization Settings**: `POST /api/v1/entity/organization-settings/` ✅
- **Update Organization Settings**: `PUT/PATCH /api/v1/entity/organization-settings/{id}/` ✅
- **Delete Organization Settings**: `DELETE /api/v1/entity/organization-settings/{id}/` ✅
- **Hard Delete Organization Settings**: `DELETE /api/v1/entity/organization-settings/{id}/hard_delete/` ✅
- **Get Settings by Organization**: `GET /api/v1/entity/organization-settings/get_by_organization/` ✅

## Current Status and Next Steps
- **Completed**: 
  - Phase 1: Core Entity Types and API Integration ✅
  - Phase 2: Entity State Management ✅
  - API endpoints for all entity types ✅
  - Entity store implementation ✅
  - Entity hooks implementation ✅

- **In Progress**:
  - Phase 3: Organization Management
    - Test files created but failing
    - Need to implement missing components
    - Need to fix Zustand store test setup

- **Next Steps**:
  1. Fix the Zustand store test setup in `entity.test.ts`
  2. Implement the missing organization components:
     - `OrganizationList.tsx`
     - `OrganizationForm.tsx`
     - `OrganizationDetail.tsx`
  3. Update tests to match the implemented components
  4. Proceed with implementing organization pages

Status Key:
- [ ] To Do
- [x] Completed
- ✅ Implemented and Tested