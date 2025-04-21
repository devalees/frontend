/**
 * User Profile Hook
 * 
 * This hook provides access to the current user's profile data and actions:
 * - User information
 * - Logout functionality
 * - Change password functionality
 */

import { useState } from 'react';
import { User } from '../components/features/auth/UserProfile';
import { logout as logoutApi, changePassword as changePasswordApi, ChangePasswordRequest } from '../lib/api/auth';

interface UserProfileHookResult {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  logout: () => Promise<void>;
  changePassword: (data: ChangePasswordRequest, useSimulation?: boolean) => Promise<void>;
}

/**
 * Hook to access and manage user profile data
 */
export function useUserProfile(): UserProfileHookResult {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [user, setUser] = useState<User | null>({
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    role: 'User',
    is_active: true,
  });

  /**
   * Logout the current user
   */
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await logoutApi();
      setUser(null);
      // Additional logout logic such as redirecting would go here
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Failed to logout'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Change the current user's password
   * @param data - The password change data
   * @param useSimulation - Whether to use simulation mode (default: false)
   */
  const changePassword = async (data: ChangePasswordRequest, useSimulation = false): Promise<void> => {
    console.log('useUserProfile: changePassword called with:', {
      current_password: data.current_password ? '********' : 'empty',
      new_password: data.new_password ? '********' : 'empty',
      confirm_password: data.confirm_password ? '********' : 'empty'
    }, `useSimulation: ${useSimulation}`);
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('useUserProfile: Calling changePasswordApi');
      // Call the actual API to change the password
      await changePasswordApi(data, useSimulation);
      console.log('useUserProfile: Password changed successfully');
    } catch (error) {
      console.error('useUserProfile: Error changing password:', error);
      setError(error instanceof Error ? error : new Error('Failed to change password'));
      throw error;
    } finally {
      setIsLoading(false);
      console.log('useUserProfile: Finished password change attempt, isLoading set to false');
    }
  };

  return {
    user,
    isLoading,
    error,
    logout,
    changePassword,
  };
} 