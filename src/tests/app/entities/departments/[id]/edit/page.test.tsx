import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import DepartmentEditPage from '@/app/(dashboard)/entities/departments/[id]/edit/page';
import { useEntityStore } from '@/store/slices/entitySlice';
import { useToast } from '@/components/ui/use-toast';
import { Department } from '@/types/entity';

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the entity store
jest.mock('@/store/slices/entitySlice', () => ({
  useEntityStore: jest.fn(),
}));

// Mock the toast component
jest.mock('@/components/ui/use-toast', () => ({
  useToast: jest.fn(),
}));

// Mock the DepartmentForm component
jest.mock('@/components/features/entity/departments/DepartmentForm', () => ({
  DepartmentForm: ({ 
    department, 
    onSubmit, 
    onCancel 
  }: { 
    department: Department; 
    onSubmit: (department: Department) => void; 
    onCancel: () => void; 
  }) => (
    <div data-testid="department-form">
      <div>Editing Department: {department.name}</div>
      <button 
        data-testid="submit-button" 
        onClick={() => onSubmit(department)}
      >
        Save
      </button>
      <button 
        data-testid="cancel-button" 
        onClick={onCancel}
      >
        Cancel
      </button>
    </div>
  ),
}));

describe('DepartmentEditPage', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockGetDepartment = jest.fn();
  const mockUpdateDepartment = jest.fn();
  const mockToast = {
    toast: jest.fn(),
  };

  const mockDepartment: Department = {
    id: '1',
    name: 'Test Department',
    description: 'Test Description',
    organization_id: 'org-1',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    is_active: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useEntityStore as unknown as jest.Mock).mockReturnValue({
      getDepartment: mockGetDepartment,
      updateDepartment: mockUpdateDepartment,
    });
    (useToast as jest.Mock).mockReturnValue(mockToast);
  });

  it('renders loading state initially', () => {
    mockGetDepartment.mockImplementation(() => new Promise(() => {}));
    
    render(<DepartmentEditPage params={{ id: '1' }} />);
    
    expect(screen.getByRole('heading', { name: 'Edit Department' })).toBeInTheDocument();
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('renders error state when department fetch fails', async () => {
    mockGetDepartment.mockRejectedValue(new Error('Failed to fetch'));
    
    render(<DepartmentEditPage params={{ id: '1' }} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('error')).toBeInTheDocument();
      expect(mockToast.toast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to load department data. Please try again.',
        variant: 'destructive',
      });
    });
  });

  it('renders the department form when data is loaded', async () => {
    mockGetDepartment.mockResolvedValue(mockDepartment);
    
    render(<DepartmentEditPage params={{ id: '1' }} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('department-form')).toBeInTheDocument();
      expect(screen.getByText('Editing Department: Test Department')).toBeInTheDocument();
    });
  });

  it('navigates back to detail page when cancel button is clicked', async () => {
    mockGetDepartment.mockResolvedValue(mockDepartment);
    
    render(<DepartmentEditPage params={{ id: '1' }} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('department-form')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByTestId('cancel-button'));
    
    expect(mockRouter.push).toHaveBeenCalledWith('/entities/departments/1');
  });

  it('updates department and navigates back to detail page when form is submitted', async () => {
    mockGetDepartment.mockResolvedValue(mockDepartment);
    mockUpdateDepartment.mockResolvedValue(mockDepartment);
    
    render(<DepartmentEditPage params={{ id: '1' }} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('department-form')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByTestId('submit-button'));
    
    await waitFor(() => {
      expect(mockUpdateDepartment).toHaveBeenCalledWith('1', mockDepartment);
      expect(mockToast.toast).toHaveBeenCalledWith({
        title: 'Department updated',
        description: 'The department has been successfully updated.',
      });
      expect(mockRouter.push).toHaveBeenCalledWith('/entities/departments/1');
    });
  });

  it('shows error toast when update fails', async () => {
    mockGetDepartment.mockResolvedValue(mockDepartment);
    mockUpdateDepartment.mockRejectedValue(new Error('Update failed'));
    
    render(<DepartmentEditPage params={{ id: '1' }} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('department-form')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByTestId('submit-button'));
    
    await waitFor(() => {
      expect(mockToast.toast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to update department. Please try again.',
        variant: 'destructive',
      });
    });
  });
}); 