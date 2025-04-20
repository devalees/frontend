/**
 * Optimistic Updates
 * 
 * This module provides functionality for optimistic UI updates:
 * - Immediately update the UI before server confirmation
 * - Track pending operations
 * - Roll back changes if server request fails
 * - Resolve ID conflicts between optimistic and server data
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, Method } from 'axios';
import { StoreApi } from 'zustand/vanilla';

/**
 * HTTP methods supported for optimistic updates
 */
export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

/**
 * Base state for optimistic updates
 */
export interface OptimisticState<T> {
  data: T[];
  pending: PendingOperation[];
  error: Error | null;
}

/**
 * Pending operation tracking
 */
export interface PendingOperation {
  id: string;
  type: string;
  timestamp: number;
}

/**
 * Optimistic action definition
 */
export interface OptimisticAction<T> {
  /**
   * Action type identifier
   */
  type: string;
  
  /**
   * Data payload for the action
   */
  payload: T;
  
  /**
   * API endpoint to call
   */
  endpoint: string;
  
  /**
   * HTTP method to use
   */
  method: HttpMethod;
  
  /**
   * Function to roll back changes if request fails
   */
  rollback: (state: OptimisticState<T>) => OptimisticState<T>;
  
  /**
   * Additional request configuration
   */
  config?: Omit<AxiosRequestConfig, 'url' | 'method'>;
  
  /**
   * Optional function to transform the server response
   */
  transform?: (response: AxiosResponse<any>) => T;
  
  /**
   * Optional function to transform error
   */
  handleError?: (error: any) => Error;
}

/**
 * Interface for optimistic updater
 */
export interface OptimisticUpdater<T> {
  /**
   * Execute an optimistic action
   */
  execute: (action: OptimisticAction<T>) => Promise<T>;
  
  /**
   * Get all pending operations
   */
  getPendingOperations: () => PendingOperation[];
  
  /**
   * Clear all pending operations and error state
   */
  reset: () => void;
}

/**
 * Creates an optimistic store updater
 * 
 * @param store - Zustand store
 * @param httpClient - Axios instance for API calls
 * @returns Optimistic updater instance
 */
export function createOptimisticStore<T>(
  store: StoreApi<OptimisticState<T>>,
  httpClient: AxiosInstance = axios
): OptimisticUpdater<T> {
  
  /**
   * Applies optimistic update to the store
   */
  function applyOptimisticUpdate(action: OptimisticAction<T>, operationId: string): void {
    store.setState(state => {
      // Add item to data array for add operations
      if (action.method === 'post') {
        return {
          ...state,
          data: [...state.data, action.payload],
          pending: [
            ...state.pending,
            {
              id: operationId,
              type: action.type,
              timestamp: Date.now()
            }
          ],
          error: null
        };
      }
      
      // Update item in data array for update operations
      if (action.method === 'put' || action.method === 'patch') {
        return {
          ...state,
          data: state.data.map(item => {
            // @ts-ignore - We're using a generic here, so we can't know for sure that id exists
            if (item.id === (action.payload as any).id) {
              return action.payload;
            }
            return item;
          }),
          pending: [
            ...state.pending,
            {
              id: operationId,
              type: action.type,
              timestamp: Date.now()
            }
          ],
          error: null
        };
      }
      
      // Remove item from data array for delete operations
      if (action.method === 'delete') {
        return {
          ...state,
          // @ts-ignore - We're using a generic here, so we can't know for sure that id exists
          data: state.data.filter(item => item.id !== (action.payload as any).id),
          pending: [
            ...state.pending,
            {
              id: operationId,
              type: action.type,
              timestamp: Date.now()
            }
          ],
          error: null
        };
      }
      
      return state;
    });
  }
  
  /**
   * Removes a pending operation from the store
   */
  function removePendingOperation(opId: string): void {
    store.setState(state => ({
      ...state,
      pending: state.pending.filter(op => op.id !== opId)
    }));
  }
  
  /**
   * Applies server response to the store
   */
  function applyServerResponse(action: OptimisticAction<T>, response: AxiosResponse<any>, operationId: string): T {
    const responseData = action.transform ? action.transform(response) : response.data;
    
    store.setState(state => {
      // For post operations, replace the temporary item with the server response
      if (action.method === 'post') {
        const updatedData = state.data.map(item => 
          // @ts-ignore - We're using a generic here, so we can't know for sure that id exists
          item.id === (action.payload as any).id ? responseData : item
        );
        
        return {
          ...state,
          data: updatedData,
          // Remove the pending operation
          pending: state.pending.filter(op => op.id !== operationId)
        };
      }
      
      // For other operations, just remove the pending operation
      return {
        ...state,
        pending: state.pending.filter(op => op.id !== operationId)
      };
    });
    
    return responseData;
  }
  
  /**
   * Rolls back an optimistic update if the server request fails
   */
  function rollbackOptimisticUpdate(action: OptimisticAction<T>, error: any, operationId: string): void {
    store.setState(state => {
      const rolledBackState = action.rollback(state);
      
      return {
        ...rolledBackState,
        // Remove the pending operation
        pending: rolledBackState.pending.filter(op => op.id !== operationId),
        error: action.handleError ? action.handleError(error) : new Error(
          error.response?.data?.message || error.message || 'Operation failed'
        )
      };
    });
  }
  
  /**
   * Generates a unique operation ID
   */
  function generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  }
  
  /**
   * Executes an optimistic action
   */
  async function execute(action: OptimisticAction<T>): Promise<T> {
    const operationId = generateOperationId();
    
    try {
      // Apply optimistic update immediately
      applyOptimisticUpdate(action, operationId);
      
      // Make the actual API call
      const response = await httpClient.request({
        url: action.endpoint,
        method: action.method as Method,
        data: action.method !== 'get' && action.method !== 'delete' ? action.payload : undefined,
        ...action.config
      });
      
      // Apply server response
      const result = applyServerResponse(action, response, operationId);
      
      return result;
    } catch (error) {
      // Roll back optimistic update
      rollbackOptimisticUpdate(action, error, operationId);
      
      // Re-throw the error for the caller to handle
      throw error;
    }
  }
  
  /**
   * Gets all pending operations
   */
  function getPendingOperations(): PendingOperation[] {
    return store.getState().pending;
  }
  
  /**
   * Resets the store by clearing pending operations and error state
   */
  function reset(): void {
    store.setState(state => ({
      ...state,
      pending: [],
      error: null
    }));
  }
  
  return {
    execute,
    getPendingOperations,
    reset
  };
} 