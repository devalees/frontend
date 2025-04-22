/**
 * TeamMemberList Component Tests
 * 
 * This file contains tests for the TeamMemberList component.
 * It tests the component's rendering, interaction, and integration with the entity store.
 */

import { jest } from '@jest/globals';
import { renderWithProviders, componentTestHarness } from '@/tests/utils/componentTestUtils';
import { createMockResponse } from '@/tests/utils/mockApi';
import { TeamMember } from '@/types/entity';
import { useEntityStore } from '@/store/slices/entitySlice';

// Mock the entity store
jest.mock('@/store/slices/entitySlice', () => ({
  useEntityStore: jest.fn()
}));

// Import the component
import { TeamMemberList } from '@/components/features/entity/team-members/TeamMemberList';

describe('TeamMemberList Component', () => {
  // Mock data
  const mockTeamMembers: TeamMember[] = [
    {
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
    },
    {
      id: '2',
      user_id: 'user2',
      team_id: 'team1',
      role: 'Designer',
      is_leader: false,
      join_date: '2023-01-02',
      skills: ['UI/UX', 'Figma', 'Adobe XD'],
      availability: 80,
      performance_rating: 4.0,
      created_at: '2023-01-02T00:00:00Z',
      updated_at: '2023-01-02T00:00:00Z',
      is_active: true
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state correctly', () => {
    // Mock the store to return loading state
    (useEntityStore as unknown as jest.Mock).mockReturnValue({
      teamMembers: [],
      loading: true,
      error: null,
      fetchTeamMembers: jest.fn()
    });

    const { getByTestId } = renderWithProviders(<TeamMemberList />);
    expect(getByTestId('loading')).toBeInTheDocument();
  });

  it('renders error state correctly', () => {
    // Mock the store to return error state
    (useEntityStore as unknown as jest.Mock).mockReturnValue({
      teamMembers: [],
      loading: false,
      error: 'Failed to load team members',
      fetchTeamMembers: jest.fn()
    });

    const { getByTestId, getByText } = renderWithProviders(<TeamMemberList />);
    expect(getByTestId('error')).toBeInTheDocument();
    expect(getByText('Failed to load team members')).toBeInTheDocument();
  });

  it('renders empty state correctly', () => {
    // Mock the store to return empty team members
    (useEntityStore as unknown as jest.Mock).mockReturnValue({
      teamMembers: [],
      loading: false,
      error: null,
      fetchTeamMembers: jest.fn()
    });

    const { getByText } = renderWithProviders(<TeamMemberList />);
    expect(getByText('No team members found')).toBeInTheDocument();
  });

  it('renders team members correctly', () => {
    // Mock the store to return team members
    (useEntityStore as unknown as jest.Mock).mockReturnValue({
      teamMembers: mockTeamMembers,
      loading: false,
      error: null,
      fetchTeamMembers: jest.fn()
    });

    const { getByTestId, getByText } = renderWithProviders(<TeamMemberList />);
    expect(getByTestId('team-member-list')).toBeInTheDocument();
    
    // Check if the team member roles are in the document
    expect(getByText('Developer')).toBeInTheDocument();
    expect(getByText('Designer')).toBeInTheDocument();
  });

  it('fetches team members on mount', async () => {
    // Mock the store with a fetch function
    const mockFetchTeamMembers = jest.fn();
    (useEntityStore as unknown as jest.Mock).mockReturnValue({
      teamMembers: [],
      loading: false,
      error: null,
      fetchTeamMembers: mockFetchTeamMembers
    });

    renderWithProviders(<TeamMemberList />);
    
    // Wait for the fetch to complete
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(mockFetchTeamMembers).toHaveBeenCalled();
  });

  it('displays team member details correctly', () => {
    // Mock the store to return team members
    (useEntityStore as unknown as jest.Mock).mockReturnValue({
      teamMembers: mockTeamMembers,
      loading: false,
      error: null,
      fetchTeamMembers: jest.fn()
    });

    const { getByText } = renderWithProviders(<TeamMemberList />);
    
    // Check if the team member details are in the document
    expect(getByText('Developer')).toBeInTheDocument();
    expect(getByText('Designer')).toBeInTheDocument();
    expect(getByText('JavaScript')).toBeInTheDocument();
    expect(getByText('UI/UX')).toBeInTheDocument();
  });

  it('handles team member deletion', async () => {
    // Mock the store with delete function
    const mockDeleteTeamMember = jest.fn();
    (useEntityStore as unknown as jest.Mock).mockReturnValue({
      teamMembers: mockTeamMembers,
      loading: false,
      error: null,
      fetchTeamMembers: jest.fn(),
      deleteTeamMember: mockDeleteTeamMember
    });

    const { getAllByTestId } = renderWithProviders(<TeamMemberList />);
    
    // Find and click the delete button for the first team member
    const deleteButtons = getAllByTestId('delete-team-member');
    deleteButtons[0].click();
    
    // Check if the delete function was called with the correct ID
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(mockDeleteTeamMember).toHaveBeenCalledWith('1');
  });
}); 