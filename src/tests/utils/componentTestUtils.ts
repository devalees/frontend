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
import React, { ReactElement } from 'react';
import { create } from 'zustand';

type ComponentType<P> = React.ComponentType<P>;

/**
 * Custom render function that includes providers
 * @param ui - The React component to render
 * @param options - Render options
 * @returns Render result with providers
 */
export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  // Create a mock store for testing
  const useStore = create(() => ({
    rbac: {
      roles: [],
      permissions: [],
      userRoles: [],
      resources: [],
      resourceAccesses: [],
      organizationContexts: [],
      auditLogs: [],
      loading: false,
      error: null
    }
  }));

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return children;
  };

  return render(ui, { wrapper: Wrapper, ...options });
};

/**
 * Component test harness provides a unified way to test components
 * 
 * @param Component - The component to test
 * @param props - Component props
 * @returns Object with render result and utilities
 */
export const componentTestHarness = <P extends object>(
  Component: React.ComponentType<P>,
  props: P
) => {
  const element = React.createElement(Component, props);
  const renderResult = renderWithProviders(element);

  return {
    ...renderResult,
    // Add any additional utilities here
  };
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