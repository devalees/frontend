/**
 * OrganizationDetail Component Tests
 * 
 * This file contains tests for the OrganizationDetail component.
 * It tests the component's rendering and integration with the entity store.
 */

import { jest } from '@jest/globals';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/tests/utils/componentTestUtils';
import { Organization } from '@/types/entity';
import { useEntityStore } from '@/store/slices/entitySlice';
import { act } from 'react';
import type { EntityState } from '@/store/slices/entitySlice';

// Mock the entity store
jest.mock('@/store/slices/entitySlice', () => ({
  useEntityStore: jest.fn()
}));

// Mock data
const mockOrganization: Organization = {
  id: '1',
  name: 'Test Organization',
  description: 'Test Description',
  size: 'small',
  industry: 'Technology',
  website: 'https://example.com',
  logo_url: 'https://example.com/logo.png',
  founded_date: '2023-01-01',
  headquarters: 'New York',
  contact_email: 'contact@example.com',
  contact_phone: '+1234567890',
  settings_id: '1',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  is_active: true
};

// Import the actual component
import { OrganizationDetail } from '@/components/features/entity/organizations/OrganizationDetail';

describe('OrganizationDetail Component', () => {
  const mockedUseEntityStore = useEntityStore as jest.MockedFunction<typeof useEntityStore>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state correctly', () => {
    mockedUseEntityStore.mockReturnValue({
      loading: true,
      error: null,
      getOrganization: jest.fn((id: string) => Promise.resolve({} as Organization)),
      getOrganizationDepartments: jest.fn((id: string) => Promise.resolve([])),
      getOrganizationTeamMembers: jest.fn((id: string) => Promise.resolve([]))
    } as Partial<EntityState> as EntityState);

    renderWithProviders(<OrganizationDetail organizationId="1" />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('renders error state correctly', () => {
    mockedUseEntityStore.mockReturnValue({
      loading: false,
      error: 'Failed to load organization',
      getOrganization: jest.fn((id: string) => Promise.resolve({} as Organization)),
      getOrganizationDepartments: jest.fn((id: string) => Promise.resolve([])),
      getOrganizationTeamMembers: jest.fn((id: string) => Promise.resolve([]))
    } as Partial<EntityState> as EntityState);

    renderWithProviders(<OrganizationDetail organizationId="1" />);
    expect(screen.getByTestId('error')).toBeInTheDocument();
    expect(screen.getByText('Failed to load organization')).toBeInTheDocument();
  });

  it('renders not found state correctly', async () => {
    const mockGetOrganization = jest.fn((id: string) => Promise.reject(new Error('Organization not found')));
    mockedUseEntityStore.mockReturnValue({
      loading: false,
      error: null,
      getOrganization: mockGetOrganization,
      getOrganizationDepartments: jest.fn((id: string) => Promise.resolve([])),
      getOrganizationTeamMembers: jest.fn((id: string) => Promise.resolve([]))
    } as Partial<EntityState> as EntityState);

    await act(async () => {
      renderWithProviders(<OrganizationDetail organizationId="1" />);
    });

    expect(screen.getByTestId('not-found')).toBeInTheDocument();
  });

  it('renders organization details correctly', async () => {
    const mockGetOrganization = jest.fn((id: string) => Promise.resolve(mockOrganization));
    const mockGetDepartments = jest.fn((id: string) => Promise.resolve([]));
    const mockGetTeamMembers = jest.fn((id: string) => Promise.resolve([]));
    const handleEdit = jest.fn();
    const handleDelete = jest.fn();
    
    mockedUseEntityStore.mockReturnValue({
      loading: false,
      error: null,
      getOrganization: mockGetOrganization,
      getOrganizationDepartments: mockGetDepartments,
      getOrganizationTeamMembers: mockGetTeamMembers
    } as Partial<EntityState> as EntityState);

    await act(async () => {
      renderWithProviders(
        <OrganizationDetail 
          organizationId="1" 
          onEdit={handleEdit} 
          onDelete={handleDelete}
        />
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('organization-detail')).toBeInTheDocument();
    });

    expect(screen.getByText('Test Organization')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('small')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('https://example.com')).toBeInTheDocument();
    expect(screen.getByTestId('edit-button')).toBeInTheDocument();
    expect(screen.getByTestId('delete-button')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', async () => {
    const mockGetOrganization = jest.fn((id: string) => Promise.resolve(mockOrganization));
    const handleEdit = jest.fn();

    mockedUseEntityStore.mockReturnValue({
      loading: false,
      error: null,
      getOrganization: mockGetOrganization,
      getOrganizationDepartments: jest.fn((id: string) => Promise.resolve([])),
      getOrganizationTeamMembers: jest.fn((id: string) => Promise.resolve([]))
    } as Partial<EntityState> as EntityState);

    await act(async () => {
      renderWithProviders(<OrganizationDetail organizationId="1" onEdit={handleEdit} />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('edit-button')).toBeInTheDocument();
    });

    screen.getByTestId('edit-button').click();
    expect(handleEdit).toHaveBeenCalled();
  });

  it('calls onDelete when delete button is clicked', async () => {
    const mockGetOrganization = jest.fn((id: string) => Promise.resolve(mockOrganization));
    const handleDelete = jest.fn();

    mockedUseEntityStore.mockReturnValue({
      loading: false,
      error: null,
      getOrganization: mockGetOrganization,
      getOrganizationDepartments: jest.fn((id: string) => Promise.resolve([])),
      getOrganizationTeamMembers: jest.fn((id: string) => Promise.resolve([]))
    } as Partial<EntityState> as EntityState);

    await act(async () => {
      renderWithProviders(<OrganizationDetail organizationId="1" onDelete={handleDelete} />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('delete-button')).toBeInTheDocument();
    });

    screen.getByTestId('delete-button').click();
    expect(handleDelete).toHaveBeenCalled();
  });

  it('fetches organization on mount', async () => {
    const mockGetOrganization = jest.fn((id: string) => Promise.resolve(mockOrganization));
    mockedUseEntityStore.mockReturnValue({
      loading: false,
      error: null,
      getOrganization: mockGetOrganization,
      getOrganizationDepartments: jest.fn((id: string) => Promise.resolve([])),
      getOrganizationTeamMembers: jest.fn((id: string) => Promise.resolve([]))
    } as Partial<EntityState> as EntityState);

    await act(async () => {
      renderWithProviders(<OrganizationDetail organizationId="1" />);
    });

    expect(mockGetOrganization).toHaveBeenCalledWith('1');
  });
}); 