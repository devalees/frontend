import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { persist } from 'zustand/middleware';
import { createTodoSlice, createUserSlice, createNotificationSlice } from './slices';
import type { RootState } from './slices';
import type { HistoryState } from './middleware/history';
import type { DebugState } from './middleware/debugger';

// Combined state type with all middleware enhancements
export type StoreState = RootState & Partial<HistoryState<RootState>> & Partial<DebugState>;

/**
 * Create the root store by combining all slices
 * This uses a simplified approach to avoid complex type issues
 */
export const useStore = create<StoreState>()(
  devtools(
    persist(
      (...a) => ({
        // Include all slice state and actions
        ...createTodoSlice(...a),
        ...createUserSlice(...a),
        ...createNotificationSlice(...a),
        
        // Add basic history functionality
        past: [],
        future: [],
        undo: () => {},
        redo: () => {},
        canUndo: false,
        canRedo: false,
        
        // Add minimal debug state
        __debug: {
          enabled: process.env.NODE_ENV === 'development',
          levels: [],
          actionHistory: [],
          stateHistory: [],
          toggleDebug: () => {},
          setDebugLevels: () => {},
          clearHistory: () => {},
          getActionHistory: () => [],
          getStateHistory: () => []
        }
      }),
      {
        name: 'app-storage',
        partialize: (state) => ({
          user: state.user
        })
      }
    ),
    { name: 'AppStore' }
  )
); 