import { StateCreator } from 'zustand';
import { createStore } from './createStore';
import { RootState, createTodoSlice, createUserSlice } from './slices';

// Create the root store with all slices
const useStore = createStore<RootState>({
  initialState: {
    todos: [],
    user: null,
    // Initialize with empty functions that will be replaced by slice implementations
    addTodo: () => {},
    toggleTodo: () => {},
    removeTodo: () => {},
    setUser: () => {},
  } as RootState,
  middleware: [
    (stateCreator: StateCreator<RootState>) => {
      // Combine both slices
      return (...args) => {
        const todoState = createTodoSlice(...args);
        const userState = createUserSlice(...args);
        const state = stateCreator(...args);

        return {
          ...state,
          ...todoState,
          ...userState,
        };
      };
    },
  ],
});

export default useStore;

// Re-export types from slices for convenience
export * from './slices'; 