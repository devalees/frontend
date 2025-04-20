import { describe, it, expect } from 'vitest';
import { 
  createUserFixture, 
  createAdminFixture, 
  createTodoFixture, 
  createTodosFixture,
  createProjectFixture,
  createPaginatedResponse,
  createErrorResponse
} from './fixtures';

describe('Test Fixtures', () => {
  describe('User Fixtures', () => {
    it('should create a user fixture with default values', () => {
      const user = createUserFixture();
      
      expect(user).toEqual(expect.objectContaining({
        id: expect.any(String),
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        createdAt: expect.any(String)
      }));
    });
    
    it('should create a user fixture with custom values', () => {
      const user = createUserFixture({ 
        name: 'Custom User', 
        email: 'custom@example.com' 
      });
      
      expect(user).toEqual(expect.objectContaining({
        id: expect.any(String),
        name: 'Custom User',
        email: 'custom@example.com',
        role: 'user',
        createdAt: expect.any(String)
      }));
    });
    
    it('should create an admin fixture', () => {
      const admin = createAdminFixture();
      
      expect(admin).toEqual(expect.objectContaining({
        id: expect.any(String),
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        createdAt: expect.any(String)
      }));
    });
  });
  
  describe('Todo Fixtures', () => {
    it('should create a todo fixture with default values', () => {
      const todo = createTodoFixture();
      
      expect(todo).toEqual(expect.objectContaining({
        id: expect.any(String),
        title: 'Test Todo',
        completed: false,
        createdAt: expect.any(String)
      }));
    });
    
    it('should create a todo fixture with custom values', () => {
      const todo = createTodoFixture({ 
        title: 'Custom Todo', 
        completed: true 
      });
      
      expect(todo).toEqual(expect.objectContaining({
        id: expect.any(String),
        title: 'Custom Todo',
        completed: true,
        createdAt: expect.any(String)
      }));
    });
    
    it('should create multiple todo fixtures', () => {
      const todos = createTodosFixture(3);
      
      expect(todos).toHaveLength(3);
      expect(todos[0].title).toBe('Test Todo 1');
      expect(todos[1].title).toBe('Test Todo 2');
      expect(todos[2].title).toBe('Test Todo 3');
    });
  });
  
  describe('Project Fixtures', () => {
    it('should create a project fixture with default values', () => {
      const project = createProjectFixture();
      
      expect(project).toEqual(expect.objectContaining({
        id: expect.any(String),
        name: 'Test Project',
        description: 'A test project description',
        ownerId: expect.any(String),
        members: expect.arrayContaining([expect.any(String)]),
        createdAt: expect.any(String)
      }));
      
      expect(project.members).toHaveLength(2);
    });
    
    it('should create a project fixture with custom values', () => {
      const project = createProjectFixture({ 
        name: 'Custom Project', 
        description: 'Custom description' 
      });
      
      expect(project).toEqual(expect.objectContaining({
        id: expect.any(String),
        name: 'Custom Project',
        description: 'Custom description',
        ownerId: expect.any(String),
        members: expect.arrayContaining([expect.any(String)]),
        createdAt: expect.any(String)
      }));
    });
  });
  
  describe('API Response Fixtures', () => {
    it('should create a paginated response', () => {
      const todos = createTodosFixture(2);
      const response = createPaginatedResponse(todos, 2, 20, 50);
      
      expect(response).toEqual({
        data: todos,
        pagination: {
          page: 2,
          limit: 20,
          total: 50,
          totalPages: 3
        }
      });
    });
    
    it('should create an error response', () => {
      const error = createErrorResponse(
        'Custom error message', 
        'VALIDATION_ERROR', 
        400
      );
      
      expect(error).toEqual({
        error: {
          message: 'Custom error message',
          code: 'VALIDATION_ERROR',
          status: 400
        }
      });
    });
    
    it('should create an error response with default values', () => {
      const error = createErrorResponse();
      
      expect(error).toEqual({
        error: {
          message: 'An error occurred',
          code: 'INTERNAL_SERVER_ERROR',
          status: 500
        }
      });
    });
  });
}); 