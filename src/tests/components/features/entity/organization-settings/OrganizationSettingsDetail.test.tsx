import { jest } from '@jest/globals';
import { screen, render } from '@testing-library/react';
import { renderWithProviders } from '@/tests/utils/componentTestUtils';
import { mockOrganizationSettings } from '@/tests/utils/mockData';
import { OrganizationSettingsDetail } from '@/components/features/entity/organization-settings/OrganizationSettingsDetail';
import { useEntityStore } from '@/store/slices/entitySlice';
import { useToast } from '@/components/ui/use-toast';

// Mock the hooks
jest.mock('@/store/slices/entitySlice');
jest.mock('@/components/ui/use-toast');

describe('OrganizationSettingsDetail', () => {
  const mockToast = jest.fn();
  const mockGetSettings = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useEntityStore as jest.Mock).mockReturnValue({
      getOrganizationSettings: mockGetSettings
    });

    (useToast as jest.Mock).mockReturnValue({
      toast: mockToast
    });
  });

  it('renders correctly with settings data', () => {
    renderWithProviders(
      <OrganizationSettingsDetail 
        settings={mockOrganizationSettings}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );

    // Check if settings details are displayed
    expect(screen.getByText(/Theme/i)).toBeInTheDocument();
    expect(screen.getByText(mockOrganizationSettings.theme)).toBeInTheDocument();
    expect(screen.getByText(/Language/i)).toBeInTheDocument();
    expect(screen.getByText(mockOrganizationSettings.language)).toBeInTheDocument();
    expect(screen.getByText(/Timezone/i)).toBeInTheDocument();
    expect(screen.getByText(mockOrganizationSettings.timezone)).toBeInTheDocument();
  });

  it('displays notification preferences correctly', () => {
    renderWithProviders(
      <OrganizationSettingsDetail 
        settings={mockOrganizationSettings}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );

    // Check notification preferences section
    expect(screen.getByText(/Notification Preferences/i)).toBeInTheDocument();
    expect(screen.getByText(/Email/i)).toBeInTheDocument();
    expect(screen.getByText(/Push/i)).toBeInTheDocument();
  });

  it('displays security settings correctly', () => {
    renderWithProviders(
      <OrganizationSettingsDetail 
        settings={mockOrganizationSettings}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );

    // Check security settings section
    expect(screen.getByText(/Two-Factor Authentication/i)).toBeInTheDocument();
    expect(screen.getByText(/Password Policy/i)).toBeInTheDocument();
  });

  it('displays feature flags correctly', () => {
    renderWithProviders(
      <OrganizationSettingsDetail 
        settings={mockOrganizationSettings}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );

    // Check feature flags section
    expect(screen.getByText(/Feature Flags/i)).toBeInTheDocument();
    expect(screen.getByText(/Beta Features/i)).toBeInTheDocument();
    expect(screen.getByText(/Advanced Analytics/i)).toBeInTheDocument();
  });

  it('handles edit button click', () => {
    const onEdit = jest.fn();
    renderWithProviders(
      <OrganizationSettingsDetail 
        settings={mockOrganizationSettings}
        onEdit={onEdit}
        onDelete={() => {}}
      />
    );

    // Find edit button
    const editButton = screen.getByTestId('edit-button');
    
    // Simulate click
    editButton.click();

    // Check if onEdit was called
    expect(onEdit).toHaveBeenCalled();
  });

  it('displays loading state', () => {
    renderWithProviders(
      <OrganizationSettingsDetail 
        settings={mockOrganizationSettings}
        onEdit={() => {}}
        onDelete={() => {}}
        isLoading={true}
      />
    );

    // Check if loading indicator is displayed
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('displays error state', () => {
    const error = 'Failed to load settings';
    renderWithProviders(
      <OrganizationSettingsDetail 
        settings={mockOrganizationSettings}
        onEdit={() => {}}
        onDelete={() => {}}
        error={error}
      />
    );

    // Check if error message is displayed
    expect(screen.getByText(/Failed to load settings/i)).toBeInTheDocument();
  });
}); 