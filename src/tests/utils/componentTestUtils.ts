/**
 * Component Test Utilities
 * 
 * This file contains utilities for testing React components.
 * It provides functions for component rendering, interaction simulation,
 * and state verification.
 */

import { jest } from '@jest/globals';
import { render, screen, fireEvent, act, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

type ComponentType<P> = React.ComponentType<P>;

/**
 * Custom render function with provider wrappers
 * 
 * @param ui - The component to render
 * @param options - Render options
 * @returns The rendered component with additional helpers
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  // Here you would add your providers if needed
  const AllProviders = ({ children }: { children: React.ReactNode }) => {
    return (
      React.createElement(React.Fragment, null, children)
    );
  };
  
  return render(ui, { wrapper: AllProviders, ...options });
}

/**
 * Component test harness provides a unified way to test components
 * 
 * @param Component - The component to test
 * @param defaultProps - Default props for the component
 * @returns Object with test utilities
 */
export function componentTestHarness<Props>(
  Component: React.ComponentType<Props>,
  defaultProps: Props
) {
  return {
    /**
     * Render the component with custom props
     */
    render: (customProps?: Partial<Props>) => {
      const props = { ...defaultProps, ...customProps } as Props;
      return renderWithProviders(React.createElement(Component, props));
    },
    
    /**
     * Get component with props for snapshot testing
     */
    getComponent: (customProps?: Partial<Props>) => {
      const props = { ...defaultProps, ...customProps } as Props;
      return React.createElement(Component, props);
    }
  };
}

/**
 * Props validation tester
 * 
 * @param Component - The component to test
 * @param validProps - Valid props for the component
 * @returns Object with test utilities for prop validation
 */
export function propsValidation<Props>(
  Component: React.ComponentType<Props>,
  validProps: Props
) {
  return {
    /**
     * Test if the component renders without errors with valid props
     */
    testValidProps: () => {
      const result = renderWithProviders(React.createElement(Component, validProps));
      return result;
    },
    
    /**
     * Test if the component handles missing required props as expected
     * 
     * @param requiredPropName - Name of the required prop to omit
     */
    testMissingRequiredProp: (requiredPropName: keyof Props) => {
      // Create a copy of validProps without the specified required prop
      const { [requiredPropName]: _, ...propsWithoutRequired } = validProps as any;
      
      // This should produce a console error for required props
      const renderWithMissingProp = () => {
        renderWithProviders(React.createElement(Component, propsWithoutRequired as Props));
      };
      
      return renderWithMissingProp;
    }
  };
}

/**
 * Component Test Harness
 * Provides utilities for testing React components
 */
export const componentTestHarness = {
  /**
   * Sets up a component test with the given props and options
   */
  setupComponentTest<P extends Record<string, any>>(
    Component: ComponentType<P>, 
    defaultProps: P = {} as P
  ) {
    return {
      Component,
      defaultProps,
      render: (props: Partial<P> = {}) => {
        const allProps = { ...defaultProps, ...props } as P;
        return render(React.createElement(Component, allProps));
      }
    };
  },

  /**
   * Renders a component with the given props
   */
  renderComponent<P extends Record<string, any>>(
    Component: ComponentType<P>,
    props: P
  ) {
    return render(React.createElement(Component, props));
  },

  /**
   * Simulates user interactions with a component
   */
  simulateUserInteraction: {
    click: async (element: HTMLElement) => {
      await userEvent.click(element);
    },
    type: async (element: HTMLElement, text: string) => {
      await userEvent.type(element, text);
    },
    selectOption: async (element: HTMLElement, value: string) => {
      await userEvent.selectOptions(element, value);
    },
    clear: async (element: HTMLElement) => {
      await userEvent.clear(element);
    },
    hover: async (element: HTMLElement) => {
      await userEvent.hover(element);
    },
    pressKey: async (key: string) => {
      await userEvent.keyboard(key);
    }
  },

  /**
   * Verifies component state after interactions
   */
  verifyComponentState: {
    exists: (testId: string) => {
      return expect(screen.queryByTestId(testId)).toBeInTheDocument();
    },
    notExists: (testId: string) => {
      return expect(screen.queryByTestId(testId)).not.toBeInTheDocument();
    },
    hasText: (testId: string, text: string) => {
      return expect(screen.getByTestId(testId)).toHaveTextContent(text);
    },
    hasClass: (testId: string, className: string) => {
      return expect(screen.getByTestId(testId)).toHaveClass(className);
    },
    isDisabled: (testId: string) => {
      return expect(screen.getByTestId(testId)).toBeDisabled();
    },
    isEnabled: (testId: string) => {
      return expect(screen.getByTestId(testId)).toBeEnabled();
    },
    isFocused: (testId: string) => {
      return expect(screen.getByTestId(testId)).toHaveFocus();
    },
    hasAttribute: (testId: string, attr: string, value?: string) => {
      const element = screen.getByTestId(testId);
      if (value) {
        return expect(element).toHaveAttribute(attr, value);
      }
      return expect(element).toHaveAttribute(attr);
    }
  }
};

/**
 * Props Validation Utilities
 * Provides utilities for validating component props
 */
export const propsValidation = {
  /**
   * Validates required props for a component
   */
  validateRequiredProps<P extends Record<string, any>>(
    Component: ComponentType<P>,
    requiredProps: Array<keyof P>,
    baseProps: P
  ) {
    for (const prop of requiredProps) {
      const props = { ...baseProps };
      delete props[prop];
      
      // We expect rendering without a required prop to throw an error
      // in strict development mode with prop-types
      expect(() => {
        const originalConsoleError = console.error;
        console.error = jest.fn();
        
        try {
          render(React.createElement(Component, props as P));
        } finally {
          console.error = originalConsoleError;
        }
      }).toThrow();
    }
    
    return true;
  },

  /**
   * Validates optional props for a component
   */
  validateOptionalProps<P extends Record<string, any>>(
    Component: ComponentType<P>,
    optionalProps: Array<keyof P>,
    baseProps: P
  ) {
    for (const prop of optionalProps) {
      const props = { ...baseProps };
      delete props[prop];
      
      // We expect rendering without an optional prop to NOT throw an error
      expect(() => {
        render(React.createElement(Component, props as P));
      }).not.toThrow();
    }
    
    return true;
  },

  /**
   * Validates prop types for a component
   */
  validatePropTypes<P extends Record<string, any>>(
    Component: ComponentType<P>,
    propTypes: Record<keyof P, any>,
    baseProps: P
  ) {
    for (const [prop, type] of Object.entries(propTypes)) {
      const props = { ...baseProps };
      
      // Set invalid type for the prop
      switch (type) {
        case 'string':
          (props as any)[prop] = 123; // Not a string
          break;
        case 'number':
          (props as any)[prop] = 'not a number'; // Not a number
          break;
        case 'boolean':
          (props as any)[prop] = 'not a boolean'; // Not a boolean
          break;
        case 'object':
          (props as any)[prop] = 'not an object'; // Not an object
          break;
        case 'array':
          (props as any)[prop] = 'not an array'; // Not an array
          break;
        case 'function':
          (props as any)[prop] = 'not a function'; // Not a function
          break;
        default:
          continue;
      }
      
      // We expect console.error to be called for invalid prop types
      const originalConsoleError = console.error;
      const mockConsoleError = jest.fn();
      console.error = mockConsoleError;
      
      try {
        render(React.createElement(Component, props as P));
      } finally {
        console.error = originalConsoleError;
      }
      
      // In development mode, React should report prop type errors
      expect(mockConsoleError).toHaveBeenCalled();
    }
    
    return true;
  },

  /**
   * Validates default props for a component
   */
  validateDefaultProps<P extends Record<string, any>>(
    Component: ComponentType<P>,
    defaultProps: Partial<P>,
    testRenderer: (props: P) => { getProps: () => P }
  ) {
    // Call the test renderer with minimal props
    const minimalProps = {} as P;
    const renderer = testRenderer(minimalProps);
    
    // Get the props that were actually used
    const actualProps = renderer.getProps();
    
    // Check that default props were applied
    for (const [key, value] of Object.entries(defaultProps)) {
      expect(actualProps[key]).toEqual(value);
    }
    
    return true;
  }
}; 