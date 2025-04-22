/**
 * TeamMemberDetail Component Tests
 * 
 * This file contains tests for the TeamMemberDetail component.
 * It tests the component's rendering, data display, and interaction with the entity store.
 */

import { jest } from '@jest/globals';
import { renderWithProviders, componentTestHarness, propsValidation } from '@/tests/utils/componentTestUtils';
import { createMockResponse } from '@/tests/utils/mockApi';
import { TeamMember, Team } from '@/types/entity';
import { useEntityStore } from '@/store/slices/entitySlice';
import { TeamMemberDetail } from '@/components/features/entity/team-members/TeamMemberDetail';

// Mock the entity store
jest.mock('@/store/slices/entitySlice', () => ({
  useEntityStore: jest.fn()
}));

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

  const mockTeam: Team = {
    id: 'team1',
    name: 'Frontend Team',
    description: 'Team responsible for frontend development',
    department_id: 'dept1',
    leader_id: 'user1',
    project_id: 'proj1',
    size: 5,
    skills: ['React', 'TypeScript', 'Next.js'],
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
      getTeamMember: jest.fn().mockImplementation(() => Promise.resolve(null)),
      getTeam: jest.fn().mockImplementation(() => Promise.resolve(null))
    });

    const { getByTestId } = renderWithProviders(<TeamMemberDetail id="1" />);
    expect(getByTestId('loading')).toBeInTheDocument();
  });

  it('renders error state correctly', () => {
    // Mock the store to return error state
    (useEntityStore as unknown as jest.Mock).mockReturnValue({
      loading: false,
      error: 'Failed to load team member',
      getTeamMember: jest.fn().mockImplementation(() => Promise.resolve(null)),
      getTeam: jest.fn().mockImplementation(() => Promise.resolve(null))
    });

    const { getByTestId } = renderWithProviders(<TeamMemberDetail id="1" />);
    expect(getByTestId('error')).toBeInTheDocument();
  });

  it('renders not found state correctly', () => {
    // Mock the store to return null team member
    (useEntityStore as unknown as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      getTeamMember: jest.fn().mockImplementation(() => Promise.resolve(null)),
      getTeam: jest.fn().mockImplementation(() => Promise.resolve(null))
    });

    const { getByTestId } = renderWithProviders(<TeamMemberDetail id="1" />);
    expect(getByTestId('not-found')).toBeInTheDocument();
  });

  it('renders team member details correctly', async () => {
    // Mock the store to return team member data
    const mockGetTeamMember = jest.fn().mockImplementation(() => Promise.resolve(mockTeamMember));
    const mockGetTeam = jest.fn().mockImplementation(() => Promise.resolve(mockTeam));
    
    (useEntityStore as unknown as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      getTeamMember: mockGetTeamMember,
      getTeam: mockGetTeam
    });

    const { getByTestId, findByText } = renderWithProviders(<TeamMemberDetail id="1" />);
    
    // Wait for the component to render
    const container = await findByText('Team Member Details');
    expect(container).toBeInTheDocument();
    
    // Check if team member details are displayed
    expect(await findByText('Developer')).toBeInTheDocument();
    expect(await findByText('user1')).toBeInTheDocument();
    expect(await findByText('team1')).toBeInTheDocument();
    expect(await findByText('Leader')).toBeInTheDocument();
  });

  it('displays skills correctly', async () => {
    // Mock the store to return team member data
    const mockGetTeamMember = jest.fn().mockImplementation(() => Promise.resolve(mockTeamMember));
    const mockGetTeam = jest.fn().mockImplementation(() => Promise.resolve(mockTeam));
    
    (useEntityStore as unknown as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      getTeamMember: mockGetTeamMember,
      getTeam: mockGetTeam
    });

    const { findByText } = renderWithProviders(<TeamMemberDetail id="1" />);
    
    // Wait for the component to render and check skills
    expect(await findByText('JavaScript')).toBeInTheDocument();
    expect(await findByText('React')).toBeInTheDocument();
    expect(await findByText('TypeScript')).toBeInTheDocument();
  });

  it('displays team information correctly', async () => {
    // Mock the store to return team member data
    const mockGetTeamMember = jest.fn().mockImplementation(() => Promise.resolve(mockTeamMember));
    const mockGetTeam = jest.fn().mockImplementation(() => Promise.resolve(mockTeam));
    
    (useEntityStore as unknown as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      getTeamMember: mockGetTeamMember,
      getTeam: mockGetTeam
    });

    const { findByText } = renderWithProviders(<TeamMemberDetail id="1" />);
    
    // Wait for the component to render and check team information
    expect(await findByText('Frontend Team')).toBeInTheDocument();
    expect(await findByText('Team responsible for frontend development')).toBeInTheDocument();
    expect(await findByText('dept1')).toBeInTheDocument();
    expect(await findByText('5')).toBeInTheDocument();
  });

  it('displays performance metrics correctly', async () => {
    // Mock the store to return team member data
    const mockGetTeamMember = jest.fn().mockImplementation(() => Promise.resolve(mockTeamMember));
    const mockGetTeam = jest.fn().mockImplementation(() => Promise.resolve(mockTeam));
    
    (useEntityStore as unknown as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      getTeamMember: mockGetTeamMember,
      getTeam: mockGetTeam
    });

    const { findByText } = renderWithProviders(<TeamMemberDetail id="1" />);
    
    // Wait for the component to render and check performance metrics
    expect(await findByText('4.5/5')).toBeInTheDocument();
  });

  it('fetches team member and team data on mount', async () => {
    // Mock the store with fetch functions
    const mockGetTeamMember = jest.fn().mockImplementation(() => Promise.resolve(mockTeamMember));
    const mockGetTeam = jest.fn().mockImplementation(() => Promise.resolve(mockTeam));
    
    (useEntityStore as unknown as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      getTeamMember: mockGetTeamMember,
      getTeam: mockGetTeam
    });

    renderWithProviders(<TeamMemberDetail id="1" />);
    
    // Wait for the fetch to complete
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Check if the fetch functions were called with the correct parameters
    expect(mockGetTeamMember).toHaveBeenCalledWith('1');
    expect(mockGetTeam).toHaveBeenCalledWith('team1');
  });

  it('handles edit button click', async () => {
    // Mock the store
    const mockGetTeamMember = jest.fn().mockImplementation(() => Promise.resolve(mockTeamMember));
    const mockGetTeam = jest.fn().mockImplementation(() => Promise.resolve(mockTeam));
    const mockOnEdit = jest.fn();

    (useEntityStore as unknown as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      getTeamMember: mockGetTeamMember,
      getTeam: mockGetTeam
    });

    const { findByTestId } = renderWithProviders(
      <TeamMemberDetail id="1" onEdit={mockOnEdit} />
    );
    
    // Click the edit button
    const editButton = await findByTestId('edit-button');
    editButton.click();
    
    // Check if the onEdit function was called
    expect(mockOnEdit).toHaveBeenCalled();
  });

  it('handles delete button click', async () => {
    // Mock the store
    const mockGetTeamMember = jest.fn().mockImplementation(() => Promise.resolve(mockTeamMember));
    const mockGetTeam = jest.fn().mockImplementation(() => Promise.resolve(mockTeam));
    const mockOnDelete = jest.fn();

    (useEntityStore as unknown as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      getTeamMember: mockGetTeamMember,
      getTeam: mockGetTeam
    });

    const { findByTestId } = renderWithProviders(
      <TeamMemberDetail id="1" onDelete={mockOnDelete} />
    );
    
    // Click the delete button
    const deleteButton = await findByTestId('delete-button');
    deleteButton.click();
    
    // Check if the onDelete function was called
    expect(mockOnDelete).toHaveBeenCalled();
  });

  it('validates prop types correctly', () => {
    type TeamMemberDetailProps = React.ComponentProps<typeof TeamMemberDetail>;
    
    // Define the component props
    const requiredProps: Array<keyof TeamMemberDetailProps> = ['id'];
    const optionalProps: Array<keyof TeamMemberDetailProps> = ['onEdit', 'onDelete'];
    
    // Create base props
    const baseProps = {
      id: '1',
      onEdit: jest.fn(),
      onDelete: jest.fn()
    };
    
    // Validate required props
    expect(() => {
      propsValidation.validateRequiredProps(TeamMemberDetail, requiredProps, baseProps);
    }).toThrow();
    
    // Validate optional props - should NOT throw an error
    expect(() => {
      propsValidation.validateOptionalProps(TeamMemberDetail, optionalProps, baseProps);
    }).not.toThrow();
  });
}); 