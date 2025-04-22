/**
 * TeamMembersPage Component Tests
 * 
 * This file contains tests for the TeamMembersPage component.
 * It tests the page's rendering, navigation, and integration with the entity store.
 */

import { jest } from '@jest/globals';
import { renderWithProviders, componentTestHarness } from '@/tests/utils/componentTestUtils';
import { createMockResponse } from '@/tests/utils/mockApi';
import { TeamMember } from '@/types/entity';
import { useEntityStore } from '@/store/slices/entitySlice';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { act } from '@testing-library/react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { EntityState } from '@/store/slices/entitySlice';

// Mock the next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

// Mock the toast
jest.mock('@/components/ui/use-toast', () => ({
  useToast: jest.fn()
}));

// Mock the entity store
jest.mock('@/store/slices/entitySlice', () => ({
  useEntityStore: jest.fn()
}));

// Import the component
import TeamMembersPage from '@/app/(dashboard)/entities/team-members/page';

describe('TeamMembersPage Component', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
  };

  const mockToast = jest.fn();

  const mockTeamMembers: TeamMember[] = [
    {
      id: '1',
      user_id: 'user1',
      team_id: 'team1',
      role: 'Developer',
      is_leader: false,
      join_date: '2024-01-01',
      skills: ['React', 'TypeScript'],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      is_active: true,
    },
    {
      id: '2',
      user_id: 'user2',
      team_id: 'team2',
      role: 'Designer',
      is_leader: true,
      join_date: '2024-01-02',
      skills: ['UI/UX', 'Figma'],
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
      is_active: true,
    },
  ];

  const mockStore = {
    teamMembers: mockTeamMembers,
    fetchTeamMembers: jest.fn().mockImplementation(async () => Promise.resolve()),
    deleteTeamMember: jest.fn().mockImplementation(async (id: string) => Promise.resolve()),
  } as Partial<EntityState>;

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    (useEntityStore as unknown as jest.Mock).mockReturnValue(mockStore);
  });

  it('renders the page correctly', () => {
    render(<TeamMembersPage />);
    
    // Check if the page title is rendered
    const pageTitle = screen.getByRole('heading', { name: /team members/i, level: 1 });
    expect(pageTitle).toBeInTheDocument();
    
    // Check if the breadcrumbs are rendered
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Entities')).toBeInTheDocument();
    
    // Check if the create button is rendered
    expect(screen.getByTestId('create-team-member-button')).toBeInTheDocument();
  });

  it('handles creating a new team member', () => {
    render(<TeamMembersPage />);
    
    const createButton = screen.getByTestId('create-team-member-button');
    fireEvent.click(createButton);
    
    expect(mockRouter.push).toHaveBeenCalledWith('/entities/team-members/new');
  });

  it('handles viewing team member details', () => {
    render(<TeamMembersPage />);
    
    // Find the view button in the first row
    const viewButtons = screen.getAllByTestId('view-details-button');
    fireEvent.click(viewButtons[0]);
    
    expect(mockRouter.push).toHaveBeenCalledWith(`/entities/team-members/${mockTeamMembers[0].id}`);
  });

  it('handles editing a team member', () => {
    render(<TeamMembersPage />);
    
    // Find the edit button in the first row
    const editButtons = screen.getAllByTestId('edit-button');
    fireEvent.click(editButtons[0]);
    
    expect(mockRouter.push).toHaveBeenCalledWith(`/entities/team-members/${mockTeamMembers[0].id}/edit`);
  });

  it('handles deleting a team member', async () => {
    // Mock window.confirm to return true
    window.confirm = jest.fn().mockReturnValue(true);
    
    const mockStoreWithDelete = {
      ...mockStore,
      deleteTeamMember: jest.fn().mockImplementation(async (id: string) => Promise.resolve()),
    } as Partial<EntityState>;
    (useEntityStore as unknown as jest.Mock).mockReturnValue(mockStoreWithDelete);

    render(<TeamMembersPage />);
    
    // Find the delete button in the first row
    const deleteButtons = screen.getAllByTestId('delete-button');
    fireEvent.click(deleteButtons[0]);
    
    await waitFor(() => {
      expect(mockStoreWithDelete.deleteTeamMember).toHaveBeenCalledWith(mockTeamMembers[0].id);
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Team member deleted',
        description: 'Team member has been successfully deleted.',
      });
    });
  });

  it('handles error when deleting a team member', async () => {
    // Mock window.confirm to return true
    window.confirm = jest.fn().mockReturnValue(true);
    
    const mockStoreWithDelete = {
      ...mockStore,
      deleteTeamMember: jest.fn().mockImplementation(async (id: string) => Promise.reject(new Error('Failed to delete team member'))),
    } as Partial<EntityState>;
    (useEntityStore as unknown as jest.Mock).mockReturnValue(mockStoreWithDelete);

    render(<TeamMembersPage />);
    
    // Find the delete button in the first row
    const deleteButtons = screen.getAllByTestId('delete-button');
    fireEvent.click(deleteButtons[0]);
    
    await waitFor(() => {
      expect(mockStoreWithDelete.deleteTeamMember).toHaveBeenCalledWith(mockTeamMembers[0].id);
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to delete team member. Please try again.',
        variant: 'destructive',
      });
    });
  });
}); 