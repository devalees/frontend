/**
 * Utility types for state management
 * These types help reduce code duplication and improve type safety in the state layer
 */

/**
 * Status values for asynchronous operations
 */
export type AsyncStateStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * Generic type for asynchronous state
 * Used for API calls, asynchronous operations, etc.
 * 
 * @template T The type of data when the operation is successful
 */
export interface AsyncState<T> {
  status: AsyncStateStatus;
  data: T | null;
  error: Error | null;
}

/**
 * Add loading and error state to any type
 * Useful for adding status to any data type without writing repetitive code
 * 
 * @template T The base data type
 */
export type WithStatus<T> = T & {
  loading: boolean;
  error: Error | null;
};

/**
 * Branded type for computed values
 * Helps identify computed properties in state objects
 * 
 * @template T The underlying type of the computed value
 */
export type Computed<T> = T & { readonly __computed: unique symbol };

/**
 * Action creator type for state updates
 * 
 * @template TState The state type that the action operates on
 * @template TArgs The arguments that the action accepts (tuple type)
 * @template TReturn The return type of the action (defaults to TState)
 */
export type ActionCreator<TState, TArgs extends unknown[] = [], TReturn = TState> = 
  (state: TState, ...args: TArgs) => TReturn;

/**
 * Basic selector type for selecting data from state
 * 
 * @template TState The state type that the selector operates on
 * @template TReturn The return type of the selector
 */
export type Selector<TState, TReturn> = 
  (state: TState) => TReturn;

/**
 * Selector with dependencies type
 * Useful for selectors that need additional parameters
 * 
 * @template TState The state type that the selector operates on
 * @template TReturn The return type of the selector
 * @template TDeps The dependencies/arguments that the selector accepts (tuple type)
 */
export type SelectorWithDeps<TState, TReturn, TDeps extends unknown[] = []> = 
  (state: TState, ...deps: TDeps) => TReturn;

/**
 * Pagination state type
 * Common pattern for paginated data
 */
export interface PaginationState {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Create a paginated state type for any data
 * 
 * @template T The data type that is paginated
 */
export type Paginated<T> = {
  items: T[];
  pagination: PaginationState;
};

/**
 * Extract the resource type from an async state
 * Useful for getting the underlying type without writing AsyncState<T>
 * 
 * @template T The async state type
 */
export type AsyncStateResource<T extends AsyncState<any>> = 
  T extends AsyncState<infer R> ? R : never;

/**
 * Make certain properties of a type required
 * Useful when you want to make optional properties required
 * 
 * @template T The original type
 * @template K The keys to make required
 */
export type RequiredProps<T, K extends keyof T> = 
  T & { [P in K]-?: T[P] };

/**
 * Make certain properties of a type optional
 * Useful when you want to make required properties optional
 * 
 * @template T The original type
 * @template K The keys to make optional
 */
export type OptionalProps<T, K extends keyof T> = 
  Omit<T, K> & { [P in K]?: T[P] };

/**
 * Create an initial async state object
 * 
 * @template T The type of data when successful
 * @returns An AsyncState object in idle state
 */
export function createInitialAsyncState<T>(): AsyncState<T> {
  return {
    status: 'idle',
    data: null,
    error: null
  };
}

/**
 * Set loading state for an async state object
 * 
 * @template T The type of data when successful
 * @param state The current async state
 * @returns A new AsyncState object in loading state
 */
export function setLoading<T>(state: AsyncState<T>): AsyncState<T> {
  return {
    ...state,
    status: 'loading',
    error: null
  };
}

/**
 * Set success state for an async state object
 * 
 * @template T The type of data when successful
 * @param state The current async state
 * @param data The successful data
 * @returns A new AsyncState object in success state
 */
export function setSuccess<T>(state: AsyncState<T>, data: T): AsyncState<T> {
  return {
    ...state,
    status: 'success',
    data,
    error: null
  };
}

/**
 * Set error state for an async state object
 * 
 * @template T The type of data when successful
 * @param state The current async state
 * @param error The error object
 * @returns A new AsyncState object in error state
 */
export function setError<T>(state: AsyncState<T>, error: Error): AsyncState<T> {
  return {
    ...state,
    status: 'error',
    error
  };
}

/**
 * Create an initial pagination state
 * 
 * @param pageSize The number of items per page
 * @returns An initial pagination state
 */
export function createInitialPaginationState(pageSize = 10): PaginationState {
  return {
    page: 1,
    pageSize,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  };
}

/**
 * Update pagination state based on data
 * 
 * @param state The current pagination state
 * @param totalItems The total number of items
 * @returns An updated pagination state
 */
export function updatePaginationState(
  state: PaginationState, 
  totalItems: number
): PaginationState {
  const totalPages = Math.ceil(totalItems / state.pageSize);
  
  return {
    ...state,
    totalItems,
    totalPages,
    hasNextPage: state.page < totalPages,
    hasPreviousPage: state.page > 1
  };
}

/**
 * Set the page for a pagination state
 * 
 * @param state The current pagination state
 * @param page The new page number
 * @returns An updated pagination state
 */
export function setPage(
  state: PaginationState, 
  page: number
): PaginationState {
  const newPage = Math.max(1, Math.min(page, state.totalPages || 1));
  
  return {
    ...state,
    page: newPage,
    hasNextPage: newPage < state.totalPages,
    hasPreviousPage: newPage > 1
  };
} 