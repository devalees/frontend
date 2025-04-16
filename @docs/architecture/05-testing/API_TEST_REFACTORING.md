# API Test Refactoring Example

This document provides a detailed example of refactoring an API-related test to use our new centralized testing utilities, specifically focusing on the mockApi utilities.

## API Test Refactoring Example: Token Refresh Mechanism

Let's walk through the process of refactoring a test for the token refresh mechanism.

### Original Test File

```typescript
// src/tests/api/tokenRefresh.test.ts (before refactoring)
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { setupTokenRefresh } from '../../lib/api/tokenRefresh';
import { getAuthTokens, setAuthTokens } from '../../lib/api/authTokens';

// Mock axios
vi.mock('axios');

// Mock auth token storage
vi.mock('../../lib/api/authTokens', () => ({
  getAuthTokens: vi.fn(),
  setAuthTokens: vi.fn()
}));

describe('Token Refresh Mechanism', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should attach authorization header to requests', async () => {
    // Setup
    getAuthTokens.mockReturnValue({ accessToken: 'test-token', refreshToken: 'refresh-token' });
    (axios.interceptors.request.use as any) = vi.fn((callback) => {
      // Call the interceptor callback with a mock request
      const mockRequest = {
        headers: {}
      };
      callback(mockRequest);
      // Verify the authorization header was set
      expect(mockRequest.headers['Authorization']).toBe('Bearer test-token');
    });

    // Initialize the token refresh mechanism
    setupTokenRefresh();

    // Verify axios interceptor was registered
    expect(axios.interceptors.request.use).toHaveBeenCalled();
  });

  it('should refresh token when API returns 401', async () => {
    // Setup
    getAuthTokens.mockReturnValue({ accessToken: 'expired-token', refreshToken: 'refresh-token' });
    
    // Mock axios post to simulate refresh token API
    (axios.post as any) = vi.fn().mockResolvedValueOnce({
      data: {
        accessToken: 'new-token',
        refreshToken: 'new-refresh-token'
      }
    });

    // Mock axios response interceptor
    let responseErrorInterceptor: Function;
    (axios.interceptors.response.use as any) = vi.fn((successCallback, errorCallback) => {
      responseErrorInterceptor = errorCallback;
    });

    // Initialize the token refresh mechanism
    setupTokenRefresh();

    // Verify response interceptor was registered
    expect(axios.interceptors.response.use).toHaveBeenCalled();

    // Simulate a 401 error response
    const mockError = {
      response: { status: 401 },
      config: {
        url: '/api/some-endpoint',
        headers: { 'Authorization': 'Bearer expired-token' },
        method: 'get',
        data: {}
      }
    };

    // Mock axios for the retry request
    (axios as any) = vi.fn().mockResolvedValueOnce({ data: 'success' });

    // Call the error interceptor with the mock error
    const result = await responseErrorInterceptor(mockError);

    // Verify tokens were refreshed
    expect(axios.post).toHaveBeenCalledWith('/api/auth/refresh', { refreshToken: 'refresh-token' });
    expect(setAuthTokens).toHaveBeenCalledWith({
      accessToken: 'new-token',
      refreshToken: 'new-refresh-token'
    });

    // Verify the original request was retried with the new token
    expect(axios).toHaveBeenCalledWith({
      url: '/api/some-endpoint',
      headers: { 'Authorization': 'Bearer new-token' },
      method: 'get',
      data: {}
    });

    // Verify the result matches the retry response
    expect(result).toEqual({ data: 'success' });
  });

  it('should handle refresh token failure', async () => {
    // Setup
    getAuthTokens.mockReturnValue({ accessToken: 'expired-token', refreshToken: 'invalid-refresh' });
    
    // Mock axios post to simulate refresh token failure
    (axios.post as any) = vi.fn().mockRejectedValueOnce({
      response: { status: 400, data: { message: 'Invalid refresh token' } }
    });

    // Mock axios response interceptor
    let responseErrorInterceptor: Function;
    (axios.interceptors.response.use as any) = vi.fn((successCallback, errorCallback) => {
      responseErrorInterceptor = errorCallback;
    });

    // Initialize the token refresh mechanism
    setupTokenRefresh();

    // Simulate a 401 error response
    const mockError = {
      response: { status: 401 },
      config: {
        url: '/api/some-endpoint',
        headers: { 'Authorization': 'Bearer expired-token' },
        method: 'get'
      }
    };

    // Test that the refresh failure is properly handled
    await expect(responseErrorInterceptor(mockError)).rejects.toEqual({
      response: { status: 400, data: { message: 'Invalid refresh token' } }
    });

    // Verify refresh attempt
    expect(axios.post).toHaveBeenCalledWith('/api/auth/refresh', { refreshToken: 'invalid-refresh' });
    
    // Verify original request was not retried
    expect(axios).not.toHaveBeenCalled();
  });
});
```

### Step 1: Update Imports and Setup Mocks

Replace the direct axios mocking with our mockApi utilities:

```typescript
// src/tests/api/tokenRefresh.test.ts (after step 1)
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { setupTokenRefresh } from '../../lib/api/tokenRefresh';
import { getAuthTokens, setAuthTokens } from '../../lib/api/authTokens';
import { mockApiMethod, createMockResponse, createMockError } from '../../tests/utils';

// Mock axios
vi.mock('axios');

// Mock auth token storage
vi.mock('../../lib/api/authTokens', () => ({
  getAuthTokens: vi.fn(),
  setAuthTokens: vi.fn()
}));
```

### Step 2: Create Fixtures for Auth Tokens and Responses

```typescript
// src/tests/api/tokenRefresh.test.ts (after step 2)
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { setupTokenRefresh } from '../../lib/api/tokenRefresh';
import { getAuthTokens, setAuthTokens } from '../../lib/api/authTokens';
import { 
  mockApiMethod, 
  createMockResponse, 
  createMockError,
  createErrorResponse 
} from '../../tests/utils';

// Mock axios
vi.mock('axios');

// Mock auth token storage
vi.mock('../../lib/api/authTokens', () => ({
  getAuthTokens: vi.fn(),
  setAuthTokens: vi.fn()
}));

// Create fixtures for auth tokens
const createAuthTokens = (overrides = {}) => ({
  accessToken: 'test-token',
  refreshToken: 'refresh-token',
  ...overrides
});

// Create fixtures for a 401 error
const create401Error = (config = {}) => ({
  response: { status: 401 },
  config: {
    url: '/api/some-endpoint',
    headers: { 'Authorization': 'Bearer expired-token' },
    method: 'get',
    data: {},
    ...config
  }
});
```

### Step 3: Refactor the Tests

```typescript
// src/tests/api/tokenRefresh.test.ts (after step 3)
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { setupTokenRefresh } from '../../lib/api/tokenRefresh';
import { getAuthTokens, setAuthTokens } from '../../lib/api/authTokens';
import { 
  mockApiMethod, 
  createMockResponse, 
  createMockError,
  createErrorResponse 
} from '../../tests/utils';

// Mock axios
vi.mock('axios');

// Mock auth token storage
vi.mock('../../lib/api/authTokens', () => ({
  getAuthTokens: vi.fn(),
  setAuthTokens: vi.fn()
}));

// Create fixtures for auth tokens
const createAuthTokens = (overrides = {}) => ({
  accessToken: 'test-token',
  refreshToken: 'refresh-token',
  ...overrides
});

// Create fixtures for a 401 error
const create401Error = (config = {}) => ({
  response: { status: 401 },
  config: {
    url: '/api/some-endpoint',
    headers: { 'Authorization': 'Bearer expired-token' },
    method: 'get',
    data: {},
    ...config
  }
});

describe('Token Refresh Mechanism', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should attach authorization header to requests', async () => {
    // Setup token fixture
    const tokens = createAuthTokens();
    getAuthTokens.mockReturnValue(tokens);
    
    // Mock request interceptor
    (axios.interceptors.request.use as any) = vi.fn((callback) => {
      // Call the interceptor callback with a mock request
      const mockRequest = { headers: {} };
      callback(mockRequest);
      
      // Verify the authorization header was set
      expect(mockRequest.headers['Authorization']).toBe(`Bearer ${tokens.accessToken}`);
    });

    // Initialize the token refresh mechanism
    setupTokenRefresh();

    // Verify axios interceptor was registered
    expect(axios.interceptors.request.use).toHaveBeenCalled();
  });

  it('should refresh token when API returns 401', async () => {
    // Setup token fixtures
    const expiredTokens = createAuthTokens({ accessToken: 'expired-token' });
    const newTokens = createAuthTokens({ accessToken: 'new-token', refreshToken: 'new-refresh-token' });
    
    getAuthTokens.mockReturnValue(expiredTokens);
    
    // Mock refresh token API response
    vi.mocked(axios.post).mockResolvedValueOnce(createMockResponse(newTokens));

    // Mock response interceptor
    let responseErrorInterceptor: Function;
    (axios.interceptors.response.use as any) = vi.fn((successCallback, errorCallback) => {
      responseErrorInterceptor = errorCallback;
    });

    // Initialize the token refresh mechanism
    setupTokenRefresh();

    // Create 401 error fixture
    const mockError = create401Error();

    // Mock axios for the retry request
    vi.mocked(axios).mockResolvedValueOnce(createMockResponse({ data: 'success' }));

    // Call the error interceptor with the mock error
    const result = await responseErrorInterceptor(mockError);

    // Verify tokens were refreshed
    expect(axios.post).toHaveBeenCalledWith('/api/auth/refresh', { refreshToken: expiredTokens.refreshToken });
    expect(setAuthTokens).toHaveBeenCalledWith(newTokens);

    // Verify the original request was retried with the new token
    expect(axios).toHaveBeenCalledWith({
      url: '/api/some-endpoint',
      headers: { 'Authorization': `Bearer ${newTokens.accessToken}` },
      method: 'get',
      data: {}
    });

    // Verify the result matches the retry response
    expect(result).toEqual(createMockResponse({ data: 'success' }));
  });

  it('should handle refresh token failure', async () => {
    // Setup token fixtures with invalid refresh token
    const expiredTokens = createAuthTokens({ 
      accessToken: 'expired-token', 
      refreshToken: 'invalid-refresh' 
    });
    
    getAuthTokens.mockReturnValue(expiredTokens);
    
    // Create error response fixture
    const refreshError = createMockError('Invalid refresh token', 400, 'INVALID_REFRESH_TOKEN');
    
    // Mock refresh token API failure
    vi.mocked(axios.post).mockRejectedValueOnce(refreshError);

    // Mock response interceptor
    let responseErrorInterceptor: Function;
    (axios.interceptors.response.use as any) = vi.fn((successCallback, errorCallback) => {
      responseErrorInterceptor = errorCallback;
    });

    // Initialize the token refresh mechanism
    setupTokenRefresh();

    // Create 401 error fixture
    const mockError = create401Error();

    // Test that the refresh failure is properly handled
    await expect(responseErrorInterceptor(mockError)).rejects.toEqual(refreshError);

    // Verify refresh attempt
    expect(axios.post).toHaveBeenCalledWith('/api/auth/refresh', { 
      refreshToken: expiredTokens.refreshToken 
    });
    
    // Verify original request was not retried
    expect(axios).not.toHaveBeenCalled();
  });
});
```

### Final Refactored Test

Let's further optimize the test with additional improvements:

```typescript
// src/tests/api/tokenRefresh.test.ts (final version)
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { setupTokenRefresh } from '../../lib/api/tokenRefresh';
import { getAuthTokens, setAuthTokens } from '../../lib/api/authTokens';
import { 
  mockApiMethod, 
  createMockResponse, 
  createMockError,
  ApiMocker,
  resetApiMocks
} from '../../tests/utils';

// Mock axios
vi.mock('axios');

// Mock auth token storage
vi.mock('../../lib/api/authTokens', () => ({
  getAuthTokens: vi.fn(),
  setAuthTokens: vi.fn()
}));

// Create fixtures for auth tokens
const createAuthTokens = (overrides = {}) => ({
  accessToken: 'test-token',
  refreshToken: 'refresh-token',
  ...overrides
});

// Create fixtures for request config
const createRequestConfig = (overrides = {}) => ({
  url: '/api/some-endpoint',
  headers: { 'Authorization': 'Bearer expired-token' },
  method: 'get',
  data: {},
  ...overrides
});

describe('Token Refresh Mechanism', () => {
  let apiMocker;
  let responseErrorInterceptor;
  
  beforeEach(() => {
    vi.clearAllMocks();
    apiMocker = new ApiMocker();
    
    // Mock interceptors for all tests
    (axios.interceptors.response.use as any) = vi.fn((_, errorCallback) => {
      responseErrorInterceptor = errorCallback;
    });
    
    (axios.interceptors.request.use as any) = vi.fn();
  });

  afterEach(() => {
    resetApiMocks();
  });

  describe('Request Interceptor', () => {
    it('should attach authorization header to requests', async () => {
      // Setup token fixture
      const tokens = createAuthTokens();
      getAuthTokens.mockReturnValue(tokens);
      
      // Replace the generic mock with one that checks the headers
      (axios.interceptors.request.use as any) = vi.fn((callback) => {
        const mockRequest = { headers: {} };
        callback(mockRequest);
        expect(mockRequest.headers['Authorization']).toBe(`Bearer ${tokens.accessToken}`);
      });

      // Initialize
      setupTokenRefresh();
      
      // Verify interceptor registration
      expect(axios.interceptors.request.use).toHaveBeenCalled();
    });
  });

  describe('Response Interceptor', () => {
    it('should refresh token when API returns 401', async () => {
      // Setup fixtures
      const expiredTokens = createAuthTokens({ accessToken: 'expired-token' });
      const newTokens = createAuthTokens({ 
        accessToken: 'new-token', 
        refreshToken: 'new-refresh-token' 
      });
      const requestConfig = createRequestConfig();
      
      // Setup mocks
      getAuthTokens.mockReturnValue(expiredTokens);
      vi.mocked(axios.post).mockResolvedValueOnce(createMockResponse(newTokens));
      vi.mocked(axios).mockResolvedValueOnce(createMockResponse({ data: 'success' }));
      
      // Initialize
      setupTokenRefresh();
      
      // Create mock error with 401 status
      const mockError = {
        response: { status: 401 },
        config: requestConfig
      };

      // Execute
      const result = await responseErrorInterceptor(mockError);

      // Verify token refresh
      expect(axios.post).toHaveBeenCalledWith('/api/auth/refresh', { 
        refreshToken: expiredTokens.refreshToken 
      });
      expect(setAuthTokens).toHaveBeenCalledWith(newTokens);

      // Verify request retry with new token
      expect(axios).toHaveBeenCalledWith({
        ...requestConfig,
        headers: { 'Authorization': `Bearer ${newTokens.accessToken}` }
      });

      // Verify result
      expect(result).toEqual(createMockResponse({ data: 'success' }));
    });

    it('should propagate error if refresh token fails', async () => {
      // Setup fixtures
      const expiredTokens = createAuthTokens({ 
        accessToken: 'expired-token', 
        refreshToken: 'invalid-refresh' 
      });
      const requestConfig = createRequestConfig();
      
      // Setup mocks
      getAuthTokens.mockReturnValue(expiredTokens);
      const refreshError = createMockError(
        'Invalid refresh token', 
        400, 
        'INVALID_REFRESH_TOKEN'
      );
      vi.mocked(axios.post).mockRejectedValueOnce(refreshError);
      
      // Initialize
      setupTokenRefresh();
      
      // Create mock error with 401 status
      const mockError = {
        response: { status: 401 },
        config: requestConfig
      };

      // Execute and verify error propagation
      await expect(responseErrorInterceptor(mockError)).rejects.toEqual(refreshError);
      
      // Verify refresh attempt
      expect(axios.post).toHaveBeenCalledWith('/api/auth/refresh', { 
        refreshToken: expiredTokens.refreshToken 
      });
      
      // Original request should not be retried
      expect(axios).not.toHaveBeenCalled();
    });

    it('should not attempt refresh for non-401 errors', async () => {
      // Setup
      getAuthTokens.mockReturnValue(createAuthTokens());
      
      // Initialize
      setupTokenRefresh();
      
      // Create mock error with non-401 status
      const mockError = {
        response: { status: 500 },
        config: createRequestConfig()
      };

      // Execute and verify error propagation
      await expect(responseErrorInterceptor(mockError)).rejects.toEqual(mockError);
      
      // Verify no refresh attempt
      expect(axios.post).not.toHaveBeenCalled();
    });
  });
});
```

## Benefits of the Refactoring

1. **Using Fixtures**: The createAuthTokens and createRequestConfig fixtures reduce duplication and improve readability.

2. **Using Mock Utilities**: The createMockResponse and createMockError utilities provide consistent error and response structures.

3. **Structured Tests**: Better organization with nested describe blocks improves readability.

4. **Cleaner Setup**: Consistent beforeEach and afterEach hooks handle cleanup properly.

5. **Better Error Handling**: Tests now use the standard error shapes from our mockApi utilities.

6. **Improved Maintainability**: The code is more maintainable with less duplication and clear patterns.

7. **Edge Cases**: We've added an additional test for non-401 errors to improve coverage.

## Next Steps for API Test Refactoring

After refactoring the token refresh test:

1. Apply the same pattern to other API-related tests
2. Focus on tests with complex mocking requirements next
3. Update tests that use WebSocket mocking
4. Document any special patterns or approaches in the README

This approach ensures that all API tests follow a consistent mocking pattern, making them easier to maintain and understand. 