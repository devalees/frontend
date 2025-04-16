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

export interface Credentials {
  username: string;
  password: string;
} 