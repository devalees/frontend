'use client';

import { useState } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import ChangePasswordForm from '@/components/features/auth/ChangePasswordForm';
import { getTokens } from '@/lib/features/auth/token';

export default function DebugChangePasswordPage() {
  const { changePassword, isLoading, error } = useUserProfile();
  const [tokenInfo, setTokenInfo] = useState<string>('');

  const checkTokens = () => {
    const tokens = getTokens();
    setTokenInfo(
      tokens 
        ? `Access token: ${tokens.access.substring(0, 20)}...\nRefresh token: ${tokens.refresh.substring(0, 20)}...`
        : 'No tokens found'
    );
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Debug: Change Password</h1>
      
      <div className="mb-6">
        <h2 className="text-xl mb-2">Authentication Status</h2>
        <button 
          onClick={checkTokens}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2"
        >
          Check Token Status
        </button>
        
        {tokenInfo && (
          <pre className="bg-gray-100 p-3 rounded whitespace-pre-wrap">
            {tokenInfo}
          </pre>
        )}
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>Hook Error: {error.message}</p>
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <ChangePasswordForm 
          onChangePassword={changePassword}
          loading={isLoading}
        />
      </div>
    </div>
  );
} 