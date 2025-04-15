/**
 * Environment configuration and validation
 */

// Define required environment variables
const requiredEnvVars = [
  'VITE_APP_NAME',
  'VITE_API_URL',
  'REQUIRED_API_KEY',
  'REQUIRED_SECRET'
];

/**
 * Validates that all required environment variables are present
 * @returns {boolean} True if all required variables are present
 */
const validateEnv = (): boolean => {
  const missingVars = requiredEnvVars.filter(
    (envVar) => !import.meta.env[envVar]
  );

  if (missingVars.length > 0) {
    console.error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
    return false;
  }

  return true;
};

/**
 * Get environment configuration
 * @returns {Object} Environment configuration
 */
const getEnvConfig = () => {
  return {
    appName: import.meta.env.VITE_APP_NAME,
    apiUrl: import.meta.env.VITE_API_URL,
    nodeEnv: import.meta.env.NODE_ENV,
    isDevelopment: import.meta.env.NODE_ENV === 'development',
    isProduction: import.meta.env.NODE_ENV === 'production',
  };
};

// Export the validate function for use in other modules
export default {
  validate: validateEnv,
  getConfig: getEnvConfig,
}; 