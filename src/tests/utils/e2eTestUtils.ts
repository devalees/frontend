/**
 * End-to-End Test Utilities
 * 
 * This file contains utilities for end-to-end testing of the application.
 * It provides functions for testing user flows, page navigation,
 * and form submissions.
 */

import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

/**
 * User Flow Testing Utilities
 * Provides utilities for testing complete user flows
 */
export const userFlowTesting = {
  /**
   * Sets up a user flow test with initial state and mocks
   */
  setupUserFlowTest(
    initialComponent: React.ComponentType<any>,
    initialProps: Record<string, any> = {},
    options: {
      mocks?: Array<{ target: any; method: string; implementation: (...args: any[]) => any }>;
      stores?: Array<Record<string, any>>;
      routes?: Array<{ path: string; component: React.ComponentType<any> }>;
    } = {}
  ) {
    // Setup mocks
    const mocks = options.mocks?.map(({ target, method, implementation }) => {
      const mock = vi.spyOn(target, method).mockImplementation(implementation);
      return { target, method, mock };
    }) || [];
    
    // Setup render
    const renderResult = render(<initialComponent {...initialProps} />);
    
    return {
      ...renderResult,
      rerender: (Component: React.ComponentType<any>, props: Record<string, any> = {}) => {
        renderResult.rerender(<Component {...props} />);
      },
      cleanupMocks: () => {
        mocks.forEach(({ mock }) => mock.mockRestore());
      }
    };
  },

  /**
   * Simulates a complete user flow with multiple steps
   */
  async simulateUserFlow(
    steps: Array<{
      description: string;
      action: () => Promise<void> | void;
      assertion?: () => Promise<void> | void;
    }>
  ) {
    const results: Record<string, boolean> = {};
    
    for (const { description, action, assertion } of steps) {
      try {
        // Perform the action
        await act(async () => {
          await action();
        });
        
        // Perform the assertion if provided
        if (assertion) {
          await act(async () => {
            await assertion();
          });
        }
        
        results[description] = true;
      } catch (error) {
        results[description] = false;
        console.error(`Error in step: ${description}`, error);
        throw error;
      }
    }
    
    return results;
  },

  /**
   * Verifies the outcome of a user flow
   */
  verifyFlowOutcome(
    assertions: Array<() => void>,
    description: string = 'Flow outcome'
  ) {
    describe(description, () => {
      assertions.forEach((assertion, index) => {
        it(`should satisfy assertion #${index + 1}`, () => {
          assertion();
        });
      });
    });
  },

  /**
   * Tests error handling in user flows
   */
  testFlowErrors(
    errorStep: () => Promise<void> | void,
    expectedError: {
      message?: string;
      type?: string;
      handler: (error: Error) => void;
    },
    cleanup?: () => void
  ) {
    return async () => {
      const mockHandler = vi.fn(expectedError.handler);
      
      try {
        await act(async () => {
          try {
            await errorStep();
          } catch (error) {
            mockHandler(error as Error);
            throw error;
          }
        });
      } catch (error) {
        // Error was already handled by mockHandler
      } finally {
        if (cleanup) {
          cleanup();
        }
      }
      
      expect(mockHandler).toHaveBeenCalled();
      
      if (expectedError.message) {
        expect(mockHandler).toHaveBeenCalledWith(
          expect.objectContaining({ message: expectedError.message })
        );
      }
      
      if (expectedError.type) {
        expect(mockHandler).toHaveBeenCalledWith(
          expect.any(expectedError.type as any)
        );
      }
    };
  }
};

/**
 * Page Navigation Testing Utilities
 * Provides utilities for testing page navigation
 */
export const navigationTesting = {
  /**
   * Sets up a navigation test with mocked router
   */
  setupNavigationTest(
    initialRoute: string,
    routes: Record<string, React.ComponentType<any>>,
    router: {
      push: (path: string) => void;
      replace: (path: string) => void;
      back: () => void;
      pathname: string;
    }
  ) {
    // Mock router functions
    const mockPush = vi.fn(router.push);
    const mockReplace = vi.fn(router.replace);
    const mockBack = vi.fn(router.back);
    const currentPathname = { value: initialRoute };
    
    // Mock router object
    const mockRouter = {
      push: mockPush,
      replace: mockReplace,
      back: mockBack,
      get pathname() {
        return currentPathname.value;
      }
    };
    
    // Render initial component
    const Component = routes[initialRoute];
    const renderResult = render(<Component />);
    
    return {
      ...renderResult,
      router: mockRouter,
      navigate: (path: string) => {
        mockPush(path);
        currentPathname.value = path;
        if (routes[path]) {
          renderResult.rerender(React.createElement(routes[path]));
        }
      },
      getPath: () => currentPathname.value
    };
  },

  /**
   * Simulates navigation between pages
   */
  simulateNavigation(
    navigationSequence: Array<{
      action: 'push' | 'replace' | 'back';
      path?: string;
      trigger?: () => void;
    }>,
    context: ReturnType<typeof navigationTesting.setupNavigationTest>
  ) {
    return async () => {
      for (const { action, path, trigger } of navigationSequence) {
        if (trigger) {
          await act(async () => {
            trigger();
          });
        } else {
          await act(async () => {
            if (action === 'push' && path) {
              context.router.push(path);
              context.navigate(path);
            } else if (action === 'replace' && path) {
              context.router.replace(path);
              context.navigate(path);
            } else if (action === 'back') {
              context.router.back();
              // In a real test, we'd have to maintain a history stack
            }
          });
        }
      }
    };
  },

  /**
   * Verifies the current route after navigation
   */
  verifyCurrentRoute(
    context: ReturnType<typeof navigationTesting.setupNavigationTest>,
    expectedPath: string
  ) {
    expect(context.getPath()).toBe(expectedPath);
  },

  /**
   * Tests route parameters in navigation
   */
  testRouteParameters(
    path: string,
    params: Record<string, string>,
    paramsExtractor: (path: string) => Record<string, string>,
    assertions: (extractedParams: Record<string, string>) => void
  ) {
    // Construct path with parameters
    const pathWithParams = Object.entries(params).reduce(
      (p, [key, value]) => p.replace(`:${key}`, value),
      path
    );
    
    // Extract parameters using the provided function
    const extractedParams = paramsExtractor(pathWithParams);
    
    // Run assertions on extracted parameters
    assertions(extractedParams);
  }
};

/**
 * Form Submission Testing Utilities
 * Provides utilities for testing form submissions
 */
export const formTesting = {
  /**
   * Sets up a form test with initial values and submit handler
   */
  setupFormTest(
    FormComponent: React.ComponentType<any>,
    initialValues: Record<string, any> = {},
    onSubmit = vi.fn()
  ) {
    // Render form with submit handler
    const renderResult = render(
      <FormComponent 
        initialValues={initialValues} 
        onSubmit={onSubmit}
      />
    );
    
    return {
      ...renderResult,
      onSubmit,
      getSubmittedValues: () => {
        if (onSubmit.mock.calls.length > 0) {
          return onSubmit.mock.calls[0][0];
        }
        return null;
      }
    };
  },

  /**
   * Fills form fields with values
   */
  async fillFormFields(
    fields: Array<{
      name: string;
      value: string | boolean;
      type?: 'text' | 'select' | 'checkbox' | 'radio';
      testId?: string;
    }>
  ) {
    for (const { name, value, type = 'text', testId } of fields) {
      const fieldElement = testId 
        ? screen.getByTestId(testId)
        : screen.getByLabelText(name) || screen.getByRole('textbox', { name });
      
      await act(async () => {
        if (type === 'checkbox') {
          if ((value === true && !fieldElement.checked) || 
              (value === false && fieldElement.checked)) {
            await userEvent.click(fieldElement);
          }
        } else if (type === 'radio') {
          await userEvent.click(fieldElement);
        } else if (type === 'select') {
          await userEvent.selectOptions(fieldElement, value as string);
        } else {
          await userEvent.clear(fieldElement);
          await userEvent.type(fieldElement, value as string);
        }
      });
    }
  },

  /**
   * Simulates form submission
   */
  async simulateFormSubmission(
    submitMethod: 'button' | 'enter' | 'submitEvent' = 'button',
    formTestId?: string
  ) {
    await act(async () => {
      if (submitMethod === 'button') {
        const submitButton = screen.getByRole('button', { name: /submit/i });
        await userEvent.click(submitButton);
      } else if (submitMethod === 'enter') {
        await userEvent.keyboard('{Enter}');
      } else {
        const formElement = formTestId 
          ? screen.getByTestId(formTestId)
          : document.querySelector('form');
          
        if (formElement) {
          fireEvent.submit(formElement);
        } else {
          throw new Error('Form element not found');
        }
      }
    });
  },

  /**
   * Verifies form submission result
   */
  verifyFormSubmissionResult(
    context: ReturnType<typeof formTesting.setupFormTest>,
    expectedValues: Record<string, any>,
    extraAssertions?: (submitHandler: vi.Mock, formElement: HTMLElement) => void
  ) {
    // Verify submit was called
    expect(context.onSubmit).toHaveBeenCalled();
    
    // Get submitted values
    const submittedValues = context.getSubmittedValues();
    
    // Verify expected values were submitted
    Object.entries(expectedValues).forEach(([key, value]) => {
      expect(submittedValues).toHaveProperty(key, value);
    });
    
    // Run extra assertions if provided
    if (extraAssertions) {
      const formElement = context.container.querySelector('form') as HTMLElement;
      extraAssertions(context.onSubmit, formElement);
    }
  },

  /**
   * Tests form validation
   */
  testFormValidation(
    FormComponent: React.ComponentType<any>,
    invalidValues: Record<string, any>,
    validationErrors: Record<string, string>,
    options: {
      submitOnInvalidInput?: boolean;
      validateOnBlur?: boolean;
      validateOnChange?: boolean;
    } = {}
  ) {
    // Setup test
    const onSubmit = vi.fn();
    const { container } = render(
      <FormComponent onSubmit={onSubmit} />
    );
    
    return async () => {
      // Fill form with invalid values
      await formTesting.fillFormFields(
        Object.entries(invalidValues).map(([name, value]) => ({
          name,
          value: value as string | boolean
        }))
      );
      
      // Trigger validation
      if (options.validateOnBlur) {
        const lastField = container.querySelector('input:last-of-type, select:last-of-type, textarea:last-of-type');
        if (lastField) {
          fireEvent.blur(lastField);
        }
      }
      
      // Submit form if testing submission with invalid input
      if (options.submitOnInvalidInput) {
        await formTesting.simulateFormSubmission();
        
        // Verify form was not submitted
        expect(onSubmit).not.toHaveBeenCalled();
      }
      
      // Verify error messages are displayed
      for (const [field, errorMessage] of Object.entries(validationErrors)) {
        await waitFor(() => {
          const errorElement = container.querySelector(`[data-testid="error-${field}"], [data-error-for="${field}"]`);
          expect(errorElement).toBeInTheDocument();
          expect(errorElement).toHaveTextContent(errorMessage);
        });
      }
    };
  }
}; 