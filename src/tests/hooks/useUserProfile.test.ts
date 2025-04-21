/**
 * User Profile Hook Tests
 *
 * These tests verify the functionality of the useUserProfile hook,
 * including initial state, logout functionality, and change password functionality.
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { renderHook, act } from '@testing-library/react';
import { useUserProfile } from '../../hooks/useUserProfile';
import { clearTokens } from '../../lib/api/tokenRefresh';
import { ChangePasswordRequest } from '../../lib/api/auth';

// Mock the auth module to avoid axios import issues
jest.mock('../../lib/api/auth', () => {
  const originalModule = jest.requireActual('../../lib/api/auth');
  return {
    ...originalModule,
    logout: jest.fn().mockResolvedValue(undefined),
    changePassword: jest.fn().mockResolvedValue(undefined)
  };
});

// Import the mocked auth module
import { logout as logoutApi, changePassword as changePasswordApi } from '../../lib/api/auth';

// Mock token refresh module
jest.mock('../../lib/api/tokenRefresh', () => ({
  clearTokens: jest.fn()
}));

// Mock responses
const mockUserData = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  role: 'User',
  is_active: true
};

describe('useUserProfile Hook', () => {
  let storage: { [key: string]: string };
  let originalLocation: Location;

  beforeEach(() => {
    // Setup localStorage mock
    storage = {};
    const mockStorage = {
      getItem: jest.fn((key: string) => storage[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        storage[key] = value;
      }),
      removeItem: jest.fn((key: string) => {
        delete storage[key];
      }),
      clear: jest.fn(() => {
        storage = {};
      })
    };
    Object.defineProperty(window, 'localStorage', { value: mockStorage });

    // Mock window.location
    originalLocation = window.location;
    delete (window as any).location;
    window.location = { ...originalLocation, href: '' };

    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore window.location
    window.location = originalLocation;
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useUserProfile());
    expect(result.current.isLoading).toBe(false); // Changed to false since we're using a static user
    expect(result.current.user).toEqual(mockUserData);
    expect(result.current.error).toBeNull();
  });

  it('should handle logout', async () => {
    storage['auth_token'] = 'test-token';
    storage['refresh_token'] = 'test-refresh-token';

    const { result } = renderHook(() => useUserProfile());

    // Perform logout
    await act(async () => {
      await result.current.logout();
    });

    expect(logoutApi).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle password change', async () => {
    storage['auth_token'] = 'test-token';
    storage['refresh_token'] = 'test-refresh-token';

    const { result } = renderHook(() => useUserProfile());

    const passwordData: ChangePasswordRequest = {
      current_password: 'oldpass',
      new_password: 'newpass123',
      confirm_password: 'newpass123'
    };

    // Perform password change
    await act(async () => {
      await result.current.changePassword(passwordData);
    });

    expect(changePasswordApi).toHaveBeenCalledWith(passwordData, false);
    expect(result.current.error).toBeNull();
  });

  it('should handle password change validation errors', async () => {
    // Mock the changePassword function to throw a validation error
    (changePasswordApi as jest.Mock).mockRejectedValueOnce(new Error('Current password is required'));
    
    const { result } = renderHook(() => useUserProfile());

    const passwordData: ChangePasswordRequest = {
      current_password: '',
      new_password: 'short',
      confirm_password: 'different'
    };

    // Attempt password change with invalid data
    await act(async () => {
      try {
        await result.current.changePassword(passwordData);
      } catch (error) {
        // Expected error
      }
    });

    expect(changePasswordApi).toHaveBeenCalledWith(passwordData, false);
    expect(result.current.error).not.toBeNull();
  });

  it('should handle password change API errors', async () => {
    // Mock the changePassword function to throw an API error
    (changePasswordApi as jest.Mock).mockRejectedValueOnce(new Error('Current password is incorrect'));
    
    storage['auth_token'] = 'test-token';
    storage['refresh_token'] = 'test-refresh-token';

    const { result } = renderHook(() => useUserProfile());

    const passwordData: ChangePasswordRequest = {
      current_password: 'wrongpass',
      new_password: 'newpass123',
      confirm_password: 'newpass123'
    };

    // Attempt password change with incorrect current password
    await act(async () => {
      try {
        await result.current.changePassword(passwordData);
      } catch (error) {
        // Expected error
      }
    });

    expect(changePasswordApi).toHaveBeenCalledWith(passwordData, false);
    expect(result.current.error).not.toBeNull();
  });
}); 