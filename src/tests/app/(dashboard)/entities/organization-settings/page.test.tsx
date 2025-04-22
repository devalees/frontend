import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/tests/utils/componentTestUtils';
import { mockOrganizationSettings } from '@/tests/utils/mockData';
import OrganizationSettingsPage from '@/app/(dashboard)/entities/organization-settings/page';
import { useEntityStore } from '@/store/slices/entitySlice';
import { useToast } from '@/components/ui/use-toast';

// Mock the hooks
jest.mock('@/store/slices/entitySlice');
jest.mock('@/components/ui/use-toast');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

describe('OrganizationSettingsPage', () => {
  const mockGetSettings = jest.fn();
  const mockUpdateSettings = jest.fn();
  const mockShowToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useEntityStore as jest.Mock).mockReturnValue({
      getOrganizationSettings: mockGetSettings,
      updateOrganizationSettings: mockUpdateSettings,
      organizationSettings: mockOrganizationSettings,
      isLoading: false,
      error: null,
    });
    (useToast as jest.Mock).mockReturnValue({
      toast: mockShowToast
    });
  });

  it('renders the organization settings page', async () => {
    render(<OrganizationSettingsPage />);

    // Check if the page title is rendered
    expect(screen.getByRole('heading', { name: 'Organization Settings', level: 1 })).toBeInTheDocument();

    // Check if breadcrumbs are rendered
    expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Organization Settings' })).toBeInTheDocument();

    // Check if the settings form is rendered
    expect(screen.getByTestId('organization-settings-form')).toBeInTheDocument();
  });

  it('handles settings update successfully', async () => {
    mockUpdateSettings.mockResolvedValueOnce(mockOrganizationSettings);
    
    render(<OrganizationSettingsPage />);

    // Fill in form fields
    const themeSelect = screen.getByTestId('theme-input');
    fireEvent.change(themeSelect, { target: { value: 'dark' } });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Update Settings/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateSettings).toHaveBeenCalled();
      expect(mockShowToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Organization settings updated successfully',
      });
    });
  });

  it('handles settings update error', async () => {
    const error = new Error('Failed to update settings');
    mockUpdateSettings.mockRejectedValueOnce(error);
    
    render(<OrganizationSettingsPage />);

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Update Settings/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateSettings).toHaveBeenCalled();
      expect(mockShowToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to update settings',
        variant: 'destructive',
      });
    });
  });

  it('displays loading state', () => {
    (useEntityStore as jest.Mock).mockReturnValue({
      getOrganizationSettings: mockGetSettings,
      updateOrganizationSettings: mockUpdateSettings,
      organizationSettings: null,
      isLoading: true,
      error: null,
    });

    render(<OrganizationSettingsPage />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('displays error state', () => {
    const errorMessage = 'Failed to load settings';
    (useEntityStore as jest.Mock).mockReturnValue({
      getOrganizationSettings: mockGetSettings,
      updateOrganizationSettings: mockUpdateSettings,
      organizationSettings: null,
      isLoading: false,
      error: errorMessage,
    });

    render(<OrganizationSettingsPage />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
}); 