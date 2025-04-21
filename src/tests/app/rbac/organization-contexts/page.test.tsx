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
    organizationContext: {
      data: [
        {
          id: '1',
          name: 'Headquarters',
          description: 'Main organization unit',
          parent_id: null,
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

// Mock the OrganizationContextList component
jest.mock('../../../../components/features/rbac/OrganizationContextList', () => ({
  OrganizationContextList: ({ 
    onEdit, 
    onDelete, 
    onActivate,
    onDeactivate,
    onViewHierarchy
  }: { 
    onEdit?: (context: OrganizationContext) => void, 
    onDelete?: (context: OrganizationContext) => void,
    onActivate?: (context: OrganizationContext) => void,
    onDeactivate?: (context: OrganizationContext) => void,
    onViewHierarchy?: (context: OrganizationContext) => void
  }) => (
    <div data-testid="organization-context-list">
      <button onClick={() => onEdit && onEdit({ 
        id: '1',
        name: 'Headquarters',
        description: 'Main organization unit',
        parent_id: null,
        is_active: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      })}>
        Edit Organization Context
      </button>
      <button onClick={() => onDelete && onDelete({ 
        id: '1',
        name: 'Headquarters',
        description: 'Main organization unit',
        parent_id: null,
        is_active: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      })}>
        Delete Organization Context
      </button>
      <button onClick={() => onActivate && onActivate({ 
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
      <button onClick={() => onDeactivate && onDeactivate({ 
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
      <button onClick={() => onViewHierarchy && onViewHierarchy({ 
        id: '1',
        name: 'Headquarters',
        description: 'Main organization unit',
        parent_id: null,
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
  ToastContainer: () => <div data-testid="toast-container" />,
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
    expect(screen.getByTestId('organization-context-list')).toBeInTheDocument();
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
    expect(screen.getByText('Add New Organization Context')).toBeInTheDocument();
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
    await act(async () => {
      fireEvent.click(submitButton);
    });
    
    // Check if the correct create function was called
    expect(mockCreateOrganizationContext).toHaveBeenCalledWith({
      name: 'New Department',
      description: 'A new department',
      parent_id: '1',
      is_active: true
    });
    
    // Check if a success toast was shown
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Success',
      description: 'Organization context created successfully'
    }));
    
    // Check if the form is closed after submission
    expect(screen.queryByTestId('organization-context-form')).not.toBeInTheDocument();
  });

  it('edits an organization context when edit button is clicked', async () => {
    renderWithProviders(<OrganizationContextPage />);
    
    // Find and click the edit button in the list
    const editButton = screen.getByText('Edit Organization Context');
    fireEvent.click(editButton);
    
    // Check if the form is opened with the correct organization context data
    expect(screen.getByTestId('organization-context-form')).toBeInTheDocument();
    expect(screen.getByText('Edit Organization Context: Headquarters')).toBeInTheDocument();
    
    // Submit the form
    const submitButton = screen.getByTestId('submit-form-btn');
    await act(async () => {
      fireEvent.click(submitButton);
    });
    
    // Check if the update function was called with the correct ID
    expect(mockUpdateOrganizationContext).toHaveBeenCalledWith('1', expect.any(Object));
    
    // Check if a success toast was shown
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Success',
      description: 'Organization context updated successfully'
    }));
  });

  it('deletes an organization context when delete button is clicked', async () => {
    renderWithProviders(<OrganizationContextPage />);
    
    // Find and click the delete button
    const deleteButton = screen.getByText('Delete Organization Context');
    await act(async () => {
      fireEvent.click(deleteButton);
    });
    
    // Check if the delete function was called with the correct ID
    expect(mockDeleteOrganizationContext).toHaveBeenCalledWith('1');
    
    // Check if a success toast was shown
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Success',
      description: 'Organization context deleted successfully'
    }));
  });

  it('activates an organization context when activate button is clicked', async () => {
    renderWithProviders(<OrganizationContextPage />);
    
    // Find and click the activate button
    const activateButton = screen.getByText('Activate Organization Context');
    await act(async () => {
      fireEvent.click(activateButton);
    });
    
    // Check if the activate function was called with the correct ID
    expect(mockActivateOrganizationContext).toHaveBeenCalledWith('3');
    
    // Check if a success toast was shown
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Success',
      description: 'Organization context activated successfully'
    }));
  });

  it('deactivates an organization context when deactivate button is clicked', async () => {
    renderWithProviders(<OrganizationContextPage />);
    
    // Find and click the deactivate button
    const deactivateButton = screen.getByText('Deactivate Organization Context');
    await act(async () => {
      fireEvent.click(deactivateButton);
    });
    
    // Check if the deactivate function was called with the correct ID
    expect(mockDeactivateOrganizationContext).toHaveBeenCalledWith('2');
    
    // Check if a success toast was shown
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Success',
      description: 'Organization context deactivated successfully'
    }));
  });

  it('opens the hierarchy viewer when view hierarchy button is clicked', async () => {
    renderWithProviders(<OrganizationContextPage />);
    
    // Find and click the view hierarchy button
    const viewHierarchyButton = screen.getByText('View Hierarchy');
    fireEvent.click(viewHierarchyButton);
    
    // Check if the hierarchy viewer is displayed
    expect(screen.getByTestId('organization-hierarchy-viewer')).toBeInTheDocument();
    expect(screen.getByText('Hierarchy for: Headquarters')).toBeInTheDocument();
    
    // Close the hierarchy viewer
    const closeButton = screen.getByTestId('close-hierarchy-btn');
    fireEvent.click(closeButton);
    
    // Check if the hierarchy viewer is closed
    expect(screen.queryByTestId('organization-hierarchy-viewer')).not.toBeInTheDocument();
  });

  it('fetches organization contexts on page load', () => {
    renderWithProviders(<OrganizationContextPage />);
    
    // Check if fetch function was called
    expect(mockFetchOrganizationContexts).toHaveBeenCalled();
  });
}); 