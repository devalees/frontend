import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { ResourceAccessList } from '@/components/features/rbac/ResourceAccessList';
import { useRbac } from '@/hooks/useRbac';
import { ResourceAccess } from '@/types/rbac';

// Mock the useRbac hook
jest.mock('@/hooks/useRbac');

const mockResourceAccesses: ResourceAccess[] = [
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
];

describe('ResourceAccessList', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnActivate = jest.fn();
  const mockOnDeactivate = jest.fn();
  const mockFetchResourceAccesses = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRbac as jest.Mock).mockReturnValue({
      resourceAccess: {
        data: mockResourceAccesses,
        loading: false,
        error: null
      },
      fetchResourceAccesses: mockFetchResourceAccesses
    });
  });

  it('renders the component with resource accesses', () => {
    render(
      <ResourceAccessList
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onActivate={mockOnActivate}
        onDeactivate={mockOnDeactivate}
      />
    );

    // Add console.log to debug what's rendered
    console.log('Rendered content:', document.body.innerHTML);
    
    expect(screen.getByText('resource1')).toBeInTheDocument();
    expect(screen.getByText('role1')).toBeInTheDocument();
    expect(screen.getByText('permission1')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    (useRbac as jest.Mock).mockReturnValue({
      resourceAccess: {
        data: null,
        loading: true,
        error: null
      },
      fetchResourceAccesses: mockFetchResourceAccesses
    });

    render(<ResourceAccessList />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('shows error state', () => {
    const errorMessage = 'Failed to load resource accesses';
    (useRbac as jest.Mock).mockReturnValue({
      resourceAccess: {
        data: null,
        loading: false,
        error: errorMessage
      },
      fetchResourceAccesses: mockFetchResourceAccesses
    });

    render(<ResourceAccessList />);
    expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
  });

  it('filters resource accesses based on search term', () => {
    render(<ResourceAccessList />);
    
    const searchInput = screen.getByPlaceholderText('Search resources...');
    fireEvent.change(searchInput, { target: { value: 'resource1' } });

    // Add console.log to debug filtered content
    console.log('Filtered content:', document.body.innerHTML);
    
    expect(screen.getByText('resource1')).toBeInTheDocument();
    expect(screen.queryByText('resource2')).not.toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(
      <ResourceAccessList
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onActivate={mockOnActivate}
        onDeactivate={mockOnDeactivate}
      />
    );

    // Find the row containing resource1 and then the edit button within that row
    const resource1Cell = screen.getByText('resource1');
    const row = resource1Cell.closest('tr');
    if (!row) throw new Error('Row not found');
    
    const editButton = within(row).getByText('Edit');
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockResourceAccesses[0]);
  });

  it('calls onDelete when delete button is clicked', () => {
    render(
      <ResourceAccessList
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onActivate={mockOnActivate}
        onDeactivate={mockOnDeactivate}
      />
    );

    // Find the row containing resource1 and then the delete button within that row
    const resource1Cell = screen.getByText('resource1');
    const row = resource1Cell.closest('tr');
    if (!row) throw new Error('Row not found');
    
    const deleteButton = within(row).getByText('Delete');
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith(mockResourceAccesses[0]);
  });

  it('calls onActivate when activate button is clicked', () => {
    render(
      <ResourceAccessList
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onActivate={mockOnActivate}
        onDeactivate={mockOnDeactivate}
      />
    );

    const activateButton = screen.getByText('Activate');
    fireEvent.click(activateButton);

    expect(mockOnActivate).toHaveBeenCalledWith(mockResourceAccesses[1]);
  });

  it('calls onDeactivate when deactivate button is clicked', () => {
    render(
      <ResourceAccessList
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onActivate={mockOnActivate}
        onDeactivate={mockOnDeactivate}
      />
    );

    const deactivateButton = screen.getByText('Deactivate');
    fireEvent.click(deactivateButton);

    expect(mockOnDeactivate).toHaveBeenCalledWith(mockResourceAccesses[0]);
  });
}); 