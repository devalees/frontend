/**
 * Todo Type Tests
 */
import { describe, it, expect } from '@jest/globals';
import { Todo } from '../../lib/store/types';

describe('Todo Type', () => {
  it('should create a valid Todo object', () => {
    const todo: Todo = {
      id: '1',
      text: 'Test Todo',
      completed: false
    };
    
    expect(todo.id).toBe('1');
    expect(todo.text).toBe('Test Todo');
    expect(todo.completed).toBe(false);
  });
  
  it('should allow changing todo properties', () => {
    const todo: Todo = {
      id: '1',
      text: 'Test Todo',
      completed: false
    };
    
    // Change the completed status
    todo.completed = true;
    
    expect(todo.completed).toBe(true);
  });
  
  it('should work with array of todos', () => {
    const todos: Todo[] = [
      {
        id: '1',
        text: 'First Todo',
        completed: false
      },
      {
        id: '2',
        text: 'Second Todo',
        completed: true
      }
    ];
    
    expect(todos.length).toBe(2);
    expect(todos[0].text).toBe('First Todo');
    expect(todos[1].completed).toBe(true);
  });
  
  it('should work with todo functions', () => {
    const todos: Todo[] = [
      {
        id: '1',
        text: 'First Todo',
        completed: false
      },
      {
        id: '2',
        text: 'Second Todo',
        completed: true
      }
    ];
    
    // Filter for completed todos
    const completedTodos = todos.filter(todo => todo.completed);
    
    expect(completedTodos.length).toBe(1);
    expect(completedTodos[0].id).toBe('2');
  });
}); 