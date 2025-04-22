/**
 * User Profile Component
 * 
 * Displays the user profile information and provides actions:
 * - View profile details
 * - Change password
 * - Logout
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { NavButton } from '@/components/ui/NavButton';
import { Input } from '@/components/ui/Input';
import ChangePasswordForm from './ChangePasswordForm';
import { ChangePasswordRequest } from '@/lib/api/auth';

// User type definition based on the auth slice
export interface User {
  id: number;
  username: string;
  email: string;
  role?: string;
  is_active: boolean;
}

interface UserProfileProps {
  user: User;
  onLogout: () => Promise<void>;
  onChangePassword: (data: ChangePasswordRequest) => Promise<void>;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  user,
  onLogout,
  onChangePassword
}) => {
  // State for showing/hiding change password form
  const [showChangePasswordForm, setShowChangePasswordForm] = useState<boolean>(false);
  // Loading state for logout button
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  // Status message for operations
  const [statusMessage, setStatusMessage] = useState<{text: string; type: 'success'|'error'|'none'}>({
    text: '', 
    type: 'none'
  });
  // Toast notification for password change
  const [showToast, setShowToast] = useState<boolean>(false);

  // Auto-hide toast after delay
  useEffect(() => {
    let toastTimer: NodeJS.Timeout;
    
    if (showToast) {
      toastTimer = setTimeout(() => {
        setShowToast(false);
      }, 5000);
    }
    
    return () => {
      if (toastTimer) clearTimeout(toastTimer);
    };
  }, [showToast]);

  // Toggle change password form visibility
  const toggleChangePasswordForm = () => {
    setShowChangePasswordForm(!showChangePasswordForm);
    // Clear status message when toggling form
    setStatusMessage({ text: '', type: 'none' });
  };

  // Handle logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await onLogout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Handle password change with feedback
  const handlePasswordChange = async (data: ChangePasswordRequest) => {
    try {
      await onChangePassword(data);
      
      // Simple direct success message - no animation dependency
      setStatusMessage({ 
        text: 'Password changed successfully!', 
        type: 'success' 
      });
      
      // Also show the toast notification
      setShowToast(true);
      
      // Hide the form after successful password change
      setShowChangePasswordForm(false);
      
      // Keep success message visible for longer (15 seconds)
      setTimeout(() => {
        setStatusMessage({ text: '', type: 'none' });
      }, 15000);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to change password';
      setStatusMessage({ 
        text: `${errorMessage}`, 
        type: 'error' 
      });
      throw error; // Re-throw to let the form component handle the error display
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Profile</h2>
      
      {/* Simple, high-visibility status message */}
      {statusMessage.type !== 'none' && (
        <div 
          className={`${
            statusMessage.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          } px-4 py-3 rounded mb-6 shadow-md text-center font-bold`} 
          role="alert"
        >
          {statusMessage.type === 'success' && (
            <span className="text-2xl mr-2">✓</span>
          )}
          {statusMessage.type === 'error' && (
            <span className="text-2xl mr-2">⚠</span>
          )}
          {statusMessage.text}
        </div>
      )}
      
      {/* Toast notification for password change */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded shadow-lg z-50 flex items-center">
          <span className="text-xl mr-2">✓</span>
          <span className="font-bold">Password updated successfully!</span>
          <button 
            onClick={() => setShowToast(false)}
            className="ml-4 text-white hover:text-gray-200 focus:outline-none"
            aria-label="Close notification"
          >
            <span className="text-xl">×</span>
          </button>
        </div>
      )}
      
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
          {showChangePasswordForm ? 'Hide Password Form' : 'Change Password'}
        </Button>
        
        <Button 
          variant="default" 
          onClick={handleLogout}
          aria-label="Logout"
          disabled={isLoggingOut}
        >
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </Button>
      </div>
      
      {/* Change Password Form */}
      {showChangePasswordForm && (
        <div className="mt-6 bg-gray-50 p-4 rounded">
          <ChangePasswordForm 
            onChangePassword={handlePasswordChange}
          />
        </div>
      )}
    </div>
  );
}; 