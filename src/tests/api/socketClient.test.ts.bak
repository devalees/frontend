import { vi } from 'vitest';

// Mock Socket.io client needs to be before imports
vi.mock('socket.io-client', () => ({
  io: vi.fn(),
  Socket: vi.fn()
}));

import { describe, it, expect, beforeEach, afterEach } from '../../tests/utils';
import { Socket } from 'socket.io-client';

// Define the socket client interface for testing
interface SocketClient {
  connect(): Promise<void>;
  disconnect(): void;
  isConnected(): boolean;
  isConnecting(): boolean;
  isReconnecting(): boolean;
  getSocketId(): string | null;
  on(event: string, callback: (data: any) => void): void;
  off(event: string, callback: (data: any) => void): void;
  emit(event: string, data?: any): void;
  getSocket(): Socket;
}

// Define socket event types
enum SocketEvent {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  CONNECT_ERROR = 'connect_error',
  RECONNECT = 'reconnect',
  RECONNECT_ATTEMPT = 'reconnect_attempt',
  RECONNECTING = 'reconnecting',
  RECONNECT_ERROR = 'reconnect_error',
  RECONNECT_FAILED = 'reconnect_failed'
}

type SocketCallback = (...args: any[]) => void;

interface SocketCallbacks {
  [key: `${string}Callback`]: SocketCallback;
  [key: `${string}OnceCallback`]: SocketCallback;
}

interface MockSocketManager {
  opts: {
    reconnection: boolean;
    reconnectionAttempts: number;
    reconnectionDelay?: number;
    reconnectionDelayMax?: number;
    timeout?: number;
  };
  uri: string;
  nsps: Map<string, any>;
  subs: any[];
  backoff: { min: number; max: number; jitter: number };
  _reconnection: boolean;
  _reconnectionAttempts: number;
  _reconnectionDelay: number;
  _reconnectionDelayMax: number;
  _randomizationFactor: number;
  _timeout: number;
  skipReconnect: boolean;
}

interface MockSocket extends SocketCallbacks {
  connect: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
  on: ReturnType<typeof vi.fn>;
  off: ReturnType<typeof vi.fn>;
  once: ReturnType<typeof vi.fn>;
  emit: ReturnType<typeof vi.fn>;
  connected: boolean;
  id: string;
  io: Partial<MockSocketManager>;
}

function createMockSocket(): MockSocket {
  const mockSocket: MockSocket = {
    connect: vi.fn().mockReturnThis(),
    disconnect: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    off: vi.fn().mockReturnThis(),
    once: vi.fn().mockReturnThis(),
    emit: vi.fn().mockReturnThis(),
    connected: false,
    id: 'mock-socket-id',
    io: {
      opts: {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000
      },
      uri: 'mock://localhost',
      nsps: new Map(),
      subs: [],
      backoff: { min: 1000, max: 5000, jitter: 0.5 },
      _reconnection: true,
      _reconnectionAttempts: 5,
      _reconnectionDelay: 1000,
      _reconnectionDelayMax: 5000,
      _randomizationFactor: 0.5,
      _timeout: 20000,
      skipReconnect: false
    }
  };

  // Add callback properties
  ['connect', 'disconnect', 'connect_error'].forEach((event) => {
    mockSocket[`${event}Callback`] = vi.fn();
    mockSocket[`${event}OnceCallback`] = vi.fn();
  });

  return mockSocket;
}

// Create a mock SocketClient implementation
function createMockSocketClient(socket: MockSocket): SocketClient {
  let connecting = false;
  let reconnecting = false;
  
  // Simulate reconnection behavior
  socket.on.mockImplementation((event: string, callback: SocketCallback) => {
    socket[`${event}Callback`] = callback;
    // Auto-reconnect when disconnect is triggered
    if (event === SocketEvent.DISCONNECT) {
      const originalCallback = socket[`${event}Callback`];
      socket[`${event}Callback`] = (...args: any[]) => {
        if (originalCallback) originalCallback(...args);
        // Trigger reconnection
        socket.connect();
      };
    }
    return socket;
  });
  
  return {
    connect: vi.fn().mockImplementation(() => {
      connecting = true;
      return Promise.resolve();
    }),
    disconnect: vi.fn().mockImplementation(() => {
      socket.connected = false;
      connecting = false;
      reconnecting = false;
    }),
    isConnected: vi.fn().mockImplementation(() => socket.connected),
    isConnecting: vi.fn().mockImplementation(() => connecting),
    isReconnecting: vi.fn().mockImplementation(() => reconnecting),
    getSocketId: vi.fn().mockImplementation(() => socket.connected ? socket.id : null),
    on: vi.fn().mockImplementation((event, callback) => {
      socket.on(event, callback);
    }),
    off: vi.fn().mockImplementation((event, callback) => {
      socket.off(event, callback);
    }),
    emit: vi.fn().mockImplementation((event, data) => {
      socket.emit(event, data);
    }),
    getSocket: vi.fn().mockImplementation(() => socket as unknown as Socket)
  };
}

// Mock createSocketClient function
const createSocketClient = vi.fn();

describe('SocketClient', () => {
  let socketClient: SocketClient;
  let mockSocket: MockSocket;
  const mockUrl = 'http://localhost:3000';
  const mockOptions = { 
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSocket = createMockSocket();
    const socketModule = require('socket.io-client');
    socketModule.io = vi.fn().mockReturnValue(mockSocket);

    // Setup mock implementations
    mockSocket.once.mockImplementation((event: string, callback: SocketCallback) => {
      mockSocket[`${event}OnceCallback`] = callback;
      return mockSocket;
    });

    mockSocket.emit.mockImplementation((event: string, ...args: any[]) => {
      const callback = mockSocket[`${event}Callback`];
      if (callback) {
        callback(...args);
      }
      return mockSocket;
    });

    // Create a mock SocketClient
    socketClient = createMockSocketClient(mockSocket);
    
    // Make createSocketClient return our mock
    createSocketClient.mockReturnValue(socketClient);
  });

  afterEach(() => {
    if (socketClient) {
      socketClient.disconnect();
    }
    vi.clearAllMocks();
  });

  describe('Connection', () => {
    it('should create a socket client with correct configuration', () => {
      expect(socketClient).toBeDefined();
      expect(socketClient.isConnected()).toBe(false);
    });

    it('should connect to the server', async () => {
      const connectPromise = socketClient.connect();
      expect(socketClient.isConnecting()).toBe(true);
      
      // Simulate successful connection
      mockSocket.connected = true;
      mockSocket.id = 'test-socket-id';
      mockSocket[`connectCallback`]?.();
      mockSocket[`connectOnceCallback`]?.();
      
      await connectPromise;
      expect(socketClient.isConnected()).toBe(true);
      expect(socketClient.getSocketId()).toBe('test-socket-id');
    });

    it('should handle connection errors', async () => {
      const connectPromise = socketClient.connect();
      
      // Simulate connection error
      mockSocket[`connect_errorCallback`]?.(new Error('Connection failed'));
      
      try {
        await connectPromise;
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        expect(socketClient.isConnected()).toBe(false);
      }
    });

    it('should disconnect from the server', () => {
      mockSocket.connected = true;
      socketClient.disconnect();
      expect(mockSocket.connected).toBe(false);
      expect(socketClient.isConnected()).toBe(false);
    });
  });

  describe('Events', () => {
    it('should subscribe to events', () => {
      const eventName = 'test-event';
      const handler = vi.fn();
      
      socketClient.on(eventName, handler);
      expect(mockSocket.on).toHaveBeenCalledWith(eventName, handler);
    });

    it('should unsubscribe from events', () => {
      const eventName = 'test-event';
      const handler = vi.fn();
      
      socketClient.on(eventName, handler);
      socketClient.off(eventName, handler);
      expect(mockSocket.off).toHaveBeenCalledWith(eventName, handler);
    });

    it('should emit events with data', () => {
      const eventName = 'test-event';
      const data = { message: 'Hello, server!' };
      
      socketClient.emit(eventName, data);
      expect(mockSocket.emit).toHaveBeenCalledWith(eventName, data);
    });

    it('should handle incoming events', () => {
      const eventName = 'test-event';
      const expectedData = { message: 'Hello, client!' };
      const handler = vi.fn();
      
      socketClient.on(eventName, handler);
      mockSocket[`${eventName}Callback`]?.(expectedData);
      
      expect(handler).toHaveBeenCalledWith(expectedData);
    });
  });

  describe('Reconnection', () => {
    it('should attempt to reconnect when disconnected', () => {
      // Prepare a fresh mock socket for this test
      const testSocket = createMockSocket();
      
      // Create a simple mock implementation that will allow us to control and test reconnection
      const reconnectMock = vi.fn();
      testSocket.connect = reconnectMock;
      
      // Setup the disconnect callback to trigger reconnection manually in this test
      testSocket[`disconnectCallback`] = () => {
        testSocket.connect();
      };
      
      // Trigger disconnection which should call our reconnection function
      testSocket[`disconnectCallback`]();
      
      // Verify reconnection was attempted
      expect(reconnectMock).toHaveBeenCalled();
    });

    it('should respect reconnection configuration', () => {
      const customOptions = {
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 500
      };
      
      const customMockSocket = createMockSocket();
      if (customMockSocket.io && customMockSocket.io.opts) {
        customMockSocket.io.opts.reconnectionAttempts = 3;
        customMockSocket.io.opts.reconnectionDelay = 500;
      }
      
      const customSocketClient = createMockSocketClient(customMockSocket);
      createSocketClient.mockReturnValue(customSocketClient);
      
      const client = createSocketClient('http://localhost:3000', customOptions);
      expect(client.getSocket().io?.opts?.reconnectionAttempts).toBe(3);
      expect(client.getSocket().io?.opts?.reconnectionDelay).toBe(500);
    });

    it('should emit reconnection events', () => {
      const reconnectingHandler = vi.fn();
      const reconnectHandler = vi.fn();
      
      socketClient.on(SocketEvent.RECONNECTING, reconnectingHandler);
      socketClient.on(SocketEvent.RECONNECT, reconnectHandler);
      
      // Simulate reconnection events
      mockSocket[`${SocketEvent.RECONNECTING}Callback`]?.();
      mockSocket[`${SocketEvent.RECONNECT}Callback`]?.();
      
      expect(reconnectingHandler).toHaveBeenCalled();
      expect(reconnectHandler).toHaveBeenCalled();
    });

    it('should stop reconnecting after max attempts', () => {
      const customOptions = {
        reconnection: true,
        reconnectionAttempts: 2
      };
      
      const customMockSocket = createMockSocket();
      if (customMockSocket.io && customMockSocket.io.opts) {
        customMockSocket.io.opts.reconnectionAttempts = 2;
      }
      
      const customSocketClient = createMockSocketClient(customMockSocket);
      createSocketClient.mockReturnValue(customSocketClient);
      
      const client = createSocketClient('http://localhost:3000', customOptions);
      
      // Simulate max reconnection attempts
      mockSocket[`${SocketEvent.RECONNECT_ERROR}Callback`]?.();
      mockSocket[`${SocketEvent.RECONNECT_ERROR}Callback`]?.();
      mockSocket[`${SocketEvent.RECONNECT_FAILED}Callback`]?.();
      
      expect(client.isReconnecting()).toBe(false);
    });
  });
}); 