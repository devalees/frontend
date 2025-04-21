/**
 * Roles Page Tests
 * 
 * Tests for the RBAC roles page, including:
 * - Page rendering
 * - Navigation
 * - Integration with components and hooks
 */

import React from 'react';
import { renderWithProviders } from '../../utils/componentTestUtils';
import { screen, fireEvent } from '@testing-library/react';
import RolesPage from '../../../app/(dashboard)/rbac/roles/page';
import { Role } from '../../../types/rbac';

// Mock the RBAC hook
jest.mock('../../../hooks/useRbac', () => ({
  useRbac: () => ({
    roles: {
      data: {
        results: [
          { 
            id: '1', 
            name: 'Admin', 
            description: 'Administrator role',
            is_active: true,
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z'
          },
          { 
            id: '2', 
            name: 'User', 
            description: 'Regular user role',
            is_active: true,
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z'
          },
        ],
        count: 2,
        next: null,
        previous: null,
      },
      fetch: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  }),
}));

// Mock the RoleList component
jest.mock('../../../components/features/rbac/RoleList', () => ({
  RoleList: ({ onEditRole }: { onEditRole?: (role: Role) => void }) => (
    <div data-testid="role-list">
      <button onClick={() => onEditRole && onEditRole({ 
        id: '1', 
        name: 'Admin', 
        description: 'Administrator role',
        is_active: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      })}>
        Edit Admin
      </button>
    </div>
  ),
}));

// Mock the RoleForm component
jest.mock('../../../components/features/rbac/RoleForm', () => ({
  RoleForm: ({ role, onClose }: { role?: Role; onClose: () => void }) => (
    <div data-testid="role-form">
      <button onClick={onClose}>Close Form</button>
    </div>
  ),
}));

describe('Roles Page', () => {
  it('renders the roles page correctly', () => {
    renderWithProviders(<RolesPage />);
    
    // Check if the page title is rendered
    expect(screen.getByText('Roles Management')).toBeInTheDocument();
    expect(screen.getByTestId('role-list')).toBeInTheDocument();
  });

  it('opens the role form when Add Role button is clicked', () => {
    renderWithProviders(<RolesPage />);
    
    // Click the Add Role button
    fireEvent.click(screen.getByText('Add Role'));
    
    // Check if the form is displayed
    expect(screen.getByTestId('role-form')).toBeInTheDocument();
  });

  it('opens the role form with role data when Edit button is clicked', () => {
    renderWithProviders(<RolesPage />);
    
    // Click the Edit button
    fireEvent.click(screen.getByText('Edit Admin'));
    
    // Check if the form is displayed
    expect(screen.getByTestId('role-form')).toBeInTheDocument();
  });

  it('closes the role form when Close button is clicked', () => {
    renderWithProviders(<RolesPage />);
    
    // Open the form
    fireEvent.click(screen.getByText('Add Role'));
    expect(screen.getByTestId('role-form')).toBeInTheDocument();
    
    // Close the form
    fireEvent.click(screen.getByText('Close Form'));
    expect(screen.queryByTestId('role-form')).not.toBeInTheDocument();
  });
}); 