/**
 * TeamList Component Tests
 * 
 * This file contains tests for the TeamList component.
 * It tests the component's rendering, data display, and integration with the entity store.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TeamList } from '@/components/features/entity/teams/TeamList';
import { useEntityStore } from '@/store/slices/entitySlice';
import { Team, TeamMember } from '@/types/entity';
import { StoreApi } from 'zustand';
import { jest } from '@jest/globals';
import { renderWithProviders } from '@/tests/utils/componentTestUtils';
import { mockTeam, mockTeamMember } from '@/tests/utils/mockData';

// Mock the entity store
jest.mock('@/store/slices/entitySlice', () => ({
  useEntityStore: jest.fn()
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn()
}));

// Define mock data
const mockTeams: Team[] = [
  {
    id: '1',
    name: 'Team 1',
    description: 'Description 1',
    size: 5,
    skills: ['React', 'TypeScript'],
    department_id: 'dept1',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    is_active: true
  },
  {
    id: '2',
    name: 'Team 2',
    description: 'Description 2',
    size: 3,
    skills: ['Node.js', 'Express'],
    department_id: 'dept1',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    is_active: true
  }
];

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

describe('TeamList', () => {
  const mockFetchTeams = jest.fn();
  const mockDeleteTeam = jest.fn();
  const mockGetTeamMembers = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    const mockStore = {
      teams: mockTeams,
      teamMembers: mockTeamMembers,
      loading: false,
      error: null,
      fetchTeams: mockFetchTeams,
      deleteTeam: mockDeleteTeam,
      getTeamMembers: mockGetTeamMembers
    };
    (useEntityStore as unknown as jest.Mock).mockImplementation(() => mockStore);
  });

  it('renders loading state', () => {
    (useEntityStore as unknown as jest.Mock).mockImplementation(() => ({
      loading: true,
      error: null
    }));

    render(<TeamList />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('renders error state', () => {
    const errorMessage = 'Failed to load teams';
    (useEntityStore as unknown as jest.Mock).mockImplementation(() => ({
      loading: false,
      error: errorMessage
    }));

    render(<TeamList />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('renders teams list', () => {
    render(<TeamList />);
    
    expect(screen.getByText('Team 1')).toBeInTheDocument();
    expect(screen.getByText('Description 1')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('React, TypeScript')).toBeInTheDocument();
  });

  it('handles team deletion', async () => {
    window.confirm = jest.fn(() => true);
    render(<TeamList />);

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalled();
    expect(mockDeleteTeam).toHaveBeenCalledWith('1');
  });

  it('shows empty state when no teams exist', () => {
    (useEntityStore as unknown as jest.Mock).mockImplementation(() => ({
      teams: [],
      loading: false,
      error: null
    }));

    render(<TeamList />);
    expect(screen.getByText('No teams found. Create a new team to get started.')).toBeInTheDocument();
  });
}); 