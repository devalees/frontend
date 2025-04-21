'use client';

import { useState, useEffect } from 'react';
import { getTokens, getAccessToken, getRefreshToken, AuthTokens } from '@/lib/features/auth/token';
import axios from '@/lib/api/axiosConfig';

export default function AuthTestPage() {
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiError, setApiError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Set isClient to true when component mounts (client-side only)
    setIsClient(true);
    
    // Get tokens when component mounts (client-side only)
    const currentTokens = getTokens();
    setTokens(currentTokens);
    
    // Get individual tokens
    setAccessToken(getAccessToken());
    setRefreshToken(getRefreshToken());
  }, []);

  const testAuth = async () => {
    setIsLoading(true);
    setApiResponse(null);
    setApiError(null);

    try {
      // Make a test API call that requires authentication
      const response = await axios.get('/api/v1/users/');
      console.log('API response:', response);
      setApiResponse(response.data);
    } catch (error: any) {
      console.error('API error:', error);
      setApiError(error.response ? error.response.data : error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTokenData = (token: string | null) => {
    if (!token) return 'No token';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        exp: new Date(payload.exp * 1000).toLocaleString(),
        iat: new Date(payload.iat * 1000).toLocaleString(),
        user_id: payload.user_id,
        ...payload
      };
    } catch (e) {
      return 'Invalid token format';
    }
  };

  // Only render token information if we're on the client
  if (!isClient) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Auth Debug Page</h1>
        <p>Loading authentication information...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Auth Debug Page</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="text-lg font-semibold mb-2">Authentication Status</h2>
        <p><strong>Is Authenticated:</strong> {tokens ? 'Yes' : 'No'}</p>
      </div>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="text-lg font-semibold mb-2">Token Information</h2>
        <div className="mb-2">
          <h3 className="font-medium">Access Token:</h3>
          <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-40">
            {accessToken ? accessToken.substring(0, 20) + '...' : 'No token'}
          </pre>
          <h4 className="mt-2">Decoded:</h4>
          <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-40">
            {JSON.stringify(formatTokenData(accessToken), null, 2)}
          </pre>
        </div>
        <div>
          <h3 className="font-medium">Refresh Token:</h3>
          <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-40">
            {refreshToken ? refreshToken.substring(0, 20) + '...' : 'No token'}
          </pre>
        </div>
      </div>
      
      <div className="mb-4">
        <button 
          onClick={testAuth}
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {isLoading ? 'Testing...' : 'Test Authentication'}
        </button>
      </div>
      
      {apiResponse && (
        <div className="bg-green-100 p-4 rounded mb-4">
          <h2 className="text-lg font-semibold mb-2">API Response</h2>
          <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-60">
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
        </div>
      )}
      
      {apiError && (
        <div className="bg-red-100 p-4 rounded mb-4">
          <h2 className="text-lg font-semibold mb-2">API Error</h2>
          <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-60">
            {JSON.stringify(apiError, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 