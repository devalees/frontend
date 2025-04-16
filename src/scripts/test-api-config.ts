/**
 * API Environment Configuration Test Script
 * 
 * This script demonstrates how the environment-based API configuration works across
 * different environments.
 * 
 * Usage:
 * - Development: NODE_ENV=development ts-node test-api-config.ts
 * - Production: NODE_ENV=production ts-node test-api-config.ts
 * - With custom URL: NEXT_PUBLIC_API_URL=https://api.example.com NODE_ENV=production ts-node test-api-config.ts
 */

import { getEnvironmentConfig, createAxiosInstance } from '../lib/api/axiosConfig';

/**
 * Tests the environment configuration
 */
function testEnvironmentConfig() {
  console.log('===== API ENVIRONMENT CONFIGURATION TEST =====');
  
  // Get current environment
  const nodeEnv = process.env.NODE_ENV || 'development';
  console.log(`Current NODE_ENV: ${nodeEnv}`);
  
  // Get environment configuration
  const config = getEnvironmentConfig();
  console.log('\nEnvironment Configuration:');
  console.log('----------------------------');
  console.log(`Base URL: ${config.baseURL}`);
  console.log(`Timeout: ${config.timeout}ms`);
  console.log(`Debug Mode: ${config.debug ? 'Enabled' : 'Disabled'}`);
  
  // Additional environment-specific settings
  console.log('\nAdditional Settings:');
  console.log('----------------------------');
  
  if (config.validateStatus) {
    console.log('Custom Validation Status: Yes (Accepting status < 500)');
  } else {
    console.log('Custom Validation Status: No (Default behavior)');
  }
  
  if (config.retry) {
    console.log(`Retry Enabled: Yes (Max attempts: ${config.maxRetries}, Delay: ${config.retryDelay}ms)`);
  } else {
    console.log('Retry Enabled: No');
  }
  
  // Create an axios instance with the environment config
  const instance = createAxiosInstance();
  console.log('\nAxios Instance Created:');
  console.log('----------------------------');
  console.log('Instance is ready for API requests.');
  
  // Test with custom configuration
  console.log('\nCustom Configuration Example:');
  console.log('----------------------------');
  const customInstance = createAxiosInstance('https://custom-api.example.com', {
    timeout: 5000,
    withCredentials: true
  });
  console.log('Custom instance created with:');
  console.log('- Base URL: https://custom-api.example.com');
  console.log('- Timeout: 5000ms');
  console.log('- With Credentials: Yes');
  
  console.log('\n=== TEST COMPLETED ===');
}

// Run the test
testEnvironmentConfig(); 