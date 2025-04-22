/**
 * TeamMemberEditPage Component Tests
 * 
 * This file contains tests for the TeamMemberEditPage component.
 * It tests the page's rendering, data loading, and integration with the entity store.
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
  useRouter: jest.fn(),
  useParams: jest.fn().mockReturnValue({ id: '1' })
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
import TeamMemberEditPage from '@/app/(dashboard)/entities/team-members/[id]/edit/page';

describe('TeamMemberEditPage Component', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
  };

  const mockToast = jest.fn();

  const mockTeamMember: TeamMember = {
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
  };

  const mockStore = {
    getTeamMember: jest.fn().mockImplementation(async () => Promise.resolve(mockTeamMember)),
  } as Partial<EntityState>;

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    (useEntityStore as unknown as jest.Mock).mockReturnValue(mockStore);
  });

  it('renders the page correctly with loading state', () => {
    render(<TeamMemberEditPage />);
    
    // Check if the page title is rendered
    expect(screen.getByText('Loading team member data...')).toBeInTheDocument();
    
    // Check if the breadcrumbs are rendered
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Entities')).toBeInTheDocument();
    expect(screen.getByText('Team Members')).toBeInTheDocument();
    expect(screen.getByText('Edit Team Member')).toBeInTheDocument();
  });

  it('loads and displays team member data', async () => {
    render(<TeamMemberEditPage />);
    
    // Wait for the team member data to load
    await waitFor(() => {
      expect(mockStore.getTeamMember).toHaveBeenCalledWith('1');
    });
    
    // Check if the page title is rendered
    expect(screen.getByRole('heading', { name: /edit team member/i, level: 1 })).toBeInTheDocument();
    
    // Check if the form is rendered
    expect(screen.getByTestId('team-member-form')).toBeInTheDocument();
  });

  it('handles error when loading team member data', async () => {
    const mockStoreWithError = {
      getTeamMember: jest.fn().mockImplementation(async () => Promise.reject(new Error('Failed to load team member'))),
    } as Partial<EntityState>;
    (useEntityStore as unknown as jest.Mock).mockReturnValue(mockStoreWithError);

    render(<TeamMemberEditPage />);
    
    // Wait for the error to be displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to load team member. Please try again.')).toBeInTheDocument();
    });
    
    // Check if the toast was called with the error message
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Error',
      description: 'Failed to load team member. Please try again.',
      variant: 'destructive',
    });
    
    // Check if the go back button is rendered
    expect(screen.getByText('Go Back')).toBeInTheDocument();
  });

  it('navigates back when go back button is clicked', async () => {
    const mockStoreWithError = {
      getTeamMember: jest.fn().mockImplementation(async () => Promise.reject(new Error('Failed to load team member'))),
    } as Partial<EntityState>;
    (useEntityStore as unknown as jest.Mock).mockReturnValue(mockStoreWithError);

    render(<TeamMemberEditPage />);
    
    // Wait for the error to be displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to load team member. Please try again.')).toBeInTheDocument();
    });
    
    // Click the go back button
    fireEvent.click(screen.getByText('Go Back'));
    
    // Check if the router.back method was called
    expect(mockRouter.back).toHaveBeenCalled();
  });
}); 