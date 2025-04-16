# TestErrorBoundary

A reusable error boundary component for testing and development environments that catches JavaScript errors in its child component tree, logs those errors, and displays a fallback UI instead of the component tree that crashed.

## Features

- Catches errors in child components
- Provides a retry mechanism to attempt recovery
- Supports both component and function fallbacks
- Optional error tracking with componentId
- Custom error handling callback

## Installation

The component is included in the project's utilities. Import it directly:

```tsx
import TestErrorBoundary from '../lib/utils/TestErrorBoundary';
```

## Usage

### Basic usage with component fallback

```tsx
import TestErrorBoundary from '../lib/utils/TestErrorBoundary';
import ErrorComponent from './ErrorComponent';

function MyApp() {
  return (
    <TestErrorBoundary fallback={ErrorComponent}>
      <ComponentThatMightError />
    </TestErrorBoundary>
  );
}
```

### Using a render function for fallback

```tsx
import TestErrorBoundary from '../lib/utils/TestErrorBoundary';

function MyApp() {
  return (
    <TestErrorBoundary
      renderFallback={(error, retry) => (
        <div>
          <h3>Something went wrong:</h3>
          <p>{error.message}</p>
          <button onClick={retry}>Try Again</button>
        </div>
      )}
    >
      <ComponentThatMightError />
    </TestErrorBoundary>
  );
}
```

### With component identification and custom error handling

```tsx
import TestErrorBoundary from '../lib/utils/TestErrorBoundary';
import ErrorComponent from './ErrorComponent';
import { logError } from '../utils/errorReporting';

function MyApp() {
  return (
    <TestErrorBoundary
      fallback={ErrorComponent}
      componentId="user-profile-widget"
      onError={(error, errorInfo) => {
        // Custom error logging or reporting
        logError(error, errorInfo);
      }}
    >
      <UserProfileWidget />
    </TestErrorBoundary>
  );
}
```

## API Reference

### Props

#### With Component Fallback

| Prop        | Type                          | Description                                   |
|-------------|------------------------------ |-----------------------------------------------|
| fallback    | React.ComponentType<FallbackProps> | Component to render when an error occurs     |
| children    | React.ReactNode               | Children components to be rendered normally   |
| componentId | string (optional)             | Identifier to associate with caught errors    |
| onError     | function (optional)           | Callback function when an error is caught     |

#### With Function Fallback

| Prop          | Type                          | Description                                   |
|---------------|------------------------------ |-----------------------------------------------|
| renderFallback| (error, retry) => ReactNode   | Function to render UI when an error occurs    |
| children      | React.ReactNode               | Children components to be rendered normally   |
| componentId   | string (optional)             | Identifier to associate with caught errors    |
| onError       | function (optional)           | Callback function when an error is caught     |

### FallbackProps

Props passed to the fallback component:

| Prop    | Type                 | Description                                     |
|---------|----------------------|-------------------------------------------------|
| error   | ComponentError       | The error object that was caught                |
| retry   | () => void           | Function to call to attempt to recover from error |

### ComponentError

Extended Error type with optional component identification:

| Property    | Type    | Description                       |
|-------------|---------|-----------------------------------|
| componentId | string  | ID of the component that errored  |
| [+ standard Error properties] |  |                         | 