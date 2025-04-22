import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import TeamMemberDetailPage from '@/app/(dashboard)/entities/team-members/[id]/page';
import { useEntityStore } from '@/store/slices/entitySlice';
import { TeamMember, Team } from '@/types/entity';
import { useToast } from '@/components/ui/use-toast';

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: () => ({ id: 'test-member-id' })
}));

// Mock the entity store
jest.mock('@/store/slices/entitySlice', () => ({
  useEntityStore: jest.fn()
}));

// Mock the toast
jest.mock('@/components/ui/use-toast', () => ({
  useToast: jest.fn()
}));

describe('TeamMemberDetailPage', () => {
  const mockTeamMember: TeamMember = {
    id: 'test-member-id',
    user_id: 'test-user-id',
    team_id: 'test-team-id',
    role: 'Developer',
    is_leader: true,
    join_date: '2023-01-01T00:00:00Z',
    skills: ['React', 'TypeScript'],
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    is_active: true
  };

  const mockTeam: Team = {
    id: 'test-team-id',
    name: 'Test Team',
    description: 'Test Description',
    department_id: 'test-department-id',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    is_active: true
  };

  const mockRouter = {
    push: jest.fn(),
    back: jest.fn()
  };

  const mockToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    (useEntityStore as unknown as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      getTeamMember: jest.fn().mockResolvedValue(mockTeamMember),
      getTeam: jest.fn().mockResolvedValue(mockTeam),
      deleteTeamMember: jest.fn().mockResolvedValue(undefined)
    });
  });

  it('renders team member details correctly', async () => {
    render(<TeamMemberDetailPage />);

    // Wait for the team member data to be loaded
    await waitFor(() => {
      // Use a more specific selector to find the heading
      expect(screen.getByRole('heading', { name: 'Team Member Details', level: 1 })).toBeInTheDocument();
    });

    // Check if basic information is rendered
    expect(screen.getByText('Developer')).toBeInTheDocument();
    expect(screen.getByText('Leader')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    (useEntityStore as unknown as jest.Mock).mockReturnValue({
      loading: true,
      error: null,
      getTeamMember: jest.fn(),
      getTeam: jest.fn()
    });

    render(<TeamMemberDetailPage />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('shows error state', () => {
    (useEntityStore as unknown as jest.Mock).mockReturnValue({
      loading: false,
      error: 'Failed to load team member',
      getTeamMember: jest.fn(),
      getTeam: jest.fn()
    });

    render(<TeamMemberDetailPage />);
    expect(screen.getByText('Failed to load team member')).toBeInTheDocument();
  });

  it('handles edit action', async () => {
    render(<TeamMemberDetailPage />);

    await waitFor(() => {
      // Use a more specific selector to find the heading
      expect(screen.getByRole('heading', { name: 'Team Member Details', level: 1 })).toBeInTheDocument();
    });

    const editButton = screen.getByTestId('edit-button');
    editButton.click();

    expect(mockRouter.push).toHaveBeenCalledWith('/entities/team-members/test-member-id/edit');
  });

  it('handles delete action', async () => {
    const mockDeleteTeamMember = jest.fn().mockResolvedValue(undefined);
    (useEntityStore as unknown as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      getTeamMember: jest.fn().mockResolvedValue(mockTeamMember),
      getTeam: jest.fn().mockResolvedValue(mockTeam),
      deleteTeamMember: mockDeleteTeamMember
    });

    render(<TeamMemberDetailPage />);

    await waitFor(() => {
      // Use a more specific selector to find the heading
      expect(screen.getByRole('heading', { name: 'Team Member Details', level: 1 })).toBeInTheDocument();
    });

    const deleteButton = screen.getByTestId('delete-button');
    deleteButton.click();

    // Wait for the delete confirmation dialog
    await waitFor(() => {
      expect(screen.getByText('Delete Team Member')).toBeInTheDocument();
    });

    // Click confirm delete
    const confirmButton = screen.getByTestId('confirm-delete-button');
    confirmButton.click();

    expect(mockDeleteTeamMember).toHaveBeenCalledWith('test-member-id');
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Team member deleted',
        description: 'Team member has been successfully deleted.',
      });
      expect(mockRouter.push).toHaveBeenCalledWith('/entities/team-members');
    });
  });

  it('handles delete error', async () => {
    const mockDeleteTeamMember = jest.fn().mockRejectedValue(new Error('Failed to delete team member'));
    (useEntityStore as unknown as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      getTeamMember: jest.fn().mockResolvedValue(mockTeamMember),
      getTeam: jest.fn().mockResolvedValue(mockTeam),
      deleteTeamMember: mockDeleteTeamMember
    });

    render(<TeamMemberDetailPage />);

    await waitFor(() => {
      // Use a more specific selector to find the heading
      expect(screen.getByRole('heading', { name: 'Team Member Details', level: 1 })).toBeInTheDocument();
    });

    const deleteButton = screen.getByTestId('delete-button');
    deleteButton.click();

    // Wait for the delete confirmation dialog
    await waitFor(() => {
      expect(screen.getByText('Delete Team Member')).toBeInTheDocument();
    });

    // Click confirm delete
    const confirmButton = screen.getByTestId('confirm-delete-button');
    confirmButton.click();

    expect(mockDeleteTeamMember).toHaveBeenCalledWith('test-member-id');
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to delete team member. Please try again.',
        variant: 'destructive',
      });
    });
  });
}); 