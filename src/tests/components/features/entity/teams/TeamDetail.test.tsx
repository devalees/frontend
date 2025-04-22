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
  const mockGetTeam = jest.fn();
  const mockGetTeamMembers = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetTeam.mockResolvedValue(mockTeam);
    mockGetTeamMembers.mockResolvedValue(mockTeamMembers);
    
    (useEntityStore as unknown as jest.Mock).mockImplementation(() => ({
      loading: false,
      error: null,
      getTeam: mockGetTeam,
      getTeamMembers: mockGetTeamMembers
    }));
  });

  it('renders loading state', () => {
    (useEntityStore as unknown as jest.Mock).mockImplementation(() => ({
      loading: true,
      error: null
    }));

    renderWithProviders(<TeamDetail id="1" />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('renders error state', () => {
    const errorMessage = 'Failed to load team';
    (useEntityStore as unknown as jest.Mock).mockImplementation(() => ({
      loading: false,
      error: errorMessage
    }));

    renderWithProviders(<TeamDetail id="1" />);
    expect(screen.getByTestId('error')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('renders team details', async () => {
    renderWithProviders(<TeamDetail id="1" />);
    
    await waitFor(() => {
      expect(screen.getByText('Team 1')).toBeInTheDocument();
      expect(screen.getByText('Description 1')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('dept1')).toBeInTheDocument();
    });
  });

  it('renders team members', async () => {
    renderWithProviders(<TeamDetail id="1" />);
    
    await waitFor(() => {
      expect(screen.getByText('Team Members (2)')).toBeInTheDocument();
      expect(screen.getByText('user1')).toBeInTheDocument();
      expect(screen.getByText('leader')).toBeInTheDocument();
      expect(screen.getByText('user2')).toBeInTheDocument();
    });
  });

  it('handles edit action', async () => {
    renderWithProviders(<TeamDetail id="1" onEdit={mockOnEdit} />);
    
    await waitFor(() => {
      const editButton = screen.getByTestId('edit-button');
      expect(editButton).toBeInTheDocument();
    });
    
    const editButton = screen.getByTestId('edit-button');
    fireEvent.click(editButton);
    
    expect(mockOnEdit).toHaveBeenCalled();
  });

  it('handles delete action', async () => {
    renderWithProviders(<TeamDetail id="1" onDelete={mockOnDelete} />);
    
    await waitFor(() => {
      const deleteButton = screen.getByTestId('delete-button');
      expect(deleteButton).toBeInTheDocument();
    });
    
    const deleteButton = screen.getByTestId('delete-button');
    fireEvent.click(deleteButton);
    
    expect(mockOnDelete).toHaveBeenCalled();
  });

  it('shows empty state when no team members exist', async () => {
    mockGetTeamMembers.mockResolvedValue([]);
    
    renderWithProviders(<TeamDetail id="1" />);
    
    await waitFor(() => {
      expect(screen.getByText('Team Members (0)')).toBeInTheDocument();
      expect(screen.getByText('No team members found')).toBeInTheDocument();
    });
  });

  it('fetches team and team members on mount', async () => {
    renderWithProviders(<TeamDetail id="1" />);
    
    await waitFor(() => {
      expect(mockGetTeam).toHaveBeenCalledWith('1');
      expect(mockGetTeamMembers).toHaveBeenCalledWith('1');
    });
  });
}); 