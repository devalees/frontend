# State Management Test Refactoring Example

This document provides a detailed example of refactoring a test for state management to use our new centralized testing utilities, specifically focusing on the testUtils with hooks testing.

## State Management Test Refactoring Example: User Profile Hook

Let's walk through the process of refactoring a test for a custom hook that manages user profile state.

### Original Test File

```typescript
// src/tests/state/useUserProfile.test.ts (before refactoring)
import { renderHook, act } from '@testing-library/react-hooks';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import axios from 'axios';
import { useUserProfile } from '../../state/hooks/useUserProfile';
import { UserProfile } from '../../types';

// Mock axios
vi.mock('axios');

// Sample user profile data
const sampleUserProfile: UserProfile = {
  id: 'user123',
  name: 'Test User',
  email: 'test@example.com',
  bio: 'Test bio',
  avatarUrl: 'https://example.com/avatar.jpg',
  createdAt: '2023-01-01T00:00:00.000Z'
};

describe('useUserProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch user profile on mount', async () => {
    // Mock successful API response
    (axios.get as any).mockResolvedValueOnce({
      data: sampleUserProfile
    });

    // Render the hook
    const { result, waitForNextUpdate } = renderHook(() => useUserProfile('user123'));
    
    // Initial state should be loading with no profile
    expect(result.current.isLoading).toBe(true);
    expect(result.current.profile).toBeNull();
    expect(result.current.error).toBeNull();
    
    // Wait for the API call to resolve
    await waitForNextUpdate();
    
    // After API call, loading should be false and profile should be set
    expect(result.current.isLoading).toBe(false);
    expect(result.current.profile).toEqual(sampleUserProfile);
    expect(result.current.error).toBeNull();
    
    // Verify the API was called with the right URL
    expect(axios.get).toHaveBeenCalledWith('/api/users/user123');
  });

  it('should handle errors when fetching profile', async () => {
    // Mock API error
    const apiError = {
      response: {
        status: 404,
        data: { message: 'User not found' }
      }
    };
    (axios.get as any).mockRejectedValueOnce(apiError);

    // Render the hook
    const { result, waitForNextUpdate } = renderHook(() => useUserProfile('nonexistent'));
    
    // Initial state should be loading
    expect(result.current.isLoading).toBe(true);
    
    // Wait for the API call to reject
    await waitForNextUpdate();
    
    // After error, loading should be false and error should be set
    expect(result.current.isLoading).toBe(false);
    expect(result.current.profile).toBeNull();
    expect(result.current.error).toBe('User not found');
  });

  it('should update profile when calling updateProfile', async () => {
    // Mock initial profile fetch
    (axios.get as any).mockResolvedValueOnce({
      data: sampleUserProfile
    });
    
    // Mock profile update API call
    const updatedProfile = { ...sampleUserProfile, name: 'Updated Name', bio: 'Updated bio' };
    (axios.patch as any).mockResolvedValueOnce({
      data: updatedProfile
    });
    
    // Render the hook
    const { result, waitForNextUpdate } = renderHook(() => useUserProfile('user123'));
    
    // Wait for initial fetch to complete
    await waitForNextUpdate();
    
    // Verify initial state
    expect(result.current.profile).toEqual(sampleUserProfile);
    
    // Call updateProfile
    await act(async () => {
      await result.current.updateProfile({ name: 'Updated Name', bio: 'Updated bio' });
    });
    
    // Verify profile was updated in the state
    expect(result.current.profile).toEqual(updatedProfile);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    
    // Verify the API was called correctly
    expect(axios.patch).toHaveBeenCalledWith('/api/users/user123', {
      name: 'Updated Name',
      bio: 'Updated bio'
    });
  });

  it('should handle errors when updating profile', async () => {
    // Mock initial profile fetch
    (axios.get as any).mockResolvedValueOnce({
      data: sampleUserProfile
    });
    
    // Mock profile update API error
    const updateError = {
      response: {
        status: 400,
        data: { message: 'Invalid profile data' }
      }
    };
    (axios.patch as any).mockRejectedValueOnce(updateError);
    
    // Render the hook
    const { result, waitForNextUpdate } = renderHook(() => useUserProfile('user123'));
    
    // Wait for initial fetch to complete
    await waitForNextUpdate();
    
    // Call updateProfile
    await act(async () => {
      await result.current.updateProfile({ name: '' }); // Empty name to trigger validation error
    });
    
    // Verify error state
    expect(result.current.isLoading).toBe(false);
    expect(result.current.profile).toEqual(sampleUserProfile); // Original profile should be unchanged
    expect(result.current.error).toBe('Invalid profile data');
    
    // Verify the API was called
    expect(axios.patch).toHaveBeenCalledWith('/api/users/user123', { name: '' });
  });
});
```

### Step 1: Update Imports and Setup

Replace the direct imports with imports from our centralized utilities:

```typescript
// src/tests/state/useUserProfile.test.ts (after step 1)
import { vi, describe, it, expect, beforeEach } from 'vitest';
import axios from 'axios';
import { renderHook, act } from '../../tests/utils'; // Import from our centralized utilities
import { useUserProfile } from '../../state/hooks/useUserProfile';
import { UserProfile } from '../../types';

// Mock axios
vi.mock('axios');
```

### Step 2: Create Fixtures

```typescript
// src/tests/state/useUserProfile.test.ts (after step 2)
import { vi, describe, it, expect, beforeEach } from 'vitest';
import axios from 'axios';
import { renderHook, act, createMockResponse, createMockError } from '../../tests/utils';
import { useUserProfile } from '../../state/hooks/useUserProfile';
import { UserProfile } from '../../types';

// Mock axios
vi.mock('axios');

// Create fixtures using factory functions
const createUserProfile = (overrides = {}): UserProfile => ({
  id: 'user123',
  name: 'Test User',
  email: 'test@example.com',
  bio: 'Test bio',
  avatarUrl: 'https://example.com/avatar.jpg',
  createdAt: '2023-01-01T00:00:00.000Z',
  ...overrides
});

// Update payload factory function
const createProfileUpdatePayload = (overrides = {}) => ({
  name: 'Updated Name',
  bio: 'Updated bio',
  ...overrides
});
```

### Step 3: Refactor Tests

```typescript
// src/tests/state/useUserProfile.test.ts (after step 3)
import { vi, describe, it, expect, beforeEach } from 'vitest';
import axios from 'axios';
import { 
  renderHook, 
  act, 
  createMockResponse, 
  createMockError,
  resetApiMocks 
} from '../../tests/utils';
import { useUserProfile } from '../../state/hooks/useUserProfile';
import { UserProfile } from '../../types';

// Mock axios
vi.mock('axios');

// Create fixtures using factory functions
const createUserProfile = (overrides = {}): UserProfile => ({
  id: 'user123',
  name: 'Test User',
  email: 'test@example.com',
  bio: 'Test bio',
  avatarUrl: 'https://example.com/avatar.jpg',
  createdAt: '2023-01-01T00:00:00.000Z',
  ...overrides
});

// Update payload factory function
const createProfileUpdatePayload = (overrides = {}) => ({
  name: 'Updated Name',
  bio: 'Updated bio',
  ...overrides
});

describe('useUserProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetApiMocks();
  });

  it('should fetch user profile on mount', async () => {
    // Setup with fixture
    const userId = 'user123';
    const userProfile = createUserProfile({ id: userId });
    
    // Mock successful API response
    vi.mocked(axios.get).mockResolvedValueOnce(createMockResponse(userProfile));

    // Render the hook with the provided test wrapper
    const { result, waitForNextUpdate } = renderHook(() => useUserProfile(userId));
    
    // Initial state should be loading with no profile
    expect(result.current.isLoading).toBe(true);
    expect(result.current.profile).toBeNull();
    expect(result.current.error).toBeNull();
    
    // Wait for the API call to resolve
    await waitForNextUpdate();
    
    // After API call, loading should be false and profile should be set
    expect(result.current.isLoading).toBe(false);
    expect(result.current.profile).toEqual(userProfile);
    expect(result.current.error).toBeNull();
    
    // Verify the API was called with the right URL
    expect(axios.get).toHaveBeenCalledWith(`/api/users/${userId}`);
  });

  it('should handle errors when fetching profile', async () => {
    // Setup with mock error
    const userId = 'nonexistent';
    const errorMessage = 'User not found';
    const apiError = createMockError(errorMessage, 404, 'USER_NOT_FOUND');
    
    // Mock API error
    vi.mocked(axios.get).mockRejectedValueOnce(apiError);

    // Render the hook
    const { result, waitForNextUpdate } = renderHook(() => useUserProfile(userId));
    
    // Initial state should be loading
    expect(result.current.isLoading).toBe(true);
    
    // Wait for the API call to reject
    await waitForNextUpdate();
    
    // After error, loading should be false and error should be set
    expect(result.current.isLoading).toBe(false);
    expect(result.current.profile).toBeNull();
    expect(result.current.error).toBe(errorMessage);
  });

  it('should update profile when calling updateProfile', async () => {
    // Setup with fixtures
    const userId = 'user123';
    const userProfile = createUserProfile({ id: userId });
    const updatePayload = createProfileUpdatePayload();
    const updatedProfile = createUserProfile({ 
      id: userId, 
      ...updatePayload 
    });
    
    // Mock initial profile fetch
    vi.mocked(axios.get).mockResolvedValueOnce(createMockResponse(userProfile));
    
    // Mock profile update API call
    vi.mocked(axios.patch).mockResolvedValueOnce(createMockResponse(updatedProfile));
    
    // Render the hook
    const { result, waitForNextUpdate } = renderHook(() => useUserProfile(userId));
    
    // Wait for initial fetch to complete
    await waitForNextUpdate();
    
    // Verify initial state
    expect(result.current.profile).toEqual(userProfile);
    
    // Call updateProfile
    await act(async () => {
      await result.current.updateProfile(updatePayload);
    });
    
    // Verify profile was updated in the state
    expect(result.current.profile).toEqual(updatedProfile);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    
    // Verify the API was called correctly
    expect(axios.patch).toHaveBeenCalledWith(`/api/users/${userId}`, updatePayload);
  });

  it('should handle errors when updating profile', async () => {
    // Setup with fixtures
    const userId = 'user123';
    const userProfile = createUserProfile({ id: userId });
    const invalidUpdatePayload = { name: '' }; // Empty name to trigger validation error
    const errorMessage = 'Invalid profile data';
    const updateError = createMockError(errorMessage, 400, 'VALIDATION_ERROR');
    
    // Mock initial profile fetch
    vi.mocked(axios.get).mockResolvedValueOnce(createMockResponse(userProfile));
    
    // Mock profile update API error
    vi.mocked(axios.patch).mockRejectedValueOnce(updateError);
    
    // Render the hook
    const { result, waitForNextUpdate } = renderHook(() => useUserProfile(userId));
    
    // Wait for initial fetch to complete
    await waitForNextUpdate();
    
    // Call updateProfile
    await act(async () => {
      await result.current.updateProfile(invalidUpdatePayload);
    });
    
    // Verify error state
    expect(result.current.isLoading).toBe(false);
    expect(result.current.profile).toEqual(userProfile); // Original profile should be unchanged
    expect(result.current.error).toBe(errorMessage);
    
    // Verify the API was called
    expect(axios.patch).toHaveBeenCalledWith(`/api/users/${userId}`, invalidUpdatePayload);
  });
});
```

### Final Refactored Test

Let's create an even more optimized test version by adding test contexts, parameterization, and improved organization:

```typescript
// src/tests/state/useUserProfile.test.ts (final version)
import { vi, describe, it, expect, beforeEach } from 'vitest';
import axios from 'axios';
import { 
  renderHook, 
  act, 
  createMockResponse, 
  createMockError,
  resetApiMocks,
  waitFor
} from '../../tests/utils';
import { useUserProfile } from '../../state/hooks/useUserProfile';
import { UserProfile } from '../../types';

// Mock axios
vi.mock('axios');

// Create fixtures using factory functions
const createUserProfile = (overrides = {}): UserProfile => ({
  id: 'user123',
  name: 'Test User',
  email: 'test@example.com',
  bio: 'Test bio',
  avatarUrl: 'https://example.com/avatar.jpg',
  createdAt: '2023-01-01T00:00:00.000Z',
  ...overrides
});

// Update payload factory function
const createProfileUpdatePayload = (overrides = {}) => ({
  name: 'Updated Name',
  bio: 'Updated bio',
  ...overrides
});

describe('useUserProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetApiMocks();
  });

  describe('Fetching user profile', () => {
    it('should fetch user profile on mount', async () => {
      // Setup with fixture
      const userId = 'user123';
      const userProfile = createUserProfile({ id: userId });
      
      // Mock successful API response
      vi.mocked(axios.get).mockResolvedValueOnce(createMockResponse(userProfile));

      // Render the hook with the provided test wrapper
      const { result } = renderHook(() => useUserProfile(userId));
      
      // Initial state should be loading with no profile
      expect(result.current.isLoading).toBe(true);
      expect(result.current.profile).toBeNull();
      expect(result.current.error).toBeNull();
      
      // Wait for the API call to resolve
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      
      // After API call, profile should be set
      expect(result.current.profile).toEqual(userProfile);
      expect(result.current.error).toBeNull();
      
      // Verify the API was called with the right URL
      expect(axios.get).toHaveBeenCalledWith(`/api/users/${userId}`);
    });

    it.each([
      { 
        status: 404, 
        message: 'User not found', 
        errorCode: 'USER_NOT_FOUND' 
      },
      { 
        status: 500, 
        message: 'Server error', 
        errorCode: 'SERVER_ERROR'
      }
    ])('should handle $status error when fetching profile', async ({ status, message, errorCode }) => {
      // Setup with mock error
      const userId = 'nonexistent';
      const apiError = createMockError(message, status, errorCode);
      
      // Mock API error
      vi.mocked(axios.get).mockRejectedValueOnce(apiError);

      // Render the hook
      const { result } = renderHook(() => useUserProfile(userId));
      
      // Wait for the API call to reject
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      
      // After error, check error state
      expect(result.current.profile).toBeNull();
      expect(result.current.error).toBe(message);
    });
  });

  describe('Updating user profile', () => {
    async function setupProfileForUpdate() {
      const userId = 'user123';
      const userProfile = createUserProfile({ id: userId });
      
      // Mock initial profile fetch
      vi.mocked(axios.get).mockResolvedValueOnce(createMockResponse(userProfile));
      
      // Render the hook
      const { result } = renderHook(() => useUserProfile(userId));
      
      // Wait for initial fetch to complete
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      
      return { result, userId, userProfile };
    }

    it('should update profile when calling updateProfile', async () => {
      // Setup with common setup function
      const { result, userId, userProfile } = await setupProfileForUpdate();
      
      // Setup update payload and response
      const updatePayload = createProfileUpdatePayload();
      const updatedProfile = createUserProfile({ 
        id: userId, 
        ...updatePayload 
      });
      
      // Mock profile update API call
      vi.mocked(axios.patch).mockResolvedValueOnce(createMockResponse(updatedProfile));
      
      // Call updateProfile
      await act(async () => {
        await result.current.updateProfile(updatePayload);
      });
      
      // Verify profile was updated in the state
      expect(result.current.profile).toEqual(updatedProfile);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      
      // Verify the API was called correctly
      expect(axios.patch).toHaveBeenCalledWith(`/api/users/${userId}`, updatePayload);
    });

    it('should handle errors when updating profile', async () => {
      // Setup with common setup function
      const { result, userId, userProfile } = await setupProfileForUpdate();
      
      // Setup invalid update and error
      const invalidUpdatePayload = { name: '' };
      const errorMessage = 'Invalid profile data';
      const updateError = createMockError(errorMessage, 400, 'VALIDATION_ERROR');
      
      // Mock profile update API error
      vi.mocked(axios.patch).mockRejectedValueOnce(updateError);
      
      // Call updateProfile
      await act(async () => {
        await result.current.updateProfile(invalidUpdatePayload);
      });
      
      // Verify error state
      expect(result.current.isLoading).toBe(false);
      expect(result.current.profile).toEqual(userProfile); // Original profile should be unchanged
      expect(result.current.error).toBe(errorMessage);
      
      // Verify the API was called
      expect(axios.patch).toHaveBeenCalledWith(`/api/users/${userId}`, invalidUpdatePayload);
    });
  });
});
```

## Benefits of the Refactoring

1. **Using Custom Render Utilities**: Using the centralized renderHook utility ensures consistent behavior across all hook tests, including any context providers that might be needed.

2. **Fixtures for Consistent Test Data**: The createUserProfile and createProfileUpdatePayload fixtures make test setup more consistent and readable.

3. **Mock Response Utilities**: Using createMockResponse and createMockError for standardized API response structures.

4. **Helper Reset Functions**: The resetApiMocks utility ensures clean state between tests.

5. **Structured Tests with Nested Describes**: Organizing tests into logical groups improves readability and maintainability.

6. **Parameterized Testing**: Using test.each for different error cases reduces code duplication.

7. **Setup Functions**: The setupProfileForUpdate function eliminates repetitive setup code.

8. **Modern React Testing Patterns**: Using waitFor instead of waitForNextUpdate for better compatibility with React Testing Library's newer versions.

## Next Steps for State Management Test Refactoring

After refactoring the useUserProfile test:

1. Apply the same pattern to other state management hooks and context tests
2. Prioritize tests with complex state or side effects
3. Update tests that involve multiple hooks or contexts
4. Create additional fixtures for common state structures
5. Document specific patterns for testing different types of state management

This approach ensures that all state management tests follow consistent patterns, making them easier to write, maintain, and understand. 