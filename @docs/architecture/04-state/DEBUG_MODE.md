# Debug Mode

Debug mode is a powerful feature that helps developers inspect and understand the application state and actions during development and in production environments when needed.

## Features

- **Toggle in Production**: Debug tools can be enabled even in production environments
- **Action Tracking**: Records a history of all state-changing actions
- **State History**: Maintains a history of state snapshots after each change
- **Performance Metrics**: Measures and reports on slow state updates
- **Custom Log Levels**: Configure which types of debug information to display
- **Debug Panel UI**: Interactive UI for viewing and controlling debug features

## Usage

### Enabling Debug Mode

Debug mode can be enabled in several ways:

1. **Development Environment**: Automatically enabled in development mode
2. **Keyboard Shortcut**: Press `Ctrl+Shift+D` in any environment
3. **URL Parameter**: Add `?debug` to any URL
4. **Programmatically**: Use the `useDebugger` hook:
   ```tsx
   const debug = useDebugger();
   debug.toggleDebug(true);
   ```

### Debug Panel

The debug panel provides a UI for interacting with debug features:

- **Actions Tab**: Shows the history of state-changing actions
- **State Tab**: Shows the history of state snapshots
- **Settings Tab**: Configure debug levels and other options

To use the debug panel, simply include it in your layout:

```tsx
import { DebugPanel } from '../components/debug/DebugPanel';

function MyApp() {
  return (
    <div>
      {/* Your app content */}
      <DebugPanel position="bottom-right" />
    </div>
  );
}
```

### Debug Hook

For programmatic access to debug features, use the `useDebugger` hook:

```tsx
import { useDebugger } from '../lib/hooks/useDebugger';

function DebugControls() {
  const debug = useDebugger();
  
  return (
    <div>
      <button onClick={() => debug.toggleDebug()}>
        {debug.isEnabled ? 'Disable' : 'Enable'} Debug
      </button>
      
      <button onClick={debug.clearHistory}>
        Clear Debug History
      </button>
      
      <div>
        <h3>Action History:</h3>
        <pre>{JSON.stringify(debug.actionHistory, null, 2)}</pre>
      </div>
    </div>
  );
}
```

## Technical Implementation

### Middleware Integration

Debug mode is implemented as a Zustand middleware that wraps the state setter:

```tsx
// In store/index.ts
import { withDebugger } from './middleware/debugger';

const store = createStore<StoreState>({
  // ...
  middleware: [
    // ...
    withDebugger({
      enabled: process.env.NODE_ENV !== 'production',
    }),
    // ...
  ],
});
```

### Debug Levels

Available debug levels:

- `INFO`: General information about debug operations
- `WARN`: Warning messages
- `ERROR`: Error messages
- `STATE`: Track state changes
- `ACTION`: Track actions
- `PERFORMANCE`: Track performance metrics

### Performance Monitoring

The debug middleware automatically measures the time taken for state updates and reports if any update takes longer than a single frame (16.67ms, corresponding to 60fps).

## Best Practices

1. **Security**: Be careful about enabling debug in production for sensitive applications
2. **Performance**: Debug mode adds overhead, so use selectively in production
3. **Privacy**: Debug logs may contain sensitive data, avoid exposing them to users
4. **Development**: Use debug mode to diagnose complex state management issues

## Architecture

The debug mode consists of the following components:

1. **Debugger Middleware**: Core implementation that tracks state and actions
2. **Debug Hook**: React hook for accessing debug features
3. **Debug Panel**: UI component for visualizing debug data
4. **Debug Tools**: Helper functions for programmatic access

## Future Enhancements

- Network request tracking
- Time-travel debugging
- Export/import debug sessions
- Visual state diff viewer
- Integration with browser DevTools 