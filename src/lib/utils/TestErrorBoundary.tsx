import React from 'react';

// Define ComponentError interface for proper typing
interface ComponentError extends Error {
  componentId?: string;
}

interface FallbackProps {
  error: ComponentError;
  retry: () => void;
}

// Split into two distinct types instead of a union
interface TestErrorBoundaryPropsWithComponent {
  children: React.ReactNode;
  fallback: React.ComponentType<FallbackProps>;
  componentId?: string;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  renderFallback?: never; // Ensure mutual exclusivity
}

interface TestErrorBoundaryPropsWithFunction {
  children: React.ReactNode;
  fallback?: never; // Ensure mutual exclusivity
  renderFallback: (error: ComponentError, retry: () => void) => React.ReactNode;
  componentId?: string;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

// Union the two types
type TestErrorBoundaryProps = TestErrorBoundaryPropsWithComponent | TestErrorBoundaryPropsWithFunction;

interface TestErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * TestErrorBoundary - A reusable error boundary component for tests and development
 * 
 * This component catches JavaScript errors in its child component tree, logs those errors,
 * and displays a fallback UI instead of the component tree that crashed.
 * 
 * @example
 * // With component fallback
 * <TestErrorBoundary 
 *   fallback={ErrorComponent} 
 *   componentId="my-component"
 *   onError={(error, errorInfo) => console.log(error, errorInfo)}
 * >
 *   <MyComponent />
 * </TestErrorBoundary>
 * 
 * // With render function fallback
 * <TestErrorBoundary 
 *   renderFallback={(error, retry) => <div>Error: {error.message} <button onClick={retry}>Retry</button></div>}
 *   componentId="my-component"
 * >
 *   <MyComponent />
 * </TestErrorBoundary>
 */
class TestErrorBoundary extends React.Component<TestErrorBoundaryProps, TestErrorBoundaryState> {
  constructor(props: TestErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): TestErrorBoundaryState {
    console.log('Error caught in TestErrorBoundary:', error.message);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.log('Error caught in TestErrorBoundary componentDidCatch:', error.message);
    
    // Add componentId to the error if provided
    if (this.props.componentId && this.state.error) {
      (this.state.error as ComponentError).componentId = this.props.componentId;
      console.log(`Added componentId ${this.props.componentId} to error`);
    }
    
    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }
  
  handleRetry = () => {
    console.log('Retrying component after error');
    performance.mark('component-retry-start');
    this.setState({ hasError: false, error: null });
    performance.mark('component-retry-end');
    performance.measure(
      'component-retry-time',
      'component-retry-start',
      'component-retry-end'
    );
  };
  
  render(): React.ReactNode {
    if (this.state.hasError) {
      const error = this.state.error as ComponentError || new Error('Unknown error');
      
      // Use renderFallback function if provided
      if ('renderFallback' in this.props && this.props.renderFallback) {
        return this.props.renderFallback(error, this.handleRetry);
      }
      
      // Use component fallback if provided
      if ('fallback' in this.props && this.props.fallback) {
        return React.createElement(this.props.fallback, {
          error,
          retry: this.handleRetry
        });
      }
      
      // Default fallback if neither is provided (should not happen due to types)
      return (
        <div style={{ padding: '20px', color: 'red', border: '1px solid red' }}>
          <h2>Something went wrong.</h2>
          <p>{error.message}</p>
          <button onClick={this.handleRetry}>Try again</button>
        </div>
      );
    }
    
    return this.props.children;
  }
}

export type { ComponentError, FallbackProps, TestErrorBoundaryProps };
export default TestErrorBoundary; 