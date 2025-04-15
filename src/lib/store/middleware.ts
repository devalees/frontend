import { StateCreator, StoreApi } from 'zustand';
import { persist, createJSONStorage, devtools, PersistOptions, StorageValue } from 'zustand/middleware';

// Type helpers for middleware
type ExtractState<S> = S extends { getState: () => infer T } ? T : never;
type WithDevtools = [["zustand/devtools", never]];
type WithPersist = [["zustand/persist", unknown]];

/**
 * Logger middleware for debugging Zustand store state changes
 * @param fn State creator function
 * @returns Enhanced state creator with logging
 */
export const logger = <T extends object>(
  fn: StateCreator<T>
): StateCreator<T> => (set, get, api) => fn(
  (partialState, replace) => {
    const prevState = get();
    console.log('Previous state:', prevState);
    
    // Handle function or object updates differently
    if (typeof partialState === 'function') {
      // For function updates, use the original set with the same replace value
      if (replace === true) {
        set(partialState as (state: T) => T, true);
      } else {
        set(partialState as (state: T) => T | Partial<T>);
      }
      console.log('Next state:', get());
      console.log('State updater function was used');
    } else {
      // For direct object updates
      if (replace === true) {
        set(partialState as T, true);
      } else {
        set(partialState as Partial<T>);
      }
      console.log('Next state:', get());
      console.log('Changed state:', partialState);
    }
  },
  get,
  api
);

/**
 * Validation middleware to enforce data constraints on state updates
 * @param validators Record of validation functions for state properties
 * @returns Middleware function
 */
export const withValidation = <T extends object>(
  validators: Partial<Record<keyof T, (value: any) => boolean>>
) => 
  (fn: StateCreator<T>): StateCreator<T> => (set, get, api) => fn(
    (partialState, replace) => {
      // For function updates, we can't validate in advance
      if (typeof partialState === 'function') {
        if (replace === true) {
          set(partialState as (state: T) => T, true);
        } else {
          set(partialState as (state: T) => T | Partial<T>);
        }
        return;
      }
      
      // Validate each property with its validator
      let isValid = true;
      
      Object.entries(partialState as object).forEach(([key, value]) => {
        const validator = validators[key as keyof T];
        if (validator && !validator(value)) {
          console.error(`Validation failed for property "${key}" with value:`, value);
          isValid = false;
        }
      });
      
      if (isValid) {
        if (replace === true) {
          set(partialState as T, true);
        } else {
          set(partialState as Partial<T>);
        }
      } else {
        console.error('State update rejected due to validation failure');
        // Don't do anything if validation fails - the state remains unchanged
      }
    },
    get,
    api
  );

/**
 * Devtools middleware for debugging with Redux DevTools
 * @param name Store name for identification in DevTools
 * @returns Middleware function
 */
export const withDevtools = <T extends object>(name: string) => 
  (fn: StateCreator<T, [], []>): StateCreator<T, [], [["zustand/devtools", never]]> => 
    devtools(fn, { name, enabled: process.env.NODE_ENV !== 'production' });

/**
 * Type for migration strategies in persistence middleware
 */
export type MigrationStrategy<T> = {
  version: number;
  migrate: (persistedState: unknown, version: number) => T;
};

/**
 * Type for persistence event handlers
 */
export type PersistenceEventHandlers<T> = {
  onRehydrateStorage?: (state: T | undefined) => ((state?: T, error?: unknown) => void) | void;
  onFinishHydration?: (state: T) => void;
};

/**
 * Advanced persistence options for withPersistence middleware
 */
export type PersistenceOptions<T> = {
  /** Storage type: 'local' (localStorage) or 'session' (sessionStorage) */
  storage?: 'local' | 'session';
  /** Custom storage implementation */
  customStorage?: Storage;
  /** Version number for migrations */
  version?: number;
  /** List of keys to exclude from persistence */
  blacklist?: (keyof T)[];
  /** List of keys to include in persistence (if provided, only these will be stored) */
  whitelist?: (keyof T)[];
  /** Migration strategies for handling version changes */
  migrations?: MigrationStrategy<T>[];
  /** Serialization function (default is JSON.stringify) */
  serialize?: (state: T) => string;
  /** Deserialization function (default is JSON.parse) */
  deserialize?: (str: string) => T;
  /** Event handlers for persistence lifecycle */
  eventHandlers?: PersistenceEventHandlers<T>;
  /** Merge strategy for hydrated state and initial state */
  merge?: (persistedState: unknown, currentState: T) => T;
};

/**
 * Enhanced persistence middleware for storing state in localStorage/sessionStorage
 * with advanced features like migrations, custom serialization, and event handlers
 * 
 * @param name Store name for storage key
 * @param options Advanced persistence options
 * @returns Middleware function
 * 
 * @example
 * ```typescript
 * // Basic usage with localStorage
 * const useStore = create(
 *   withPersistence('my-store')(
 *     (set) => ({
 *       count: 0,
 *       increment: () => set((state) => ({ count: state.count + 1 })),
 *     })
 *   )
 * );
 * 
 * // Advanced usage with migrations and custom options
 * const useStore = create(
 *   withPersistence('my-store', {
 *     version: 2,
 *     storage: 'session',
 *     whitelist: ['user', 'preferences'],
 *     migrations: [
 *       {
 *         version: 1,
 *         migrate: (state, version) => {
 *           // Transform state from version 0 to version 1
 *           return { ...state, newField: 'default' };
 *         }
 *       },
 *       {
 *         version: 2,
 *         migrate: (state, version) => {
 *           // Transform state from version 1 to version 2
 *           return { 
 *             ...state, 
 *             preferences: { 
 *               theme: state.theme || 'light',
 *               language: state.language || 'en'
 *             }
 *           };
 *         }
 *       }
 *     ],
 *     eventHandlers: {
 *       onRehydrateStorage: (state) => {
 *         console.log('hydration starts', state);
 *         return (state, error) => {
 *           if (error) {
 *             console.error('hydration failed', error);
 *           } else {
 *             console.log('hydration finished', state);
 *           }
 *         };
 *       },
 *       onFinishHydration: (state) => {
 *         console.log('State has been fully hydrated', state);
 *       }
 *     }
 *   })(
 *     (set) => ({
 *       user: null,
 *       preferences: { theme: 'light', language: 'en' },
 *       setUser: (user) => set({ user }),
 *       setTheme: (theme) => set((state) => ({ 
 *         preferences: { ...state.preferences, theme }
 *       }))
 *     })
 *   )
 * );
 * ```
 */
export const withPersistence = <T extends object>(
  name: string,
  options: PersistenceOptions<T> = {}
) => {
  return (fn: StateCreator<T, [], []>): StateCreator<T, [], [["zustand/persist", T]]> => {
    // Determine storage to use
    const storageImplementation = options.customStorage 
      ? options.customStorage
      : options.storage === 'session'
        ? sessionStorage
        : localStorage;
    
    // Setup persist configuration
    const persistConfig: PersistOptions<T> = {
      name,
      storage: createJSONStorage(() => storageImplementation),
      version: options.version || 0,
      partialize: (state) => {
        // If whitelist is provided, only include those keys
        if (options.whitelist?.length) {
          return Object.fromEntries(
            Object.entries(state).filter(([key]) => 
              options.whitelist?.includes(key as keyof T)
            )
          ) as T;
        }
        
        // If blacklist is provided, exclude those keys
        if (options.blacklist?.length) {
          return Object.fromEntries(
            Object.entries(state).filter(([key]) => 
              !options.blacklist?.includes(key as keyof T)
            )
          ) as T;
        }
        
        // Otherwise return the full state
        return state;
      }
    };
    
    // Add migration support if migrations are provided
    if (options.migrations && options.migrations.length > 0) {
      persistConfig.migrate = (persistedState, version) => {
        if (!persistedState) return {} as T;
        
        let migratedState = persistedState;
        
        // Apply migrations in order, starting from the version after the current state
        const sortedMigrations = [...options.migrations!].sort((a, b) => a.version - b.version);
        for (const migration of sortedMigrations) {
          if (migration.version > version) {
            migratedState = migration.migrate(migratedState, version);
          }
        }
        
        return migratedState as T;
      };
    }
    
    // Add custom merge function if provided
    if (options.merge) {
      persistConfig.merge = options.merge;
    }
    
    // Add event handlers if provided
    if (options.eventHandlers?.onRehydrateStorage) {
      persistConfig.onRehydrateStorage = options.eventHandlers.onRehydrateStorage;
    }

    // Create persist middleware with proper typing
    return persist(fn, persistConfig);
  };
};

/**
 * Helper function to create a store with validation
 */
export const createStoreWithValidation = <T extends object>(
  createStoreFn: Function, 
  initialState: T, 
  validators: Partial<Record<keyof T, (value: any) => boolean>>
) => {
  return createStoreFn({
    initialState,
    middleware: [withValidation(validators)]
  });
};

/**
 * Helper function to create a persisted store with common configuration
 */
export const createPersistedStore = <T extends object>(
  createStoreFn: Function,
  initialState: T,
  name: string,
  options: PersistenceOptions<T> = {}
) => {
  return createStoreFn({
    initialState,
    middleware: [],
    persist: {
      name,
      version: options.version || 0,
      storage: options.storage === 'session' 
        ? createJSONStorage(() => sessionStorage) 
        : createJSONStorage(() => localStorage),
      partialize: (state: T) => {
        if (options.whitelist?.length) {
          return Object.fromEntries(
            Object.entries(state).filter(([key]) => 
              options.whitelist?.includes(key as keyof T)
            )
          ) as T;
        }
        
        if (options.blacklist?.length) {
          return Object.fromEntries(
            Object.entries(state).filter(([key]) => 
              !options.blacklist?.includes(key as keyof T)
            )
          ) as T;
        }
        
        return state;
      }
    }
  });
}; 