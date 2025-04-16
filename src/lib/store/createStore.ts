import { create, StateCreator, StoreApi } from 'zustand';
import { devtools, DevtoolsOptions } from 'zustand/middleware';
import { persist, PersistOptions, createJSONStorage, StorageValue, PersistStorage } from 'zustand/middleware';

export interface CreateStoreOptions<T> {
  initialState?: Partial<T>;
  middleware?: Array<(fn: StateCreator<T>) => StateCreator<T>>;
  persist?: Omit<PersistOptions<T>, 'storage'> & {
    storage?: PersistStorage<T>;
  };
}

type StoreMutators = [
  ['zustand/devtools', never],
  ['zustand/persist', unknown]
];

/**
 * Creates a Zustand store with the given options
 * @param options Store creation options
 * @returns A Zustand store instance
 */
export const createStore = <T extends object>(options: CreateStoreOptions<T> = {}): StoreApi<T> => {
  const { initialState = {}, middleware = [], persist: persistOptions } = options;

  // Create a base state creator function
  let stateCreator: StateCreator<T, [], StoreMutators> = (set, get, api) => ({
    ...initialState as T,
  });

  // Apply custom middleware
  for (const middlewareFn of middleware) {
    stateCreator = middlewareFn(stateCreator as any) as typeof stateCreator;
  }

  // Apply persistence if configured
  if (persistOptions) {
    const persistConfig: PersistOptions<T> = {
      ...persistOptions,
      storage: persistOptions.storage || createJSONStorage(() => localStorage),
    };
    stateCreator = persist(stateCreator, persistConfig) as typeof stateCreator;
  }

  // Apply devtools in development
  if (process.env.NODE_ENV === 'development') {
    const devtoolsConfig: DevtoolsOptions = {
      name: 'Store',
      enabled: true,
    };
    stateCreator = devtools(stateCreator, devtoolsConfig) as typeof stateCreator;
  }

  return create(stateCreator);
}; 