import { jest } from '@jest/globals';
import { screen, render, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/tests/utils/componentTestUtils';
import { mockOrganizationSettings } from '@/tests/utils/mockData';
import EditOrganizationSettingsPage from '@/app/(dashboard)/entities/organization-settings/[id]/edit/page';
import { useEntityStore } from '@/store/slices/entitySlice';
import { useToast } from '@/components/ui/use-toast';
import { OrganizationSettings } from '@/types/entity';

// Mock the hooks
jest.mock('@/store/slices/entitySlice');
jest.mock('@/components/ui/use-toast');
jest.mock('@/lib/prefetching/prefetchProvider', () => ({
  usePrefetchSettings: () => ({
    settings: {
      enabled: true,
      linkHoverDelay: 100,
    }
  })
}));

// Mock next/navigation
const mockPush = jest.fn();
const mockBack = jest.fn();
const mockPrefetch = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
    prefetch: mockPrefetch,
  }),
}));

describe('EditOrganizationSettingsPage', () => {
  const mockParams = {
    id: '123',
  };

  const mockToast = {
    toast: jest.fn(),
  };

  const mockStore = {
    getOrganizationSettingsById: jest.fn(),
    updateOrganizationSettings: jest.fn(),
    organizationSettings: mockOrganizationSettings,
    loading: false,
    error: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue(mockToast);
    (useEntityStore as unknown as jest.Mock).mockReturnValue(mockStore);
  });

  it('should render loading state', () => {
    (useEntityStore as unknown as jest.Mock).mockReturnValue({
      ...mockStore,
      loading: true,
    });

    render(<EditOrganizationSettingsPage params={mockParams} />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('should render error state', () => {
    const errorMessage = 'Failed to load settings';
    (useEntityStore as unknown as jest.Mock).mockReturnValue({
      ...mockStore,
      error: errorMessage,
    });

    render(<EditOrganizationSettingsPage params={mockParams} />);
    expect(screen.getByTestId('error')).toHaveTextContent(errorMessage);
  });

  it('should render organization settings form', () => {
    render(<EditOrganizationSettingsPage params={mockParams} />);
    expect(screen.getByTestId('organization-settings-form')).toBeInTheDocument();
  });

  it('should handle form submission successfully', async () => {
    const mockUpdateOrganizationSettings = jest.fn().mockResolvedValue(undefined);
    (useEntityStore as unknown as jest.Mock).mockReturnValue({
      ...mockStore,
      updateOrganizationSettings: mockUpdateOrganizationSettings,
    });

    render(<EditOrganizationSettingsPage params={mockParams} />);

    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateOrganizationSettings).toHaveBeenCalledWith(
        mockParams.id,
        expect.any(Object)
      );
      expect(mockToast.toast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Organization settings updated successfully',
      });
    });
  });

  it('should handle form submission error', async () => {
    const errorMessage = 'Failed to update settings';
    const mockUpdateOrganizationSettings = jest.fn().mockRejectedValue(new Error(errorMessage));
    (useEntityStore as unknown as jest.Mock).mockReturnValue({
      ...mockStore,
      updateOrganizationSettings: mockUpdateOrganizationSettings,
    });

    render(<EditOrganizationSettingsPage params={mockParams} />);

    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToast.toast).toHaveBeenCalledWith({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    });
  });

  it('should handle cancel button click', () => {
    render(<EditOrganizationSettingsPage params={mockParams} />);

    const cancelButton = screen.getByTestId('cancel-button');
    fireEvent.click(cancelButton);

    expect(mockBack).toHaveBeenCalled();
  });

  it('should fetch organization settings on mount', () => {
    const mockGetOrganizationSettingsById = jest.fn();
    (useEntityStore as unknown as jest.Mock).mockReturnValue({
      ...mockStore,
      getOrganizationSettingsById: mockGetOrganizationSettingsById,
    });

    render(<EditOrganizationSettingsPage params={mockParams} />);

    expect(mockGetOrganizationSettingsById).toHaveBeenCalledWith(mockParams.id);
  });
}); 