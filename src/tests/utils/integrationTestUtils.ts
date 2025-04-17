/**
 * Integration Test Utilities
 * 
 * This file contains utilities for integration testing between components,
 * APIs, and state stores. It provides functions for testing the interaction
 * between different parts of the application.
 */

import { vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React from 'react';
import { createMockResponse } from './mockApi';

/**
 * Component Integration Utilities
 * Provides utilities for testing integration between components
 */
export const componentIntegration = {
  /**
   * Mounts a component with all its dependencies
   */
  mountWithDependencies(
    Component: React.ComponentType<any>,
    props: Record<string, any> = {},
    dependencies: {
      providers?: Array<{
        Provider: React.ComponentType<any>;
        props: Record<string, any>;
      }>;
      mocks?: Array<{
        name: string;
        mock: ReturnType<typeof vi.fn>;
      }>;
      stores?: Record<string, any>;
    } = {}
  ) {
    // Create wrapper with all providers
    const Wrapper = ({ children }: { children: React.ReactNode }) => {
      const { providers = [] } = dependencies;
      
      return providers.reduce((acc, { Provider, props }) => {
        return <Provider {...props}>{acc}</Provider>;
      }, <>{children}</>);
    };

    // Render the component with all dependencies
    return render(
      <Component {...props} {...dependencies.stores} />,
      { wrapper: Wrapper }
    );
  },

  /**
   * Simulates interaction between components
   */
  simulateComponentInteraction: {
    /**
     * Simulates a component triggering an event that is handled by another component
     */
    triggerEvent(
      sourceSelector: string,
      event: string,
      eventData: any = {}
    ) {
      const element = screen.getByTestId(sourceSelector);
      
      const customEvent = new Event(event, {
        bubbles: true,
        cancelable: true,
      });
      
      Object.assign(customEvent, eventData);
      
      act(() => {
        element.dispatchEvent(customEvent);
      });
    },

    /**
     * Simulates a component changing props of a child component
     */
    updateChildProps(
      parentComponent: React.ComponentType<any>,
      childSelector: string,
      newProps: Record<string, any>
    ) {
      let childProps = {};
      
      const ParentWithUpdatedChild = (props: any) => {
        const [propsState, setPropsState] = React.useState(props);
        
        React.useEffect(() => {
          childProps = { ...propsState };
          act(() => {
            setPropsState({ ...propsState, ...newProps });
          });
        }, []);
        
        return parentComponent({ ...propsState });
      };
      
      render(<ParentWithUpdatedChild />);
      
      return childProps;
    }
  },

  /**
   * Verifies component integration
   */
  verifyComponentIntegration: {
    /**
     * Verifies that a component correctly handles props changes
     */
    propsChangePropagation(
      Component: React.ComponentType<any>,
      initialProps: Record<string, any>,
      updatedProps: Record<string, any>,
      assertions: (container: HTMLElement) => void
    ) {
      const { rerender, container } = render(<Component {...initialProps} />);
      
      // Rerender with updated props
      act(() => {
        rerender(<Component {...initialProps} {...updatedProps} />);
      });
      
      assertions(container);
    },

    /**
     * Verifies that a component correctly passes props to children
     */
    childrenPropsReceived(
      ParentComponent: React.ComponentType<any>,
      parentProps: Record<string, any>,
      childSelector: string,
      expectedChildProps: string[]
    ) {
      // Create a mock child component to verify props
      const mockChildComponent = vi.fn().mockReturnValue(<div data-testid="mock-child" />);
      
      // Render parent with mock child
      render(
        <ParentComponent {...parentProps}>
          {mockChildComponent}
        </ParentComponent>
      );
      
      // Verify child received expected props
      const receivedProps = mockChildComponent.mock.calls[0][0];
      expectedChildProps.forEach(propName => {
        expect(receivedProps).toHaveProperty(propName);
      });
    }
  }
};

/**
 * API Integration Utilities
 * Provides utilities for testing integration with APIs
 */
export const apiIntegration = {
  /**
   * Mocks an API endpoint with a response
   */
  mockApiEndpoint<T>(
    method: 'get' | 'post' | 'put' | 'delete' | 'patch',
    endpoint: string,
    response: T,
    options: {
      delay?: number;
      status?: number;
      headers?: Record<string, string>;
      throwError?: boolean;
      errorMessage?: string;
    } = {}
  ) {
    const { delay = 0, status = 200, headers = {}, throwError = false, errorMessage = 'API Error' } = options;

    // Create a mock fetch or axios implementation
    global.fetch = vi.fn().mockImplementation(async (url: string, config: RequestInit) => {
      if (url.includes(endpoint) && config.method?.toLowerCase() === method.toLowerCase()) {
        await new Promise(resolve => setTimeout(resolve, delay));
        
        if (throwError) {
          throw new Error(errorMessage);
        }
        
        return {
          ok: status >= 200 && status < 300,
          status,
          headers: new Headers(headers),
          json: async () => response,
          text: async () => JSON.stringify(response)
        };
      }
      
      throw new Error(`Unexpected request: ${config.method} ${url}`);
    });
    
    return {
      reset: () => {
        global.fetch = undefined as any;
      }
    };
  },

  /**
   * Simulates an API request
   */
  async simulateApiRequest<T>(
    endpoint: string,
    method: 'get' | 'post' | 'put' | 'delete' | 'patch' = 'get',
    body?: any,
    headers: Record<string, string> = {}
  ): Promise<T> {
    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  },

  /**
   * Verifies an API response
   */
  verifyApiResponse<T>(
    response: T,
    schema: Record<string, any>,
    assertions?: (response: T) => void
  ) {
    // Verify response structure matches schema
    Object.keys(schema).forEach(key => {
      expect(response).toHaveProperty(key);
      if (typeof schema[key] === 'string') {
        expect(typeof (response as any)[key]).toBe(schema[key]);
      }
    });
    
    // Run additional assertions if provided
    if (assertions) {
      assertions(response);
    }
    
    return true;
  },

  /**
   * Tests API error handling
   */
  testApiErrorHandling(
    apiCall: () => Promise<any>,
    errorHandler: (error: Error) => any,
    expectedErrorMessage?: string
  ) {
    return async () => {
      const mockError = new Error(expectedErrorMessage || 'API Error');
      apiCall = vi.fn().mockRejectedValue(mockError);
      
      const handleError = vi.fn(errorHandler);
      
      try {
        await apiCall();
      } catch (error) {
        handleError(error as Error);
      }
      
      expect(handleError).toHaveBeenCalled();
      
      if (expectedErrorMessage) {
        expect(handleError).toHaveBeenCalledWith(expect.objectContaining({
          message: expectedErrorMessage
        }));
      }
    };
  }
};

/**
 * Store Integration Utilities
 * Provides utilities for testing integration with state stores
 */
export const storeIntegration = {
  /**
   * Sets up a test store with initial state
   */
  setupTestStore<T extends Record<string, any>>(
    createStore: (initialState?: Partial<T>) => T,
    initialState?: Partial<T>
  ) {
    const store = createStore(initialState);
    
    return {
      store,
      initialState: initialState || {},
      getState: () => store,
      subscribe: (listener: () => void) => {
        const unsubscribe = vi.fn();
        return unsubscribe;
      }
    };
  },

  /**
   * Dispatches a test action to the store
   */
  dispatchTestAction<T extends Record<string, any>, A extends Record<string, any>>(
    store: T & { dispatch?: (action: A) => void },
    action: A,
    mockDispatch = false
  ) {
    if (mockDispatch || !store.dispatch) {
      const dispatch = vi.fn();
      dispatch(action);
      return { action, dispatch };
    }
    
    const dispatch = store.dispatch as (action: A) => void;
    dispatch(action);
    
    return { action, dispatch };
  },

  /**
   * Verifies store state after actions
   */
  verifyStoreState<T extends Record<string, any>>(
    store: T,
    expectedState: Partial<T>,
    path: string[] = []
  ) {
    const actualState = path.reduce((state, key) => state[key], store as any);
    const expectedPartial = path.reduce(
      (state, key) => state[key], 
      expectedState as any
    );
    
    expect(actualState).toMatchObject(expectedPartial);
    return true;
  },

  /**
   * Tests store selectors
   */
  testStoreSelectors<T extends Record<string, any>, R>(
    store: T,
    selector: (state: T) => R,
    expectedResult: R
  ) {
    const result = selector(store);
    expect(result).toEqual(expectedResult);
    return true;
  }
}; 