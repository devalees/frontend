# Test Refactoring Plan

This document outlines the step-by-step approach for refactoring existing tests to use our new centralized testing utilities. This will improve consistency, reduce duplication, and make tests easier to maintain.

## Refactoring Process

For each section of the codebase (Foundation, Components, API, State), follow these steps:

### 1. Assessment Phase

- [ ] **Identify existing test patterns**
  - Review current test implementation in each section
  - Document common patterns and approaches
  - Identify areas with significant duplication
  - Prioritize tests based on complexity and duplication

- [ ] **Map utility replacement opportunities**
  - Identify where custom render can replace direct RTL usage
  - Identify where fixtures can replace inline test data
  - Identify where mockApi utilities can replace custom axios mocks
  - Document specific files that need refactoring in each section

### 2. Implementation Phase

- [ ] **Update imports**
  - Replace direct imports from testing libraries with imports from our utils
  - Example: `import { render, screen } from '@testing-library/react'` → `import { render, screen } from '../../tests/utils'`

- [ ] **Replace render/renderHook calls**
  - Replace direct RTL render calls with our custom render utility
  - Update any wrapper patterns to use our standardized approach
  - Leave test assertions unchanged when possible

- [ ] **Replace test data with fixtures**
  - Identify inline test data that can be replaced with fixtures
  - Replace with appropriate fixture factory calls
  - Customize fixtures as needed using the override pattern

- [ ] **Replace API mocking**
  - Replace custom axios mocks with our centralized mock utilities
  - Use mockApiMethod for simple cases and ApiMocker for complex scenarios
  - Ensure proper cleanup in afterEach blocks

- [ ] **Run tests after each file refactor**
  - Verify that tests still pass after refactoring
  - Debug and fix any issues before proceeding to the next file

### 3. Verification Phase

- [ ] **Run full test suite**
  - Ensure all tests are passing after refactoring
  - Check for any unexpected side effects between tests

- [ ] **Conduct code review**
  - Review refactored code for consistency with the new pattern
  - Check for any remaining duplication or inconsistencies
  - Verify that all tests maintain their original intent

- [ ] **Document refactoring results**
  - Document any patterns that still need improvement
  - Note any areas where tests could be further simplified

## Refactoring by Section

### Foundation (01-foundation)

Key files to refactor:
- [ ] `tests/projectStructure.test.ts`
- [ ] `tests/dependencies.test.ts`
- [ ] `tests/envConfig.test.ts`
- [ ] `tests/deployment.test.ts`
- [ ] `tests/devTools.test.ts`
- [ ] `tests/buildTools.test.ts`

Priority refactoring targets:
1. File system utility functions (replace with centralized helpers)
2. Mock implementations (replace with standard mocking patterns)

### Components (02-components)

Key files to refactor:
- [ ] `tests/components/Button.test.tsx`
- [ ] `tests/components/Input.test.tsx`
- [ ] `tests/components/Modal.test.tsx`
- [ ] `tests/components/Form.test.tsx`
- [ ] `tests/components/Select.test.tsx`
- [ ] `tests/components/DatePicker.test.tsx`
- [ ] `tests/components/Grid.test.tsx`
- [ ] `tests/components/Spinner.test.tsx`
- [ ] `tests/components/Skeleton.test.tsx`

Priority refactoring targets:
1. Replace direct RTL render with custom render (all component tests)
2. Standardize wrapper patterns for context providers
3. Replace mock data with fixtures

### API (03-api)

Key files to refactor:
- [ ] `tests/api/axiosConfig.test.ts`
- [ ] `tests/api/environmentConfig.test.ts`
- [ ] `tests/api/errorHandling.test.ts`
- [ ] `tests/api/socketClient.test.ts`
- [ ] `tests/api/realtimeUpdates.test.ts`
- [ ] `tests/api/requestBuilders.test.ts`
- [ ] `tests/api/responseHandlers.test.ts`
- [ ] `tests/api/tokenRefresh.test.ts`
- [ ] `tests/api/optimisticUpdates.test.ts`

Priority refactoring targets:
1. Replace axios mocks with mockApi utilities
2. Use fixtures for mock API responses and errors
3. Standardize WebSocket mocking patterns

### State (04-state)

Key files to refactor:
- [ ] `tests/store/zustandConfig.test.ts`
- [ ] `tests/store/middleware.test.ts`
- [ ] `tests/store/stateSlices.test.ts`
- [ ] `tests/store/actions.test.ts`
- [ ] `tests/store/stateHelpers.test.ts`
- [ ] `tests/store/stateHooks.test.ts`
- [ ] `tests/store/debugger.test.ts`
- [ ] `tests/store/stateTypes.test.ts`

Priority refactoring targets:
1. Replace renderHook calls with custom renderHook
2. Use fixtures for state data
3. Standardize store mocking patterns

## Example Refactoring

### Before:

```tsx
// Before refactoring
import { render, screen } from '@testing-library/react';
import { Button } from '../../components/ui/Button';

describe('Button Component', () => {
  it('should render primary variant correctly', () => {
    render(<Button variant="primary">Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toHaveClass('btn-primary');
  });
});
```

### After:

```tsx
// After refactoring
import { render, screen } from '../../tests/utils';
import { Button } from '../../components/ui/Button';

describe('Button Component', () => {
  it('should render primary variant correctly', () => {
    render(<Button variant="primary">Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toHaveClass('btn-primary');
  });
});
```

## Metrics for Success

We'll track the following metrics to gauge the success of the refactoring effort:

1. **Test Run Time**: Measure the total test run time before and after refactoring
2. **Code Duplication**: Measure the reduction in duplicated test code
3. **Test Reliability**: Track the number of flaky tests before and after refactoring
4. **Maintainability**: Gather feedback from developers on test readability

## Timeline

The refactoring effort should be completed in the following order:

1. Components section (highest priority due to the number of components and potential benefits)
2. API section (high priority due to complex mocking that can be simplified)
3. State section (medium priority due to hook testing complexities)
4. Foundation section (lowest priority as these tests are run less frequently)

Each section should be completed and verified before moving on to the next section. 