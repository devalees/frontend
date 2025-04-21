/**
 * ResourceList Component Tests
 * 
 * Tests for the ResourceList component which displays a list of resources.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { componentTestHarness } from '../../../../tests/utils/componentTestUtils';
import { mockApiMethod, resetApiMocks } from '../../../../tests/utils/mockApi';
import { Resource } from '../../../../types/rbac';
import { useRbac } from '../../../../hooks/useRbac';
import { ResourceList } from '../../../../components/features/rbac/ResourceList';

// Mock the useRbac hook
jest.mock('../../../../hooks/useRbac', () => ({
  useRbac: jest.fn()
}));

// Mock data
const mockResources: Resource[] = [
  {
    id: '1',
    name: 'User Management',
    type: 'module',
    description: 'User management module',
    is_active: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Project Management',
    type: 'module',
    description: 'Project management module',
    is_active: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Document Storage',
    type: 'storage',
    description: 'Document storage module',
    is_active: false,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  }
];

// Mock the useRbac hook implementation
const mockUseRbac = useRbac as jest.Mock;

describe('ResourceList Component', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnViewAccess = jest.fn();

  beforeEach(() => {
    resetApiMocks();
    
    // Default mock implementation
    mockUseRbac.mockReturnValue({
      resources: {
        data: mockResources,
        loading: false,
        error: null
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the component with resources', () => {
    render(
      <ResourceList
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onViewAccess={mockOnViewAccess}
      />
    );

    // Check if resources are rendered
    expect(screen.getByText('User Management')).toBeInTheDocument();
    expect(screen.getByText('Project Management')).toBeInTheDocument();
    expect(screen.getByText('Document Storage')).toBeInTheDocument();

    // Check if resource types are rendered as badges
    expect(screen.getAllByText('module')).toHaveLength(2);
    expect(screen.getByText('storage')).toBeInTheDocument();

    // Check if descriptions are rendered
    expect(screen.getByText('User management module')).toBeInTheDocument();
    expect(screen.getByText('Project management module')).toBeInTheDocument();
    expect(screen.getByText('Document storage module')).toBeInTheDocument();
  });

  it('should display loading state when fetching resources', () => {
    mockUseRbac.mockReturnValue({
      resources: {
        data: null,
        loading: true,
        error: null
      }
    });

    render(
      <ResourceList
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onViewAccess={mockOnViewAccess}
      />
    );

    // Check for the Spinner component
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('should display error state when fetching resources fails', () => {
    const errorMessage = 'Failed to fetch resources';
    mockUseRbac.mockReturnValue({
      resources: {
        data: null,
        loading: false,
        error: errorMessage
      }
    });

    render(
      <ResourceList
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onViewAccess={mockOnViewAccess}
      />
    );

    expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
  });

  it('should filter resources when search input is used', () => {
    render(
      <ResourceList
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onViewAccess={mockOnViewAccess}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search resources...');
    fireEvent.change(searchInput, { target: { value: 'User' } });

    // Only User Management should be visible
    expect(screen.getByText('User Management')).toBeInTheDocument();
    expect(screen.queryByText('Project Management')).not.toBeInTheDocument();
    expect(screen.queryByText('Document Storage')).not.toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', () => {
    render(
      <ResourceList
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onViewAccess={mockOnViewAccess}
      />
    );

    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    expect(mockOnEdit).toHaveBeenCalledWith(mockResources[0]);
  });

  it('should call onDelete when delete button is clicked', () => {
    render(
      <ResourceList
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onViewAccess={mockOnViewAccess}
      />
    );

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(mockOnDelete).toHaveBeenCalledWith(mockResources[0]);
  });

  it('should call onViewAccess when view access button is clicked', () => {
    render(
      <ResourceList
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onViewAccess={mockOnViewAccess}
      />
    );

    const viewAccessButtons = screen.getAllByText('View Access');
    fireEvent.click(viewAccessButtons[0]);

    expect(mockOnViewAccess).toHaveBeenCalledWith(mockResources[0]);
  });

  it('should handle pagination correctly', () => {
    render(
      <ResourceList
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onViewAccess={mockOnViewAccess}
      />
    );

    // Check initial state
    expect(screen.getByText('Showing 3 of 3 resources')).toBeInTheDocument();

    // Click next button (should be disabled since we're on the last page)
    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeDisabled();

    // Click previous button (should be disabled since we're on the first page)
    const previousButton = screen.getByText('Previous');
    expect(previousButton).toBeDisabled();
  });
}); 