/**
 * User Profile Hook Tests
 * 
 * This file contains tests for the useUserProfile hook:
 * - Basic functionality
 * - Logout functionality
 * - Change password functionality
 */

import { hookTestUtils, expect, describe, it, beforeEach } from '../utils/testUtils-fixed';
import { useUserProfile } from '../../hooks/useUserProfile';

// Mock the auth API directly without using jest.mock
const mockLogout = jest.fn(() => Promise.resolve());

// Manual mock for the auth module
const mockAuth = {
  logout: mockLogout
};

// Override the import
jest.mock('../../lib/api/auth', () => mockAuth);

describe('useUserProfile Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('returns the current user data', () => {
    // Arrange & Act
    const { result } = hookTestUtils.renderHook(() => useUserProfile());
    
    // Assert
    expect(result.current.user).toBeDefined();
    expect(result.current.user?.username).toBe('testuser');
    expect(result.current.user?.email).toBe('test@example.com');
  });
  
  it('provides logout functionality', async () => {
    // Arrange
    const { result } = hookTestUtils.renderHook(() => useUserProfile());
    
    // Act
    await hookTestUtils.act(async () => {
      await result.current.logout();
    });
    
    // Assert
    expect(mockLogout).toHaveBeenCalled();
  });
  
  it('handles logout errors', async () => {
    // Arrange
    const logoutError = new Error('Logout failed');
    mockLogout.mockRejectedValueOnce(logoutError);
    
    const { result } = hookTestUtils.renderHook(() => useUserProfile());
    
    // Act & Assert
    await hookTestUtils.act(async () => {
      try {
        await result.current.logout();
        throw new Error('Should have thrown an error');
      } catch (error) {
        expect(error).toBe(logoutError);
        expect(result.current.error).toBe(logoutError);
      }
    });
  });
  
  it('provides change password functionality', async () => {
    // Arrange
    const { result } = hookTestUtils.renderHook(() => useUserProfile());
    const passwordData = {
      current_password: 'currentpass',
      new_password: 'newpass123',
      confirm_password: 'newpass123',
    };
    
    // Act
    await hookTestUtils.act(async () => {
      await result.current.changePassword(passwordData);
    });
    
    // Assert
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });
}); 