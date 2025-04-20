/**
 * Integration Test Utilities
 * 
 * This file contains utilities for integration testing between components,
 * APIs, and state stores. It provides functions for testing the interaction
 * between different parts of the application.
 */

import { jest } from '@jest/globals';
import { render, screen, act } from '@testing-library/react';
import React, { ReactElement, Fragment } from 'react';
import { createMockResponse as mockApiResponse } from './mockApi';
import userEvent from '@testing-library/user-event';
import { RenderOptions } from '@testing-library/react';
import type { AxiosResponse } from 'axios';

// Type alias to simplify component type usage
type ComponentType<P = any> = React.ComponentType<P>;

/**
 * Component Integration Utilities
 * Provides utilities for testing integration between components
 */
export const componentIntegration = {
  /**
   * Mounts a component with all its dependencies
   */
  mountWithDependencies(
    Component: ComponentType<any>,
    props: Record<string, any> = {},
    dependencies: {
      providers?: Array<{
        Provider: ComponentType<any>;
        props: Record<string, any>;
      }>;
      mocks?: Array<{
        name: string;
        mock: ReturnType<typeof jest.fn>;
      }>;
      stores?: Record<string, any>;
    } = {}
  ) {
    // Create wrapper with all providers
    const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
      const { providers = [] } = dependencies;
      
      return providers.reduce((acc: React.ReactNode, { Provider, props }) => {
        return React.createElement(Provider, props, acc);
      }, children);
    };

    // Render the component with all dependencies
    return render(
      React.createElement(Component, { ...props, ...dependencies.stores }),
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
      parentComponent: ComponentType<any>,
      childSelector: string,
      newProps: Record<string, any>
    ) {
      let childProps = {};
      
      const ParentWithUpdatedChild: React.FC = () => {
        const [propsState, setPropsState] = React.useState({});
        
        React.useEffect(() => {
          childProps = { ...propsState };
          act(() => {
            setPropsState({ ...propsState, ...newProps });
          });
        }, []);
        
        return React.createElement(parentComponent, { ...propsState });
      };
      
      render(React.createElement(ParentWithUpdatedChild, {}));
      
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
      Component: ComponentType<any>,
      initialProps: Record<string, any>,
      updatedProps: Record<string, any>,
      assertions: (container: HTMLElement) => void
    ) {
      const { rerender, container } = render(React.createElement(Component, initialProps));
      
      // Rerender with updated props
      act(() => {
        rerender(React.createElement(Component, { ...initialProps, ...updatedProps }));
      });
      
      assertions(container);
    },

    /**
     * Verifies that a component correctly passes props to children
     */
    childrenPropsReceived(
      ParentComponent: ComponentType<any>,
      parentProps: Record<string, any>,
      childSelector: string,
      expectedChildProps: string[]
    ) {
      // Create a mock child component to verify props
      const mockChildComponent = jest.fn().mockReturnValue(
        React.createElement('div', { 'data-testid': 'mock-child' })
      );
      
      // Render parent with mock child
      render(
        React.createElement(ParentComponent, {
          ...parentProps,
          children: mockChildComponent
        })
      );
      
      // Verify child received expected props
      const receivedProps = mockChildComponent.mock.calls[0][0];
      expectedChildProps.forEach(propName => {
        expect(receivedProps).toHaveProperty(propName);
      });
    }
  },

  /**
   * Renders a component tree with specified providers
   */
  renderWithProviders<P extends Record<string, any>>(
    Component: ComponentType<P>, 
    props: P,
    providers: Array<{
      Provider: ComponentType<any>;
      props: Record<string, any>;
    }> = [],
    children?: React.ReactNode
  ) {
    // Create the wrapper with all providers
    const AllProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
      // Reduce the array of providers to a nested structure
      return providers.reduce((acc: React.ReactNode, { Provider, props }) => {
        return React.createElement(Provider, props, acc);
      }, children);
    };
    
    // Render the component with all providers
    return render(
      React.createElement(
        AllProviders,
        { children: React.createElement(Component, { ...props }) }
      )
    );
  },

  /**
   * Renders a component with mock stores
   */
  renderWithStores<P extends Record<string, any>>(
    Component: ComponentType<P>,
    props: P,
    dependencies: {
      stores: Record<string, any>;
      providers?: Array<{
        Provider: ComponentType<any>;
        props: Record<string, any>;
      }>;
    }
  ) {
    return componentIntegration.renderWithProviders(
      Component,
      { ...props, ...dependencies.stores },
      dependencies.providers || []
    );
  },

  /**
   * Tests parent-child component interactions
   */
  testParentChildInteraction<
    ParentProps extends Record<string, any>,
    ChildProps extends Record<string, any>
  >(
    ParentComponent: ComponentType<ParentProps>,
    ChildComponent: ComponentType<ChildProps>,
    parentProps: ParentProps,
    expectedChildProps: Partial<ChildProps>,
    testCase: {
      action: () => void;
      expectedUpdatedChildProps: Partial<ChildProps>;
    }
  ) {
    // Mock the child component to verify props
    const originalChild = ChildComponent;
    const mockChildFn = jest.fn();
    
    // Create a wrapper that renders the actual child but also tracks props
    const ChildComponentWrapper = (props: ChildProps) => {
      mockChildFn(props);
      return React.createElement(originalChild, props);
    };
    
    // Replace the real child with our wrapper in the parent component
    const ParentWithUpdatedChild: React.FC = () => {
      return React.createElement(ParentComponent, {
        ...parentProps,
        childComponent: ChildComponentWrapper
      });
    };
    
    // Render the parent with the mocked child
    render(React.createElement(ParentWithUpdatedChild, {}));
    
    // Verify initial props passed to child
    for (const [key, value] of Object.entries(expectedChildProps)) {
      expect(mockChildFn).toHaveBeenCalledWith(
        expect.objectContaining({ [key]: value })
      );
    }
    
    // Reset mock before running test action
    mockChildFn.mockClear();
    
    // Execute the test action (e.g., click, input change)
    testCase.action();
    
    // Verify updated props passed to child
    for (const [key, value] of Object.entries(testCase.expectedUpdatedChildProps)) {
      expect(mockChildFn).toHaveBeenCalledWith(
        expect.objectContaining({ [key]: value })
      );
    }
  },

  /**
   * Tests component rerendering with updated props
   */
  testComponentRerender<P extends Record<string, any>>(
    Component: ComponentType<P>,
    initialProps: P,
    updatedProps: Partial<P>,
    assertions: {
      beforeUpdate?: (container: HTMLElement) => void;
      afterUpdate?: (container: HTMLElement) => void;
    }
  ) {
    // Render the component with initial props
    const { rerender, container } = render(
      React.createElement(Component, initialProps)
    );
    
    // Run assertions on the initial render, if specified
    if (assertions.beforeUpdate) {
      assertions.beforeUpdate(container);
    }
    
    // Rerender with updated props
    act(() => {
      rerender(React.createElement(Component, { ...initialProps, ...updatedProps }));
    });
    
    // Run assertions after the update, if specified
    if (assertions.afterUpdate) {
      assertions.afterUpdate(container);
    }
  },

  /**
   * Tests composition of components with dynamic props
   */
  testComponentComposition<
    ParentProps extends Record<string, any>,
    ChildProps extends Record<string, any>
  >(
    ParentComponent: ComponentType<ParentProps & { children?: React.ReactNode }>,
    parentProps: ParentProps,
    renderChild: (props: ChildProps) => React.ReactElement,
    testCases: {
      initialChildProps: ChildProps;
      updatedChildProps: ChildProps;
      userInteraction: () => void;
      assertions: (result: {
        parentElement: HTMLElement;
        childElement: HTMLElement;
      }) => void;
    }
  ) {
    // State to hold and update child props
    const TestComposition: React.FC = () => {
      const [childProps, setChildProps] = React.useState(testCases.initialChildProps);
      
      // Function to update child props
      const updateChildProps = () => {
        testCases.userInteraction();
        setChildProps(testCases.updatedChildProps);
      };
      
      // Register update on mount
      React.useEffect(() => {
        act(() => {
          updateChildProps();
        });
      }, []);
      
      // Render the parent with the child
      return React.createElement(
        ParentComponent,
        parentProps,
        renderChild(childProps)
      );
    };
    
    // Render the test composition
    const { container } = render(React.createElement(TestComposition, {}));
    
    // Extract parent and child elements for assertions
    const parentElement = container.firstChild as HTMLElement;
    const childElement = parentElement.querySelector('[data-testid]') as HTMLElement;
    
    // Run assertions
    testCases.assertions({
      parentElement,
      childElement
    });
  },

  /**
   * Tests event propagation through component hierarchy
   */
  testEventPropagation<P extends Record<string, any>>(
    Component: ComponentType<P>,
    props: P,
    eventTests: Array<{
      element: string | ((container: HTMLElement) => HTMLElement);
      event: string;
      handler: string;
    }>
  ) {
    // Create mock handlers for each event
    const mockHandlers = eventTests.reduce((handlers, { handler }) => {
      handlers[handler] = jest.fn();
      return handlers;
    }, {} as Record<string, jest.Mock>);
    
    // Component props with mock handlers
    const componentProps = {
      ...props,
      ...mockHandlers
    };
    
    // Render the component
    const { container } = render(React.createElement(Component, componentProps));
    
    // Test each event
    eventTests.forEach(({ element, event, handler }) => {
      // Get the element to trigger the event on
      const targetElement = typeof element === 'string'
        ? screen.getByTestId(element)
        : element(container);
      
      // Create and dispatch the event
      const customEvent = new Event(event, {
        bubbles: true,
        cancelable: true
      });
      
      act(() => {
        targetElement.dispatchEvent(customEvent);
      });
      
      // Verify handler was called
      expect(mockHandlers[handler]).toHaveBeenCalled();
      
      // Reset mock for next test
      mockHandlers[handler].mockClear();
    });
  },

  /**
   * API Integration Utilities
   * Provides utilities for testing integration with API endpoints
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
    // Configure mock response options
    const responseOptions = {
      delay: options.delay || 0,
      status: options.status || 200,
      headers: options.headers || { 'Content-Type': 'application/json' }
    };
    
    // Create the mock response
    const mockResponse = mockApiResponse(
      response,
      responseOptions.status,
      responseOptions.headers
    );
    
    // Set up global fetch mock for this endpoint
    const originalFetch = global.fetch;
    
    // Mock fetch globally or only for this endpoint
    global.fetch = jest.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();
      
      if (url.includes(endpoint) && init?.method?.toLowerCase() === method) {
        if (options.throwError) {
          return Promise.reject(new Error(options.errorMessage || 'Network error'));
        }
        
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(mockResponse);
          }, responseOptions.delay);
        });
      }
      
      // Pass through to original fetch for non-matching requests
      return originalFetch(input, init);
    }) as typeof global.fetch;
    
    // Return a cleanup function
    return () => {
      global.fetch = originalFetch;
    };
  },

  /**
   * Simulate an API request
   */
  async simulateApiRequest<T>(
    endpoint: string,
    method: 'get' | 'post' | 'put' | 'delete' | 'patch' = 'get',
    body?: any,
    headers: Record<string, string> = {}
  ): Promise<T> {
    // Configure request options
    const requestOptions: RequestInit = {
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    // Add body for non-GET requests
    if (body && method !== 'get') {
      requestOptions.body = JSON.stringify(body);
    }
    
    // Make the request
    const response = await fetch(endpoint, requestOptions);
    return response.json() as Promise<T>;
  },

  /**
   * Verify API response against a schema
   */
  verifyApiResponse<T>(
    response: T,
    schema: Record<string, any>,
    assertions?: (response: T) => void
  ) {
    // Check response against schema
    Object.entries(schema).forEach(([key, type]) => {
      expect(response).toHaveProperty(key);
      
      if (typeof type === 'string') {
        expect(typeof (response as any)[key]).toBe(type);
      } else if (Array.isArray(type)) {
        expect(Array.isArray((response as any)[key])).toBe(true);
      } else {
        expect(typeof (response as any)[key]).toBe(typeof type);
      }
    });
    
    // Run custom assertions if provided
    if (assertions) {
      assertions(response);
    }
  },

  /**
   * Test API error handling
   */
  testApiErrorHandling(
    apiCall: () => Promise<any>,
    errorHandler: (error: Error) => any,
    expectedErrorMessage?: string
  ) {
    // Mock console.error to prevent test output pollution
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    // Create a spy on the error handler
    const errorHandlerSpy = jest.fn(errorHandler);
    
    // Setup test with error handler
    const testError = async () => {
      try {
        await apiCall();
        // If we get here, the call didn't throw as expected
        fail('API call should have thrown an error');
      } catch (error) {
        // Call the error handler
        errorHandlerSpy(error as Error);
        
        // Check error message if expected
        if (expectedErrorMessage) {
          expect((error as Error).message).toContain(expectedErrorMessage);
        }
        
        // Verify handler was called
        expect(errorHandlerSpy).toHaveBeenCalled();
      } finally {
        // Restore console.error
        console.error = originalConsoleError;
      }
    };
    
    // Return the test function
    return testError();
  },

  /**
   * Store Integration Utilities
   * Provides utilities for testing integration with state stores
   */
  setupTestStore<T extends Record<string, any>>(
    createStore: (initialState?: Partial<T>) => T,
    initialState?: Partial<T>
  ) {
    // Create the store with initial state
    const store = createStore(initialState);
    
    // Return the store and methods to interact with it
    return {
      store,
      getState: () => store,
      reset: () => createStore(initialState)
    };
  },

  /**
   * Dispatch an action to a store and verify the result
   */
  dispatchTestAction<T extends Record<string, any>, A extends Record<string, any>>(
    store: T & { dispatch?: (action: A) => void },
    action: A,
    mockDispatch = false
  ) {
    // If we're mocking dispatch, create a spy
    if (mockDispatch && store.dispatch) {
      const originalDispatch = store.dispatch;
      store.dispatch = jest.fn(originalDispatch);
    }
    
    // Dispatch the action
    if (store.dispatch) {
      act(() => {
        store.dispatch!(action);
      });
    }
    
    // For mocked dispatch, verify it was called
    if (mockDispatch && store.dispatch) {
      expect(store.dispatch).toHaveBeenCalledWith(action);
    }
  },

  /**
   * Verify the state of a store matches expected values
   */
  verifyStoreState<T extends Record<string, any>>(
    store: T,
    expectedState: Partial<T>,
    path: string[] = []
  ) {
    // Get the part of the store to verify
    const stateToVerify = path.length
      ? path.reduce((obj, key) => obj[key], store as any)
      : store;
    
    // Check that each expected property exists and has the correct value
    Object.entries(expectedState).forEach(([key, value]) => {
      expect(stateToVerify).toHaveProperty(key);
      
      if (typeof value === 'object' && value !== null) {
        expect(stateToVerify[key]).toMatchObject(value);
      } else {
        expect(stateToVerify[key]).toBe(value);
      }
    });
  },

  /**
   * Test store selectors return the expected result
   */
  testStoreSelectors<T extends Record<string, any>, R>(
    store: T,
    selector: (state: T) => R,
    expectedResult: R
  ) {
    // Run the selector against the store
    const result = selector(store);
    
    // Verify the result matches expected
    if (typeof expectedResult === 'object' && expectedResult !== null) {
      expect(result).toMatchObject(expectedResult);
    } else {
      expect(result).toBe(expectedResult);
    }
  }
};

/**
 * Create a mock Response object for API testing
 */
function createTestResponse<T>(
  data: T, 
  status = 200, 
  headers: Record<string, string> = { 'Content-Type': 'application/json' }
): Response {
  const responseInit: ResponseInit = {
    status,
    headers: headers as any
  };
  
  const blob = new Blob([JSON.stringify({ data })], {
    type: 'application/json'
  });
  
  return new Response(blob, responseInit);
}

/**
 * Basic setup function for integration tests
 * 
 * @returns Object with setup utilities
 */
export const integrationSetup = () => {
  // Setup mock API responses
  const mockResponses = {
    user: {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      is_active: true
    },
    loginSuccess: createTestResponse({
      access: 'mock-access-token',
      refresh: 'mock-refresh-token',
      user: {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        is_active: true
      }
    })
  };
  
  return {
    mockResponses,
    
    /**
     * Setup a mock API response
     */
    setupMockApi: (mockFn: jest.Mock) => {
      // Here you would setup any mock API responses needed for tests
      mockFn.mockResolvedValue(mockResponses.loginSuccess);
      return mockFn;
    },
    
    /**
     * Reset mocks between tests
     */
    resetMocks: () => {
      localStorage.clear();
      jest.clearAllMocks();
    }
  };
};

/**
 * Renders a component with integrated testing utilities
 */
export function renderForIntegration(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const user = userEvent.setup();
  
  // Here you would add any providers needed for integration tests
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(React.Fragment, null, children);
  };
  
  const renderResult = render(ui, { wrapper: Wrapper, ...options });
  
  return {
    ...renderResult,
    user,
    
    /**
     * Fill out a form with provided values
     * 
     * @param values - Form field values by label
     */
    fillForm: async (values: Record<string, string>) => {
      for (const [label, value] of Object.entries(values)) {
        const input = screen.getByLabelText(new RegExp(label, 'i'));
        await user.clear(input);
        await user.type(input, value);
      }
    },
    
    /**
     * Submit a form by clicking a button
     * 
     * @param buttonText - Text of the submit button
     */
    submitForm: async (buttonText: string = 'submit') => {
      const submitButton = screen.getByRole('button', { name: new RegExp(buttonText, 'i') });
      await user.click(submitButton);
    }
  };
} 