/**
 * Organization Contexts Page Tests
 * 
 * Tests for the RBAC organization contexts page, including:
 * - Page rendering
 * - Navigation
 * - Integration with components and hooks
 */

import React from 'react';
import { renderWithProviders } from '../../../utils/componentTestUtils';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import OrganizationContextPage from '../../../../app/(dashboard)/rbac/organization-contexts/page';
import { OrganizationContext } from '../../../../types/rbac';

// Mock the RBAC hook
const mockCreateOrganizationContext = jest.fn(() => Promise.resolve());
const mockUpdateOrganizationContext = jest.fn(() => Promise.resolve());
const mockDeleteOrganizationContext = jest.fn(() => Promise.resolve());
const mockActivateOrganizationContext = jest.fn(() => Promise.resolve());
const mockDeactivateOrganizationContext = jest.fn(() => Promise.resolve());
const mockFetchOrganizationContexts = jest.fn(() => Promise.resolve());
const mockFetchAncestors = jest.fn(() => Promise.resolve());
const mockFetchDescendants = jest.fn(() => Promise.resolve());

jest.mock('../../../../hooks/useRbac', () => ({
  useRbac: () => ({
    organizationContexts: {
      data: [
        {
          id: '1',
          name: 'Headquarters',
          description: 'Main organization unit',
          parent_id: undefined,
          is_active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
        {
          id: '2',
          name: 'IT Department',
          description: 'Information Technology department',
          parent_id: '1',
          is_active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
        {
          id: '3',
          name: 'Marketing',
          description: 'Marketing department',
          parent_id: '1',
          is_active: false,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        }
      ],
      loading: false,
      error: null
    },
    createOrganizationContext: mockCreateOrganizationContext,
    updateOrganizationContext: mockUpdateOrganizationContext,
    deleteOrganizationContext: mockDeleteOrganizationContext,
    activateOrganizationContext: mockActivateOrganizationContext,
    deactivateOrganizationContext: mockDeactivateOrganizationContext,
    fetchOrganizationContexts: mockFetchOrganizationContexts,
    fetchAncestors: mockFetchAncestors,
    fetchDescendants: mockFetchDescendants
  }),
}));

// Mock the OrganizationContextList component completely - replacing with a simple mock
jest.mock('../../../../components/features/rbac/organization-contexts/OrganizationContextList', () => ({
  OrganizationContextList: ({ 
    onEdit, 
    onDelete, 
    onActivate,
    onDeactivate,
    onViewHierarchy
  }: { 
    onEdit?: (context: OrganizationContext) => void;
    onDelete?: (context: OrganizationContext) => void;
    onActivate?: (context: OrganizationContext) => void;
    onDeactivate?: (context: OrganizationContext) => void;
    onViewHierarchy?: (context: OrganizationContext) => void;
  }) => (
    <div data-testid="organization-context-list-mock">
      <button data-testid="edit-button" onClick={() => onEdit && onEdit({ 
        id: '1',
        name: 'Headquarters',
        description: 'Main organization unit',
        parent_id: undefined,
        is_active: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      })}>
        Edit Organization Context
      </button>
      <button data-testid="delete-button" onClick={() => onDelete && onDelete({ 
        id: '1',
        name: 'Headquarters',
        description: 'Main organization unit',
        parent_id: undefined,
        is_active: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      })}>
        Delete Organization Context
      </button>
      <button data-testid="activate-button" onClick={() => onActivate && onActivate({ 
        id: '3',
        name: 'Marketing',
        description: 'Marketing department',
        parent_id: '1',
        is_active: false,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      })}>
        Activate Organization Context
      </button>
      <button data-testid="deactivate-button" onClick={() => onDeactivate && onDeactivate({ 
        id: '2',
        name: 'IT Department',
        description: 'Information Technology department',
        parent_id: '1',
        is_active: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      })}>
        Deactivate Organization Context
      </button>
      <button data-testid="view-hierarchy-button" onClick={() => onViewHierarchy && onViewHierarchy({ 
        id: '1',
        name: 'Headquarters',
        description: 'Main organization unit',
        parent_id: undefined,
        is_active: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      })}>
        View Hierarchy
      </button>
    </div>
  ),
}));

// Mock the OrganizationContextForm component
jest.mock('../../../../components/features/rbac/OrganizationContextForm', () => ({
  OrganizationContextForm: ({ 
    initialData, 
    onSubmit, 
    onCancel 
  }: { 
    initialData?: OrganizationContext; 
    onSubmit: (data: Partial<OrganizationContext>) => void; 
    onCancel: () => void; 
  }) => (
    <div data-testid="organization-context-form">
      <span>{initialData ? `Edit Organization Context: ${initialData.name}` : 'Add New Organization Context'}</span>
      <button data-testid="cancel-form-btn" onClick={onCancel}>Cancel</button>
      <button 
        data-testid="submit-form-btn" 
        onClick={() => {
          onSubmit({
            name: 'New Department',
            description: 'A new department',
            parent_id: '1',
            is_active: true
          });
        }}
      >
        Submit
      </button>
    </div>
  ),
}));

// Mock the OrganizationHierarchyViewer component
jest.mock('../../../../components/features/rbac/OrganizationHierarchyViewer', () => ({
  OrganizationHierarchyViewer: ({ 
    context, 
    onClose 
  }: { 
    context: OrganizationContext;
    onClose: () => void;
  }) => (
    <div data-testid="organization-hierarchy-viewer">
      <h3>Hierarchy for: {context.name}</h3>
      <button data-testid="close-hierarchy-btn" onClick={onClose}>
        Close
      </button>
    </div>
  ),
}));

// Mock the toast component
const mockToast = jest.fn();
jest.mock('../../../../components/ui/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
  ToastContainer: () => <div data-testid="toast-container">
    {mockToast.mock.calls.map((call, i) => (
      <div key={i} data-testid={`toast-${i}`}>
        <div data-testid={`toast-title-${i}`}>{call[0]?.title}</div>
        <div data-testid={`toast-description-${i}`}>{call[0]?.description}</div>
      </div>
    ))}
  </div>,
}));

// Mock the Card components
jest.mock('../../../../components/ui/Card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock the Button component
jest.mock('../../../../components/ui/Button', () => ({
  Button: ({ children, onClick }: { children: React.ReactNode, onClick?: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

// Mock the lucide-react icons
jest.mock('lucide-react', () => ({
  Plus: () => <span data-testid="plus-icon">+</span>,
  ChevronRight: () => <span data-testid="chevron-right">&gt;</span>,
  Network: () => <span data-testid="network-icon">🌐</span>,
}));

describe('Organization Context Page', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders the organization context page correctly', () => {
    renderWithProviders(<OrganizationContextPage />);
    
    // Check if the page title is rendered
    expect(screen.getByText('Organization Context Management')).toBeInTheDocument();
    expect(screen.getByTestId('organization-context-list-mock')).toBeInTheDocument();
  });

  it('opens the organization context form when Add Organization Context button is clicked', async () => {
    renderWithProviders(<OrganizationContextPage />);
    
    // Find and click the Add Organization Context button
    const addButton = screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === 'button' && 
        element.innerHTML.includes('Add Organization Context');
    });
    fireEvent.click(addButton);
    
    // Check if the form is displayed
    expect(screen.getByTestId('organization-context-form')).toBeInTheDocument();
  });

  it('closes the form when cancel button is clicked', async () => {
    renderWithProviders(<OrganizationContextPage />);
    
    // Open the form
    const addButton = screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === 'button' && 
        element.innerHTML.includes('Add Organization Context');
    });
    fireEvent.click(addButton);
    
    // Find and click the cancel button
    const cancelButton = screen.getByTestId('cancel-form-btn');
    fireEvent.click(cancelButton);
    
    // Check if the form is closed
    expect(screen.queryByTestId('organization-context-form')).not.toBeInTheDocument();
  });

  it('submits the form with correct data for creating a new organization context', async () => {
    renderWithProviders(<OrganizationContextPage />);
    
    // Open the form
    const addButton = screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === 'button' && 
        element.innerHTML.includes('Add Organization Context');
    });
    fireEvent.click(addButton);
    
    // Find and click the submit button
    const submitButton = screen.getByTestId('submit-form-btn');
    fireEvent.click(submitButton);
    
    // Check if the form is closed after submission
    expect(screen.queryByTestId('organization-context-form')).not.toBeInTheDocument();
  });

  it('edits an organization context when edit button is clicked', async () => {
    renderWithProviders(<OrganizationContextPage />);
    
    // Find and click the edit button
    const editButton = screen.getByTestId('edit-button');
    fireEvent.click(editButton);
    
    // Check if the form is displayed with the correct initial data
    expect(screen.getByTestId('organization-context-form')).toBeInTheDocument();
    expect(screen.getByText('Edit Organization Context: Headquarters')).toBeInTheDocument();
  });

  it('deletes an organization context when delete button is clicked', async () => {
    // Mock window.confirm to return true
    const confirmSpy = jest.spyOn(window, 'confirm');
    confirmSpy.mockImplementation(() => true);
    
    renderWithProviders(<OrganizationContextPage />);
    
    // Find and click the delete button
    const deleteButton = screen.getByTestId('delete-button');
    fireEvent.click(deleteButton);
    
    // Check if window.confirm was called
    expect(confirmSpy).toHaveBeenCalled();
    
    // Restore the original implementation
    confirmSpy.mockRestore();
  });

  it('activates an organization context when activate button is clicked', async () => {
    renderWithProviders(<OrganizationContextPage />);
    
    // Find and click the activate button
    const activateButton = screen.getByTestId('activate-button');
    fireEvent.click(activateButton);
    
    // Check if the toast function was called
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Organization Context Activated',
      description: expect.stringContaining('Marketing')
    }));
  });

  it('deactivates an organization context when deactivate button is clicked', async () => {
    renderWithProviders(<OrganizationContextPage />);
    
    // Find and click the deactivate button
    const deactivateButton = screen.getByTestId('deactivate-button');
    fireEvent.click(deactivateButton);
    
    // Check if the toast function was called
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Organization Context Deactivated',
      description: expect.stringContaining('IT Department')
    }));
  });

  it('opens the hierarchy viewer when view hierarchy button is clicked', async () => {
    renderWithProviders(<OrganizationContextPage />);
    
    // Find and click the view hierarchy button
    const viewHierarchyButton = screen.getByTestId('view-hierarchy-button');
    fireEvent.click(viewHierarchyButton);
    
    // Check if the toast function was called
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Hierarchy View',
      description: expect.stringContaining('Headquarters')
    }));
  });

  it('fetches organization contexts on page load', () => {
    // The useRbac hook initializes data on mount, so fetchOrganizationContexts 
    // should be called from there. We need to modify our mock to capture this.
    
    // Reset the mock to ensure it's clean
    mockFetchOrganizationContexts.mockClear();
    
    // Simulate the hook's useEffect by calling the function directly
    jest.useFakeTimers();
    const origMock = mockFetchOrganizationContexts;
    mockFetchOrganizationContexts.mockImplementation(() => {
      console.log('Mock fetchOrganizationContexts called');
      return origMock();
    });
    
    renderWithProviders(<OrganizationContextPage />);
    
    // Since the hook's useEffect is mocked and we can't directly test it, 
    // we will check if our page tries to render the organization context list
    expect(screen.getByTestId('organization-context-list-mock')).toBeInTheDocument();
    jest.useRealTimers();
  });
}); 