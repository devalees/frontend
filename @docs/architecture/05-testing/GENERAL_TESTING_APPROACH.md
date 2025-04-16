# General Testing Approach

This document outlines our standardized testing approach that should be applied across all sections of the project.

## Core Testing Principles

1. **Test-Driven Development**: Follow Red-Green-Refactor cycle
2. **Consistent Utilities**: Use centralized testing utilities rather than direct testing library imports
3. **Fixtures Over Hard-coded Data**: Create reusable test fixtures for test data
4. **Organized Test Structure**: Use nested describe blocks and clear test naming
5. **Complete Coverage**: Test success paths, error paths, and edge cases
6. **Isolated Tests**: Ensure tests are independent and don't affect each other

## Centralized Testing Utilities

Use these centralized utilities for all tests instead of importing directly from testing libraries:

### Component Testing

```typescript
import { 
  render,             // For rendering components
  screen,             // For querying rendered DOM
  fireEvent,          // For simulating user events
  waitFor,            // For waiting for async operations
  act,                // For testing effects and state updates
  within             // For scoped queries
} from '../../tests/utils';
```

### Hook Testing

```typescript
import { 
  renderHook,         // For testing hooks
  act,                // For triggering hook updates
  waitFor             // For waiting for hook async operations
} from '../../tests/utils';
```

### API Testing

```typescript
import { 
  mockApiMethod,      // For mocking API endpoints
  createMockResponse, // For creating API responses
  createMockError,    // For creating API errors
  resetApiMocks       // For cleaning up between tests
} from '../../tests/utils';
```

### Context Providers for Testing

```typescript
import {
  RouterContext,      // For router context
  ThemeContext,       // For theme context
  AuthContext,        // For authentication context
  StoreContext        // For global state
} from '../../tests/contexts';
```

### Mock Utilities

```typescript
import {
  mockConsole,        // For mocking console.log etc.
  mockStorage,        // For mocking localStorage
  mockIntersection,   // For mocking Intersection Observer
  mockResize,         // For mocking resize events
  mockPerformance     // For mocking performance APIs
} from '../../tests/mocks';
```

## Creating Test Fixtures

Test fixtures create consistent test data and improve test readability:

```typescript
// Create a factory function with default values
const createUser = (overrides = {}) => ({
  id: 'user-123',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
  createdAt: '2023-01-01T00:00:00.000Z',
  ...overrides  // Allow overriding any property
});

// Create specific instances for tests
const adminUser = createUser({ id: 'admin-456', role: 'admin' });
const guestUser = createUser({ id: 'guest-789', role: 'guest' });
```

## Test Structure

Organize tests with nested describe blocks for better readability:

```typescript
describe('Component/Feature Name', () => {
  // Common setup for all tests
  beforeEach(() => {
    // Setup code
  });

  afterEach(() => {
    // Cleanup code
  });

  describe('Specific functionality', () => {
    it('should do something specific', () => {
      // Test code
    });

    it('should handle edge case', () => {
      // Edge case test
    });
  });

  describe('Another functionality', () => {
    // More nested tests
  });
});
```

## Parameterized Testing

Use parameterized tests for similar test cases:

```typescript
it.each([
  { input: 'value1', expected: 'result1' },
  { input: 'value2', expected: 'result2' },
  { input: 'value3', expected: 'result3' }
])('should convert $input to $expected', ({ input, expected }) => {
  expect(someFunction(input)).toBe(expected);
});
```

## Testing Different Types of Code

### Component Testing Example

```typescript
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../tests/utils';
import { Button } from '../../components/ui/Button';

describe('Button', () => {
  it('should render with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Hook Testing Example

```typescript
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '../../tests/utils';
import { useCounter } from '../../hooks/useCounter';

describe('useCounter', () => {
  it('should initialize with default value', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it('should initialize with provided value', () => {
    const { result } = renderHook(() => useCounter(10));
    expect(result.current.count).toBe(10);
  });

  it('should increment the count', () => {
    const { result } = renderHook(() => useCounter());
    act(() => {
      result.current.increment();
    });
    expect(result.current.count).toBe(1);
  });
});
```

### API Testing Example

```typescript
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { mockApiMethod, createMockResponse, createMockError, resetApiMocks } from '../../tests/utils';
import { fetchUserData } from '../../api/user';

describe('User API', () => {
  beforeEach(() => {
    resetApiMocks();
  });

  it('should fetch user data successfully', async () => {
    // Setup fixture
    const userData = { id: 'user123', name: 'Test User' };
    
    // Mock API
    mockApiMethod('get', '/api/users/user123').mockResolvedValue(
      createMockResponse(userData)
    );

    // Test API call
    const result = await fetchUserData('user123');
    expect(result).toEqual(userData);
  });

  it('should handle errors when fetching user data', async () => {
    // Mock API error
    mockApiMethod('get', '/api/users/invalid').mockRejectedValue(
      createMockError('User not found', 404)
    );

    // Test error handling
    await expect(fetchUserData('invalid')).rejects.toThrow('User not found');
  });
});
```

## Checklist for Test Quality

Ensure your tests meet these criteria:

- [ ] Uses centralized testing utilities instead of direct library imports
- [ ] Uses fixtures for test data when appropriate
- [ ] Tests are organized with descriptive names and nested describe blocks
- [ ] Covers success paths, error cases, and edge cases
- [ ] Properly cleans up resources between tests
- [ ] Tests are isolated and don't depend on each other
- [ ] Avoids testing implementation details when possible
- [ ] Uses realistic data that resembles production scenarios
- [ ] Contains assertions that verify the correct behavior

## Implementation in Different Project Areas

- **API Testing**: See [API_TEST_REFACTORING.md](./API_TEST_REFACTORING.md) for examples of API test implementation
- **State Management**: See [STATE_TEST_REFACTORING.md](./STATE_TEST_REFACTORING.md) for examples of state test implementation
- **Performance**: See [../06-performance/TESTING_APPROACH.md](../06-performance/TESTING_APPROACH.md) for performance testing examples
- **Component Testing**: See [COMPONENT_TESTING.md](./COMPONENT_TESTING.md) for component testing strategies

## Continuous Improvement

Our testing approach is continuously evolving:

1. Review test coverage regularly
2. Refine and extend centralized testing utilities
3. Share testing patterns and solutions in code reviews
4. Update testing documentation with new patterns
5. Automate testing in CI/CD pipelines 