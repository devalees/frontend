/**
 * DepartmentForm Component Tests
 * 
 * This file contains tests for the DepartmentForm component.
 * It tests the component's rendering, interaction, and integration with the entity store.
 */

import { jest } from '@jest/globals';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { render } from '../../../../../tests/utils/testUtils';
import { Department, Organization } from '../../../../../types/entity';
import { EntityState } from '../../../../../store/slices/entitySlice';
import { DepartmentForm } from '../../../../../components/features/entity/departments/DepartmentForm';

// Mock the entity store
const mockOrganizations: Organization[] = [
  {
    id: 'org-1',
    name: 'Test Organization',
    description: 'Test Description',
    logo_url: 'https://example.com/logo.png',
    industry: 'Technology',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    is_active: true
  }
];

const mockDepartments: Department[] = [
  {
    id: 'dept-1',
    name: 'Test Department',
    organization_id: 'org-1',
    manager_id: 'user-1',
    description: 'Test Department Description',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    is_active: true
  }
];

// Mock the useEntityStore hook
jest.mock('../../../../../store/slices/entitySlice', () => ({
  useEntityStore: jest.fn()
}));

describe('DepartmentForm Component', () => {
  const mockFetchOrganizations = jest.fn<() => Promise<void>>().mockResolvedValue();
  const mockFetchDepartments = jest.fn<() => Promise<void>>().mockResolvedValue();
  const mockCreateDepartment = jest.fn<(department: Partial<Department>) => Promise<Department>>().mockImplementation(
    (department) => Promise.resolve({
      ...department,
      id: 'new-dept',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      is_active: true
    } as Department)
  );
  const mockUpdateDepartment = jest.fn<(id: string, department: Partial<Department>) => Promise<Department>>().mockImplementation(
    (id, department) => Promise.resolve({
      ...department,
      id,
      updated_at: '2024-01-01'
    } as Department)
  );

  beforeEach(() => {
    jest.clearAllMocks();
    // Set up the mock implementation for useEntityStore
    const mockStore: Partial<EntityState> = {
      organizations: mockOrganizations,
      departments: mockDepartments,
      teams: [],
      teamMembers: [],
      organizationSettings: [],
      loading: false,
      error: null,
      fetchOrganizations: mockFetchOrganizations,
      fetchDepartments: mockFetchDepartments,
      createDepartment: mockCreateDepartment,
      updateDepartment: mockUpdateDepartment,
      // Add empty implementations for required methods
      getOrganization: jest.fn(),
      createOrganization: jest.fn(),
      updateOrganization: jest.fn(),
      deleteOrganization: jest.fn(),
      hardDeleteOrganization: jest.fn(),
      getOrganizationDepartments: jest.fn(),
      getOrganizationTeams: jest.fn(),
      getOrganizationSettings: jest.fn(),
      getOrganizationGrowth: jest.fn(),
      getDepartment: jest.fn(),
      deleteDepartment: jest.fn(),
      hardDeleteDepartment: jest.fn(),
      getDepartmentTeams: jest.fn(),
      getDepartmentTeamMembers: jest.fn(),
      getChildDepartments: jest.fn(),
      getTeam: jest.fn(),
      createTeam: jest.fn(),
      updateTeam: jest.fn(),
      deleteTeam: jest.fn(),
      hardDeleteTeam: jest.fn(),
      getTeamMembers: jest.fn(),
      getTeamDepartments: jest.fn(),
      getTeamProjects: jest.fn(),
      getTeamTasks: jest.fn(),
      getTeamMember: jest.fn(),
      createTeamMember: jest.fn(),
      updateTeamMember: jest.fn(),
      deleteTeamMember: jest.fn(),
      hardDeleteTeamMember: jest.fn(),
      getTeamMemberTeams: jest.fn(),
      getTeamMemberDepartments: jest.fn(),
      getTeamMemberProjects: jest.fn(),
      getTeamMemberTasks: jest.fn(),
      getOrganizationSetting: jest.fn(),
      createOrganizationSetting: jest.fn(),
      updateOrganizationSetting: jest.fn(),
      deleteOrganizationSetting: jest.fn(),
      hardDeleteOrganizationSetting: jest.fn()
    };
    (jest.requireMock('../../../../../store/slices/entitySlice').useEntityStore as jest.Mock).mockReturnValue(mockStore);
  });

  it('renders department form correctly', () => {
    render(<DepartmentForm />);
    
    expect(screen.getByTestId('name-input')).toBeInTheDocument();
    expect(screen.getByTestId('organization-select')).toBeInTheDocument();
    expect(screen.getByTestId('manager-input')).toBeInTheDocument();
    expect(screen.getByTestId('description-input')).toBeInTheDocument();
  });

  it('loads organizations on mount', async () => {
    render(<DepartmentForm />);
    
    await waitFor(() => {
      expect(mockFetchOrganizations).toHaveBeenCalled();
    });
  });

  it('submits form with correct data', async () => {
    render(<DepartmentForm />);
    
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { value: 'New Department' }
    });
    
    fireEvent.change(screen.getByTestId('organization-select'), {
      target: { value: 'org-1' }
    });
    
    fireEvent.change(screen.getByTestId('manager-input'), {
      target: { value: 'user-1' }
    });
    
    fireEvent.change(screen.getByTestId('description-input'), {
      target: { value: 'New Description' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    
    await waitFor(() => {
      expect(mockCreateDepartment).toHaveBeenCalledWith({
        name: 'New Department',
        organization_id: 'org-1',
        manager_id: 'user-1',
        description: 'New Description',
        parent_department_id: '',
        budget: undefined,
        location: '',
        headcount: undefined,
        is_active: true
      });
    });
  });

  it('handles form submission errors', async () => {
    mockCreateDepartment.mockRejectedValueOnce(new Error('Failed to create department'));
    
    render(<DepartmentForm />);
    
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { value: 'New Department' }
    });
    
    fireEvent.change(screen.getByTestId('organization-select'), {
      target: { value: 'org-1' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Failed to create department');
    });
  });
}); 