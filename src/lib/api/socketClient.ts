import { io, Socket } from 'socket.io-client';

/**
 * Socket event types for reconnection and connection events
 */
export enum SocketEvent {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  CONNECT_ERROR = 'connect_error',
  RECONNECT = 'reconnect',
  RECONNECT_ATTEMPT = 'reconnect_attempt',
  RECONNECTING = 'reconnecting',
  RECONNECT_ERROR = 'reconnect_error',
  RECONNECT_FAILED = 'reconnect_failed'
}

/**
 * Default socket options
 */
export interface SocketOptions {
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  reconnectionDelayMax?: number;
  timeout?: number;
  [key: string]: any;
}

/**
 * Default socket options
 */
const DEFAULT_OPTIONS: SocketOptions = {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000
};

/**
 * Socket client interface
 */
export interface SocketClient {
  /**
   * Connect to the socket server
   * @returns Promise that resolves when connected
   */
  connect(): Promise<void>;
  
  /**
   * Disconnect from the socket server
   */
  disconnect(): void;
  
  /**
   * Check if the socket is connected
   * @returns true if connected, false otherwise
   */
  isConnected(): boolean;
  
  /**
   * Check if the socket is connecting
   * @returns true if connecting, false otherwise
   */
  isConnecting(): boolean;
  
  /**
   * Check if the socket is reconnecting
   * @returns true if reconnecting, false otherwise
   */
  isReconnecting(): boolean;
  
  /**
   * Get the socket ID
   * @returns socket ID or null if not connected
   */
  getSocketId(): string | null;
  
  /**
   * Subscribe to an event
   * @param event Event name
   * @param callback Event callback
   */
  on(event: string, callback: (data: any) => void): void;
  
  /**
   * Unsubscribe from an event
   * @param event Event name
   * @param callback Event callback
   */
  off(event: string, callback: (data: any) => void): void;
  
  /**
   * Emit an event with data
   * @param event Event name
   * @param data Event data
   */
  emit(event: string, data?: any): void;
  
  /**
   * Get the underlying socket instance
   * @returns Socket instance
   */
  getSocket(): Socket;
}

/**
 * Socket client implementation
 */
class SocketClientImpl implements SocketClient {
  private socket: Socket;
  private connecting: boolean = false;
  private reconnecting: boolean = false;
  private reconnectAttempt: number = 0;
  private connectPromise: Promise<void> | null = null;
  private connectResolve: ((value?: void | PromiseLike<void>) => void) | null = null;
  private connectReject: ((reason?: any) => void) | null = null;

  constructor(url: string, options: SocketOptions = {}) {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    this.socket = io(url, mergedOptions);
    this.setupEventListeners();
  }

  /**
   * Set up event listeners for the socket
   */
  private setupEventListeners(): void {
    this.socket.on(SocketEvent.CONNECT, () => {
      this.connecting = false;
      this.reconnecting = false;
      this.reconnectAttempt = 0;
      if (this.connectResolve) {
        this.connectResolve();
        this.connectResolve = null;
        this.connectReject = null;
      }
    });

    this.socket.on(SocketEvent.CONNECT_ERROR, (error: Error) => {
      this.connecting = false;
      if (this.connectReject) {
        this.connectReject(error);
        this.connectResolve = null;
        this.connectReject = null;
      }
    });

    this.socket.on(SocketEvent.DISCONNECT, () => {
      this.connecting = false;
      if (this.socket.connected) {
        this.socket.connected = false;
        this.startReconnection();
      }
    });

    this.socket.on(SocketEvent.RECONNECT_ATTEMPT, () => {
      this.reconnecting = true;
      this.reconnectAttempt++;
      this.socket.emit(SocketEvent.RECONNECTING);
    });

    this.socket.on(SocketEvent.RECONNECT, () => {
      this.reconnecting = false;
      this.reconnectAttempt = 0;
      this.socket.emit(SocketEvent.RECONNECT);
    });

    this.socket.on(SocketEvent.RECONNECT_ERROR, () => {
      if (this.reconnectAttempt >= (this.socket.io.opts.reconnectionAttempts || DEFAULT_OPTIONS.reconnectionAttempts!)) {
        this.reconnecting = false;
        this.socket.emit(SocketEvent.RECONNECT_FAILED);
      }
    });
  }

  private startReconnection(): void {
    if (this.socket.io.opts.reconnection) {
      this.reconnecting = true;
      this.reconnectAttempt = 0;
      this.socket.connect();
    }
  }

  /**
   * Connect to the socket server
   * @returns Promise that resolves when connected
   */
  connect(): Promise<void> {
    if (this.connectPromise) {
      return this.connectPromise;
    }

    this.connecting = true;
    this.connectPromise = new Promise<void>((resolve, reject) => {
      this.connectResolve = resolve;
      this.connectReject = reject;

      const timeout = setTimeout(() => {
        if (this.connecting) {
          this.connecting = false;
          reject(new Error('Connection timeout'));
        }
      }, this.socket.io.opts.timeout || DEFAULT_OPTIONS.timeout);

      this.socket.connect();

      this.socket.once(SocketEvent.CONNECT, () => {
        clearTimeout(timeout);
      });
    });

    return this.connectPromise;
  }

  /**
   * Disconnect from the socket server
   */
  disconnect(): void {
    this.connecting = false;
    this.reconnecting = false;
    this.reconnectAttempt = 0;
    this.connectPromise = null;
    this.connectResolve = null;
    this.connectReject = null;
    this.socket.disconnect();
  }

  /**
   * Check if the socket is connected
   * @returns true if connected, false otherwise
   */
  isConnected(): boolean {
    return this.socket.connected;
  }

  /**
   * Check if the socket is connecting
   * @returns true if connecting, false otherwise
   */
  isConnecting(): boolean {
    return this.connecting;
  }

  /**
   * Check if the socket is reconnecting
   * @returns true if reconnecting, false otherwise
   */
  isReconnecting(): boolean {
    return this.reconnecting;
  }

  /**
   * Get the socket ID
   * @returns socket ID or null if not connected
   */
  getSocketId(): string | null {
    return this.socket.connected && this.socket.id ? this.socket.id : null;
  }

  /**
   * Subscribe to an event
   * @param event Event name
   * @param callback Event callback
   */
  on(event: string, callback: (data: any) => void): void {
    this.socket.on(event, callback);
  }

  /**
   * Unsubscribe from an event
   * @param event Event name
   * @param callback Event callback
   */
  off(event: string, callback: (data: any) => void): void {
    this.socket.off(event, callback);
  }

  /**
   * Emit an event with data
   * @param event Event name
   * @param data Event data
   */
  emit(event: string, data?: any): void {
    this.socket.emit(event, data);
  }

  /**
   * Get the underlying socket instance
   * @returns Socket instance
   */
  getSocket(): Socket {
    return this.socket;
  }
}

/**
 * Create a socket client instance
 * @param url WebSocket server URL
 * @param options Socket options
 * @returns Socket client instance
 */
export function createSocketClient(url: string, options: SocketOptions = {}): SocketClient {
  return new SocketClientImpl(url, options);
} 