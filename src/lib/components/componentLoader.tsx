import React, { Component, ErrorInfo, ReactNode, Suspense, useEffect, ComponentType } from 'react';
import { logComponentPerformance, logComponentLoadTimes } from './debugPerformance';

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

// Debug helper - log component registry contents
const logRegistryContents = () => {
  console.log('[ComponentLoader] Registry contents:', 
    Array.from(componentRegistry.entries()).map(([id, metadata]) => ({
      id,
      displayName: metadata.displayName,
      path: metadata.path,
      dependencies: metadata.dependencies.length
    }))
  );
};

// Debug helper - log preload cache contents
const logPreloadCacheContents = () => {
  console.log('[ComponentLoader] Preload cache contents:', 
    Array.from(preloadCache.keys())
  );
};

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
    console.log('[ComponentErrorBoundary] Error caught in getDerivedStateFromError:', error.message);
    
    return {
      hasError: true,
      error: componentError
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to performance monitoring
    performance.mark('component-error-start');
    console.error('[ComponentErrorBoundary] Component loading error:', {
      message: error.message,
      componentId: this.props.componentId,
      stack: error.stack,
      errorInfo
    });
    
    // Add component ID to error if provided
    if (this.props.componentId && this.state.error) {
      this.state.error.componentId = this.props.componentId;
      console.log(`[ComponentErrorBoundary] Added componentId ${this.props.componentId} to error`);
    }
    
    performance.mark('component-error-end');
    performance.measure(
      'component-error-time',
      'component-error-start',
      'component-error-end'
    );
  }

  handleRetry = (): void => {
    console.log('[ComponentErrorBoundary] Retry attempted for component', this.props.componentId);
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
      console.log('[ComponentErrorBoundary] Rendering fallback for error:', {
        message: this.state.error.message,
        componentId: this.state.error.componentId
      });
      
      const errorProps: FallbackProps = {
        error: this.state.error,
        retry: this.handleRetry
      };
      
      // Check if it's a render function or a component
      if (this.isRenderFunction(fallback)) {
        // It's a render function
        console.log('[ComponentErrorBoundary] Using render function fallback');
        return fallback(this.state.error, this.handleRetry);
      }
      
      // It's a component
      console.log('[ComponentErrorBoundary] Using component fallback');
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
  console.log(`[ComponentLoader] Getting path for component: ${componentId}`);
  const component = componentRegistry.get(componentId);
  
  if (!component) {
    console.error(`[ComponentLoader] Component with ID "${componentId}" not found in registry`);
    throw new Error(`Component with ID "${componentId}" not found in registry`);
  }
  
  console.log(`[ComponentLoader] Found path ${component.path} for component ${componentId}`);
  return component.path;
}

/**
 * Load a component's dependencies
 * @param componentId - ID of the component to load dependencies for
 * @returns Promise that resolves when dependencies are loaded
 */
async function loadDependencies(componentId: string): Promise<void> {
  console.log(`[ComponentLoader] Loading dependencies for component: ${componentId}`);
  const component = componentRegistry.get(componentId);
  
  if (!component || !component.dependencies || component.dependencies.length === 0) {
    console.log(`[ComponentLoader] No dependencies to load for component: ${componentId}`);
    return;
  }
  
  console.log(`[ComponentLoader] Dependencies for ${componentId}:`, component.dependencies);
  
  // In a real implementation, this would load any required dependencies
  // For now, we'll just simulate a delay
  await new Promise(resolve => setTimeout(resolve, 10));
  console.log(`[ComponentLoader] Finished loading dependencies for ${componentId}`);
}

/**
 * Load a component by ID
 * @param componentId - ID of the component to load
 * @returns Promise that resolves to the component
 */
export async function loadComponent(componentId: string): Promise<{ default: React.ComponentType<any> }> {
  console.log(`[ComponentLoader] Loading component: ${componentId}`);
  performance.mark('component-load-start');
  
  try {
    // First load dependencies
    performance.mark('component-dependencies-load-start');
    console.log(`[ComponentLoader] Starting dependency loading for ${componentId}`);
    await loadDependencies(componentId);
    performance.mark('component-dependencies-load-end');
    performance.measure(
      'component-dependencies-load-time',
      'component-dependencies-load-start',
      'component-dependencies-load-end'
    );
    console.log(`[ComponentLoader] Completed dependency loading for ${componentId}`);
    
    // Get the path to the component module
    const componentPath = getComponentPath(componentId);
    
    // Dynamically import the component
    // In a real implementation, this would be:
    // const component = await import(componentPath);
    // For testing purposes, we'll simulate the import
    console.log(`[ComponentLoader] Dynamically importing component from ${componentPath}`);
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
    
    console.log(`[ComponentLoader] Successfully loaded component: ${componentId}`);
    return component;
  } catch (error) {
    console.error(`[ComponentLoader] Error loading component ${componentId}:`, error);
    throw error;
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
  console.log(`[ComponentLoader] Simulating dynamic import for path: ${path}`);
  
  // Check if we should throw an error (useful for testing error boundaries)
  if (path.includes('error')) {
    console.warn(`[ComponentLoader] Path contains 'error', throwing simulated error`);
    throw new Error('Failed to load component');
  }
  
  // Simulate network delay
  console.log(`[ComponentLoader] Simulating network delay for component import`);
  await new Promise(resolve => setTimeout(resolve, 50));
  
  console.log(`[ComponentLoader] Dynamic import simulation completed for: ${path}`);
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
  console.log(`[ComponentLoader] Preloading component: ${componentId}`);
  performance.mark('component-preload-start');
  
  try {
    // Check if component is already in preload cache
    if (preloadCache.has(componentId)) {
      console.log(`[ComponentLoader] Component ${componentId} already preloaded, skipping`);
      return;
    }
    
    // Get the component path
    const componentPath = getComponentPath(componentId);
    console.log(`[ComponentLoader] Starting preload for component ${componentId} at path ${componentPath}`);
    
    // Start preloading by creating a promise that loads the component
    const preloadPromise = loadComponent(componentId);
    
    // Store in cache
    preloadCache.set(componentId, preloadPromise);
    console.log(`[ComponentLoader] Added component ${componentId} to preload cache`);
    
    // Start loading dependencies in background
    performance.mark('component-dependencies-preload-start');
    await loadDependencies(componentId);
    performance.mark('component-dependencies-preload-end');
    performance.measure(
      'component-dependencies-preload-time',
      'component-dependencies-preload-start',
      'component-dependencies-preload-end'
    );
    
    console.log(`[ComponentLoader] Completed preloading component: ${componentId}`);
    logPreloadCacheContents();
  } catch (error) {
    console.error(`[ComponentLoader] Error preloading component ${componentId}:`, error);
    throw error;
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
  console.log(`[ComponentLoader] Registering component: ${component.id}`, {
    displayName: component.displayName,
    path: component.path,
    dependencies: component.dependencies
  });
  
  performance.mark('component-register-start');
  
  // Store the component in registry
  componentRegistry.set(component.id, component);
  
  performance.mark('component-register-end');
  performance.measure(
    'component-register-time',
    'component-register-start',
    'component-register-end'
  );
  
  console.log(`[ComponentLoader] Successfully registered component: ${component.id}`);
  logRegistryContents();
  
  return component;
}

/**
 * Create a lazy-loaded component
 * @param componentId - ID of the component to lazy load
 * @returns React lazy component
 */
export function lazyLoadComponent(componentId: string): React.LazyExoticComponent<React.ComponentType<any>> {
  console.log(`[ComponentLoader] Creating lazy component for: ${componentId}`);
  performance.mark('component-lazy-load-init-start');
  
  // Create a lazy component that loads the actual component when rendered
  const LazyComponent = React.lazy(async () => {
    console.log(`[ComponentLoader] Lazy component ${componentId} triggered loading`);
    
    // If component was preloaded, use that promise
    if (preloadCache.has(componentId)) {
      console.log(`[ComponentLoader] Using preloaded component for ${componentId}`);
      return preloadCache.get(componentId) as Promise<{ default: React.ComponentType<any> }>;
    }
    
    // Otherwise load it normally
    console.log(`[ComponentLoader] No preloaded version found, loading component ${componentId} normally`);
    return loadComponent(componentId);
  });
  
  performance.mark('component-lazy-load-init-end');
  performance.measure(
    'component-lazy-load-init-time',
    'component-lazy-load-init-start',
    'component-lazy-load-init-end'
  );
  
  console.log(`[ComponentLoader] Created lazy component for: ${componentId}`);
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
  console.log(`[ComponentLoader] getComponent called for: ${componentId}`);
  
  // Get the lazy component
  const LazyComponent = lazyLoadComponent(componentId);
  console.log(`[ComponentLoader] LazyComponent created for ${componentId}`);
  
  // Create a wrapper component that handles loading states and errors
  const Component: React.FC<any> = (props) => {
    console.log(`[ComponentLoader] Rendering wrapped component for ${componentId}`);
    
    // Track when the component renders
    useEffect(() => {
      console.log(`[ComponentLoader] Component ${componentId} mounted, starting performance tracking`);
      performance.mark(`component-${componentId}-render-start`);
      
      return () => {
        console.log(`[ComponentLoader] Component ${componentId} unmounted, ending performance tracking`);
        performance.mark(`component-${componentId}-render-end`);
        performance.measure(
          `component-${componentId}-render-time`,
          `component-${componentId}-render-start`,
          `component-${componentId}-render-end`
        );
        
        // Log performance data for this component
        logComponentPerformance(componentId);
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
  
  console.log(`[ComponentLoader] Created wrapped component for: ${componentId}`);
  return Component;
}

// Add a debug function to log component loading performance
export function debugComponentLoading(): void {
  console.log('[ComponentLoader] --- DEBUG COMPONENT LOADING ---');
  console.log('Component Registry:', Array.from(componentRegistry.entries()).map(([id, metadata]) => ({
    id,
    displayName: metadata.displayName,
    path: metadata.path,
    dependencies: metadata.dependencies.length
  })));
  
  console.log('Preload Cache:', Array.from(preloadCache.keys()));
  
  // Log all component load times
  logComponentLoadTimes();
} 