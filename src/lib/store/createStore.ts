import { create, StateCreator, StoreApi } from 'zustand';
import { devtools, DevtoolsOptions } from 'zustand/middleware';
import { persist, PersistOptions, createJSONStorage, StorageValue, PersistStorage } from 'zustand/middleware';

export interface CreateStoreOptions<T extends object> {
  initialState?: Partial<T>;
  middleware?: Array<(fn: StateCreator<T>) => StateCreator<T>>;
  persist?: Omit<PersistOptions<T>, 'storage'> & {
    storage?: PersistStorage<T>;
  };
  devtools?: Partial<DevtoolsOptions>;
}

/**
 * Creates a Zustand store with the given options
 * @param options Store creation options
 * @returns A Zustand store instance
 */
export const createStore = <T extends object>(options: CreateStoreOptions<T> = {}): StoreApi<T> => {
  const { 
    initialState = {}, 
    middleware = [], 
    persist: persistOptions,
    devtools: devtoolsOptions 
  } = options;

  // Create a base state creator function
  let stateCreator: StateCreator<T> = (set, get, api) => ({
    ...initialState as T,
  });

  // Apply custom middleware
  for (const middlewareFn of middleware) {
    stateCreator = middlewareFn(stateCreator);
  }

  // Apply persistence if configured
  if (persistOptions) {
    const persistConfig: PersistOptions<T> = {
      ...persistOptions,
      storage: persistOptions.storage || createJSONStorage(() => localStorage),
    };
    stateCreator = persist(stateCreator, persistConfig) as StateCreator<T>;
  }

  // Apply devtools in development or when explicitly enabled
  if (process.env.NODE_ENV === 'development' || (devtoolsOptions && devtoolsOptions.enabled)) {
    const defaultDevtoolsConfig: DevtoolsOptions = {
      name: 'Store',
      enabled: true,
    };
    
    const mergedDevtoolsConfig = {
      ...defaultDevtoolsConfig,
      ...devtoolsOptions
    };
    
    stateCreator = devtools(stateCreator, mergedDevtoolsConfig) as StateCreator<T>;
  }

  return create(stateCreator);
}; 