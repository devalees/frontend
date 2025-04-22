import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import DepartmentDetailPage from '@/app/(dashboard)/entities/departments/[id]/page';
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

// Mock the DepartmentDetail component
jest.mock('@/components/features/entity/departments/DepartmentDetail', () => ({
  DepartmentDetail: ({ 
    id, 
    onEdit, 
    onDelete 
  }: { 
    id: string; 
    onEdit: () => void; 
    onDelete: () => void; 
  }) => (
    <div data-testid="department-detail">
      <div>Department ID: {id}</div>
      <button 
        data-testid="edit-button" 
        onClick={onEdit}
      >
        Edit
      </button>
      <button 
        data-testid="delete-button" 
        onClick={onDelete}
      >
        Delete
      </button>
    </div>
  ),
}));

describe('DepartmentDetailPage', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockDeleteDepartment = jest.fn();
  const mockToast = {
    toast: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useEntityStore as unknown as jest.Mock).mockReturnValue({
      deleteDepartment: mockDeleteDepartment,
    });
    (useToast as jest.Mock).mockReturnValue(mockToast);
    
    // Mock window.confirm
    window.confirm = jest.fn(() => true);
  });

  it('renders the department detail page with title and breadcrumbs', () => {
    render(<DepartmentDetailPage params={{ id: '1' }} />);
    
    expect(screen.getByRole('heading', { name: 'Department Details' })).toBeInTheDocument();
    expect(screen.getByText('View and manage department details, teams, and team members')).toBeInTheDocument();
    expect(screen.getByTestId('department-detail')).toBeInTheDocument();
  });

  it('navigates to edit page when edit button is clicked', () => {
    render(<DepartmentDetailPage params={{ id: '1' }} />);
    
    fireEvent.click(screen.getByTestId('edit-button'));
    
    expect(mockRouter.push).toHaveBeenCalledWith('/entities/departments/1/edit');
  });

  it('deletes department and navigates back to list when delete button is clicked and confirmed', async () => {
    render(<DepartmentDetailPage params={{ id: '1' }} />);
    
    fireEvent.click(screen.getByTestId('delete-button'));
    
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this department?');
    
    await waitFor(() => {
      expect(mockDeleteDepartment).toHaveBeenCalledWith('1');
      expect(mockToast.toast).toHaveBeenCalledWith({
        title: 'Department deleted',
        description: 'The department has been successfully deleted.',
      });
      expect(mockRouter.push).toHaveBeenCalledWith('/entities/departments');
    });
  });

  it('shows error toast when department deletion fails', async () => {
    mockDeleteDepartment.mockRejectedValueOnce(new Error('Delete failed'));
    
    render(<DepartmentDetailPage params={{ id: '1' }} />);
    
    fireEvent.click(screen.getByTestId('delete-button'));
    
    await waitFor(() => {
      expect(mockToast.toast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to delete department. Please try again.',
        variant: 'destructive',
      });
    });
  });

  it('does not delete department when delete is not confirmed', () => {
    window.confirm = jest.fn(() => false);
    
    render(<DepartmentDetailPage params={{ id: '1' }} />);
    
    fireEvent.click(screen.getByTestId('delete-button'));
    
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this department?');
    expect(mockDeleteDepartment).not.toHaveBeenCalled();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
}); 