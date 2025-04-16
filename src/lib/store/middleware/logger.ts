import { StateCreator, StoreApi } from 'zustand';

/**
 * Options for the logger middleware
 */
export interface LoggerOptions {
  /** Enable/disable logging */
  enabled: boolean;
  /** Filter out specific actions */
  ignoredActions?: string[];
  /** Custom logger function */
  logger?: (message: string, ...data: any[]) => void;
}

const defaultOptions: LoggerOptions = {
  enabled: process.env.NODE_ENV !== 'production',
  ignoredActions: [],
  logger: console.log,
};

/**
 * Middleware that logs actions and state changes
 * @param options Logger options
 * @returns Zustand middleware
 */
export const withLogger = <T extends object>(options: Partial<LoggerOptions> = {}) => {
  const mergedOptions: LoggerOptions = { ...defaultOptions, ...options };

  return (config: StateCreator<T>) => {
    return (set: any, get: () => T, api: StoreApi<T>) => {
      // Only wrap set in development mode or if explicitly enabled
      if (!mergedOptions.enabled) {
        return config(set, get, api);
      }

      // Create a wrapped set function that logs actions
      const wrappedSet = (stateOrFn: any, replace?: boolean) => {
        const previousState = get();
        
        // Extract action properties (key names or 'count') that are being set
        let actionProps: string[] = [];
        if (typeof stateOrFn === 'function') {
          // For function updates, we need to make a best guess at what's changing
          const dummyState = { ...previousState };
          const result = stateOrFn(dummyState);
          actionProps = Object.keys(result);
        } else if (stateOrFn && typeof stateOrFn === 'object') {
          actionProps = Object.keys(stateOrFn);
        }
        
        const actionName = actionProps.join(', ');
        
        // Skip logging for ignored actions
        if (mergedOptions.ignoredActions?.some(ignored => actionProps.includes(ignored))) {
          return set(stateOrFn, replace);
        }
        
        // Get timestamp
        const timestamp = new Date().toISOString();
        
        // Call the original set
        const result = set(stateOrFn, replace);
        
        // Get the new state
        const nextState = get();
        
        // Log the action and state change
        mergedOptions.logger?.(
          `%c Action: %c${actionName} %c@ ${timestamp}`,
          'color: gray; font-weight: lighter;',
          'color: black; font-weight: bold;',
          'color: gray; font-weight: lighter;',
          {
            previousState,
            nextState,
            // Create a simple diff
            diff: Object.keys(nextState).reduce((acc, key) => {
              const k = key as keyof typeof nextState;
              if (nextState[k] !== previousState[k]) {
                acc[key] = {
                  from: previousState[k],
                  to: nextState[k],
                };
              }
              return acc;
            }, {} as Record<string, { from: any; to: any }>),
          }
        );
        
        return result;
      };
      
      return config(wrappedSet, get, api);
    };
  };
};

/**
 * Type definitions to match Zustand's internal types
 */
type StoreMutatorIdentifier = string;
type SetState<T> = {
  (partial: T | Partial<T> | ((state: T) => T | Partial<T>), replace?: boolean): void;
};
type GetState<T> = () => T; 