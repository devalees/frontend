/**
 * Change Password Form Component
 * 
 * This component allows logged-in users to change their password, including:
 * - Current password validation
 * - New password validation (matching, minimum requirements)
 * - Error handling and user feedback
 */

import React, { useState } from 'react';
import { ChangePasswordRequest } from '@/lib/api/auth';

interface ChangePasswordFormProps {
  onChangePassword: (data: ChangePasswordRequest) => Promise<void>;
  loading?: boolean;
}

export const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ 
  onChangePassword, 
  loading = false 
}) => {
  // Form state
  const [formData, setFormData] = useState<ChangePasswordRequest>({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Error message from API
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Success message
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Loading state for form submission
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Clear validation error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear API error when any field is changed
    if (apiError) {
      setApiError(null);
    }
    
    // Clear success message when form is edited
    if (successMessage) {
      setSuccessMessage(null);
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Check if current password is provided
    if (!formData.current_password) {
      newErrors.current_password = 'Current password is required';
    }
    
    // Check if new password is provided
    if (!formData.new_password) {
      newErrors.new_password = 'New password is required';
    } else if (formData.new_password.length < 8) {
      newErrors.new_password = 'Password must be at least 8 characters';
    }
    
    // Check if confirm password is provided and matches new password
    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Please confirm your new password';
    } else if (formData.confirm_password !== formData.new_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }
    
    // Check if new password is different from current password
    if (formData.new_password && formData.current_password && 
        formData.new_password === formData.current_password) {
      newErrors.new_password = 'New password must be different from current password';
    }
    
    setErrors(newErrors);
    console.log('Form validation errors:', newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    
    // Validate form
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }
    
    setIsSubmitting(true);
    console.log('Setting isSubmitting to true');
    
    try {
      // Call the change password function
      console.log('Calling onChangePassword with:', formData);
      await onChangePassword(formData);
      
      // Show success message
      console.log('Password changed successfully');
      setSuccessMessage('Password changed successfully');
      
      // Reset form
      setFormData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      
      // Automatically clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (error) {
      // Handle API error
      console.error('Error changing password:', error);
      setApiError(error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setIsSubmitting(false);
      console.log('Setting isSubmitting to false');
    }
  };

  return (
    <div className="change-password-form-container">
      <h2 className="text-xl font-semibold mb-4">Change Password</h2>
      
      {apiError && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4 shadow-md" role="alert">
          <div className="flex items-center">
            <div className="py-1">
              <svg className="h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <span className="font-medium">{apiError}</span>
          </div>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded mb-4 shadow-md" role="alert">
          <div className="flex items-center">
            <div className="py-1">
              <svg className="h-6 w-6 text-green-500 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="font-medium">{successMessage}</span>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <label htmlFor="current_password" className="block text-sm font-medium">
            Current Password
          </label>
          <input
            id="current_password"
            type="password"
            name="current_password"
            value={formData.current_password}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border ${errors.current_password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            placeholder="Enter current password"
            disabled={isSubmitting || loading}
          />
          {errors.current_password && (
            <p className="mt-2 text-sm text-red-600">{errors.current_password}</p>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="new_password" className="block text-sm font-medium">
            New Password
          </label>
          <input
            id="new_password"
            type="password"
            name="new_password"
            value={formData.new_password}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border ${errors.new_password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            placeholder="Enter new password"
            disabled={isSubmitting || loading}
          />
          {errors.new_password && (
            <p className="mt-2 text-sm text-red-600">{errors.new_password}</p>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="confirm_password" className="block text-sm font-medium">
            Confirm New Password
          </label>
          <input
            id="confirm_password"
            type="password"
            name="confirm_password"
            value={formData.confirm_password}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border ${errors.confirm_password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            placeholder="Confirm new password"
            disabled={isSubmitting || loading}
          />
          {errors.confirm_password && (
            <p className="mt-2 text-sm text-red-600">{errors.confirm_password}</p>
          )}
        </div>
        
        <div>
          <button
            type="submit"
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isSubmitting || loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={isSubmitting || loading}
            data-testid="change-password-submit"
          >
            {isSubmitting || loading ? 'Changing Password...' : 'Change Password'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePasswordForm; 