/**
 * OrganizationGrowth Component Tests
 * Tests the organization growth component functionality
 */

import { jest } from '@jest/globals';
import { renderWithProviders } from '../../../../utils/componentTestUtils';
import { screen, fireEvent } from '@testing-library/react';
import { createMockResponse } from '../../../../utils/mockApi';
import OrganizationGrowth from '../../../../../components/features/entity/analytics/OrganizationGrowth';
import * as useEntityModule from '../../../../../hooks/useEntity';
import React from 'react';
import { cleanup } from '@testing-library/react';

// Mock the hooks
jest.mock('../../../../../hooks/useEntity');

describe('OrganizationGrowth Component', () => {
  // Mock growth data
  const mockGrowthData = {
    employee_growth: 0.15,
    revenue_growth: 0.25,
    department_growth: 0.10,
    team_growth: 0.20,
    historical_data: {
      employee_counts: [
        { date: '2022-01-01', count: 120 },
        { date: '2022-04-01', count: 132 },
        { date: '2022-07-01', count: 145 },
        { date: '2022-10-01', count: 158 },
        { date: '2023-01-01', count: 170 }
      ],
      department_counts: [
        { date: '2022-01-01', count: 8 },
        { date: '2022-04-01', count: 8 },
        { date: '2022-07-01', count: 9 },
        { date: '2022-10-01', count: 9 },
        { date: '2023-01-01', count: 10 }
      ],
      team_counts: [
        { date: '2022-01-01', count: 12 },
        { date: '2022-04-01', count: 14 },
        { date: '2022-07-01', count: 15 },
        { date: '2022-10-01', count: 16 },
        { date: '2023-01-01', count: 18 }
      ]
    },
    growth_by_department: [
      { department_id: '1', department_name: 'Technology', growth_rate: 0.18 },
      { department_id: '2', department_name: 'Operations', growth_rate: 0.12 }
    ],
    growth_projections: {
      next_quarter: {
        employee_count: 185,
        department_count: 10,
        team_count: 20
      },
      next_year: {
        employee_count: 220,
        department_count: 12,
        team_count: 24
      }
    }
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
    data: mockGrowthData
  };

  const mockErrorState = {
    loading: false,
    error: new Error('Failed to load growth data'),
    data: null
  };

  // Mock the useEntity hook
  const mockGetOrganizationGrowth = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock implementation
    jest.spyOn(useEntityModule, 'useEntity').mockImplementation(() => ({
      getOrganizationGrowth: mockGetOrganizationGrowth,
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
        getOrganizationAnalytics: jest.fn(),
        getOrganizationActivity: jest.fn(),
        getOrganizationPerformance: jest.fn(),
      },
      // Include other mock objects required by the component
      departments: {},
      teams: {},
      teamMembers: {},
      organizationSettings: {}
    }));
  });

  test('renders the component in loading state', () => {
    // Mock the loading state
    mockGetOrganizationGrowth.mockReturnValue(mockLoadingState);
    
    renderWithProviders(
      <OrganizationGrowth organizationId="1" />
    );
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  test('renders growth data correctly', () => {
    // Mock the success state
    mockGetOrganizationGrowth.mockReturnValue(mockSuccessState);
    
    renderWithProviders(
      <OrganizationGrowth organizationId="1" />
    );
    
    // Check that growth rates are displayed
    expect(screen.getAllByText('Employee Growth')[0]).toBeInTheDocument();
    expect(screen.getByText('15%')).toBeInTheDocument(); // employee_growth
    expect(screen.getAllByText('Department Growth')[0]).toBeInTheDocument();
    expect(screen.getByText('10%')).toBeInTheDocument(); // department_growth
    expect(screen.getAllByText('Team Growth')[0]).toBeInTheDocument();
    expect(screen.getByText('20%')).toBeInTheDocument(); // team_growth
    
    // Check that numerical values are displayed
    expect(screen.getByText('120')).toBeInTheDocument(); // employee count
    expect(screen.getByText('10')).toBeInTheDocument(); // department count
    expect(screen.getByText('18')).toBeInTheDocument(); // team count
    
    // Check that department growth is displayed
    expect(screen.getByText('Growth by Department')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('18%')).toBeInTheDocument(); // Technology growth rate
    
    // Check that growth chart is rendered
    expect(screen.getByTestId('employee-growth-chart')).toBeInTheDocument();
  });

  test('displays error message when growth data fails to load', () => {
    // Mock the error state
    mockGetOrganizationGrowth.mockReturnValue(mockErrorState);
    
    renderWithProviders(
      <OrganizationGrowth organizationId="1" />
    );
    
    expect(screen.getByText('Failed to load growth data')).toBeInTheDocument();
  });

  test('calls getOrganizationGrowth on component mount', () => {
    // Mock the success state
    mockGetOrganizationGrowth.mockReturnValue(mockSuccessState);
    
    renderWithProviders(
      <OrganizationGrowth organizationId="1" />
    );
    
    expect(mockGetOrganizationGrowth).toHaveBeenCalledWith('1');
  });

  test('changes chart type when selecting different metrics', () => {
    // Mock the success state
    mockGetOrganizationGrowth.mockReturnValue(mockSuccessState);
    
    renderWithProviders(
      <OrganizationGrowth organizationId="1" />
    );
    
    // Initially employee growth chart should be displayed
    expect(screen.getByTestId('employee-growth-chart')).toBeInTheDocument();
    
    // Click on department growth tab
    const departmentTab = screen.getByTestId('department-growth-tab');
    fireEvent.click(departmentTab);
    
    // Now department growth chart should be displayed
    expect(screen.getByTestId('department-growth-chart')).toBeInTheDocument();
  });

  test('shows department growth details when clicking on a department', () => {
    // Mock the success state
    mockGetOrganizationGrowth.mockReturnValue(mockSuccessState);
    
    // Mock useState for selectedDepartment to be already set
    const originalUseState = React.useState;
    jest.spyOn(React, 'useState').mockImplementation((initialValue) => {
      // Only mock the selectedDepartment state
      if (initialValue === null) {
        return ['1', jest.fn()]; // Return '1' as the selected department
      }
      // For all other useState calls, use the original implementation
      return originalUseState(initialValue);
    });
    
    renderWithProviders(
      <OrganizationGrowth organizationId="1" />
    );
    
    // Now check for the department details to be displayed
    expect(screen.getByText('Technology Growth Details')).toBeInTheDocument();
    
    // Restore the original useState
    React.useState.mockRestore();
  });

  test('allows exporting growth data', () => {
    // Mock the success state
    mockGetOrganizationGrowth.mockReturnValue(mockSuccessState);
    
    // Mock the navigator.clipboard.writeText function
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined)
      }
    });
    
    renderWithProviders(
      <OrganizationGrowth organizationId="1" />
    );
    
    // Get the export button and click it
    const exportButton = screen.getByTestId('export-growth-button');
    fireEvent.click(exportButton);
    
    // Check that the clipboard.writeText was called with the growth data
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('employee_growth')
    );
  });

  test('applies time range filters', () => {
    // Mock the success state
    mockGetOrganizationGrowth.mockReturnValue(mockSuccessState);
    
    renderWithProviders(
      <OrganizationGrowth organizationId="1" />
    );
    
    // Get the filter controls
    const timeRangeDropdown = screen.getByTestId('growth-time-range');
    
    // Apply a time range filter
    fireEvent.change(timeRangeDropdown, { target: { value: 'last_year' } });
    
    // Check that getOrganizationGrowth was called with the filter
    expect(mockGetOrganizationGrowth).toHaveBeenCalledWith('1', expect.objectContaining({
      time_period: 'last_year'
    }));
  });

  test('toggles between actual and projected growth data', () => {
    // Mock the success state
    mockGetOrganizationGrowth.mockReturnValue(mockSuccessState);
    
    renderWithProviders(
      <OrganizationGrowth organizationId="1" />
    );
    
    // Initially actual growth data should be displayed
    expect(screen.getByText('Actual Growth')).toBeInTheDocument();
    
    // Click on projections tab
    const projectionsTab = screen.getByTestId('projections-tab');
    fireEvent.click(projectionsTab);
    
    // Now projected growth data should be displayed
    expect(screen.getByText('Projections')).toBeInTheDocument();
  });

  test('refreshes growth data when refresh button is clicked', () => {
    // Mock the success state
    mockGetOrganizationGrowth.mockReturnValue(mockSuccessState);
    
    renderWithProviders(
      <OrganizationGrowth organizationId="1" />
    );
    
    // Get the refresh button and click it
    const refreshButton = screen.getByTestId('refresh-growth-button');
    fireEvent.click(refreshButton);
    
    // Check that getOrganizationGrowth was called again
    expect(mockGetOrganizationGrowth).toHaveBeenCalledTimes(2);
  });
}); 