/**
 * Authentication Store Slice
 * 
 * This module implements the authentication state management with Zustand:
 * - Login/logout actions
 * - Token storage and management
 * - User profile data
 * - Authentication state (loading, error handling)
 */

import { StateCreator } from 'zustand';
import axios from 'axios';
import { 
  AsyncState, 
  Selector, 
  ActionCreator,
  createInitialAsyncState, 
  setLoading,
  setSuccess,
  setError 
} from '../utils/stateTypes';
import { User as BaseUser } from '../types';

// Constants
const API_BASE_URL = 'http://localhost:8000/api/v1';
const LOGIN_ENDPOINT = `${API_BASE_URL}/users/login/`;
const ACCESS_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';

// Types
export interface User extends BaseUser {
  username: string;
  email: string;
  role?: string;
  permissions?: string[];  // User's RBAC permissions
  roles?: string[];        // User's RBAC roles
  // Additional user profile fields can be added here
}

export interface LoginCredentials {
  username?: string;
  email?: string;
  password: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginResponse {
  user: User;
  access: string;
  refresh: string;
}

export interface AuthSlice {
  // State
  authState: AsyncState<User>;
  tokens: AuthTokens | null;
  
  // Derived state
  user: User | null;
  
  // Basic Actions
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  logout: () => void;
  
  // Async Actions
  login: (credentials: LoginCredentials) => Promise<User>;
  refreshToken: (refreshToken: string) => Promise<AuthTokens>;
  
  // Selectors
  isAuthenticated: () => boolean;
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  getUserName: () => string | null;
  getUserEmail: () => string | null;
}

/**
 * Create the auth slice with its state and actions
 */
export const createAuthSlice: StateCreator<AuthSlice> = (set, get) => {
  // Define type-safe action creators
  const updateUser: ActionCreator<AuthSlice, [User | null]> = (state, user) => ({
    ...state,
    authState: user ? setSuccess(state.authState, user) : { ...state.authState, data: null },
    user: user
  });

  const updateTokens: ActionCreator<AuthSlice, [AuthTokens | null]> = (state, tokens) => ({
    ...state,
    tokens: tokens
  });

  // Define type-safe selectors
  const isAuthenticatedSelector: Selector<AuthSlice, boolean> = (state) => {
    return state.authState.data !== null && state.tokens !== null;
  };

  const getUserNameSelector: Selector<AuthSlice, string | null> = (state) => {
    return state.authState.data?.name || state.authState.data?.username || null;
  };

  const getUserEmailSelector: Selector<AuthSlice, string | null> = (state) => {
    return state.authState.data?.email || null;
  };

  /**
   * Helper function to store tokens in localStorage
   */
  const storeTokensInLocalStorage = (tokens: AuthTokens) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
  };

  /**
   * Helper function to remove tokens from localStorage
   */
  const removeTokensFromLocalStorage = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  };

  /**
   * Helper function to load tokens from localStorage
   */
  const loadTokensFromLocalStorage = (): AuthTokens | null => {
    const access = localStorage.getItem(ACCESS_TOKEN_KEY);
    const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (access && refresh) {
      return { access, refresh };
    }
    
    return null;
  };

  // Initialize tokens from localStorage if available
  const initialTokens = typeof window !== 'undefined' ? loadTokensFromLocalStorage() : null;

  return {
    // Initial State
    authState: createInitialAsyncState<User>(),
    tokens: initialTokens,
    user: null,

    // Basic Actions
    setUser: (user) => {
      set(updateUser(get(), user));
    },

    setTokens: (tokens) => {
      set(updateTokens(get(), tokens));
      
      if (tokens) {
        storeTokensInLocalStorage(tokens);
      } else {
        removeTokensFromLocalStorage();
      }
    },

    logout: () => {
      // Clear user and tokens
      set(updateUser(get(), null));
      set(updateTokens(get(), null));
      
      // Remove tokens from localStorage
      removeTokensFromLocalStorage();
    },

    // Async Actions
    login: async (credentials) => {
      // Set loading state
      set(state => ({ 
        authState: setLoading(state.authState)
      }));

      try {
        // Make API request
        const response = await axios.post<LoginResponse>(LOGIN_ENDPOINT, credentials);
        const { user, access, refresh } = response.data;
        
        // Store tokens
        const tokens = { access, refresh };
        set(updateTokens(get(), tokens));
        
        // Update user state with RBAC permissions
        const userWithPermissions = {
          ...user,
          permissions: user.permissions || [],
          roles: user.roles || []
        };
        set(updateUser(get(), userWithPermissions));
        
        return userWithPermissions;
      } catch (error) {
        // Handle error
        console.error('Login failed:', error);
        
        set(state => ({ 
          authState: setError(
            state.authState, 
            error instanceof Error ? error : new Error('Failed to login')
          )
        }));
        
        throw error;
      }
    },

    refreshToken: async (refreshToken) => {
      try {
        // Make API request to refresh token
        const response = await axios.post<AuthTokens>(`${API_BASE_URL}/users/refresh-token/`, {
          refresh: refreshToken
        });
        
        // Extract new tokens
        const tokens = {
          access: response.data.access,
          refresh: response.data.refresh || get().tokens?.refresh || ''
        };
        
        // Update tokens
        set(updateTokens(get(), tokens));
        
        return tokens;
      } catch (error) {
        // Handle error - if refresh fails, log user out
        console.error('Token refresh failed:', error);
        get().logout();
        throw error;
      }
    },

    // Selectors
    isAuthenticated: () => {
      return isAuthenticatedSelector(get());
    },

    getAccessToken: () => {
      return get().tokens?.access || null;
    },

    getRefreshToken: () => {
      return get().tokens?.refresh || null;
    },

    getUserName: () => {
      return getUserNameSelector(get());
    },

    getUserEmail: () => {
      return getUserEmailSelector(get());
    }
  };
}; 