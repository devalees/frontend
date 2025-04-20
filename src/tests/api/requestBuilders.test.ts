/**
 * Request Builders Tests
 * 
 * This file contains tests for the API request builders including:
 * - Request creation
 * - Parameter handling
 * - Input validation
 */

import { jest } from "@jest/globals";

// Mock axios needs to be before other imports
jest.mock('axios', () => {
  const mockRequest = jest.fn().mockImplementation((config) => {
    // Return a mock response
    return Promise.resolve({
      data: { success: true, ...config },
      status: 200,
      statusText: 'OK',
      headers: {},
      config
    });
  });
  
  return {
    request: mockRequest,
    default: {
      request: mockRequest
    }
  };
});

import { describe, it, expect, beforeEach } from '../../tests/utils';
import axios from 'axios';

// These imports will fail as the implementation doesn't exist yet
// This is intentional to create failing tests as per the test-driven development approach
import { 
  createRequest, 
  buildUrlWithParams, 
  validateRequestParams,
  RequestMethod,
  RequestConfig
} from '../../lib/api/requestBuilders';

// Define test types for request parameters
interface TestUser {
  id: number;
  name: string;
  email: string;
}

interface TestParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

describe('API Request Builders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Request Creation', () => {
    it('should create a GET request with the correct configuration', async () => {
      // This test will fail until createRequest is implemented
      const endpoint = '/users';
      const request = createRequest<TestUser[]>({
        method: RequestMethod.GET,
        endpoint,
      });

      // Execute the request
      await request();

      // Verify axios was called with correct parameters
      expect(axios.request).toHaveBeenCalledWith({
        method: 'GET',
        url: endpoint,
      });
    });

    it('should create a POST request with data', async () => {
      // This test will fail until createRequest is implemented
      const endpoint = '/users';
      const userData = { name: 'Test User', email: 'test@example.com' };
      
      const request = createRequest<TestUser, Omit<TestUser, 'id'>>({
        method: RequestMethod.POST,
        endpoint,
      });

      // Execute the request with data
      await request(userData);

      // Verify axios was called with correct parameters
      expect(axios.request).toHaveBeenCalledWith({
        method: 'POST',
        url: endpoint,
        data: userData,
      });
    });

    it('should create a PUT request with an ID and data', async () => {
      // This test will fail until createRequest is implemented
      const userId = 123;
      const endpoint = `/users/${userId}`;
      const userData = { name: 'Updated User', email: 'updated@example.com' };
      
      const request = createRequest<TestUser, Partial<Omit<TestUser, 'id'>>>({
        method: RequestMethod.PUT,
        endpoint,
      });

      // Execute the request with data
      await request(userData);

      // Verify axios was called with correct parameters
      expect(axios.request).toHaveBeenCalledWith({
        method: 'PUT',
        url: endpoint,
        data: userData,
      });
    });

    it('should create a DELETE request with an ID', async () => {
      // This test will fail until createRequest is implemented
      const userId = 123;
      const endpoint = `/users/${userId}`;
      
      const request = createRequest<void>({
        method: RequestMethod.DELETE,
        endpoint,
      });

      // Execute the request
      await request();

      // Verify axios was called with correct parameters
      expect(axios.request).toHaveBeenCalledWith({
        method: 'DELETE',
        url: endpoint,
      });
    });

    it('should support custom headers in the request', async () => {
      // This test will fail until createRequest is implemented
      const endpoint = '/users';
      const headers = {
        'Custom-Header': 'custom-value',
        'X-API-Version': '1.0'
      };
      
      const request = createRequest<TestUser[]>({
        method: RequestMethod.GET,
        endpoint,
        headers,
      });

      // Execute the request
      await request();

      // Verify axios was called with correct parameters
      expect(axios.request).toHaveBeenCalledWith({
        method: 'GET',
        url: endpoint,
        headers,
      });
    });
  });

  describe('Parameter Handling', () => {
    it('should correctly append query parameters to the URL', () => {
      // This test will fail until buildUrlWithParams is implemented
      const baseUrl = '/users';
      const params: TestParams = {
        page: 1,
        limit: 10,
        sortBy: 'name',
        order: 'asc'
      };

      const url = buildUrlWithParams(baseUrl, params);
      expect(url).toBe('/users?page=1&limit=10&sortBy=name&order=asc');
    });

    it('should handle empty parameters object', () => {
      // This test will fail until buildUrlWithParams is implemented
      const baseUrl = '/users';
      const params = {};

      const url = buildUrlWithParams(baseUrl, params);
      expect(url).toBe('/users');
    });

    it('should handle URLs with existing query parameters', () => {
      // This test will fail until buildUrlWithParams is implemented
      const baseUrl = '/users?role=admin';
      const params: TestParams = {
        page: 1,
        limit: 10
      };

      const url = buildUrlWithParams(baseUrl, params);
      expect(url).toBe('/users?role=admin&page=1&limit=10');
    });

    it('should correctly encode parameter values', () => {
      // This test will fail until buildUrlWithParams is implemented
      const baseUrl = '/search';
      const params = {
        query: 'test user&name',
        category: 'products+services'
      };

      const url = buildUrlWithParams(baseUrl, params);
      // Updated expectation to match URL class encoding (+ for spaces)
      expect(url).toBe('/search?query=test+user%26name&category=products%2Bservices');
    });

    it('should support array parameters', () => {
      // This test will fail until buildUrlWithParams is implemented
      const baseUrl = '/users';
      const params = {
        ids: [1, 2, 3],
        tags: ['admin', 'manager']
      };

      const url = buildUrlWithParams(baseUrl, params);
      expect(url).toBe('/users?ids=1&ids=2&ids=3&tags=admin&tags=manager');
    });
  });

  describe('Validation', () => {
    it('should validate required parameters', () => {
      // This test will fail until validateRequestParams is implemented
      const params = {
        userId: 123,
        name: 'Test User'
      };
      
      const requiredParams = ['userId', 'name', 'email'];
      
      // Should throw because 'email' is missing
      expect(() => {
        validateRequestParams(params, requiredParams);
      }).toThrow('Missing required parameter: email');
    });

    it('should pass validation when all required parameters are present', () => {
      // This test will fail until validateRequestParams is implemented
      const params = {
        userId: 123,
        name: 'Test User',
        email: 'test@example.com'
      };
      
      const requiredParams = ['userId', 'name', 'email'];
      
      // Should not throw
      expect(() => {
        validateRequestParams(params, requiredParams);
      }).not.toThrow();
    });

    it('should validate parameter types', () => {
      // This test will fail until validateRequestParams is implemented
      const params = {
        userId: '123', // Should be a number
        name: 'Test User',
        email: 'test@example.com'
      };
      
      const paramTypes = {
        userId: 'number',
        name: 'string',
        email: 'string'
      };
      
      // Should throw because 'userId' is a string, not a number
      expect(() => {
        validateRequestParams(params, Object.keys(paramTypes), paramTypes);
      }).toThrow('Parameter userId should be of type number');
    });

    it('should validate parameter formats', () => {
      // This test will fail until validateRequestParams is implemented
      const params = {
        userId: 123,
        name: 'Test User',
        email: 'invalid-email' // Invalid email format
      };
      
      const paramFormats = {
        email: {
          type: 'string',
          format: 'email'
        }
      };
      
      // Should throw because 'email' has invalid format
      expect(() => {
        validateRequestParams(params, Object.keys(params), undefined, paramFormats);
      }).toThrow('Parameter email should match format email');
    });

    it('should pass validation when parameter formats are valid', () => {
      // This test will fail until validateRequestParams is implemented
      const params = {
        userId: 123,
        name: 'Test User',
        email: 'test@example.com' // Valid email format
      };
      
      const paramFormats = {
        email: {
          type: 'string',
          format: 'email'
        }
      };
      
      // Should not throw
      expect(() => {
        validateRequestParams(params, Object.keys(params), undefined, paramFormats);
      }).not.toThrow();
    });
  });
}); 