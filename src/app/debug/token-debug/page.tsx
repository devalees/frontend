'use client';

import { useState, useEffect } from 'react';

export default function TokenDebugPage() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Get tokens directly from localStorage
    const access = localStorage.getItem('auth_access_token');
    const refresh = localStorage.getItem('auth_refresh_token');
    
    setAccessToken(access);
    setRefreshToken(refresh);
  }, []);

  const checkTokens = () => {
    const access = localStorage.getItem('auth_access_token');
    const refresh = localStorage.getItem('auth_refresh_token');
    
    setAccessToken(access);
    setRefreshToken(refresh);
  };

  const decodeToken = (token: string | null) => {
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  };

  if (!isClient) {
    return <div>Loading token information...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Token Debug</h1>
      <button 
        onClick={checkTokens}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Refresh Token Info
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Access Token</h2>
          {accessToken ? (
            <>
              <div className="mb-2">
                <strong>Raw Token:</strong>
                <pre className="bg-gray-100 p-2 rounded text-xs mt-1 overflow-x-auto">
                  {accessToken}
                </pre>
              </div>
              <div>
                <strong>Decoded:</strong>
                <pre className="bg-gray-100 p-2 rounded text-xs mt-1 overflow-x-auto">
                  {JSON.stringify(decodeToken(accessToken), null, 2)}
                </pre>
              </div>
            </>
          ) : (
            <p className="text-red-500">No access token found in localStorage</p>
          )}
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Refresh Token</h2>
          {refreshToken ? (
            <>
              <div className="mb-2">
                <strong>Raw Token:</strong>
                <pre className="bg-gray-100 p-2 rounded text-xs mt-1 overflow-x-auto">
                  {refreshToken}
                </pre>
              </div>
              <div>
                <strong>Decoded:</strong>
                <pre className="bg-gray-100 p-2 rounded text-xs mt-1 overflow-x-auto">
                  {JSON.stringify(decodeToken(refreshToken), null, 2)}
                </pre>
              </div>
            </>
          ) : (
            <p className="text-red-500">No refresh token found in localStorage</p>
          )}
        </div>
      </div>
    </div>
  );
} 