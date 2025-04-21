/**
 * Resources Page Tests
 * 
 * Tests for the RBAC resources page, including:
 * - Page rendering
 * - Navigation
 * - Integration with components and hooks
 */

import React from 'react';
import { renderWithProviders } from '../../../utils/componentTestUtils';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import ResourcesPage from '../../../../app/(dashboard)/rbac/resources/page';
import { Resource, ResourceAccess } from '../../../../types/rbac';

// Define extended resources interface for testing
interface ExtendedResources {
  data: Resource[];
  fetch: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
  remove: jest.Mock;
  loading: boolean;
  error: null | string;
}

// Mock the RBAC hook
const mockCreate = jest.fn(() => Promise.resolve());
const mockUpdate = jest.fn(() => Promise.resolve());
const mockRemove = jest.fn(() => Promise.resolve());

jest.mock('../../../../hooks/useRbac', () => ({
  useRbac: () => ({
    resources: {
      data: [
        { 
          id: '1', 
          name: 'Project Module', 
          description: 'Main project management module',
          type: 'module',
          is_active: true,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z'
        },
        { 
          id: '2', 
          name: 'Document Storage', 
          description: 'Document storage system',
          type: 'storage',
          is_active: true,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z'
        },
      ],
      fetch: jest.fn(() => Promise.resolve()),
      create: mockCreate,
      update: mockUpdate,
      remove: mockRemove,
      loading: false,
      error: null
    },
    roles: {
      data: [],
      loading: false,
      error: null
    },
    permissions: {
      data: [],
      loading: false,
      error: null
    }
  }),
}));

// Mock the ResourceList component
jest.mock('../../../../components/features/rbac/ResourceList', () => ({
  ResourceList: ({ 
    onEdit, 
    onDelete, 
    onViewAccess 
  }: { 
    onEdit?: (resource: Resource) => void, 
    onDelete?: (resource: Resource) => void,
    onViewAccess?: (resource: Resource) => void 
  }) => (
    <div data-testid="resource-list">
      <button onClick={() => onEdit && onEdit({ 
        id: '1', 
        name: 'Project Module', 
        description: 'Main project management module',
        type: 'module',
        is_active: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      })}>
        Edit Resource
      </button>
      <button onClick={() => onDelete && onDelete({ 
        id: '1', 
        name: 'Project Module', 
        description: 'Main project management module',
        type: 'module',
        is_active: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      })}>
        Delete Resource
      </button>
      <button onClick={() => onViewAccess && onViewAccess({ 
        id: '1', 
        name: 'Project Module', 
        description: 'Main project management module',
        type: 'module',
        is_active: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      })}>
        View Access
      </button>
    </div>
  ),
}));

// Mock the ResourceForm component
jest.mock('../../../../components/features/rbac/ResourceForm', () => ({
  ResourceForm: ({ 
    resource, 
    onSubmit, 
    onCancel 
  }: { 
    resource?: Resource; 
    onSubmit: (data: Partial<Resource>) => void; 
    onCancel: () => void; 
  }) => (
    <div data-testid="resource-form">
      <span>{resource ? `Edit Resource: ${resource.name}` : 'Add New Resource'}</span>
      <button data-testid="cancel-form-btn" onClick={onCancel}>Cancel</button>
      <button 
        data-testid="submit-form-btn" 
        onClick={() => {
          onSubmit({
            name: 'Updated Resource',
            type: 'module',
            description: 'Updated description',
            is_active: true
          });
        }}
      >
        Submit
      </button>
    </div>
  ),
}));

// Mock the ResourceAccessForm component
jest.mock('../../../../components/features/rbac/ResourceAccessForm', () => ({
  ResourceAccessForm: ({
    initialData,
    onSubmit,
    onCancel,
    isLoading,
    error
  }: {
    initialData?: Partial<ResourceAccess>;
    onSubmit: (data: Partial<ResourceAccess>) => Promise<void>;
    onCancel?: () => void;
    isLoading?: boolean;
    error?: string;
  }) => (
    <div data-testid="resource-access-form">
      <span>Access Management: {initialData?.resource_id ? `Resource ${initialData.resource_id}` : 'New Access'}</span>
      <button 
        data-testid="submit-access-btn"
        onClick={() => {
          onSubmit({
            resource_id: initialData?.resource_id || '1',
            role_id: '1',
            permission_id: '1'
          });
        }}
      >
        Submit Access
      </button>
      {onCancel && (
        <button data-testid="close-access-btn" onClick={onCancel}>
          Close
        </button>
      )}
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
  Trash2: () => <span data-testid="trash-icon">🗑</span>,
  Shield: () => <span data-testid="shield-icon">🛡</span>,
}));

// Mock window.confirm
const originalConfirm = window.confirm;

describe('Resources Page', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Mock window.confirm to return true
    window.confirm = jest.fn(() => true);
  });

  afterEach(() => {
    // Restore original window.confirm
    window.confirm = originalConfirm;
  });

  it('renders the resources page correctly', () => {
    renderWithProviders(<ResourcesPage />);
    
    // Check if the page title is rendered
    expect(screen.getByText('Resources Management')).toBeInTheDocument();
    expect(screen.getByTestId('resource-list')).toBeInTheDocument();
  });

  it('opens the resource form when Add Resource button is clicked', async () => {
    renderWithProviders(<ResourcesPage />);
    
    // Click the Add Resource button
    await act(async () => {
      fireEvent.click(screen.getByText('Add Resource'));
    });
    
    // Check if the form is displayed
    expect(screen.getByTestId('resource-form')).toBeInTheDocument();
    
    // Use querySelector to be more specific about which element we want
    const formTitle = screen.getByTestId('resource-form').querySelector('span');
    expect(formTitle).toHaveTextContent('Add New Resource');
  });

  it('opens the resource form with resource data when Edit button is clicked', async () => {
    renderWithProviders(<ResourcesPage />);
    
    // Click the Edit button in the resource list
    await act(async () => {
      fireEvent.click(screen.getByText('Edit Resource'));
    });
    
    // Check if the form is displayed with resource data
    expect(screen.getByTestId('resource-form')).toBeInTheDocument();
    
    const formTitle = screen.getByTestId('resource-form').querySelector('span');
    expect(formTitle).toHaveTextContent('Edit Resource: Project Module');
  });

  it('closes the resource form when Cancel button is clicked', async () => {
    renderWithProviders(<ResourcesPage />);
    
    // Open the form
    await act(async () => {
      fireEvent.click(screen.getByText('Add Resource'));
    });
    
    expect(screen.getByTestId('resource-form')).toBeInTheDocument();
    
    // Close the form
    await act(async () => {
      fireEvent.click(screen.getByTestId('cancel-form-btn'));
    });
    
    expect(screen.queryByTestId('resource-form')).not.toBeInTheDocument();
  });

  it('opens the resource access form when View Access button is clicked', async () => {
    renderWithProviders(<ResourcesPage />);
    
    // Click the View Access button
    await act(async () => {
      fireEvent.click(screen.getByText('View Access'));
    });
    
    // Check if the access form is displayed
    expect(screen.getByTestId('resource-access-form')).toBeInTheDocument();
    expect(screen.getByText('Access Management: Resource 1')).toBeInTheDocument();
  });

  it('closes the resource access form when Close button is clicked', async () => {
    renderWithProviders(<ResourcesPage />);
    
    // Open the access form
    await act(async () => {
      fireEvent.click(screen.getByText('View Access'));
    });
    
    expect(screen.getByTestId('resource-access-form')).toBeInTheDocument();
    
    // Close the form
    await act(async () => {
      fireEvent.click(screen.getByTestId('close-access-btn'));
    });
    
    expect(screen.queryByTestId('resource-access-form')).not.toBeInTheDocument();
  });

  it('navigates through breadcrumbs', () => {
    renderWithProviders(<ResourcesPage />);
    
    // Check if breadcrumbs are rendered correctly
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('RBAC')).toBeInTheDocument();
    
    // Use more specific selector for the Resources breadcrumb
    const breadcrumbResources = screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === 'span' && 
             element?.className.includes('font-medium') && 
             content === 'Resources';
    });
    
    expect(breadcrumbResources).toBeInTheDocument();
  });

  it('handles resource deletion with confirmation', async () => {
    renderWithProviders(<ResourcesPage />);
    
    // Click delete
    await act(async () => {
      fireEvent.click(screen.getByText('Delete Resource'));
    });
    
    // Verify confirm was called
    expect(window.confirm).toHaveBeenCalledWith(
      'Are you sure you want to delete the resource "Project Module"?'
    );
    
    // The toast should be called with success message
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Success',
        description: expect.stringContaining('deleted successfully')
      }));
    });
  });

  it('handles form submission for new resource creation', async () => {
    renderWithProviders(<ResourcesPage />);
    
    // Open the form
    await act(async () => {
      fireEvent.click(screen.getByText('Add Resource'));
    });
    
    // Submit the form
    await act(async () => {
      fireEvent.click(screen.getByTestId('submit-form-btn'));
    });
    
    // The toast should be called with success message
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Success',
        description: expect.stringContaining('created successfully')
      }));
    });
    
    // The form should be closed
    expect(screen.queryByTestId('resource-form')).not.toBeInTheDocument();
  });

  it('handles form submission for resource update', async () => {
    renderWithProviders(<ResourcesPage />);
    
    // Open the form with existing resource
    await act(async () => {
      fireEvent.click(screen.getByText('Edit Resource'));
    });
    
    // Submit the form
    await act(async () => {
      fireEvent.click(screen.getByTestId('submit-form-btn'));
    });
    
    // The toast should be called with success message
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Success',
        description: expect.stringContaining('updated successfully')
      }));
    });
    
    // The form should be closed
    expect(screen.queryByTestId('resource-form')).not.toBeInTheDocument();
  });

  it('handles resource access form submission', async () => {
    renderWithProviders(<ResourcesPage />);
    
    // Open the access form
    await act(async () => {
      fireEvent.click(screen.getByText('View Access'));
    });
    
    // Submit the access form
    await act(async () => {
      fireEvent.click(screen.getByTestId('submit-access-btn'));
    });
    
    // The toast should be called with success message
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Success'
      }));
    });
    
    // The form should be closed after successful submission
    expect(screen.queryByTestId('resource-access-form')).not.toBeInTheDocument();
  });
}); 