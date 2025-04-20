/**
 * User Profile Component
 * 
 * This component displays the currently authenticated user's profile and provides:
 * - User information display
 * - Logout functionality
 * - Change password functionality
 */

import React, { useState } from 'react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';

// User type definition based on the auth slice
export interface User {
  id: number;
  username: string;
  email: string;
  role?: string;
  is_active: boolean;
}

// Change password form data type
interface ChangePasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

interface UserProfileProps {
  user: User;
  onLogout: () => Promise<void>;
  onChangePassword: (data: ChangePasswordData) => Promise<void>;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  user,
  onLogout,
  onChangePassword
}) => {
  // State for change password form visibility
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
  
  // State for change password form data
  const [passwordFormData, setPasswordFormData] = useState<ChangePasswordData>({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  // State for form validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // State for loading during form submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle logout button click
  const handleLogout = async () => {
    await onLogout();
  };

  // Toggle change password form visibility
  const toggleChangePasswordForm = () => {
    setShowChangePasswordForm(!showChangePasswordForm);
    // Reset form data and errors when toggling form
    if (!showChangePasswordForm) {
      setPasswordFormData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      setErrors({});
    }
  };

  // Handle input change in the password form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when field is changed
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validate password form data
  const validatePasswordForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Check if current password is provided
    if (!passwordFormData.current_password) {
      newErrors.current_password = 'Current password is required';
    }
    
    // Check if new password is provided
    if (!passwordFormData.new_password) {
      newErrors.new_password = 'New password is required';
    } else if (passwordFormData.new_password.length < 8) {
      newErrors.new_password = 'Password must be at least 8 characters';
    }
    
    // Check if confirm password is provided and matches new password
    if (!passwordFormData.confirm_password) {
      newErrors.confirm_password = 'Please confirm your new password';
    } else if (passwordFormData.new_password !== passwordFormData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle change password form submission
  const handleSubmitPasswordForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate form data
    if (!validatePasswordForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Call the change password function
      await onChangePassword(passwordFormData);
      
      // Reset form and hide it on success
      setPasswordFormData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      setShowChangePasswordForm(false);
    } catch (error) {
      // Handle error (could add more specific error handling)
      setErrors({
        form: error instanceof Error ? error.message : 'Failed to change password'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Profile</h2>
      
      {/* User Information Section */}
      <div className="mb-6 bg-gray-50 p-4 rounded">
        <div className="mb-4">
          <h3 className="text-sm text-gray-500 font-semibold">Username</h3>
          <p className="text-lg font-medium">{user.username}</p>
        </div>
        
        <div className="mb-4">
          <h3 className="text-sm text-gray-500 font-semibold">Email</h3>
          <p className="text-lg">{user.email}</p>
        </div>
        
        {user.role && (
          <div className="mb-4">
            <h3 className="text-sm text-gray-500 font-semibold">Role</h3>
            <p className="text-lg">{user.role}</p>
          </div>
        )}
        
        <div>
          <h3 className="text-sm text-gray-500 font-semibold">Status</h3>
          <div className="flex items-center mt-1">
            <span className={`h-3 w-3 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'} mr-2`}></span>
            <p>{user.is_active ? 'Active' : 'Inactive'}</p>
          </div>
        </div>
      </div>
      
      {/* Actions Section */}
      <div className="flex flex-col space-y-3">
        <Button 
          variant="secondary" 
          onClick={toggleChangePasswordForm}
          aria-label="Change Password"
        >
          Change Password
        </Button>
        
        <Button 
          variant="primary" 
          onClick={handleLogout}
          aria-label="Logout"
        >
          Logout
        </Button>
      </div>
      
      {/* Change Password Form */}
      {showChangePasswordForm && (
        <div className="mt-6 bg-gray-50 p-4 rounded">
          <h3 className="text-xl font-semibold mb-4">Change Password</h3>
          
          {errors.form && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
              <span className="block sm:inline">{errors.form}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmitPasswordForm} className="space-y-4">
            <div>
              <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <Input
                id="current_password"
                name="current_password"
                type="password"
                value={passwordFormData.current_password}
                onChange={handleInputChange}
                error={!!errors.current_password}
                errorMessage={errors.current_password}
                disabled={isSubmitting}
                aria-label="Current Password"
              />
            </div>
            
            <div>
              <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <Input
                id="new_password"
                name="new_password"
                type="password"
                value={passwordFormData.new_password}
                onChange={handleInputChange}
                error={!!errors.new_password}
                errorMessage={errors.new_password}
                disabled={isSubmitting}
                aria-label="New Password"
              />
            </div>
            
            <div>
              <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <Input
                id="confirm_password"
                name="confirm_password"
                type="password"
                value={passwordFormData.confirm_password}
                onChange={handleInputChange}
                error={!!errors.confirm_password}
                errorMessage={errors.confirm_password}
                disabled={isSubmitting}
                aria-label="Confirm Password"
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-3">
              <Button
                variant="tertiary"
                onClick={toggleChangePasswordForm}
                disabled={isSubmitting}
                aria-label="Cancel"
              >
                Cancel
              </Button>
              
              <button
                type="submit"
                className={`px-4 py-2 rounded-md font-medium bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isSubmitting}
                aria-label="Update Password"
              >
                {isSubmitting ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}; 