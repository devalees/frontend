import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { create, StoreApi } from 'zustand';
import { withDebugger, DebugLevel, createDebugTools, DebugState } from '../../lib/store/middleware/debugger';

// Mock console methods
const originalConsole = { ...console };
vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'groupCollapsed').mockImplementation(() => {});
vi.spyOn(console, 'groupEnd').mockImplementation(() => {});

describe('Debugger Middleware', () => {
  // Reset console mocks between tests
  afterEach(() => {
    vi.clearAllMocks();
  });

  // Type definitions for our test store
  interface TestState {
    count: number;
    text: string;
    increment: () => void;
    setText: (text: string) => void;
    reset: () => void;
  }

  // Combined type for the store with debug state
  type TestStateWithDebug = TestState & DebugState;

  // Setup function to create a test store with debugger middleware
  const createTestStore = (debugOptions = {}): StoreApi<TestStateWithDebug> => {
    return create<TestStateWithDebug>()(
      withDebugger<TestState>(debugOptions)(
        (set) => ({
          count: 0,
          text: '',
          increment: () => set((state) => ({ count: state.count + 1 })),
          setText: (text: string) => set({ text }),
          reset: () => set({ count: 0, text: '' }),
        })
      )
    );
  };

  describe('Basic Functionality', () => {
    it('should initialize with debug state', () => {
      const store = createTestStore();
      const state = store.getState();
      
      // Check that the store has debug state
      expect(state).toHaveProperty('__debug');
      expect(state.__debug).toHaveProperty('enabled');
      expect(state.__debug).toHaveProperty('levels');
      expect(state.__debug).toHaveProperty('actionHistory');
      expect(state.__debug).toHaveProperty('stateHistory');
    });

    it('should provide debug tools via helper', () => {
      const store = createTestStore();
      const debugTools = createDebugTools(store);
      
      expect(debugTools).toHaveProperty('toggleDebug');
      expect(debugTools).toHaveProperty('setDebugLevels');
      expect(debugTools).toHaveProperty('clearDebugHistory');
      expect(debugTools).toHaveProperty('getActionHistory');
      expect(debugTools).toHaveProperty('getStateHistory');
      expect(debugTools).toHaveProperty('isDebugEnabled');
      expect(debugTools).toHaveProperty('getDebugLevels');
    });

    it('should have debug enabled by default in non-production', () => {
      const store = createTestStore();
      const debugTools = createDebugTools(store);
      
      // Default should be enabled since we're in dev/test
      expect(debugTools.isDebugEnabled()).toBe(true);
    });
  });

  describe('Debug Controls', () => {
    it('should toggle debug mode', () => {
      const store = createTestStore();
      const debugTools = createDebugTools(store);
      
      // Initial state (enabled in test env)
      expect(debugTools.isDebugEnabled()).toBe(true);
      
      // Toggle off
      debugTools.toggleDebug(false);
      expect(debugTools.isDebugEnabled()).toBe(false);
      
      // Toggle on explicitly
      debugTools.toggleDebug(true);
      expect(debugTools.isDebugEnabled()).toBe(true);
      
      // Toggle without params (should invert)
      debugTools.toggleDebug();
      expect(debugTools.isDebugEnabled()).toBe(false);
    });

    it('should update debug levels', () => {
      const store = createTestStore();
      const debugTools = createDebugTools(store);
      
      // Check default levels
      const defaultLevels = debugTools.getDebugLevels();
      expect(defaultLevels).toContain(DebugLevel.ERROR);
      
      // Set new levels
      const newLevels = [DebugLevel.INFO, DebugLevel.PERFORMANCE];
      debugTools.setDebugLevels(newLevels);
      
      // Check updated levels
      const updatedLevels = debugTools.getDebugLevels();
      expect(updatedLevels).toEqual(newLevels);
      expect(updatedLevels).toContain(DebugLevel.INFO);
      expect(updatedLevels).toContain(DebugLevel.PERFORMANCE);
      expect(updatedLevels).not.toContain(DebugLevel.ERROR);
    });

    it('should clear history', () => {
      const store = createTestStore();
      const debugTools = createDebugTools(store);
      
      // Perform some actions
      store.getState().increment();
      store.getState().setText('hello');
      
      // History should have entries
      expect(debugTools.getActionHistory().length).toBeGreaterThan(0);
      
      // Clear history
      debugTools.clearDebugHistory();
      
      // History should be empty
      expect(debugTools.getActionHistory().length).toBe(0);
      expect(debugTools.getStateHistory().length).toBe(0);
    });
  });
  
  describe('Action Tracking', () => {
    it('should track actions', () => {
      const store = createTestStore();
      const debugTools = createDebugTools(store);
      
      // Initial history should be empty
      expect(debugTools.getActionHistory().length).toBe(0);
      
      // Perform an action
      store.getState().increment();
      
      // History should have an entry
      const history = debugTools.getActionHistory();
      expect(history.length).toBe(1);
      expect(history[0]).toHaveProperty('action');
      expect(history[0]).toHaveProperty('timestamp');
      expect(history[0]).toHaveProperty('payload');
    });
    
    it('should not track actions when disabled', () => {
      const store = createTestStore();
      const debugTools = createDebugTools(store);
      
      // Disable debugging
      debugTools.toggleDebug(false);
      
      // Perform an action
      store.getState().increment();
      
      // History should still be empty
      expect(debugTools.getActionHistory().length).toBe(0);
    });
  });
  
  describe('State Tracking', () => {
    it('should track state changes', () => {
      const store = createTestStore();
      const debugTools = createDebugTools(store);
      
      // Initial history should be empty
      expect(debugTools.getStateHistory().length).toBe(0);
      
      // Perform an action that changes state
      store.getState().increment();
      
      // History should have an entry
      const history = debugTools.getStateHistory();
      expect(history.length).toBe(1);
      expect(history[0]).toHaveProperty('timestamp');
      expect(history[0]).toHaveProperty('state');
      
      // State should reflect the change
      expect(history[0].state.count).toBe(1);
    });
    
    it('should handle multiple state changes', () => {
      const store = createTestStore();
      const debugTools = createDebugTools(store);
      
      // Perform multiple actions
      store.getState().increment();
      store.getState().increment();
      store.getState().setText('hello');
      
      // History should have entries
      const history = debugTools.getStateHistory();
      expect(history.length).toBe(3);
      
      // Most recent state should be at index 0
      expect(history[0].state.count).toBe(2);
      expect(history[0].state.text).toBe('hello');
    });
  });
  
  describe('Performance', () => {
    it('should not interfere with store functionality', () => {
      const store = createTestStore();
      
      // Perform actions
      store.getState().increment();
      store.getState().setText('test');
      
      // Check state is updated correctly
      const state = store.getState();
      expect(state.count).toBe(1);
      expect(state.text).toBe('test');
      
      // Reset state
      store.getState().reset();
      
      // Check reset worked
      const resetState = store.getState();
      expect(resetState.count).toBe(0);
      expect(resetState.text).toBe('');
    });
    
    it('should respect custom logging config', () => {
      // Create a custom logger
      const customLogger = vi.fn();
      
      // Create store with custom logger
      const store = createTestStore({
        logger: customLogger,
        levels: [DebugLevel.ACTION]
      });
      
      // Perform an action
      store.getState().increment();
      
      // Custom logger should have been called
      expect(customLogger).toHaveBeenCalled();
    });
  });
}); 