import React, { useState } from 'react';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { useStore } from '../../../lib/store';
import { LoginCredentials, AuthSlice } from '../../../lib/store/slices/authSlice';

interface LoginFormProps {
  onSuccess?: () => void;
  className?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ 
  onSuccess,
  className = '',
}) => {
  // Get auth methods from store with proper typing
  const { login, authState } = useStore() as AuthSlice;
  
  // Local form state
  const [loginMethod, setLoginMethod] = useState<'username' | 'email'>('email');
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    general?: string;
  }>({});

  // Loading state from the auth slice
  const isLoading = authState.status === 'loading';
  
  // Toggle between username and email login
  const toggleLoginMethod = () => {
    const newMethod = loginMethod === 'username' ? 'email' : 'username';
    setLoginMethod(newMethod);
    
    // Reset form data and errors for the changed field
    setFormData(prev => ({
      ...prev,
      username: newMethod === 'username' ? '' : undefined,
      email: newMethod === 'email' ? '' : undefined,
    }));
    setErrors(prev => {
      const { [loginMethod]: _, ...rest } = prev;
      return rest;
    });
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    
    if (loginMethod === 'username' && !formData.username?.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (loginMethod === 'email') {
      if (!formData.email?.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }
    
    if (!formData.password?.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear general error
    setErrors(prev => ({ ...prev, general: undefined }));
    
    if (!validateForm()) return;
    
    try {
      // Prepare credentials based on login method
      const credentials: LoginCredentials = {
        password: formData.password,
      };

      if (loginMethod === 'username') {
        credentials.username = formData.username;
      } else {
        credentials.email = formData.email;
      }
      
      // Attempt login
      await login(credentials);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Handle login error
      setErrors(prev => ({ 
        ...prev, 
        general: error instanceof Error 
          ? error.message 
          : 'Login failed. Please check your credentials and try again.'
      }));
    }
  };

  // This handles the submit button click
  const handleButtonClick = () => {
    // The form's onSubmit will be triggered by the button click
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Login method toggle */}
        <div className="text-sm text-right">
          <button 
            type="button"
            onClick={toggleLoginMethod}
            className="text-primary-600 hover:text-primary-500 font-medium"
          >
            Use {loginMethod === 'username' ? 'Email' : 'Username'} Instead
          </button>
        </div>
        
        {/* Username or Email field */}
        {loginMethod === 'username' ? (
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <Input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              value={formData.username || ''}
              onChange={handleChange}
              error={!!errors.username}
              errorMessage={errors.username}
              aria-label="Username"
              disabled={isLoading}
              required
            />
          </div>
        ) : (
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email || ''}
              onChange={handleChange}
              error={!!errors.email}
              errorMessage={errors.email}
              aria-label="Email"
              disabled={isLoading}
              required
            />
          </div>
        )}
        
        {/* Password field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={formData.password || ''}
            onChange={handleChange}
            error={!!errors.password}
            errorMessage={errors.password}
            aria-label="Password"
            disabled={isLoading}
            required
          />
        </div>
        
        {/* General error message */}
        {errors.general && (
          <div className="text-sm text-red-600" role="alert">
            {errors.general}
          </div>
        )}
        
        {/* Submit button */}
        <div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm; 