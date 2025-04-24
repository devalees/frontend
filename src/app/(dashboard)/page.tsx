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
              <Link href="/entities" className="text-blue-600 hover:underline">
                Manage Entities
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
      
      <div className="mt-6 bg-gradient-to-r from-indigo-50 to-blue-50 border border-blue-200 rounded-lg p-5">
        <div className="flex items-start space-x-4">
          <div className="bg-white p-3 rounded-full shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-indigo-900">Entity Management</h3>
            <p className="text-indigo-700 mb-3">
              Manage your organizations, departments, teams, and team members in one place.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link 
                href="/entities" 
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 inline-flex items-center text-sm"
              >
                View All Entities
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link 
                href="/entities/organizations" 
                className="bg-white text-indigo-600 border border-indigo-200 px-3 py-1 rounded hover:bg-indigo-50 text-sm"
              >
                Organizations
              </Link>
              <Link 
                href="/entities/teams" 
                className="bg-white text-indigo-600 border border-indigo-200 px-3 py-1 rounded hover:bg-indigo-50 text-sm"
              >
                Teams
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 