import { StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export type TodoFilter = 'all' | 'completed' | 'pending';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

const API_BASE_URL = 'http://localhost:3000/api';

export interface TodoSlice {
  // State
  todos: Todo[];
  todoFilter: TodoFilter;
  todosLoading: boolean;
  notificationHandler?: (message: string) => void;

  // Basic Actions
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  removeTodo: (id: string) => void;

  // Batch Actions
  toggleTodos: (ids: string[]) => void;
  removeTodos: (ids: string[]) => void;

  // Filter Actions
  setTodoFilter: (filter: TodoFilter) => void;
  getFilteredTodos: () => Todo[];

  // Async Actions
  createTodoAsync: (text: string) => Promise<Todo>;
  fetchTodos: () => Promise<void>;

  // Selectors
  getCompletedTodos: () => Todo[];
  getPendingTodos: () => Todo[];
  getTodoById: (id: string) => Todo | undefined;

  // Notification Handler
  setNotificationHandler: (handler: (message: string) => void) => void;
}

export const createTodoSlice: StateCreator<TodoSlice> = (set, get) => ({
  // Initial State
  todos: [],
  todoFilter: 'all',
  todosLoading: false,
  notificationHandler: undefined,

  // Basic Actions
  addTodo: (text: string) => {
    const newTodo: Todo = {
      id: uuidv4(),
      text,
      completed: false,
    };
    set((state) => ({ todos: [...state.todos, newTodo] }));
  },

  toggleTodo: (id: string) => {
    set((state) => ({
      todos: state.todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ),
    }));
    const { todos, notificationHandler } = get();
    const todo = todos.find((t) => t.id === id);
    if (todo?.completed && notificationHandler) {
      notificationHandler(`Todo completed: ${todo.text}`);
    }
  },

  removeTodo: (id: string) => {
    set((state) => ({
      todos: state.todos.filter((todo) => todo.id !== id),
    }));
  },

  // Batch Actions
  toggleTodos: (ids: string[]) => {
    set((state) => ({
      todos: state.todos.map((todo) =>
        ids.includes(todo.id) ? { ...todo, completed: !todo.completed } : todo
      ),
    }));
  },

  removeTodos: (ids: string[]) => {
    set((state) => ({
      todos: state.todos.filter((todo) => !ids.includes(todo.id)),
    }));
  },

  // Filter Actions
  setTodoFilter: (filter: TodoFilter) => {
    set({ todoFilter: filter });
  },

  getFilteredTodos: () => {
    const { todos, todoFilter } = get();
    switch (todoFilter) {
      case 'completed':
        return todos.filter((todo) => todo.completed);
      case 'pending':
        return todos.filter((todo) => !todo.completed);
      case 'all':
      default:
        return todos;
    }
  },

  // Async Actions
  createTodoAsync: async (text: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const todo = await response.json();
      set((state) => ({ todos: [...state.todos, todo] }));
      return todo;
    } catch (error) {
      console.error('Failed to create todo:', error);
      throw error;
    }
  },

  fetchTodos: async () => {
    set({ todosLoading: true });
    try {
      const response = await fetch(`${API_BASE_URL}/todos`);
      const todos = await response.json();
      set({ todos, todosLoading: false });
    } catch (error) {
      console.error('Failed to fetch todos:', error);
      set({ todosLoading: false });
      throw error;
    }
  },

  // Selectors
  getCompletedTodos: () => {
    return get().todos.filter((todo) => todo.completed);
  },

  getPendingTodos: () => {
    return get().todos.filter((todo) => !todo.completed);
  },

  getTodoById: (id: string) => {
    return get().todos.find((todo) => todo.id === id);
  },

  // Notification Handler
  setNotificationHandler: (handler) => {
    set({ notificationHandler: handler });
  },
}); 