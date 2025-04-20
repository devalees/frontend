/**
 * Todo Slice Tests
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { createTodoSlice, Todo, TodoSlice } from '../../lib/store/slices/todoSlice';
import { StateCreator } from 'zustand';

describe('Todo Slice', () => {
  // Test setup
  const mockSet = jest.fn() as jest.MockedFunction<(fn: (state: TodoSlice) => TodoSlice) => void>;
  const mockGet = jest.fn() as jest.MockedFunction<() => TodoSlice>;
  let slice: ReturnType<typeof createTodoSlice>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the mock get function to return empty state
    mockGet.mockImplementation(() => ({
      todosState: { data: [], status: 'idle', error: null },
      todos: [],
      todoFilter: 'all',
      notificationHandler: undefined,
      todosLoading: false,
      addTodo: jest.fn(),
      toggleTodo: jest.fn(),
      removeTodo: jest.fn(),
      toggleTodos: jest.fn(),
      removeTodos: jest.fn(),
      setTodoFilter: jest.fn(),
      getFilteredTodos: jest.fn(),
      createTodoAsync: jest.fn(),
      fetchTodos: jest.fn(),
      getCompletedTodos: jest.fn(),
      getPendingTodos: jest.fn(),
      getTodoById: jest.fn(),
      setNotificationHandler: jest.fn()
    }));
    // Create a fresh slice for each test
    slice = createTodoSlice(mockSet, mockGet, {});
  });
  
  // Tests for initial state
  describe('Initial State', () => {
    it('should have the correct initial state', () => {
      expect(slice.todosState).toEqual({ data: [], status: 'idle', error: null });
      expect(slice.todoFilter).toBe('all');
      expect(slice.todos).toEqual([]);
      expect(slice.todosLoading).toBe(false);
      expect(slice.notificationHandler).toBeUndefined();
    });
  });
  
  // Tests for basic actions
  describe('Basic Actions', () => {
    it('should add a todo', () => {
      // Setup
      const todoText = 'Test Todo';
      
      // Execute
      slice.addTodo(todoText);
      
      // Verify
      // First, extract the function passed to mockSet
      const setStateFunction = mockSet.mock.calls[0][0] as (state: TodoSlice) => TodoSlice;
      // Now create a fake state and call the function to see what changes
      const newState = setStateFunction({
        todosState: { data: [], status: 'idle', error: null },
        todos: [],
        todoFilter: 'all',
        notificationHandler: undefined,
        todosLoading: false,
        addTodo: jest.fn(),
        toggleTodo: jest.fn(),
        removeTodo: jest.fn(),
        toggleTodos: jest.fn(),
        removeTodos: jest.fn(),
        setTodoFilter: jest.fn(),
        getFilteredTodos: jest.fn(),
        createTodoAsync: jest.fn(),
        fetchTodos: jest.fn(),
        getCompletedTodos: jest.fn(),
        getPendingTodos: jest.fn(),
        getTodoById: jest.fn(),
        setNotificationHandler: jest.fn()
      });
      
      // Assertions
      expect(newState.todos.length).toBe(1);
      expect(newState.todos[0].text).toBe(todoText);
      expect(newState.todos[0].completed).toBe(false);
      expect(newState.todos[0].id).toBeTruthy();
    });
    
    it('should toggle a todo', () => {
      // Setup
      const mockTodo: Todo = {
        id: '1',
        text: 'Test Todo',
        completed: false
      };
      mockGet.mockImplementation(() => ({
        todosState: { data: [mockTodo], status: 'success', error: null },
        todos: [mockTodo],
        todoFilter: 'all',
        notificationHandler: undefined,
        todosLoading: false,
        addTodo: jest.fn(),
        toggleTodo: jest.fn(),
        removeTodo: jest.fn(),
        toggleTodos: jest.fn(),
        removeTodos: jest.fn(),
        setTodoFilter: jest.fn(),
        getFilteredTodos: jest.fn(),
        createTodoAsync: jest.fn(),
        fetchTodos: jest.fn(),
        getCompletedTodos: jest.fn(),
        getPendingTodos: jest.fn(),
        getTodoById: jest.fn(),
        setNotificationHandler: jest.fn()
      }));
      
      // Execute
      slice.toggleTodo('1');
      
      // Verify
      const setStateFunction = mockSet.mock.calls[0][0] as (state: TodoSlice) => TodoSlice;
      const newState = setStateFunction({
        todosState: { data: [mockTodo], status: 'success', error: null },
        todos: [mockTodo],
        todoFilter: 'all',
        notificationHandler: undefined,
        todosLoading: false,
        addTodo: jest.fn(),
        toggleTodo: jest.fn(),
        removeTodo: jest.fn(),
        toggleTodos: jest.fn(),
        removeTodos: jest.fn(),
        setTodoFilter: jest.fn(),
        getFilteredTodos: jest.fn(),
        createTodoAsync: jest.fn(),
        fetchTodos: jest.fn(),
        getCompletedTodos: jest.fn(),
        getPendingTodos: jest.fn(),
        getTodoById: jest.fn(),
        setNotificationHandler: jest.fn()
      });
      
      // Assertions
      expect(newState.todos.length).toBe(1);
      expect(newState.todos[0].completed).toBe(true);
    });
    
    it('should remove a todo', () => {
      // Setup
      const mockTodo: Todo = {
        id: '1',
        text: 'Test Todo',
        completed: false
      };
      mockGet.mockImplementation(() => ({
        todosState: { data: [mockTodo], status: 'success', error: null },
        todos: [mockTodo],
        todoFilter: 'all',
        notificationHandler: undefined,
        todosLoading: false,
        addTodo: jest.fn(),
        toggleTodo: jest.fn(),
        removeTodo: jest.fn(),
        toggleTodos: jest.fn(),
        removeTodos: jest.fn(),
        setTodoFilter: jest.fn(),
        getFilteredTodos: jest.fn(),
        createTodoAsync: jest.fn(),
        fetchTodos: jest.fn(),
        getCompletedTodos: jest.fn(),
        getPendingTodos: jest.fn(),
        getTodoById: jest.fn(),
        setNotificationHandler: jest.fn()
      }));
      
      // Execute
      slice.removeTodo('1');
      
      // Verify
      const setStateFunction = mockSet.mock.calls[0][0] as (state: TodoSlice) => TodoSlice;
      const newState = setStateFunction({
        todosState: { data: [mockTodo], status: 'success', error: null },
        todos: [mockTodo],
        todoFilter: 'all',
        notificationHandler: undefined,
        todosLoading: false,
        addTodo: jest.fn(),
        toggleTodo: jest.fn(),
        removeTodo: jest.fn(),
        toggleTodos: jest.fn(),
        removeTodos: jest.fn(),
        setTodoFilter: jest.fn(),
        getFilteredTodos: jest.fn(),
        createTodoAsync: jest.fn(),
        fetchTodos: jest.fn(),
        getCompletedTodos: jest.fn(),
        getPendingTodos: jest.fn(),
        getTodoById: jest.fn(),
        setNotificationHandler: jest.fn()
      });
      
      // Assertions
      expect(newState.todos.length).toBe(0);
    });
  });
  
  // Tests for filtering
  describe('Filtering', () => {
    it('should filter todos', () => {
      // Setup
      const mockTodos: Todo[] = [
        { id: '1', text: 'Completed Todo', completed: true },
        { id: '2', text: 'Pending Todo', completed: false }
      ];
      mockGet.mockImplementation(() => ({
        todosState: { data: mockTodos, status: 'success', error: null },
        todos: mockTodos,
        todoFilter: 'all',
        notificationHandler: undefined,
        todosLoading: false,
        addTodo: jest.fn(),
        toggleTodo: jest.fn(),
        removeTodo: jest.fn(),
        toggleTodos: jest.fn(),
        removeTodos: jest.fn(),
        setTodoFilter: jest.fn(),
        getFilteredTodos: jest.fn(),
        createTodoAsync: jest.fn(),
        fetchTodos: jest.fn(),
        getCompletedTodos: jest.fn(),
        getPendingTodos: jest.fn(),
        getTodoById: jest.fn(),
        setNotificationHandler: jest.fn()
      }));
      
      // Execute - filter for completed todos
      slice.setTodoFilter('completed');
      
      // Then get filtered todos
      mockGet.mockImplementation(() => ({
        todosState: { data: mockTodos, status: 'success', error: null },
        todos: mockTodos,
        todoFilter: 'completed',
        notificationHandler: undefined,
        todosLoading: false,
        addTodo: jest.fn(),
        toggleTodo: jest.fn(),
        removeTodo: jest.fn(),
        toggleTodos: jest.fn(),
        removeTodos: jest.fn(),
        setTodoFilter: jest.fn(),
        getFilteredTodos: jest.fn(),
        createTodoAsync: jest.fn(),
        fetchTodos: jest.fn(),
        getCompletedTodos: jest.fn(),
        getPendingTodos: jest.fn(),
        getTodoById: jest.fn(),
        setNotificationHandler: jest.fn()
      }));
      const filteredTodos = slice.getFilteredTodos();
      
      // Assertions
      expect(filteredTodos.length).toBe(1);
      expect(filteredTodos[0].text).toBe('Completed Todo');
      expect(filteredTodos[0].completed).toBe(true);
    });
  });
  
  // Tests for notifications
  describe('Notifications', () => {
    it('should call notification handler when a todo is completed', () => {
      // Setup
      const mockTodo: Todo = {
        id: '1',
        text: 'Test Todo',
        completed: false
      };
      const mockNotificationHandler = jest.fn();
      mockGet.mockImplementation(() => ({
        todosState: { data: [mockTodo], status: 'success', error: null },
        todos: [mockTodo],
        todoFilter: 'all',
        notificationHandler: mockNotificationHandler,
        todosLoading: false,
        addTodo: jest.fn(),
        toggleTodo: jest.fn(),
        removeTodo: jest.fn(),
        toggleTodos: jest.fn(),
        removeTodos: jest.fn(),
        setTodoFilter: jest.fn(),
        getFilteredTodos: jest.fn(),
        createTodoAsync: jest.fn(),
        fetchTodos: jest.fn(),
        getCompletedTodos: jest.fn(),
        getPendingTodos: jest.fn(),
        getTodoById: jest.fn(),
        setNotificationHandler: jest.fn()
      }));
      
      // Execute - toggle the todo to completed
      slice.toggleTodo('1');
      
      // For the notification check, we need to simulate that the todo is already completed
      mockGet.mockImplementation(() => ({
        todosState: { 
          data: [{ ...mockTodo, completed: true }], 
          status: 'success', 
          error: null 
        },
        todos: [{ ...mockTodo, completed: true }],
        todoFilter: 'all',
        notificationHandler: mockNotificationHandler,
        todosLoading: false,
        addTodo: jest.fn(),
        toggleTodo: jest.fn(),
        removeTodo: jest.fn(),
        toggleTodos: jest.fn(),
        removeTodos: jest.fn(),
        setTodoFilter: jest.fn(),
        getFilteredTodos: jest.fn(),
        createTodoAsync: jest.fn(),
        fetchTodos: jest.fn(),
        getCompletedTodos: jest.fn(),
        getPendingTodos: jest.fn(),
        getTodoById: jest.fn(),
        setNotificationHandler: jest.fn()
      }));
      
      // Call the set state function passed to mockSet
      const setStateFunction = mockSet.mock.calls[0][0] as (state: TodoSlice) => TodoSlice;
      setStateFunction({
        todosState: { data: [mockTodo], status: 'success', error: null },
        todos: [mockTodo],
        todoFilter: 'all',
        notificationHandler: mockNotificationHandler,
        todosLoading: false,
        addTodo: jest.fn(),
        toggleTodo: jest.fn(),
        removeTodo: jest.fn(),
        toggleTodos: jest.fn(),
        removeTodos: jest.fn(),
        setTodoFilter: jest.fn(),
        getFilteredTodos: jest.fn(),
        createTodoAsync: jest.fn(),
        fetchTodos: jest.fn(),
        getCompletedTodos: jest.fn(),
        getPendingTodos: jest.fn(),
        getTodoById: jest.fn(),
        setNotificationHandler: jest.fn()
      });
      
      // Assertions
      expect(mockNotificationHandler).toHaveBeenCalledWith('Todo completed: Test Todo');
    });
  });
}); 