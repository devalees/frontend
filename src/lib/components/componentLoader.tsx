import React, { Component, ErrorInfo, ReactNode, Suspense, useEffect, ComponentType } from 'react';

/**
 * Component metadata interface
 */
export interface ComponentMetadata {
  id: string;
  displayName: string;
  path: string;
  size: number;
  dependencies: string[];
}

/**
 * Error interface for component loading errors
 */
export interface ComponentError extends Error {
  componentId?: string;
}

/**
 * Props for fallback components
 */
export interface FallbackProps {
  error: ComponentError;
  retry: () => void;
}

// Type for render function
type RenderFallbackFn = (error: ComponentError, retry: () => void) => ReactNode;

/**
 * Props for the error boundary component
 */
export interface ComponentErrorBoundaryProps {
  children: ReactNode;
  fallback: ComponentType<FallbackProps> | RenderFallbackFn;
  componentId?: string;
}

/**
 * State for the error boundary component
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: ComponentError | null;
}

// Global component registry to store available components
const componentRegistry = new Map<string, ComponentMetadata>();

// Cache for preloaded components
const preloadCache = new Map<string, Promise<any>>();

/**
 * Error boundary component for handling component loading errors
 */
export class ComponentErrorBoundary extends Component<ComponentErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ComponentErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const componentError: ComponentError = error;
    
    return {
      hasError: true,
      error: componentError
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to performance monitoring
    performance.mark('component-error-start');
    console.error('Component loading error:', error, errorInfo);
    
    // Add component ID to error if provided
    if (this.props.componentId && this.state.error) {
      this.state.error.componentId = this.props.componentId;
    }
    
    performance.mark('component-error-end');
    performance.measure(
      'component-error-time',
      'component-error-start',
      'component-error-end'
    );
  }

  handleRetry = (): void => {
    performance.mark('component-retry-start');
    this.setState({ hasError: false, error: null });
    performance.mark('component-retry-end');
    performance.measure(
      'component-retry-time',
      'component-retry-start',
      'component-retry-end'
    );
  };

  render(): ReactNode {
    const { fallback, children } = this.props;
    
    if (this.state.hasError && this.state.error) {
      const errorProps: FallbackProps = {
        error: this.state.error,
        retry: this.handleRetry
      };
      
      // Check if it's a render function or a component
      if (this.isRenderFunction(fallback)) {
        // It's a render function
        return fallback(this.state.error, this.handleRetry);
      }
      
      // It's a component
      return React.createElement(fallback, errorProps);
    }
    
    return children;
  }
  
  // Type guard to check if fallback is a render function
  private isRenderFunction(fallback: ComponentType<FallbackProps> | RenderFallbackFn): fallback is RenderFallbackFn {
    return fallback.length >= 2;
  }
}

/**
 * Get the import path for a component
 * @param componentId - ID of the component to get the path for
 * @returns The import path for the component
 */
function getComponentPath(componentId: string): string {
  const component = componentRegistry.get(componentId);
  
  if (!component) {
    throw new Error(`Component with ID "${componentId}" not found in registry`);
  }
  
  return component.path;
}

/**
 * Load a component's dependencies
 * @param componentId - ID of the component to load dependencies for
 * @returns Promise that resolves when dependencies are loaded
 */
async function loadDependencies(componentId: string): Promise<void> {
  const component = componentRegistry.get(componentId);
  
  if (!component || !component.dependencies || component.dependencies.length === 0) {
    return;
  }
  
  // In a real implementation, this would load any required dependencies
  // For now, we'll just simulate a delay
  await new Promise(resolve => setTimeout(resolve, 10));
}

/**
 * Load a component by ID
 * @param componentId - ID of the component to load
 * @returns Promise that resolves to the component
 */
export async function loadComponent(componentId: string): Promise<{ default: React.ComponentType<any> }> {
  performance.mark('component-load-start');
  
  try {
    // First load dependencies
    performance.mark('component-dependencies-load-start');
    await loadDependencies(componentId);
    performance.mark('component-dependencies-load-end');
    performance.measure(
      'component-dependencies-load-time',
      'component-dependencies-load-start',
      'component-dependencies-load-end'
    );
    
    // Get the path to the component module
    const componentPath = getComponentPath(componentId);
    
    // Dynamically import the component
    // In a real implementation, this would be:
    // const component = await import(componentPath);
    // For testing purposes, we'll simulate the import
    const component = await simulateDynamicImport(componentPath);
    
    // After component is loaded, we measure the render time
    performance.mark('component-render-start');
    
    // In a real app, the component would be rendered here
    // We'll just simulate a delay to represent rendering time
    await new Promise(resolve => setTimeout(resolve, 5));
    
    performance.mark('component-render-end');
    performance.measure(
      'component-render-time',
      'component-render-start',
      'component-render-end'
    );
    
    return component;
  } finally {
    performance.mark('component-load-end');
    performance.measure(
      'component-load-time',
      'component-load-start',
      'component-load-end'
    );
  }
}

/**
 * Simulate a dynamic import for testing
 * @param path - Path to the component module
 * @returns Promise that resolves to the component
 */
async function simulateDynamicImport(path: string): Promise<{ default: React.ComponentType<any> }> {
  // Check if we should throw an error (useful for testing error boundaries)
  if (path.includes('error')) {
    throw new Error('Failed to load component');
  }
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 50));
  
  // Return a simple component
  return {
    default: (props: any) => (
      <div data-testid="test-component">
        {props.children || 'Loaded Component'}
      </div>
    )
  };
}

/**
 * Preload a component by ID
 * @param componentId - ID of the component to preload
 * @returns Promise that resolves when preloading is complete
 */
export async function preloadComponent(componentId: string): Promise<void> {
  performance.mark('component-preload-start');
  
  try {
    // Check if component is already in preload cache
    if (preloadCache.has(componentId)) {
      return;
    }
    
    // Get the component path
    const componentPath = getComponentPath(componentId);
    
    // Start preloading by creating a promise that loads the component
    const preloadPromise = loadComponent(componentId);
    
    // Store in cache
    preloadCache.set(componentId, preloadPromise);
    
    // Start loading dependencies in background
    performance.mark('component-dependencies-preload-start');
    await loadDependencies(componentId);
    performance.mark('component-dependencies-preload-end');
    performance.measure(
      'component-dependencies-preload-time',
      'component-dependencies-preload-start',
      'component-dependencies-preload-end'
    );
  } finally {
    performance.mark('component-preload-end');
    performance.measure(
      'component-preload-time',
      'component-preload-start',
      'component-preload-end'
    );
  }
}

/**
 * Register a component in the registry
 * @param component - Component metadata to register
 * @returns The registered component metadata
 */
export function registerComponent(component: ComponentMetadata): ComponentMetadata {
  performance.mark('component-register-start');
  
  // Store the component in registry
  componentRegistry.set(component.id, component);
  
  performance.mark('component-register-end');
  performance.measure(
    'component-register-time',
    'component-register-start',
    'component-register-end'
  );
  
  return component;
}

/**
 * Create a lazy-loaded component
 * @param componentId - ID of the component to lazy load
 * @returns React lazy component
 */
export function lazyLoadComponent(componentId: string): React.LazyExoticComponent<React.ComponentType<any>> {
  performance.mark('component-lazy-load-init-start');
  
  // Create a lazy component that loads the actual component when rendered
  const LazyComponent = React.lazy(async () => {
    // If component was preloaded, use that promise
    if (preloadCache.has(componentId)) {
      return preloadCache.get(componentId) as Promise<{ default: React.ComponentType<any> }>;
    }
    
    // Otherwise load it normally
    return loadComponent(componentId);
  });
  
  performance.mark('component-lazy-load-init-end');
  performance.measure(
    'component-lazy-load-init-time',
    'component-lazy-load-init-start',
    'component-lazy-load-init-end'
  );
  
  return LazyComponent;
}

/**
 * Get a component with loading, error handling, and performance tracking
 * @param componentId - ID of the component to get
 * @param fallback - Fallback component or render function to show on error
 * @returns React functional component
 */
export function getComponent(
  componentId: string,
  fallback: ComponentType<FallbackProps> | RenderFallbackFn
): React.FC<any> {
  // Get the lazy component
  const LazyComponent = lazyLoadComponent(componentId);
  
  // Create a wrapper component that handles loading states and errors
  const Component: React.FC<any> = (props) => {
    // Track when the component renders
    useEffect(() => {
      performance.mark(`component-${componentId}-render-start`);
      
      return () => {
        performance.mark(`component-${componentId}-render-end`);
        performance.measure(
          `component-${componentId}-render-time`,
          `component-${componentId}-render-start`,
          `component-${componentId}-render-end`
        );
      };
    }, []);
    
    return (
      <ComponentErrorBoundary fallback={fallback} componentId={componentId}>
        <Suspense fallback={<div>Loading...</div>}>
          <LazyComponent {...props} />
        </Suspense>
      </ComponentErrorBoundary>
    );
  };
  
  return Component;
} 