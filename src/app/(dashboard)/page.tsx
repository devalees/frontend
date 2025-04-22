'use client';

/**
 * Dashboard Home Page
 * 
 * Main dashboard landing page that displays:
 * - Summary cards
 * - Recent activity
 * - Quick actions
 */

import React, { useEffect, useState } from 'react';
import { Link } from '@/components/ui/Link';
import { getTokens } from '@/lib/features/auth/token';

export default function DashboardPage() {
  const [userName, setUserName] = useState('User');
  
  useEffect(() => {
    // For debugging - check if tokens are stored
    const tokens = getTokens();
    if (tokens) {
      console.log('Dashboard loaded with valid authentication tokens');
    } else {
      console.warn('Dashboard loaded without valid authentication tokens');
    }
    
    // Try to get user info from localStorage for display
    try {
      const userJson = localStorage.getItem('user_info');
      if (userJson) {
        const user = JSON.parse(userJson);
        if (user && user.username) {
          setUserName(user.username);
        }
      }
    } catch (e) {
      console.error('Failed to parse user info', e);
    }
  }, []);
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link href="/profile" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          View Profile
        </Link>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Welcome back, {userName}!</h2>
        <p className="text-gray-600">
          You have successfully logged in to the dashboard. 
          This is a protected page that requires authentication.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="font-medium text-gray-900 mb-2">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/profile" className="text-blue-600 hover:underline">
                View Your Profile
              </Link>
            </li>
            <li>
              <Link href="/projects" className="text-blue-600 hover:underline">
                Manage Projects
              </Link>
            </li>
            <li>
              <Link href="/tasks" className="text-blue-600 hover:underline">
                View Tasks
              </Link>
            </li>
          </ul>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="font-medium text-gray-900 mb-2">System Status</h3>
          <p className="text-green-600 flex items-center">
            <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
            All systems operational
          </p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="font-medium text-gray-900 mb-2">Recent Activity</h3>
          <p className="text-gray-600 text-sm">
            No recent activity to display
          </p>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 mb-2">Authentication Test</h3>
        <p className="text-blue-600 mb-2 text-sm">
          If you can see this page, you are successfully authenticated.
        </p>
        <Link 
          href="/auth-test" 
          className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 inline-block"
        >
          View Auth Details
        </Link>
      </div>
    </div>
  );
} 