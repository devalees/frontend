/**
 * Test fixtures for generating consistent test data
 * 
 * This file contains factory functions for creating test data used across tests.
 * Using these fixtures ensures consistency and reduces duplication in tests.
 */

import { nanoid } from 'nanoid';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  createdAt: string;
}

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  userId?: string;
  createdAt: string;
  updatedAt?: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  members: string[];
  createdAt: string;
  updatedAt?: string;
}

interface Route {
  path: string;
  title: string;
  component: string;
}

interface Chunk {
  id: string;
  name: string;
  path: string;
  size: number;
}

interface PerformanceMetrics {
  startTime: number;
  duration: number;
  transferSize: number;
  decodedBodySize: number;
  encodedBodySize: number;
}

/**
 * Creates a user fixture with default or custom values
 */
export function createUserFixture(overrides: Partial<User> = {}): User {
  return {
    id: nanoid(),
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    createdAt: new Date().toISOString(),
    ...overrides
  };
}

/**
 * Creates an admin user fixture
 */
export function createAdminFixture(overrides: Partial<User> = {}): User {
  return createUserFixture({
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    ...overrides
  });
}

/**
 * Creates a todo fixture with default or custom values
 */
export function createTodoFixture(overrides: Partial<Todo> = {}): Todo {
  return {
    id: nanoid(),
    title: 'Test Todo',
    completed: false,
    createdAt: new Date().toISOString(),
    ...overrides
  };
}

/**
 * Creates multiple todo fixtures
 */
export function createTodosFixture(count: number, overrides: Partial<Todo> = {}): Todo[] {
  return Array.from({ length: count }, (_, index) => 
    createTodoFixture({ 
      title: `Test Todo ${index + 1}`,
      ...overrides 
    })
  );
}

/**
 * Creates a project fixture with default or custom values
 */
export function createProjectFixture(overrides: Partial<Project> = {}): Project {
  return {
    id: nanoid(),
    name: 'Test Project',
    description: 'A test project description',
    ownerId: nanoid(),
    members: [nanoid(), nanoid()],
    createdAt: new Date().toISOString(),
    ...overrides
  };
}

/**
 * Creates mock API response data with pagination
 */
export function createPaginatedResponse<T>(
  data: T[],
  page = 1,
  limit = 10,
  total = 100
) {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

/**
 * Creates a mock API error response
 */
export function createErrorResponse(
  message = 'An error occurred',
  code = 'INTERNAL_SERVER_ERROR',
  status = 500
) {
  return {
    error: {
      message,
      code,
      status
    }
  };
}

/**
 * Creates a route fixture with default or custom values
 */
export function createRouteFixture(overrides: Partial<Route> = {}): Route {
  return {
    path: '/test-route',
    title: 'Test Route',
    component: 'TestComponent',
    ...overrides
  };
}

/**
 * Creates a chunk fixture with default or custom values
 */
export function createChunkFixture(overrides: Partial<Chunk> = {}): Chunk {
  return {
    id: nanoid(),
    name: 'test-chunk',
    path: '/chunks/test-chunk.js',
    size: 1024,
    ...overrides
  };
}

/**
 * Creates performance metrics fixture with default or custom values
 */
export function createPerformanceMetrics(overrides: Partial<PerformanceMetrics> = {}): PerformanceMetrics {
  return {
    startTime: Date.now(),
    duration: 100,
    transferSize: 1024,
    decodedBodySize: 2048,
    encodedBodySize: 1024,
    ...overrides
  };
} 