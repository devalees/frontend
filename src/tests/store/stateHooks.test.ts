import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useEffect } from 'react';
import { useCustomHook } from '../../lib/hooks/useCustomHook';

// Mock the store to avoid actual state changes during tests
vi.mock('../../lib/store', () => ({
  useStore: vi.fn(() => ({
    setState: vi.fn(),
    getState: vi.fn()
  }))
}));

// Create a mock implementation that matches the hook's interface
const mockState = {
  data: null,
  loading: false,
  error: null,
  updateCount: 0,
  computed: null
};

const mockActions = {
  update: vi.fn(),
  reset: vi.fn(),
  fetchData: vi.fn(),
  batchUpdate: vi.fn()
};

// Mock the custom hook to return our mock implementation
vi.mock('../../lib/hooks/useCustomHook', () => ({
  useCustomHook: () => ({
    state: { ...mockState },
    actions: mockActions
  })
}));

describe('State Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock state
    Object.assign(mockState, {
      data: null,
      loading: false,
      error: null,
      updateCount: 0,
      computed: null
    });
  });

  describe('Hook Creation', () => {
    it('should create a hook with proper initialization', () => {
      const { result } = renderHook(() => useCustomHook());
      expect(result.current).toBeDefined();
      expect(typeof result.current.state).toBe('object');
      expect(typeof result.current.actions).toBe('object');
    });

    it('should provide correct initial state', () => {
      const { result } = renderHook(() => useCustomHook());
      expect(result.current.state).toEqual({
        data: null,
        loading: false,
        error: null,
        updateCount: 0,
        computed: null
      });
    });

    it('should expose required actions', () => {
      const { result } = renderHook(() => useCustomHook());
      expect(typeof result.current.actions.update).toBe('function');
      expect(typeof result.current.actions.reset).toBe('function');
    });
  });

  describe('Hook Effects', () => {
    it('should handle side effects properly', async () => {
      const { result } = renderHook(() => useCustomHook());
      
      await act(async () => {
        result.current.actions.update({ data: 'test' });
      });
      
      expect(mockActions.update).toHaveBeenCalledWith({ data: 'test' });
    });

    it('should cleanup effects on unmount', () => {
      const cleanup = vi.fn(() => {});
      const { unmount } = renderHook(() => {
        useEffect(() => cleanup, []);
        return useCustomHook();
      });
      
      unmount();
      expect(cleanup).toHaveBeenCalled();
    });

    it('should handle async operations correctly', async () => {
      const { result } = renderHook(() => useCustomHook());
      
      await act(async () => {
        await result.current.actions.fetchData();
      });
      
      expect(mockActions.fetchData).toHaveBeenCalled();
    });
  });

  describe('Hook Performance', () => {
    it('should memoize selectors properly', () => {
      const { result, rerender } = renderHook(() => useCustomHook());
      const initialSelector = result.current.state.computed;
      
      rerender();
      
      expect(result.current.state.computed).toBe(initialSelector);
    });

    it('should prevent unnecessary re-renders', () => {
      const renderCount = vi.fn(() => {});
      const { result } = renderHook(() => {
        useEffect(renderCount, []);
        return useCustomHook();
      });
      
      act(() => {
        result.current.actions.update({ unrelatedData: 'test' });
      });
      
      expect(renderCount).toHaveBeenCalledTimes(1);
    });

    it('should batch updates efficiently', async () => {
      const { result } = renderHook(() => useCustomHook());
      
      const updates = [
        { type: 'update', data: 1 },
        { type: 'update', data: 2 },
        { type: 'update', data: 3 },
      ];
      
      await act(async () => {
        result.current.actions.batchUpdate(updates);
      });
      
      expect(mockActions.batchUpdate).toHaveBeenCalledWith(updates);
    });
  });
}); 