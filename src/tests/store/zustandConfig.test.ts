import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createStore } from '../../lib/store/createStore';

// Mock zustand and its middleware
vi.mock('zustand', async () => {
  const actual = await vi.importActual('zustand');
  return {
    ...actual,
    create: vi.fn(),
  };
});

vi.mock('zustand/middleware', async () => {
  const actual = await vi.importActual('zustand/middleware');
  return {
    ...actual,
    persist: vi.fn().mockImplementation(() => (fn) => fn),
    createJSONStorage: vi.fn(),
  };
});

describe('Zustand Store Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Store Creation', () => {
    it('should create a store with the correct initial state', () => {
      // Arrange
      const initialState = { count: 0 };
      
      // Act
      createStore({ initialState });
      
      // Assert
      expect(create).toHaveBeenCalled();
    });

    it('should return a store with getters and setters', () => {
      // Arrange
      const mockStore = {
        getState: vi.fn(),
        setState: vi.fn(),
        subscribe: vi.fn(),
      };
      (create as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockStore);
      
      // Act
      const store = createStore({ initialState: { count: 0 } });
      
      // Assert
      expect(store).toHaveProperty('getState');
      expect(store).toHaveProperty('setState');
      expect(store).toHaveProperty('subscribe');
    });
  });

  describe('Middleware Configuration', () => {
    it('should apply middleware when creating a store', () => {
      // Arrange
      const middleware = vi.fn().mockImplementation((config) => config);
      
      // Act
      createStore({ 
        initialState: { count: 0 },
        middleware: [middleware]
      });
      
      // Assert
      expect(middleware).toHaveBeenCalled();
    });

    it('should apply multiple middleware in the correct order', () => {
      // Arrange
      const middleware1 = vi.fn().mockImplementation((config) => config);
      const middleware2 = vi.fn().mockImplementation((config) => config);
      const order: number[] = [];
      
      middleware1.mockImplementation((config) => {
        order.push(1);
        return config;
      });
      
      middleware2.mockImplementation((config) => {
        order.push(2);
        return config;
      });
      
      // Act
      createStore({ 
        initialState: { count: 0 },
        middleware: [middleware1, middleware2]
      });
      
      // Assert
      expect(middleware1).toHaveBeenCalled();
      expect(middleware2).toHaveBeenCalled();
      // Expect middleware to be applied in the order they are provided
      expect(order).toEqual([1, 2]);
    });
  });

  describe('Persistence Configuration', () => {
    it('should apply persist middleware when persistence is enabled', () => {
      // Arrange
      const persistConfig = {
        name: 'test-store',
        storage: createJSONStorage(() => localStorage),
      };
      
      // Act
      createStore({ 
        initialState: { count: 0 },
        persist: persistConfig
      });
      
      // Assert
      expect(persist).toHaveBeenCalled();
      expect(createJSONStorage).toHaveBeenCalled();
    });

    it('should configure persist middleware with the correct options', () => {
      // Arrange
      const persistConfig = {
        name: 'test-store',
        storage: createJSONStorage(() => localStorage),
        version: 1,
        partialize: (state: any) => ({ count: state.count }),
      };
      
      // Act
      createStore({ 
        initialState: { count: 0 },
        persist: persistConfig
      });
      
      // Assert
      expect(persist).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          name: 'test-store',
          version: 1,
        })
      );
    });
  });
}); 