/**
 * @file OrganizationContextList.test.tsx
 * @description Tests for the OrganizationContextList component that displays a list of organization contexts
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OrganizationContextList } from '@/components/features/rbac/organization-contexts/OrganizationContextList';
import { useRbac } from '@/hooks/useRbac';
import { OrganizationContext } from '@/types/rbac';

// Mock the useRbac hook
jest.mock('@/hooks/useRbac');

const mockOrganizationContexts: OrganizationContext[] = [
  {
    id: '1',
    name: 'Test Context 1',
    description: 'Test Description 1',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Test Context 2',
    description: 'Test Description 2',
    is_active: false,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z'
  }
];

describe('OrganizationContextList', () => {
  const mockFetchOrganizationContexts = jest.fn();
  const mockDeleteOrganizationContext = jest.fn();
  const mockActivateOrganizationContext = jest.fn();
  const mockDeactivateOrganizationContext = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRbac as jest.Mock).mockImplementation(() => ({
      organizationContexts: {
        data: mockOrganizationContexts,
        loading: false,
        error: null
      },
      fetchOrganizationContexts: mockFetchOrganizationContexts,
      deleteOrganizationContext: mockDeleteOrganizationContext,
      activateOrganizationContext: mockActivateOrganizationContext,
      deactivateOrganizationContext: mockDeactivateOrganizationContext
    }));
  });

  it('renders the organization contexts list', () => {
    render(<OrganizationContextList />);
    
    expect(screen.getByText('Test Context 1')).toBeInTheDocument();
    expect(screen.getByText('Test Description 1')).toBeInTheDocument();
    expect(screen.getByText('Test Context 2')).toBeInTheDocument();
    expect(screen.getByText('Test Description 2')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    (useRbac as jest.Mock).mockImplementation(() => ({
      organizationContexts: {
        data: null,
        loading: true,
        error: null
      },
      fetchOrganizationContexts: mockFetchOrganizationContexts
    }));

    render(<OrganizationContextList />);
    expect(screen.getByText('Loading organization contexts...')).toBeInTheDocument();
  });

  it('displays error state', () => {
    const errorMessage = 'Failed to load organization contexts';
    (useRbac as jest.Mock).mockImplementation(() => ({
      organizationContexts: {
        data: null,
        loading: false,
        error: errorMessage
      },
      fetchOrganizationContexts: mockFetchOrganizationContexts
    }));

    render(<OrganizationContextList />);
    expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
  });

  it('filters organization contexts based on search term', async () => {
    render(<OrganizationContextList />);
    
    const searchInput = screen.getByPlaceholderText('Search organization contexts...');
    fireEvent.change(searchInput, { target: { value: 'Context 1' } });

    await waitFor(() => {
      expect(screen.getByText('Test Context 1')).toBeInTheDocument();
      expect(screen.queryByText('Test Context 2')).not.toBeInTheDocument();
    });
  });

  it('handles organization context deletion', async () => {
    window.confirm = jest.fn(() => true);
    render(<OrganizationContextList />);
    
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockDeleteOrganizationContext).toHaveBeenCalledWith('1');
    });
  });

  it('handles organization context activation', async () => {
    render(<OrganizationContextList />);
    
    const activateButton = screen.getByText('Activate');
    fireEvent.click(activateButton);

    await waitFor(() => {
      expect(mockActivateOrganizationContext).toHaveBeenCalledWith('2');
    });
  });

  it('handles organization context deactivation', async () => {
    render(<OrganizationContextList />);
    
    const deactivateButton = screen.getByText('Deactivate');
    fireEvent.click(deactivateButton);

    await waitFor(() => {
      expect(mockDeactivateOrganizationContext).toHaveBeenCalledWith('1');
    });
  });
}); 