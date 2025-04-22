# Department Component Tests

This directory contains tests for the Department management components in the Entity feature.

## Test Files

- `DepartmentList.test.tsx`: Tests for the DepartmentList component
- `DepartmentForm.test.tsx`: Tests for the DepartmentForm component
- `DepartmentDetail.test.tsx`: Tests for the DepartmentDetail component

## Testing Approach

The tests follow a consistent pattern for each component:

1. **Component Rendering Tests**
   - Test that the component renders correctly in different states (loading, error, empty, with data)
   - Verify that all expected UI elements are present

2. **Data Fetching Tests**
   - Test that the component fetches data on mount
   - Verify that the correct API methods are called with the right parameters

3. **User Interaction Tests**
   - Test that user interactions (clicks, form submissions) trigger the expected actions
   - Verify that form validation works correctly

4. **Integration Tests**
   - Test that the component integrates correctly with the entity store
   - Verify that state updates are reflected in the UI

## Mocking Strategy

The tests use the following mocking strategy:

1. **Store Mocking**
   - The entity store is mocked using Jest's `jest.mock()` function
   - Store methods are mocked to return test data or simulate errors

2. **API Mocking**
   - API calls are mocked through the store
   - No direct API mocking is needed as the store handles API calls

3. **Data Mocking**
   - Test data is defined at the top of each test file
   - Mock data follows the structure defined in the entity types

## Test Coverage

The tests aim for at least 90% test coverage, focusing on:

- Component rendering in all states
- Data fetching and error handling
- User interactions and form validation
- Integration with the entity store

## Running the Tests

To run the tests:

```bash
# Run all tests
npm test

# Run only department tests
npm test -- -t "Department"

# Run a specific test file
npm test -- src/tests/components/features/entity/departments/DepartmentList.test.tsx
```

## Notes

- The tests use the centralized testing utilities from `src/tests/utils/`
- No direct imports from testing libraries are used
- The tests follow the existing project architecture and patterns 