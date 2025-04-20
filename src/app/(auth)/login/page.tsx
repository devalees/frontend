'use client';

/**
 * Login Page
 * 
 * This page provides user authentication functionality:
 * - User login form
 * - Form validation
 * - API integration
 * - Redirect after successful login
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import LoginForm from '@/components/features/auth/LoginForm';
import { login, LoginCredentials } from '@/lib/api/auth';
import { getTokens } from '@/lib/features/auth/token';

/**
 * Login Page
 * 
 * Provides user authentication through the login form and handles
 * navigation after successful login
 */
export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [redirectPath, setRedirectPath] = useState('/dashboard');
  const [error, setError] = useState<string | null>(null);
  
  // Get the redirect path from URL parameters
  useEffect(() => {
    const redirect = searchParams.get('redirect');
    if (redirect) {
      try {
        // Make sure the redirect URL is valid and on our domain
        const url = new URL(redirect);
        // Only take the pathname + search portion to avoid redirecting to other domains
        setRedirectPath(url.pathname + url.search);
        console.log('Will redirect to:', url.pathname + url.search);
      } catch (e) {
        // If URL is invalid, fallback to dashboard
        console.error('Invalid redirect URL', redirect);
      }
    } else {
      console.log('No redirect parameter found, will redirect to: /dashboard');
    }
  }, [searchParams]);
  
  // Handle login submission
  const handleLogin = useCallback(async (credentials: LoginCredentials) => {
    setIsLoggingIn(true);
    setError(null);
    
    try {
      // Call login API
      console.log('Submitting login...');
      const response = await login(credentials);
      console.log('Login succeeded, redirecting to:', redirectPath);
      
      // Check if tokens are stored
      const tokens = getTokens();
      
      if (tokens) {
        // Use router for client-side navigation
        router.push(redirectPath);
        return response;
      } else {
        // No tokens found - show error
        setError('Login successful but authentication tokens not stored. Please try again.');
        setIsLoggingIn(false);
      }
      
      return response;
    } catch (error) {
      // Let the form component handle the error
      setIsLoggingIn(false);
      setError(error instanceof Error ? error.message : 'Failed to login');
      throw error;
    }
  }, [redirectPath, router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Welcome Back</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access your account
          </p>
        </div>
        
        <LoginForm onLogin={handleLogin} loading={isLoggingIn} />
        
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        <div className="text-center mt-4">
          <p className="text-xs text-gray-500">
            By logging in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
} 