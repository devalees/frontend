import { StateCreator } from 'zustand';

export interface HistoryState<T> {
  past: T[];
  future: T[];
  undo: () => void;
  redo: () => void;
}

const MAX_HISTORY_SIZE = 10;

const historyKeys = ['past', 'future', 'undo', 'redo'] as const;

// Deep clone function to ensure state is properly copied
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

const filterHistoryState = <T extends object>(state: T & HistoryState<T>): T => {
  const filtered = { ...state };
  const result = Object.fromEntries(
    Object.entries(filtered).filter(([key]) => !historyKeys.includes(key as typeof historyKeys[number]))
  );
  return result as T;
};

export const withHistory = <T extends object>(
  config: StateCreator<T>
): StateCreator<T & HistoryState<T>> => (set, get, api) => {
  const wrappedSet = (
    updater: ((state: T & HistoryState<T>) => Partial<T & HistoryState<T>>) | Partial<T & HistoryState<T>>
  ) => {
    const currentState = filterHistoryState(get() as T & HistoryState<T>);
    const state = get() as T & HistoryState<T>;
    
    console.log('Recording state in history:', { 
      currentState,
      updater: typeof updater === 'function' ? 'function' : updater
    });
    
    // Skip tracking history for certain actions
    const isHistoryAction = typeof updater === 'function' 
      ? false 
      : Object.keys(updater).some(key => historyKeys.includes(key as typeof historyKeys[number]));

    if (isHistoryAction) {
      set(updater);
      return;
    }
    
    // Always clear the future stack when a new action is performed
    // Store the deep-cloned current state in history
    set((prevState) => ({
      ...(typeof updater === 'function' ? updater(prevState) : updater),
      past: [...state.past, deepCloneState(currentState)].slice(-MAX_HISTORY_SIZE),
      future: [], // Always clear future when a new action is performed
    }));
  };

  // Wire up the initial slice
  const initialState = config(wrappedSet as any, get, api);

  // Return the enhanced state with history capabilities
  return {
    ...initialState,
    past: [],
    future: [],
    undo: () => {
      const state = get() as T & HistoryState<T>;
      const previous = state.past[state.past.length - 1];

      if (!previous) return;

      const newPast = state.past.slice(0, -1);
      const currentState = filterHistoryState(state);

      console.log('UNDO - Debug Info');
      console.log('Current todos:', (state as any).todos);
      console.log('Previous state todos:', (previous as any).todos);
      console.log('Past states count:', state.past.length);
      
      // Create an entirely new state object
      const newState = {
        ...state, // Start with current state to preserve functions
        ...deepCloneState(previous), // Apply previous state data
        // Reset history tracking properties
        past: newPast,
        future: [deepCloneState(currentState), ...state.future].slice(0, MAX_HISTORY_SIZE),
        undo: state.undo,
        redo: state.redo
      } as T & HistoryState<T>;
      
      console.log('New state todos after undo:', (newState as any).todos);
      
      set(newState);
      
      // Log the state after set to verify
      setTimeout(() => {
        const afterState = get() as T & HistoryState<T>;
        console.log('State todos AFTER set:', (afterState as any).todos);
      }, 0);
    },
    redo: () => {
      const state = get() as T & HistoryState<T>;
      const next = state.future[0];

      if (!next) return;

      const newFuture = state.future.slice(1);
      const currentState = filterHistoryState(state);

      console.log('REDO - Debug Info');
      console.log('Current todos:', (state as any).todos);
      console.log('Next state todos:', (next as any).todos);
      
      // Using directly set instead of applying to ensure complete replacement
      set({
        // First apply all of the current state for any properties not in the history
        ...state, 
        // Then overwrite with the next state
        ...next,
        // Then explicitly set the history tracking properties
        past: [...state.past, deepCloneState(currentState)].slice(-MAX_HISTORY_SIZE),
        future: newFuture,
        undo: state.undo,
        redo: state.redo
      } as T & HistoryState<T>);
    },
  };
}; 