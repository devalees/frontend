import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import TeamEditPage from '@/app/(dashboard)/entities/teams/[id]/edit/page';
import { useTeam } from '@/hooks/useEntity';
import { useToast } from '@/components/ui/use-toast';
import { Team } from '@/types/entity';

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: () => ({ id: 'test-team-id' })
}));

// Mock the team hook
jest.mock('@/hooks/useEntity', () => ({
  useTeam: jest.fn()
}));

// Mock the toast component
jest.mock('@/components/ui/use-toast', () => ({
  useToast: jest.fn()
}));

// Mock the TeamForm component
jest.mock('@/components/features/entity/teams/TeamForm', () => ({
  TeamForm: ({ onSubmit, onCancel }: { onSubmit: (team: Partial<Team>) => void, onCancel: () => void }) => (
    <div data-testid="team-form">
      <button 
        data-testid="submit-button" 
        onClick={() => onSubmit({ name: 'Updated Team Name' })}
      >
        Submit
      </button>
      <button 
        data-testid="cancel-button" 
        onClick={onCancel}
      >
        Cancel
      </button>
    </div>
  )
}));

describe('TeamEditPage', () => {
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

  const mockToast = {
    toast: jest.fn()
  };

  const mockUpdateTeam = jest.fn().mockResolvedValue({ ...mockTeam, name: 'Updated Team Name' });

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useToast as jest.Mock).mockReturnValue(mockToast);
    (useTeam as jest.Mock).mockReturnValue({
      getTeamById: jest.fn().mockReturnValue(mockTeam),
      updateTeam: mockUpdateTeam,
      loading: false
    });
  });

  it('renders the team edit page with the team form', () => {
    render(<TeamEditPage />);
    
    expect(screen.getByText('Edit Team')).toBeInTheDocument();
    expect(screen.getByTestId('team-form')).toBeInTheDocument();
  });

  it('displays loading state when team data is not available', () => {
    (useTeam as jest.Mock).mockReturnValue({
      getTeamById: jest.fn().mockReturnValue(null),
      updateTeam: mockUpdateTeam,
      loading: true
    });
    
    render(<TeamEditPage />);
    
    expect(screen.getByText('Loading team details...')).toBeInTheDocument();
  });

  it('handles form submission correctly', async () => {
    render(<TeamEditPage />);
    
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockUpdateTeam).toHaveBeenCalledWith('test-team-id', { name: 'Updated Team Name' });
      expect(mockToast.toast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Team updated successfully'
      });
      expect(mockRouter.push).toHaveBeenCalledWith('/entities/teams/test-team-id');
    });
  });

  it('handles form cancellation correctly', () => {
    render(<TeamEditPage />);
    
    const cancelButton = screen.getByTestId('cancel-button');
    fireEvent.click(cancelButton);
    
    expect(mockRouter.push).toHaveBeenCalledWith('/entities/teams/test-team-id');
  });

  it('handles error during team update', async () => {
    mockUpdateTeam.mockRejectedValueOnce(new Error('Update failed'));
    
    render(<TeamEditPage />);
    
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockToast.toast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to update team',
        variant: 'destructive'
      });
    });
  });

  it('redirects to teams page if team is not found', async () => {
    (useTeam as jest.Mock).mockReturnValue({
      getTeamById: jest.fn().mockReturnValue(null),
      updateTeam: mockUpdateTeam,
      loading: false
    });
    
    render(<TeamEditPage />);
    
    await waitFor(() => {
      expect(mockToast.toast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Team not found',
        variant: 'destructive'
      });
      expect(mockRouter.push).toHaveBeenCalledWith('/entities/teams');
    });
  });
}); 