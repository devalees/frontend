/**
 * OrganizationList Component Tests
 * 
 * This file contains tests for the OrganizationList component.
 * It tests the component's rendering, interaction, and integration with the entity store.
 */

import { jest } from '@jest/globals';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/tests/utils/componentTestUtils';
import { Organization } from '@/types/entity';
import { useEntityStore } from '@/store/slices/entitySlice';

// Mock the entity store
jest.mock('@/store/slices/entitySlice', () => ({
  useEntityStore: jest.fn()
}));

// Import the component
import { OrganizationList } from '@/components/features/entity/organizations/OrganizationList';

describe('OrganizationList Component', () => {
  // Mock data
  const mockOrganizations: Organization[] = [
    {
      id: '1',
      name: 'Test Organization 1',
      description: 'Test Description 1',
      size: 'small',
      industry: 'Technology',
      website: 'https://example.com',
      logo_url: 'https://example.com/logo.png',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      is_active: true,
      parent_organization_id: null,
      project_id: null
    },
    {
      id: '2',
      name: 'Test Organization 2',
      description: 'Test Description 2',
      size: 'medium',
      industry: 'Finance',
      website: 'https://example2.com',
      logo_url: 'https://example2.com/logo.png',
      created_at: '2023-01-02T00:00:00Z',
      updated_at: '2023-01-02T00:00:00Z',
      is_active: true,
      parent_organization_id: null,
      project_id: null
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state correctly', () => {
    // Mock the store to return loading state
    (useEntityStore as jest.Mock).mockReturnValue({
      organizations: [],
      loading: true,
      error: null,
      fetchOrganizations: jest.fn()
    });

    renderWithProviders(<OrganizationList />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('renders error state correctly', () => {
    // Mock the store to return error state
    (useEntityStore as jest.Mock).mockReturnValue({
      organizations: [],
      loading: false,
      error: 'Failed to load organizations',
      fetchOrganizations: jest.fn()
    });

    renderWithProviders(<OrganizationList />);
    expect(screen.getByTestId('error')).toBeInTheDocument();
    expect(screen.getByText('Failed to load organizations')).toBeInTheDocument();
  });

  it('renders empty state correctly', () => {
    // Mock the store to return empty organizations
    (useEntityStore as jest.Mock).mockReturnValue({
      organizations: [],
      loading: false,
      error: null,
      fetchOrganizations: jest.fn()
    });

    renderWithProviders(<OrganizationList />);
    expect(screen.getByText('No organizations found')).toBeInTheDocument();
  });

  it('renders organizations correctly', () => {
    // Mock the store to return organizations
    (useEntityStore as jest.Mock).mockReturnValue({
      organizations: mockOrganizations,
      loading: false,
      error: null,
      fetchOrganizations: jest.fn()
    });

    renderWithProviders(<OrganizationList />);
    expect(screen.getByTestId('organization-list')).toBeInTheDocument();
    
    // Check if the organization names are in the document
    expect(screen.getByText('Test Organization 1')).toBeInTheDocument();
    expect(screen.getByText('Test Organization 2')).toBeInTheDocument();
  });

  it('fetches organizations on mount', async () => {
    // Mock the store with a fetch function
    const mockFetchOrganizations = jest.fn();
    (useEntityStore as jest.Mock).mockReturnValue({
      organizations: [],
      loading: false,
      error: null,
      fetchOrganizations: mockFetchOrganizations
    });

    renderWithProviders(<OrganizationList />);
    
    // Wait for the fetch to complete
    await waitFor(() => {
      expect(mockFetchOrganizations).toHaveBeenCalled();
    });
  });
}); 