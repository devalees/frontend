# Testing Utilities

This directory contains utilities for simplifying and standardizing testing across the codebase.

## Quick Start

```typescript
// Import all testing utilities
import { render, renderHook, createUserFixture, mockApiMethod } from '../tests/utils';

// Render a component with all necessary providers
const { getByText } = render(<MyComponent />);

// Use fixtures to create test data
const user = createUserFixture({ name: 'Custom Name' });

// Mock API responses
mockApiMethod('get', { data: user }, 200);
```

## Available Utilities

### Custom Render

The `render` and `renderHook` functions provide wrappers around React Testing Library to ensure components and hooks are tested with the necessary context providers.

```typescript
import { render, renderHook, screen } from '../tests/utils';

// Render a component
render(<MyComponent />);
expect(screen.getByText('Hello')).toBeInTheDocument();

// Render with a custom wrapper
render(<MyComponent />, {
  wrapper: ({ children }) => <CustomProvider>{children}</CustomProvider>
});

// Render a hook
const { result } = renderHook(() => useMyHook());
expect(result.current).toEqual({ value: 'test' });
```

### Test Fixtures

Fixtures help you create consistent test data across your tests.

```typescript
import { createUserFixture, createTodoFixture, createTodosFixture } from '../tests/utils';

// Create a user with default values
const user = createUserFixture();

// Create a user with custom values
const customUser = createUserFixture({ 
  name: 'Custom Name', 
  email: 'custom@example.com' 
});

// Create an admin
const admin = createAdminFixture();

// Create a todo
const todo = createTodoFixture({ title: 'Test Todo' });

// Create multiple todos
const todos = createTodosFixture(3);

// Create a paginated response
const response = createPaginatedResponse(todos, 2, 10, 50);
```

### API Mocking

The API mocking utilities help you mock API responses in a consistent way.

```typescript
import { mockApiMethod, mockApiError, ApiMocker } from '../tests/utils';

// Mock a successful API call
mockApiMethod('get', { data: 'response' });

// Mock a failed API call
mockApiError('get', 'Not found', 404, 'RESOURCE_NOT_FOUND');

// Advanced API mocking for multiple endpoints
const apiMocker = new ApiMocker();
apiMocker
  .mockSuccess('get', '/api/users/1', { id: 1, name: 'User 1' })
  .mockError('get', '/api/users/2', 'Not found', 404);

// Reset mocks when done
apiMocker.reset();
```

## Best Practices

1. **Use fixtures instead of raw data**: This ensures consistency and reduces duplication.
2. **Always use the custom render functions**: They ensure your components have access to all necessary providers.
3. **Mock APIs at the appropriate level**: Use the simple mockApiMethod for global mocks, and ApiMocker for more complex scenarios.
4. **Reset mocks after each test**: Use afterEach to reset mocks or wrap in act() when needed.
5. **Import from the index file**: Import from `../tests/utils` rather than individual files to simplify imports.

## Adding New Utilities

When adding new test utilities:

1. Place the utility in the appropriate file or create a new one if needed.
2. Export it from the file and from the index.ts file.
3. Add tests for the utility.
4. Update this README with examples.

## Common Testing Patterns

### Testing Components

```typescript
import { render, screen, createUserFixture } from '../tests/utils';

describe('UserProfile', () => {
  it('should display user information', () => {
    const user = createUserFixture();
    render(<UserProfile user={user} />);
    
    expect(screen.getByText(user.name)).toBeInTheDocument();
    expect(screen.getByText(user.email)).toBeInTheDocument();
  });
});
```

### Testing API Interactions

```typescript
import { render, screen, mockApiMethod, createTodoFixture } from '../tests/utils';

describe('TodoList', () => {
  it('should fetch and display todos', async () => {
    const todos = createTodosFixture(3);
    mockApiMethod('get', { data: todos });
    
    render(<TodoList />);
    
    // Wait for todos to load
    await screen.findByText(todos[0].title);
    
    // Verify all todos are displayed
    todos.forEach(todo => {
      expect(screen.getByText(todo.title)).toBeInTheDocument();
    });
  });
}); 