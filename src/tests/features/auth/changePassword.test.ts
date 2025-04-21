/**
 * Change Password API Tests
 *
 * These tests verify the functionality of the changePassword API function,
 * including validation, error handling, and successful password changes.
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { changePassword, ChangePasswordRequest } from '@/lib/api/auth';
import { getTokens } from '@/lib/features/auth/token';
import axiosConfig from '@/lib/api/axiosConfig';

// Define response types
interface ChangePasswordResponse {
  message: string;
}

// Mock axios and token functions
jest.mock('@/lib/features/auth/token', () => ({
  getTokens: jest.fn()
}));

// Mock axiosConfig
jest.mock('@/lib/api/axiosConfig', () => ({
  __esModule: true,
  default: {
    post: jest.fn()
  }
}));

describe('changePassword', () => {
  const mockData: ChangePasswordRequest = {
    current_password: 'currentPass123',
    new_password: 'newPass123',
    confirm_password: 'newPass123'
  };

  const mockTokens = {
    access: 'test-access-token',
    refresh: 'test-refresh-token'
  };

  const mockPost = axiosConfig.post as jest.MockedFunction<typeof axiosConfig.post>;

  beforeEach(() => {
    jest.clearAllMocks();
    (getTokens as jest.Mock).mockReturnValue(mockTokens);
  });

  it('should successfully change password with valid data', async () => {
    const mockResponse: AxiosResponse = {
      data: { message: 'Password changed successfully' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any
    };

    mockPost.mockResolvedValueOnce(mockResponse);

    await expect(changePassword(mockData)).resolves.not.toThrow();
    expect(mockPost).toHaveBeenCalledWith(
      expect.stringContaining('/users/change_password/'),
      mockData,
      expect.objectContaining({
        headers: {
          'Authorization': `Bearer ${mockTokens.access}`,
          'Content-Type': 'application/json'
        }
      })
    );
  });

  it('should throw error when current password is empty', async () => {
    const invalidData = { ...mockData, current_password: '' };
    await expect(changePassword(invalidData)).rejects.toThrow('Current password is required');
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('should throw error when new password is too short', async () => {
    const invalidData = { ...mockData, new_password: 'short', confirm_password: 'short' };
    await expect(changePassword(invalidData)).rejects.toThrow('New password must be at least 8 characters');
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('should throw error when passwords do not match', async () => {
    const invalidData = { ...mockData, confirm_password: 'differentPass123' };
    await expect(changePassword(invalidData)).rejects.toThrow("New passwords don't match");
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('should throw error when API returns an error', async () => {
    // Create a mock error object instead of using AxiosError constructor
    const errorResponse = {
      isAxiosError: true,
      message: 'Invalid current password',
      code: 'ERR_BAD_REQUEST',
      response: {
        data: { message: 'Invalid current password' },
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config: {} as any
      } as AxiosResponse
    };

    mockPost.mockRejectedValueOnce(errorResponse);

    await expect(changePassword(mockData)).rejects.toThrow('Invalid current password');
    expect(mockPost).toHaveBeenCalledTimes(1);
  });

  it('should throw error when network request fails', async () => {
    // Create a mock error object instead of using AxiosError constructor
    const networkError = {
      isAxiosError: true,
      message: 'Network error',
      code: 'ECONNABORTED'
    };

    mockPost.mockRejectedValueOnce(networkError);

    await expect(changePassword(mockData)).rejects.toThrow('Network error');
    expect(mockPost).toHaveBeenCalledTimes(1);
  });

  it('should throw error when no tokens are available', async () => {
    (getTokens as jest.Mock).mockReturnValueOnce(null);
    await expect(changePassword(mockData)).rejects.toThrow('You must be logged in to change your password');
    expect(mockPost).not.toHaveBeenCalled();
  });
}); 