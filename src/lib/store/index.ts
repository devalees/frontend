import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { StateCreator } from 'zustand';
import { createStore } from './createStore';
import { RootState, createTodoSlice, createUserSlice } from './slices';
import { HistoryState, withHistory } from './middleware/history';

// Custom hook state type
interface CustomHookState {
  customHookData: any | null;
  customHookError: Error | null;
}

// Combined state type with history and custom hook state
export type StoreState = RootState & HistoryState<RootState> & CustomHookState;

interface Store {
  getState: () => any;
  setState: (updater: any) => void;
}

// Create the store with middleware
const baseStore = create<Store>()(
  devtools(
    persist(
      (set, get) => ({
        getState: get,
        setState: set,
      }),
      {
        name: 'app-storage',
      }
    )
  )
);

// Create the root store with all slices and middleware
const store = createStore<StoreState>({
  initialState: {
    todos: [],
    user: null,
    todoFilter: 'all',
    todosLoading: false,
    userLoading: false,
    notificationHandler: undefined,
    past: [],
    future: [],
    customHookData: null,
    customHookError: null,
    // Initialize with empty functions that will be replaced by slice implementations
    addTodo: () => {},
    toggleTodo: () => {},
    removeTodo: () => {},
    toggleTodos: () => {},
    removeTodos: () => {},
    setTodoFilter: () => {},
    getFilteredTodos: () => [],
    createTodoAsync: async () => ({ id: '', text: '', completed: false }),
    fetchTodos: async () => {},
    getCompletedTodos: () => [],
    getPendingTodos: () => [],
    getTodoById: () => undefined,
    setUser: () => {},
    logout: () => {},
    loginAsync: async () => ({ id: '', name: '' }),
    fetchUser: async () => {},
    setNotificationHandler: () => {},
    clearNotificationHandler: () => {},
    getUserName: () => null,
    getUserId: () => null,
    isLoggedIn: () => false,
    undo: () => {},
    redo: () => {},
  } as StoreState,
  middleware: [
    // Cast the withHistory middleware to the correct type to avoid TypeScript errors
    withHistory as unknown as (fn: StateCreator<StoreState>) => StateCreator<StoreState>,
    (stateCreator) => {
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

// Export the hook
export { store as useStore };

// Re-export types from slices for convenience
export * from './slices'; 