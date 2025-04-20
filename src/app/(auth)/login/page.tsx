'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoginForm from '../../../components/features/auth/LoginForm';
import { useStore } from '../../../lib/store';
import { AuthSlice } from '../../../lib/store/slices/authSlice';

/**
 * Login Page
 * 
 * Provides user authentication through the login form and handles
 * navigation after successful login
 */
export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated } = useStore() as AuthSlice;
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  // Handle successful login
  const handleLoginSuccess = () => {
    // Redirect to dashboard after successful login
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link 
              href="/register" 
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              create a new account
            </Link>
          </p>
        </div>
        
        {/* Login Form */}
        <LoginForm onSuccess={handleLoginSuccess} className="mt-8" />
        
        {/* Forgot Password Link */}
        <div className="text-center mt-4">
          <Link 
            href="/forgot-password" 
            className="font-medium text-sm text-primary-600 hover:text-primary-500"
          >
            Forgot your password?
          </Link>
        </div>
        
        {/* Security Info */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">
                Secure login
              </span>
            </div>
          </div>
          
          <div className="mt-6 text-center text-xs text-gray-500">
            <p>
              Protected by industry-standard encryption.
              <br />
              Your information is secure with us.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 