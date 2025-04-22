import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import TeamDetailPage from '@/app/(dashboard)/entities/teams/[id]/page';
import { useEntityStore } from '@/store/slices/entitySlice';
import { Team, TeamMember } from '@/types/entity';

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: () => ({ id: 'test-team-id' })
}));

// Mock the entity store
jest.mock('@/store/slices/entitySlice', () => ({
  useEntityStore: jest.fn()
}));

describe('TeamDetailPage', () => {
  const mockTeam: Team = {
    id: 'test-team-id',
    name: 'Test Team',
    description: 'Test Description',
    department_id: 'test-department-id',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    is_active: true
  };

  const mockTeamMembers: TeamMember[] = [
    {
      id: 'test-member-id',
      team_id: 'test-team-id',
      user_id: 'test-user-id',
      role: 'Developer',
      is_leader: true,
      join_date: '2023-01-01T00:00:00Z',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      is_active: true
    }
  ];

  const mockRouter = {
    push: jest.fn(),
    back: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useEntityStore as unknown as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      getTeam: jest.fn().mockResolvedValue(mockTeam),
      getTeamMembers: jest.fn().mockResolvedValue(mockTeamMembers)
    });
  });

  it('renders team details correctly', async () => {
    render(<TeamDetailPage />);

    // Wait for the team data to be loaded
    await waitFor(() => {
      expect(screen.getByText('Test Team')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });

    // Check if team members are rendered
    expect(screen.getByText('Developer')).toBeInTheDocument();
    expect(screen.getByText('Leader')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    (useEntityStore as unknown as jest.Mock).mockReturnValue({
      loading: true,
      error: null,
      getTeam: jest.fn(),
      getTeamMembers: jest.fn()
    });

    render(<TeamDetailPage />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('shows error state', () => {
    (useEntityStore as unknown as jest.Mock).mockReturnValue({
      loading: false,
      error: 'Failed to load team',
      getTeam: jest.fn(),
      getTeamMembers: jest.fn()
    });

    render(<TeamDetailPage />);
    expect(screen.getByText('Failed to load team')).toBeInTheDocument();
  });

  it('handles edit action', async () => {
    render(<TeamDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Team')).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /edit/i });
    editButton.click();

    expect(mockRouter.push).toHaveBeenCalledWith('/entities/teams/test-team-id/edit');
  });

  it('handles delete action', async () => {
    const mockDeleteTeam = jest.fn().mockResolvedValue(undefined);
    (useEntityStore as unknown as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      getTeam: jest.fn().mockResolvedValue(mockTeam),
      getTeamMembers: jest.fn().mockResolvedValue(mockTeamMembers),
      deleteTeam: mockDeleteTeam
    });

    render(<TeamDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Team')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    deleteButton.click();

    // Wait for the delete confirmation dialog
    await waitFor(() => {
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
    });

    // Click confirm delete
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    confirmButton.click();

    expect(mockDeleteTeam).toHaveBeenCalledWith('test-team-id');
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/entities/teams');
    });
  });
}); 