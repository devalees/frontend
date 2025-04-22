import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import OrganizationsPage from '@/app/(dashboard)/entities/organizations/page';
import { useEntityStore } from '@/store/slices/entitySlice';
import { useToast } from '@/components/ui/use-toast';
import { Organization } from '@/types/entity';

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the entity store
jest.mock('@/store/slices/entitySlice', () => ({
  useEntityStore: jest.fn(),
}));

// Mock the toast component
jest.mock('@/components/ui/use-toast', () => ({
  useToast: jest.fn(),
}));

// Mock the OrganizationList component
jest.mock('@/components/features/entity/organizations/OrganizationList', () => ({
  OrganizationList: ({ 
    onViewDetails, 
    onEdit, 
    onDelete 
  }: { 
    onViewDetails: (org: Organization) => void; 
    onEdit: (org: Organization) => void; 
    onDelete: (org: Organization) => void; 
  }) => (
    <div data-testid="organization-list">
      <button 
        data-testid="view-details-button" 
        onClick={() => onViewDetails({ id: '1', name: 'Test Org' } as Organization)}
      >
        View Details
      </button>
      <button 
        data-testid="edit-button" 
        onClick={() => onEdit({ id: '1', name: 'Test Org' } as Organization)}
      >
        Edit
      </button>
      <button 
        data-testid="delete-button" 
        onClick={() => onDelete({ id: '1', name: 'Test Org' } as Organization)}
      >
        Delete
      </button>
    </div>
  ),
}));

describe('OrganizationsPage', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockDeleteOrganization = jest.fn();
  const mockToast = {
    toast: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useEntityStore as unknown as jest.Mock).mockReturnValue({
      deleteOrganization: mockDeleteOrganization,
    });
    (useToast as jest.Mock).mockReturnValue(mockToast);
    
    // Mock window.confirm
    window.confirm = jest.fn(() => true);
  });

  it('renders the organizations page with title and breadcrumbs', () => {
    render(<OrganizationsPage />);
    
    expect(screen.getByRole('heading', { name: 'Organizations' })).toBeInTheDocument();
    expect(screen.getByText('Manage your organizations, departments, and teams')).toBeInTheDocument();
    expect(screen.getByTestId('create-organization-button')).toBeInTheDocument();
  });

  it('navigates to create new organization page when create button is clicked', () => {
    render(<OrganizationsPage />);
    
    fireEvent.click(screen.getByTestId('create-organization-button'));
    
    expect(mockRouter.push).toHaveBeenCalledWith('/entities/organizations/new');
  });

  it('navigates to organization details page when view details button is clicked', () => {
    render(<OrganizationsPage />);
    
    fireEvent.click(screen.getByTestId('view-details-button'));
    
    expect(mockRouter.push).toHaveBeenCalledWith('/entities/organizations/1');
  });

  it('navigates to organization edit page when edit button is clicked', () => {
    render(<OrganizationsPage />);
    
    fireEvent.click(screen.getByTestId('edit-button'));
    
    expect(mockRouter.push).toHaveBeenCalledWith('/entities/organizations/1/edit');
  });

  it('deletes organization when delete button is clicked and confirmed', async () => {
    render(<OrganizationsPage />);
    
    fireEvent.click(screen.getByTestId('delete-button'));
    
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete Test Org?');
    
    await waitFor(() => {
      expect(mockDeleteOrganization).toHaveBeenCalledWith('1');
      expect(mockToast.toast).toHaveBeenCalledWith({
        title: 'Organization deleted',
        description: 'Test Org has been successfully deleted.',
      });
    });
  });

  it('shows error toast when organization deletion fails', async () => {
    mockDeleteOrganization.mockRejectedValueOnce(new Error('Delete failed'));
    
    render(<OrganizationsPage />);
    
    fireEvent.click(screen.getByTestId('delete-button'));
    
    await waitFor(() => {
      expect(mockToast.toast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to delete organization. Please try again.',
        variant: 'destructive',
      });
    });
  });
}); 