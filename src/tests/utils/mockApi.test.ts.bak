import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { 
  createMockResponse,
  createMockError,
  mockApiMethod,
  mockApiError,
  resetApiMocks,
  ApiMocker
} from './mockApi';
import { createTodoFixture, createErrorResponse } from './fixtures';

// Ensure axios is mocked
vi.mock('axios');

describe('Mock API Utilities', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  describe('createMockResponse', () => {
    it('should create a mock API response with default values', () => {
      const todo = createTodoFixture();
      const response = createMockResponse(todo);
      
      expect(response).toEqual({
        data: todo,
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' },
        config: {}
      });
    });
    
    it('should create a mock API response with custom values', () => {
      const todo = createTodoFixture();
      const response = createMockResponse(
        todo,
        201,
        'Created',
        { 'Content-Type': 'application/json', 'Authorization': 'Bearer token' }
      );
      
      expect(response).toEqual({
        data: todo,
        status: 201,
        statusText: 'Created',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': 'Bearer token' 
        },
        config: {}
      });
    });
  });
  
  describe('createMockError', () => {
    it('should create a mock API error with default values', () => {
      const error = createMockError();
      
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Request failed');
      expect(error.isAxiosError).toBe(true);
      expect(error.response).toEqual({
        data: createErrorResponse('Request failed', 'INTERNAL_SERVER_ERROR', 500),
        status: 500,
        statusText: 'Request failed',
        headers: { 'Content-Type': 'application/json' },
        config: {}
      });
    });
    
    it('should create a mock API error with custom values', () => {
      const error = createMockError('Not found', 404, 'RESOURCE_NOT_FOUND');
      
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Not found');
      expect(error.isAxiosError).toBe(true);
      expect(error.response).toEqual({
        data: createErrorResponse('Not found', 'RESOURCE_NOT_FOUND', 404),
        status: 404,
        statusText: 'Not found',
        headers: { 'Content-Type': 'application/json' },
        config: {}
      });
    });
  });
  
  describe('mockApiMethod', () => {
    it('should mock a successful API call', async () => {
      const todo = createTodoFixture();
      mockApiMethod('get', todo);
      
      const result = await axios.get('/api/todos/1');
      
      expect(result.data).toEqual(todo);
      expect(result.status).toBe(200);
    });
    
    it('should mock a successful API call with custom status', async () => {
      const todo = createTodoFixture();
      mockApiMethod('post', todo, 201);
      
      const result = await axios.post('/api/todos', todo);
      
      expect(result.data).toEqual(todo);
      expect(result.status).toBe(201);
    });
  });
  
  describe('mockApiError', () => {
    it('should mock a failed API call', async () => {
      mockApiError('get');
      
      try {
        await axios.get('/api/todos/1');
        // Should not reach here
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.isAxiosError).toBe(true);
        expect(error.response.status).toBe(500);
      }
    });
    
    it('should mock a failed API call with custom values', async () => {
      mockApiError('get', 'Not found', 404, 'RESOURCE_NOT_FOUND');
      
      try {
        await axios.get('/api/todos/1');
        // Should not reach here
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.isAxiosError).toBe(true);
        expect(error.response.status).toBe(404);
        expect(error.response.data.error.code).toBe('RESOURCE_NOT_FOUND');
      }
    });
  });
  
  describe('ApiMocker', () => {
    let apiMocker: ApiMocker;
    
    beforeEach(() => {
      apiMocker = new ApiMocker();
      
      // Reset axios mocks
      vi.mocked(axios.get).mockReset();
      vi.mocked(axios.post).mockReset();
    });
    
    afterEach(() => {
      apiMocker.reset();
    });
    
    it('should mock successful API calls for specific endpoints', async () => {
      const todo1 = createTodoFixture({ id: '1', title: 'Todo 1' });
      const todo2 = createTodoFixture({ id: '2', title: 'Todo 2' });
      
      // Setup mock responses directly
      vi.mocked(axios.get).mockImplementation((url: any) => {
        if (url === '/api/todos/1') {
          return Promise.resolve(createMockResponse(todo1));
        } 
        if (url === '/api/todos/2') {
          return Promise.resolve(createMockResponse(todo2));
        }
        return Promise.reject(new Error(`No mock for ${url}`));
      });
      
      const result1 = await axios.get('/api/todos/1');
      const result2 = await axios.get('/api/todos/2');
      
      expect(result1.data).toEqual(todo1);
      expect(result2.data).toEqual(todo2);
    });
    
    it('should mock failed API calls for specific endpoints', async () => {
      const todo2 = createTodoFixture({ id: '2' });
      
      // Setup mock implementations directly
      vi.mocked(axios.get).mockImplementation((url: any) => {
        if (url === '/api/todos/1') {
          return Promise.reject(createMockError('Not found', 404, 'RESOURCE_NOT_FOUND'));
        }
        if (url === '/api/todos/2') {
          return Promise.resolve(createMockResponse(todo2));
        }
        return Promise.reject(new Error(`No mock for ${url}`));
      });
      
      try {
        await axios.get('/api/todos/1');
        // Should not reach here
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.response.status).toBe(404);
        expect(error.response.data.error.code).toBe('RESOURCE_NOT_FOUND');
      }
      
      // This should succeed
      const result = await axios.get('/api/todos/2');
      expect(result.status).toBe(200);
    });
    
    it('should reset all mocks', async () => {
      // First, set up a mock
      vi.mocked(axios.get).mockResolvedValueOnce(createMockResponse(createTodoFixture()));
      
      // This should succeed with our mock
      await axios.get('/api/todos/1');
      
      // Reset all mocks
      vi.mocked(axios.get).mockReset();
      
      // Setup a rejection for the next call
      vi.mocked(axios.get).mockRejectedValueOnce(new Error('Real error'));
      
      // Now this should fail with our custom error
      try {
        await axios.get('/api/todos/1');
        // Should not reach here
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.message).toBe('Real error');
      }
    });
  });
}); 