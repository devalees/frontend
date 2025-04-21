/**
 * Resource Accesses Page Tests
 * 
 * Tests for the RBAC resource accesses page, including:
 * - Page rendering
 * - Navigation
 * - Integration with components and hooks
 */

import React from 'react';
import { renderWithProviders } from '../../../utils/componentTestUtils';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import ResourceAccessPage from '../../../../app/(dashboard)/rbac/resource-accesses/page';
import { ResourceAccess } from '../../../../types/rbac';

// Mock the RBAC hook
const mockCreateResourceAccess = jest.fn(() => Promise.resolve());
const mockUpdateResourceAccess = jest.fn(() => Promise.resolve());
const mockDeleteResourceAccess = jest.fn(() => Promise.resolve());
const mockActivateResourceAccess = jest.fn(() => Promise.resolve());
const mockDeactivateResourceAccess = jest.fn(() => Promise.resolve());
const mockFetchResourceAccesses = jest.fn(() => Promise.resolve());

jest.mock('../../../../hooks/useRbac', () => ({
  useRbac: () => ({
    resourceAccess: {
      data: [
        {
          id: '1',
          resource_id: 'resource1',
          role_id: 'role1',
          permission_id: 'permission1',
          is_active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
        {
          id: '2',
          resource_id: 'resource2',
          role_id: 'role2',
          permission_id: 'permission2',
          is_active: false,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        }
      ],
      loading: false,
      error: null
    },
    createResourceAccess: mockCreateResourceAccess,
    updateResourceAccess: mockUpdateResourceAccess,
    deleteResourceAccess: mockDeleteResourceAccess,
    activateResourceAccess: mockActivateResourceAccess,
    deactivateResourceAccess: mockDeactivateResourceAccess,
    fetchResourceAccesses: mockFetchResourceAccesses
  }),
}));

// Mock the ResourceAccessList component
jest.mock('../../../../components/features/rbac/ResourceAccessList', () => ({
  ResourceAccessList: ({ 
    onEdit, 
    onDelete, 
    onActivate,
    onDeactivate
  }: { 
    onEdit?: (access: ResourceAccess) => void, 
    onDelete?: (access: ResourceAccess) => void,
    onActivate?: (access: ResourceAccess) => void,
    onDeactivate?: (access: ResourceAccess) => void
  }) => (
    <div data-testid="resource-access-list">
      <button onClick={() => onEdit && onEdit({ 
        id: '1',
        resource_id: 'resource1',
        role_id: 'role1',
        permission_id: 'permission1',
        is_active: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      })}>
        Edit Resource Access
      </button>
      <button onClick={() => onDelete && onDelete({ 
        id: '1',
        resource_id: 'resource1',
        role_id: 'role1',
        permission_id: 'permission1',
        is_active: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      })}>
        Delete Resource Access
      </button>
      <button onClick={() => onActivate && onActivate({ 
        id: '2',
        resource_id: 'resource2',
        role_id: 'role2',
        permission_id: 'permission2',
        is_active: false,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      })}>
        Activate Resource Access
      </button>
      <button onClick={() => onDeactivate && onDeactivate({ 
        id: '1',
        resource_id: 'resource1',
        role_id: 'role1',
        permission_id: 'permission1',
        is_active: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      })}>
        Deactivate Resource Access
      </button>
    </div>
  ),
}));

// Mock the ResourceAccessForm component
jest.mock('../../../../components/features/rbac/ResourceAccessForm', () => ({
  ResourceAccessForm: ({ 
    initialData, 
    onSubmit, 
    onCancel 
  }: { 
    initialData?: ResourceAccess; 
    onSubmit: (data: Partial<ResourceAccess>) => void; 
    onCancel: () => void; 
  }) => (
    <div data-testid="resource-access-form">
      <span>{initialData ? `Edit Resource Access: ${initialData.resource_id}` : 'Add New Resource Access'}</span>
      <button data-testid="cancel-form-btn" onClick={onCancel}>Cancel</button>
      <button 
        data-testid="submit-form-btn" 
        onClick={() => {
          onSubmit({
            resource_id: 'resource1',
            role_id: 'role1',
            permission_id: 'permission1',
            is_active: true
          });
        }}
      >
        Submit
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
}));

describe('Resource Access Page', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders the resource access page correctly', () => {
    renderWithProviders(<ResourceAccessPage />);
    
    // Check if the page title is rendered
    expect(screen.getByText('Resource Access Management')).toBeInTheDocument();
    expect(screen.getByTestId('resource-access-list')).toBeInTheDocument();
  });

  it('opens the resource access form when Add Resource Access button is clicked', async () => {
    renderWithProviders(<ResourceAccessPage />);
    
    // Find and click the Add Resource Access button
    const addButton = screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === 'button' && 
        element.innerHTML.includes('Add Resource Access');
    });
    fireEvent.click(addButton);
    
    // Check if the form is displayed
    expect(screen.getByTestId('resource-access-form')).toBeInTheDocument();
    expect(screen.getByText('Add New Resource Access')).toBeInTheDocument();
  });

  it('closes the form when cancel button is clicked', async () => {
    renderWithProviders(<ResourceAccessPage />);
    
    // Open the form
    const addButton = screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === 'button' && 
        element.innerHTML.includes('Add Resource Access');
    });
    fireEvent.click(addButton);
    
    // Find and click the cancel button
    const cancelButton = screen.getByTestId('cancel-form-btn');
    fireEvent.click(cancelButton);
    
    // Check if the form is closed
    expect(screen.queryByTestId('resource-access-form')).not.toBeInTheDocument();
  });

  it('submits the form with correct data for creating a new resource access', async () => {
    renderWithProviders(<ResourceAccessPage />);
    
    // Open the form
    const addButton = screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === 'button' && 
        element.innerHTML.includes('Add Resource Access');
    });
    fireEvent.click(addButton);
    
    // Find and click the submit button
    const submitButton = screen.getByTestId('submit-form-btn');
    await act(async () => {
      fireEvent.click(submitButton);
    });
    
    // Check if the correct create function was called
    expect(mockCreateResourceAccess).toHaveBeenCalledWith({
      resource_id: 'resource1',
      role_id: 'role1',
      permission_id: 'permission1',
      is_active: true
    });
    
    // Check if a success toast was shown
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Success',
      description: 'Resource access created successfully'
    }));
    
    // Check if the form is closed after submission
    expect(screen.queryByTestId('resource-access-form')).not.toBeInTheDocument();
  });

  it('edits a resource access when edit button is clicked', async () => {
    renderWithProviders(<ResourceAccessPage />);
    
    // Find and click the edit button in the list
    const editButton = screen.getByText('Edit Resource Access');
    fireEvent.click(editButton);
    
    // Check if the form is opened with the correct resource access data
    expect(screen.getByTestId('resource-access-form')).toBeInTheDocument();
    expect(screen.getByText('Edit Resource Access: resource1')).toBeInTheDocument();
    
    // Submit the form
    const submitButton = screen.getByTestId('submit-form-btn');
    await act(async () => {
      fireEvent.click(submitButton);
    });
    
    // Check if the update function was called with the correct ID
    expect(mockUpdateResourceAccess).toHaveBeenCalledWith('1', expect.any(Object));
    
    // Check if a success toast was shown
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Success',
      description: 'Resource access updated successfully'
    }));
  });

  it('deletes a resource access when delete button is clicked', async () => {
    renderWithProviders(<ResourceAccessPage />);
    
    // Find and click the delete button
    const deleteButton = screen.getByText('Delete Resource Access');
    await act(async () => {
      fireEvent.click(deleteButton);
    });
    
    // Check if the delete function was called with the correct ID
    expect(mockDeleteResourceAccess).toHaveBeenCalledWith('1');
    
    // Check if a success toast was shown
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Success',
      description: 'Resource access deleted successfully'
    }));
  });

  it('activates a resource access when activate button is clicked', async () => {
    renderWithProviders(<ResourceAccessPage />);
    
    // Find and click the activate button
    const activateButton = screen.getByText('Activate Resource Access');
    await act(async () => {
      fireEvent.click(activateButton);
    });
    
    // Check if the activate function was called with the correct ID
    expect(mockActivateResourceAccess).toHaveBeenCalledWith('2');
    
    // Check if a success toast was shown
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Success',
      description: 'Resource access activated successfully'
    }));
  });

  it('deactivates a resource access when deactivate button is clicked', async () => {
    renderWithProviders(<ResourceAccessPage />);
    
    // Find and click the deactivate button
    const deactivateButton = screen.getByText('Deactivate Resource Access');
    await act(async () => {
      fireEvent.click(deactivateButton);
    });
    
    // Check if the deactivate function was called with the correct ID
    expect(mockDeactivateResourceAccess).toHaveBeenCalledWith('1');
    
    // Check if a success toast was shown
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Success',
      description: 'Resource access deactivated successfully'
    }));
  });

  it('fetches resource accesses on page load', () => {
    renderWithProviders(<ResourceAccessPage />);
    
    // Check if fetch function was called
    expect(mockFetchResourceAccesses).toHaveBeenCalled();
  });
}); 