import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useStore } from '../store';
import type { StoreState } from '../store';
import { create } from 'zustand';

interface LocalState {
  data: any | null;
  loading: boolean;
  error: null | Error;
  updateCount: number;
  computed?: any;
}

interface Action {
  type: 'update' | 'reset';
  data?: any;
}

// Create a local store for the hook's state
const createLocalStore = () => create<LocalState>((set) => ({
  data: null,
  loading: false,
  error: null,
  updateCount: 0,
  computed: null
}));

export const useCustomHook = () => {
  // Get global store state and methods
  const globalState = useStore.getState() as StoreState;
  
  // Internal state reference for tracking updates
  const updateCountRef = useRef(0);
  
  // Create local store instance
  const localStore = useMemo(() => createLocalStore(), []);
  
  // Get store methods
  const localState = localStore.getState();
  const setLocalState = localStore.setState;
  
  // Memoized selector for computed values
  const computed = useMemo(() => {
    if (!localState.data) return null;
    return processData(localState.data);
  }, [localState.data]);

  // Actions
  const actions = {
    update: useCallback((data: any) => {
      setLocalState(state => ({
        ...state,
        data,
        updateCount: state.updateCount + 1
      }));
      
      // Update global state
      const currentState = useStore.getState() as StoreState;
      useStore.setState({
        ...currentState,
        customHookData: data
      });
    }, []),

    reset: useCallback(() => {
      setLocalState(state => ({
        ...state,
        data: null,
        error: null,
        loading: false,
        updateCount: 0
      }));
      
      // Reset global state
      const currentState = useStore.getState() as StoreState;
      useStore.setState({
        ...currentState,
        customHookData: null,
        customHookError: null
      });
    }, []),

    fetchData: useCallback(async () => {
      try {
        setLocalState(state => ({ ...state, loading: true, error: null }));
        
        // Simulated async operation
        const response = await new Promise(resolve => 
          setTimeout(() => resolve({ data: 'fetched data' }), 1000)
        );
        
        setLocalState(state => ({
          ...state,
          loading: false,
          data: response,
          updateCount: state.updateCount + 1
        }));
        
        // Update global state
        const currentState = useStore.getState() as StoreState;
        useStore.setState({
          ...currentState,
          customHookData: response
        });
      } catch (error) {
        setLocalState(state => ({
          ...state,
          loading: false,
          error: error as Error
        }));
        
        // Update global state
        const currentState = useStore.getState() as StoreState;
        useStore.setState({
          ...currentState,
          customHookError: error as Error
        });
      }
    }, []),

    batchUpdate: useCallback((updates: Action[]) => {
      setLocalState(state => {
        const newState = { ...state };
        
        updates.forEach(update => {
          if (update.type === 'update' && update.data) {
            newState.data = update.data;
          } else if (update.type === 'reset') {
            newState.data = null;
            newState.error = null;
          }
        });
        
        newState.updateCount = state.updateCount + 1;
        return newState;
      });
      
      // Update global state
      const currentState = useStore.getState() as StoreState;
      let lastData = null;
      
      updates.forEach(update => {
        if (update.type === 'update' && update.data) {
          lastData = update.data;
        } else if (update.type === 'reset') {
          lastData = null;
        }
      });
      
      useStore.setState({
        ...currentState,
        customHookData: lastData
      });
    }, [])
  };

  // Effect for cleanup
  useEffect(() => {
    return () => {
      // Cleanup logic here
      actions.reset();
    };
  }, [actions]);

  // Return hook interface
  return {
    state: {
      ...localState,
      computed
    },
    actions
  };
};

// Helper function for data processing
function processData(data: any): any {
  // Add your data processing logic here
  return data;
} 