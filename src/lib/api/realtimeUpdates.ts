import { StoreApi } from 'zustand';
import { SocketClient } from './socketClient';

/**
 * Event types for real-time updates
 */
export enum UpdateEvent {
  ITEM_CREATED = 'item:created',
  ITEM_UPDATED = 'item:updated',
  ITEM_DELETED = 'item:deleted',
  SYNC_ERROR = 'sync:error',
  SYNC_COMPLETED = 'sync:completed'
}

/**
 * Interface for data entities with an ID
 */
export interface Entity {
  id: string;
  [key: string]: any;
}

/**
 * Store interface for entities that can be updated in real-time
 */
export interface EntityStore<T extends Entity = Entity> {
  data: T[];
  loading: boolean;
  error: Error | null;
  addItem: (item: T) => void;
  updateItem: (id: string, item: Partial<T>) => void;
  removeItem: (id: string) => void;
  setError: (error: Error | null) => void;
  setLoading: (loading: boolean) => void;
}

/**
 * Error payload from server
 */
export interface ErrorPayload {
  message: string;
  code?: string;
  details?: any;
}

/**
 * Real-time updates configuration options
 */
export interface RealtimeUpdatesOptions {
  /**
   * Custom event mapping
   */
  eventMap?: Partial<Record<UpdateEvent, string>>;
  
  /**
   * Automatic subscription on creation
   * @default false
   */
  autoSubscribe?: boolean;
  
  /**
   * Clear error state on new updates
   * @default false
   */
  clearErrorOnUpdate?: boolean;
  
  /**
   * Custom error transformer
   */
  errorTransformer?: (error: ErrorPayload) => Error;
}

/**
 * Handler for real-time updates
 */
export interface RealtimeUpdateHandler {
  /**
   * Subscribe to real-time updates
   */
  subscribe(): void;
  
  /**
   * Unsubscribe from real-time updates
   */
  unsubscribe(): void;
  
  /**
   * Check if currently subscribed
   */
  isSubscribed(): boolean;
  
  /**
   * Get the socket client
   */
  getSocketClient(): SocketClient;
}

/**
 * Default options for real-time updates
 */
const DEFAULT_OPTIONS: RealtimeUpdatesOptions = {
  autoSubscribe: false,
  clearErrorOnUpdate: false,
  errorTransformer: (error: ErrorPayload) => new Error(error.message)
};

/**
 * Creates a handler for real-time updates
 * @param socket Socket client
 * @param store Zustand store
 * @param options Configuration options
 * @returns Real-time update handler
 */
export function createRealtimeUpdates<T extends Entity = Entity>(
  socket: SocketClient,
  store: StoreApi<EntityStore<T>>,
  options: RealtimeUpdatesOptions = {}
): RealtimeUpdateHandler {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  const handlers: Record<string, (data: any) => void> = {};
  let subscribed = false;
  
  /**
   * Map update event to server event name
   * @param event Update event
   * @returns Server event name
   */
  const getEventName = (event: UpdateEvent): string => {
    return mergedOptions.eventMap?.[event] || event;
  };
  
  /**
   * Set up event handlers
   */
  const setupHandlers = (): void => {
    // Handler for item creation
    handlers[getEventName(UpdateEvent.ITEM_CREATED)] = (data: T) => {
      if (mergedOptions.clearErrorOnUpdate) {
        store.getState().setError(null);
      }
      store.getState().addItem(data);
    };
    
    // Handler for item updates
    handlers[getEventName(UpdateEvent.ITEM_UPDATED)] = (data: T) => {
      if (mergedOptions.clearErrorOnUpdate) {
        store.getState().setError(null);
      }
      
      // Create a new object with only the properties to update
      const { id, ...updates } = data;
      const updateData: Partial<T> = updates as Partial<T>;
      
      store.getState().updateItem(id, updateData);
    };
    
    // Handler for item deletion
    handlers[getEventName(UpdateEvent.ITEM_DELETED)] = (data: { id: string }) => {
      if (mergedOptions.clearErrorOnUpdate) {
        store.getState().setError(null);
      }
      
      store.getState().removeItem(data.id);
    };
    
    // Handler for sync errors
    handlers[getEventName(UpdateEvent.SYNC_ERROR)] = (error: ErrorPayload) => {
      const transformedError = mergedOptions.errorTransformer?.(error) || new Error(error.message);
      store.getState().setError(transformedError);
    };
    
    // Handler for sync completion
    handlers[getEventName(UpdateEvent.SYNC_COMPLETED)] = () => {
      store.getState().setLoading(false);
    };
  };
  
  /**
   * Subscribe to real-time updates
   */
  const subscribe = (): void => {
    if (subscribed) return;
    
    setupHandlers();
    
    // Register event handlers
    Object.entries(handlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });
    
    subscribed = true;
  };
  
  /**
   * Unsubscribe from real-time updates
   */
  const unsubscribe = (): void => {
    if (!subscribed) return;
    
    // Unregister event handlers
    Object.entries(handlers).forEach(([event, handler]) => {
      socket.off(event, handler);
    });
    
    subscribed = false;
  };
  
  // Auto-subscribe if enabled
  if (mergedOptions.autoSubscribe) {
    subscribe();
  }
  
  return {
    subscribe,
    unsubscribe,
    isSubscribed: () => subscribed,
    getSocketClient: () => socket
  };
} 