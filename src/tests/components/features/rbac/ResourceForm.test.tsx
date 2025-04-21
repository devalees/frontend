/**
 * ResourceForm Component Tests
 * 
 * Tests for the ResourceForm component which handles creating and editing resources.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { componentTestHarness } from '../../../../tests/utils/componentTestUtils';
import { mockApiMethod, resetApiMocks } from '../../../../tests/utils/mockApi';
import { Resource } from '../../../../types/rbac';
import { useRbac } from '../../../../hooks/useRbac';
import { ResourceForm } from '../../../../components/features/rbac/ResourceForm';

// Mock the useRbac hook
jest.mock('../../../../hooks/useRbac', () => ({
  useRbac: jest.fn()
}));

// Mock data
const mockResource: Resource = {
  id: '1',
  name: 'User Management',
  type: 'module',
  description: 'User management module',
  is_active: true,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z'
};

// Mock the useRbac hook implementation
const mockUseRbac = useRbac as jest.Mock;

describe('ResourceForm Component', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    resetApiMocks();
    mockUseRbac.mockReturnValue({
      createResource: jest.fn(),
      updateResource: jest.fn(),
      loading: false,
      error: null
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render empty form for creating new resource', () => {
    render(
      <ResourceForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Check if form fields are rendered
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();

    // Check if buttons are rendered
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('should render form with resource data for editing', () => {
    render(
      <ResourceForm
        resource={mockResource}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Check if form fields are populated with resource data
    expect(screen.getByLabelText('Name')).toHaveValue(mockResource.name);
    expect(screen.getByLabelText('Type')).toHaveValue(mockResource.type);
    expect(screen.getByLabelText('Description')).toHaveValue(mockResource.description);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('should validate required fields', async () => {
    render(
      <ResourceForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Try to submit form without required fields
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    // Check for validation messages in the live region
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Form validation failed: Name is required');
    });

    // Ensure onSubmit was not called
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should handle form submission for new resource', async () => {
    render(
      <ResourceForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Fill out form
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'New Resource' }
    });
    fireEvent.change(screen.getByLabelText('Type'), {
      target: { value: 'module' }
    });
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'New resource description' }
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    // Check if onSubmit was called with correct data
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'New Resource',
        type: 'module',
        description: 'New resource description',
        is_active: true
      });
    });
  });

  it('should handle form submission for editing resource', async () => {
    render(
      <ResourceForm
        resource={mockResource}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Modify form fields
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Updated Resource' }
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    // Check if onSubmit was called with correct data
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        ...mockResource,
        name: 'Updated Resource'
      });
    });
  });

  it('should handle cancel button click', () => {
    render(
      <ResourceForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should show loading state during submission', () => {
    mockUseRbac.mockReturnValue({
      createResource: jest.fn(),
      updateResource: jest.fn(),
      loading: true,
      error: null
    });

    render(
      <ResourceForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
  });

  it('should show error message when submission fails', () => {
    const errorMessage = 'Failed to save resource';
    mockUseRbac.mockReturnValue({
      createResource: jest.fn(),
      updateResource: jest.fn(),
      loading: false,
      error: errorMessage
    });

    render(
      <ResourceForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
  });
}); 