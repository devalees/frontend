import { describe, it, expect, vi, beforeEach, afterEach } from '../../tests/utils';
import { Socket } from 'socket.io-client';
import { create, StoreApi } from 'zustand';

// Mock SocketClient interface
interface SocketClient {
  connect(): Promise<void>;
  disconnect(): void;
  isConnected(): boolean;
  on(event: string, callback: (data: any) => void): void;
  off(event: string, callback: (data: any) => void): void;
  emit(event: string, data?: any): void;
  getSocket(): Socket;
}

// Simple store for testing state sync
interface TestStore {
  data: any[];
  loading: boolean;
  error: Error | null;
  addItem: (item: any) => void;
  updateItem: (id: string, item: any) => void;
  removeItem: (id: string) => void;
  setError: (error: Error | null) => void;
  setLoading: (loading: boolean) => void;
}

// Define event types for real-time updates
enum UpdateEvent {
  ITEM_CREATED = 'item:created',
  ITEM_UPDATED = 'item:updated',
  ITEM_DELETED = 'item:deleted',
  SYNC_ERROR = 'sync:error',
  SYNC_COMPLETED = 'sync:completed'
}

// Create a mock implementation for real-time updates
function createRealtimeUpdates(socket: SocketClient, store: StoreApi<TestStore>) {
  const handlers: Record<string, (data: any) => void> = {};
  
  const setupHandlers = () => {
    // Handler for item creation
    handlers[UpdateEvent.ITEM_CREATED] = (data) => {
      store.getState().addItem(data);
    };
    
    // Handler for item updates
    handlers[UpdateEvent.ITEM_UPDATED] = (data) => {
      const { id, ...rest } = data;
      store.getState().updateItem(id, rest);
    };
    
    // Handler for item deletion
    handlers[UpdateEvent.ITEM_DELETED] = (data) => {
      store.getState().removeItem(data.id);
    };
    
    // Handler for sync errors
    handlers[UpdateEvent.SYNC_ERROR] = (error) => {
      store.getState().setError(new Error(error.message));
    };
    
    // Handler for sync completion
    handlers[UpdateEvent.SYNC_COMPLETED] = () => {
      store.getState().setLoading(false);
    };
  };
  
  const subscribe = () => {
    setupHandlers();
    Object.entries(handlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });
  };
  
  const unsubscribe = () => {
    Object.entries(handlers).forEach(([event, handler]) => {
      socket.off(event, handler);
    });
  };
  
  return {
    subscribe,
    unsubscribe,
    getHandlers: () => handlers
  };
}

describe('Real-time Updates', () => {
  let mockSocket: { on: ReturnType<typeof jest.fn>; off: ReturnType<typeof jest.fn>; emit: ReturnType<typeof jest.fn> };
  let socketClient: SocketClient;
  let store: StoreApi<TestStore>;
  let realtimeUpdates: ReturnType<typeof createRealtimeUpdates>;
  
  beforeEach(() => {
    // Setup mock socket
    mockSocket = {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn()
    };
    
    // Setup socket client
    socketClient = {
      connect: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn(),
      isConnected: jest.fn().mockReturnValue(true),
      on: jest.fn().mockImplementation((event, callback) => {
        mockSocket.on(event, callback);
      }),
      off: jest.fn().mockImplementation((event, callback) => {
        mockSocket.off(event, callback);
      }),
      emit: jest.fn().mockImplementation((event, data) => {
        mockSocket.emit(event, data);
      }),
      getSocket: jest.fn().mockReturnValue(mockSocket as unknown as Socket)
    };
    
    // Create a test store
    store = create<TestStore>((set) => ({
      data: [],
      loading: false,
      error: null,
      addItem: (item: any) => set((state) => ({ data: [...state.data, item] })),
      updateItem: (id: string, item: any) => set((state) => ({
        data: state.data.map((existingItem: any) => 
          existingItem.id === id ? { ...existingItem, ...item } : existingItem
        )
      })),
      removeItem: (id: string) => set((state) => ({
        data: state.data.filter((item: any) => item.id !== id)
      })),
      setError: (error: Error | null) => set({ error }),
      setLoading: (loading: boolean) => set({ loading })
    }));
    
    // Create real-time updates
    realtimeUpdates = createRealtimeUpdates(socketClient, store);
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('Update Handling', () => {
    it('should register event handlers when subscribed', () => {
      realtimeUpdates.subscribe();
      
      expect(socketClient.on).toHaveBeenCalledWith(UpdateEvent.ITEM_CREATED, expect.any(Function));
      expect(socketClient.on).toHaveBeenCalledWith(UpdateEvent.ITEM_UPDATED, expect.any(Function));
      expect(socketClient.on).toHaveBeenCalledWith(UpdateEvent.ITEM_DELETED, expect.any(Function));
      expect(socketClient.on).toHaveBeenCalledWith(UpdateEvent.SYNC_ERROR, expect.any(Function));
      expect(socketClient.on).toHaveBeenCalledWith(UpdateEvent.SYNC_COMPLETED, expect.any(Function));
    });
    
    it('should remove event handlers when unsubscribed', () => {
      realtimeUpdates.subscribe();
      realtimeUpdates.unsubscribe();
      
      expect(socketClient.off).toHaveBeenCalledWith(UpdateEvent.ITEM_CREATED, expect.any(Function));
      expect(socketClient.off).toHaveBeenCalledWith(UpdateEvent.ITEM_UPDATED, expect.any(Function));
      expect(socketClient.off).toHaveBeenCalledWith(UpdateEvent.ITEM_DELETED, expect.any(Function));
      expect(socketClient.off).toHaveBeenCalledWith(UpdateEvent.SYNC_ERROR, expect.any(Function));
      expect(socketClient.off).toHaveBeenCalledWith(UpdateEvent.SYNC_COMPLETED, expect.any(Function));
    });
    
    it('should handle item creation events', () => {
      realtimeUpdates.subscribe();
      
      const newItem = { id: '1', name: 'Test Item' };
      const handler = realtimeUpdates.getHandlers()[UpdateEvent.ITEM_CREATED];
      handler(newItem);
      
      expect(store.getState().data).toContainEqual(newItem);
    });
    
    it('should handle item update events', () => {
      // Add an item to the store
      store.getState().addItem({ id: '1', name: 'Test Item', status: 'pending' });
      
      realtimeUpdates.subscribe();
      
      const updatedItem = { id: '1', status: 'completed' };
      const handler = realtimeUpdates.getHandlers()[UpdateEvent.ITEM_UPDATED];
      handler(updatedItem);
      
      expect(store.getState().data[0]).toEqual({ id: '1', name: 'Test Item', status: 'completed' });
    });
    
    it('should handle item deletion events', () => {
      // Add items to the store
      store.getState().addItem({ id: '1', name: 'Item 1' });
      store.getState().addItem({ id: '2', name: 'Item 2' });
      
      realtimeUpdates.subscribe();
      
      const deletePayload = { id: '1' };
      const handler = realtimeUpdates.getHandlers()[UpdateEvent.ITEM_DELETED];
      handler(deletePayload);
      
      expect(store.getState().data).toHaveLength(1);
      expect(store.getState().data[0].id).toBe('2');
    });
  });
  
  describe('State Synchronization', () => {
    it('should update store state when receiving update events', () => {
      realtimeUpdates.subscribe();
      
      // Simulate a series of updates
      const createHandler = realtimeUpdates.getHandlers()[UpdateEvent.ITEM_CREATED];
      const updateHandler = realtimeUpdates.getHandlers()[UpdateEvent.ITEM_UPDATED];
      const deleteHandler = realtimeUpdates.getHandlers()[UpdateEvent.ITEM_DELETED];
      
      createHandler({ id: '1', name: 'Item 1' });
      createHandler({ id: '2', name: 'Item 2' });
      updateHandler({ id: '1', name: 'Updated Item 1' });
      deleteHandler({ id: '2' });
      
      const finalState = store.getState().data;
      expect(finalState).toHaveLength(1);
      expect(finalState[0]).toEqual({ id: '1', name: 'Updated Item 1' });
    });
    
    it('should mark loading as false when sync is completed', () => {
      store.getState().setLoading(true);
      realtimeUpdates.subscribe();
      
      const syncCompletedHandler = realtimeUpdates.getHandlers()[UpdateEvent.SYNC_COMPLETED];
      syncCompletedHandler({});
      
      expect(store.getState().loading).toBe(false);
    });
    
    it('should maintain data consistency across multiple updates', () => {
      realtimeUpdates.subscribe();
      
      const createHandler = realtimeUpdates.getHandlers()[UpdateEvent.ITEM_CREATED];
      const updateHandler = realtimeUpdates.getHandlers()[UpdateEvent.ITEM_UPDATED];
      
      // Add multiple items
      createHandler({ id: '1', value: 10 });
      createHandler({ id: '2', value: 20 });
      createHandler({ id: '3', value: 30 });
      
      // Update in random order
      updateHandler({ id: '3', value: 35 });
      updateHandler({ id: '1', value: 15 });
      updateHandler({ id: '2', value: 25 });
      
      const state = store.getState().data;
      expect(state).toHaveLength(3);
      expect(state[0].value).toBe(15);
      expect(state[1].value).toBe(25);
      expect(state[2].value).toBe(35);
    });
  });
  
  describe('Error Recovery', () => {
    it('should handle sync errors', () => {
      realtimeUpdates.subscribe();
      
      const errorHandler = realtimeUpdates.getHandlers()[UpdateEvent.SYNC_ERROR];
      errorHandler({ message: 'Sync failed' });
      
      expect(store.getState().error).toBeInstanceOf(Error);
      expect(store.getState().error?.message).toBe('Sync failed');
    });
    
    it('should recover from errors when new updates arrive', () => {
      realtimeUpdates.subscribe();
      
      // Set an error
      const errorHandler = realtimeUpdates.getHandlers()[UpdateEvent.SYNC_ERROR];
      errorHandler({ message: 'Sync failed' });
      
      // Create a new item
      const createHandler = realtimeUpdates.getHandlers()[UpdateEvent.ITEM_CREATED];
      createHandler({ id: '1', name: 'New item after error' });
      
      // Error should still exist, but the data should be updated
      expect(store.getState().error).not.toBeNull();
      expect(store.getState().data).toHaveLength(1);
      expect(store.getState().data[0].name).toBe('New item after error');
    });
    
    it('should handle multiple error scenarios', () => {
      realtimeUpdates.subscribe();
      
      const errorHandler = realtimeUpdates.getHandlers()[UpdateEvent.SYNC_ERROR];
      
      // First error
      errorHandler({ message: 'First error' });
      expect(store.getState().error?.message).toBe('First error');
      
      // Second error
      errorHandler({ message: 'Second error' });
      expect(store.getState().error?.message).toBe('Second error');
    });
  });
}); 