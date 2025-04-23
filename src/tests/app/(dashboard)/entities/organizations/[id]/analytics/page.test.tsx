/**
 * Organization Analytics Page Tests
 * Tests the organization analytics page functionality and component integration
 */

import React from 'react';
import { renderWithProviders, componentTestHarness } from '@/tests/utils/componentTestUtils';
import { screen, waitFor } from '@testing-library/react';
import mockUserEvent from '@/tests/utils/mockUserEvent';
import { createMockResponse } from '@/tests/utils/mockApi';
import OrganizationAnalyticsPage from '@/app/(dashboard)/entities/organizations/[id]/analytics/page';

// Mock individual analytics components
jest.mock('@/components/features/entity/analytics/OrganizationAnalytics', () => ({
  __esModule: true,
  default: ({ organizationId }: { organizationId: string }) => (
    <div data-testid="organization-analytics">
      Organization Analytics Component (ID: {organizationId})
    </div>
  )
}));

jest.mock('@/components/features/entity/analytics/OrganizationActivity', () => ({
  __esModule: true,
  default: ({ organizationId }: { organizationId: string }) => (
    <div data-testid="organization-activity">
      Organization Activity Component (ID: {organizationId})
    </div>
  )
}));

jest.mock('@/components/features/entity/analytics/OrganizationPerformance', () => ({
  __esModule: true,
  default: ({ organizationId }: { organizationId: string }) => (
    <div data-testid="organization-performance">
      Organization Performance Component (ID: {organizationId})
    </div>
  )
}));

jest.mock('@/components/features/entity/analytics/OrganizationGrowth', () => ({
  __esModule: true,
  default: ({ organizationId }: { organizationId: string }) => (
    <div data-testid="organization-growth">
      Organization Growth Component (ID: {organizationId})
    </div>
  )
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useParams: jest.fn().mockReturnValue({ id: '123' }),
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
    back: jest.fn()
  })
}));

// Mock the store
const mockGetOrganization = jest.fn();
jest.mock('@/store/slices/entitySlice', () => ({
  useEntityStore: jest.fn().mockImplementation(() => ({
    getOrganization: mockGetOrganization,
    organizations: [],
    fetchOrganizations: jest.fn(),
    loading: false,
    error: null
  }))
}));

describe('Organization Analytics Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock for getOrganization
    mockGetOrganization.mockResolvedValue({
      id: '123',
      name: 'Test Organization',
      description: 'A test organization',
      industry: 'Technology',
      founded_date: '2020-01-01'
    });
  });

  test('renders loading state initially', async () => {
    mockGetOrganization.mockImplementation(() => new Promise((resolve) => {
      // Don't resolve to simulate loading
      setTimeout(() => resolve(null), 10000);
    }));

    const { getByTestId } = renderWithProviders(<OrganizationAnalyticsPage />);
    
    // Check for spinner
    expect(getByTestId('loading-spinner')).toBeInTheDocument();
  });

  test('renders page with organization name after loading', async () => {
    const { getByTestId } = renderWithProviders(<OrganizationAnalyticsPage />);
    
    await waitFor(() => {
      expect(getByTestId('page-title')).toBeInTheDocument();
    });

    // Verify organization analytics component is rendered by default
    expect(screen.getByTestId('organization-analytics')).toBeInTheDocument();
  });

  test('displays correct breadcrumb navigation', async () => {
    const { getByTestId, getByText } = renderWithProviders(<OrganizationAnalyticsPage />);
    
    await waitFor(() => {
      expect(getByTestId('page-title')).toBeInTheDocument();
    });
    
    // Check breadcrumb items
    const breadcrumbs = screen.getByTestId('breadcrumbs');
    expect(breadcrumbs).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Organizations')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
  });

  test('renders correct tabs', async () => {
    const { getByTestId } = renderWithProviders(<OrganizationAnalyticsPage />);
    
    await waitFor(() => {
      expect(getByTestId('page-title')).toBeInTheDocument();
    });
    
    // Check if all tabs are rendered
    expect(screen.getByTestId('overview-tab')).toBeInTheDocument();
    expect(screen.getByTestId('activity-tab')).toBeInTheDocument();
    expect(screen.getByTestId('performance-tab')).toBeInTheDocument();
    expect(screen.getByTestId('growth-tab')).toBeInTheDocument();
  });

  test('switches to activity tab when clicked', async () => {
    const { getByTestId } = renderWithProviders(<OrganizationAnalyticsPage />);
    
    await waitFor(() => {
      expect(getByTestId('page-title')).toBeInTheDocument();
    });
    
    // Initially the overview tab content should be visible
    expect(screen.getByTestId('organization-analytics')).toBeInTheDocument();
    
    // Click on the activity tab
    const activityTab = getByTestId('activity-tab');
    await mockUserEvent.click(activityTab);
    
    // Now the activity tab content should be visible
    expect(screen.getByTestId('organization-activity')).toBeInTheDocument();
  });

  test('switches to performance tab when clicked', async () => {
    const { getByTestId } = renderWithProviders(<OrganizationAnalyticsPage />);
    
    await waitFor(() => {
      expect(getByTestId('page-title')).toBeInTheDocument();
    });
    
    // Click on the performance tab
    const performanceTab = getByTestId('performance-tab');
    await mockUserEvent.click(performanceTab);
    
    // Now the performance tab content should be visible
    expect(screen.getByTestId('organization-performance')).toBeInTheDocument();
  });

  test('switches to growth tab when clicked', async () => {
    const { getByTestId } = renderWithProviders(<OrganizationAnalyticsPage />);
    
    await waitFor(() => {
      expect(getByTestId('page-title')).toBeInTheDocument();
    });
    
    // Click on the growth tab
    const growthTab = getByTestId('growth-tab');
    await mockUserEvent.click(growthTab);
    
    // Now the growth tab content should be visible
    expect(screen.getByTestId('organization-growth')).toBeInTheDocument();
  });

  test('handles organization data fetch error', async () => {
    // Mock an error response
    mockGetOrganization.mockRejectedValue(new Error('Failed to fetch organization'));
    
    // Need to mock console.error to prevent test output noise
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    const { getByTestId } = renderWithProviders(<OrganizationAnalyticsPage />);
    
    await waitFor(() => {
      // Even with error, the page should still render with a generic title
      expect(getByTestId('page-title')).toBeInTheDocument();
    });
    
    // Restore console.error
    console.error = originalConsoleError;
  });

  test('renders NavButtons for navigation', async () => {
    const { getByText, getByTestId } = renderWithProviders(<OrganizationAnalyticsPage />);
    
    await waitFor(() => {
      expect(getByTestId('page-title')).toBeInTheDocument();
    });
    
    // Check navigation buttons
    expect(screen.getByText('Edit Organization')).toBeInTheDocument();
    expect(screen.getByText('View Departments')).toBeInTheDocument();
  });

  test('renders all analytics components correctly', async () => {
    const { getByTestId } = renderWithProviders(<OrganizationAnalyticsPage />);
    
    await waitFor(() => {
      expect(getByTestId('page-title')).toBeInTheDocument();
    });
    
    // Initially renders overview
    expect(getByTestId('organization-analytics')).toBeInTheDocument();
    
    // Switch to activity tab
    await mockUserEvent.click(getByTestId('activity-tab'));
    expect(getByTestId('organization-activity')).toBeInTheDocument();
    
    // Switch to performance tab
    await mockUserEvent.click(getByTestId('performance-tab'));
    expect(getByTestId('organization-performance')).toBeInTheDocument();
    
    // Switch to growth tab
    await mockUserEvent.click(getByTestId('growth-tab'));
    expect(getByTestId('organization-growth')).toBeInTheDocument();
  });
}); 