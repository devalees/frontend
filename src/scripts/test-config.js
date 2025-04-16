/**
 * API Environment Configuration Test Script
 */

// Mock environment variables for our test
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Simple mock for the environment config
function getEnvironmentConfig() {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isTest = process.env.NODE_ENV === 'test';
  const isProd = !isDevelopment && !isTest;
  
  const config = {
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/',
    timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000', 10),
    debug: isDevelopment || isTest,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  if (isDevelopment) {
    config.validateStatus = (status) => status < 500;
  }
  
  if (isProd) {
    config.retry = true;
    config.retryDelay = 1000;
    config.maxRetries = 3;
  }
  
  return config;
}

/**
 * Tests the environment configuration
 */
function testEnvironmentConfig() {
  console.log('===== API ENVIRONMENT CONFIGURATION TEST =====');
  
  // Get current environment
  console.log(`Current NODE_ENV: ${process.env.NODE_ENV}`);
  
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
  
  console.log('\n=== TEST COMPLETED ===');
}

// Run the test
testEnvironmentConfig();

// Test development environment
console.log('\n\n===== TESTING DEVELOPMENT ENVIRONMENT =====');
process.env.NODE_ENV = 'development';
testEnvironmentConfig();

// Test production environment
console.log('\n\n===== TESTING PRODUCTION ENVIRONMENT =====');
process.env.NODE_ENV = 'production';
testEnvironmentConfig();

// Test with custom URL
console.log('\n\n===== TESTING WITH CUSTOM URL =====');
process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com';
testEnvironmentConfig(); 