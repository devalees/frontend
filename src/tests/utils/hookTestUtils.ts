/**
 * Hook Test Utilities
 * 
 * This file contains utilities for testing React hooks.
 * It provides functions for hook rendering, state updates,
 * and waiting for asynchronous operations.
 */

import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { jest } from '@jest/globals';

/**
 * Hook Testing Utilities
 * Provides utilities for testing custom React hooks
 */
export const hookTestUtils = {
  /**
   * Renders a custom hook for testing
   */
  renderCustomHook<Result, Props>(
    useHook: (props: Props) => Result,
    initialProps?: Props
  ) {
    return renderHook((props) => useHook(props as Props), {
      initialProps
    });
  },

  /**
   * Wrapper for React's act function to update hook state
   */
  actHook: async (callback: () => Promise<void> | void) => {
    await act(async () => {
      await callback();
    });
  },

  /**
   * Waits for hook updates to complete
   */
  waitForHookUpdate: async (ms = 0) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    }).then(() => act(() => {}));
  },

  /**
   * Creates a wrapper component with context providers for hook testing
   */
  createTestWrapper: (providers: Array<{
    Provider: React.ComponentType<any>;
    props: Record<string, any>;
  }>) => {
    // Return a simpler implementation avoiding JSX
    return function TestWrapper({ children }: { children: React.ReactNode }) {
      // Apply providers recursively
      function applyProviders(index: number, innerChildren: React.ReactNode): React.ReactElement {
        if (index >= providers.length) {
          return React.createElement(React.Fragment, null, innerChildren);
        }
        
        const { Provider, props } = providers[index];
        return React.createElement(
          Provider,
          props,
          applyProviders(index + 1, innerChildren)
        );
      }
      
      return applyProviders(0, children);
    };
  },

  /**
   * Tests hook state transitions
   */
  testHookStateTransitions<Result>(
    useHook: () => Result,
    actions: Array<{
      act: () => void | Promise<void>;
      assert: (result: Result) => void;
    }>
  ) {
    return async () => {
      const { result } = renderHook(() => useHook());
      
      for (const { act: performAction, assert } of actions) {
        await hookTestUtils.actHook(performAction);
        assert(result.current);
      }
    };
  },

  /**
   * Tests hook cleanup
   */
  testHookCleanup<Result extends Record<string, any>>(
    useHook: () => Result & { cleanup?: () => void },
    mockCleanupFn = jest.fn()
  ) {
    let cleanupFn: () => void = () => {};
    
    const { unmount } = renderHook(() => {
      const result = useHook();
      
      React.useEffect(() => {
        return () => {
          if (result.cleanup) {
            cleanupFn = result.cleanup;
            mockCleanupFn();
          }
        };
      }, []);
      
      return result;
    });
    
    unmount();
    expect(mockCleanupFn).toHaveBeenCalled();
    cleanupFn();
  },

  /**
   * Tests hooks with dependencies
   */
  testHookWithDependencies<Result, Deps extends any[]>(
    useHook: (...deps: Deps) => Result,
    dependencies: Deps,
    assertions: (result: Result) => void
  ) {
    const { result } = renderHook(() => useHook(...dependencies));
    assertions(result.current);
  }
}; 