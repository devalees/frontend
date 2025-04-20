/**
 * User Profile Component Tests
 * 
 * This file contains tests for the UserProfile component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../../../components/features/auth/UserProfile';

// Mock implementations
const mockLogout = jest.fn();
const mockChangePassword = jest.fn();

describe('UserProfile Component', () => {
  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    is_active: true,
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders the user profile with correct information', () => {
    // Arrange & Act
    render(
      <UserProfile 
        user={mockUser}
        onLogout={mockLogout}
        onChangePassword={mockChangePassword}
      />
    );
    
    // Assert
    expect(screen.getByText(/Profile/i)).toBeInTheDocument();
    expect(screen.getByText(/testuser/i)).toBeInTheDocument();
    expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
  });
}); 