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

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/features/auth/LoginForm';
import { login, LoginCredentials } from '@/lib/api/auth';

/**
 * Login Page
 * 
 * Provides user authentication through the login form and handles
 * navigation after successful login
 */
export default function LoginPage() {
  const router = useRouter();
  
  // Handle login submission
  const handleLogin = useCallback(async (credentials: LoginCredentials) => {
    try {
      // Call login API
      const response = await login(credentials);
      
      // Redirect to dashboard on successful login
      router.push('/dashboard');
      
      return response;
    } catch (error) {
      // Let the form component handle the error
      throw error;
    }
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Welcome Back</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access your account
          </p>
        </div>
        
        <LoginForm onLogin={handleLogin} />
        
        <div className="text-center mt-4">
          <p className="text-xs text-gray-500">
            By logging in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
} 