import { describe, it, expect, beforeEach } from 'vitest';
import { StoreApi } from 'zustand';
import { createStore } from '../../lib/store/createStore';
import { RootState } from '../../lib/store/slices';
import { createTodoSlice } from '../../lib/store/slices/todoSlice';
import { createUserSlice } from '../../lib/store/slices/userSlice';

describe('State Slices', () => {
  // Test slice creation
  describe('Slice Creation', () => {
    it('should create todo slice with initial state', () => {
      const store = createStore<RootState>({
        initialState: {
          todos: [],
          user: null,
          addTodo: () => {},
          toggleTodo: () => {},
          removeTodo: () => {},
          getCompletedTodos: () => [],
          getPendingTodos: () => [],
          getTodoById: () => undefined,
          setUser: () => {},
          getUserName: () => null,
          getUserId: () => null,
          isLoggedIn: () => false,
        },
        middleware: [
          (stateCreator) => {
            return (...args) => {
              const todoState = createTodoSlice(...args);
              const userState = createUserSlice(...args);
              const state = stateCreator(...args);
              return {
                ...state,
                ...todoState,
                ...userState,
              };
            };
          },
        ],
      });
      const state = store.getState();
      
      expect(state.todos).toBeDefined();
      expect(Array.isArray(state.todos)).toBe(true);
    });

    it('should create user slice with initial state', () => {
      const store = createStore<RootState>({
        initialState: {
          todos: [],
          user: null,
          addTodo: () => {},
          toggleTodo: () => {},
          removeTodo: () => {},
          getCompletedTodos: () => [],
          getPendingTodos: () => [],
          getTodoById: () => undefined,
          setUser: () => {},
          getUserName: () => null,
          getUserId: () => null,
          isLoggedIn: () => false,
        },
        middleware: [
          (stateCreator) => {
            return (...args) => {
              const todoState = createTodoSlice(...args);
              const userState = createUserSlice(...args);
              const state = stateCreator(...args);
              return {
                ...state,
                ...todoState,
                ...userState,
              };
            };
          },
        ],
      });
      const state = store.getState();
      
      expect(state.user).toBeDefined();
      expect(state.user).toBeNull();
    });
  });

  // Test actions
  describe('Slice Actions', () => {
    let store: StoreApi<RootState>;

    beforeEach(() => {
      store = createStore<RootState>({
        initialState: {
          todos: [],
          user: null,
          addTodo: () => {},
          toggleTodo: () => {},
          removeTodo: () => {},
          getCompletedTodos: () => [],
          getPendingTodos: () => [],
          getTodoById: () => undefined,
          setUser: () => {},
          getUserName: () => null,
          getUserId: () => null,
          isLoggedIn: () => false,
        },
        middleware: [
          (stateCreator) => {
            return (...args) => {
              const todoState = createTodoSlice(...args);
              const userState = createUserSlice(...args);
              const state = stateCreator(...args);
              return {
                ...state,
                ...todoState,
                ...userState,
              };
            };
          },
        ],
      });
    });

    it('should add a todo', () => {
      const initialTodosLength = store.getState().todos.length;
      
      store.getState().addTodo('Test todo');
      expect(store.getState().todos.length).toBe(initialTodosLength + 1);
      expect(store.getState().todos[initialTodosLength]).toMatchObject({
        text: 'Test todo',
        completed: false,
      });
    });

    it('should set user', () => {
      const testUser = { id: '1', name: 'Test User' };
      
      store.getState().setUser(testUser);
      expect(store.getState().user).toEqual(testUser);
    });
  });

  // Test selectors
  describe('Slice Selectors', () => {
    let store: StoreApi<RootState>;

    beforeEach(() => {
      store = createStore<RootState>({
        initialState: {
          todos: [],
          user: null,
          addTodo: () => {},
          toggleTodo: () => {},
          removeTodo: () => {},
          getCompletedTodos: () => [],
          getPendingTodos: () => [],
          getTodoById: () => undefined,
          setUser: () => {},
          getUserName: () => null,
          getUserId: () => null,
          isLoggedIn: () => false,
        },
        middleware: [
          (stateCreator) => {
            return (...args) => {
              const todoState = createTodoSlice(...args);
              const userState = createUserSlice(...args);
              const state = stateCreator(...args);
              return {
                ...state,
                ...todoState,
                ...userState,
              };
            };
          },
        ],
      });
    });

    it('should select completed todos', () => {
      // Add some todos
      store.getState().addTodo('Todo 1');
      store.getState().addTodo('Todo 2');
      store.getState().toggleTodo(store.getState().todos[0].id);

      const completedTodos = store.getState().getCompletedTodos();
      expect(Array.isArray(completedTodos)).toBe(true);
      expect(completedTodos.length).toBe(1);
      expect(completedTodos[0].text).toBe('Todo 1');
      expect(completedTodos[0].completed).toBe(true);
    });

    it('should select current user name', () => {
      const testUser = { id: '1', name: 'Test User' };
      store.getState().setUser(testUser);
      
      const userName = store.getState().getUserName();
      expect(userName).toBe(testUser.name);
    });
  });
}); 