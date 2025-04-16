import { StateCreator } from 'zustand';
import { User, Credentials } from '../types';

const API_BASE_URL = 'http://localhost:3000/api';

export interface UserSlice {
  // State
  user: User | null;
  userLoading: boolean;
  notificationHandler?: (message: string) => void;

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

export const createUserSlice: StateCreator<UserSlice> = (set, get) => ({
  // Initial State
  user: null,
  userLoading: false,
  notificationHandler: undefined,

  // Basic Actions
  setUser: (user) => {
    set({ user });
    // Notify on user change if handler exists
    get().notificationHandler?.(`User ${user ? 'logged in' : 'logged out'}`);
  },

  logout: () => {
    set({ user: null });
    get().notificationHandler?.('User logged out');
  },

  // Async Actions
  loginAsync: async (credentials) => {
    set({ userLoading: true });
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const user = await response.json();
      set({ user, userLoading: false });
      get().notificationHandler?.('Login successful');
      return user;
    } catch (error) {
      console.error('Failed to login:', error);
      set({ userLoading: false });
      get().notificationHandler?.('Login failed');
      throw error;
    }
  },

  fetchUser: async () => {
    set({ userLoading: true });
    try {
      const response = await fetch(`${API_BASE_URL}/user`);
      const user = await response.json();
      set({ user, userLoading: false });
    } catch (error) {
      console.error('Failed to fetch user:', error);
      set({ userLoading: false, user: null });
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
    return get().user?.name ?? null;
  },

  getUserId: () => {
    return get().user?.id ?? null;
  },

  isLoggedIn: () => {
    return get().user !== null;
  },
}); 