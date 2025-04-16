import { describe, it, expect, vi, beforeEach } from 'vitest';
import { create } from 'zustand';
import { withLogger } from '../../lib/store/middleware/logger';

interface TestState {
  count: number;
  increment: () => void;
  decrement: () => void;
  incrementBy: (amount: number) => void;
}

describe('Logger Middleware', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;
  let mockLogger: ReturnType<typeof vi.fn>;
  let store: any; // Use any for simplified typing
  
  beforeEach(() => {
    // Spy on console.log
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    // Create a mock logger
    mockLogger = vi.fn();
    
    // Create a test store with the logger middleware
    store = create<TestState>()(
      withLogger({ 
        enabled: true,
        logger: mockLogger
      })((set) => ({
        count: 0,
        increment: () => set((state: TestState) => ({ count: state.count + 1 })),
        decrement: () => set((state: TestState) => ({ count: state.count - 1 })),
        incrementBy: (amount: number) => set((state: TestState) => ({ count: state.count + amount }))
      }))
    );
  });
  
  it('should log state changes when actions are dispatched', () => {
    // Perform some actions
    store.getState().increment();
    
    // Check if the logger was called
    expect(mockLogger).toHaveBeenCalled();
    
    // The first argument should be the formatted message
    const logArgs = mockLogger.mock.calls[0];
    expect(logArgs[0]).toContain('Action:');
    
    // The log should contain the state before and after
    const logData = logArgs[4];
    expect(logData.previousState.count).toBe(0);
    expect(logData.nextState.count).toBe(1);
    
    // Check that diff contains the changed properties
    expect(logData.diff.count).toEqual({ from: 0, to: 1 });
  });
  
  it('should correctly identify the action name', () => {
    // Named function action
    store.getState().increment();
    expect(mockLogger.mock.calls[0][0]).toContain('Action: ');
    expect(mockLogger.mock.calls[0][0]).toContain('count');
    
    // Action with parameter
    store.getState().incrementBy(5);
    expect(mockLogger.mock.calls[1][0]).toContain('Action: ');
    expect(mockLogger.mock.calls[1][0]).toContain('count');
  });
  
  it('should not log when disabled', () => {
    // Create a store with disabled logger
    const disabledStore = create<TestState>()(
      withLogger({ enabled: false })((set) => ({
        count: 0,
        increment: () => set((state: TestState) => ({ count: state.count + 1 })),
        decrement: () => set((state: TestState) => ({ count: state.count - 1 })),
        incrementBy: (amount: number) => set((state: TestState) => ({ count: state.count + amount }))
      }))
    );
    
    // Reset the mock
    mockLogger.mockReset();
    
    // Perform an action
    disabledStore.getState().increment();
    
    // Logger should not have been called
    expect(mockLogger).not.toHaveBeenCalled();
  });
  
  it('should ignore specified actions', () => {
    // Create a store with ignored actions
    const filteredStore = create<TestState>()(
      withLogger({ 
        enabled: true,
        logger: mockLogger,
        ignoredActions: ['count']
      })((set) => ({
        count: 0,
        increment: () => set((state: TestState) => ({ count: state.count + 1 })),
        decrement: () => set((state: TestState) => ({ count: state.count - 1 })),
        incrementBy: (amount: number) => set((state: TestState) => ({ count: state.count + amount }))
      }))
    );
    
    // Reset the mock
    mockLogger.mockReset();
    
    // Perform an action that should be ignored
    filteredStore.getState().increment();
    
    // Logger should not have been called
    expect(mockLogger).not.toHaveBeenCalled();
  });
}); 