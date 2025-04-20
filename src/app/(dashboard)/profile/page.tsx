'use client';

/**
 * User Profile Page
 * 
 * This page displays the user profile component for the currently authenticated user.
 */

import React from 'react';
import { useUserProfile } from '../../../hooks/useUserProfile';
import { UserProfile } from '../../../components/features/auth/UserProfile';

export default function ProfilePage() {
  const { user, isLoading, logout, changePassword } = useUserProfile();
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">User Not Found</h1>
        <p className="text-gray-600">Please login to view your profile.</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
        <p className="mt-2 text-sm text-gray-500">
          Manage your account information and security settings
        </p>
      </div>
      
      <UserProfile 
        user={user}
        onLogout={logout}
        onChangePassword={changePassword}
      />
    </div>
  );
} 