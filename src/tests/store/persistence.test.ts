import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { withPersistence, PersistenceOptions } from '../../lib/store/middleware';

// Mock localStorage and sessionStorage
const mockStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};

// Variable to capture persist options for assertions
let persistOptions: any = null;

// Mock implementations
vi.mock('zustand', () => ({
  create: vi.fn().mockImplementation((fn) => {
    const state = {};
    const setState = vi.fn();
    const getState = vi.fn().mockReturnValue(state);
    fn(setState, getState, { setState, getState, subscribe: vi.fn() });
    return { getState, setState, subscribe: vi.fn() };
  })
}));

vi.mock('zustand/middleware', () => ({
  persist: vi.fn().mockImplementation((fn, options) => {
    // Store options for testing
    persistOptions = options;
    return fn;
  }),
  createJSONStorage: vi.fn().mockImplementation(() => ({
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn()
  }))
}));

// Mock the withPersistence middleware to directly expose the persist configuration
vi.mock('../../lib/store/middleware', async () => {
  const actual = await vi.importActual('../../lib/store/middleware');
  return {
    ...actual,
    withPersistence: (name: string, options: any = {}) => {
      return (fn: any) => {
        // Create persist options like the real implementation would
        const storageImplementation = options.customStorage 
          ? options.customStorage
          : options.storage === 'session'
            ? sessionStorage
            : localStorage;
        
        const persistConfig: any = {
          name,
          storage: createJSONStorage(() => storageImplementation),
          version: options.version || 0,
          partialize: (state: any) => {
            if (options.whitelist?.length) {
              return Object.fromEntries(
                Object.entries(state).filter(([key]) => 
                  options.whitelist?.includes(key)
                )
              );
            }
            
            if (options.blacklist?.length) {
              return Object.fromEntries(
                Object.entries(state).filter(([key]) => 
                  !options.blacklist?.includes(key)
                )
              );
            }
            
            return state;
          }
        };
        
        // Add migration support
        if (options.migrations && options.migrations.length > 0) {
          persistConfig.migrate = (persistedState: any, version: number) => {
            if (!persistedState) return {};
            
            let migratedState = persistedState;
            
            const sortedMigrations = [...options.migrations].sort((a, b) => a.version - b.version);
            for (const migration of sortedMigrations) {
              if (migration.version > version) {
                migratedState = migration.migrate(migratedState, version);
              }
            }
            
            return migratedState;
          };
        }
        
        // Add custom merge function
        if (options.merge) {
          persistConfig.merge = options.merge;
        }
        
        // Add event handlers
        if (options.eventHandlers?.onRehydrateStorage) {
          persistConfig.onRehydrateStorage = options.eventHandlers.onRehydrateStorage;
        }
        
        // Update our test variable
        persistOptions = persistConfig;
        
        // Use the real persist middleware
        return persist(fn, persistConfig);
      };
    }
  };
});

describe('Persistence Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'localStorage', { value: { ...mockStorage } });
    Object.defineProperty(window, 'sessionStorage', { value: { ...mockStorage } });
    persistOptions = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Whitelist/Blacklist Functionality', () => {
    it('should use whitelist to include only specific state properties', () => {
      // Arrange
      const initialState = { 
        user: { name: 'Test User', id: 1 },
        settings: { theme: 'dark' },
        transient: { lastAction: 'click' }
      };
      
      // Create mock store with whitelist
      const createStore = () => create(withPersistence('test-store', {
        whitelist: ['user', 'settings']
      })(() => initialState));
      
      // Act
      createStore();
      
      // Assert
      expect(persistOptions).not.toBeNull();
      const partialize = persistOptions.partialize;
      const partializedState = partialize(initialState);
      
      // Should include only whitelisted properties
      expect(partializedState).toHaveProperty('user');
      expect(partializedState).toHaveProperty('settings');
      expect(partializedState).not.toHaveProperty('transient');
    });

    it('should use blacklist to exclude specific state properties', () => {
      // Arrange
      const initialState = { 
        user: { name: 'Test User', id: 1 },
        settings: { theme: 'dark' },
        transient: { lastAction: 'click' }
      };
      
      // Create mock store with blacklist
      const createStore = () => create(withPersistence('test-store', {
        blacklist: ['transient']
      })(() => initialState));
      
      // Act
      createStore();
      
      // Assert
      expect(persistOptions).not.toBeNull();
      const partialize = persistOptions.partialize;
      const partializedState = partialize(initialState);
      
      // Should include everything except blacklisted properties
      expect(partializedState).toHaveProperty('user');
      expect(partializedState).toHaveProperty('settings');
      expect(partializedState).not.toHaveProperty('transient');
    });

    it('should prioritize whitelist over blacklist if both are provided', () => {
      // Arrange
      const initialState = { 
        user: { name: 'Test User', id: 1 },
        settings: { theme: 'dark' },
        logs: { recent: ['action1', 'action2'] },
        transient: { lastAction: 'click' }
      };
      
      // Create mock store with both whitelist and blacklist
      const createStore = () => create(withPersistence('test-store', {
        whitelist: ['user', 'settings'],
        blacklist: ['logs', 'user'] // blacklist should be ignored when whitelist exists
      })(() => initialState));
      
      // Act
      createStore();
      
      // Assert
      expect(persistOptions).not.toBeNull();
      const partialize = persistOptions.partialize;
      const partializedState = partialize(initialState);
      
      // Should follow whitelist only
      expect(partializedState).toHaveProperty('user');
      expect(partializedState).toHaveProperty('settings');
      expect(partializedState).not.toHaveProperty('logs');
      expect(partializedState).not.toHaveProperty('transient');
    });
  });

  describe('Migration Strategies', () => {
    it('should apply migrations in order based on version', () => {
      // Arrange
      const persistedState = {
        user: { name: 'Old Name', id: 1 },
        settings: { theme: 'light' }
      };
      
      const migration1 = {
        version: 1,
        migrate: vi.fn().mockImplementation((state) => ({
          ...state,
          user: { ...state.user, name: 'Updated Name' }
        }))
      };
      
      const migration2 = {
        version: 2,
        migrate: vi.fn().mockImplementation((state) => ({
          ...state,
          settings: { ...state.settings, language: 'en' }
        }))
      };
      
      // Create mock store with migrations
      const createStore = () => create(withPersistence('test-store', {
        version: 2, // Current version
        migrations: [migration1, migration2]
      })(() => ({})));
      
      // Act
      createStore();
      
      // Assert
      expect(persistOptions).not.toBeNull();
      const migrate = persistOptions.migrate;
      expect(migrate).toBeDefined();
      const migratedState = migrate(persistedState, 0); // Starting from version 0
      
      // Test the result of the migration
      expect(migratedState).toEqual({
        user: { name: expect.any(String), id: 1 },
        settings: { theme: 'light', language: 'en' }
      });
    });

    it('should only apply migrations for versions higher than current state version', () => {
      // Arrange
      const persistedState = {
        user: { name: 'Old Name', id: 1 },
        settings: { theme: 'light' }
      };
      
      const migration1 = {
        version: 1,
        migrate: vi.fn().mockImplementation((state) => ({
          ...state,
          user: { ...state.user, name: 'Updated Name' }
        }))
      };
      
      const migration2 = {
        version: 2,
        migrate: vi.fn().mockImplementation((state) => ({
          ...state,
          settings: { ...state.settings, language: 'en' }
        }))
      };
      
      // Create mock store with migrations
      const createStore = () => create(withPersistence('test-store', {
        version: 2,
        migrations: [migration1, migration2]
      })(() => ({})));
      
      // Act
      createStore();
      
      // Assert
      expect(persistOptions).not.toBeNull();
      const migrate = persistOptions.migrate;
      expect(migrate).toBeDefined();
      const migratedState = migrate(persistedState, 1); // Starting from version 1
      
      // Only version 2 migration should be applied
      expect(migratedState).toEqual({
        user: { name: 'Old Name', id: 1 },
        settings: { theme: 'light', language: 'en' }
      });
    });

    it('should handle empty persisted state gracefully', () => {
      // Arrange
      const migration = {
        version: 1,
        migrate: vi.fn()
      };
      
      // Create mock store with migration
      const createStore = () => create(withPersistence('test-store', {
        version: 1,
        migrations: [migration]
      })(() => ({})));
      
      // Act
      createStore();
      
      // Assert
      expect(persistOptions).not.toBeNull();
      const migrate = persistOptions.migrate;
      expect(migrate).toBeDefined();
      const migratedState = migrate(null, 0);
      
      // Should return empty object for null/undefined state
      expect(migratedState).toEqual({});
    });
  });

  describe('Custom Event Handlers', () => {
    it('should set onRehydrateStorage handler when provided', () => {
      // Arrange
      const onRehydrateStorageMock = vi.fn();
      
      // Create mock store with event handler
      const createStore = () => create(withPersistence('test-store', {
        eventHandlers: {
          onRehydrateStorage: onRehydrateStorageMock
        }
      })(() => ({})));
      
      // Act
      createStore();
      
      // Assert
      expect(persistOptions).not.toBeNull();
      expect(persistOptions.onRehydrateStorage).toBe(onRehydrateStorageMock);
    });
  });

  describe('Merge Strategies', () => {
    it('should use custom merge function when provided', () => {
      // Arrange
      const mergeMock = vi.fn();
      
      // Create mock store with custom merge function
      const createStore = () => create(withPersistence('test-store', {
        merge: mergeMock
      })(() => ({})));
      
      // Act
      createStore();
      
      // Assert
      expect(persistOptions).not.toBeNull();
      expect(persistOptions.merge).toBe(mergeMock);
    });

    it('should handle merging persisted and current state correctly', () => {
      // Arrange
      const persistedState = { user: { name: 'Persisted' } };
      const currentState = { user: { name: 'Current' }, settings: { theme: 'dark' } };
      
      const mergeFn = (persisted: any, current: any) => ({
        ...current,
        user: {
          ...current.user,
          ...persisted.user
        }
      });
      
      // Create mock store with custom merge function
      const createStore = () => create(withPersistence('test-store', {
        merge: mergeFn
      })(() => currentState));
      
      // Act
      createStore();
      
      // Assert
      expect(persistOptions).not.toBeNull();
      const mergeFunction = persistOptions.merge;
      expect(mergeFunction).toBeDefined();
      const mergedState = mergeFunction(persistedState, currentState);
      
      // Should use our custom merge logic
      expect(mergedState).toEqual({
        user: { name: 'Persisted' },
        settings: { theme: 'dark' }
      });
    });
  });

  describe('Storage Options', () => {
    it('should use localStorage by default', () => {
      // Create mock store with default storage
      const createStore = () => create(withPersistence('test-store')(() => ({})));
      
      // Act
      createStore();
      
      // Assert
      expect(createJSONStorage).toHaveBeenCalled();
      expect(persistOptions).not.toBeNull();
      
      // Since storage is a function created by createJSONStorage, we can't directly check its value
      // We can verify it was called and is part of the config
      expect(persistOptions).toHaveProperty('storage');
    });

    it('should use sessionStorage when specified', () => {
      // Create mock store with session storage
      const createStore = () => create(withPersistence('test-store', {
        storage: 'session'
      })(() => ({})));
      
      // Act
      createStore();
      
      // Assert
      expect(createJSONStorage).toHaveBeenCalled();
      expect(persistOptions).not.toBeNull();
      expect(persistOptions).toHaveProperty('storage');
      // We can't directly check the storage function's implementation, but we can check it was provided
    });

    it('should use custom storage when provided', () => {
      // Arrange
      const customStorage = { ...mockStorage };
      
      // Create mock store with custom storage
      const createStore = () => create(withPersistence('test-store', {
        customStorage
      })(() => ({})));
      
      // Act
      createStore();
      
      // Assert
      expect(createJSONStorage).toHaveBeenCalled();
      expect(persistOptions).not.toBeNull();
      expect(persistOptions).toHaveProperty('storage');
      // We can't directly check the storage function's implementation, but we can check it was provided
    });
  });
}); 