import { StateCreator } from 'zustand';

export interface UserSlice {
  user: { id: string; name: string } | null;
  setUser: (user: { id: string; name: string } | null) => void;
  getUserName: () => string | null;
  getUserId: () => string | null;
  isLoggedIn: () => boolean;
}

export const createUserSlice: StateCreator<UserSlice> = (set, get) => ({
  user: null,
  
  setUser: (user) => {
    set({ user });
  },

  getUserName: () => {
    return get().user?.name || null;
  },

  getUserId: () => {
    return get().user?.id || null;
  },

  isLoggedIn: () => {
    return get().user !== null;
  },
}); 