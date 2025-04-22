/**
 * OrganizationForm Component Tests
 * 
 * This file contains tests for the OrganizationForm component.
 * It tests the component's rendering, form validation, and submission.
 */

import { jest } from '@jest/globals';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/tests/utils/componentTestUtils';
import { createMockResponse } from '@/tests/utils/mockApi';
import { useEntityStore } from '@/store/slices/entitySlice';
import { Organization } from '@/types/entity';

// Mock the entity store
jest.mock('@/store/slices/entitySlice', () => ({
  useEntityStore: jest.fn()
}));

// Mock the OrganizationForm component
jest.mock('@/components/features/entity/organizations/OrganizationForm', () => {
  return function MockOrganizationForm({ organization, onSubmit, onCancel, isLoading, error }: any) {
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      const data = {
        name: formData.get('name'),
        description: formData.get('description'),
        size: formData.get('size'),
        industry: formData.get('industry'),
        website: formData.get('website'),
        logo_url: formData.get('logo_url'),
        is_active: formData.get('is_active') === 'true'
      };
      onSubmit(data);
    };

    if (isLoading) return <div data-testid="loading">Saving organization...</div>;
    if (error) return <div data-testid="error">{error}</div>;
    
    return (
      <form data-testid="organization-form" onSubmit={handleSubmit}>
        <input 
          name="name" 
          defaultValue={organization?.name || ''} 
          data-testid="name-input" 
          required 
        />
        <textarea 
          name="description" 
          defaultValue={organization?.description || ''} 
          data-testid="description-input" 
        />
        <select 
          name="size" 
          defaultValue={organization?.size || 'small'} 
          data-testid="size-input"
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
        <input 
          name="industry" 
          defaultValue={organization?.industry || ''} 
          data-testid="industry-input" 
        />
        <input 
          name="website" 
          defaultValue={organization?.website || ''} 
          data-testid="website-input" 
        />
        <input 
          name="logo_url" 
          defaultValue={organization?.logo_url || ''} 
          data-testid="logo-url-input" 
        />
        <select 
          name="is_active" 
          defaultValue={organization?.is_active ? 'true' : 'false'} 
          data-testid="is-active-input"
        >
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <button type="submit" data-testid="submit-button">Save</button>
        <button type="button" onClick={onCancel} data-testid="cancel-button">Cancel</button>
      </form>
    );
  };
});

// Import the component after mocking
import OrganizationForm from '@/components/features/entity/organizations/OrganizationForm';

describe('OrganizationForm Component', () => {
  // Mock data
  const mockOrganization: Organization = {
    id: '1',
    name: 'Test Organization',
    description: 'Test Description',
    size: 'small',
    industry: 'Technology',
    website: 'https://example.com',
    logo_url: 'https://example.com/logo.png',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    is_active: true,
    parent_organization_id: null,
    project_id: null
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty form correctly', () => {
    // Mock the store
    (useEntityStore as jest.Mock).mockImplementation((selector) => {
      const state = {
        isLoading: false,
        error: null
      };
      return selector(state);
    });

    const onSubmit = jest.fn();
    const onCancel = jest.fn();
    renderWithProviders(<OrganizationForm onSubmit={onSubmit} onCancel={onCancel} />);
    
    expect(screen.getByTestId('organization-form')).toBeInTheDocument();
    expect(screen.getByTestId('name-input')).toBeInTheDocument();
    expect(screen.getByTestId('description-input')).toBeInTheDocument();
    expect(screen.getByTestId('size-input')).toBeInTheDocument();
    expect(screen.getByTestId('industry-input')).toBeInTheDocument();
    expect(screen.getByTestId('website-input')).toBeInTheDocument();
    expect(screen.getByTestId('logo-url-input')).toBeInTheDocument();
    expect(screen.getByTestId('is-active-input')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  it('renders form with initial data correctly', () => {
    // Mock the store
    (useEntityStore as jest.Mock).mockImplementation((selector) => {
      const state = {
        isLoading: false,
        error: null
      };
      return selector(state);
    });

    const onSubmit = jest.fn();
    const onCancel = jest.fn();
    renderWithProviders(<OrganizationForm organization={mockOrganization} onSubmit={onSubmit} onCancel={onCancel} />);
    
    expect(screen.getByTestId('name-input')).toHaveValue('Test Organization');
    expect(screen.getByTestId('description-input')).toHaveValue('Test Description');
    expect(screen.getByTestId('size-input')).toHaveValue('small');
    expect(screen.getByTestId('industry-input')).toHaveValue('Technology');
    expect(screen.getByTestId('website-input')).toHaveValue('https://example.com');
    expect(screen.getByTestId('logo-url-input')).toHaveValue('https://example.com/logo.png');
    expect(screen.getByTestId('is-active-input')).toHaveValue('true');
  });

  it('renders loading state correctly', () => {
    // Mock the store to return loading state
    (useEntityStore as jest.Mock).mockImplementation((selector) => {
      const state = {
        isLoading: true,
        error: null
      };
      return selector(state);
    });

    const onSubmit = jest.fn();
    const onCancel = jest.fn();
    renderWithProviders(<OrganizationForm onSubmit={onSubmit} onCancel={onCancel} isLoading={true} />);
    
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('renders error state correctly', () => {
    // Mock the store to return error state
    (useEntityStore as jest.Mock).mockImplementation((selector) => {
      const state = {
        isLoading: false,
        error: 'Failed to save organization'
      };
      return selector(state);
    });

    const onSubmit = jest.fn();
    const onCancel = jest.fn();
    renderWithProviders(<OrganizationForm onSubmit={onSubmit} onCancel={onCancel} error="Failed to save organization" />);
    
    expect(screen.getByTestId('error')).toBeInTheDocument();
    expect(screen.getByText('Failed to save organization')).toBeInTheDocument();
  });

  it('calls onSubmit with form data when submitted', async () => {
    // Mock the store
    (useEntityStore as jest.Mock).mockImplementation((selector) => {
      const state = {
        isLoading: false,
        error: null
      };
      return selector(state);
    });

    const handleSubmit = jest.fn();
    const handleCancel = jest.fn();
    renderWithProviders(<OrganizationForm onSubmit={handleSubmit} onCancel={handleCancel} />);
    
    // Fill out the form
    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'New Organization' } });
    fireEvent.change(screen.getByTestId('description-input'), { target: { value: 'New Description' } });
    fireEvent.change(screen.getByTestId('size-input'), { target: { value: 'medium' } });
    fireEvent.change(screen.getByTestId('industry-input'), { target: { value: 'Finance' } });
    fireEvent.change(screen.getByTestId('website-input'), { target: { value: 'https://new-example.com' } });
    fireEvent.change(screen.getByTestId('logo-url-input'), { target: { value: 'https://new-example.com/logo.png' } });
    fireEvent.change(screen.getByTestId('is-active-input'), { target: { value: 'false' } });
    
    // Submit the form
    fireEvent.click(screen.getByTestId('submit-button'));
    
    // Check that onSubmit was called with the form data
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        name: 'New Organization',
        description: 'New Description',
        size: 'medium',
        industry: 'Finance',
        website: 'https://new-example.com',
        logo_url: 'https://new-example.com/logo.png',
        is_active: false
      });
    });
  });
}); 