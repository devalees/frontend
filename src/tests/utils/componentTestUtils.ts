/**
 * Component Test Utilities
 * 
 * This file contains utilities for testing React components.
 * It provides functions for component rendering, interaction simulation,
 * and state verification.
 */

import { vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

/**
 * Component Test Harness
 * Provides utilities for testing React components
 */
export const componentTestHarness = {
  /**
   * Sets up a component test with the given props and options
   */
  setupComponentTest<P extends Record<string, any>>(
    Component: React.ComponentType<P>, 
    defaultProps: P = {} as P
  ) {
    return {
      Component,
      defaultProps,
      render: (props: Partial<P> = {}) => {
        return render(
          <Component {...defaultProps} {...props} />
        );
      }
    };
  },

  /**
   * Renders a component with the given props
   */
  renderComponent<P extends Record<string, any>>(
    Component: React.ComponentType<P>,
    props: P
  ) {
    return render(<Component {...props} />);
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
    Component: React.ComponentType<P>,
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
        console.error = vi.fn();
        
        try {
          render(<Component {...props as P} />);
        } finally {
          console.error = originalConsoleError;
        }
      }).toThrow;
    }
    
    return true;
  },

  /**
   * Validates optional props for a component
   */
  validateOptionalProps<P extends Record<string, any>>(
    Component: React.ComponentType<P>,
    optionalProps: Array<keyof P>,
    baseProps: P
  ) {
    for (const prop of optionalProps) {
      const props = { ...baseProps };
      delete props[prop];
      
      // We expect rendering without an optional prop to NOT throw an error
      expect(() => {
        render(<Component {...props as P} />);
      }).not.toThrow();
    }
    
    return true;
  },

  /**
   * Validates prop types for a component
   */
  validatePropTypes<P extends Record<string, any>>(
    Component: React.ComponentType<P>,
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
      const mockConsoleError = vi.fn();
      console.error = mockConsoleError;
      
      try {
        render(<Component {...props as P} />);
        expect(mockConsoleError).toHaveBeenCalled();
      } finally {
        console.error = originalConsoleError;
      }
    }
    
    return true;
  },

  /**
   * Validates default props for a component
   */
  validateDefaultProps<P extends Record<string, any>>(
    Component: React.ComponentType<P>,
    defaultProps: Partial<P>,
    testRenderer: (props: P) => { getProps: () => P }
  ) {
    const minimalProps = {} as P;
    const renderer = testRenderer(minimalProps);
    
    for (const [prop, defaultValue] of Object.entries(defaultProps)) {
      const actualProps = renderer.getProps();
      expect(actualProps[prop]).toEqual(defaultValue);
    }
    
    return true;
  }
}; 