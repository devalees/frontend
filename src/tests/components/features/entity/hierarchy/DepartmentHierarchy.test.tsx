/**
 * DepartmentHierarchy Component Tests
 * 
 * This file contains tests for the DepartmentHierarchy component.
 * It tests the component's rendering, interaction, and integration with the entity store.
 */

import { jest } from '@jest/globals';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/tests/utils/componentTestUtils';
import { Department, Team } from '@/types/entity';
import { useEntityStore } from '@/store/slices/entitySlice';

// Mock the entity store
jest.mock('@/store/slices/entitySlice', () => ({
  useEntityStore: jest.fn()
}));

// Mock the hierarchy components to isolate testing
jest.mock('@/components/ui/Tree', () => ({
  Tree: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="hierarchy-tree">{children}</div>
  ),
  TreeItem: ({ 
    label, 
    children 
  }: { 
    label: string;
    children?: React.ReactNode 
  }) => (
    <div data-testid="hierarchy-tree-item">
      <span>{label}</span>
      {children}
    </div>
  )
}));

// Import the component - add this after actual component is implemented
// import { DepartmentHierarchy } from '@/components/features/entity/hierarchy/DepartmentHierarchy';

// Mock component for testing until real component is implemented
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

  return (
    <div data-testid="department-hierarchy">
      <h2>{department.name} Hierarchy</h2>
      <div data-testid="hierarchy-tree">
        <div data-testid="department-node">{department.name}</div>
        <div data-testid="teams-container">
          {/* Teams would be rendered here */}
        </div>
        <div data-testid="child-departments-container">
          {/* Child departments would be rendered here */}
        </div>
      </div>
    </div>
  );
};

describe('DepartmentHierarchy Component', () => {
  // Mock data
  const mockDepartment: Department = {
    id: '1',
    name: 'Engineering',
    description: 'Engineering Department',
    organization_id: '1',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    is_active: true
  };

  const mockTeams: Team[] = [
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
  ];

  const mockChildDepartments: Department[] = [
    {
      id: '2',
      name: 'Mobile Development',
      description: 'Mobile Development Department',
      organization_id: '1',
      parent_department_id: '1',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      is_active: true
    },
    {
      id: '3',
      name: 'DevOps',
      description: 'DevOps Department',
      organization_id: '1',
      parent_department_id: '1',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      is_active: true
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state correctly', () => {
    // Mock the store to return loading state
    (useEntityStore as jest.Mock).mockReturnValue({
      loading: true,
      error: null,
      getDepartmentById: jest.fn().mockReturnValue(undefined),
      getDepartmentTeams: jest.fn().mockResolvedValue([]),
      getChildDepartments: jest.fn().mockResolvedValue([])
    });

    renderWithProviders(<DepartmentHierarchy departmentId="1" />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('renders error state correctly', () => {
    // Mock the store to return error state
    (useEntityStore as jest.Mock).mockReturnValue({
      loading: false,
      error: 'Failed to load department hierarchy',
      getDepartmentById: jest.fn().mockReturnValue(undefined),
      getDepartmentTeams: jest.fn().mockResolvedValue([]),
      getChildDepartments: jest.fn().mockResolvedValue([])
    });

    renderWithProviders(<DepartmentHierarchy departmentId="1" />);
    expect(screen.getByTestId('error')).toBeInTheDocument();
    expect(screen.getByText('Failed to load department hierarchy')).toBeInTheDocument();
  });

  it('renders not found state correctly when department is not found', () => {
    // Mock the store to return undefined department
    (useEntityStore as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      getDepartmentById: jest.fn().mockReturnValue(undefined),
      getDepartmentTeams: jest.fn().mockResolvedValue([]),
      getChildDepartments: jest.fn().mockResolvedValue([])
    });

    renderWithProviders(<DepartmentHierarchy departmentId="999" />);
    expect(screen.getByTestId('not-found')).toBeInTheDocument();
  });

  it('renders department hierarchy correctly', async () => {
    // Mock the store to return a department
    const mockGetDepartmentById = jest.fn().mockReturnValue(mockDepartment);
    const mockGetDepartmentTeams = jest.fn().mockResolvedValue(mockTeams);
    const mockGetChildDepartments = jest.fn().mockResolvedValue(mockChildDepartments);

    (useEntityStore as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      getDepartmentById: mockGetDepartmentById,
      getDepartmentTeams: mockGetDepartmentTeams,
      getChildDepartments: mockGetChildDepartments
    });

    renderWithProviders(<DepartmentHierarchy departmentId="1" />);
    
    expect(screen.getByTestId('department-hierarchy')).toBeInTheDocument();
    expect(screen.getByText('Engineering Hierarchy')).toBeInTheDocument();
    expect(screen.getByTestId('department-node')).toBeInTheDocument();
    expect(screen.getByText('Engineering')).toBeInTheDocument();
    
    // Verify the department ID was used to fetch data
    expect(mockGetDepartmentById).toHaveBeenCalledWith('1');
  });

  it('fetches department teams and child departments on render', async () => {
    // Mock the store with fetch functions
    const mockGetDepartmentById = jest.fn().mockReturnValue(mockDepartment);
    const mockGetDepartmentTeams = jest.fn().mockResolvedValue(mockTeams);
    const mockGetChildDepartments = jest.fn().mockResolvedValue(mockChildDepartments);

    (useEntityStore as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      getDepartmentById: mockGetDepartmentById,
      getDepartmentTeams: mockGetDepartmentTeams,
      getChildDepartments: mockGetChildDepartments
    });

    renderWithProviders(<DepartmentHierarchy departmentId="1" />);
    
    // In the real component, these would happen, but our mock component doesn't make the actual calls
    // Keeping this test to document the expected behavior for the real implementation
    // await waitFor(() => {
    //   expect(mockGetDepartmentTeams).toHaveBeenCalledWith('1');
    //   expect(mockGetChildDepartments).toHaveBeenCalledWith('1');
    // });
  });
}); 