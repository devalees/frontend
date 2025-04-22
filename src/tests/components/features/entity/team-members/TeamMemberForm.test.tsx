/**
 * TeamMemberForm Component Tests
 * 
 * This file contains tests for the TeamMemberForm component.
 * It tests the component's rendering, form validation, and submission.
 */

import { jest } from '@jest/globals';
import { renderWithProviders, componentTestHarness, propsValidation } from '@/tests/utils/componentTestUtils';
import { createMockResponse } from '@/tests/utils/mockApi';
import { TeamMember } from '@/types/entity';
import { useEntityStore } from '@/store/slices/entitySlice';

// Mock the entity store
jest.mock('@/store/slices/entitySlice', () => ({
  useEntityStore: jest.fn()
}));

// Import the component
import { TeamMemberForm } from '@/components/features/entity/team-members/TeamMemberForm';

describe('TeamMemberForm Component', () => {
  // Mock data
  const mockTeamMember: TeamMember = {
    id: '1',
    user_id: 'user1',
    team_id: 'team1',
    role: 'Developer',
    is_leader: true,
    join_date: '2023-01-01',
    skills: ['JavaScript', 'React', 'TypeScript'],
    availability: 100,
    performance_rating: 4.5,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    is_active: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form correctly', () => {
    // Mock the store
    (useEntityStore as unknown as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      createTeamMember: jest.fn(),
      updateTeamMember: jest.fn()
    });

    const { getByTestId, getByLabelText } = renderWithProviders(<TeamMemberForm />);
    
    // Check if form elements are rendered
    expect(getByTestId('team-member-form')).toBeInTheDocument();
    expect(getByLabelText('User ID')).toBeInTheDocument();
    expect(getByLabelText('Team ID')).toBeInTheDocument();
    expect(getByLabelText('Role')).toBeInTheDocument();
    expect(getByLabelText('Join Date')).toBeInTheDocument();
  });

  it('renders with initial data when editing', () => {
    // Mock the store
    (useEntityStore as unknown as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      createTeamMember: jest.fn(),
      updateTeamMember: jest.fn()
    });

    const { getByDisplayValue } = renderWithProviders(
      <TeamMemberForm initialData={mockTeamMember} />
    );
    
    // Check if form is pre-filled with initial data
    expect(getByDisplayValue('Developer')).toBeInTheDocument();
    expect(getByDisplayValue('user1')).toBeInTheDocument();
    expect(getByDisplayValue('team1')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    // Mock the store
    (useEntityStore as unknown as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      createTeamMember: jest.fn(),
      updateTeamMember: jest.fn()
    });

    const { getByTestId, getByText } = renderWithProviders(<TeamMemberForm />);
    
    // Submit the form without filling required fields
    const submitButton = getByTestId('submit-button');
    submitButton.click();
    
    // Check if validation errors are displayed
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(getByText('User ID is required')).toBeInTheDocument();
    expect(getByText('Team ID is required')).toBeInTheDocument();
    expect(getByText('Role is required')).toBeInTheDocument();
  });

  it('submits the form with valid data for creation', async () => {
    // Mock the store with create function
    const mockCreateTeamMember = jest.fn().mockResolvedValue(mockTeamMember);
    (useEntityStore as unknown as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      createTeamMember: mockCreateTeamMember,
      updateTeamMember: jest.fn()
    });

    const { getByTestId, getByLabelText } = renderWithProviders(<TeamMemberForm />);
    
    // Fill in the form
    const userIdInput = getByLabelText('User ID');
    const teamIdInput = getByLabelText('Team ID');
    const roleInput = getByLabelText('Role');
    const joinDateInput = getByLabelText('Join Date');
    
    userIdInput.value = 'user1';
    teamIdInput.value = 'team1';
    roleInput.value = 'Developer';
    joinDateInput.value = '2023-01-01';
    
    // Submit the form
    const submitButton = getByTestId('submit-button');
    submitButton.click();
    
    // Check if create function was called with the correct data
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(mockCreateTeamMember).toHaveBeenCalledWith({
      user_id: 'user1',
      team_id: 'team1',
      role: 'Developer',
      join_date: '2023-01-01',
      is_leader: false
    });
  });

  it('submits the form with valid data for update', async () => {
    // Mock the store with update function
    const mockUpdateTeamMember = jest.fn().mockResolvedValue(mockTeamMember);
    (useEntityStore as unknown as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      createTeamMember: jest.fn(),
      updateTeamMember: mockUpdateTeamMember
    });

    const { getByTestId, getByLabelText } = renderWithProviders(
      <TeamMemberForm initialData={mockTeamMember} />
    );
    
    // Update the form
    const roleInput = getByLabelText('Role');
    roleInput.value = 'Senior Developer';
    
    // Submit the form
    const submitButton = getByTestId('submit-button');
    submitButton.click();
    
    // Check if update function was called with the correct data
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(mockUpdateTeamMember).toHaveBeenCalledWith('1', {
      role: 'Senior Developer'
    });
  });

  it('displays error message when submission fails', async () => {
    // Mock the store with error
    (useEntityStore as unknown as jest.Mock).mockReturnValue({
      loading: false,
      error: 'Failed to create team member',
      createTeamMember: jest.fn().mockRejectedValue(new Error('Failed to create team member')),
      updateTeamMember: jest.fn()
    });

    const { getByTestId, getByLabelText, getByText } = renderWithProviders(<TeamMemberForm />);
    
    // Fill in the form
    const userIdInput = getByLabelText('User ID');
    const teamIdInput = getByLabelText('Team ID');
    const roleInput = getByLabelText('Role');
    const joinDateInput = getByLabelText('Join Date');
    
    userIdInput.value = 'user1';
    teamIdInput.value = 'team1';
    roleInput.value = 'Developer';
    joinDateInput.value = '2023-01-01';
    
    // Submit the form
    const submitButton = getByTestId('submit-button');
    submitButton.click();
    
    // Check if error message is displayed
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(getByText('Failed to create team member')).toBeInTheDocument();
  });

  it('validates prop types correctly', () => {
    // Define the component props
    const requiredProps: Array<keyof React.ComponentProps<typeof TeamMemberForm>> = [];
    const optionalProps: Array<keyof React.ComponentProps<typeof TeamMemberForm>> = ['initialData', 'onSuccess', 'onCancel'];
    
    // Create base props
    const baseProps = {
      initialData: mockTeamMember,
      onSuccess: jest.fn(),
      onCancel: jest.fn()
    };
    
    // Validate required props
    propsValidation.validateRequiredProps(TeamMemberForm, requiredProps, baseProps);
    
    // Validate optional props
    propsValidation.validateOptionalProps(TeamMemberForm, optionalProps, baseProps);
  });
}); 