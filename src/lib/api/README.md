# API Infrastructure

This directory contains the infrastructure for making API requests and managing real-time communication with the backend.

## Components

The API infrastructure consists of several key components:

### Axios Configuration (`axiosConfig.ts`)

This module provides environment-based configuration for HTTP requests using Axios.

- **Environment-based settings**: Automatically adapts based on development, test, or production environments
- **Interceptors**: Handles authentication tokens, request logging, and error responses
- **Custom instances**: Support for creating custom Axios instances with specific configurations

[Detailed documentation](../../../@docs/architecture/03-api/environment-config.md)

### Error Handling (`errors.ts` & `errorHandling.ts`)

A comprehensive error handling system with type-safe error classes and formatting utilities.

- **Error hierarchy**: Specific error types for different scenarios (network, validation, authentication)
- **Error formatting**: Standardized error output for consistent error handling
- **Error logging**: Detailed logging with appropriate severity levels

### Request Builders (`requestBuilders.ts`)

Utilities for building type-safe API requests with parameter validation.

- **Request creation**: Functions to create typed request functions
- **URL parameter handling**: Support for query parameters and path variables
- **Input validation**: Type checking and format validation for request parameters

### Response Handlers (`responseHandlers.ts`)

Tools for processing API responses with type safety and error handling.

- **Response parsing**: Extract data from structured API responses
- **Data transformation**: Transform API data into application models
- **Error conversion**: Convert HTTP errors to application-specific errors

### WebSocket Support (`socketClient.ts`)

Real-time communication infrastructure using Socket.io.

- **Connection management**: Automatic reconnection and event handling
- **Type-safe events**: Strongly typed event emission and listening
- **Error recovery**: Resilient handling of connection issues

### Real-time Updates (`realtimeUpdates.ts`)

Integration between WebSockets and application state management.

- **Store synchronization**: Keep client state in sync with server updates
- **Event handling**: Process real-time events and update UI accordingly
- **Error handling**: Graceful handling of synchronization failures

## Usage Examples

### Basic HTTP Request

```typescript
import axiosInstance from 'lib/api/axiosConfig';

// Make a simple GET request
const fetchUsers = async () => {
  try {
    const response = await axiosInstance.get('/users');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw error;
  }
};
```

### Creating a Type-Safe API Client

```typescript
import { createRequest, RequestMethod } from 'lib/api/requestBuilders';
import { parseResponse } from 'lib/api/responseHandlers';

interface User {
  id: string;
  name: string;
  email: string;
}

// Create a type-safe request function
const getUserById = createRequest<User, { id: string }>({
  method: RequestMethod.GET,
  endpoint: '/users/:id'
});

// Use the typed request function
const fetchUser = async (id: string) => {
  try {
    const user = await getUserById({ id });
    return user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
};
```

### WebSocket Real-time Updates

```typescript
import { createSocketClient } from 'lib/api/socketClient';
import { createRealtimeUpdates } from 'lib/api/realtimeUpdates';
import { useStore } from 'store';

// Create WebSocket client
const socket = createSocketClient('wss://api.example.com');

// Set up real-time updates
const realtimeHandler = createRealtimeUpdates(
  socket,
  useStore.getState(),
  { autoSubscribe: true }
);

// Connect to the server
socket.connect()
  .then(() => console.log('Connected to real-time updates'))
  .catch(error => console.error('Failed to connect:', error));
```

## Environment Configuration

The API infrastructure supports environment-specific configuration through environment variables:

- `NEXT_PUBLIC_API_URL`: Base URL for API requests
- `NEXT_PUBLIC_API_TIMEOUT`: Request timeout in milliseconds

See the [Environment Configuration Documentation](../../../@docs/architecture/03-api/environment-config.md) for details.

## Testing

Each component has corresponding test files in the `tests/api` directory that demonstrate usage patterns and verify functionality.

## Error Handling

The API infrastructure provides a comprehensive error handling system:

- Network errors are automatically retried in production
- Authentication errors trigger automatic logout
- All errors are formatted consistently for application-wide error handling

## Performance Considerations

- Requests are automatically cached where appropriate
- WebSocket connections use heartbeats to detect stale connections
- Response transformations are optimized for performance 