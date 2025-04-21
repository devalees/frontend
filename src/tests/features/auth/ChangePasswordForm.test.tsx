/**
 * Test: Change Password Form Component
 * 
 * Tests the ChangePasswordForm component functionality:
 * - Form validation
 * - API integration
 * - Error handling
 * - Success confirmation
 */

import { ChangePasswordRequest } from '@/lib/api/auth';
import { render, screen, fireEvent, waitFor } from '@/tests/utils';

// Import our component
import ChangePasswordForm from '@/components/features/auth/ChangePasswordForm';

describe('ChangePasswordForm', () => {
  // Setup mock for onChangePassword function
  const mockOnChangePassword = jest.fn().mockImplementation(
    (data: ChangePasswordRequest) => Promise.resolve()
  );
  
  // Setup mock for rejected API call
  const mockOnChangePasswordError = jest.fn().mockImplementation(
    () => Promise.reject(new Error('Invalid current password'))
  );
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders the form correctly', () => {
    render(<ChangePasswordForm onChangePassword={mockOnChangePassword} />);
    
    // Check for form title
    expect(screen.getByRole('heading', { name: 'Change Password' })).toBeInTheDocument();
    
    // Check for input fields
    expect(screen.getByLabelText(/Current Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText('New Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument();
    
    // Check for submit button
    expect(screen.getByTestId('change-password-submit')).toBeInTheDocument();
  });
  
  it('displays validation errors when form is submitted with empty fields', async () => {
    render(<ChangePasswordForm onChangePassword={mockOnChangePassword} />);
    
    // Submit the form without filling any fields
    const submitButton = screen.getByTestId('change-password-submit');
    fireEvent.click(submitButton);
    
    // Check for validation error messages
    await waitFor(() => {
      expect(screen.getByText('Current password is required')).toBeInTheDocument();
      expect(screen.getByText('New password is required')).toBeInTheDocument();
      expect(screen.getByText('Please confirm your new password')).toBeInTheDocument();
    });
    
    // Verify the API function was not called
    expect(mockOnChangePassword).not.toHaveBeenCalled();
  });
  
  it('validates that new password is at least 8 characters', async () => {
    render(<ChangePasswordForm onChangePassword={mockOnChangePassword} />);
    
    // Fill fields but make new password too short
    fireEvent.change(screen.getByLabelText(/Current Password/i), { target: { value: 'currentpass' } });
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'short' } });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { value: 'short' } });
    
    // Submit the form
    const submitButton = screen.getByTestId('change-password-submit');
    fireEvent.click(submitButton);
    
    // Check for password length validation error
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    });
    
    // Verify the API function was not called
    expect(mockOnChangePassword).not.toHaveBeenCalled();
  });
  
  it('validates that passwords match', async () => {
    render(<ChangePasswordForm onChangePassword={mockOnChangePassword} />);
    
    // Fill fields but with mismatched passwords
    fireEvent.change(screen.getByLabelText(/Current Password/i), { target: { value: 'currentpass' } });
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'newpassword1' } });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { value: 'newpassword2' } });
    
    // Submit the form
    const submitButton = screen.getByTestId('change-password-submit');
    fireEvent.click(submitButton);
    
    // Check for password match validation error
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
    
    // Verify the API function was not called
    expect(mockOnChangePassword).not.toHaveBeenCalled();
  });
  
  it('validates that new password is different from current password', async () => {
    render(<ChangePasswordForm onChangePassword={mockOnChangePassword} />);
    
    // Fill fields with same current and new password
    const samePassword = 'samepassword123';
    fireEvent.change(screen.getByLabelText(/Current Password/i), { target: { value: samePassword } });
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: samePassword } });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { value: samePassword } });
    
    // Submit the form
    const submitButton = screen.getByTestId('change-password-submit');
    fireEvent.click(submitButton);
    
    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText('New password must be different from current password')).toBeInTheDocument();
    });
    
    // Verify the API function was not called
    expect(mockOnChangePassword).not.toHaveBeenCalled();
  });
  
  it('submits the form with valid data', async () => {
    render(<ChangePasswordForm onChangePassword={mockOnChangePassword} />);
    
    // Fill form with valid data
    fireEvent.change(screen.getByLabelText(/Current Password/i), { target: { value: 'currentpass' } });
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'newpassword123' } });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { value: 'newpassword123' } });
    
    // Submit the form
    const submitButton = screen.getByTestId('change-password-submit');
    fireEvent.click(submitButton);
    
    // Wait for form submission to complete
    await waitFor(() => {
      // Check that the API function was called with correct data
      expect(mockOnChangePassword).toHaveBeenCalledWith({
        current_password: 'currentpass',
        new_password: 'newpassword123',
        confirm_password: 'newpassword123'
      });
    });
    
    // Check for success message
    await waitFor(() => {
      expect(screen.getByText('Password changed successfully')).toBeInTheDocument();
    });
    
    // Check that form was reset
    await waitFor(() => {
      const currentPasswordInput = screen.getByLabelText(/Current Password/i) as HTMLInputElement;
      const newPasswordInput = screen.getByLabelText('New Password') as HTMLInputElement;
      const confirmPasswordInput = screen.getByLabelText('Confirm New Password') as HTMLInputElement;
      
      expect(currentPasswordInput.value).toBe('');
      expect(newPasswordInput.value).toBe('');
      expect(confirmPasswordInput.value).toBe('');
    });
  });
  
  it('handles API errors', async () => {
    render(<ChangePasswordForm onChangePassword={mockOnChangePasswordError} />);
    
    // Fill form with valid data
    fireEvent.change(screen.getByLabelText(/Current Password/i), { target: { value: 'wrongpassword' } });
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'newpassword123' } });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { value: 'newpassword123' } });
    
    // Submit the form
    const submitButton = screen.getByTestId('change-password-submit');
    fireEvent.click(submitButton);
    
    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText('Invalid current password')).toBeInTheDocument();
    });
    
    // Check that values are preserved after error
    const currentPasswordInput = screen.getByLabelText(/Current Password/i) as HTMLInputElement;
    const newPasswordInput = screen.getByLabelText('New Password') as HTMLInputElement;
    const confirmPasswordInput = screen.getByLabelText('Confirm New Password') as HTMLInputElement;
    
    expect(currentPasswordInput.value).toBe('wrongpassword');
    expect(newPasswordInput.value).toBe('newpassword123');
    expect(confirmPasswordInput.value).toBe('newpassword123');
  });
  
  it('clears validation errors when fields are edited', async () => {
    render(<ChangePasswordForm onChangePassword={mockOnChangePassword} />);
    
    // Submit the form without filling any fields to trigger errors
    const submitButton = screen.getByTestId('change-password-submit');
    fireEvent.click(submitButton);
    
    // Check that validation errors appear
    await waitFor(() => {
      expect(screen.getByText('Current password is required')).toBeInTheDocument();
    });
    
    // Edit a field
    fireEvent.change(screen.getByLabelText(/Current Password/i), { target: { value: 'newvalue' } });
    
    // Check that the error for that field is cleared
    await waitFor(() => {
      expect(screen.queryByText('Current password is required')).not.toBeInTheDocument();
    });
  });
  
  it('clears API error when form is edited', async () => {
    render(<ChangePasswordForm onChangePassword={mockOnChangePasswordError} />);
    
    // Fill form with valid data
    fireEvent.change(screen.getByLabelText(/Current Password/i), { target: { value: 'wrongpassword' } });
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'newpassword123' } });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { value: 'newpassword123' } });
    
    // Submit the form to trigger an API error
    const submitButton = screen.getByTestId('change-password-submit');
    fireEvent.click(submitButton);
    
    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText('Invalid current password')).toBeInTheDocument();
    });
    
    // Edit a field
    fireEvent.change(screen.getByLabelText(/Current Password/i), { target: { value: 'updatedpassword' } });
    
    // Check that the API error is cleared
    await waitFor(() => {
      expect(screen.queryByText('Invalid current password')).not.toBeInTheDocument();
    });
  });
}); 