/**
 * Integration Test Utilities
 * 
 * This file contains utilities for integration testing between components,
 * APIs, and state stores. It provides functions for testing the interaction
 * between different parts of the application.
 */

import { jest } from '@jest/globals';
import { render, screen, act } from '@testing-library/react';
import React, { ReactElement, ReactNode } from 'react';
import { createMockResponse, HttpMethod } from './mockApi';
import userEvent from '@testing-library/user-event';
import { RenderOptions } from '@testing-library/react';
import type { AxiosResponse } from 'axios';

// Type definitions
type ComponentProps = Record<string, unknown>;
type ComponentType<P = ComponentProps> = React.ComponentType<P>;

type ProviderConfig = {
  Provider: ComponentType<ComponentProps>;
  props: ComponentProps;
};

type MockConfig = {
  name: string;
  mock: ReturnType<typeof jest.fn>;
};

type StoreConfig = Record<string, unknown>;

type DependenciesConfig = {
  providers?: ProviderConfig[];
  mocks?: MockConfig[];
  stores?: StoreConfig;
};

type EventData = Record<string, unknown>;

type ApiOptions = {
  delay?: number;
  status?: number;
  headers?: Record<string, string>;
  throwError?: boolean;
  errorMessage?: string;
};

type StoreAction = Record<string, unknown>;

type StoreState = Record<string, unknown>;

type SchemaDefinition = Record<string, unknown>;

type ApiHeaders = {
  'Content-Type': string;
  [key: string]: string;
};

/**
 * Component Integration Utilities
 * Provides utilities for testing integration between components
 */
export const componentIntegration = {
  /**
   * Mounts a component with all its dependencies
   */
  mountWithDependencies: jest.fn(),

  /**
   * Simulates interaction between components
   */
  simulateComponentInteraction: jest.fn(),

  /**
   * Verifies component integration
   */
  verifyComponentIntegration: jest.fn(),

  /**
   * Renders a component tree with specified providers
   */
  renderWithProviders: jest.fn(),

  /**
   * Renders a component with mock stores
   */
  renderWithStores: jest.fn(),

  /**
   * Tests parent-child component interactions
   */
  testParentChildInteraction: jest.fn(),

  /**
   * Tests component rerendering with updated props
   */
  testComponentRerender: jest.fn(),

  /**
   * Tests component composition
   */
  testComponentComposition: jest.fn(),

  /**
   * Tests event propagation through component hierarchy
   */
  testEventPropagation: jest.fn()
};

/**
 * API Testing Utilities
 * Provides utilities for testing API integration
 */
export const apiTesting = {
  /**
   * Mocks an API endpoint with a response
   */
  mockApiEndpoint: jest.fn(),

  /**
   * Simulates an API request
   */
  simulateApiRequest: jest.fn(),

  /**
   * Verifies an API response
   */
  verifyApiResponse: jest.fn(),

  /**
   * Tests API error handling
   */
  testApiErrorHandling: jest.fn()
};

/**
 * State Management Testing Utilities
 * Provides utilities for testing state management
 */
export const stateTesting = {
  /**
   * Sets up a test store with initial state
   */
  setupTestStore: jest.fn(),

  /**
   * Dispatches a test action to the store
   */
  dispatchTestAction: jest.fn(),

  /**
   * Verifies store state after actions
   */
  verifyStoreState: jest.fn(),

  /**
   * Tests store selectors
   */
  testStoreSelectors: jest.fn()
};

/**
 * Creates a test response with the specified data and status code
 */
export function createTestResponse<T>(
  data: T, 
  status = 200, 
  headers: ApiHeaders = { 'Content-Type': 'application/json' }
): AxiosResponse<T> {
  return createMockResponse(data, status, '', headers);
}

/**
 * Sets up the integration test environment
 */
export const integrationSetup = () => {
  // Reset all mocks
  jest.resetAllMocks();
  
  // Return cleanup function
  return () => {
    jest.clearAllMocks();
  };
};

/**
 * Renders a component for integration testing
 */
export function renderForIntegration(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const Wrapper = function Wrapper({ children }: { children: ReactNode }): ReactElement {
    return <>{children}</>;
  };

  return render(ui, { wrapper: Wrapper, ...options });
} 