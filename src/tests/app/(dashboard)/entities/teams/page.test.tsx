/**
 * Teams Page Component Tests
 * 
 * This file contains tests for the Teams page component.
 * It tests the component's rendering, navigation, and integration with the entity store.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TeamsPage from '@/app/(dashboard)/entities/teams/page';
import { useEntityStore } from '@/store/slices/entitySlice';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Team } from '@/types/entity';

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

// Mock the entity store
jest.mock('@/store/slices/entitySlice', () => ({
  useEntityStore: jest.fn()
}));

// Mock the toast component
jest.mock('@/components/ui/use-toast', () => ({
  useToast: jest.fn()
}));

// Mock the TeamList component
jest.mock('@/components/features/entity/teams/TeamList', () => ({
  TeamList: ({ 
    onViewDetails, 
    onEdit, 
    onDelete 
  }: { 
    onViewDetails: (team: Team) => void; 
    onEdit: (team: Team) => void; 
    onDelete: (team: Team) => void; 
  }) => (
    <div data-testid="team-list">
      <button 
        data-testid="view-details-button" 
        onClick={() => onViewDetails({ id: '1', name: 'Test Team' } as Team)}
      >
        View Details
      </button>
      <button 
        data-testid="edit-button" 
        onClick={() => onEdit({ id: '1', name: 'Test Team' } as Team)}
      >
        Edit
      </button>
      <button 
        data-testid="delete-button" 
        onClick={() => onDelete({ id: '1', name: 'Test Team' } as Team)}
      >
        Delete
      </button>
    </div>
  )
}));

describe('TeamsPage', () => {
  const mockRouter = {
    push: jest.fn()
  };
  
  const mockToast = {
    toast: jest.fn()
  };
  
  const mockDeleteTeam = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useToast as jest.Mock).mockReturnValue(mockToast);
    ((useEntityStore as unknown) as jest.Mock).mockReturnValue({
      deleteTeam: mockDeleteTeam
    });
    
    // Mock window.confirm
    window.confirm = jest.fn(() => true);
  });

  it('renders the teams page with correct title and breadcrumbs', () => {
    render(<TeamsPage />);
    
    expect(screen.getByRole('heading', { name: 'Teams' })).toBeInTheDocument();
    expect(screen.getByText('Manage teams within departments')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Entities')).toBeInTheDocument();
  });

  it('renders the create team button', () => {
    render(<TeamsPage />);
    
    expect(screen.getByTestId('create-team-button')).toBeInTheDocument();
    expect(screen.getByText('New Team')).toBeInTheDocument();
  });

  it('navigates to the new team page when create button is clicked', () => {
    render(<TeamsPage />);
    
    fireEvent.click(screen.getByTestId('create-team-button'));
    
    expect(mockRouter.push).toHaveBeenCalledWith('/entities/teams/new');
  });

  it('navigates to the team details page when view details button is clicked', () => {
    render(<TeamsPage />);
    
    fireEvent.click(screen.getByTestId('view-details-button'));
    
    expect(mockRouter.push).toHaveBeenCalledWith('/entities/teams/1');
  });

  it('navigates to the team edit page when edit button is clicked', () => {
    render(<TeamsPage />);
    
    fireEvent.click(screen.getByTestId('edit-button'));
    
    expect(mockRouter.push).toHaveBeenCalledWith('/entities/teams/1/edit');
  });

  it('deletes a team when delete button is clicked and confirmed', async () => {
    render(<TeamsPage />);
    
    fireEvent.click(screen.getByTestId('delete-button'));
    
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete Test Team?');
    
    await waitFor(() => {
      expect(mockDeleteTeam).toHaveBeenCalledWith('1');
    });
    
    expect(mockToast.toast).toHaveBeenCalledWith({
      title: 'Team deleted',
      description: 'Test Team has been successfully deleted.',
    });
  });

  it('shows error toast when team deletion fails', async () => {
    mockDeleteTeam.mockRejectedValueOnce(new Error('Failed to delete'));
    
    render(<TeamsPage />);
    
    fireEvent.click(screen.getByTestId('delete-button'));
    
    await waitFor(() => {
      expect(mockToast.toast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to delete team. Please try again.',
        variant: 'destructive',
      });
    });
  });
}); 