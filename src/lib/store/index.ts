import { StateCreator } from 'zustand';
import { createStore } from './createStore';
import { RootState, createTodoSlice, createUserSlice } from './slices';
import { HistoryState, withHistory } from './middleware/history';

// Combined state type with history
export type StoreState = RootState & HistoryState<RootState>;

// Create the root store with all slices and middleware
const useStore = createStore<StoreState>({
  initialState: {
    todos: [],
    user: null,
    todoFilter: 'all',
    todosLoading: false,
    userLoading: false,
    notificationHandler: undefined,
    past: [],
    future: [],
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
    withHistory,
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

export default useStore;

// Re-export types from slices for convenience
export * from './slices'; 