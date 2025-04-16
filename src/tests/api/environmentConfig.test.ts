/**
 * Environment-based Configuration Tests
 * 
 * This file contains tests for the environment-based configuration functionality:
 * - Environment detection
 * - Configuration adapting to different environments
 * - Environment variable usage
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getEnvironmentConfig } from '../../lib/api/axiosConfig';

// Save original process.env
const originalEnv = process.env;

describe('Environment-based Configuration', () => {
  beforeEach(() => {
    // Reset environment variables
    process.env = { ...originalEnv };
    
    // Reset any custom environment variables
    delete process.env.NEXT_PUBLIC_API_URL;
    delete process.env.NEXT_PUBLIC_API_TIMEOUT;
  });
  
  afterEach(() => {
    // Restore environment variables
    process.env = originalEnv;
  });

  it('should use default values when no environment variables are set', () => {
    const config = getEnvironmentConfig();
    
    expect(config.baseURL).toBe('http://localhost:8000/api/');
    expect(config.timeout).toBe(10000);
  });
  
  it('should use environment variables when provided', () => {
    // Set environment variables
    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com/';
    process.env.NEXT_PUBLIC_API_TIMEOUT = '5000';
    
    const config = getEnvironmentConfig();
    
    expect(config.baseURL).toBe('https://api.example.com/');
    expect(config.timeout).toBe(5000);
  });
  
  it('should enable debug mode in development environment', () => {
    // Set development environment
    process.env.NODE_ENV = 'development';
    
    const config = getEnvironmentConfig();
    
    expect(config.debug).toBe(true);
    expect(config.validateStatus).toBeDefined();
    expect(config.retry).toBeUndefined();
  });
  
  it('should enable retry in production environment', () => {
    // Set production environment
    process.env.NODE_ENV = 'production';
    
    const config = getEnvironmentConfig();
    
    expect(config.debug).toBe(false);
    expect(config.retry).toBe(true);
    expect(config.retryDelay).toBe(1000);
    expect(config.maxRetries).toBe(3);
  });
  
  it('should have consistent settings in test environment', () => {
    // Set test environment
    process.env.NODE_ENV = 'test';
    
    const config = getEnvironmentConfig();
    
    expect(config.debug).toBe(true);
    expect(config.timeout).toBe(10000); // Default timeout for tests
  });
  
  it('should include default Content-Type header', () => {
    const config = getEnvironmentConfig();
    
    expect(config.headers).toBeDefined();
    expect(config.headers?.['Content-Type']).toBe('application/json');
  });
  
  it('should allow timeout override in test environment', () => {
    // Set test environment
    process.env.NODE_ENV = 'test';
    process.env.NEXT_PUBLIC_API_TIMEOUT = '3000';
    
    const config = getEnvironmentConfig();
    
    expect(config.timeout).toBe(3000);
  });
}); 