# Authentication Feature - Simplified Implementation Plan

## Simplification Principles
1. Focus on one feature at a time
2. Reuse existing components and utilities
3. Use centralized testing utilities for all tests
4. Follow the existing project architecture

## Implementation Phases

### Phase 1: Login Feature
1. **Set Up Tests**
   - [x] Create login tests using centralized testing utilities
     - File: `src/tests/features/auth/login.test.ts`
     - Import utilities from `src/tests/utils/` (NOT directly from testing libraries)
     - Use `componentTestUtils.ts` for component testing
     - Use `mockApi.ts` for API mocking
     - Test form validation, API integration, and error handling

2. **Create Core Login Components**
   - [x] Set up auth store with Zustand
     - File: `src/lib/store/slices/authSlice.ts`
     - Implement login/logout actions
     - Handle API response from `/api/v1/users/login/`
     - Store user profile and tokens
   
   - [x] Implement login form
     - File: `src/components/features/auth/LoginForm.tsx`
     - Use existing UI components from `src/components/ui`
     - Fields: username/email and password
     - Form validation with error messages
     - Loading state during submission

3. **Create Login Page**
   - [x] Implement login page
     - File: `src/app/(auth)/login/page.tsx`
     - Use login form component
     - Add navigation link for forgot password
     - Handle redirect after successful login

4. **API Integration**
   - [x] Connect to backend API
     - Set up API client for `/api/v1/users/login/`
     - Handle authentication response and tokens
     - Implement error handling for failed login attempts
     - Support for potential 2FA flow

### Phase 2: Session Management
1. **Token Handling**
   - [x] Set up token storage utility
     - File: `src/lib/features/auth/token.ts`
     - Store tokens securely (localStorage/cookies)
     - Add to API request headers
     - Handle token refresh using `/api/v1/users/refresh-token/`

2. **Protected Routes**
   - [x] Create simple auth middleware
     - File: `src/middleware.ts` (Next.js middleware)
     - Check auth state for protected routes
     - Redirect unauthenticated users to login

3. **User Profile**
   - [x] Add user profile view
     - File: `src/components/features/auth/UserProfile.tsx`
     - Display current user information
     - Option to logout
     - Change password functionality

### Phase 3: Password Management (Optional)
1. **Forgot Password**
   - [ ] Implement forgot password functionality
     - Create request form for password reset
     - Handle password reset confirmation
     - Connect to relevant API endpoints

2. **Change Password**
   - [x] Add change password feature for logged-in users
     - Create change password form
     - Validate current and new passwords
     - Show success/error messages
     - **Note: Currently implemented as a simulation since the backend API doesn't have a dedicated change-password endpoint. The frontend interface is complete, but actual password changing functionality will require a backend endpoint update.**

## Testing Guidelines
- Use centralized testing utilities from `src/tests/utils/`
- NO direct imports from testing libraries
- Use `componentTestUtils.ts` for React component tests
- Use `functionTestUtils.ts` for utility function tests
- Use `integrationTestUtils.ts` for integration tests
- Use `mockApi.ts` for mocking API responses

## API Integration Details
Based on `/home/ehab/Desktop/backend/docs/users/api.md`:

### Login Endpoint
- **URL**: `/api/v1/users/login/`
- **Method**: POST
- **Request Body**:
  ```json
  {
    "username": "username",  // or "email": "user@example.com"
    "password": "securepassword"
  }
  ```
- **Success Response**:
  ```json
  {
    "refresh": "refresh_token",
    "access": "access_token",
    "user": {
      // User profile data
    }
  }
  ```

### Token Refresh Endpoint
- **URL**: `/api/v1/users/refresh-token/`
- **Method**: POST
- **Request Body**:
  ```json
  {
    "refresh": "refresh_token"
  }
  ```

### Password Management Endpoints
- **Reset Request**: `POST /api/v1/users/password-reset/`
- **Reset Confirm**: `POST /api/v1/users/password-reset-confirm/`

Status Key:
- [ ] To Do
- [x] Completed 