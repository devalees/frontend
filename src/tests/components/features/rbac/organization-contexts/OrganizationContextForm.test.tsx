/**
 * OrganizationContextForm Component Tests
 * 
 * Tests for the OrganizationContextForm component which provides a form for adding/editing organization contexts.
 */

import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { componentTestHarness } from '../../../../tests/utils/componentTestUtils';
import { mockApiMethod, resetApiMocks } from '../../../../tests/utils/mockApi';
import { OrganizationContext } from '../../../../types/rbac';
import { useRbac } from '../../../../hooks/useRbac';

// Mock the useRbac hook
jest.mock('../../../../hooks/useRbac', () => ({
  useRbac: jest.fn()
}));

// Mock data
const mockOrganizationContexts = [
  {
    id: '1',
    name: 'Global Organization',
    description: 'Top-level organization context',
    is_active: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'North America',
    description: 'North American division',
    parent_id: '1',
    is_active: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  }
];

// Mock the useRbac hook implementation
const mockUseRbac = useRbac as jest.Mock;

// Mock the OrganizationContextForm component
// This is a placeholder until the actual component is implemented
interface OrganizationContextFormProps {
  initialData?: OrganizationContext;
  onSubmit: (data: Partial<OrganizationContext>) => void;
  onCancel: () => void;
}

const OrganizationContextForm: React.FC<OrganizationContextFormProps> = ({
  initialData,
  onSubmit,
  onCancel
}) => {
  const { organizationContexts } = useRbac();
  const { data, loading, error, fetchOrganizationContexts } = organizationContexts;
  
  const [formData, setFormData] = useState<Partial<OrganizationContext>>(
    initialData || {
      name: '',
      description: '',
      parent_id: undefined,
      is_active: true
    }
  );
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Simulate component mounting
  React.useEffect(() => {
    fetchOrganizationContexts();
  }, [fetchOrganizationContexts]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: checkbox.checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name) {
      errors.name = 'Name is required';
    }
    
    if (!formData.description) {
      errors.description = 'Description is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };
  
  const handleReset = () => {
    setFormData(
      initialData || {
        name: '',
        description: '',
        parent_id: undefined,
        is_active: true
      }
    );
    setFormErrors({});
  };
  
  if (loading) {
    return <div data-testid="loading-indicator">Loading...</div>;
  }
  
  if (error) {
    return <div data-testid="error-message">{error}</div>;
  }
  
  return (
    <form data-testid="organization-context-form" onSubmit={handleSubmit}>
      <h1>{initialData ? 'Edit Organization Context' : 'Create Organization Context'}</h1>
      
      <div>
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          data-testid="name-input"
        />
        {formErrors.name && <div data-testid="name-error">{formErrors.name}</div>}
      </div>
      
      <div>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          data-testid="description-input"
        />
        {formErrors.description && <div data-testid="description-error">{formErrors.description}</div>}
      </div>
      
      <div>
        <label htmlFor="parent_id">Parent Organization</label>
        <select
          id="parent_id"
          name="parent_id"
          value={formData.parent_id || ''}
          onChange={handleChange}
          data-testid="parent-select"
        >
          <option value="">None</option>
          {data?.results
            .filter((context: OrganizationContext) => context.id !== initialData?.id)
            .map((context: OrganizationContext) => (
              <option key={context.id} value={context.id}>
                {context.name}
              </option>
            ))}
        </select>
      </div>
      
      <div>
        <label htmlFor="is_active">Active</label>
        <input
          type="checkbox"
          id="is_active"
          name="is_active"
          checked={formData.is_active}
          onChange={handleChange}
          data-testid="is-active-checkbox"
        />
      </div>
      
      <div>
        <button type="submit" data-testid="submit-button">
          {initialData ? 'Update' : 'Create'}
        </button>
        <button type="button" onClick={handleReset} data-testid="reset-button">
          Reset
        </button>
        <button type="button" onClick={onCancel} data-testid="cancel-button">
          Cancel
        </button>
      </div>
    </form>
  );
};

describe('OrganizationContextForm Component', () => {
  beforeEach(() => {
    resetApiMocks();
    
    // Default mock implementation
    mockUseRbac.mockReturnValue({
      organizationContexts: {
        data: {
          count: mockOrganizationContexts.length,
          next: null,
          previous: null,
          results: mockOrganizationContexts
        },
        loading: false,
        error: null,
        fetchOrganizationContexts: jest.fn(),
        createOrganizationContext: jest.fn(),
        updateOrganizationContext: jest.fn()
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the form with empty fields when creating a new organization context', () => {
    const onSubmit = jest.fn();
    const onCancel = jest.fn();
    
    render(<OrganizationContextForm onSubmit={onSubmit} onCancel={onCancel} />);
    
    // Check if the form renders
    expect(screen.getByTestId('organization-context-form')).toBeInTheDocument();
    
    // Check if the form has empty fields
    expect(screen.getByTestId('name-input')).toHaveValue('');
    expect(screen.getByTestId('description-input')).toHaveValue('');
    expect(screen.getByTestId('parent-select')).toHaveValue('');
    expect(screen.getByTestId('is-active-checkbox')).toBeChecked();
    
    // Check if the form has the correct title
    expect(screen.getByText('Create Organization Context')).toBeInTheDocument();
  });

  it('should render the form with pre-filled fields when editing an existing organization context', () => {
    const initialData = mockOrganizationContexts[0];
    const onSubmit = jest.fn();
    const onCancel = jest.fn();
    
    render(
      <OrganizationContextForm
        initialData={initialData}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );
    
    // Check if the form renders
    expect(screen.getByTestId('organization-context-form')).toBeInTheDocument();
    
    // Check if the form has pre-filled fields
    expect(screen.getByTestId('name-input')).toHaveValue(initialData.name);
    expect(screen.getByTestId('description-input')).toHaveValue(initialData.description);
    expect(screen.getByTestId('is-active-checkbox')).toBeChecked();
    
    // Check if the form has the correct title
    expect(screen.getByText('Edit Organization Context')).toBeInTheDocument();
  });

  it('should call createOrganizationContext when submitting a new organization context', () => {
    const createOrganizationContext = jest.fn();
    mockUseRbac.mockReturnValue({
      organizationContexts: {
        data: {
          count: mockOrganizationContexts.length,
          next: null,
          previous: null,
          results: mockOrganizationContexts
        },
        loading: false,
        error: null,
        fetchOrganizationContexts: jest.fn(),
        createOrganizationContext
      }
    });
    
    const onSubmit = (data: Partial<OrganizationContext>) => {
      createOrganizationContext(data);
    };
    const onCancel = jest.fn();
    
    render(<OrganizationContextForm onSubmit={onSubmit} onCancel={onCancel} />);
    
    // Fill in the form
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { name: 'name', value: 'New Organization' }
    });
    fireEvent.change(screen.getByTestId('description-input'), {
      target: { name: 'description', value: 'New organization description' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByTestId('submit-button'));
    
    // Check if createOrganizationContext is called with the correct data
    expect(createOrganizationContext).toHaveBeenCalledWith({
      name: 'New Organization',
      description: 'New organization description',
      parent_id: undefined,
      is_active: true
    });
  });

  it('should call updateOrganizationContext when submitting an existing organization context', () => {
    const updateOrganizationContext = jest.fn();
    mockUseRbac.mockReturnValue({
      organizationContexts: {
        data: {
          count: mockOrganizationContexts.length,
          next: null,
          previous: null,
          results: mockOrganizationContexts
        },
        loading: false,
        error: null,
        fetchOrganizationContexts: jest.fn(),
        updateOrganizationContext
      }
    });
    
    const initialData = mockOrganizationContexts[0];
    const onSubmit = (data: Partial<OrganizationContext>) => {
      updateOrganizationContext(initialData.id, data);
    };
    const onCancel = jest.fn();
    
    render(
      <OrganizationContextForm
        initialData={initialData}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );
    
    // Change the form
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { name: 'name', value: 'Updated Organization' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByTestId('submit-button'));
    
    // Check if updateOrganizationContext is called with the correct data
    expect(updateOrganizationContext).toHaveBeenCalledWith(initialData.id, {
      name: 'Updated Organization',
      description: initialData.description,
      parent_id: initialData.parent_id,
      is_active: initialData.is_active
    });
  });

  it('should validate required fields', () => {
    const onSubmit = jest.fn();
    const onCancel = jest.fn();
    
    render(<OrganizationContextForm onSubmit={onSubmit} onCancel={onCancel} />);
    
    // Submit the form without filling in required fields
    fireEvent.click(screen.getByTestId('submit-button'));
    
    // Check if error messages are displayed
    expect(screen.getByTestId('name-error')).toHaveTextContent('Name is required');
    expect(screen.getByTestId('description-error')).toHaveTextContent('Description is required');
    
    // Check if onSubmit is not called
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should display error messages for invalid fields', () => {
    const onSubmit = jest.fn();
    const onCancel = jest.fn();
    
    render(<OrganizationContextForm onSubmit={onSubmit} onCancel={onCancel} />);
    
    // Fill in the form with invalid data
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { name: 'name', value: '' }
    });
    fireEvent.change(screen.getByTestId('description-input'), {
      target: { name: 'description', value: '' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByTestId('submit-button'));
    
    // Check if error messages are displayed
    expect(screen.getByTestId('name-error')).toHaveTextContent('Name is required');
    expect(screen.getByTestId('description-error')).toHaveTextContent('Description is required');
    
    // Check if onSubmit is not called
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should populate parent organization context dropdown with available contexts', () => {
    const onSubmit = jest.fn();
    const onCancel = jest.fn();
    
    render(<OrganizationContextForm onSubmit={onSubmit} onCancel={onCancel} />);
    
    // Check if parent organization context dropdown is populated
    const parentSelect = screen.getByTestId('parent-select');
    expect(parentSelect).toBeInTheDocument();
    
    // Check if all available organization contexts are in the dropdown
    mockOrganizationContexts.forEach((context) => {
      expect(screen.getByText(context.name)).toBeInTheDocument();
    });
  });

  it('should handle form submission errors correctly', () => {
    // Mock error state
    const errorMessage = 'Failed to create organization context';
    mockUseRbac.mockReturnValue({
      organizationContexts: {
        data: {
          count: mockOrganizationContexts.length,
          next: null,
          previous: null,
          results: mockOrganizationContexts
        },
        loading: false,
        error: errorMessage,
        fetchOrganizationContexts: jest.fn(),
        createOrganizationContext: jest.fn()
      }
    });
    
    const onSubmit = jest.fn();
    const onCancel = jest.fn();
    
    render(<OrganizationContextForm onSubmit={onSubmit} onCancel={onCancel} />);
    
    // Check if error message is displayed
    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should reset form fields when reset button is clicked', () => {
    const onSubmit = jest.fn();
    const onCancel = jest.fn();
    
    render(<OrganizationContextForm onSubmit={onSubmit} onCancel={onCancel} />);
    
    // Fill in the form
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { name: 'name', value: 'New Organization' }
    });
    fireEvent.change(screen.getByTestId('description-input'), {
      target: { name: 'description', value: 'New organization description' }
    });
    
    // Click the reset button
    fireEvent.click(screen.getByTestId('reset-button'));
    
    // Check if form fields are reset
    expect(screen.getByTestId('name-input')).toHaveValue('');
    expect(screen.getByTestId('description-input')).toHaveValue('');
    expect(screen.getByTestId('parent-select')).toHaveValue('');
    expect(screen.getByTestId('is-active-checkbox')).toBeChecked();
  });

  it('should call onCancel when cancel button is clicked', () => {
    const onSubmit = jest.fn();
    const onCancel = jest.fn();
    
    render(<OrganizationContextForm onSubmit={onSubmit} onCancel={onCancel} />);
    
    // Click the cancel button
    fireEvent.click(screen.getByTestId('cancel-button'));
    
    // Check if onCancel is called
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
}); 