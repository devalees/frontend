'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PrefetchSettings {
  /**
   * Whether prefetching is enabled globally
   */
  enabled: boolean;
  
  /**
   * Default timeout before prefetching starts on hover (in ms)
   */
  linkHoverDelay: number;
  
  /**
   * Default threshold for pagination prefetching
   */
  paginationThreshold: number;
  
  /**
   * Whether to prefetch only next page in pagination
   */
  prefetchOnlyNextPage: boolean;
}

interface PrefetchContextValue {
  /**
   * Current prefetch settings
   */
  settings: PrefetchSettings;
  
  /**
   * Enable or disable prefetching globally
   */
  setEnabled: (enabled: boolean) => void;
  
  /**
   * Update link hover delay
   */
  setLinkHoverDelay: (delay: number) => void;
  
  /**
   * Update pagination threshold
   */
  setPaginationThreshold: (threshold: number) => void;
  
  /**
   * Update whether to prefetch only next page
   */
  setPrefetchOnlyNextPage: (onlyNext: boolean) => void;
}

// Default settings
const DEFAULT_SETTINGS: PrefetchSettings = {
  enabled: true,
  linkHoverDelay: 100,
  paginationThreshold: 3,
  prefetchOnlyNextPage: true
};

// Create context with default values
const PrefetchContext = createContext<PrefetchContextValue>({
  settings: DEFAULT_SETTINGS,
  setEnabled: () => {},
  setLinkHoverDelay: () => {},
  setPaginationThreshold: () => {},
  setPrefetchOnlyNextPage: () => {},
});

interface PrefetchProviderProps {
  children: ReactNode;
  initialSettings?: Partial<PrefetchSettings>;
}

/**
 * Provider component for global prefetching settings
 */
export const PrefetchProvider: React.FC<PrefetchProviderProps> = ({
  children,
  initialSettings = {},
}) => {
  const [settings, setSettings] = useState<PrefetchSettings>({
    ...DEFAULT_SETTINGS,
    ...initialSettings,
  });

  const setEnabled = (enabled: boolean) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      enabled,
    }));
  };

  const setLinkHoverDelay = (linkHoverDelay: number) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      linkHoverDelay,
    }));
  };

  const setPaginationThreshold = (paginationThreshold: number) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      paginationThreshold,
    }));
  };

  const setPrefetchOnlyNextPage = (prefetchOnlyNextPage: boolean) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      prefetchOnlyNextPage,
    }));
  };

  return (
    <PrefetchContext.Provider
      value={{
        settings,
        setEnabled,
        setLinkHoverDelay,
        setPaginationThreshold,
        setPrefetchOnlyNextPage,
      }}
    >
      {children}
    </PrefetchContext.Provider>
  );
};

/**
 * Hook to access prefetch settings
 */
export const usePrefetchSettings = () => {
  const context = useContext(PrefetchContext);
  
  if (!context) {
    throw new Error('usePrefetchSettings must be used within a PrefetchProvider');
  }
  
  return context;
};

export default PrefetchProvider; 