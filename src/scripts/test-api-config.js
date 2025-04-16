"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var axiosConfig_1 = require("../lib/api/axiosConfig");
/**
 * Tests the environment configuration
 */
function testEnvironmentConfig() {
    console.log('===== API ENVIRONMENT CONFIGURATION TEST =====');
    // Get current environment
    var nodeEnv = process.env.NODE_ENV || 'development';
    console.log("Current NODE_ENV: ".concat(nodeEnv));
    // Get environment configuration
    var config = (0, axiosConfig_1.getEnvironmentConfig)();
    console.log('\nEnvironment Configuration:');
    console.log('----------------------------');
    console.log("Base URL: ".concat(config.baseURL));
    console.log("Timeout: ".concat(config.timeout, "ms"));
    console.log("Debug Mode: ".concat(config.debug ? 'Enabled' : 'Disabled'));
    // Additional environment-specific settings
    console.log('\nAdditional Settings:');
    console.log('----------------------------');
    if (config.validateStatus) {
        console.log('Custom Validation Status: Yes (Accepting status < 500)');
    }
    else {
        console.log('Custom Validation Status: No (Default behavior)');
    }
    if (config.retry) {
        console.log("Retry Enabled: Yes (Max attempts: ".concat(config.maxRetries, ", Delay: ").concat(config.retryDelay, "ms)"));
    }
    else {
        console.log('Retry Enabled: No');
    }
    // Create an axios instance with the environment config
    var instance = (0, axiosConfig_1.createAxiosInstance)();
    console.log('\nAxios Instance Created:');
    console.log('----------------------------');
    console.log('Instance is ready for API requests.');
    // Test with custom configuration
    console.log('\nCustom Configuration Example:');
    console.log('----------------------------');
    var customInstance = (0, axiosConfig_1.createAxiosInstance)('https://custom-api.example.com', {
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
