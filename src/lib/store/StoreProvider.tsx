import React, { createContext, useContext } from 'react';

// Define the store type
export interface Store {
  roles: {
    fetchRoles: () => Promise<void>;
    roles: any[];
  };
  permissions: {
    fetchPermissions: () => Promise<void>;
    permissions: any[];
  };
  userRoles: {
    fetchUserRoles: () => Promise<void>;
    userRoles: any[];
  };
  resources: {
    fetchResources: () => Promise<void>;
    resources: any[];
  };
  resourceAccess: {
    fetchResourceAccess: () => Promise<void>;
    resourceAccess: any[];
  };
  organizationContext: {
    fetchOrganizationContext: () => Promise<void>;
    organizationContext: any;
  };
  auditLogs: {
    fetchAuditLogs: () => Promise<void>;
    auditLogs: any[];
  };
}

// Create the context
const StoreContext = createContext<{ store: Store } | null>(null);

// Custom hook to use the store context
export const useStoreContext = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStoreContext must be used within a StoreProvider');
  }
  return context;
};

// Provider component
interface StoreProviderProps {
  store: Store;
  children: React.ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ store, children }) => {
  return (
    <StoreContext.Provider value={{ store }}>
      {children}
    </StoreContext.Provider>
  );
}; 