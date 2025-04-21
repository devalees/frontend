'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

/**
 * Unauthorized Page
 * 
 * This page is displayed when a user attempts to access a route
 * they don't have permission to access.
 */
export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Access Denied</h1>
          <p className="mt-2 text-sm text-gray-600">
            You don't have permission to access this page
          </p>
        </div>
        
        <div className="mt-8 space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">
              If you believe this is an error, please contact your administrator.
            </p>
          </div>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Go Back
            </button>
            
            <Link
              href="/dashboard"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 