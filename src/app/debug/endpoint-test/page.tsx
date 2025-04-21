'use client';

import { useState } from 'react';
import axios from '@/lib/api/axiosConfig';

export default function EndpointTestPage() {
  const [url, setUrl] = useState('/api/v1/users/change-password/');
  const [method, setMethod] = useState('POST');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [payload, setPayload] = useState(JSON.stringify({
    current_password: 'currentpassword',
    new_password: 'newpassword123',
    confirm_password: 'newpassword123'
  }, null, 2));

  const testEndpoint = async () => {
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      // Get token directly from localStorage
      const token = localStorage.getItem('auth_access_token');
      if (!token) {
        throw new Error('No authentication token found in localStorage');
      }

      // Prepare headers
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Parse payload
      let parsedPayload;
      try {
        parsedPayload = JSON.parse(payload);
      } catch (e) {
        throw new Error('Invalid JSON payload');
      }

      // Make the request based on selected method
      let response;
      switch (method) {
        case 'GET':
          response = await axios.get(url, { headers });
          break;
        case 'POST':
          response = await axios.post(url, parsedPayload, { headers });
          break;
        case 'PUT':
          response = await axios.put(url, parsedPayload, { headers });
          break;
        case 'PATCH':
          response = await axios.patch(url, parsedPayload, { headers });
          break;
        case 'DELETE':
          response = await axios.delete(url, { headers });
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      setResult({
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });
    } catch (err: any) {
      console.error('API request failed:', err);
      setError(
        err.response 
          ? `${err.response.status} ${err.response.statusText}: ${JSON.stringify(err.response.data)}` 
          : err.message
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">API Endpoint Test</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Endpoint URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">HTTP Method</label>
            <select 
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Payload (JSON)</label>
          <textarea
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            rows={8}
            className="w-full p-2 border rounded font-mono text-sm"
          />
        </div>
        
        <button
          onClick={testEndpoint}
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {isLoading ? 'Testing...' : 'Test Endpoint'}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      {result && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Response (Status: {result.status} {result.statusText})</p>
          <pre className="mt-2 bg-white p-3 rounded overflow-auto max-h-96">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
        <p className="font-bold">Suggested endpoints to try:</p>
        <ul className="list-disc list-inside mt-2">
          <li>/api/v1/users/change-password/</li>
          <li>/api/v1/users/1/change-password/</li>
          <li>/api/v1/users/change_password/</li>
          <li>/api/v1/users/password-change/</li>
        </ul>
      </div>
    </div>
  );
} 