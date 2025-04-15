# Zustand Store Tests

This directory contains tests for the Zustand store implementation.

### Test Files

- [x] `zustandConfig.test.ts`: Tests for store creation, middleware, and basic persistence
- [x] `middleware.test.ts`: Tests for middleware implementation (logger, validation)
- [x] `persistence.test.ts`: Comprehensive tests for advanced persistence features

### Test Coverage

1. **Store Creation**
- Creating store with initial state
- Applying middleware
- Store interface (getters/setters)

2. **Middleware Implementation**
- Logger middleware for debugging
- Validation middleware for data integrity
- Middleware composition and order

3. **Persistence Configuration**
- Enabling persistence for stores
- Configuring persistence options
- Storage options (localStorage, sessionStorage)

4. **Advanced Persistence Features**
- Whitelist/blacklist functionality for selective persistence
- Migration strategies for version updates
- Custom merging strategies for state reconciliation
- Event handlers for persistence lifecycle
- Storage implementations (local, session, custom)

### Running Tests

```bash
# Run all store tests
npm test src/tests/store

# Run specific test file
npm test src/tests/store/middleware.test.ts
npm test src/tests/store/zustandConfig.test.ts
npm test src/tests/store/persistence.test.ts
```

### Implementation Status

- [x] Basic store creation and configuration
- [x] Middleware implementation (logging, validation)
- [x] Basic persistence
- [x] Advanced persistence
- [~] DevTools integration
- [ ] Store slices
- [ ] Actions and selectors
- [ ] State utilities

## Current Implementation Status

- [x] `zustandConfig.test.ts`: Tests for store creation, middleware, and persistence
  - Tests are intentionally failing as part of the Red phase of TDD
  - Implementation will be done in the next phase

## Test Coverage

The tests verify:

1. **Store Creation**
   - Creating a store with the correct initial state
   - Store API functionality (getters, setters, subscribe)

2. **Middleware Configuration**
   - Applying middleware to stores
   - Middleware execution order

3. **Persistence Configuration**
   - Enabling persistence for stores
   - Configuring persistence options

## Next Steps

- Implement the store configuration in `lib/store/createStore.ts`
- Add more specialized store slices and their tests
- Create custom hooks for accessing store state 