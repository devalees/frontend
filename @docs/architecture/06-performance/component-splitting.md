# Component Splitting

Component splitting is a technique to optimize application performance by loading components only when needed. This document explains how to use the component splitting utilities in our application.

## Overview

The component splitting implementation provides:

1. **Lazy Loading**: Load components only when they're needed
2. **Error Handling**: Graceful error recovery for component loading failures
3. **Performance Monitoring**: Track loading and rendering performance
4. **Preloading**: Optimize user experience by preloading components before they're needed

## Usage

### Registering Components

Components must be registered in the component registry before they can be used with the component splitting utilities:

```tsx
import { registerComponent } from '@/lib/components/componentLoader';

// Register a component
registerComponent({
  id: 'MyComponent',
  displayName: 'My Component',
  path: '@/components/MyComponent',
  size: 25000, // approx. size in bytes
  dependencies: ['react', '@/lib/utils/helpers']
});
```

### Using Lazy Components

There are two ways to use lazy-loaded components:

#### 1. Using the `getComponent` higher-order function:

```tsx
import { getComponent } from '@/lib/components/componentLoader';

// Create a fallback UI for error states
const ErrorFallback = ({ error, retry }) => (
  <div className="error-container">
    <h3>Failed to load component</h3>
    <p>{error.message}</p>
    <button onClick={retry}>Try Again</button>
  </div>
);

// Get a lazy-loaded component with error handling
const MyLazyComponent = getComponent('MyComponent', ErrorFallback);

// Use it just like a regular component
function App() {
  return (
    <div>
      <h1>My App</h1>
      <MyLazyComponent prop1="value1" prop2="value2" />
    </div>
  );
}
```

#### 2. Using the low-level APIs directly:

```tsx
import React, { Suspense } from 'react';
import { lazyLoadComponent, ComponentErrorBoundary } from '@/lib/components/componentLoader';

// Get the lazy component
const LazyComponent = lazyLoadComponent('MyComponent');

function App() {
  return (
    <ComponentErrorBoundary 
      componentId="MyComponent"
      fallback={({ error, retry }) => (
        <div>
          <p>Error: {error.message}</p>
          <button onClick={retry}>Retry</button>
        </div>
      )}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <LazyComponent prop1="value1" prop2="value2" />
      </Suspense>
    </ComponentErrorBoundary>
  );
}
```

### Preloading Components

Preload components when you think the user is likely to need them soon:

```tsx
import { preloadComponent } from '@/lib/components/componentLoader';

// Preload on hover
function MyLinkComponent() {
  return (
    <a 
      href="/details"
      onMouseEnter={() => preloadComponent('DetailComponent')}
    >
      View Details
    </a>
  );
}

// Preload when nearing viewport
function LazyLoadSection() {
  React.useEffect(() => {
    // Check if section is near viewport
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        preloadComponent('ExpensiveComponent');
      }
    }, { rootMargin: '200px' });
    
    observer.observe(document.getElementById('my-section'));
    return () => observer.disconnect();
  }, []);
  
  return (
    <div id="my-section">
      <h2>Lazy Loaded Section</h2>
      {/* Other content */}
    </div>
  );
}
```

## Performance Monitoring

The component loader automatically creates performance marks and measures that can be used to analyze component loading times:

- `component-load-time`: Total time to load a component
- `component-dependencies-load-time`: Time spent loading dependencies
- `component-render-time`: Time spent rendering a component
- `component-error-time`: Time spent handling errors
- `component-retry-time`: Time spent retrying failed loads
- `component-preload-time`: Time spent preloading components

You can use the Performance API to get these measurements:

```js
// Get all component loading measures
const measures = performance.getEntriesByType('measure')
  .filter(measure => measure.name.includes('component-'));

// Log average component load time
const loadTimes = measures
  .filter(measure => measure.name === 'component-load-time')
  .map(measure => measure.duration);

const avgLoadTime = loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length;
console.log(`Average component load time: ${avgLoadTime}ms`);
```

## Error Handling

Component loading errors are captured by the `ComponentErrorBoundary` and can be handled using a custom fallback UI:

```tsx
<ComponentErrorBoundary
  componentId="MyComponent"
  fallback={({ error, retry }) => (
    <div className="error-container">
      <h3>Failed to load component</h3>
      <p>{error.message}</p>
      <p>Component ID: {error.componentId}</p>
      <button onClick={retry}>Try Again</button>
    </div>
  )}
>
  {/* Component content */}
</ComponentErrorBoundary>
```

## Best Practices

1. **Register components early**: Register components at application startup to ensure they're available when needed
2. **Use meaningful IDs**: Use consistent, descriptive IDs for components
3. **Implement retry logic**: Always provide retry functionality in error fallbacks
4. **Preload strategically**: Preload components based on user behavior patterns
5. **Monitor performance**: Regularly analyze component loading times to identify optimization opportunities 