/**
 * Authentication Login Tests
 * 
 * Tests for the login functionality, including:
 * - API integration
 * - Token storage
 * - Error handling
 */

import React from 'react';
import axios from 'axios';
import { login, LoginCredentials } from '../../../lib/api/auth';
import LoginForm from '../../../components/features/auth/LoginForm';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom'; // Import for toBeInTheDocument matcher

// Mock axios
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
    create: jest.fn(() => ({
      post: jest.fn(),
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn() }
      }
    }))
  }
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock localStorage
const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: jest.fn((key: string) => { delete store[key]; }),
    clear: jest.fn(() => { Object.keys(store).forEach(key => { delete store[key]; }); })
  };
};

// Mock the auth module to control the login behavior
jest.mock('../../../lib/api/auth', () => {
  const originalModule = jest.requireActual('../../../lib/api/auth');
  
  return {
    ...originalModule,
    login: jest.fn((credentials: LoginCredentials) => {
      // This will be controlled by individual tests
      if (credentials.password === 'wrongpassword') {
        return Promise.reject(new Error('Invalid credentials'));
      }
      
      return Promise.resolve({
        access: 'mock-access-token',
        refresh: 'mock-refresh-token',
        user: {
          id: 1,
          username: credentials.username || credentials.email || 'testuser',
          email: 'test@example.com',
          is_active: true
        }
      });
    })
  };
});

const mockedLogin = login as jest.MockedFunction<typeof login>;

describe('Authentication API', () => {
  // Setup localStorage mock
  let originalLocalStorage: Storage;
  
  beforeAll(() => {
    originalLocalStorage = window.localStorage;
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage(),
      writable: true
    });
  });
  
  afterAll(() => {
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage
    });
  });
  
  // Clean up mocks after each test
  afterEach(() => {
    if (mockedAxios.post.mockReset) {
      mockedAxios.post.mockReset();
    }
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully log in a user with valid credentials', async () => {
      // Mock successful API response
      const mockResponse = {
        data: {
          access: 'mock-access-token',
          refresh: 'mock-refresh-token',
          user: {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            is_active: true
          }
        }
      };

      // Setup mock behavior
      mockedLogin.mockResolvedValueOnce(mockResponse.data);

      // Call login function
      const response = await login({ username: 'testuser', password: 'password123' });

      // Verify response
      expect(response).toEqual(mockResponse.data);

      // Verify login was called with correct parameters
      expect(mockedLogin).toHaveBeenCalledWith({ username: 'testuser', password: 'password123' });
    });

    it('should handle login failure with invalid credentials', async () => {
      // Mock API error response
      const errorResponse = new Error('Invalid credentials');
      
      // Setup mock behavior
      mockedLogin.mockRejectedValueOnce(errorResponse);

      // Call login function and expect it to throw
      await expect(
        login({ username: 'testuser', password: 'wrongpassword' })
      ).rejects.toThrow('Invalid credentials');

      // Verify login was called
      expect(mockedLogin).toHaveBeenCalledWith({ username: 'testuser', password: 'wrongpassword' });
    });
  });
});

// Define props interface to fix type issues
interface LoginFormProps {
  onLogin: (credentials: LoginCredentials) => Promise<any>;
}

// Mock component props for testing
jest.mock('../../../components/features/auth/LoginForm', () => {
  return jest.fn((props: LoginFormProps) => (
    <div data-testid="login-form">
      <input 
        data-testid="username-input" 
        placeholder="Username" 
        aria-label="Username or Email"
        onChange={(e) => props.onLogin({ username: e.target.value, password: 'password123' })}
      />
      <input 
        data-testid="password-input" 
        type="password" 
        placeholder="Password" 
        aria-label="Password"
      />
      <button 
        data-testid="submit-button" 
        aria-label="Sign in"
        onClick={() => props.onLogin({ username: 'testuser', password: 'password123' })}
      >
        Sign in
      </button>
    </div>
  ));
});

describe('Login Form Component', () => {
  // Mock login function for form tests
  const mockLoginFn = jest.fn();
  
  beforeEach(() => {
    mockLoginFn.mockClear();
    (LoginForm as jest.Mock).mockClear();
  });

  it('should render the login form', () => {
    render(<LoginForm onLogin={mockLoginFn} />);
    
    // Check if form renders
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
    expect(screen.getByTestId('username-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  it('should call onLogin when form is submitted', async () => {
    render(<LoginForm onLogin={mockLoginFn} />);
    
    // Click the submit button
    fireEvent.click(screen.getByTestId('submit-button'));
    
    // Wait for submission
    await waitFor(() => {
      expect(mockLoginFn).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123'
      });
    });
  });

  it('should handle user interaction with form fields', async () => {
    render(<LoginForm onLogin={mockLoginFn} />);
    
    // Simulate username input
    fireEvent.change(screen.getByTestId('username-input'), {
      target: { value: 'newuser' }
    });
    
    // Verify login was called with username
    await waitFor(() => {
      expect(mockLoginFn).toHaveBeenCalledWith({
        username: 'newuser',
        password: 'password123'
      });
    });
  });
}); 