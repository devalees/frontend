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
import { logout as logoutApi } from '../lib/api/auth';

interface UserProfileHookResult {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  logout: () => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
}

interface ChangePasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

/**
 * Hook to access and manage user profile data
 */
export function useUserProfile(): UserProfileHookResult {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Here we would typically use the auth store to get the current user
  // This is a placeholder until the actual store is connected
  const user: User = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    role: 'User',
    is_active: true,
  };

  /**
   * Logout the current user
   */
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await logoutApi();
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
   */
  const changePassword = async (data: ChangePasswordData): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // This would call the actual API to change the password
      // For now, we'll just simulate a successful response after a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // If we had an actual API call, it would look something like:
      // await api.changePassword(data);
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Failed to change password'));
      throw error;
    } finally {
      setIsLoading(false);
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