"use strict";
/**
 * Axios Configuration
 *
 * This file contains the configuration for the Axios client including:
 * - Instance creation
 * - Base configuration
 * - Interceptors
 * - Environment-based configuration
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupInterceptors = exports.configureAxiosDefaults = exports.createAxiosInstance = exports.getEnvironmentConfig = void 0;
var axios_1 = __importDefault(require("axios"));
// Environment variable keys
var ENV_API_URL = 'NEXT_PUBLIC_API_URL';
var ENV_API_TIMEOUT = 'NEXT_PUBLIC_API_TIMEOUT';
// Default configuration
var DEFAULT_TIMEOUT = 10000;
var DEFAULT_BASE_URL = 'http://localhost:8000/api/';
/**
 * Get configuration based on current environment
 * @returns Environment-specific configuration
 */
function getEnvironmentConfig() {
    var isDevelopment = process.env.NODE_ENV === 'development';
    var isTest = process.env.NODE_ENV === 'test';
    // Base configuration
    var config = {
        baseURL: process.env[ENV_API_URL] || DEFAULT_BASE_URL,
        timeout: parseInt(process.env[ENV_API_TIMEOUT] || DEFAULT_TIMEOUT.toString(), 10),
        debug: isDevelopment || isTest,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    // Development-specific configuration
    if (isDevelopment) {
        config.validateStatus = function (status) { return status < 500; };
    }
    // Production-specific configuration
    if (!isDevelopment && !isTest) {
        config.retry = true;
        config.retryDelay = 1000;
        config.maxRetries = 3;
    }
    // Test-specific configuration
    if (isTest) {
        // Keep default timeout for tests to match test expectations
        config.timeout = DEFAULT_TIMEOUT;
        // Only override timeout if explicitly set in environment for tests
        if (process.env[ENV_API_TIMEOUT]) {
            config.timeout = parseInt(process.env[ENV_API_TIMEOUT], 10);
        }
    }
    return config;
}
exports.getEnvironmentConfig = getEnvironmentConfig;
/**
 * Creates an axios instance with the specified configuration
 * @param baseURL - The base URL for the API
 * @param options - Additional axios configuration options
 * @returns An axios instance
 */
var createAxiosInstance = function (baseURL, options) {
    // Get environment configuration
    var envConfig = getEnvironmentConfig();
    // Build configuration with priority:
    // 1. Explicit options passed to function
    // 2. Environment variables
    // 3. Default values
    var config = __assign({ baseURL: baseURL || envConfig.baseURL, timeout: envConfig.timeout, headers: envConfig.headers }, options);
    return axios_1.default.create(config);
};
exports.createAxiosInstance = createAxiosInstance;
/**
 * Configures default settings for all axios requests
 */
var configureAxiosDefaults = function () {
    var envConfig = getEnvironmentConfig();
    axios_1.default.defaults.headers.common['Content-Type'] = 'application/json';
    axios_1.default.defaults.timeout = envConfig.timeout;
    // Add additional headers from environment config
    if (envConfig.headers) {
        Object.entries(envConfig.headers).forEach(function (_a) {
            var key = _a[0], value = _a[1];
            if (key !== 'Content-Type') { // Already set above
                axios_1.default.defaults.headers.common[key] = value;
            }
        });
    }
};
exports.configureAxiosDefaults = configureAxiosDefaults;
/**
 * Sets up interceptors for the axios instance
 * @param instance - The axios instance to configure
 */
var setupInterceptors = function (instance) {
    // Request interceptor for authentication
    instance.interceptors.request.use(function (config) {
        var _a;
        // Get the token from localStorage
        var token = localStorage.getItem('auth_token');
        // If token exists, add it to the Authorization header
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = "Token ".concat(token);
        }
        // Add request logging in debug mode
        var envConfig = getEnvironmentConfig();
        if (envConfig.debug) {
            console.debug('Request:', (_a = config.method) === null || _a === void 0 ? void 0 : _a.toUpperCase(), config.url);
        }
        return config;
    }, function (error) {
        return Promise.reject(error);
    });
    // Response interceptor for error handling
    instance.interceptors.response.use(function (response) {
        // Add response logging in debug mode
        var envConfig = getEnvironmentConfig();
        if (envConfig.debug) {
            console.debug('Response:', response.status, response.config.url);
        }
        return response;
    }, function (error) {
        // Handle specific error cases
        if (error.response) {
            var _a = error.response, status_1 = _a.status, data = _a.data;
            // Handle 401 Unauthorized errors (token expired or invalid)
            if (status_1 === 401) {
                // Clear the token and redirect to login
                localStorage.removeItem('auth_token');
                window.location.href = '/login';
            }
            // Handle 403 Forbidden errors
            if (status_1 === 403) {
                // Handle permission denied
                console.error('Permission denied:', data);
            }
            // Handle 404 Not Found errors
            if (status_1 === 404) {
                // Handle resource not found
                console.error('Resource not found:', data);
            }
            // Handle 500 Internal Server errors
            if (status_1 === 500) {
                // Handle server errors
                console.error('Server error:', data);
            }
        }
        // For network errors or other issues
        if (error.request) {
            console.error('Network error:', error.message);
        }
        else {
            console.error('Error:', error.message);
        }
        return Promise.reject(error);
    });
};
exports.setupInterceptors = setupInterceptors;
// Create a default instance with environment config
var axiosInstance = (0, exports.createAxiosInstance)();
// Configure defaults
(0, exports.configureAxiosDefaults)();
// Set up interceptors
(0, exports.setupInterceptors)(axiosInstance);
exports.default = axiosInstance;
