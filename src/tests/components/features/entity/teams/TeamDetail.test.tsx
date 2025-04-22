import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TeamDetail } from '@/components/features/entity/teams/TeamDetail';
import { useEntityStore } from '@/store/slices/entitySlice';
import { Team, TeamMember } from '@/types/entity';
import { renderWithProviders } from '@/tests/utils/componentTestUtils';

// Mock the entity store
jest.mock('@/store/slices/entitySlice', () => ({
  useEntityStore: jest.fn()
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn()
}));

// Define mock data
const mockTeam: Team = {
  id: '1',
  name: 'Team 1',
  description: 'Description 1',
  size: 5,
  skills: ['React', 'TypeScript'],
  department_id: 'dept1',
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
  is_active: true
};

const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    team_id: '1',
    user_id: 'user1',
    role: 'leader',
    is_leader: true,
    join_date: '2024-01-01',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    is_active: true,
    skills: ['React', 'TypeScript'],
    availability: 100,
    performance_rating: 4.5
  },
  {
    id: '2',
    team_id: '1',
    user_id: 'user2',
    role: 'member',
    is_leader: false,
    join_date: '2024-01-01',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    is_active: true,
    skills: ['Node.js', 'Express'],
    availability: 80,
    performance_rating: 4.0
  }
];

describe('TeamDetail', () => {
  const mockFetchTeam = jest.fn();
  const mockFetchTeamMembers = jest.fn();
  const mockDeleteTeam = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    const mockStore = {
      team: mockTeam,
      teamMembers: mockTeamMembers,
      loading: false,
      error: null,
      fetchTeam: mockFetchTeam,
      fetchTeamMembers: mockFetchTeamMembers,
      deleteTeam: mockDeleteTeam
    };
    (useEntityStore as unknown as jest.Mock).mockImplementation(() => mockStore);
  });

  it('renders loading state', () => {
    (useEntityStore as unknown as jest.Mock).mockImplementation(() => ({
      loading: true,
      error: null
    }));

    render(<TeamDetail teamId="1" />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('renders error state', () => {
    const errorMessage = 'Failed to load team';
    (useEntityStore as unknown as jest.Mock).mockImplementation(() => ({
      loading: false,
      error: errorMessage
    }));

    render(<TeamDetail teamId="1" />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('renders team details', () => {
    render(<TeamDetail teamId="1" />);
    
    expect(screen.getByText('Team 1')).toBeInTheDocument();
    expect(screen.getByText('Description 1')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('React, TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Department: dept1')).toBeInTheDocument();
  });

  it('renders team members', () => {
    render(<TeamDetail teamId="1" />);
    
    expect(screen.getByText('Team Members')).toBeInTheDocument();
    expect(screen.getByText('user1')).toBeInTheDocument();
    expect(screen.getByText('leader')).toBeInTheDocument();
    expect(screen.getByText('user2')).toBeInTheDocument();
    expect(screen.getByText('member')).toBeInTheDocument();
  });

  it('handles team deletion', async () => {
    window.confirm = jest.fn(() => true);
    render(<TeamDetail teamId="1" />);

    const deleteButton = screen.getByRole('button', { name: 'Delete Team' });
    fireEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalled();
    expect(mockDeleteTeam).toHaveBeenCalledWith('1');
  });

  it('shows empty state when no team members exist', () => {
    (useEntityStore as unknown as jest.Mock).mockImplementation(() => ({
      team: mockTeam,
      teamMembers: [],
      loading: false,
      error: null
    }));

    render(<TeamDetail teamId="1" />);
    expect(screen.getByText('No team members found.')).toBeInTheDocument();
  });

  it('fetches team and team members on mount', () => {
    render(<TeamDetail teamId="1" />);
    
    expect(mockFetchTeam).toHaveBeenCalledWith('1');
    expect(mockFetchTeamMembers).toHaveBeenCalledWith('1');
  });
}); 