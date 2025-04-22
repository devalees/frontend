import { jest } from '@jest/globals';
import { screen, render, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '@/tests/utils/componentTestUtils';
import { mockOrganizationSettings } from '@/tests/utils/mockData';
import { OrganizationSettingsForm } from '@/components/features/entity/organization-settings/OrganizationSettingsForm';
import { useEntityStore } from '@/store/slices/entitySlice';
import { useToast } from '@/components/ui/use-toast';

// Mock the hooks
jest.mock('@/store/slices/entitySlice');
jest.mock('@/components/ui/use-toast');

describe('OrganizationSettingsForm', () => {
  const mockCreate = jest.fn();
  const mockUpdate = jest.fn();
  const mockShowToast = jest.fn();
  const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useEntityStore as jest.Mock).mockReturnValue({
      createOrganizationSettings: mockCreate,
      updateOrganizationSettings: mockUpdate,
    });
    (useToast as jest.Mock).mockReturnValue({
      toast: mockShowToast
    });
  });

  it('renders correctly with new settings', () => {
    render(
      <OrganizationSettingsForm 
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Check if form fields are displayed
    expect(screen.getByTestId('theme-input')).toBeInTheDocument();
    expect(screen.getByTestId('language-input')).toBeInTheDocument();
    expect(screen.getByTestId('timezone-input')).toBeInTheDocument();
    expect(screen.getByTestId('date-format-input')).toBeInTheDocument();
  });

  it('renders correctly with existing settings', () => {
    render(
      <OrganizationSettingsForm 
        settings={mockOrganizationSettings}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Check if form fields are populated with existing values
    expect(screen.getByTestId('theme-input')).toHaveValue(mockOrganizationSettings.theme);
    expect(screen.getByTestId('language-input')).toHaveValue(mockOrganizationSettings.language);
    expect(screen.getByTestId('timezone-input')).toHaveValue(mockOrganizationSettings.timezone);
    expect(screen.getByTestId('date-format-input')).toHaveValue(mockOrganizationSettings.date_format);
  });

  it('handles form submission for new settings', async () => {
    render(
      <OrganizationSettingsForm 
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Fill in form fields
    const themeSelect = screen.getByTestId('theme-input');
    const languageSelect = screen.getByTestId('language-input');
    const timezoneSelect = screen.getByTestId('timezone-input');
    const dateFormatSelect = screen.getByTestId('date-format-input');

    fireEvent.change(themeSelect, { target: { value: 'dark' } });
    fireEvent.change(languageSelect, { target: { value: 'en' } });
    fireEvent.change(timezoneSelect, { target: { value: 'UTC' } });
    fireEvent.change(dateFormatSelect, { target: { value: 'MM/DD/YYYY' } });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Save Settings/i });
    fireEvent.click(submitButton);

    // Check if onSubmit was called
    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('handles form submission for existing settings', async () => {
    render(
      <OrganizationSettingsForm 
        settings={mockOrganizationSettings}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Change form fields
    const themeSelect = screen.getByTestId('theme-input');
    fireEvent.change(themeSelect, { target: { value: 'dark' } });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Update Settings/i });
    fireEvent.click(submitButton);

    // Check if onSubmit was called
    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('handles cancel button click', () => {
    render(
      <OrganizationSettingsForm 
        settings={mockOrganizationSettings}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Click cancel button
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    cancelButton.click();

    // Check if onCancel was called
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('displays loading state', () => {
    render(
      <OrganizationSettingsForm 
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={true}
      />
    );

    // Check if loading indicator is displayed
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('displays error state', () => {
    const errorMessage = 'Test error message';
    render(
      <OrganizationSettingsForm 
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        error={errorMessage}
      />
    );

    // Check if error message is displayed
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
}); 