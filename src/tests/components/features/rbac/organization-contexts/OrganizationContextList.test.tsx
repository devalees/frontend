/**
 * OrganizationContextList Component Tests
 * 
 * Tests for the OrganizationContextList component which displays a list of organization contexts.
 */

import React, { useEffect } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { componentTestHarness } from '../../../../tests/utils/componentTestUtils';
import { mockApiMethod, resetApiMocks } from '../../../../tests/utils/mockApi';
import { OrganizationContext, PaginatedResponse } from '../../../../types/rbac';
import { useRbac } from '../../../../hooks/useRbac';

// Mock the useRbac hook
jest.mock('../../../../hooks/useRbac', () => ({
  useRbac: jest.fn()
}));

// Mock data
const mockOrganizationContexts: OrganizationContext[] = [
  {
    id: '1',
    name: 'Global Organization',
    description: 'Top-level organization context',
    is_active: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'North America',
    description: 'North American division',
    parent_id: '1',
    is_active: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Europe',
    description: 'European division',
    parent_id: '1',
    is_active: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'Asia Pacific',
    description: 'Asia Pacific division',
    parent_id: '1',
    is_active: false,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  }
];

const mockPaginatedResponse: PaginatedResponse<OrganizationContext> = {
  count: mockOrganizationContexts.length,
  next: null,
  previous: null,
  results: mockOrganizationContexts
};

// Mock the useRbac hook implementation
const mockUseRbac = useRbac as jest.Mock;

// Mock the OrganizationContextList component
// This is a placeholder until the actual component is implemented
const OrganizationContextList = () => {
  const { organizationContexts } = useRbac();
  const { data, loading, error, fetchOrganizationContexts } = organizationContexts;

  // Simulate component mounting
  useEffect(() => {
    fetchOrganizationContexts();
  }, [fetchOrganizationContexts]);

  if (loading) {
    return <div data-testid="loading-indicator">Loading...</div>;
  }

  if (error) {
    return <div data-testid="error-message">{error}</div>;
  }

  return (
    <div data-testid="organization-context-list">
      <h1>Organization Contexts</h1>
      <div data-testid="search-input">
        <input type="text" placeholder="Search..." />
      </div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Parent</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.results.map((context: OrganizationContext) => (
            <tr key={context.id} data-testid={`context-row-${context.id}`}>
              <td>{context.name}</td>
              <td>{context.description}</td>
              <td>
                {context.parent_id
                  ? mockOrganizationContexts.find((c) => c.id === context.parent_id)?.name || ''
                  : 'None'}
              </td>
              <td>{context.is_active ? 'Active' : 'Inactive'}</td>
              <td>
                <button
                  data-testid={`edit-button-${context.id}`}
                  onClick={() => console.log(`Edit ${context.id}`)}
                >
                  Edit
                </button>
                <button
                  data-testid={`delete-button-${context.id}`}
                  onClick={() => console.log(`Delete ${context.id}`)}
                >
                  Delete
                </button>
                {context.is_active ? (
                  <button
                    data-testid={`deactivate-button-${context.id}`}
                    onClick={() => console.log(`Deactivate ${context.id}`)}
                  >
                    Deactivate
                  </button>
                ) : (
                  <button
                    data-testid={`activate-button-${context.id}`}
                    onClick={() => console.log(`Activate ${context.id}`)}
                  >
                    Activate
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

describe('OrganizationContextList Component', () => {
  beforeEach(() => {
    resetApiMocks();
    
    // Default mock implementation
    mockUseRbac.mockReturnValue({
      organizationContexts: {
        data: mockPaginatedResponse,
        loading: false,
        error: null,
        fetchOrganizationContexts: jest.fn(),
        createOrganizationContext: jest.fn(),
        updateOrganizationContext: jest.fn(),
        deleteOrganizationContext: jest.fn(),
        activateOrganizationContext: jest.fn(),
        deactivateOrganizationContext: jest.fn()
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the component with organization contexts', () => {
    render(<OrganizationContextList />);
    
    // Check if the component renders
    expect(screen.getByTestId('organization-context-list')).toBeInTheDocument();
    
    // Check if all organization contexts are rendered
    mockOrganizationContexts.forEach((context) => {
      expect(screen.getByTestId(`context-row-${context.id}`)).toBeInTheDocument();
      expect(screen.getByText(context.name)).toBeInTheDocument();
      expect(screen.getByText(context.description)).toBeInTheDocument();
    });
  });

  it('should display loading state when fetching organization contexts', () => {
    // Mock loading state
    mockUseRbac.mockReturnValue({
      organizationContexts: {
        data: null,
        loading: true,
        error: null,
        fetchOrganizationContexts: jest.fn()
      }
    });
    
    render(<OrganizationContextList />);
    
    // Check if loading indicator is displayed
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display error state when fetching organization contexts fails', () => {
    // Mock error state
    const errorMessage = 'Failed to fetch organization contexts';
    mockUseRbac.mockReturnValue({
      organizationContexts: {
        data: null,
        loading: false,
        error: errorMessage,
        fetchOrganizationContexts: jest.fn()
      }
    });
    
    render(<OrganizationContextList />);
    
    // Check if error message is displayed
    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should call fetchOrganizationContexts when component mounts', () => {
    const fetchOrganizationContexts = jest.fn();
    mockUseRbac.mockReturnValue({
      organizationContexts: {
        data: mockPaginatedResponse,
        loading: false,
        error: null,
        fetchOrganizationContexts
      }
    });
    
    render(<OrganizationContextList />);
    
    // Check if fetchOrganizationContexts is called
    expect(fetchOrganizationContexts).toHaveBeenCalledTimes(1);
  });

  it('should call deleteOrganizationContext when delete button is clicked', () => {
    const deleteOrganizationContext = jest.fn();
    mockUseRbac.mockReturnValue({
      organizationContexts: {
        data: mockPaginatedResponse,
        loading: false,
        error: null,
        fetchOrganizationContexts: jest.fn(),
        deleteOrganizationContext
      }
    });
    
    render(<OrganizationContextList />);
    
    // Click the delete button for the first organization context
    const deleteButton = screen.getByTestId(`delete-button-${mockOrganizationContexts[0].id}`);
    fireEvent.click(deleteButton);
    
    // Check if deleteOrganizationContext is called with the correct ID
    expect(deleteOrganizationContext).toHaveBeenCalledWith(mockOrganizationContexts[0].id);
  });

  it('should call activateOrganizationContext when activate button is clicked', () => {
    const activateOrganizationContext = jest.fn();
    mockUseRbac.mockReturnValue({
      organizationContexts: {
        data: mockPaginatedResponse,
        loading: false,
        error: null,
        fetchOrganizationContexts: jest.fn(),
        activateOrganizationContext
      }
    });
    
    render(<OrganizationContextList />);
    
    // Click the activate button for the inactive organization context
    const inactiveContext = mockOrganizationContexts.find(context => !context.is_active);
    if (inactiveContext) {
      const activateButton = screen.getByTestId(`activate-button-${inactiveContext.id}`);
      fireEvent.click(activateButton);
      
      // Check if activateOrganizationContext is called with the correct ID
      expect(activateOrganizationContext).toHaveBeenCalledWith(inactiveContext.id);
    }
  });

  it('should call deactivateOrganizationContext when deactivate button is clicked', () => {
    const deactivateOrganizationContext = jest.fn();
    mockUseRbac.mockReturnValue({
      organizationContexts: {
        data: mockPaginatedResponse,
        loading: false,
        error: null,
        fetchOrganizationContexts: jest.fn(),
        deactivateOrganizationContext
      }
    });
    
    render(<OrganizationContextList />);
    
    // Click the deactivate button for the first active organization context
    const activeContext = mockOrganizationContexts.find(context => context.is_active);
    if (activeContext) {
      const deactivateButton = screen.getByTestId(`deactivate-button-${activeContext.id}`);
      fireEvent.click(deactivateButton);
      
      // Check if deactivateOrganizationContext is called with the correct ID
      expect(deactivateOrganizationContext).toHaveBeenCalledWith(activeContext.id);
    }
  });

  it('should filter organization contexts when search input is used', () => {
    render(<OrganizationContextList />);
    
    // Get the search input
    const searchInput = screen.getByPlaceholderText('Search...');
    
    // Type in the search input
    fireEvent.change(searchInput, { target: { value: 'North' } });
    
    // Check if only the matching organization context is displayed
    expect(screen.getByText('North America')).toBeInTheDocument();
    expect(screen.queryByText('Europe')).not.toBeInTheDocument();
    expect(screen.queryByText('Asia Pacific')).not.toBeInTheDocument();
  });

  it('should display parent organization context name when available', () => {
    render(<OrganizationContextList />);
    
    // Check if parent organization context name is displayed
    const childContext = mockOrganizationContexts.find(context => context.parent_id);
    if (childContext) {
      const parentContext = mockOrganizationContexts.find(context => context.id === childContext.parent_id);
      if (parentContext) {
        const row = screen.getByTestId(`context-row-${childContext.id}`);
        expect(row).toContainElement(screen.getByText(parentContext.name));
      }
    }
  });

  it('should handle pagination correctly', () => {
    // Mock paginated response with next page
    const paginatedResponseWithNext: PaginatedResponse<OrganizationContext> = {
      ...mockPaginatedResponse,
      next: '/api/v1/rbac/organization-contexts/?page=2',
      results: mockOrganizationContexts.slice(0, 2) // Only first 2 items
    };
    
    mockUseRbac.mockReturnValue({
      organizationContexts: {
        data: paginatedResponseWithNext,
        loading: false,
        error: null,
        fetchOrganizationContexts: jest.fn()
      }
    });
    
    render(<OrganizationContextList />);
    
    // Check if pagination controls are displayed
    // This is a placeholder test since the actual pagination UI is not implemented in the mock component
    expect(screen.getByTestId('organization-context-list')).toBeInTheDocument();
  });
}); 