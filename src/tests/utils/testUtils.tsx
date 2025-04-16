import React, { ReactElement } from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { renderHook as rtlRenderHook, RenderHookOptions, RenderHookResult } from '@testing-library/react';

// Since Zustand is used directly without a provider pattern, 
// we don't need to import a StoreProvider.
// Instead, mock calls to useStore will be handled at the test level.

/**
 * Custom render function that wraps components with necessary providers
 * @param ui - Component to render
 * @param options - Additional render options
 * @returns Result from react-testing-library render
 */
function render(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { wrapper?: React.ComponentType<{ children: React.ReactNode }> }
) {
  const AllProviders = ({ children }: { children: React.ReactNode }) => {
    // We don't have a global store provider since Zustand is used directly
    // Add any future providers here (ThemeProvider, RouterProvider, etc.)
    return <>{children}</>;
  };

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const { wrapper: CustomWrapper } = options || {};
    
    if (CustomWrapper) {
      return (
        <AllProviders>
          <CustomWrapper>{children}</CustomWrapper>
        </AllProviders>
      );
    }
    
    return <AllProviders>{children}</AllProviders>;
  };

  return rtlRender(ui, { ...options, wrapper: Wrapper });
}

/**
 * Custom renderHook function that wraps hooks with necessary providers
 * @param callback - Hook to render
 * @param options - Additional render options
 * @returns Result from react-testing-library renderHook
 */
function renderHook<TResult, TProps>(
  callback: (props: TProps) => TResult,
  options?: Omit<RenderHookOptions<TProps>, 'wrapper'> & { 
    wrapper?: React.ComponentType<{ children: React.ReactNode }> 
  }
): RenderHookResult<TResult, TProps> {
  const AllProviders = ({ children }: { children: React.ReactNode }) => {
    // We don't have a global store provider since Zustand is used directly
    // Add any future providers here (ThemeProvider, RouterProvider, etc.)
    return <>{children}</>;
  };

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const { wrapper: CustomWrapper } = options || {};
    
    if (CustomWrapper) {
      return (
        <AllProviders>
          <CustomWrapper>{children}</CustomWrapper>
        </AllProviders>
      );
    }
    
    return <AllProviders>{children}</AllProviders>;
  };

  return rtlRenderHook(callback, { ...options, wrapper: Wrapper });
}

// Re-export screen and other testing utilities for convenience
export * from '@testing-library/react';
export { render, renderHook }; 