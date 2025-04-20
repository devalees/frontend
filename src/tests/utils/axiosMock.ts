/**
 * A wrapper for axios-mock-adapter to handle the various issues with Next.js and Jest
 */
import axios from 'axios';

// Set up the axios mocks first
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
  request: jest.fn(),
  create: jest.fn(() => ({
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn()
  }))
}));

// Create a proxy to allow axios-mock-adapter to work properly in tests
class MockAdapterProxy {
  private mockMethods: Record<string, jest.Mock>;
  
  constructor() {
    this.mockMethods = {
      onGet: jest.fn(),
      onPost: jest.fn(),
      onPut: jest.fn(),
      onPatch: jest.fn(),
      onDelete: jest.fn(),
      onHead: jest.fn(),
      onOptions: jest.fn(),
      onAny: jest.fn(),
      restore: jest.fn(),
      reset: jest.fn(),
      resetHistory: jest.fn(),
    };
  }
  
  // All methods return the instance for chaining
  onGet(url: string, data?: any) {
    this.mockMethods.onGet(url, data);
    return this;
  }
  
  onPost(url: string, data?: any) {
    this.mockMethods.onPost(url, data);
    return this;
  }
  
  onPut(url: string, data?: any) {
    this.mockMethods.onPut(url, data);
    return this;
  }
  
  onPatch(url: string, data?: any) {
    this.mockMethods.onPatch(url, data);
    return this;
  }
  
  onDelete(url: string, data?: any) {
    this.mockMethods.onDelete(url, data);
    return this;
  }
  
  onHead(url: string, data?: any) {
    this.mockMethods.onHead(url, data);
    return this;
  }
  
  onOptions(url: string, data?: any) {
    this.mockMethods.onOptions(url, data);
    return this;
  }
  
  onAny(url: string, data?: any) {
    this.mockMethods.onAny(url, data);
    return this;
  }
  
  // Method chaining helpers
  reply(status: number, data?: any, headers?: any) {
    // Setup the reply for whichever method was called before this
    // In our replaced implementation, we just mock axios directly
    (axios.get as jest.Mock).mockResolvedValue({
      data: data || {},
      status: status,
      statusText: status === 200 ? 'OK' : 'Error',
      headers: headers || {},
      config: {}
    });
    
    (axios.post as jest.Mock).mockResolvedValue({
      data: data || {},
      status: status,
      statusText: status === 200 ? 'OK' : 'Error',
      headers: headers || {},
      config: {}
    });
    
    (axios.put as jest.Mock).mockResolvedValue({
      data: data || {},
      status: status,
      statusText: status === 200 ? 'OK' : 'Error',
      headers: headers || {},
      config: {}
    });
    
    (axios.delete as jest.Mock).mockResolvedValue({
      data: data || {},
      status: status,
      statusText: status === 200 ? 'OK' : 'Error',
      headers: headers || {},
      config: {}
    });
    
    (axios.patch as jest.Mock).mockResolvedValue({
      data: data || {},
      status: status,
      statusText: status === 200 ? 'OK' : 'Error',
      headers: headers || {},
      config: {}
    });
    
    (axios.request as jest.Mock).mockResolvedValue({
      data: data || {},
      status: status,
      statusText: status === 200 ? 'OK' : 'Error',
      headers: headers || {},
      config: {}
    });
    
    return this;
  }
  
  replyOnce(status: number, data?: any, headers?: any) {
    // Similar to reply but only happens once
    (axios.get as jest.Mock).mockResolvedValueOnce({
      data: data || {},
      status: status,
      statusText: status === 200 ? 'OK' : 'Error',
      headers: headers || {},
      config: {}
    });
    
    (axios.post as jest.Mock).mockResolvedValueOnce({
      data: data || {},
      status: status,
      statusText: status === 200 ? 'OK' : 'Error',
      headers: headers || {},
      config: {}
    });
    
    (axios.put as jest.Mock).mockResolvedValueOnce({
      data: data || {},
      status: status,
      statusText: status === 200 ? 'OK' : 'Error',
      headers: headers || {},
      config: {}
    });
    
    (axios.delete as jest.Mock).mockResolvedValueOnce({
      data: data || {},
      status: status,
      statusText: status === 200 ? 'OK' : 'Error',
      headers: headers || {},
      config: {}
    });
    
    (axios.patch as jest.Mock).mockResolvedValueOnce({
      data: data || {},
      status: status,
      statusText: status === 200 ? 'OK' : 'Error',
      headers: headers || {},
      config: {}
    });
    
    (axios.request as jest.Mock).mockResolvedValueOnce({
      data: data || {},
      status: status,
      statusText: status === 200 ? 'OK' : 'Error',
      headers: headers || {},
      config: {}
    });
    
    return this;
  }
  
  networkError() {
    // Mock network error for all axios methods
    const networkError = new Error('Network Error');
    (axios.get as jest.Mock).mockRejectedValue(networkError);
    (axios.post as jest.Mock).mockRejectedValue(networkError);
    (axios.put as jest.Mock).mockRejectedValue(networkError);
    (axios.delete as jest.Mock).mockRejectedValue(networkError);
    (axios.patch as jest.Mock).mockRejectedValue(networkError);
    (axios.request as jest.Mock).mockRejectedValue(networkError);
    return this;
  }
  
  timeout() {
    // Mock timeout error for all axios methods
    const timeoutError = new Error('Timeout');
    (axios.get as jest.Mock).mockRejectedValue(timeoutError);
    (axios.post as jest.Mock).mockRejectedValue(timeoutError);
    (axios.put as jest.Mock).mockRejectedValue(timeoutError);
    (axios.delete as jest.Mock).mockRejectedValue(timeoutError);
    (axios.patch as jest.Mock).mockRejectedValue(timeoutError);
    (axios.request as jest.Mock).mockRejectedValue(timeoutError);
    return this;
  }
  
  // Reset and restore methods
  reset() {
    this.mockMethods.reset();
    jest.resetAllMocks();
    return this;
  }
  
  resetHistory() {
    this.mockMethods.resetHistory();
    jest.clearAllMocks();
    return this;
  }
  
  restore() {
    this.mockMethods.restore();
    jest.restoreAllMocks();
    return this;
  }
}

/**
 * Create a mock adapter for axios without using the actual axios-mock-adapter library
 * This works as a compatibility layer for tests originally written with axios-mock-adapter
 */
export class MockAdapter extends MockAdapterProxy {
  constructor(axiosInstance: typeof axios) {
    super();
    // We don't actually use the axiosInstance because we're directly mocking the methods
  }
}

// Export a default instance for easy import
export default MockAdapter; 