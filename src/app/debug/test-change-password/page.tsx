'use client';

import { useState } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { ChangePasswordRequest } from '@/lib/api/auth';
import { getTokens } from '@/lib/features/auth/token';

export default function TestChangePasswordPage() {
  const { changePassword } = useUserProfile();
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [useSimulation, setUseSimulation] = useState<boolean>(false);
  
  const [formData, setFormData] = useState<ChangePasswordRequest>({
    current_password: 'currentPassword123',
    new_password: 'newPassword123',
    confirm_password: 'newPassword123'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const checkTokens = () => {
    const tokens = getTokens();
    if (tokens) {
      setMessage(`Tokens found! Access token: ${tokens.access.substring(0, 15)}...`);
    } else {
      setMessage('No tokens found. Please log in first.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      await changePassword(formData, useSimulation);
      setMessage(`Password changed successfully using ${useSimulation ? 'simulation' : 'real API'}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Test Change Password</h1>
      
      <div className="mb-4">
        <button
          onClick={checkTokens}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
        >
          Check Tokens
        </button>
        
        <label className="ml-4 inline-flex items-center">
          <input
            type="checkbox"
            checked={useSimulation}
            onChange={() => setUseSimulation(!useSimulation)}
            className="form-checkbox h-5 w-5 text-blue-600"
          />
          <span className="ml-2">Use Simulation</span>
        </label>
      </div>
      
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Current Password</label>
          <input
            type="text" // Using text for debugging purposes
            name="current_password"
            value={formData.current_password}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">New Password</label>
          <input
            type="text" // Using text for debugging purposes
            name="new_password"
            value={formData.new_password}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Confirm New Password</label>
          <input
            type="text" // Using text for debugging purposes
            name="confirm_password"
            value={formData.confirm_password}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {isLoading ? 'Changing Password...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
} 