# Zustand Store Implementation

This directory contains the Zustand store implementation for global state management in the application.

## Core Components

- `createStore.ts`: Factory function to create configurable Zustand stores with middleware and persistence
- `middleware.ts`: Custom middleware for Zustand store enhancemnt

## Features

### 1. Flexible Store Creation

The `createStore` function provides a flexible API for creating Zustand stores with:
- Custom initial state
- Configurable middleware
- Optional persistence

### 2. Middleware Support

Middleware can be configured and will be applied in the order specified:
```ts
createStore({
  initialState: { count: 0 },
  middleware: [
    logger,
    devtools,
    // other middleware
  ]
});
```

### 3. Persistence

Stores can be configured with persistence to save state across sessions:
```ts
createStore({
  initialState: { count: 0 },
  persist: {
    name: 'my-store',
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({ count: state.count }),
  }
});
```

## Development Status

The store implementation follows a test-driven development approach. Current status:

- [x] Store Creation: Basic store factory is implemented
- [x] Middleware Application: Middleware can be applied to stores
- [x] Validation Middleware: Data validation middleware is implemented
- [x] Logger Middleware: Debug logging middleware is implemented
- [ ] Persistence: Store persistence implementation needs completion
- [ ] DevTools Integration: Redux DevTools integration needs implementation

### Known Issues

1. TypeScript type definitions with middleware can lead to type errors due to the complex composition pattern.
2. Some tests are failing and need to be updated to properly mock the middleware behavior.

## Best Practices

1. **Create specialized stores** for different domains of your application
2. **Use middleware sparingly** to avoid performance overhead
3. **Be selective with persistence** and only persist what's necessary
4. **Create custom hooks** for accessing store state in components
5. **Follow the test-driven approach** when extending store functionality 