/**
 * Optimistic Updates Tests
 *
 * These tests verify the functionality of the optimistic updates system
 * for immediately reflecting changes in the UI while waiting for server confirmation.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from '../../tests/utils';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { createStore } from 'zustand/vanilla';

import { createOptimisticStore, OptimisticUpdater, OptimisticAction, OptimisticState } from '../../lib/api/optimisticUpdates';

// Interface for test entity
interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

// Define test optimistic actions
enum TodoAction {
  ADD = 'ADD_TODO',
  UPDATE = 'UPDATE_TODO',
  DELETE = 'DELETE_TODO',
}

// Mock axios
const mock = new MockAdapter(axios);

// Helper to create a test store
function createTestStore() {
  return createStore<OptimisticState<Todo>>(() => ({
    data: [],
    pending: [],
    error: null,
  }));
}

describe('Optimistic Updates', () => {
  let store: ReturnType<typeof createTestStore>;
  let updater: OptimisticUpdater<Todo>;
  
  beforeEach(() => {
    mock.reset();
    store = createTestStore();
    updater = createOptimisticStore(store, axios);
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  describe('Basic Optimistic Operations', () => {
    it('should immediately update the local state on optimistic add', async () => {
      // Setup
      const newTodo: Todo = { id: 'temp-1', title: 'New Todo', completed: false };
      const apiResponse: Todo = { ...newTodo, id: 'server-1' };
      
      // Configure mock
      mock.onPost('/todos').reply(200, apiResponse);
      
      // Test - optimistically add the todo
      const action: OptimisticAction<Todo> = {
        type: TodoAction.ADD,
        payload: newTodo,
        endpoint: '/todos',
        method: 'post',
        rollback: (state) => ({
          ...state,
          data: state.data.filter(item => item.id !== newTodo.id),
        }),
      };
      
      const promise = updater.execute(action);
      
      // Verify - todo should be added immediately
      expect(store.getState().data).toContainEqual(newTodo);
      expect(store.getState().pending.length).toBe(1);
      
      // Wait for server response
      await promise;
      
      // Verify - temp id should be replaced with server id
      expect(store.getState().data).not.toContainEqual(newTodo);
      expect(store.getState().data).toContainEqual(apiResponse);
      expect(store.getState().pending.length).toBe(0);
    });
    
    it('should immediately update the local state on optimistic update', async () => {
      // Setup
      const initialTodo: Todo = { id: 'server-1', title: 'Original Todo', completed: false };
      const updatedTodo: Todo = { ...initialTodo, completed: true };
      
      // Set initial state
      store.setState({
        data: [initialTodo],
        pending: [],
        error: null,
      });
      
      // Configure mock
      mock.onPut(`/todos/${initialTodo.id}`).reply(200, updatedTodo);
      
      // Test - optimistically update the todo
      const action: OptimisticAction<Todo> = {
        type: TodoAction.UPDATE,
        payload: updatedTodo,
        endpoint: `/todos/${initialTodo.id}`,
        method: 'put',
        rollback: (state) => ({
          ...state,
          data: state.data.map(item => 
            item.id === initialTodo.id ? initialTodo : item
          ),
        }),
      };
      
      const promise = updater.execute(action);
      
      // Verify - todo should be updated immediately
      expect(store.getState().data[0].completed).toBe(true);
      expect(store.getState().pending.length).toBe(1);
      
      // Wait for server response
      await promise;
      
      // Verify - update should be confirmed
      expect(store.getState().data[0].completed).toBe(true);
      expect(store.getState().pending.length).toBe(0);
    });
    
    it('should immediately update the local state on optimistic delete', async () => {
      // Setup
      const todo: Todo = { id: 'server-1', title: 'Todo to Delete', completed: false };
      
      // Set initial state
      store.setState({
        data: [todo],
        pending: [],
        error: null,
      });
      
      // Configure mock
      mock.onDelete(`/todos/${todo.id}`).reply(200);
      
      // Test - optimistically delete the todo
      const action: OptimisticAction<Todo> = {
        type: TodoAction.DELETE,
        payload: todo,
        endpoint: `/todos/${todo.id}`,
        method: 'delete',
        rollback: (state) => ({
          ...state,
          data: [...state.data, todo],
        }),
      };
      
      const promise = updater.execute(action);
      
      // Verify - todo should be removed immediately
      expect(store.getState().data.length).toBe(0);
      expect(store.getState().pending.length).toBe(1);
      
      // Wait for server response
      await promise;
      
      // Verify - todo should still be gone
      expect(store.getState().data.length).toBe(0);
      expect(store.getState().pending.length).toBe(0);
    });
  });
  
  describe('Error Handling and Rollback', () => {
    it('should rollback changes when the server returns an error', async () => {
      // Setup
      const todo: Todo = { id: 'server-1', title: 'Original Todo', completed: false };
      const updatedTodo: Todo = { ...todo, completed: true };
      
      // Set initial state
      store.setState({
        data: [todo],
        pending: [],
        error: null,
      });
      
      // Configure mock to return error
      mock.onPut(`/todos/${todo.id}`).reply(500, { message: 'Server error' });
      
      // Test - optimistically update the todo
      const action: OptimisticAction<Todo> = {
        type: TodoAction.UPDATE,
        payload: updatedTodo,
        endpoint: `/todos/${todo.id}`,
        method: 'put',
        rollback: (state) => ({
          ...state,
          data: state.data.map(item => 
            item.id === todo.id ? todo : item
          ),
        }),
      };
      
      // Execute action
      try {
        const promise = updater.execute(action);
        
        // Verify immediate update
        expect(store.getState().data[0].completed).toBe(true);
        
        // Wait for server response
        await promise;
        
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        // Verify rollback
        expect(store.getState().data[0].completed).toBe(false);
        expect(store.getState().pending.length).toBe(0);
        expect(store.getState().error).not.toBe(null);
      }
    });
    
    it('should handle network errors and rollback changes', async () => {
      // Setup
      const todo: Todo = { id: 'server-1', title: 'Original Todo', completed: false };
      const updatedTodo: Todo = { ...todo, completed: true };
      
      // Set initial state
      store.setState({
        data: [todo],
        pending: [],
        error: null,
      });
      
      // Configure mock to simulate network error
      mock.onPut(`/todos/${todo.id}`).networkError();
      
      // Test - optimistically update the todo
      const action: OptimisticAction<Todo> = {
        type: TodoAction.UPDATE,
        payload: updatedTodo,
        endpoint: `/todos/${todo.id}`,
        method: 'put',
        rollback: (state) => ({
          ...state,
          data: state.data.map(item => 
            item.id === todo.id ? todo : item
          ),
        }),
      };
      
      // Execute action
      try {
        const promise = updater.execute(action);
        
        // Verify immediate update
        expect(store.getState().data[0].completed).toBe(true);
        
        // Wait for server response
        await promise;
        
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        // Verify rollback
        expect(store.getState().data[0].completed).toBe(false);
        expect(store.getState().pending.length).toBe(0);
        expect(store.getState().error).not.toBe(null);
      }
    });
  });
  
  describe('Multiple Operations', () => {
    it('should handle multiple pending operations correctly', async () => {
      // Setup
      const todo1: Todo = { id: 'server-1', title: 'Todo 1', completed: false };
      const todo2: Todo = { id: 'server-2', title: 'Todo 2', completed: false };
      
      // Set initial state
      store.setState({
        data: [todo1, todo2],
        pending: [],
        error: null,
      });
      
      // Configure mocks
      const updatedTodo1: Todo = { ...todo1, completed: true };
      const updatedTodo2: Todo = { ...todo2, title: 'Updated Todo 2' };
      
      mock.onPut(`/todos/${todo1.id}`).reply(200, updatedTodo1);
      mock.onPut(`/todos/${todo2.id}`).reply(200, updatedTodo2);
      
      // Test - optimistically update both todos
      const action1: OptimisticAction<Todo> = {
        type: TodoAction.UPDATE,
        payload: updatedTodo1,
        endpoint: `/todos/${todo1.id}`,
        method: 'put',
        rollback: (state) => ({
          ...state,
          data: state.data.map(item => 
            item.id === todo1.id ? todo1 : item
          ),
        }),
      };
      
      const action2: OptimisticAction<Todo> = {
        type: TodoAction.UPDATE,
        payload: updatedTodo2,
        endpoint: `/todos/${todo2.id}`,
        method: 'put',
        rollback: (state) => ({
          ...state,
          data: state.data.map(item => 
            item.id === todo2.id ? todo2 : item
          ),
        }),
      };
      
      // Execute both actions
      const promise1 = updater.execute(action1);
      const promise2 = updater.execute(action2);
      
      // Verify immediate updates
      expect(store.getState().data[0].completed).toBe(true);
      expect(store.getState().data[1].title).toBe('Updated Todo 2');
      expect(store.getState().pending.length).toBe(2);
      
      // Wait for both server responses
      await Promise.all([promise1, promise2]);
      
      // Verify final state
      expect(store.getState().data[0].completed).toBe(true);
      expect(store.getState().data[1].title).toBe('Updated Todo 2');
      expect(store.getState().pending.length).toBe(0);
    });
    
    it('should handle mixed success and failure scenarios', async () => {
      // Setup
      const todo1: Todo = { id: 'server-1', title: 'Todo 1', completed: false };
      const todo2: Todo = { id: 'server-2', title: 'Todo 2', completed: false };
      
      // Set initial state
      store.setState({
        data: [todo1, todo2],
        pending: [],
        error: null,
      });
      
      // Configure mocks
      const updatedTodo1: Todo = { ...todo1, completed: true };
      const updatedTodo2: Todo = { ...todo2, title: 'Updated Todo 2' };
      
      mock.onPut(`/todos/${todo1.id}`).reply(200, updatedTodo1);
      mock.onPut(`/todos/${todo2.id}`).reply(500, { message: 'Error updating todo 2' });
      
      // Test - optimistically update both todos
      const action1: OptimisticAction<Todo> = {
        type: TodoAction.UPDATE,
        payload: updatedTodo1,
        endpoint: `/todos/${todo1.id}`,
        method: 'put',
        rollback: (state) => ({
          ...state,
          data: state.data.map(item => 
            item.id === todo1.id ? todo1 : item
          ),
        }),
      };
      
      const action2: OptimisticAction<Todo> = {
        type: TodoAction.UPDATE,
        payload: updatedTodo2,
        endpoint: `/todos/${todo2.id}`,
        method: 'put',
        rollback: (state) => ({
          ...state,
          data: state.data.map(item => 
            item.id === todo2.id ? todo2 : item
          ),
        }),
      };
      
      // Execute successful action
      const promise1 = updater.execute(action1);
      
      // Execute failing action
      let failedPromise;
      try {
        failedPromise = updater.execute(action2);
        
        // Verify immediate updates
        expect(store.getState().data[0].completed).toBe(true);
        expect(store.getState().data[1].title).toBe('Updated Todo 2');
        
        await failedPromise;
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        // Expected error
      }
      
      // Wait for successful response
      await promise1;
      
      // Verify final state
      expect(store.getState().data[0].completed).toBe(true); // Successful update
      expect(store.getState().data[1].title).toBe('Todo 2'); // Rolled back
      expect(store.getState().error).not.toBe(null);
    });
  });
}); 