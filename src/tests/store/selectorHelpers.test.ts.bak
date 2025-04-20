import { describe, it, expect, vi } from '../../tests/utils';
import {
  getValueByPath,
  createPathSelector,
  createTransformedSelector,
  createCombinedSelector,
  createMemoizedSelector,
  createFilterSelector,
  createMapSelector,
  createSortSelector,
  createItemSelector
} from '../../lib/store/utils/selectorHelpers';

describe('Selector Helpers', () => {
  describe('getValueByPath', () => {
    it('should get a value from a nested object', () => {
      const obj = {
        user: {
          profile: {
            name: 'John',
            settings: {
              theme: 'dark'
            }
          }
        }
      };
      
      expect(getValueByPath(obj, ['user', 'profile', 'name'])).toBe('John');
      expect(getValueByPath(obj, ['user', 'profile', 'settings', 'theme'])).toBe('dark');
    });
    
    it('should return undefined for non-existing paths', () => {
      const obj = { user: { name: 'John' } };
      
      expect(getValueByPath(obj, ['user', 'profile'])).toBeUndefined();
      expect(getValueByPath(obj, ['admin'])).toBeUndefined();
    });
  });
  
  describe('createPathSelector', () => {
    it('should create a selector that extracts a value by path', () => {
      interface TestState {
        user: {
          profile: {
            name: string;
            email: string;
          };
        };
        settings: {
          theme: string;
        };
      }
      
      const state: TestState = {
        user: {
          profile: {
            name: 'John',
            email: 'john@example.com'
          }
        },
        settings: {
          theme: 'dark'
        }
      };
      
      const nameSelector = createPathSelector<TestState, string>(['user', 'profile', 'name']);
      const themeSelector = createPathSelector<TestState, string>(['settings', 'theme']);
      
      expect(nameSelector(state)).toBe('John');
      expect(themeSelector(state)).toBe('dark');
    });
  });
  
  describe('createTransformedSelector', () => {
    it('should create a selector that transforms an input selector', () => {
      interface UsernameState {
        username: string;
      }
      
      const state: UsernameState = {
        username: 'john_doe'
      };
      
      const usernameSelector = (state: UsernameState) => state.username;
      const uppercaseSelector = createTransformedSelector(
        usernameSelector,
        username => username.toUpperCase()
      );
      
      expect(uppercaseSelector(state)).toBe('JOHN_DOE');
    });
  });
  
  describe('createCombinedSelector', () => {
    it('should create a selector that combines multiple input selectors', () => {
      interface PersonState {
        firstName: string;
        lastName: string;
        age: number;
      }
      
      const state: PersonState = {
        firstName: 'John',
        lastName: 'Doe',
        age: 30
      };
      
      const firstNameSelector = (state: PersonState) => state.firstName;
      const lastNameSelector = (state: PersonState) => state.lastName;
      
      const fullNameSelector = createCombinedSelector<PersonState, [string, string], string>(
        [firstNameSelector, lastNameSelector],
        (firstName, lastName) => `${firstName} ${lastName}`
      );
      
      expect(fullNameSelector(state)).toBe('John Doe');
    });
  });
  
  describe('createMemoizedSelector', () => {
    it('should memoize results based on input selectors', () => {
      interface Todo {
        id: number;
        text: string;
        completed: boolean;
      }
      
      interface TodoState {
        todos: Todo[];
      }
      
      const state: TodoState = {
        todos: [
          { id: 1, text: 'Todo 1', completed: true },
          { id: 2, text: 'Todo 2', completed: false },
          { id: 3, text: 'Todo 3', completed: true }
        ]
      };
      
      const todosSelector = (state: TodoState) => state.todos;
      
      const expensiveComputation = vi.fn((todos: Todo[]) => 
        todos.filter(todo => todo.completed)
      );
      
      const completedTodosSelector = createMemoizedSelector<TodoState, [Todo[]], Todo[]>(
        [todosSelector],
        expensiveComputation
      );
      
      // Initial computation
      const result1 = completedTodosSelector(state);
      expect(result1).toHaveLength(2);
      expect(expensiveComputation).toHaveBeenCalledTimes(1);
      
      // Should use memoized result (same reference)
      const result2 = completedTodosSelector(state);
      expect(result2).toBe(result1); // Same reference
      expect(expensiveComputation).toHaveBeenCalledTimes(1); // Not called again
      
      // Should recompute with different inputs
      const newState: TodoState = {
        ...state,
        todos: [...state.todos, { id: 4, text: 'Todo 4', completed: true }]
      };
      
      const result3 = completedTodosSelector(newState);
      expect(result3).toHaveLength(3);
      expect(result3).not.toBe(result1); // Different reference
      expect(expensiveComputation).toHaveBeenCalledTimes(2); // Called again
    });
  });
  
  describe('Array Selectors', () => {
    interface User {
      id: number;
      name: string;
      age: number;
      active: boolean;
    }
    
    interface UserState {
      users: User[];
    }
    
    const state: UserState = {
      users: [
        { id: 1, name: 'Alice', age: 30, active: true },
        { id: 2, name: 'Bob', age: 25, active: false },
        { id: 3, name: 'Charlie', age: 35, active: true },
        { id: 4, name: 'David', age: 40, active: false }
      ]
    };
    
    const usersSelector = (state: UserState) => state.users;
    
    it('should create a filter selector', () => {
      const activeUsersSelector = createFilterSelector<UserState, User>(
        usersSelector,
        user => user.active
      );
      
      const activeUsers = activeUsersSelector(state);
      expect(activeUsers).toHaveLength(2);
      expect(activeUsers[0].name).toBe('Alice');
      expect(activeUsers[1].name).toBe('Charlie');
    });
    
    it('should create a map selector', () => {
      const userNamesSelector = createMapSelector<UserState, User, string>(
        usersSelector,
        user => user.name
      );
      
      const userNames = userNamesSelector(state);
      expect(userNames).toEqual(['Alice', 'Bob', 'Charlie', 'David']);
    });
    
    it('should create a sort selector', () => {
      const sortedByAgeSelector = createSortSelector<UserState, User>(
        usersSelector,
        (a, b) => b.age - a.age // Descending by age
      );
      
      const sortedUsers = sortedByAgeSelector(state);
      expect(sortedUsers[0].name).toBe('David');
      expect(sortedUsers[1].name).toBe('Charlie');
      expect(sortedUsers[2].name).toBe('Alice');
      expect(sortedUsers[3].name).toBe('Bob');
    });
    
    it('should create an item selector', () => {
      const getUserByIdSelector = (id: number) => createItemSelector<UserState, User>(
        usersSelector,
        user => user.id === id
      );
      
      const userById2 = getUserByIdSelector(2)(state);
      expect(userById2?.name).toBe('Bob');
      
      const userById5 = getUserByIdSelector(5)(state);
      expect(userById5).toBeUndefined();
    });
  });
}); 