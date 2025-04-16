import { StateCreator } from 'zustand';

export type TodoFilter = 'all' | 'completed' | 'pending';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export interface User {
  id: string;
  name: string;
}

/**
 * Credentials for user authentication
 */
export interface Credentials {
  email: string;
  password: string;
}

/**
 * Middleware for store creation
 * Represents a function that enhances a store creator
 */
export type Middleware<T extends object> = (
  fn: StateCreator<T>
) => StateCreator<T>;

/**
 * Type-safe middleware configuration for store
 * Allows composing multiple middleware together while maintaining proper type information
 */
export interface MiddlewareConfig<T extends object> {
  middleware: Middleware<T>[];
} 