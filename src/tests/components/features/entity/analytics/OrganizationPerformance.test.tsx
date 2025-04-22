/**
 * OrganizationPerformance Component Tests
 * Tests the organization performance component functionality
 */

import { jest } from '@jest/globals';
import { renderWithProviders } from '../../../../utils/componentTestUtils';
import { screen, fireEvent, within } from '@testing-library/react';
import { createMockResponse } from '../../../../utils/mockApi';
import OrganizationPerformance from '../../../../../components/features/entity/analytics/OrganizationPerformance';
import * as useEntityModule from '../../../../../hooks/useEntity';

// Mock the hooks
jest.mock('../../../../../hooks/useEntity');

describe('OrganizationPerformance Component', () => {
  // Mock performance data
  const mockPerformanceData = {
    overall_score: 85,
    metrics: {
      productivity: 90,
      efficiency: 80,
      quality: 85,
      collaboration: 75,
      innovation: 78
    },
    trends: {
      weekly: [
        { date: '2023-08-01', score: 82 },
        { date: '2023-08-08', score: 84 },
        { date: '2023-08-15', score: 85 }
      ],
      monthly: [
        { date: '2023-06-01', score: 80 },
        { date: '2023-07-01', score: 82 },
        { date: '2023-08-01', score: 85 }
      ]
    },
    team_performance: [
      { team_id: '1', team_name: 'Engineering', score: 88 },
      { team_id: '2', team_name: 'Marketing', score: 82 },
      { team_id: '3', team_name: 'Sales', score: 84 }
    ],
    department_performance: [
      { department_id: '1', department_name: 'Technology', score: 86 },
      { department_id: '2', department_name: 'Operations', score: 83 }
    ]
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
    data: mockPerformanceData
  };

  const mockErrorState = {
    loading: false,
    error: new Error('Failed to load performance data'),
    data: null
  };

  // Mock the useEntity hook
  const mockGetOrganizationPerformance = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock implementation
    jest.spyOn(useEntityModule, 'useEntity').mockImplementation(() => ({
      getOrganizationPerformance: mockGetOrganizationPerformance,
      // Add minimal required mock properties
      organizations: [],
      departments: [],
      teams: [],
      teamMembers: [],
      organizationSettings: [],
      loading: false,
      error: null
    }));
  });

  test('renders the component in loading state', () => {
    // Mock the loading state
    mockGetOrganizationPerformance.mockReturnValue(mockLoadingState);
    
    renderWithProviders(
      <OrganizationPerformance organizationId="1" />
    );
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  test('renders performance data correctly', () => {
    // Mock the success state
    mockGetOrganizationPerformance.mockReturnValue(mockSuccessState);
    
    renderWithProviders(
      <OrganizationPerformance organizationId="1" />
    );
    
    // Check that overall score is displayed
    expect(screen.getByText('Overall Performance')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument(); // overall_score
    
    // Check that metrics are displayed - find by heading and check nearby content
    const cards = screen.getAllByRole('heading');
    
    // Find the Productivity card
    const productivityHeading = cards.find(heading => heading.textContent === 'Productivity');
    expect(productivityHeading).toBeInTheDocument();
    const productivityCard = productivityHeading!.closest('.bg-white');
    expect(within(productivityCard!).getByText('90%')).toBeInTheDocument();
    
    // Find the Efficiency card
    const efficiencyHeading = cards.find(heading => heading.textContent === 'Efficiency');
    expect(efficiencyHeading).toBeInTheDocument();
    const efficiencyCard = efficiencyHeading!.closest('.bg-white');
    expect(within(efficiencyCard!).getByText('80%')).toBeInTheDocument();
    
    // Check that team performance is displayed
    expect(screen.getByText('Team Performance')).toBeInTheDocument();
    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.getByText('88%')).toBeInTheDocument(); // Engineering score
    
    // Check that department performance is displayed
    expect(screen.getByText('Department Performance')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('86%')).toBeInTheDocument(); // Technology score
    
    // Check that performance chart is rendered
    expect(screen.getByTestId('performance-chart')).toBeInTheDocument();
  });

  test('displays error message when performance data fails to load', () => {
    // Mock the error state
    mockGetOrganizationPerformance.mockReturnValue(mockErrorState);
    
    renderWithProviders(
      <OrganizationPerformance organizationId="1" />
    );
    
    expect(screen.getByText('Failed to load performance data')).toBeInTheDocument();
  });

  test('calls getOrganizationPerformance on component mount', () => {
    // Mock the success state
    mockGetOrganizationPerformance.mockReturnValue(mockSuccessState);
    
    renderWithProviders(
      <OrganizationPerformance organizationId="1" />
    );
    
    expect(mockGetOrganizationPerformance).toHaveBeenCalledWith('1', expect.objectContaining({
      time_period: expect.any(String),
      metric_type: expect.any(String)
    }));
  });

  test('changes time period for trends display', () => {
    // Mock the success state
    mockGetOrganizationPerformance.mockReturnValue(mockSuccessState);
    
    renderWithProviders(
      <OrganizationPerformance organizationId="1" />
    );
    
    // Initially weekly trends should be displayed
    expect(screen.getByText('Weekly Trends')).toBeInTheDocument();
    
    // Click on monthly trends tab
    const monthlyTab = screen.getByTestId('monthly-trends-tab');
    fireEvent.click(monthlyTab);
    
    // Now monthly trends should be displayed
    expect(screen.getByText('Monthly Trends')).toBeInTheDocument();
  });

  test('shows team performance details when clicking on a team', () => {
    // Mock the success state
    mockGetOrganizationPerformance.mockReturnValue(mockSuccessState);
    
    renderWithProviders(
      <OrganizationPerformance organizationId="1" />
    );
    
    // Click on a team
    const teamRow = screen.getByText('Engineering').closest('[data-testid="team-row"]');
    fireEvent.click(teamRow);
    
    // Team details should be displayed
    expect(screen.getByTestId('team-details-modal')).toBeInTheDocument();
    expect(screen.getByText('Engineering Performance Details')).toBeInTheDocument();
  });

  test('shows department performance details when clicking on a department', () => {
    // Mock the success state
    mockGetOrganizationPerformance.mockReturnValue(mockSuccessState);
    
    renderWithProviders(
      <OrganizationPerformance organizationId="1" />
    );
    
    // Click on a department
    const departmentRow = screen.getByText('Technology').closest('[data-testid="department-row"]');
    fireEvent.click(departmentRow);
    
    // Department details should be displayed
    expect(screen.getByTestId('department-details-modal')).toBeInTheDocument();
    expect(screen.getByText('Technology Performance Details')).toBeInTheDocument();
  });

  test('allows exporting performance data', () => {
    // Mock the success state
    mockGetOrganizationPerformance.mockReturnValue(mockSuccessState);
    
    // Mock the navigator.clipboard.writeText function
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined)
      }
    });
    
    renderWithProviders(
      <OrganizationPerformance organizationId="1" />
    );
    
    // Get the export button and click it
    const exportButton = screen.getByTestId('export-performance-button');
    fireEvent.click(exportButton);
    
    // Check that the clipboard.writeText was called with the performance data
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('overall_score')
    );
  });

  test('applies performance filters', () => {
    // Mock the success state
    mockGetOrganizationPerformance.mockReturnValue(mockSuccessState);
    
    renderWithProviders(
      <OrganizationPerformance organizationId="1" />
    );
    
    // Get the filter controls
    const timeFilterDropdown = screen.getByTestId('performance-time-filter');
    
    // Apply a time filter
    fireEvent.change(timeFilterDropdown, { target: { value: 'last_quarter' } });
    
    // Check that getOrganizationPerformance was called with the filter
    expect(mockGetOrganizationPerformance).toHaveBeenCalledWith('1', expect.objectContaining({
      time_period: 'last_quarter'
    }));
  });

  test('refreshes performance data when refresh button is clicked', () => {
    // Mock the success state
    mockGetOrganizationPerformance.mockReturnValue(mockSuccessState);
    
    renderWithProviders(
      <OrganizationPerformance organizationId="1" />
    );
    
    // Get the refresh button and click it
    const refreshButton = screen.getByTestId('refresh-performance-button');
    fireEvent.click(refreshButton);
    
    // Check that getOrganizationPerformance was called again
    expect(mockGetOrganizationPerformance).toHaveBeenCalledTimes(2);
  });
}); 