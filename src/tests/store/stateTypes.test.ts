import { describe, it, expect } from '../../tests/utils';
import type { 
  AsyncStateStatus,
  AsyncState,
  Computed,
  ActionCreator,
  Selector,
  SelectorWithDeps,
  WithStatus,
  PaginationState,
  Paginated,
  AsyncStateResource,
  RequiredProps,
  OptionalProps
} from '../../lib/store/utils/stateTypes';
import {
  createInitialAsyncState,
  setLoading,
  setSuccess,
  setError,
  createInitialPaginationState,
  updatePaginationState,
  setPage
} from '../../lib/store/utils/stateTypes';

describe('State Utility Types', () => {
  describe('AsyncState', () => {
    it('should have the correct structure for idle state', () => {
      // Type check test
      const idleState: AsyncState<string> = {
        status: 'idle',
        data: null,
        error: null
      };
      
      expect(idleState.status).toBe('idle');
      expect(idleState.data).toBeNull();
      expect(idleState.error).toBeNull();
    });
    
    it('should have the correct structure for loading state', () => {
      // Type check test
      const loadingState: AsyncState<number> = {
        status: 'loading',
        data: null,
        error: null
      };
      
      expect(loadingState.status).toBe('loading');
      expect(loadingState.data).toBeNull();
      expect(loadingState.error).toBeNull();
    });
    
    it('should have the correct structure for success state', () => {
      // Type check test
      const successState: AsyncState<string[]> = {
        status: 'success',
        data: ['test'],
        error: null
      };
      
      expect(successState.status).toBe('success');
      expect(successState.data).toEqual(['test']);
      expect(successState.error).toBeNull();
    });
    
    it('should have the correct structure for error state', () => {
      // Type check test
      const error = new Error('Failed to load');
      const errorState: AsyncState<boolean> = {
        status: 'error',
        data: null,
        error
      };
      
      expect(errorState.status).toBe('error');
      expect(errorState.data).toBeNull();
      expect(errorState.error).toBe(error);
    });
    
    it('should create initial async state with helper function', () => {
      const initialState = createInitialAsyncState<string[]>();
      
      expect(initialState.status).toBe('idle');
      expect(initialState.data).toBeNull();
      expect(initialState.error).toBeNull();
    });
    
    it('should set loading state with helper function', () => {
      const initialState = createInitialAsyncState<number>();
      const loadingState = setLoading(initialState);
      
      expect(loadingState.status).toBe('loading');
      expect(loadingState.data).toBeNull();
      expect(loadingState.error).toBeNull();
    });
    
    it('should set success state with helper function', () => {
      const initialState = createInitialAsyncState<string>();
      const successState = setSuccess(initialState, 'test data');
      
      expect(successState.status).toBe('success');
      expect(successState.data).toBe('test data');
      expect(successState.error).toBeNull();
    });
    
    it('should set error state with helper function', () => {
      const initialState = createInitialAsyncState<boolean>();
      const error = new Error('Something went wrong');
      const errorState = setError(initialState, error);
      
      expect(errorState.status).toBe('error');
      expect(errorState.data).toBeNull();
      expect(errorState.error).toBe(error);
    });
  });
  
  describe('WithStatus', () => {
    type TestData = {
      id: string;
      name: string;
    };
    
    it('should add status properties to a type', () => {
      // Type check test
      const data: WithStatus<TestData> = {
        id: '123',
        name: 'Test',
        loading: false,
        error: null
      };
      
      expect(data.id).toBe('123');
      expect(data.name).toBe('Test');
      expect(data.loading).toBe(false);
      expect(data.error).toBeNull();
    });
    
    it('should allow setting loading state', () => {
      // Type check test
      const loadingData: WithStatus<TestData> = {
        id: '123',
        name: 'Test',
        loading: true,
        error: null
      };
      
      expect(loadingData.loading).toBe(true);
    });
    
    it('should allow setting error state', () => {
      // Type check test
      const error = new Error('Something went wrong');
      const errorData: WithStatus<TestData> = {
        id: '123',
        name: 'Test',
        loading: false,
        error
      };
      
      expect(errorData.error).toBe(error);
    });
  });
  
  describe('ActionCreator and Selector Types', () => {
    type TestState = {
      count: number;
      todos: string[];
    };
    
    it('should validate action creator type signature', () => {
      // Define action creator that follows the ActionCreator type
      const increment: ActionCreator<TestState, [amount: number]> = 
        (state: TestState, amount: number) => ({ ...state, count: state.count + amount });
      
      // Test the action creator
      const initialState: TestState = { count: 5, todos: [] };
      const result = increment(initialState, 3);
      
      expect(result.count).toBe(8);
      expect(result.todos).toEqual([]);
    });
    
    it('should validate selector type signature', () => {
      // Define selector that follows the Selector type
      const getTodos: Selector<TestState, string[]> = 
        (state: TestState) => state.todos;
      
      // Test the selector
      const state: TestState = { count: 5, todos: ['a', 'b', 'c'] };
      const result = getTodos(state);
      
      expect(result).toEqual(['a', 'b', 'c']);
    });
    
    it('should validate selector with dependencies type signature', () => {
      // Define selector with dependencies that follows the SelectorWithDeps type
      const filteredTodos: SelectorWithDeps<TestState, string[], [filter: string]> = 
        (state: TestState, filter: string) => state.todos.filter((todo: string) => todo.includes(filter));
      
      // Test the selector
      const state: TestState = { count: 5, todos: ['apple', 'banana', 'orange'] };
      const result = filteredTodos(state, 'an');
      
      expect(result).toEqual(['banana', 'orange']);
    });
  });
  
  describe('Computed Type', () => {
    it('should mark a property as computed', () => {
      type TestState = {
        firstName: string;
        lastName: string;
        fullName: Computed<string>;
      };
      
      // Type check only - runtime implementation would be in actual store
      const state: TestState = {
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe' as Computed<string>
      };
      
      expect(state.fullName).toBe('John Doe');
    });
  });
  
  describe('Pagination Types', () => {
    it('should create initial pagination state', () => {
      const pagination = createInitialPaginationState();
      
      expect(pagination.page).toBe(1);
      expect(pagination.pageSize).toBe(10);
      expect(pagination.totalItems).toBe(0);
      expect(pagination.totalPages).toBe(0);
      expect(pagination.hasNextPage).toBe(false);
      expect(pagination.hasPreviousPage).toBe(false);
    });
    
    it('should create initial pagination state with custom page size', () => {
      const pagination = createInitialPaginationState(25);
      
      expect(pagination.page).toBe(1);
      expect(pagination.pageSize).toBe(25);
    });
    
    it('should update pagination state based on total items', () => {
      const initialPagination = createInitialPaginationState(10);
      const updatedPagination = updatePaginationState(initialPagination, 35);
      
      expect(updatedPagination.totalItems).toBe(35);
      expect(updatedPagination.totalPages).toBe(4);
      expect(updatedPagination.hasNextPage).toBe(true);
      expect(updatedPagination.hasPreviousPage).toBe(false);
    });
    
    it('should set page correctly', () => {
      const initialPagination = createInitialPaginationState(10);
      const withTotalItems = updatePaginationState(initialPagination, 30);
      const withNewPage = setPage(withTotalItems, 2);
      
      expect(withNewPage.page).toBe(2);
      expect(withNewPage.hasNextPage).toBe(true);
      expect(withNewPage.hasPreviousPage).toBe(true);
    });
    
    it('should handle paginated data type', () => {
      type User = {
        id: string;
        name: string;
      };
      
      const paginatedUsers: Paginated<User> = {
        items: [
          { id: '1', name: 'John' },
          { id: '2', name: 'Jane' }
        ],
        pagination: createInitialPaginationState()
      };
      
      expect(paginatedUsers.items.length).toBe(2);
      expect(paginatedUsers.pagination).toBeDefined();
    });
  });
  
  describe('Advanced Utility Types', () => {
    it('should extract resource type from AsyncState', () => {
      // Type check test - compile time only
      type UserState = AsyncState<{ id: string; name: string }>;
      type User = AsyncStateResource<UserState>;
      
      // This is just to verify the type is correctly inferred at runtime
      // We need to create variables to make TypeScript actually check the types
      const userState: UserState = {
        status: 'success',
        data: { id: '123', name: 'John' },
        error: null
      };
      
      const user = userState.data as User;
      
      expect(user).toBeDefined();
      if (user) {
        expect(user.id).toBe('123');
        expect(user.name).toBe('John');
      }
    });
    
    it('should make optional properties required', () => {
      // Type check test - compile time only
      type User = {
        id: string;
        name: string;
        email?: string;
        phone?: string;
      };
      
      type UserWithRequiredContact = RequiredProps<User, 'email' | 'phone'>;
      
      // This is just to verify the type is correctly enforced at runtime
      const user: UserWithRequiredContact = {
        id: '123',
        name: 'John',
        email: 'john@example.com',
        phone: '123-456-7890'
      };
      
      expect(user.email).toBeDefined();
      expect(user.phone).toBeDefined();
    });
    
    it('should make required properties optional', () => {
      // Type check test - compile time only
      type User = {
        id: string;
        name: string;
        email: string;
      };
      
      type UserWithOptionalName = OptionalProps<User, 'name'>;
      
      // This is just to verify the type is correctly relaxed at runtime
      const user: UserWithOptionalName = {
        id: '123',
        email: 'john@example.com'
        // name is now optional and can be omitted
      };
      
      expect(user.id).toBe('123');
      expect(user.email).toBe('john@example.com');
      // name could be undefined
    });
  });
}); 