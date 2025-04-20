'use client';

/**
 * Authentication Test Page
 * 
 * This page helps diagnose authentication issues
 */

import React, { useEffect, useState } from 'react';
import { getTokens } from '@/lib/features/auth/token';
import Link from 'next/link';

export default function AuthTestPage() {
  const [tokenInfo, setTokenInfo] = useState<string>('Checking tokens...');
  
  useEffect(() => {
    const tokens = getTokens();
    if (tokens) {
      setTokenInfo(`✅ Authentication tokens found:
      - Access token: ${tokens.access.substring(0, 15)}...
      - Refresh token: ${tokens.refresh.substring(0, 15)}...`);
    } else {
      setTokenInfo('❌ No authentication tokens found. You should be redirected to login page.');
    }
  }, []);
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Authentication Test Page</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Token Status</h2>
        <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap">
          {tokenInfo}
        </pre>
      </div>
      
      <div className="flex space-x-4">
        <Link 
          href="/" 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go to Dashboard Home
        </Link>
        
        <button
          onClick={() => {
            localStorage.clear();
            document.cookie.split(";").forEach(function(c) {
              document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });
            alert('All storage cleared! Refresh the page to test authentication.');
          }}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Clear All Storage
        </button>
      </div>
    </div>
  );
} 