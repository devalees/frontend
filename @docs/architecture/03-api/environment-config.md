# Environment-Based API Configuration

## Overview

The API infrastructure has been enhanced with environment-based configuration to provide flexibility and adaptability across different deployment environments. This approach allows for seamless transitions between development, testing, staging, and production environments without code changes.

## Implementation

### Configuration Parameters

The configuration system supports the following environment variables:

| Environment Variable | Description | Default Value |
|----------------------|-------------|---------------|
| `NEXT_PUBLIC_API_URL` | Base URL for API requests | http://localhost:8000/api/ |
| `NEXT_PUBLIC_API_TIMEOUT` | Request timeout in milliseconds | 10000 (10 seconds) |

You can set these variables in your `.env` file:

```plaintext
# .env file
NEXT_PUBLIC_API_URL=https://api.example.com/
NEXT_PUBLIC_API_TIMEOUT=5000
```

Or set them at runtime for temporary configurations:

```bash
# Development with custom API URL
NEXT_PUBLIC_API_URL=https://staging-api.example.com/ npm run dev

# Production build with longer timeout
NEXT_PUBLIC_API_TIMEOUT=15000 npm run build
```

### Environment-Specific Settings

The system automatically applies different settings based on the current environment:

#### Development Environment (`NODE_ENV=development`)
- Debug logging enabled
- Relaxed validation status (accepts responses with status < 500)
- Detailed error reporting
- Verbose request/response logging

#### Test Environment (`NODE_ENV=test`)
- Debug logging enabled
- Default timeout settings (can be overridden with environment variables)
- Standard configurations for predictable test results
- Mocked responses in certain scenarios

#### Production Environment (Default)
- Debug logging disabled
- Request retry functionality enabled
- Built-in retry mechanisms with exponential backoff
- Optimized error handling
- Performance optimizations

### Configuration Hierarchy

The configuration system uses a priority-based approach:

1. Explicitly passed options (highest priority)
2. Environment variables
3. Environment-specific defaults
4. Global defaults (lowest priority)

This ensures maximum flexibility while maintaining sensible defaults.

## Usage

### Basic Usage

The environment configuration is automatically applied when creating an axios instance:

```typescript
import axiosInstance from '../../lib/api/axiosConfig';

// Use the configured instance
const response = await axiosInstance.get('/users');
```

### Custom Configuration

You can override the environment settings for specific use cases:

```typescript
import { createAxiosInstance } from '../../lib/api/axiosConfig';

// Create a custom instance with specific options
const customInstance = createAxiosInstance(
  'https://custom-api.example.com',
  { 
    timeout: 5000,
    withCredentials: true 
  }
);

// Use the custom instance
const response = await customInstance.get('/users');
```

### Environment Config Access

You can access the current environment configuration directly:

```typescript
import { getEnvironmentConfig } from '../../lib/api/axiosConfig';

const config = getEnvironmentConfig();
console.log(`Current API URL: ${config.baseURL}`);
console.log(`Debug mode: ${config.debug ? 'enabled' : 'disabled'}`);

// Check environment-specific features
if (config.debug) {
  console.log('Debug logging is enabled');
}

if (config.retry) {
  console.log(`Retry is enabled with ${config.maxRetries} maximum attempts`);
}
```

### Setting Default Headers

Add default headers to all requests in your configuration:

```typescript
// Configure defaults with custom headers
const envConfig = getEnvironmentConfig();
envConfig.headers = {
  ...envConfig.headers,
  'X-Custom-Header': 'custom-value',
  'X-App-Version': '1.0.0'
};

const instance = createAxiosInstance(undefined, { headers: envConfig.headers });
```

## Benefits

1. **Environment Adaptability**: Configuration automatically adjusts based on environment
2. **Centralized Settings**: Single source of truth for API configuration
3. **Simplified Testing**: Consistent test environment with overridable settings
4. **Enhanced Debugging**: Detailed request/response logging in development
5. **Production Optimizations**: Retry mechanisms and error handling for production
6. **Type Safety**: TypeScript interfaces ensure configuration type safety
7. **Flexible Override System**: Easily override settings at different levels

## Implementation Details

The environment configuration is implemented in `src/lib/api/axiosConfig.ts` and includes:

1. Environment detection logic
2. Default and environment-specific settings
3. Environment variable processing
4. Configuration interface with TypeScript type safety

### The EnvironmentConfig Interface

```typescript
export interface EnvironmentConfig {
  baseURL: string;
  timeout: number;
  debug: boolean;
  headers?: Record<string, string>;
  // Additional environment-specific properties
  validateStatus?: (status: number) => boolean;
  retry?: boolean;
  retryDelay?: number;
  maxRetries?: number;
  [key: string]: any;
}
```

## Testing

You can test the environment configuration with the provided test script:

```bash
# Test in development environment
NODE_ENV=development node src/scripts/test-config.js

# Test in production environment
NODE_ENV=production node src/scripts/test-config.js

# Test with custom settings
NEXT_PUBLIC_API_URL=https://api.example.com NODE_ENV=production node src/scripts/test-config.js
```

Additionally, there is a dedicated test file for verifying the environment configuration functionality:

```bash
# Run the environment configuration tests
npx vitest run src/tests/api/environmentConfig.test.ts
```

The test file verifies:
- Default configuration values
- Environment variable usage
- Environment-specific settings (development, test, production)
- Header configuration
- Timeout overrides

## Troubleshooting

### Common Issues

1. **Environment Variables Not Applied**
   - Ensure your environment variables are properly set
   - Next.js requires environment variables to be prefixed with `NEXT_PUBLIC_` to be available on the client side

2. **Timeout Issues**
   - Adjust `NEXT_PUBLIC_API_TIMEOUT` if requests are timing out
   - In development, consider using longer timeouts

3. **Production Configuration Issues**
   - Make sure `NODE_ENV=production` is set during build
   - Check that retry mechanisms are functioning correctly 