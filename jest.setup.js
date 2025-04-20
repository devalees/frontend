// Import testing utilities
require('@testing-library/jest-dom');

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock Intersection Observer
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
});
window.IntersectionObserver = mockIntersectionObserver;

// Mock ResizeObserver
const mockResizeObserver = jest.fn();
mockResizeObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
});
window.ResizeObserver = mockResizeObserver;

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return require('react').createElement('img', props);
  },
}));

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }) => {
    return require('react').createElement('a', { href, ...props }, children);
  }
}));

// Mock next/router
jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
    isFallback: false,
  })),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  __esModule: true,
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useParams: jest.fn(() => ({})),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
    getAll: jest.fn(),
    has: jest.fn(),
    forEach: jest.fn(),
    entries: jest.fn(),
    keys: jest.fn(),
    values: jest.fn(),
  })),
  redirect: jest.fn(),
  notFound: jest.fn(),
}));

// Mock Response, Headers, and Blob if not available
if (typeof window.Response === 'undefined') {
  class Headers {
    constructor(init) {
      this.headers = {};
      if (init) {
        Object.keys(init).forEach(key => {
          this.headers[key.toLowerCase()] = init[key];
        });
      }
    }
    append(name, value) {
      this.headers[name.toLowerCase()] = value;
    }
    delete(name) {
      delete this.headers[name.toLowerCase()];
    }
    get(name) {
      return this.headers[name.toLowerCase()] || null;
    }
    has(name) {
      return name.toLowerCase() in this.headers;
    }
    set(name, value) {
      this.headers[name.toLowerCase()] = value;
    }
    forEach(callback) {
      Object.keys(this.headers).forEach(key => {
        callback(this.headers[key], key, this);
      });
    }
  }

  class Response {
    constructor(body, options = {}) {
      this._body = body;
      this.status = options.status || 200;
      this.statusText = options.statusText || '';
      this.headers = options.headers instanceof Headers ? options.headers : new Headers(options.headers);
      this.ok = this.status >= 200 && this.status < 300;
      this.type = 'basic';
      this.url = options.url || '';
    }
    
    json() {
      return Promise.resolve(
        typeof this._body === 'string' ? JSON.parse(this._body) : this._body
      );
    }
    
    text() {
      return Promise.resolve(
        typeof this._body === 'string' ? this._body : JSON.stringify(this._body)
      );
    }
    
    blob() {
      return Promise.resolve(new Blob([this._body]));
    }
    
    arrayBuffer() {
      return Promise.resolve(new ArrayBuffer(0));
    }
    
    clone() {
      return new Response(this._body, {
        status: this.status,
        statusText: this.statusText,
        headers: this.headers,
        url: this.url
      });
    }
  }

  window.Headers = Headers;
  window.Response = Response;
}

// Mock fetch API if it doesn't exist
if (typeof global.fetch === 'undefined') {
  global.fetch = jest.fn().mockImplementation(() => 
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(''),
      blob: () => Promise.resolve(new Blob()),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0))
    })
  );
}

// Mock axios
jest.mock('axios', () => {
  const axios = {
    __esModule: true,
    default: jest.fn(() => Promise.resolve({ data: {} })),
    get: jest.fn(() => Promise.resolve({ data: {} })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
    patch: jest.fn(() => Promise.resolve({ data: {} })),
    request: jest.fn(() => Promise.resolve({ data: {} })),
    create: jest.fn(function() {
      return {
        interceptors: {
          request: { use: jest.fn(), eject: jest.fn() },
          response: { use: jest.fn(), eject: jest.fn() }
        },
        get: axios.get,
        post: axios.post,
        put: axios.put,
        delete: axios.delete,
        patch: axios.patch,
        request: axios.request
      };
    }),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() }
    }
  };
  
  return axios;
});

// Fix jest.waitFor (which doesn't exist) - provide adapter for tests that use it
jest.waitFor = async (callback, options = {}) => {
  const { timeout = 1000, interval = 50 } = options;
  const startTime = Date.now();
  
  while (true) {
    try {
      const result = await callback();
      return result;
    } catch (error) {
      if (Date.now() - startTime > timeout) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }
};

// Mock performance api
jest.mock('perf_hooks', () => ({
  performance: {
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByType: jest.fn(() => []),
    getEntriesByName: jest.fn(() => []),
    clearMarks: jest.fn(),
    clearMeasures: jest.fn(),
    now: jest.fn(() => Date.now())
  }
}));

// Service worker mocks
Object.defineProperty(window, 'caches', {
  value: {
    open: jest.fn(() => Promise.resolve({
      put: jest.fn(),
      match: jest.fn(),
      delete: jest.fn(),
      keys: jest.fn(() => Promise.resolve([]))
    })),
    match: jest.fn(),
    has: jest.fn(),
    delete: jest.fn(),
    keys: jest.fn()
  },
  writable: true
});

if (!window.navigator.serviceWorker) {
  Object.defineProperty(window.navigator, 'serviceWorker', {
    value: {
      register: jest.fn(() => Promise.resolve({ scope: 'https://example.com/' })),
      ready: Promise.resolve({
        active: { postMessage: jest.fn() }
      }),
      controller: {
        postMessage: jest.fn()
      }
    },
    writable: true
  });
}

// Reset all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Set default timeout for async tests
jest.setTimeout(10000); 