import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { useEntityStore } from '@/store/slices/entitySlice';
import DepartmentsPage from '@/app/(dashboard)/entities/departments/page';
import { mockDepartment } from '@/tests/utils/mockData';
import { EntityState } from '@/store/slices/entitySlice';

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the toast hook
jest.mock('@/components/ui/use-toast', () => ({
  useToast: jest.fn(),
}));

// Mock the entity store
jest.mock('@/store/slices/entitySlice', () => ({
  useEntityStore: jest.fn(),
}));

describe('DepartmentsPage', () => {
  // Setup mocks
  const mockRouter = {
    push: jest.fn(),
  };
  
  const mockToast = {
    toast: jest.fn(),
  };
  
  const mockDepartments = [
    { ...mockDepartment, id: '1', name: 'Engineering' },
    { ...mockDepartment, id: '2', name: 'Marketing' },
  ];
  
  const mockEntityStore = {
    departments: mockDepartments,
    loading: false,
    error: null,
    fetchDepartments: jest.fn(),
    deleteDepartment: jest.fn(),
  };
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup mock implementations
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useToast as jest.Mock).mockReturnValue(mockToast);
    (useEntityStore as unknown as jest.Mock).mockReturnValue(mockEntityStore);
    
    // Mock window.confirm
    window.confirm = jest.fn().mockReturnValue(true);
  });
  
  it('renders the departments page with title and create button', () => {
    render(<DepartmentsPage />);
    
    // Check for page title
    expect(screen.getByRole('heading', { name: 'Departments' })).toBeInTheDocument();
    
    // Check for create button
    expect(screen.getByTestId('create-department-button')).toBeInTheDocument();
    expect(screen.getByText('Create Department')).toBeInTheDocument();
  });
  
  it('renders breadcrumbs with correct items', () => {
    render(<DepartmentsPage />);
    
    // Check for breadcrumb items
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Entities')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toHaveTextContent('Departments');
  });
  
  it('navigates to create page when create button is clicked', () => {
    render(<DepartmentsPage />);
    
    // Click create button
    fireEvent.click(screen.getByTestId('create-department-button'));
    
    // Check if router.push was called with correct path
    expect(mockRouter.push).toHaveBeenCalledWith('/entities/departments/new');
  });
  
  it('navigates to detail page when view button is clicked', () => {
    render(<DepartmentsPage />);
    
    // Find and click view button for first department
    const viewButtons = screen.getAllByTestId('view-details-button');
    fireEvent.click(viewButtons[0]);
    
    // Check if router.push was called with correct path
    expect(mockRouter.push).toHaveBeenCalledWith('/entities/departments/1');
  });
  
  it('navigates to edit page when edit button is clicked', () => {
    render(<DepartmentsPage />);
    
    // Find and click edit button for first department
    const editButtons = screen.getAllByTestId('edit-button');
    fireEvent.click(editButtons[0]);
    
    // Check if router.push was called with correct path
    expect(mockRouter.push).toHaveBeenCalledWith('/entities/departments/1/edit');
  });
  
  it('shows confirmation dialog and handles delete when delete button is clicked', async () => {
    // Mock successful delete
    mockEntityStore.deleteDepartment.mockResolvedValue(true);
    
    render(<DepartmentsPage />);
    
    // Find and click delete button for first department
    const deleteButtons = screen.getAllByTestId('delete-button');
    fireEvent.click(deleteButtons[0]);
    
    // Check if confirmation dialog was shown
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete Engineering?');
    
    // Wait for delete operation to complete
    await waitFor(() => {
      expect(mockEntityStore.deleteDepartment).toHaveBeenCalledWith('1');
    }, { timeout: 3000 });
    
    // Check if success toast was shown
    expect(mockToast.toast).toHaveBeenCalledWith({
      title: 'Success',
      description: 'Department deleted successfully',
      variant: 'success',
    });
  });
  
  it('shows error toast when delete operation fails', async () => {
    // Mock failed delete
    mockEntityStore.deleteDepartment.mockRejectedValue(new Error('Delete failed'));
    
    render(<DepartmentsPage />);
    
    // Find and click delete button for first department
    const deleteButtons = screen.getAllByTestId('delete-button');
    fireEvent.click(deleteButtons[0]);
    
    // Wait for delete operation to complete
    await waitFor(() => {
      expect(mockEntityStore.deleteDepartment).toHaveBeenCalledWith('1');
    }, { timeout: 3000 });
    
    // Check if error toast was shown
    expect(mockToast.toast).toHaveBeenCalledWith({
      title: 'Error',
      description: 'Failed to delete department',
      variant: 'destructive',
    });
  });
  
  it('does not delete when user cancels confirmation dialog', () => {
    // Mock user cancels confirmation
    window.confirm = jest.fn().mockReturnValue(false);
    
    render(<DepartmentsPage />);
    
    // Find and click delete button for first department
    const deleteButtons = screen.getAllByTestId('delete-button');
    fireEvent.click(deleteButtons[0]);
    
    // Check if confirmation dialog was shown
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete Engineering?');
    
    // Check that delete was not called
    expect(mockEntityStore.deleteDepartment).not.toHaveBeenCalled();
  });
  
  it('shows loading state when departments are loading', () => {
    // Mock loading state
    (useEntityStore as unknown as jest.Mock).mockReturnValue({
      ...mockEntityStore,
      loading: true,
    });
    
    render(<DepartmentsPage />);
    
    // Check for loading indicator
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });
  
  it('shows error state when departments fetch fails', () => {
    // Mock error state
    (useEntityStore as unknown as jest.Mock).mockReturnValue({
      ...mockEntityStore,
      error: 'Failed to load departments',
    });
    
    render(<DepartmentsPage />);
    
    // Check for error message
    expect(screen.getByTestId('error')).toBeInTheDocument();
    expect(screen.getByText('Failed to load departments')).toBeInTheDocument();
  });
}); 