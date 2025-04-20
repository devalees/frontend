import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { persist } from 'zustand/middleware';
import { createTodoSlice } from './slices/todoSlice';
import { createUserSlice } from './slices/userSlice';
import { createNotificationSlice } from './slices/notificationSlice';
import { createAuthSlice } from './slices/authSlice';

/**
 * Create the root store by combining all slices
 */
export const useStore = create()(
  devtools(
    persist(
      (...a) => ({
        // Include all slice state and actions
        ...createTodoSlice(...a),
        ...createUserSlice(...a),
        ...createNotificationSlice(...a),
        ...createAuthSlice(...a),
      }),
      {
        name: 'app-storage',
        partialize: (state: any) => ({
          user: state.user,
          tokens: state.tokens
        })
      }
    ),
    { name: 'AppStore' }
  )
); 