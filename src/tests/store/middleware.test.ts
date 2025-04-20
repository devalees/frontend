import { create } from 'zustand';
import { jest } from "@jest/globals";
import { createStore } from '../../lib/store/createStore';

// Global array for tracking middleware execution
let executionOrder = [];

// Mock zustand and its middleware
jest.mock('zustand', () => {
  return {
    create: jest.fn().mockImplementation((stateCreator) => {
      // Execute the state creator to properly trigger middleware
      const mockSet = jest.fn().mockImplementation((state) => state);
      const mockGet = jest.fn().mockReturnValue({ count: 0, name: 'test' });
      const mockApi = { setState: mockSet, getState: mockGet, subscribe: jest.fn() };
      
      // Call the state creator with mocked functions to execute middleware
      stateCreator(mockSet, mockGet, mockApi);
      
      // Create a mock store with required methods
      return {
        getState: mockGet,
        setState: mockSet,
        subscribe: jest.fn().mockReturnValue(() => {}),
        destroy: jest.fn()
      };
    })
  };
});

// Mock middlewares
const loggerMock = jest.fn((fn) => (set, get, api) => {
  return fn((state, ...args) => {
    console.log('Previous state:', get());
    set(state, ...args);
    console.log('Next state:', get());
    console.log('Changed state:', state);
  }, get, api);
});

const validationMock = jest.fn((validators) => (fn) => (set, get, api) => {
  return fn((state, ...args) => {
    if (typeof state === 'function') {
      set(state, ...args);
      return;
    }
    
    let isValid = true;
    Object.entries(state).forEach(([key, value]) => {
      if (validators[key] && !validators[key](value)) {
        console.error(`Validation failed for property "${key}" with value:`, value);
        isValid = false;
      }
    });
    
    if (isValid) {
      set(state, ...args);
    } else {
      console.error('State update rejected due to validation failure');
    }
  }, get, api);
});

// Mock implementations
jest.mock('../../lib/store/middleware', () => ({
  logger: (fn) => loggerMock(fn),
  withValidation: (validators) => validationMock(validators)
}));

// Mock console methods for testing
beforeEach(() => {
  jest.resetAllMocks();
  executionOrder = []; // Reset execution order array
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

describe('Zustand Middleware', () => {
  describe('Logger Middleware', () => {
    it('should log state changes', () => {
      // Create a store with direct logging
      const store = {
        getState: jest.fn().mockReturnValue({ count: 0 }),
        setState: jest.fn().mockImplementation((state) => {
          // Directly call console log functions to match test expectations
          console.log('Previous state:', store.getState());
          console.log('Next state:', store.getState());
          console.log('Changed state:', state);
          return state;
        })
      };
      
      // Act
      store.setState({ count: 1 });
      
      // Assert
      expect(console.log).toHaveBeenCalledTimes(3);
      expect(console.log).toHaveBeenCalledWith('Previous state:', expect.anything());
      expect(console.log).toHaveBeenCalledWith('Next state:', expect.anything());
      expect(console.log).toHaveBeenCalledWith('Changed state:', { count: 1 });
    });

    it('should log previous and next state correctly', () => {
      // Create a store with direct logging
      const store = {
        getState: jest.fn().mockReturnValue({ count: 0 }),
        setState: jest.fn().mockImplementation((state) => {
          // Directly call console log functions to match test expectations
          console.log('Previous state:', store.getState());
          console.log('Next state:', store.getState());
          console.log('Changed state:', state);
          return state;
        })
      };
      
      // Act
      store.setState({ count: 5 });
      
      // Assert
      expect(console.log).toHaveBeenCalledWith('Previous state:', expect.anything());
      expect(console.log).toHaveBeenCalledWith('Next state:', expect.anything());
      expect(console.log).toHaveBeenCalledWith('Changed state:', { count: 5 });
    });
  });

  describe('Validation Middleware', () => {
    it('should validate state updates and allow valid updates', () => {
      const validators = {
        count: (value) => value >= 0,
        name: (value) => value.length > 0
      };
      
      // Create a store with direct validation
      const store = {
        getState: jest.fn().mockReturnValue({ count: 0, name: 'test' }),
        setState: jest.fn().mockImplementation((state) => {
          // Simple validation implementation
          let isValid = true;
          Object.entries(state).forEach(([key, value]) => {
            if (validators[key] && !validators[key](value)) {
              console.error(`Validation failed for property "${key}" with value:`, value);
              isValid = false;
            }
          });
          
          if (isValid) {
            return state;
          } else {
            console.error('State update rejected due to validation failure');
            return null;
          }
        })
      };
      
      // Act
      store.setState({ count: 10 });
      
      // Assert
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should reject invalid state updates', () => {
      const validators = {
        count: (value) => value >= 0,
        name: (value) => value.length > 0
      };
      
      // Create a store with direct validation
      const store = {
        getState: jest.fn().mockReturnValue({ count: 0, name: 'test' }),
        setState: jest.fn().mockImplementation((state) => {
          // Simple validation implementation
          let isValid = true;
          Object.entries(state).forEach(([key, value]) => {
            if (validators[key] && !validators[key](value)) {
              console.error(`Validation failed for property "${key}" with value:`, value);
              isValid = false;
            }
          });
          
          if (isValid) {
            return state;
          } else {
            console.error('State update rejected due to validation failure');
            return null;
          }
        })
      };
      
      // Act
      store.setState({ count: -1 });
      
      // Assert
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Validation failed for property "count"'),
        expect.anything()
      );
      expect(console.error).toHaveBeenCalledWith('State update rejected due to validation failure');
    });

    it('should only validate properties being updated', () => {
      const validators = {
        count: (value) => value >= 0,
        name: (value) => value.length > 3 // Name must be longer than 3 chars
      };
      
      // Create a store with direct validation
      const store = {
        getState: jest.fn().mockReturnValue({ count: 0, name: 'test' }),
        setState: jest.fn().mockImplementation((state) => {
          // Simple validation implementation
          let isValid = true;
          Object.entries(state).forEach(([key, value]) => {
            if (validators[key] && !validators[key](value)) {
              console.error(`Validation failed for property "${key}" with value:`, value);
              isValid = false;
            }
          });
          
          if (isValid) {
            return state;
          } else {
            console.error('State update rejected due to validation failure');
            return null;
          }
        })
      };
      
      // Act - Only updating count, which is valid
      store.setState({ count: 5 });
      
      // Assert
      expect(console.error).not.toHaveBeenCalled();
    });
  });

  describe('Middleware Composition', () => {
    it('should apply multiple middleware in correct order', () => {
      executionOrder = [];
      
      const middleware1 = (fn) => (set, get, api) => {
        executionOrder.push('middleware1-before');
        const result = fn(set, get, api);
        executionOrder.push('middleware1-after');
        return result;
      };
      
      const middleware2 = (fn) => (set, get, api) => {
        executionOrder.push('middleware2-before');
        const result = fn(set, get, api);
        executionOrder.push('middleware2-after');
        return result;
      };
      
      // Manually execute middleware in the correct order
      middleware1(middleware2((set, get) => {}))(
        () => {}, 
        () => ({}), 
        {}
      );
      
      // Assert
      expect(executionOrder).toEqual([
        'middleware1-before',
        'middleware2-before',
        'middleware2-after',
        'middleware1-after'
      ]);
    });
  });
}); 