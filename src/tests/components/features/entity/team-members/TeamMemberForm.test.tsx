/**
 * TeamMemberForm Component Tests
 * 
 * This file contains tests for the TeamMemberForm component.
 * It tests the component's rendering, form validation, and submission.
 */

import { jest } from '@jest/globals';
import { renderWithProviders, componentTestHarness, propsValidation } from '@/tests/utils/componentTestUtils';
import { createMockResponse } from '@/tests/utils/mockApi';
import { TeamMember } from '@/types/entity';
import { useEntityStore } from '@/store/slices/entitySlice';
import { fireEvent, waitFor } from '@testing-library/react';
import { TeamMemberForm } from '../../../../../components/features/entity/team-members/TeamMemberForm';
import { ApiError, ValidationError } from '@/lib/api/errors';

interface APIError {
  message: string;
  status: number;
  statusText: string;
}

// Mock the entity store
const mockCreateTeamMember = jest.fn().mockImplementation(() => Promise.resolve({
  id: '1',
  user_id: 'user1',
  team_id: 'team1',
  role: 'Developer',
  join_date: '2023-01-01'
}));

const mockUpdateTeamMember = jest.fn().mockImplementation(() => Promise.resolve({
  id: '1',
  user_id: 'user1',
  team_id: 'team1',
  role: 'Developer',
  join_date: '2023-01-01'
}));

jest.mock('@/store/slices/entitySlice', () => ({
  useEntityStore: jest.fn(() => ({
    createTeamMember: mockCreateTeamMember,
    updateTeamMember: mockUpdateTeamMember,
    teams: [{ id: 'team1', name: 'Team 1' }],
    users: [{ id: 'user1', name: 'User 1' }]
  }))
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn()
  })
}));

describe('TeamMemberForm Component', () => {
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
    mockCreateTeamMember.mockImplementation(() => Promise.resolve({
      id: '1',
      user_id: 'user1',
      team_id: 'team1',
      role: 'Developer',
      join_date: '2023-01-01'
    }));
    mockUpdateTeamMember.mockImplementation(() => Promise.resolve({
      id: '1',
      user_id: 'user1',
      team_id: 'team1',
      role: 'Developer',
      join_date: '2023-01-01'
    }));
  });

  it('renders create form correctly', () => {
    const { getByTestId, getByLabelText } = renderWithProviders(
      <TeamMemberForm />
    );

    expect(getByTestId('team-member-form')).toBeInTheDocument();
    expect(getByLabelText('User ID')).toBeInTheDocument();
    expect(getByLabelText('Team')).toBeInTheDocument();
    expect(getByLabelText('Role')).toBeInTheDocument();
    expect(getByLabelText('Leader')).toBeInTheDocument();
    expect(getByLabelText('Join Date')).toBeInTheDocument();
  });

  it('renders edit form with team member data', () => {
    const { getByTestId, getByLabelText } = renderWithProviders(
      <TeamMemberForm teamMember={mockTeamMember} />
    );

    expect(getByTestId('team-member-form')).toBeInTheDocument();
    expect((getByLabelText('User ID') as HTMLInputElement).value).toBe('user1');
    expect((getByLabelText('Team') as HTMLSelectElement).value).toBe('team1');
    expect((getByLabelText('Role') as HTMLInputElement).value).toBe('Developer');
    expect((getByLabelText('Leader') as HTMLInputElement).checked).toBe(true);
    expect((getByLabelText('Join Date') as HTMLInputElement).value).toBe('2023-01-01');
  });

  it('validates required fields', async () => {
    const { getByTestId, getByText, getByRole } = renderWithProviders(
      <TeamMemberForm />
    );

    const submitButton = getByRole('button', { name: /create team member/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(getByText('User ID is required')).toBeInTheDocument();
      expect(getByText('Team is required')).toBeInTheDocument();
      expect(getByText('Role is required')).toBeInTheDocument();
      expect(getByText('Join Date is required')).toBeInTheDocument();
    });
  });

  it('handles create team member submission', async () => {
    const { getByLabelText, getByRole } = renderWithProviders(
      <TeamMemberForm />
    );

    fireEvent.change(getByLabelText('User ID'), { target: { value: 'user1' } });
    fireEvent.change(getByLabelText('Team'), { target: { value: 'team1' } });
    fireEvent.change(getByLabelText('Role'), { target: { value: 'Developer' } });
    fireEvent.click(getByLabelText('Leader'));
    fireEvent.change(getByLabelText('Join Date'), { target: { value: '2023-01-01' } });

    const submitButton = getByRole('button', { name: /create team member/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateTeamMember).toHaveBeenCalledWith({
        user_id: 'user1',
        team_id: 'team1',
        role: 'Developer',
        is_leader: true,
        join_date: '2023-01-01'
      });
    });
  });

  it('handles edit team member submission', async () => {
    const { getByLabelText, getByRole } = renderWithProviders(
      <TeamMemberForm teamMember={mockTeamMember} />
    );

    fireEvent.change(getByLabelText('Role'), { target: { value: 'Senior Developer' } });
    
    const submitButton = getByRole('button', { name: /update team member/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateTeamMember).toHaveBeenCalledWith('1', {
        ...mockTeamMember,
        role: 'Senior Developer'
      });
    });
  });

  it('handles form submission errors', async () => {
    const apiError = new ValidationError('Failed to create team member', {
      user_id: ['User already exists in this team']
    });
    
    mockCreateTeamMember.mockImplementation(() => Promise.reject(apiError));

    const { getByLabelText, getByRole, getByText } = renderWithProviders(
      <TeamMemberForm />
    );

    // Fill in required fields
    fireEvent.change(getByLabelText('User ID'), { target: { value: 'user1' } });
    fireEvent.change(getByLabelText('Team'), { target: { value: 'team1' } });
    fireEvent.change(getByLabelText('Role'), { target: { value: 'Developer' } });
    fireEvent.change(getByLabelText('Join Date'), { target: { value: '2023-01-01' } });

    const submitButton = getByRole('button', { name: /create team member/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(getByText('Failed to create team member')).toBeInTheDocument();
      expect(getByText('User already exists in this team')).toBeInTheDocument();
    });
  });

  it('validates prop types correctly', () => {
    type TeamMemberFormProps = {
      teamMember?: TeamMember;
    };

    const requiredProps: (keyof TeamMemberFormProps)[] = [];
    const optionalProps: (keyof TeamMemberFormProps)[] = ['teamMember'];
    
    const baseProps: TeamMemberFormProps = {
      teamMember: mockTeamMember
    };
    
    propsValidation.validateRequiredProps(TeamMemberForm, requiredProps, baseProps);
    propsValidation.validateOptionalProps(TeamMemberForm, optionalProps, baseProps);
  });
}); 