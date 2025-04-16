import { StateCreator } from 'zustand';

export interface HistoryState<T> {
  past: T[];
  future: T[];
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export interface HistoryOptions {
  /** Maximum number of states to keep in history */
  maxHistorySize?: number;
  /** Keys to exclude from history tracking */
  excludeKeys?: string[];
  /** Specific keys to include in history (takes precedence over excludeKeys) */
  includeKeys?: string[];
  /** Whether to enable debug logs */
  debug?: boolean;
  /** Whether to deep clone state (safer but slower) */
  deepClone?: boolean;
  /** Minimum time (ms) between capturing state changes */
  throttleMs?: number;
  /** Callback when history changes */
  onHistoryChange?: (past: any[], future: any[]) => void;
}

const DEFAULT_OPTIONS: HistoryOptions = {
  maxHistorySize: 10,
  excludeKeys: [],
  includeKeys: undefined,
  debug: false,
  deepClone: true,
  throttleMs: 300
};

const DEFAULT_HISTORY_KEYS = ['past', 'future', 'undo', 'redo', 'canUndo', 'canRedo'] as const;

/**
 * Deep clone function to ensure state is properly copied
 * Only used when deepClone option is enabled
 */
const deepCloneState = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepCloneState(item)) as any;
  }
  
  const clonedObj = {} as T;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clonedObj[key] = deepCloneState(obj[key]);
    }
  }
  
  return clonedObj;
};

/**
 * Shallow clone function for better performance
 */
const shallowCloneState = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return [...obj] as any;
  }
  
  return { ...obj };
};

/**
 * Filter out history-related keys from the state
 * If includeKeys is provided, only include those keys
 */
const filterHistoryState = <T extends object>(
  state: T & HistoryState<T>, 
  options: Pick<HistoryOptions, 'excludeKeys' | 'includeKeys'> = {}
): T => {
  const { excludeKeys = [], includeKeys } = options;
  const filteredState = { ...state };
  
  // Default keys to exclude
  const keysToExclude = [...DEFAULT_HISTORY_KEYS, ...(excludeKeys || [])];
  
  // If includeKeys is provided, only include those keys
  if (includeKeys && includeKeys.length > 0) {
    const result: Record<string, any> = {};
    
    for (const key of includeKeys) {
      if (key in filteredState && !keysToExclude.includes(key)) {
        result[key] = (filteredState as any)[key];
      }
    }
    
    return result as T;
  }
  
  // Otherwise, exclude keys that shouldn't be tracked
  const result = Object.fromEntries(
    Object.entries(filteredState).filter(([key]) => !keysToExclude.includes(key))
  );
  
  return result as T;
};

/**
 * Check if the state has meaningfully changed from previous state
 * Avoids adding duplicate states to history
 */
const hasStateChanged = <T extends object>(
  prevState: T,
  currentState: T,
  options: Pick<HistoryOptions, 'includeKeys'> = {}
): boolean => {
  const { includeKeys } = options;
  
  // If includeKeys is provided, only compare those keys
  if (includeKeys && includeKeys.length > 0) {
    return includeKeys.some(key => 
      prevState[key as keyof T] !== currentState[key as keyof T]
    );
  }
  
  // Otherwise, do a shallow comparison of all keys
  const prevKeys = Object.keys(prevState);
  const currentKeys = Object.keys(currentState);
  
  if (prevKeys.length !== currentKeys.length) {
    return true;
  }
  
  return prevKeys.some(key => 
    prevState[key as keyof T] !== currentState[key as keyof T]
  );
};

/**
 * Create history middleware with options
 */
export const createHistoryMiddleware = <T extends object>(options: HistoryOptions = {}) => {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  
  return (config: StateCreator<T>): StateCreator<T & HistoryState<T>> => (set, get, api) => {
    const cloneState = mergedOptions.deepClone ? deepCloneState : shallowCloneState;
    
    // Track the last time we recorded history and last saved state
    let lastRecordTimestamp = 0;
    let lastSavedState: T | null = null;
    
    const wrappedSet = (
      updater: ((state: T & HistoryState<T>) => Partial<T & HistoryState<T>>) | Partial<T & HistoryState<T>>
    ) => {
      const state = get() as T & HistoryState<T>;
      
      // Skip tracking history for history-related actions
      const isHistoryAction = typeof updater === 'function' 
        ? false 
        : Object.keys(updater).some(key => DEFAULT_HISTORY_KEYS.includes(key as any));

      if (isHistoryAction) {
        set(updater);
        return;
      }
      
      // Get the current state without history keys
      const currentState = filterHistoryState(state, {
        excludeKeys: mergedOptions.excludeKeys,
        includeKeys: mergedOptions.includeKeys
      });
      
      // Get the current time for throttling
      const now = Date.now();
      
      // Check if we should record this state change 
      // (throttle updates and ensure state has changed)
      const shouldRecordHistory = 
        !lastSavedState || 
        now - lastRecordTimestamp > mergedOptions.throttleMs! ||
        hasStateChanged(lastSavedState, currentState, { includeKeys: mergedOptions.includeKeys });
        
      if (shouldRecordHistory) {
        // Update timestamp and last saved state
        lastRecordTimestamp = now;
        lastSavedState = cloneState(currentState);
        
        if (mergedOptions.debug) {
          console.log('Recording state in history:', { 
            currentState,
            timestamp: now
          });
        }
      
        // Store the current state in history and clear future
        set((prevState) => {
          const newState = typeof updater === 'function' ? updater(prevState) : updater;
          const newPast = shouldRecordHistory 
            ? [...prevState.past, cloneState(currentState)].slice(-mergedOptions.maxHistorySize!)
            : prevState.past;
            
          const result = {
            ...prevState,
            ...newState,
            past: newPast,
            future: [], // Clear future when new action is performed
            canUndo: newPast.length > 0,
            canRedo: false,
          };
          
          // Call the callback if provided
          if (mergedOptions.onHistoryChange) {
            mergedOptions.onHistoryChange(result.past, result.future);
          }
          
          return result;
        });
      } else {
        // Just update the state without recording history
        set(updater);
      }
    };

    // Wire up the initial slice
    const initialState = config(wrappedSet as any, get, api);

    // Return the enhanced state with history capabilities
    return {
      ...initialState,
      past: [],
      future: [],
      canUndo: false,
      canRedo: false,
      undo: () => {
        const state = get() as T & HistoryState<T>;
        const previous = state.past[state.past.length - 1];

        if (!previous) return;

        const newPast = state.past.slice(0, -1);
        const currentState = filterHistoryState(state, {
          excludeKeys: mergedOptions.excludeKeys,
          includeKeys: mergedOptions.includeKeys
        });

        if (mergedOptions.debug) {
          console.log('UNDO - Previous state:', previous);
          console.log('UNDO - Current state:', currentState);
        }
        
        // Create a new state object with the previous state
        set({
          ...state, // Start with current state to preserve functions
          ...cloneState(previous), // Apply previous state data
          // Update history tracking
          past: newPast,
          future: [cloneState(currentState), ...state.future].slice(0, mergedOptions.maxHistorySize!),
          canUndo: newPast.length > 0,
          canRedo: true
        } as T & HistoryState<T>);
        
        // Call the callback if provided
        if (mergedOptions.onHistoryChange) {
          const updatedState = get() as T & HistoryState<T>;
          mergedOptions.onHistoryChange(updatedState.past, updatedState.future);
        }
      },
      redo: () => {
        const state = get() as T & HistoryState<T>;
        const next = state.future[0];

        if (!next) return;

        const newFuture = state.future.slice(1);
        const currentState = filterHistoryState(state, {
          excludeKeys: mergedOptions.excludeKeys,
          includeKeys: mergedOptions.includeKeys
        });

        if (mergedOptions.debug) {
          console.log('REDO - Next state:', next);
          console.log('REDO - Current state:', currentState);
        }
        
        // Apply the next state from the future
        set({
          ...state, // Start with current state
          ...next,  // Apply next state data
          // Update history tracking
          past: [...state.past, cloneState(currentState)].slice(-mergedOptions.maxHistorySize!),
          future: newFuture,
          canUndo: true,
          canRedo: newFuture.length > 0
        } as T & HistoryState<T>);
        
        // Call the callback if provided
        if (mergedOptions.onHistoryChange) {
          const updatedState = get() as T & HistoryState<T>;
          mergedOptions.onHistoryChange(updatedState.past, updatedState.future);
        }
      },
    };
  };
};

// Export a middleware with default options for backward compatibility
export const withHistory = createHistoryMiddleware(); 