import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TeamForm } from '@/components/features/entity/teams/TeamForm';
import { useEntityStore } from '@/store/slices/entitySlice';
import { useTeam } from '@/hooks/useEntity';

// Mock the hooks
jest.mock('@/store/slices/entitySlice', () => ({
  useEntityStore: jest.fn(),
}));

jest.mock('@/hooks/useEntity', () => ({
  useTeam: jest.fn(),
}));

describe('TeamForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();
  
  const mockDepartments = [
    { id: '1', name: 'Engineering' },
    { id: '2', name: 'Marketing' },
    { id: '3', name: 'Sales' },
  ];
  
  const mockTeam = {
    id: '1',
    name: 'Test Team',
    description: 'Test Description',
    department_id: '1',
    leader_id: 'user1',
    project_id: 'project1',
    size: 5,
    skills: ['React', 'TypeScript'],
    is_active: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the store
    (useEntityStore as jest.Mock).mockReturnValue({
      departments: mockDepartments,
    });
    
    // Mock the team hook
    (useTeam as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
    });
  });

  it('renders the form with empty fields when creating a new team', () => {
    render(
      <TeamForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );
    
    // Check if form elements are rendered
    expect(screen.getByLabelText(/team name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/department/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/team size/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/team leader id/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/project id/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/skills/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/active/i)).toBeInTheDocument();
    
    // Check if buttons are rendered
    expect(screen.getByText(/create team/i)).toBeInTheDocument();
    expect(screen.getByText(/cancel/i)).toBeInTheDocument();
  });

  it('renders the form with pre-filled values when editing an existing team', () => {
    render(
      <TeamForm 
        team={mockTeam}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );
    
    // Check if form elements are pre-filled
    expect(screen.getByLabelText(/team name/i)).toHaveValue(mockTeam.name);
    expect(screen.getByLabelText(/description/i)).toHaveValue(mockTeam.description);
    expect(screen.getByLabelText(/department/i)).toHaveValue(mockTeam.department_id);
    expect(screen.getByLabelText(/team size/i)).toHaveValue(mockTeam.size.toString());
    expect(screen.getByLabelText(/team leader id/i)).toHaveValue(mockTeam.leader_id);
    expect(screen.getByLabelText(/project id/i)).toHaveValue(mockTeam.project_id);
    expect(screen.getByLabelText(/skills/i)).toHaveValue(mockTeam.skills.join(', '));
    expect(screen.getByLabelText(/active/i)).toBeChecked();
    
    // Check if submit button text is updated
    expect(screen.getByText(/update team/i)).toBeInTheDocument();
  });

  it('shows loading state when submitting the form', async () => {
    (useTeam as jest.Mock).mockReturnValue({
      loading: true,
      error: null,
    });
    
    render(
      <TeamForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );
    
    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/team name/i), { target: { value: 'New Team' } });
    fireEvent.change(screen.getByLabelText(/department/i), { target: { value: '1' } });
    
    // Submit the form
    fireEvent.click(screen.getByTestId("submit-button"));
    
    // Check if loading state is shown
    expect(screen.getByText(/saving/i)).toBeInTheDocument();
  });

  it('shows error message when there is an error', () => {
    const errorMessage = 'Failed to save team';
    (useTeam as jest.Mock).mockReturnValue({
      loading: false,
      error: errorMessage,
    });
    
    render(
      <TeamForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );
    
    // Check if error message is displayed
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('validates required fields before submission', async () => {
    render(
      <TeamForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );
    
    // Submit the form without filling required fields
    fireEvent.click(screen.getByTestId("submit-button"));
    
    // Check if validation errors are shown
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/department is required/i)).toBeInTheDocument();
    });
    
    // Check if onSubmit was not called
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with form data when form is valid', async () => {
    render(
      <TeamForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );
    
    // Fill in form fields
    fireEvent.change(screen.getByLabelText(/team name/i), { target: { value: 'New Team' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'New Description' } });
    fireEvent.change(screen.getByLabelText(/department/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/team size/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/team leader id/i), { target: { value: 'user2' } });
    fireEvent.change(screen.getByLabelText(/project id/i), { target: { value: 'project2' } });
    fireEvent.change(screen.getByLabelText(/skills/i), { target: { value: 'JavaScript, CSS' } });
    fireEvent.click(screen.getByLabelText(/active/i));
    
    // Submit the form
    fireEvent.click(screen.getByTestId("submit-button"));
    
    // Check if onSubmit was called with correct data
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'New Team',
        description: 'New Description',
        department_id: '1',
        size: 10,
        leader_id: 'user2',
        project_id: 'project2',
        skills: ['JavaScript', 'CSS'],
        is_active: true,
      });
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <TeamForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );
    
    // Click cancel button
    fireEvent.click(screen.getByText(/cancel/i));
    
    // Check if onCancel was called
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('validates team size is a positive number', async () => {
    render(
      <TeamForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );
    
    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/team name/i), { target: { value: 'New Team' } });
    fireEvent.change(screen.getByLabelText(/department/i), { target: { value: '1' } });
    
    // Enter invalid team size
    fireEvent.change(screen.getByLabelText(/team size/i), { target: { value: '0' } });
    
    // Submit the form
    fireEvent.click(screen.getByTestId("submit-button"));
    
    // Check if validation error is shown
    await waitFor(() => {
      expect(screen.getByText(/size must be a positive number/i)).toBeInTheDocument();
    });
    
    // Check if onSubmit was not called
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
}); 