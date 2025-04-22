/**
 * OrganizationAnalytics Component Tests
 * Tests the organization analytics component functionality
 */

import { jest } from '@jest/globals';
import { renderWithProviders, componentTestHarness } from '../../../../utils/componentTestUtils';
import mockUserEvent from '../../../../utils/mockUserEvent';
import { createMockResponse } from '../../../../utils/mockApi';
import OrganizationAnalytics from '../../../../../components/features/entity/analytics/OrganizationAnalytics';
import { useEntity } from '../../../../../hooks/useEntity';

// Type definitions for test helpers
declare global {
  interface Window {
    testHelpers: {
      [key: string]: {
        handleTimePeriodChange: (value: string) => void;
        [key: string]: any;
      };
    };
  }
}

// Mock the hooks
jest.mock('../../../../../hooks/useEntity', () => ({
  useEntity: jest.fn()
}));

describe('OrganizationAnalytics Component', () => {
  // Mock analytics data
  const mockAnalyticsData = {
    total_employees: 100,
    departments_count: 5,
    teams_count: 10,
    growth_rate: 0.15,
    efficiency_score: 85,
    collaboration_score: 78,
    engagement_rate: 0.72
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
    data: mockAnalyticsData
  };

  const mockErrorState = {
    loading: false,
    error: new Error('Failed to load analytics data'),
    data: null
  };

  // Mock the useEntity hook
  const mockUseEntity = useEntity as jest.MockedFunction<typeof useEntity>;
  const mockGetOrganizationAnalytics = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation
    mockUseEntity.mockReturnValue({
      getOrganizationAnalytics: mockGetOrganizationAnalytics,
      // Include other required methods from useEntity
      organizations: {
        getOrganizations: jest.fn(),
        getOrganization: jest.fn(),
        createOrganization: jest.fn(),
        updateOrganization: jest.fn(),
        deleteOrganization: jest.fn(),
        hardDeleteOrganization: jest.fn(),
        getOrganizationDepartments: jest.fn(),
        getOrganizationTeamMembers: jest.fn(),
        getOrganizationActivity: jest.fn(),
        getOrganizationPerformance: jest.fn(),
        getOrganizationGrowth: jest.fn(),
      },
      // Include other mock objects required by the component
      departments: {},
      teams: {},
      teamMembers: {},
      organizationSettings: {}
    });
  });

  test('renders the component in loading state', () => {
    // Mock the loading state
    mockGetOrganizationAnalytics.mockReturnValue(mockLoadingState);
    
    const { getByTestId } = renderWithProviders(
      <OrganizationAnalytics organizationId="1" />
    );
    
    expect(getByTestId('loading-spinner')).toBeInTheDocument();
  });

  test('renders analytics data correctly', () => {
    // Mock the success state
    mockGetOrganizationAnalytics.mockReturnValue(mockSuccessState);
    
    const { getByText, getByTestId } = renderWithProviders(
      <OrganizationAnalytics organizationId="1" />
    );
    
    // Check that key metrics are displayed
    expect(getByText('100')).toBeInTheDocument(); // total_employees
    expect(getByText('5')).toBeInTheDocument(); // departments_count
    expect(getByText('10')).toBeInTheDocument(); // teams_count
    expect(getByText('15%')).toBeInTheDocument(); // growth_rate
    expect(getByText('85%')).toBeInTheDocument(); // efficiency_score
    
    // Check that charts are rendered
    expect(getByTestId('organization-analytics-chart')).toBeInTheDocument();
  });

  test('displays error message when analytics data fails to load', () => {
    // Mock the error state
    mockGetOrganizationAnalytics.mockReturnValue(mockErrorState);
    
    const { getByText } = renderWithProviders(
      <OrganizationAnalytics organizationId="1" />
    );
    
    expect(getByText('Failed to load analytics data')).toBeInTheDocument();
  });

  test('calls getOrganizationAnalytics on component mount', () => {
    // Mock the success state
    mockGetOrganizationAnalytics.mockReturnValue(mockSuccessState);
    
    renderWithProviders(
      <OrganizationAnalytics organizationId="1" />
    );
    
    expect(mockGetOrganizationAnalytics).toHaveBeenCalledWith('1');
  });

  test('refreshes analytics data when refresh button is clicked', async () => {
    // Mock the success state
    mockGetOrganizationAnalytics.mockReturnValue(mockSuccessState);
    
    const { getByTestId } = renderWithProviders(
      <OrganizationAnalytics organizationId="1" />
    );
    
    // Get the refresh button and click it
    const refreshButton = getByTestId('refresh-analytics-button');
    await mockUserEvent.click(refreshButton);
    
    // Check that getOrganizationAnalytics was called again
    expect(mockGetOrganizationAnalytics).toHaveBeenCalledTimes(2);
  });

  test('allows exporting analytics data', async () => {
    // Mock the success state
    mockGetOrganizationAnalytics.mockReturnValue(mockSuccessState);
    
    // Mock the navigator.clipboard.writeText function
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined)
      }
    });
    
    const { getByTestId } = renderWithProviders(
      <OrganizationAnalytics organizationId="1" />
    );
    
    // Get the export button and click it
    const exportButton = getByTestId('export-analytics-button');
    await mockUserEvent.click(exportButton);
    
    // Check that the clipboard.writeText was called with the analytics data
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('total_employees')
    );
  });

  test('displays time period selection controls', () => {
    // Mock the success state
    mockGetOrganizationAnalytics.mockReturnValue(mockSuccessState);
    
    const { getByTestId } = renderWithProviders(
      <OrganizationAnalytics organizationId="1" />
    );
    
    expect(getByTestId('time-period-selector')).toBeInTheDocument();
  });

  test('changes analytics data when time period changes', async () => {
    // Mock the success state
    mockGetOrganizationAnalytics.mockReturnValue(mockSuccessState);
    
    // Set up testing environment
    window.testHelpers = {}; // Initialize test helpers
    
    renderWithProviders(
      <OrganizationAnalytics organizationId="1" testId="test-analytics" />
    );
    
    // Use test helper to directly call the handler
    window.testHelpers['test-analytics'].handleTimePeriodChange('last_quarter');
    
    // Check that getOrganizationAnalytics was called with the new time period
    expect(mockGetOrganizationAnalytics).toHaveBeenCalledWith('1', expect.objectContaining({
      time_period: 'last_quarter'
    }));
  });
}); 