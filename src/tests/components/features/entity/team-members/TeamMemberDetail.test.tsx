/**
 * TeamMemberDetail Component Tests
 * 
 * This file contains tests for the TeamMemberDetail component.
 * It tests the component's rendering, data display, and interaction with the entity store.
 */

import { jest } from '@jest/globals';
import { renderWithProviders, componentTestHarness, propsValidation } from '@/tests/utils/componentTestUtils';
import { createMockResponse } from '@/tests/utils/mockApi';
import { TeamMember } from '@/types/entity';
import { useEntityStore } from '@/store/slices/entitySlice';

// Mock the entity store
jest.mock('@/store/slices/entitySlice', () => ({
  useEntityStore: jest.fn()
}));

// Import the component
import { TeamMemberDetail } from '@/components/features/entity/team-members/TeamMemberDetail';

describe('TeamMemberDetail Component', () => {
  // Mock data
  const mockTeamMember: TeamMember = {
    id: '1',
    user_id: 'user1',
    team_id: 'team1',
    role: 'Developer',
    is_leader: true,
    join_date: '2023-01-01',
    skills: ['JavaScript', 'React', 'TypeScript'],
    availability: 100,
    performance_rating: 4.5,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    is_active: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state correctly', () => {
    // Mock the store to return loading state
    (useEntityStore as unknown as jest.Mock).mockReturnValue({
      loading: true,
      error: null,
      fetchTeamMember: jest.fn(),
      teamMember: null
    });

    const { getByTestId } = renderWithProviders(<TeamMemberDetail id="1" />);
    expect(getByTestId('loading')).toBeInTheDocument();
  });

  it('renders error state correctly', () => {
    // Mock the store to return error state
    (useEntityStore as unknown as jest.Mock).mockReturnValue({
      loading: false,
      error: 'Failed to load team member',
      fetchTeamMember: jest.fn(),
      teamMember: null
    });

    const { getByTestId, getByText } = renderWithProviders(<TeamMemberDetail id="1" />);
    expect(getByTestId('error')).toBeInTheDocument();
    expect(getByText('Failed to load team member')).toBeInTheDocument();
  });

  it('renders team member details correctly', () => {
    // Mock the store to return team member data
    (useEntityStore as unknown as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      fetchTeamMember: jest.fn(),
      teamMember: mockTeamMember
    });

    const { getByTestId, getByText } = renderWithProviders(<TeamMemberDetail id="1" />);
    
    // Check if team member details are displayed
    expect(getByTestId('team-member-detail')).toBeInTheDocument();
    expect(getByText('Developer')).toBeInTheDocument();
    expect(getByText('user1')).toBeInTheDocument();
    expect(getByText('team1')).toBeInTheDocument();
    expect(getByText('2023-01-01')).toBeInTheDocument();
    expect(getByText('Team Leader')).toBeInTheDocument();
  });

  it('displays skills correctly', () => {
    // Mock the store to return team member data
    (useEntityStore as unknown as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      fetchTeamMember: jest.fn(),
      teamMember: mockTeamMember
    });

    const { getByText } = renderWithProviders(<TeamMemberDetail id="1" />);
    
    // Check if skills are displayed
    expect(getByText('JavaScript')).toBeInTheDocument();
    expect(getByText('React')).toBeInTheDocument();
    expect(getByText('TypeScript')).toBeInTheDocument();
  });

  it('displays performance metrics correctly', () => {
    // Mock the store to return team member data
    (useEntityStore as unknown as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      fetchTeamMember: jest.fn(),
      teamMember: mockTeamMember
    });

    const { getByText } = renderWithProviders(<TeamMemberDetail id="1" />);
    
    // Check if performance metrics are displayed
    expect(getByText('100%')).toBeInTheDocument(); // Availability
    expect(getByText('4.5')).toBeInTheDocument(); // Performance rating
  });

  it('fetches team member data on mount', async () => {
    // Mock the store with a fetch function
    const mockFetchTeamMember = jest.fn();
    (useEntityStore as unknown as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      fetchTeamMember: mockFetchTeamMember,
      teamMember: null
    });

    renderWithProviders(<TeamMemberDetail id="1" />);
    
    // Wait for the fetch to complete
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(mockFetchTeamMember).toHaveBeenCalledWith('1');
  });

  it('handles edit button click', () => {
    // Mock the store
    (useEntityStore as unknown as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      fetchTeamMember: jest.fn(),
      teamMember: mockTeamMember
    });

    // Mock the router
    const mockRouter = {
      push: jest.fn()
    };
    jest.mock('next/router', () => ({
      useRouter: () => mockRouter
    }));

    const { getByTestId } = renderWithProviders(<TeamMemberDetail id="1" />);
    
    // Click the edit button
    const editButton = getByTestId('edit-button');
    editButton.click();
    
    // Check if the router was called with the correct path
    expect(mockRouter.push).toHaveBeenCalledWith('/entities/team-members/1/edit');
  });

  it('handles delete button click', async () => {
    // Mock the store with delete function
    const mockDeleteTeamMember = jest.fn();
    (useEntityStore as unknown as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      fetchTeamMember: jest.fn(),
      teamMember: mockTeamMember,
      deleteTeamMember: mockDeleteTeamMember
    });

    const { getByTestId } = renderWithProviders(<TeamMemberDetail id="1" />);
    
    // Click the delete button
    const deleteButton = getByTestId('delete-button');
    deleteButton.click();
    
    // Check if the delete function was called with the correct ID
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(mockDeleteTeamMember).toHaveBeenCalledWith('1');
  });

  it('validates prop types correctly', () => {
    // Define the component props
    const requiredProps: Array<keyof React.ComponentProps<typeof TeamMemberDetail>> = ['id'];
    const optionalProps: Array<keyof React.ComponentProps<typeof TeamMemberDetail>> = ['onEdit', 'onDelete'];
    
    // Create base props
    const baseProps = {
      id: '1',
      onEdit: jest.fn(),
      onDelete: jest.fn()
    };
    
    // Validate required props
    propsValidation.validateRequiredProps(TeamMemberDetail, requiredProps, baseProps);
    
    // Validate optional props
    propsValidation.validateOptionalProps(TeamMemberDetail, optionalProps, baseProps);
  });
}); 