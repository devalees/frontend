/**
 * ResourceAccessForm Component Tests
 * 
 * Tests for the ResourceAccessForm component which provides a form for granting/revoking resource access.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { componentTestHarness } from '../../../../tests/utils/componentTestUtils';
import { mockApiMethod, resetApiMocks } from '../../../../tests/utils/mockApi';
import { ResourceAccess, Resource, Role, Permission } from '../../../../types/rbac';
import { useRbac } from '../../../../hooks/useRbac';
import { ResourceAccessForm } from '../../../../components/features/rbac/ResourceAccessForm';

// Mock the useRbac hook
jest.mock('../../../../hooks/useRbac');

// Mock data
const mockResource: Resource = {
  id: '1',
  name: 'Document',
  description: 'Document resource',
  type: 'document',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

const mockRole: Role = {
  id: '1',
  name: 'Admin',
  description: 'Administrator role',
  is_active: true,
  permissions: [],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

const mockPermission: Permission = {
  id: '1',
  name: 'read',
  description: 'Read permission',
  resource: 'document',
  action: 'read',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

const mockResourceAccess: ResourceAccess = {
  id: '1',
  resource_id: '1',
  role_id: '1',
  permission_id: '1',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

describe('ResourceAccessForm Component', () => {
  beforeEach(() => {
    resetApiMocks();
    
    // Default mock implementation with correct data structure
    (useRbac as jest.Mock).mockReturnValue({
      resources: { data: [mockResource], loading: false, error: null },
      roles: { data: [mockRole], loading: false, error: null },
      permissions: { data: [mockPermission], loading: false, error: null },
      resourceAccesses: { data: [], loading: false, error: null },
      createResourceAccess: jest.fn().mockResolvedValue(mockResourceAccess),
      updateResourceAccess: jest.fn().mockResolvedValue(mockResourceAccess),
      deleteResourceAccess: jest.fn(),
      activateResourceAccess: jest.fn(),
      deactivateResourceAccess: jest.fn()
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the form for creating a new resource access', () => {
    render(<ResourceAccessForm onSubmit={async () => Promise.resolve()} />);
    
    expect(screen.getByLabelText('Resource')).toBeInTheDocument();
    expect(screen.getByLabelText('Role')).toBeInTheDocument();
    expect(screen.getByLabelText('Permission')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create resource access/i })).toBeInTheDocument();
  });

  it('should render the form for editing an existing resource access', () => {
    render(
      <ResourceAccessForm
        initialData={mockResourceAccess}
        onSubmit={async () => Promise.resolve()}
      />
    );
    
    expect(screen.getByLabelText('Resource')).toBeInTheDocument();
    expect(screen.getByLabelText('Role')).toBeInTheDocument();
    expect(screen.getByLabelText('Permission')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update resource access/i })).toBeInTheDocument();
  });

  it('should call createResourceAccess when submitting a new resource access', async () => {
    const onSubmit = jest.fn().mockImplementation(async () => Promise.resolve());
    const { container } = render(<ResourceAccessForm onSubmit={onSubmit} />);
    
    // Select options by clicking on the option elements
    const resourceSelect = screen.getByLabelText('Resource');
    fireEvent.click(resourceSelect);
    
    // Find and click the option
    const resourceOption = screen.getByText('Document');
    fireEvent.click(resourceOption);

    const roleSelect = screen.getByLabelText('Role');
    fireEvent.click(roleSelect);
    
    // Find and click the option
    const roleOption = screen.getByText('Admin');
    fireEvent.click(roleOption);

    const permissionSelect = screen.getByLabelText('Permission');
    fireEvent.click(permissionSelect);
    
    // Find and click the option
    const permissionOption = screen.getByText('read');
    fireEvent.click(permissionOption);

    // Submit form
    const form = container.querySelector('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        resource_id: '1',
        role_id: '1',
        permission_id: '1',
      });
    });
  });

  it('should call updateResourceAccess when submitting an edited resource access', async () => {
    const onSubmit = jest.fn().mockImplementation(async () => Promise.resolve());
    const { container } = render(
      <ResourceAccessForm
        initialData={mockResourceAccess}
        onSubmit={onSubmit}
      />
    );
    
    // Change permission
    const permissionSelect = screen.getByLabelText('Permission');
    fireEvent.click(permissionSelect);
    
    // Find and click the option
    const permissionOption = screen.getByText('read');
    fireEvent.click(permissionOption);

    // Submit form
    const form = container.querySelector('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        resource_id: '1',
        role_id: '1',
        permission_id: '1',
      });
    });
  });

  it('should validate required fields', async () => {
    const onSubmit = jest.fn().mockImplementation(async () => Promise.resolve());
    const { container } = render(<ResourceAccessForm onSubmit={onSubmit} />);
    
    // Submit form without filling required fields
    const form = container.querySelector('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(screen.getByText('Resource is required')).toBeInTheDocument();
      expect(screen.getByText('Role is required')).toBeInTheDocument();
      expect(screen.getByText('Permission is required')).toBeInTheDocument();
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should display validation errors', async () => {
    const onSubmit = jest.fn().mockImplementation(async () => Promise.resolve());
    const { container } = render(<ResourceAccessForm onSubmit={onSubmit} />);
    
    // Submit form without filling required fields to trigger validation
    const form = container.querySelector('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(screen.getByText('Resource is required')).toBeInTheDocument();
      expect(screen.getByText('Role is required')).toBeInTheDocument();
      expect(screen.getByText('Permission is required')).toBeInTheDocument();
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should handle API errors', async () => {
    const error = new Error('API Error');
    const onSubmit = jest.fn().mockRejectedValue(error);
    const { container } = render(<ResourceAccessForm onSubmit={onSubmit} />);

    // Fill in form data
    const resourceSelect = screen.getByLabelText('Resource');
    fireEvent.click(resourceSelect);
    const resourceOption = screen.getByText('Document');
    fireEvent.click(resourceOption);

    const roleSelect = screen.getByLabelText('Role');
    fireEvent.click(roleSelect);
    const roleOption = screen.getByText('Admin');
    fireEvent.click(roleOption);

    const permissionSelect = screen.getByLabelText('Permission');
    fireEvent.click(permissionSelect);
    const permissionOption = screen.getByText('read');
    fireEvent.click(permissionOption);

    // Submit form
    const form = container.querySelector('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  it('should display loading state when submitting', async () => {
    const onSubmit = jest.fn().mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return Promise.resolve();
    });
    
    const { container } = render(<ResourceAccessForm onSubmit={onSubmit} />);

    // Fill in form data
    const resourceSelect = screen.getByLabelText('Resource');
    fireEvent.click(resourceSelect);
    const resourceOption = screen.getByText('Document');
    fireEvent.click(resourceOption);

    const roleSelect = screen.getByLabelText('Role');
    fireEvent.click(roleSelect);
    const roleOption = screen.getByText('Admin');
    fireEvent.click(roleOption);

    const permissionSelect = screen.getByLabelText('Permission');
    fireEvent.click(permissionSelect);
    const permissionOption = screen.getByText('read');
    fireEvent.click(permissionOption);

    // Submit form
    const form = container.querySelector('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /create resource access/i });
      expect(submitButton).toBeDisabled();
    });
  });
});