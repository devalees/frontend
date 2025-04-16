import { StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface TodoSlice {
  todos: Array<{ id: string; text: string; completed: boolean }>;
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  removeTodo: (id: string) => void;
  getCompletedTodos: () => Array<{ id: string; text: string; completed: boolean }>;
  getPendingTodos: () => Array<{ id: string; text: string; completed: boolean }>;
  getTodoById: (id: string) => { id: string; text: string; completed: boolean } | undefined;
}

export const createTodoSlice: StateCreator<TodoSlice> = (set, get) => ({
  todos: [],
  
  addTodo: (text: string) => {
    set((state) => ({
      todos: [
        ...state.todos,
        {
          id: uuidv4(),
          text,
          completed: false,
        },
      ],
    }));
  },

  toggleTodo: (id: string) => {
    set((state) => ({
      todos: state.todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ),
    }));
  },

  removeTodo: (id: string) => {
    set((state) => ({
      todos: state.todos.filter((todo) => todo.id !== id),
    }));
  },

  getCompletedTodos: () => {
    return get().todos.filter((todo) => todo.completed);
  },

  getPendingTodos: () => {
    return get().todos.filter((todo) => !todo.completed);
  },

  getTodoById: (id: string) => {
    return get().todos.find((todo) => todo.id === id);
  },
}); 