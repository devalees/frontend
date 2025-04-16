import { StateCreator, StoreApi } from 'zustand';

/**
 * Debug store configuration
 */
export interface DebuggerOptions {
  /** Initial enabled state */
  enabled: boolean;
  /** Debug levels to display */
  levels: DebugLevel[];
  /** Custom logger function */
  logger?: (level: DebugLevel, message: string, ...data: any[]) => void;
  /** Maximum history size */
  maxHistorySize?: number;
}

/**
 * Debug levels
 */
export enum DebugLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  STATE = 'state',
  ACTION = 'action',
  PERFORMANCE = 'performance',
}

/**
 * Interface for the debugger state
 */
export interface DebugState {
  __debug: {
    enabled: boolean;
    levels: DebugLevel[];
    actionHistory: Array<{ action: string; timestamp: number; payload: any }>;
    stateHistory: Array<{ timestamp: number; state: any }>;
    toggleDebug: (enabled?: boolean) => void;
    setDebugLevels: (levels: DebugLevel[]) => void;
    clearHistory: () => void;
    getActionHistory: () => Array<{ action: string; timestamp: number; payload: any }>;
    getStateHistory: () => Array<{ timestamp: number; state: any }>;
  };
}

/**
 * Default debugger options
 */
const defaultOptions: DebuggerOptions = {
  enabled: process.env.NODE_ENV !== 'production',
  levels: [
    DebugLevel.ERROR,
    DebugLevel.STATE,
    DebugLevel.ACTION,
  ],
  maxHistorySize: 50,
};

/**
 * Default logger implementation
 */
const defaultLogger = (level: DebugLevel, message: string, ...data: any[]) => {
  const styles = {
    [DebugLevel.INFO]: 'color: #2196F3; font-weight: bold;',
    [DebugLevel.WARN]: 'color: #FF9800; font-weight: bold;',
    [DebugLevel.ERROR]: 'color: #F44336; font-weight: bold;',
    [DebugLevel.STATE]: 'color: #4CAF50; font-weight: bold;',
    [DebugLevel.ACTION]: 'color: #9C27B0; font-weight: bold;',
    [DebugLevel.PERFORMANCE]: 'color: #FF5722; font-weight: bold;',
  };

  console.groupCollapsed(
    `%c[${level.toUpperCase()}] ${message}`,
    styles[level] || 'color: #607D8B; font-weight: bold;'
  );
  if (data.length > 0) {
    console.log(...data);
  }
  console.groupEnd();
};

/**
 * Type definition for the set state function
 */
type SetState<T> = {
  (partial: T | Partial<T> | ((state: T) => T | Partial<T>), replace?: boolean): void;
};

/**
 * Debugging middleware for Zustand store
 * 
 * Provides runtime-togglable debugging features:
 * - State change tracking
 * - Action logging
 * - Performance monitoring
 * - Debug history
 * 
 * @param options Debugger configuration options
 * @returns Middleware function that adds debugging capabilities
 */
export const withDebugger = <T extends object>(options: Partial<DebuggerOptions> = {}) => {
  // Merge options with defaults
  const mergedOptions: DebuggerOptions = {
    ...defaultOptions,
    ...options,
    levels: [...(options.levels || defaultOptions.levels)],
  };

  const logger = mergedOptions.logger || defaultLogger;
  const maxHistorySize = mergedOptions.maxHistorySize || defaultOptions.maxHistorySize;

  // Track performance
  const performance = typeof window !== 'undefined' ? window.performance : null;

  return (config: StateCreator<T>): StateCreator<T & DebugState> => {
    return (set, get, api) => {
      // Initialize internal debug state
      const initialDebugState: DebugState['__debug'] = {
        enabled: mergedOptions.enabled,
        levels: [...mergedOptions.levels],
        actionHistory: [],
        stateHistory: [],
        toggleDebug: (enabled?: boolean) => {
          const newEnabled = enabled !== undefined ? enabled : !get().__debug.enabled;
          set({ 
            __debug: { 
              ...get().__debug, 
              enabled: newEnabled 
            } 
          } as Partial<T & DebugState>);
          
          logger(
            DebugLevel.INFO,
            `Debug mode ${newEnabled ? 'enabled' : 'disabled'}`,
            { timestamp: Date.now() }
          );
        },
        setDebugLevels: (levels: DebugLevel[]) => {
          set({ 
            __debug: { 
              ...get().__debug, 
              levels: [...levels] 
            } 
          } as Partial<T & DebugState>);
          
          logger(
            DebugLevel.INFO,
            'Debug levels updated',
            { levels, timestamp: Date.now() }
          );
        },
        clearHistory: () => {
          set({
            __debug: {
              ...get().__debug,
              actionHistory: [],
              stateHistory: []
            }
          } as Partial<T & DebugState>);
          
          logger(
            DebugLevel.INFO,
            'Debug history cleared',
            { timestamp: Date.now() }
          );
        },
        getActionHistory: () => [...get().__debug.actionHistory],
        getStateHistory: () => [...get().__debug.stateHistory],
      };

      // Create a wrapped set function to track state changes
      const wrappedSet: SetState<T & DebugState> = (stateOrFn, replace) => {
        const debugState = get().__debug;
        if (!debugState || !debugState.enabled) {
          // Type assertion needed to handle mixed state types
          return set(stateOrFn as any, replace as any);
        }

        const shouldTrackState = debugState.levels.includes(DebugLevel.STATE);
        const shouldTrackPerformance = debugState.levels.includes(DebugLevel.PERFORMANCE);
        const shouldTrackAction = debugState.levels.includes(DebugLevel.ACTION);

        const previousState = get();
        let startTime: number | undefined;
        
        if (shouldTrackPerformance && performance) {
          startTime = performance.now();
        }

        // Extract action name for logging
        let actionName = 'unknown';
        let actionPayload = undefined;
        
        if (typeof stateOrFn === 'function') {
          // For function updates, use function name if available
          actionName = stateOrFn.name || 'anonymous function';
        } else if (stateOrFn && typeof stateOrFn === 'object') {
          // For direct state updates, list the keys being set
          const keys = Object.keys(stateOrFn);
          // Filter out the __debug key to avoid recursive logging
          const nonDebugKeys = keys.filter(key => key !== '__debug');
          actionName = nonDebugKeys.join(', ');
          actionPayload = { ...stateOrFn };
          
          // Don't log the __debug key itself
          if ('__debug' in actionPayload) {
            delete actionPayload.__debug;
          }
        }

        // Update state
        const result = set(stateOrFn as any, replace as any);
        const nextState = get();
        const now = Date.now();

        // Record timing if performance tracking is enabled
        let duration: number | undefined;
        if (shouldTrackPerformance && performance && startTime !== undefined) {
          duration = performance.now() - startTime;
          
          if (duration > 16.67) { // Warn if update takes longer than one frame (60fps)
            logger(
              DebugLevel.PERFORMANCE,
              `Slow state update: ${actionName}`,
              { duration: `${duration.toFixed(2)}ms`, timestamp: now }
            );
          }
        }

        // Track action history
        if (shouldTrackAction) {
          const actionEntry = { 
            action: actionName, 
            timestamp: now,
            payload: actionPayload
          };
          
          debugState.actionHistory = [
            actionEntry,
            ...debugState.actionHistory
          ].slice(0, maxHistorySize);
          
          logger(
            DebugLevel.ACTION,
            `Action: ${actionName}`,
            { 
              payload: actionPayload,
              timestamp: now,
              duration: duration !== undefined ? `${duration.toFixed(2)}ms` : undefined
            }
          );
        }

        // Track state history
        if (shouldTrackState) {
          const stateDiff: Record<string, {previous: any, current: any}> = {};
          let hasChanges = false;
          
          // Compute state diff using type-safe approach
          Object.keys(nextState).forEach(key => {
            if (key === '__debug') return; // Skip the debug state itself
            
            // Safe check by using string indexing with type assertion
            const prevValue = (previousState as any)[key];
            const nextValue = (nextState as any)[key];
            
            if (prevValue !== nextValue) {
              stateDiff[key] = {
                previous: prevValue,
                current: nextValue
              };
              hasChanges = true;
            }
          });
          
          if (hasChanges) {
            // Add to history
            const historyEntry = {
              timestamp: now,
              state: { ...nextState, __debug: undefined }
            };
            
            debugState.stateHistory = [
              historyEntry,
              ...debugState.stateHistory
            ].slice(0, maxHistorySize);
            
            // Log state change
            logger(
              DebugLevel.STATE,
              `State updated: ${actionName}`,
              { 
                diff: stateDiff,
                timestamp: now,
                duration: duration !== undefined ? `${duration.toFixed(2)}ms` : undefined
              }
            );
          }
        }

        return result;
      };

      // Initialize store with additional debug state
      const state = config(wrappedSet as any, get, api) as T;
      return {
        ...state,
        __debug: initialDebugState,
      };
    };
  };
};

/**
 * Helper hook to get debug tools from store
 * This should be implemented in your store's custom hook
 */
export const createDebugTools = <T extends object & DebugState>(store: StoreApi<T>) => {
  return {
    toggleDebug: (enabled?: boolean) => store.getState().__debug.toggleDebug(enabled),
    setDebugLevels: (levels: DebugLevel[]) => store.getState().__debug.setDebugLevels(levels),
    clearDebugHistory: () => store.getState().__debug.clearHistory(),
    getActionHistory: () => store.getState().__debug.getActionHistory(),
    getStateHistory: () => store.getState().__debug.getStateHistory(),
    isDebugEnabled: () => store.getState().__debug.enabled,
    getDebugLevels: () => store.getState().__debug.levels,
  };
}; 