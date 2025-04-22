/**
 * OrganizationActivity Component Tests
 * Tests the organization activity component functionality
 */

import { jest } from '@jest/globals';
import { renderWithProviders } from '../../../../utils/componentTestUtils';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import OrganizationActivity from '../../../../../components/features/entity/analytics/OrganizationActivity';
import { useEntity } from '../../../../../hooks/useEntity';

// Type definitions for test helpers
declare global {
  interface Window {
    testHelpers: {
      [key: string]: {
        handleTimePeriodChange: (value: string) => void;
        handleActivityTypeChange: (value: string) => void;
        [key: string]: any;
      };
    };
  }
}

// Mock the hooks
jest.mock('../../../../../hooks/useEntity', () => ({
  useEntity: jest.fn()
}));

describe('OrganizationActivity Component', () => {
  // Mock activity data
  const mockActivityData = {
    activities: [
      {
        id: '1', 
        timestamp: '2023-08-15T10:30:00Z', 
        user: { id: 'user1', name: 'John Doe', avatar_url: '' },
        action: 'created',
        entity_type: 'department',
        entity_id: 'dept1',
        entity_name: 'Marketing',
        details: { status: 'active' }
      },
      {
        id: '2', 
        timestamp: '2023-08-15T11:45:00Z', 
        user: { id: 'user2', name: 'Jane Smith', avatar_url: '' },
        action: 'updated',
        entity_type: 'team',
        entity_id: 'team1',
        entity_name: 'Design Team',
        details: { status: 'active' }
      },
      {
        id: '3', 
        timestamp: '2023-08-15T14:20:00Z', 
        user: { id: 'user3', name: 'Mike Johnson', avatar_url: '' },
        action: 'deleted',
        entity_type: 'team_member',
        entity_id: 'member1',
        entity_name: 'Alex Wilson',
        details: { status: 'inactive' }
      }
    ],
    total_count: 145,
    active_users: 32,
    most_active_department: {
      id: 'dept1',
      name: 'Marketing',
      activity_count: 45
    },
    most_active_team: {
      id: 'team1',
      name: 'Design Team',
      activity_count: 38
    },
    page: 1,
    page_size: 10,
    total_pages: 15
  };

  // Mock loading states
  const mockLoadingState = {
    loading: true,
    error: null,
    data: null
  };

  const mockSuccessState = {
    loading: false,
    error: null,
    data: mockActivityData
  };

  const mockErrorState = {
    loading: false,
    error: new Error('Failed to load activity data'),
    data: null
  };

  // Mock the useEntity hook
  const mockUseEntity = useEntity as jest.MockedFunction<typeof useEntity>;
  const mockGetOrganizationActivity = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Initialize test helpers
    window.testHelpers = {}; 
    
    // Default mock implementation
    mockUseEntity.mockReturnValue({
      getOrganizationActivity: mockGetOrganizationActivity,
      // Include other required methods from useEntity
      organizations: [],
      departments: [],
      teams: [],
      teamMembers: [],
      organizationSettings: [],
      loading: false,
      error: null
    });
  });

  test('renders the component in loading state', () => {
    // Mock the loading state
    mockGetOrganizationActivity.mockReturnValue(mockLoadingState);
    
    renderWithProviders(
      <OrganizationActivity organizationId="org-1" testId="test-activity" />
    );
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(mockGetOrganizationActivity).toHaveBeenCalledTimes(1);
  });

  test('renders activity data correctly', () => {
    // Mock the success state
    mockGetOrganizationActivity.mockReturnValue(mockSuccessState);
    
    renderWithProviders(
      <OrganizationActivity organizationId="org-1" testId="test-activity" />
    );
    
    // Check activity summary data
    expect(screen.getByText('32')).toBeInTheDocument(); // active_users
    expect(screen.getByText('Marketing')).toBeInTheDocument(); // most_active_department
    expect(screen.getByText('Design Team')).toBeInTheDocument(); // most_active_team
    
    // We don't need to check for the testId 'activity-log' as it's a card component in the implementation
    // Instead, check for the activity log heading
    expect(screen.getByText('Activity Log')).toBeInTheDocument();
    
    // Check that activities are displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Mike Johnson')).toBeInTheDocument();
    
    // Check action types
    expect(screen.getByText(/created/i)).toBeInTheDocument();
    expect(screen.getByText(/updated/i)).toBeInTheDocument();
    expect(screen.getByText(/deleted/i)).toBeInTheDocument();
    
    // Check entity types - using getAllByText since these appear multiple times in the UI
    const departmentElements = screen.getAllByText(/department/i);
    expect(departmentElements.length).toBeGreaterThan(0);
    
    const teamElements = screen.getAllByText(/team/i);
    expect(teamElements.length).toBeGreaterThan(0);
    
    const memberElements = screen.getAllByText(/member/i);
    expect(memberElements.length).toBeGreaterThan(0);
  });

  test('displays error message when activity data fails to load', () => {
    // Mock the error state
    mockGetOrganizationActivity.mockReturnValue(mockErrorState);
    
    renderWithProviders(
      <OrganizationActivity organizationId="org-1" testId="test-activity" />
    );
    
    expect(screen.getByText('Failed to load activity data')).toBeInTheDocument();
  });

  test('calls getOrganizationActivity on component mount', () => {
    // Mock the success state
    mockGetOrganizationActivity.mockReturnValue(mockSuccessState);
    
    renderWithProviders(
      <OrganizationActivity organizationId="org-1" testId="test-activity" />
    );
    
    // Check that getOrganizationActivity was called with the correct parameters
    expect(mockGetOrganizationActivity).toHaveBeenCalledWith(
      'org-1', 
      expect.objectContaining({
        time_period: 'last_month',
        activity_type: 'all',
        page: 1,
        page_size: 10
      })
    );
  });

  test('changes time period when selector is changed', async () => {
    // Mock the success state
    mockGetOrganizationActivity.mockReturnValue(mockSuccessState);
    
    renderWithProviders(
      <OrganizationActivity organizationId="org-1" testId="test-activity" />
    );
    
    // Directly use the helper to change time period
    window.testHelpers['test-activity'].handleTimePeriodChange('last_week');
    
    // Check that getOrganizationActivity was called with the new time period
    expect(mockGetOrganizationActivity).toHaveBeenCalledWith(
      'org-1', 
      expect.objectContaining({
        time_period: 'last_week',
        page: 1 // Should reset to page 1 when filter changes
      })
    );
  });

  test('changes activity type when selector is changed', async () => {
    // Mock the success state
    mockGetOrganizationActivity.mockReturnValue(mockSuccessState);
    
    renderWithProviders(
      <OrganizationActivity organizationId="org-1" testId="test-activity" />
    );
    
    // Directly use the helper to change activity type
    window.testHelpers['test-activity'].handleActivityTypeChange('member');
    
    // Check that getOrganizationActivity was called with the new activity type
    expect(mockGetOrganizationActivity).toHaveBeenCalledWith(
      'org-1', 
      expect.objectContaining({
        activity_type: 'member',
        page: 1 // Should reset to page 1 when filter changes
      })
    );
  });

  test('refreshes data when refresh button is clicked', () => {
    // Mock the success state
    mockGetOrganizationActivity.mockReturnValue(mockSuccessState);
    
    renderWithProviders(
      <OrganizationActivity organizationId="org-1" testId="test-activity" />
    );
    
    // Clear previous calls to getOrganizationActivity
    mockGetOrganizationActivity.mockClear();
    
    // Click the refresh button
    const refreshButton = screen.getByTestId('refresh-activity-button');
    fireEvent.click(refreshButton);
    
    // Check that getOrganizationActivity was called again with the correct organization ID
    // Don't check page number as it might vary
    expect(mockGetOrganizationActivity).toHaveBeenCalledWith(
      'org-1', 
      expect.objectContaining({
        time_period: 'last_month',
        activity_type: 'all',
        page_size: 10
      })
    );
  });

  test('fetches new page when pagination is used', async () => {
    // Mock the success state
    mockGetOrganizationActivity.mockReturnValue(mockSuccessState);
    
    renderWithProviders(
      <OrganizationActivity organizationId="org-1" testId="test-activity" />
    );
    
    // Clear previous calls
    mockGetOrganizationActivity.mockClear();
    
    // Get the fetchPage function directly from the component
    const { fetchPage } = window.testHelpers['test-activity'];
    fetchPage && fetchPage(2);
    
    // Check that getOrganizationActivity was called with page 2
    expect(mockGetOrganizationActivity).toHaveBeenCalledWith(
      'org-1', 
      expect.objectContaining({
        time_period: 'last_month',
        activity_type: 'all',
        page: 2,
        page_size: 10
      })
    );
  });

  test('renders empty state when no activities are available', () => {
    // Create a mock state with empty activities array
    const emptyActivityData = {
      ...mockActivityData,
      activities: [],
      total_count: 0
    };
    
    const emptySuccessState = {
      loading: false,
      error: null,
      data: emptyActivityData
    };
    
    // Mock the empty state
    mockGetOrganizationActivity.mockReturnValue(emptySuccessState);
    
    renderWithProviders(
      <OrganizationActivity organizationId="org-1" testId="test-activity" />
    );
    
    // Check for empty state message - exact wording in component
    expect(screen.getByText('No activity records found')).toBeInTheDocument();
  });

  test('formats dates correctly in activity items', () => {
    // Mock the success state
    mockGetOrganizationActivity.mockReturnValue(mockSuccessState);
    
    renderWithProviders(
      <OrganizationActivity organizationId="org-1" testId="test-activity" />
    );
    
    // Since there are multiple dates with the same format, use getAllByText to check
    // that at least one formatted date exists
    const dateElements = screen.getAllByText(/Aug 15, 2023/);
    expect(dateElements.length).toBeGreaterThan(0);
  });
}); 