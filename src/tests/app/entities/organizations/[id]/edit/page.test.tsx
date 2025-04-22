import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import OrganizationEditPage from '@/app/(dashboard)/entities/organizations/[id]/edit/page';
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

// Mock the toast hook
jest.mock('@/components/ui/use-toast', () => ({
  useToast: jest.fn(),
}));

// Mock the OrganizationForm component
jest.mock('@/components/features/entity/organizations/OrganizationForm', () => ({
  OrganizationForm: ({ onSubmit, onCancel }: any) => (
    <div data-testid="mock-organization-form">
      <button onClick={() => onSubmit({ name: 'Updated Org' })}>Submit</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

describe('OrganizationEditPage', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockToast = {
    toast: jest.fn(),
  };

  const mockOrganization: Organization = {
    id: '1',
    name: 'Test Organization',
    description: 'Test Description',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    is_active: true,
  };

  const mockGetOrganization = jest.fn();
  const mockUpdateOrganization = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useToast as jest.Mock).mockReturnValue(mockToast);
    ((useEntityStore as unknown) as jest.Mock).mockReturnValue({
      getOrganization: mockGetOrganization,
      updateOrganization: mockUpdateOrganization,
    });
  });

  it('renders the organization edit page with loading state', () => {
    mockGetOrganization.mockImplementation(() => new Promise(() => {}));
    render(<OrganizationEditPage params={{ id: '1' }} />);
    expect(screen.getByText('Edit Organization')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Edit Organization' })).toBeInTheDocument();
    expect(screen.getByText('Update organization details and settings')).toBeInTheDocument();
  });

  it('loads and displays organization data', async () => {
    mockGetOrganization.mockResolvedValue(mockOrganization);
    render(<OrganizationEditPage params={{ id: '1' }} />);
    
    await waitFor(() => {
      expect(mockGetOrganization).toHaveBeenCalledWith('1');
    });
    
    expect(screen.getByTestId('mock-organization-form')).toBeInTheDocument();
  });

  it('handles organization update successfully', async () => {
    mockGetOrganization.mockResolvedValue(mockOrganization);
    mockUpdateOrganization.mockResolvedValue(undefined);
    
    render(<OrganizationEditPage params={{ id: '1' }} />);
    
    await waitFor(() => {
      expect(mockGetOrganization).toHaveBeenCalledWith('1');
    });
    
    fireEvent.click(screen.getByText('Submit'));
    
    await waitFor(() => {
      expect(mockUpdateOrganization).toHaveBeenCalledWith('1', { name: 'Updated Org' });
      expect(mockToast.toast).toHaveBeenCalledWith({
        title: 'Organization updated',
        description: 'The organization has been successfully updated.',
      });
      expect(mockRouter.push).toHaveBeenCalledWith('/entities/organizations/1');
    });
  });

  it('handles organization update error', async () => {
    mockGetOrganization.mockResolvedValue(mockOrganization);
    mockUpdateOrganization.mockRejectedValue(new Error('Update failed'));
    
    render(<OrganizationEditPage params={{ id: '1' }} />);
    
    await waitFor(() => {
      expect(mockGetOrganization).toHaveBeenCalledWith('1');
    });
    
    fireEvent.click(screen.getByText('Submit'));
    
    await waitFor(() => {
      expect(mockToast.toast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to update organization. Please try again.',
        variant: 'destructive',
      });
    });
  });

  it('handles cancel action', async () => {
    mockGetOrganization.mockResolvedValue(mockOrganization);
    
    render(<OrganizationEditPage params={{ id: '1' }} />);
    
    await waitFor(() => {
      expect(mockGetOrganization).toHaveBeenCalledWith('1');
    });
    
    fireEvent.click(screen.getByText('Cancel'));
    
    expect(mockRouter.push).toHaveBeenCalledWith('/entities/organizations/1');
  });

  it('handles organization fetch error', async () => {
    mockGetOrganization.mockRejectedValue(new Error('Fetch failed'));
    
    render(<OrganizationEditPage params={{ id: '1' }} />);
    
    await waitFor(() => {
      expect(mockToast.toast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to load organization details. Please try again.',
        variant: 'destructive',
      });
    });
  });
}); 