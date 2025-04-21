# RBAC Page Tests

This directory contains tests for the RBAC (Role-Based Access Control) pages in the application.

## Testing Approach

The RBAC page tests follow a comprehensive testing approach that includes:

1. **Unit Tests**: Testing individual components and hooks in isolation
2. **Integration Tests**: Testing the interaction between components, hooks, and the RBAC store
3. **Page Tests**: Testing the complete page rendering and navigation

## Test Structure

Each RBAC page has its own test file:

- `roles.test.tsx`: Tests for the roles management page
- `permissions.test.tsx`: Tests for the permissions management page
- `user-roles.test.tsx`: Tests for the user roles management page

## Testing Utilities

The tests use the following testing utilities:

- `componentTestUtils.ts`: Utilities for testing React components
- `integrationTestUtils.ts`: Utilities for integration testing
- `mockApi.ts`: Utilities for mocking API responses

## Mocking Strategy

The tests use a comprehensive mocking strategy:

1. **Component Mocks**: Mocking RBAC components to isolate page tests
2. **Hook Mocks**: Mocking the RBAC hook to provide test data
3. **API Mocks**: Mocking API responses for RBAC endpoints

## Test Coverage

The tests aim for a minimum of 90% test coverage, focusing on:

- Page rendering
- Navigation
- Component integration
- Hook integration
- Error handling
- Loading states

## Running Tests

To run the RBAC page tests:

```bash
# Run all RBAC page tests
npm test src/tests/app/rbac

# Run a specific RBAC page test
npm test src/tests/app/rbac/roles.test.tsx
```

## Adding New Tests

When adding new tests for RBAC pages:

1. Follow the existing test structure
2. Use the provided testing utilities
3. Mock components, hooks, and API responses as needed
4. Aim for comprehensive test coverage
5. Document any new testing patterns or utilities 