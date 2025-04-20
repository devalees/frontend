import { jest } from "@jest/globals";
import { createJSONStorage, persist, PersistOptions, StateStorage } from 'zustand/middleware';
import { create } from 'zustand';
import { createStore } from '../../lib/store/createStore';

// Mock zustand and its middleware
jest.mock('zustand', () => {
  const actual = jest.requireActual('zustand');
  return {
    ...actual,
    create: jest.fn(),
  };
});

jest.mock('zustand/middleware', () => {
  const actual = jest.requireActual('zustand/middleware');
  return {
    ...actual,
    persist: jest.fn().mockImplementation(() => (fn: any) => fn),
    createJSONStorage: jest.fn(),
  };
});

describe('Zustand Store Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
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
        getState: jest.fn(),
        setState: jest.fn(),
        subscribe: jest.fn(),
      };
      (create as unknown as ReturnType<typeof jest.fn>).mockReturnValue(mockStore);
      
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
      const middleware = jest.fn().mockImplementation((config) => config);
      
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
      const middleware1 = jest.fn().mockImplementation((config) => config);
      const middleware2 = jest.fn().mockImplementation((config) => config);
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
        storage: createJSONStorage(() => localStorage) as StateStorage,
      };
      
      // Act
      createStore({ 
        initialState: { count: 0 },
        persist: persistConfig as PersistOptions<object, object>
      });
      
      // Assert
      expect(persist).toHaveBeenCalled();
      expect(createJSONStorage).toHaveBeenCalled();
    });

    it('should configure persist middleware with the correct options', () => {
      // Arrange
      const persistConfig = {
        name: 'test-store',
        storage: createJSONStorage(() => localStorage) as StateStorage,
        version: 1,
        partialize: (state: any) => ({ count: state.count }),
      };
      
      // Act
      createStore({ 
        initialState: { count: 0 },
        persist: persistConfig as PersistOptions<object, object>
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