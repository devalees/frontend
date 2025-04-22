/**
 * DepartmentDetail Component Tests
 * 
 * This file contains tests for the DepartmentDetail component.
 * It tests the component's rendering, data display, and integration with the entity store.
 */

import { jest } from '@jest/globals';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/tests/utils/componentTestUtils';
import { Department, Team, TeamMember } from '@/types/entity';
import { useEntityStore } from '@/store/slices/entitySlice';

// Mock the entity store
jest.mock('@/store/slices/entitySlice', () => ({
  useEntityStore: jest.fn()
}));

// Import the component
import { DepartmentDetail } from '@/components/features/entity/departments/DepartmentDetail';

describe('DepartmentDetail Component', () => {
  // Mock data
  const mockDepartment: Department = {
    id: '1',
    name: 'Engineering',
    description: 'Software Engineering Department',
    organization_id: 'org1',
    parent_department_id: undefined,
    manager_id: 'user1',
    budget: 1000000,
    location: 'New York',
    headcount: 50,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    is_active: true
  };

  const mockTeams: Team[] = [
    {
      id: 'team1',
      name: 'Frontend Team',
      description: 'Frontend Development Team',
      department_id: '1',
      leader_id: 'user2',
      project_id: 'project1',
      size: 10,
      skills: ['React', 'TypeScript', 'CSS'],
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      is_active: true
    },
    {
      id: 'team2',
      name: 'Backend Team',
      description: 'Backend Development Team',
      department_id: '1',
      leader_id: 'user3',
      project_id: 'project2',
      size: 8,
      skills: ['Node.js', 'Express', 'MongoDB'],
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      is_active: true
    }
  ];

  const mockTeamMembers: TeamMember[] = [
    {
      id: 'member1',
      user_id: 'user2',
      team_id: 'team1',
      role: 'Developer',
      is_leader: true,
      join_date: '2023-01-01',
      skills: ['React', 'TypeScript'],
      availability: 100,
      performance_rating: 4.5,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      is_active: true
    },
    {
      id: 'member2',
      user_id: 'user4',
      team_id: 'team1',
      role: 'Developer',
      is_leader: false,
      join_date: '2023-01-02',
      skills: ['CSS', 'HTML'],
      availability: 80,
      performance_rating: 4.0,
      created_at: '2023-01-02T00:00:00Z',
      updated_at: '2023-01-02T00:00:00Z',
      is_active: true
    }
  ];

  const mockChildDepartments: Department[] = [
    {
      id: '2',
      name: 'Mobile Engineering',
      description: 'Mobile Development Department',
      organization_id: 'org1',
      parent_department_id: '1',
      manager_id: 'user5',
      budget: 500000,
      location: 'San Francisco',
      headcount: 25,
      created_at: '2023-01-03T00:00:00Z',
      updated_at: '2023-01-03T00:00:00Z',
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
      getDepartment: jest.fn(),
      getDepartmentTeams: jest.fn(),
      getDepartmentTeamMembers: jest.fn(),
      getChildDepartments: jest.fn()
    });

    renderWithProviders(<DepartmentDetail id="1" />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('renders error state correctly', () => {
    // Mock the store to return error state
    (useEntityStore as jest.Mock).mockReturnValue({
      loading: false,
      error: 'Failed to load department',
      getDepartment: jest.fn(),
      getDepartmentTeams: jest.fn(),
      getDepartmentTeamMembers: jest.fn(),
      getChildDepartments: jest.fn()
    });

    renderWithProviders(<DepartmentDetail id="1" />);
    expect(screen.getByTestId('error')).toBeInTheDocument();
    expect(screen.getByText('Failed to load department')).toBeInTheDocument();
  });

  it('renders department details correctly', async () => {
    // Mock the store to return department data
    (useEntityStore as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      getDepartment: jest.fn().mockResolvedValue(mockDepartment),
      getDepartmentTeams: jest.fn().mockResolvedValue(mockTeams),
      getDepartmentTeamMembers: jest.fn().mockResolvedValue(mockTeamMembers),
      getChildDepartments: jest.fn().mockResolvedValue(mockChildDepartments)
    });

    renderWithProviders(<DepartmentDetail id="1" />);
    
    // Wait for the data to load
    await waitFor(() => {
      expect(screen.getByText('Engineering')).toBeInTheDocument();
      expect(screen.getByText('Software Engineering Department')).toBeInTheDocument();
      expect(screen.getByText('New York')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('$1,000,000')).toBeInTheDocument();
    });
  });

  it('renders teams correctly', async () => {
    // Mock the store to return department and teams data
    (useEntityStore as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      getDepartment: jest.fn().mockResolvedValue(mockDepartment),
      getDepartmentTeams: jest.fn().mockResolvedValue(mockTeams),
      getDepartmentTeamMembers: jest.fn().mockResolvedValue(mockTeamMembers),
      getChildDepartments: jest.fn().mockResolvedValue(mockChildDepartments)
    });

    renderWithProviders(<DepartmentDetail id="1" />);
    
    // Wait for the teams to load
    await waitFor(() => {
      expect(screen.getByText('Frontend Team')).toBeInTheDocument();
      expect(screen.getByText('Backend Team')).toBeInTheDocument();
    });
  });

  it('renders team members correctly', async () => {
    // Mock the store to return department and team members data
    (useEntityStore as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      getDepartment: jest.fn().mockResolvedValue(mockDepartment),
      getDepartmentTeams: jest.fn().mockResolvedValue(mockTeams),
      getDepartmentTeamMembers: jest.fn().mockResolvedValue(mockTeamMembers),
      getChildDepartments: jest.fn().mockResolvedValue(mockChildDepartments)
    });

    renderWithProviders(<DepartmentDetail id="1" />);
    
    // Wait for the team members to load
    await waitFor(() => {
      expect(screen.getByText('Developer')).toBeInTheDocument();
    });
  });

  it('renders child departments correctly', async () => {
    // Mock the store to return department and child departments data
    (useEntityStore as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      getDepartment: jest.fn().mockResolvedValue(mockDepartment),
      getDepartmentTeams: jest.fn().mockResolvedValue(mockTeams),
      getDepartmentTeamMembers: jest.fn().mockResolvedValue(mockTeamMembers),
      getChildDepartments: jest.fn().mockResolvedValue(mockChildDepartments)
    });

    renderWithProviders(<DepartmentDetail id="1" />);
    
    // Wait for the child departments to load
    await waitFor(() => {
      expect(screen.getByText('Mobile Engineering')).toBeInTheDocument();
    });
  });

  it('fetches department data on mount', async () => {
    // Mock the store with fetch functions
    const mockGetDepartment = jest.fn().mockResolvedValue(mockDepartment);
    const mockGetDepartmentTeams = jest.fn().mockResolvedValue(mockTeams);
    const mockGetDepartmentTeamMembers = jest.fn().mockResolvedValue(mockTeamMembers);
    const mockGetChildDepartments = jest.fn().mockResolvedValue(mockChildDepartments);
    
    (useEntityStore as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      getDepartment: mockGetDepartment,
      getDepartmentTeams: mockGetDepartmentTeams,
      getDepartmentTeamMembers: mockGetDepartmentTeamMembers,
      getChildDepartments: mockGetChildDepartments
    });

    renderWithProviders(<DepartmentDetail id="1" />);
    
    // Wait for the fetch functions to be called
    await waitFor(() => {
      expect(mockGetDepartment).toHaveBeenCalledWith('1');
      expect(mockGetDepartmentTeams).toHaveBeenCalledWith('1');
      expect(mockGetDepartmentTeamMembers).toHaveBeenCalledWith('1');
      expect(mockGetChildDepartments).toHaveBeenCalledWith('1');
    });
  });

  it('displays edit and delete buttons', async () => {
    // Mock the store to return department data
    (useEntityStore as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      getDepartment: jest.fn().mockResolvedValue(mockDepartment),
      getDepartmentTeams: jest.fn().mockResolvedValue(mockTeams),
      getDepartmentTeamMembers: jest.fn().mockResolvedValue(mockTeamMembers),
      getChildDepartments: jest.fn().mockResolvedValue(mockChildDepartments)
    });

    renderWithProviders(<DepartmentDetail id="1" />);
    
    // Wait for the data to load
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });
  });
}); 