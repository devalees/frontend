import { create, StateCreator, StoreApi } from 'zustand';
import { persist, StateStorage, PersistOptions, createJSONStorage } from 'zustand/middleware';

type CreateStoreOptions<T> = {
  initialState: T;
  middleware?: Array<(fn: StateCreator<T>) => StateCreator<T>>;
  persist?: Omit<PersistOptions<T>, 'storage'> & { 
    storage?: StateStorage; 
    name: string;
  };
};

/**
 * Creates a Zustand store with the provided configuration options
 * @param options Store configuration options
 * @returns Configured Zustand store
 */
export const createStore = <T extends object>(options: CreateStoreOptions<T>): StoreApi<T> => {
  const { initialState, middleware = [], persist: persistOptions } = options;

  // Create a base state creator function
  let stateCreator: StateCreator<T> = (set, get) => ({ ...initialState });

  // Apply middleware in order (if provided)
  if (middleware.length > 0) {
    // Apply middleware in the order provided (for zustandConfig test)
    for (let i = 0; i < middleware.length; i++) {
      if (typeof middleware[i] === 'function') {
        stateCreator = middleware[i](stateCreator);
      }
    }
  }

  // Apply persist middleware if persistence options are provided
  if (persistOptions) {
    // Set default storage if not provided
    const storage = persistOptions.storage || createJSONStorage(() => localStorage);
    
    // Configure persistence with options
    const { storage: _, ...otherOptions } = persistOptions;
    const persistConfig: PersistOptions<T> = {
      ...otherOptions,
      storage: storage as any // Type assertion to handle storage compatibility
    };
    
    // Apply persist middleware
    stateCreator = persist(stateCreator, persistConfig) as unknown as StateCreator<T>;
  }

  // Create and return the store
  return create<T>(stateCreator);
}; 