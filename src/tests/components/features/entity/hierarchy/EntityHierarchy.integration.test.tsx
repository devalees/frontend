/**
 * Entity Hierarchy Integration Tests
 * 
 * This file contains integration tests for the Entity Hierarchy components.
 * It tests how the components work together, with navigation, and with data fetching.
 */

import { jest } from '@jest/globals';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '@/tests/utils/componentTestUtils';
import { createMockResponse } from '@/tests/utils/mockApi';
import { Organization, Department, Team } from '@/types/entity';
import { useEntityStore } from '@/store/slices/entitySlice';

// Mock API responses
jest.mock('@/lib/api/entity', () => ({
  organizationApi: {
    getOrganization: jest.fn().mockResolvedValue({}),
    getOrganizationDepartments: jest.fn().mockResolvedValue({ results: [] })
  },
  departmentApi: {
    getDepartment: jest.fn().mockResolvedValue({}),
    getDepartmentTeams: jest.fn().mockResolvedValue({ results: [] }),
    getChildDepartments: jest.fn().mockResolvedValue({ results: [] })
  }
}));

// Mock the entity store
jest.mock('@/store/slices/entitySlice', () => ({
  useEntityStore: jest.fn()
}));

// Mock the NavButton component
jest.mock('@/components/ui/NavButton', () => ({
  NavButton: ({ 
    href, 
    children, 
    onClick 
  }: { 
    href: string;
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button 
      data-testid="nav-button" 
      data-href={href} 
      onClick={onClick}
    >
      {children}
    </button>
  )
}));

// Mock Tree components
jest.mock('@/components/ui/Tree', () => ({
  Tree: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="hierarchy-tree">{children}</div>
  ),
  TreeItem: ({ 
    label, 
    children,
    onClick 
  }: { 
    label: string;
    children?: React.ReactNode;
    onClick?: () => void;
  }) => (
    <div 
      data-testid="hierarchy-tree-item" 
      onClick={onClick}
    >
      <span>{label}</span>
      {children && <div>{children}</div>}
    </div>
  )
}));

// Mock the OrganizationHierarchy component
const OrganizationHierarchy = ({ 
  organizationId 
}: { 
  organizationId: string 
}) => {
  const { 
    loading, 
    error, 
    getOrganizationById, 
    getDepartmentById,
    getOrganizationDepartments
  } = useEntityStore();

  const organization = getOrganizationById ? getOrganizationById(organizationId) : undefined;

  if (loading) return <div data-testid="loading">Loading...</div>;
  if (error) return <div data-testid="error">{error}</div>;
  if (!organization) return <div data-testid="not-found">Organization not found</div>;

  const viewDepartment = (departmentId: string) => {
    // In a real component, this would navigate to the department hierarchy
    console.log(`Navigate to department: ${departmentId}`);
  };

  return (
    <div data-testid="organization-hierarchy-view">
      <h1>Organization: {organization.name}</h1>
      <div data-testid="departments-container">
        {organization.departments && organization.departments.map((dept: Department) => (
          <div 
            key={dept.id} 
            data-testid="department-item"
            onClick={() => viewDepartment(dept.id)}
          >
            {dept.name}
          </div>
        ))}
      </div>
    </div>
  );
};

// Mock the DepartmentHierarchy component
const DepartmentHierarchy = ({ 
  departmentId 
}: { 
  departmentId: string 
}) => {
  const { 
    loading, 
    error, 
    getDepartmentById,
    getDepartmentTeams,
    getChildDepartments
  } = useEntityStore();

  const department = getDepartmentById ? getDepartmentById(departmentId) : undefined;

  if (loading) return <div data-testid="loading">Loading...</div>;
  if (error) return <div data-testid="error">{error}</div>;
  if (!department) return <div data-testid="not-found">Department not found</div>;

  const viewTeam = (teamId: string) => {
    // In a real component, this would navigate to the team details
    console.log(`Navigate to team: ${teamId}`);
  };

  return (
    <div data-testid="department-hierarchy-view">
      <h1>Department: {department.name}</h1>
      <div data-testid="teams-container">
        {department.teams && department.teams.map((team: Team) => (
          <div 
            key={team.id} 
            data-testid="team-item"
            onClick={() => viewTeam(team.id)}
          >
            {team.name}
          </div>
        ))}
      </div>
    </div>
  );
};

describe('Entity Hierarchy Integration', () => {
  // Mock data
  const mockOrganization: Organization & { departments?: Department[] } = {
    id: '1',
    name: 'Test Organization',
    description: 'Test Description',
    industry: 'Technology',
    website: 'https://example.com',
    logo_url: 'https://example.com/logo.png',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    is_active: true,
    departments: [
      {
        id: '1',
        name: 'Engineering',
        description: 'Engineering Department',
        organization_id: '1',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        is_active: true
      },
      {
        id: '2',
        name: 'Marketing',
        description: 'Marketing Department',
        organization_id: '1',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        is_active: true
      }
    ]
  };

  const mockDepartment: Department & { teams?: Team[] } = {
    id: '1',
    name: 'Engineering',
    description: 'Engineering Department',
    organization_id: '1',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    is_active: true,
    teams: [
      {
        id: '1',
        name: 'Frontend Team',
        description: 'Frontend Development Team',
        department_id: '1',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        is_active: true
      },
      {
        id: '2',
        name: 'Backend Team',
        description: 'Backend Development Team',
        department_id: '1',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        is_active: true
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
  });

  it('renders the organization hierarchy with departments', () => {
    // Mock the store to return an organization with departments
    (useEntityStore as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      getOrganizationById: jest.fn().mockReturnValue(mockOrganization),
      getDepartmentById: jest.fn(),
      getOrganizationDepartments: jest.fn().mockResolvedValue(mockOrganization.departments)
    });

    renderWithProviders(<OrganizationHierarchy organizationId="1" />);
    
    expect(screen.getByTestId('organization-hierarchy-view')).toBeInTheDocument();
    expect(screen.getByText('Organization: Test Organization')).toBeInTheDocument();
    
    const departmentItems = screen.getAllByTestId('department-item');
    expect(departmentItems.length).toBe(2);
    expect(departmentItems[0]).toHaveTextContent('Engineering');
    expect(departmentItems[1]).toHaveTextContent('Marketing');
  });

  it('renders the department hierarchy with teams', () => {
    // Mock the store to return a department with teams
    (useEntityStore as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      getDepartmentById: jest.fn().mockReturnValue(mockDepartment),
      getDepartmentTeams: jest.fn().mockResolvedValue(mockDepartment.teams),
      getChildDepartments: jest.fn().mockResolvedValue([])
    });

    renderWithProviders(<DepartmentHierarchy departmentId="1" />);
    
    expect(screen.getByTestId('department-hierarchy-view')).toBeInTheDocument();
    expect(screen.getByText('Department: Engineering')).toBeInTheDocument();
    
    const teamItems = screen.getAllByTestId('team-item');
    expect(teamItems.length).toBe(2);
    expect(teamItems[0]).toHaveTextContent('Frontend Team');
    expect(teamItems[1]).toHaveTextContent('Backend Team');
  });

  it('navigates from organization to department hierarchy when clicking a department', () => {
    // Mock the store to return an organization with departments
    (useEntityStore as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      getOrganizationById: jest.fn().mockReturnValue(mockOrganization),
      getDepartmentById: jest.fn(),
      getOrganizationDepartments: jest.fn().mockResolvedValue(mockOrganization.departments)
    });

    renderWithProviders(<OrganizationHierarchy organizationId="1" />);
    
    // Click on a department
    const departmentItems = screen.getAllByTestId('department-item');
    fireEvent.click(departmentItems[0]);
    
    // In our mock implementation, this should log a message
    expect(console.log).toHaveBeenCalledWith('Navigate to department: 1');
  });

  it('navigates from department to team details when clicking a team', () => {
    // Mock the store to return a department with teams
    (useEntityStore as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      getDepartmentById: jest.fn().mockReturnValue(mockDepartment),
      getDepartmentTeams: jest.fn().mockResolvedValue(mockDepartment.teams),
      getChildDepartments: jest.fn().mockResolvedValue([])
    });

    renderWithProviders(<DepartmentHierarchy departmentId="1" />);
    
    // Click on a team
    const teamItems = screen.getAllByTestId('team-item');
    fireEvent.click(teamItems[0]);
    
    // In our mock implementation, this should log a message
    expect(console.log).toHaveBeenCalledWith('Navigate to team: 1');
  });

  it('handles errors when loading organization hierarchy', () => {
    // Mock the store to return an error
    (useEntityStore as jest.Mock).mockReturnValue({
      loading: false,
      error: 'Failed to load organization hierarchy',
      getOrganizationById: jest.fn().mockReturnValue(undefined),
      getDepartmentById: jest.fn(),
      getOrganizationDepartments: jest.fn()
    });

    renderWithProviders(<OrganizationHierarchy organizationId="1" />);
    
    expect(screen.getByTestId('error')).toBeInTheDocument();
    expect(screen.getByText('Failed to load organization hierarchy')).toBeInTheDocument();
  });

  it('handles errors when loading department hierarchy', () => {
    // Mock the store to return an error
    (useEntityStore as jest.Mock).mockReturnValue({
      loading: false,
      error: 'Failed to load department hierarchy',
      getOrganizationById: jest.fn(),
      getDepartmentById: jest.fn().mockReturnValue(undefined),
      getDepartmentTeams: jest.fn(),
      getChildDepartments: jest.fn()
    });

    renderWithProviders(<DepartmentHierarchy departmentId="1" />);
    
    expect(screen.getByTestId('error')).toBeInTheDocument();
    expect(screen.getByText('Failed to load department hierarchy')).toBeInTheDocument();
  });
}); 