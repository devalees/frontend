import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import OrganizationDetailPage from '@/app/(dashboard)/entities/organizations/[id]/page';
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

// Mock the OrganizationDetail component
jest.mock('@/components/features/entity/organizations/OrganizationDetail', () => ({
  OrganizationDetail: ({ 
    organizationId, 
    onEdit, 
    onDelete 
  }: { 
    organizationId: string; 
    onEdit: () => void; 
    onDelete: () => void; 
  }) => (
    <div data-testid="organization-detail">
      <div>Organization ID: {organizationId}</div>
      <button 
        data-testid="edit-button" 
        onClick={onEdit}
      >
        Edit
      </button>
      <button 
        data-testid="delete-button" 
        onClick={onDelete}
      >
        Delete
      </button>
    </div>
  ),
}));

describe('OrganizationDetailPage', () => {
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
    (useEntityStore as jest.Mock).mockReturnValue({
      deleteOrganization: mockDeleteOrganization,
    });
    (useToast as jest.Mock).mockReturnValue(mockToast);
    
    // Mock window.confirm
    window.confirm = jest.fn(() => true);
  });

  it('renders the organization detail page with title and breadcrumbs', () => {
    render(<OrganizationDetailPage params={{ id: '1' }} />);
    
    expect(screen.getByRole('heading', { name: 'Organization Details' })).toBeInTheDocument();
    expect(screen.getByText('View and manage organization details, departments, and team members')).toBeInTheDocument();
    expect(screen.getByTestId('organization-detail')).toBeInTheDocument();
  });

  it('navigates to edit page when edit button is clicked', () => {
    render(<OrganizationDetailPage params={{ id: '1' }} />);
    
    fireEvent.click(screen.getByTestId('edit-button'));
    
    expect(mockRouter.push).toHaveBeenCalledWith('/entities/organizations/1/edit');
  });

  it('deletes organization and navigates back to list when delete button is clicked and confirmed', async () => {
    render(<OrganizationDetailPage params={{ id: '1' }} />);
    
    fireEvent.click(screen.getByTestId('delete-button'));
    
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this organization?');
    
    await waitFor(() => {
      expect(mockDeleteOrganization).toHaveBeenCalledWith('1');
      expect(mockToast.toast).toHaveBeenCalledWith({
        title: 'Organization deleted',
        description: 'The organization has been successfully deleted.',
      });
      expect(mockRouter.push).toHaveBeenCalledWith('/entities/organizations');
    });
  });

  it('shows error toast when organization deletion fails', async () => {
    mockDeleteOrganization.mockRejectedValueOnce(new Error('Delete failed'));
    
    render(<OrganizationDetailPage params={{ id: '1' }} />);
    
    fireEvent.click(screen.getByTestId('delete-button'));
    
    await waitFor(() => {
      expect(mockToast.toast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to delete organization. Please try again.',
        variant: 'destructive',
      });
    });
  });

  it('does not delete organization when delete is not confirmed', () => {
    window.confirm = jest.fn(() => false);
    
    render(<OrganizationDetailPage params={{ id: '1' }} />);
    
    fireEvent.click(screen.getByTestId('delete-button'));
    
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this organization?');
    expect(mockDeleteOrganization).not.toHaveBeenCalled();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
}); 