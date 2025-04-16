import { StateCreator } from 'zustand';
import { User, Credentials } from '../types';
import { 
  AsyncState, 
  Selector, 
  ActionCreator,
  createInitialAsyncState, 
  setLoading,
  setSuccess,
  setError 
} from '../utils/stateTypes';

const API_BASE_URL = 'http://localhost:3000/api';

export interface UserSlice {
  // State
  userState: AsyncState<User>;
  notificationHandler?: (message: string) => void;
  
  // Derived state for backward compatibility
  user: User | null;

  // Basic Actions
  setUser: (user: User | null) => void;
  logout: () => void;

  // Async Actions
  loginAsync: (credentials: Credentials) => Promise<User>;
  fetchUser: () => Promise<void>;

  // Effects
  setNotificationHandler: (handler: (message: string) => void) => void;
  clearNotificationHandler: () => void;

  // Selectors
  getUserName: () => string | null;
  getUserId: () => string | null;
  isLoggedIn: () => boolean;
}

export const createUserSlice: StateCreator<UserSlice> = (set, get) => {
  // Define type-safe action creators
  const updateUser: ActionCreator<UserSlice, [User | null]> = (state, user) => ({
    ...state,
    userState: user ? setSuccess(state.userState, user) : { ...state.userState, data: null },
    user: user
  });

  // Define type-safe selectors
  const getUserNameSelector: Selector<UserSlice, string | null> = (state) => {
    return state.userState.data?.name ?? null;
  };

  const getUserIdSelector: Selector<UserSlice, string | null> = (state) => {
    return state.userState.data?.id ?? null;
  };

  const isLoggedInSelector: Selector<UserSlice, boolean> = (state) => {
    return state.userState.data !== null;
  };

  return {
    // Initial State
    userState: createInitialAsyncState<User>(),
    notificationHandler: undefined,
    user: null,

    // Basic Actions
    setUser: (user) => {
      set(updateUser(get(), user));
      // Notify on user change if handler exists
      get().notificationHandler?.(`User ${user ? 'logged in' : 'logged out'}`);
    },

    logout: () => {
      set(updateUser(get(), null));
      get().notificationHandler?.('User logged out');
    },

    // Async Actions
    loginAsync: async (credentials) => {
      set(state => ({ userState: setLoading(state.userState) }));
      try {
        const response = await fetch(`${API_BASE_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        });
        const user = await response.json();
        set(updateUser(get(), user));
        get().notificationHandler?.('Login successful');
        return user;
      } catch (error) {
        console.error('Failed to login:', error);
        set(state => ({ 
          userState: setError(state.userState, error instanceof Error ? error : new Error('Failed to login')) 
        }));
        get().notificationHandler?.('Login failed');
        throw error;
      }
    },

    fetchUser: async () => {
      set(state => ({ userState: setLoading(state.userState) }));
      try {
        const response = await fetch(`${API_BASE_URL}/user`);
        const user = await response.json();
        set(updateUser(get(), user));
      } catch (error) {
        console.error('Failed to fetch user:', error);
        set(state => ({ 
          userState: setError(state.userState, error instanceof Error ? error : new Error('Failed to fetch user')) 
        }));
        get().notificationHandler?.('Failed to fetch user');
        throw error;
      }
    },

    // Effects
    setNotificationHandler: (handler) => {
      set({ notificationHandler: handler });
    },

    clearNotificationHandler: () => {
      set({ notificationHandler: undefined });
    },

    // Selectors
    getUserName: () => {
      return getUserNameSelector(get());
    },

    getUserId: () => {
      return getUserIdSelector(get());
    },

    isLoggedIn: () => {
      return isLoggedInSelector(get());
    },
  };
}; 