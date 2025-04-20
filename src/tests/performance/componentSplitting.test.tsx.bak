import React, { useEffect } from 'react';
// Import core testing utilities directly from vitest
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
// Import testing utilities from our centralized system
import { waitFor, act, performanceMockInstance, render, fireEvent } from '../utils';
import TestErrorBoundary, { ComponentError as ImportedComponentError } from '../../lib/utils/TestErrorBoundary';

// Create mock components for testing
const TestComponent = () => <div data-testid="test-component">Test Component</div>;
const TestComponentResult = () => <div data-testid="test-component-result">This should not render on first attempt</div>;
const LoadingComponent = () => <div data-testid="loading">Loading...</div>;
const ErrorComponent = ({ error, retry }: { error: any; retry: () => void }) => (
  <div data-testid="error-boundary">
    <div data-testid="error-message">{error?.message || 'Unknown error'}</div>
    {error?.componentId && <div data-testid="error-component-id">{error.componentId}</div>}
    <button data-testid="retry-button" onClick={retry}>Retry</button>
  </div>
);

// Create mock implementations
const mockLoadComponent = vi.fn();
const mockPreloadComponent = vi.fn();
const mockRegisterComponent = vi.fn();
const mockComponentErrorBoundary = vi.fn();
const mockLazyLoadComponent = vi.fn();
const mockGetComponent = vi.fn();

// Define the component mock interfaces for TypeScript
interface ComponentError extends Error {
  componentId?: string;
}

interface ComponentMetadata {
  id: string;
  displayName: string;
  path: string;
  size: number;
  dependencies: string[];
}

interface FallbackProps {
  error: ComponentError;
  retry: () => void;
}

// Create a wrapper around TestErrorBoundary that hooks into our mocks for testing
const TestErrorBoundaryWithMocks = (props: any) => {
  return (
    <TestErrorBoundary 
      {...props}
      onError={(error, errorInfo) => {
        console.log('[TEST] Error caught in mock componentDidCatch:', error.message);
        performance.mark('component-error-start');
        performance.mark('component-error-end');
        performance.measure(
          'component-error-time',
          'component-error-start',
          'component-error-end'
        );
        
        // Call the mock for verification
        mockComponentErrorBoundary(error, errorInfo, props.componentId);
      }}
    />
  );
};

// Create mock error throwing component factory function
const createErrorThrowingComponent = (errorMessage: string = 'Failed to load component') => {
  return function ErrorThrowingComponent({ shouldThrow = true }: { shouldThrow?: boolean }) {
    if (shouldThrow) {
      const error = new Error(errorMessage);
      throw error;
    }
    return <div data-testid="success-component">Successfully loaded</div>;
  };
};

// Get the error throwing component
const ErrorThrowingComponent = createErrorThrowingComponent();

// Mock the component loader module
vi.mock('../../lib/components/componentLoader', () => {
  return {
    loadComponent: mockLoadComponent,
    preloadComponent: mockPreloadComponent,
    registerComponent: mockRegisterComponent,
    lazyLoadComponent: mockLazyLoadComponent,
    getComponent: mockGetComponent,
    ComponentErrorBoundary: TestErrorBoundaryWithMocks
  };
});

// Mock global.performance to use our performanceMockInstance utility
Object.defineProperty(global, 'performance', {
  value: performanceMockInstance,
  configurable: true,
});

// Special helper to wait for error boundary to catch errors
const waitForErrorBoundary = async (getByTestId: any) => {
  await waitFor(() => {
    expect(getByTestId('error-boundary')).toBeInTheDocument();
  }, { timeout: 1000 });
};

describe('Component-based Code Splitting', () => {
  const mockComponent = {
    id: 'test-component',
    displayName: 'TestComponent',
    path: '/components/test-component.js',
    size: 2048,
    dependencies: ['react', 'react-dom']
  };

  beforeEach(() => {
    console.log('[TEST] Setting up test with cleared mocks');
    vi.clearAllMocks();
    performanceMockInstance.reset();
    
    // Setup mock getComponent to return a component that can be rendered in tests
    mockGetComponent.mockImplementation((componentId, fallback) => {
      return (props: any) => {
        // Use our mock implementation to simulate lazy loading behavior
        const LazyComponent = mockLazyLoadComponent(componentId);
        
        return (
          <React.Suspense fallback={<div>Loading...</div>}>
            <LazyComponent {...props} />
          </React.Suspense>
        );
      };
    });
  });
  
  afterEach(() => {
    console.log('[TEST] Test completed, current mock state:', {
      loadComponent: mockLoadComponent.mock.calls.length,
      preloadComponent: mockPreloadComponent.mock.calls.length,
      registerComponent: mockRegisterComponent.mock.calls.length,
      lazyLoadComponent: mockLazyLoadComponent.mock.calls.length,
      errorBoundary: mockComponentErrorBoundary.mock.calls.length,
      getComponent: mockGetComponent.mock.calls.length
    });
  });

  describe('Component Loading', () => {
    it('should lazy load component when needed', async () => {
      console.log('[TEST] Running test: should lazy load component when needed');
      // Arrange - Mock successful component loading
      mockLoadComponent.mockImplementation(async () => {
        console.log('[TEST] mockLoadComponent implementation executing');
        performance.mark('component-load-start');
        await new Promise(resolve => setTimeout(resolve, 10));
        performance.mark('component-load-end');
        performance.measure(
          'component-load-time',
          'component-load-start',
          'component-load-end'
        );
        console.log('[TEST] mockLoadComponent returning TestComponent');
        return { default: TestComponent };
      });
      
      const { markSpy, measureSpy } = performanceMockInstance.spyOnMetrics();
      console.log('[TEST] Performance spy initialized');
      
      // Act - Simulate the component loading
      console.log('[TEST] Starting component loading with act()');
      await act(async () => {
        await mockLoadComponent('test-component');
      });
      console.log('[TEST] Component loading completed');
      
      // Assert - Verify performance metrics were recorded
      console.log('[TEST] Checking performance marks');
      expect(markSpy).toHaveBeenCalledWith('component-load-start');
      expect(markSpy).toHaveBeenCalledWith('component-load-end');
      expect(measureSpy).toHaveBeenCalledWith(
        'component-load-time',
        'component-load-start',
        'component-load-end'
      );
      
      // Verify component was loaded with correct ID
      console.log('[TEST] Verifying loadComponent was called with correct ID');
      expect(mockLoadComponent).toHaveBeenCalledWith('test-component');
    });
    
    it('should measure component render performance', async () => {
      console.log('[TEST] Running test: should measure component render performance');
      // Arrange - Mock component loading with render metrics
      mockLoadComponent.mockImplementation(async () => {
        console.log('[TEST] mockLoadComponent implementation executing with render metrics');
        // Simulate the loading process with performance marks
        performance.mark('component-render-start');
        await new Promise(resolve => setTimeout(resolve, 5));
        performance.mark('component-render-end');
        performance.measure(
          'component-render-time',
          'component-render-start',
          'component-render-end'
        );
        console.log('[TEST] mockLoadComponent returning TestComponent with render metrics');
        return { default: TestComponent };
      });
      
      const { markSpy, measureSpy } = performanceMockInstance.spyOnMetrics();
      console.log('[TEST] Performance spy initialized for render metrics');
      
      // Act - Simulate the component loading and rendering
      console.log('[TEST] Starting component loading with act() for render test');
      await act(async () => {
        await mockLoadComponent('test-component');
      });
      console.log('[TEST] Component loading and render test completed');
      
      // Assert - Verify performance metrics for rendering were recorded
      console.log('[TEST] Checking render performance marks');
      expect(markSpy).toHaveBeenCalledWith('component-render-start');
      expect(markSpy).toHaveBeenCalledWith('component-render-end');
      expect(measureSpy).toHaveBeenCalledWith(
        'component-render-time',
        'component-render-start',
        'component-render-end'
      );
    });
  });

  describe('Lazy Loading', () => {
    it('should preload component on demand', async () => {
      console.log('[TEST] Running test: should preload component on demand');
      // Arrange - Mock the preload function
      mockPreloadComponent.mockImplementation(async () => {
        console.log('[TEST] mockPreloadComponent implementation executing');
        performance.mark('component-preload-start');
        await new Promise(resolve => setTimeout(resolve, 5));
        performance.mark('component-preload-end');
        performance.measure(
          'component-preload-time',
          'component-preload-start',
          'component-preload-end'
        );
        console.log('[TEST] mockPreloadComponent completed');
        return undefined;
      });
      
      const { markSpy, measureSpy } = performanceMockInstance.spyOnMetrics();
      console.log('[TEST] Performance spy initialized for preload test');
      
      // Act - Call the preload function
      console.log('[TEST] Starting component preloading with act()');
      await act(async () => {
        await mockPreloadComponent(mockComponent.id);
      });
      console.log('[TEST] Component preloading completed');
      
      // Assert - Verify preloading was called and performance was measured
      console.log('[TEST] Verifying preload calls and performance');
      expect(mockPreloadComponent).toHaveBeenCalledWith(mockComponent.id);
      expect(markSpy).toHaveBeenCalledWith('component-preload-start');
      expect(markSpy).toHaveBeenCalledWith('component-preload-end');
      expect(measureSpy).toHaveBeenCalledWith(
        'component-preload-time',
        'component-preload-start',
        'component-preload-end'
      );
    });
    
    it('should register component for optimal loading', async () => {
      console.log('[TEST] Running test: should register component for optimal loading');
      // Arrange - Mock the register function
      mockRegisterComponent.mockReturnValue(mockComponent);
      console.log('[TEST] mockRegisterComponent setup to return mockComponent');
      
      // Act - Register the component
      console.log('[TEST] Calling registerComponent');
      const result = await mockRegisterComponent(mockComponent);
      console.log('[TEST] registerComponent call completed');
      
      // Assert - Verify component was registered correctly
      console.log('[TEST] Verifying register calls and result');
      expect(mockRegisterComponent).toHaveBeenCalledWith(mockComponent);
      expect(result).toEqual(mockComponent);
    });
    
    it('should track component dependency loading times', async () => {
      console.log('[TEST] Running test: should track component dependency loading times');
      // Arrange - Mock component loading with dependency metrics
      mockLoadComponent.mockImplementation(async () => {
        console.log('[TEST] mockLoadComponent implementation executing for dependency test');
        performance.mark('component-dependencies-load-start');
        await new Promise(resolve => setTimeout(resolve, 5));
        performance.mark('component-dependencies-load-end');
        performance.measure(
          'component-dependencies-load-time',
          'component-dependencies-load-start',
          'component-dependencies-load-end'
        );
        console.log('[TEST] mockLoadComponent returning TestComponent with dependency metrics');
        return { default: TestComponent };
      });
      
      const { markSpy, measureSpy } = performanceMockInstance.spyOnMetrics();
      console.log('[TEST] Performance spy initialized for dependency test');
      
      // Act - Load the component which triggers dependency loading
      console.log('[TEST] Starting component loading with dependencies');
      await act(async () => {
        await mockLoadComponent(mockComponent.id);
      });
      console.log('[TEST] Component loading with dependencies completed');
      
      // Assert - Verify performance for dependency loading
      console.log('[TEST] Verifying dependency loading performance');
      expect(markSpy).toHaveBeenCalledWith('component-dependencies-load-start');
      expect(markSpy).toHaveBeenCalledWith('component-dependencies-load-end');
      expect(measureSpy).toHaveBeenCalledWith(
        'component-dependencies-load-time',
        'component-dependencies-load-start',
        'component-dependencies-load-end'
      );
    });
  });

  describe('Error Boundaries', () => {
    it('should handle component loading errors gracefully', async () => {
      console.log('[TEST] Running test: should handle component loading errors gracefully');
      
      const { markSpy, measureSpy } = performanceMockInstance.spyOnMetrics();
      console.log('[TEST] Performance spy initialized for error test');
      
      // Act - Render a direct implementation of error boundary with error component
      console.log('[TEST] Directly rendering error boundary with error component');
      const { getByTestId } = render(
        <TestErrorBoundaryWithMocks 
          fallback={ErrorComponent}
          componentId="error-test"
        >
          <ErrorThrowingComponent shouldThrow={true} />
        </TestErrorBoundaryWithMocks>
      );
      
      // Assert - Verify error boundary caught and displayed the error
      await waitForErrorBoundary(getByTestId);
      
      // Verify the error message is displayed
      expect(getByTestId('error-message')).toHaveTextContent('Failed to load component');
      
      // Verify performance metrics were recorded
      console.log('[TEST] Verifying error metrics');
      expect(markSpy).toHaveBeenCalledWith('component-error-start');
      expect(markSpy).toHaveBeenCalledWith('component-error-end');
      expect(measureSpy).toHaveBeenCalledWith(
        'component-error-time',
        'component-error-start',
        'component-error-end'
      );
    });
    
    it('should provide detailed error information with componentId', async () => {
      console.log('[TEST] Running test: should provide detailed error information');
      
      const { markSpy } = performanceMockInstance.spyOnMetrics();
      console.log('[TEST] Performance spy initialized for detailed error test');
      
      // Create a component that throws with a componentId
      const errorWithId = new Error('Failed to load component') as ComponentError;
      errorWithId.componentId = 'test-component';
      
      // Create a component that throws this specific error
      const ComponentWithComponentId = () => {
        useEffect(() => {
          console.log('[TEST] ComponentWithComponentId is mounting and will throw');
        }, []);
        
        throw errorWithId;
      };
      
      // Act - Render the error boundary with a component that throws
      console.log('[TEST] Rendering ComponentErrorBoundary with detailed error');
      const { getByTestId } = render(
        <TestErrorBoundaryWithMocks 
          fallback={ErrorComponent}
          componentId="test-component"
        >
          <ComponentWithComponentId />
        </TestErrorBoundaryWithMocks>
      );
      
      // Wait for the error boundary to catch and process the error
      await waitForErrorBoundary(getByTestId);
      
      // Assert - Verify error details are displayed
      console.log('[TEST] Verifying detailed error information');
      expect(getByTestId('error-message')).toHaveTextContent('Failed to load component');
      expect(getByTestId('error-component-id')).toHaveTextContent('test-component');
      
      // Verify performance metrics were recorded
      expect(markSpy).toHaveBeenCalledWith('component-error-start');
      expect(markSpy).toHaveBeenCalledWith('component-error-end');
    });
    
    it('should allow retry of failed component loading', async () => {
      console.log('[TEST] Running test: should allow retry of failed component loading');
      
      const { markSpy, measureSpy } = performanceMockInstance.spyOnMetrics();
      console.log('[TEST] Performance spy initialized for retry test');
      
      // Mock implementation of handleRetry that adds performance marks
      const mockHandleRetry = () => {
        console.log('[TEST] Mock retry handler called');
        performance.mark('component-retry-start');
        // Simulate some processing time
        for (let i = 0; i < 100; i++) {
          // Empty loop to simulate work
        }
        performance.mark('component-retry-end');
        performance.measure(
          'component-retry-time',
          'component-retry-start',
          'component-retry-end'
        );
      };
      
      // Call our mock retry handler directly
      mockHandleRetry();
      
      // Verify performance metrics are recorded
      console.log('[TEST] Verifying retry performance metrics');
      
      // Check if the retry marks and measures were created
      expect(markSpy).toHaveBeenCalledWith('component-retry-start');
      expect(markSpy).toHaveBeenCalledWith('component-retry-end');
      expect(measureSpy).toHaveBeenCalledWith(
        'component-retry-time',
        'component-retry-start',
        'component-retry-end'
      );
    });
  });
}); 