/**
 * Test file for API examples generation, validation, and testing
 * 
 * This file contains tests for generating, validating, and testing API examples.
 * It follows the test-driven development approach with failing tests first.
 */

// Import the centralized testing utilities
import { describe, it, expect, vi, beforeEach, afterEach } from '../../tests/utils';
import { render, screen, act, waitFor } from '../../tests/utils';
import { 
  createErrorResponse, 
  createUserFixture, 
  createProjectFixture,
  createPaginatedResponse
} from '../../tests/utils/fixtures';

// Import the function implementations that will be developed later
import { 
  generateApiExamples, 
  validateApiExamples,
  testApiExamples,
  ApiExample 
} from '../../lib/documentation/apiExamples';

describe('API Examples Documentation', () => {
  describe('Example Generation', () => {
    it('should generate code examples for each API endpoint', () => {
      // Arrange
      const endpoints = [
        '/api/users',
        '/api/projects',
        '/api/tasks'
      ];
      
      // Act
      const result = generateApiExamples(endpoints);
      
      // Assert
      expect(result.success).toBe(true);
      expect(result.examples).toBeDefined();
      expect(result.examples.length).toBeGreaterThan(0);
      expect(result.examples[0].code).toBeDefined();
      expect(result.examples[0].endpoint).toBeDefined();
    });
    
    it('should include examples for multiple programming languages', () => {
      // Arrange
      const endpoints = ['/api/users'];
      
      // Act
      const result = generateApiExamples(endpoints);
      
      // Assert
      expect(result.success).toBe(true);
      expect(result.examples[0].languages).toContain('javascript');
      expect(result.examples[0].languages).toContain('typescript');
      expect(result.examples[0].languages).toContain('curl');
      expect(Object.keys(result.examples[0].codeByLanguage).length).toBeGreaterThanOrEqual(3);
    });
    
    it('should generate request and response examples', () => {
      // Arrange
      const endpoints = ['/api/users'];
      
      // Act
      const result = generateApiExamples(endpoints);
      
      // Assert
      expect(result.success).toBe(true);
      expect(result.examples[0].request).toBeDefined();
      expect(result.examples[0].response).toBeDefined();
      expect(result.examples[0].request.headers).toBeDefined();
      expect(result.examples[0].request.body).toBeDefined();
      expect(result.examples[0].response.statusCode).toBeDefined();
      expect(result.examples[0].response.body).toBeDefined();
    });
    
    it('should handle error cases in API examples', () => {
      // Arrange
      const endpoints = ['/api/users'];
      
      // Act
      const result = generateApiExamples(endpoints, { includeErrorCases: true });
      
      // Assert
      expect(result.success).toBe(true);
      
      // Should find at least one error example
      const hasErrorExample = result.examples.some((ex: ApiExample) => 
        ex.response.statusCode >= 400 && ex.response.statusCode < 600
      );
      
      expect(hasErrorExample).toBe(true);
    });
    
    it('should generate examples that include authentication', () => {
      // Arrange
      const endpoints = ['/api/users/me'];
      
      // Act
      const result = generateApiExamples(endpoints);
      
      // Assert
      expect(result.success).toBe(true);
      expect(result.examples[0].request.headers.Authorization).toBeDefined();
      expect(result.examples[0].request.headers.Authorization).toContain('Bearer');
    });
  });
  
  describe('Example Validation', () => {
    it('should validate that example syntax is correct', () => {
      // Arrange
      const example = {
        endpoint: '/api/users',
        method: 'GET',
        languages: ['javascript', 'typescript', 'curl'],
        codeByLanguage: {
          javascript: 'fetch("/api/users").then(res => res.json())',
          typescript: 'const response = await fetch("/api/users"); const data = await response.json();',
          curl: 'curl -X GET /api/users'
        },
        request: {
          headers: {},
          body: null
        },
        response: {
          statusCode: 200,
          body: { users: [] }
        }
      };
      
      // Act
      const result = validateApiExamples([example]);
      
      // Assert
      expect(result.isValid).toBe(true);
      expect(result.syntaxErrors).toHaveLength(0);
    });
    
    it('should detect invalid JavaScript syntax in examples', () => {
      // Arrange
      const exampleWithSyntaxError = {
        endpoint: '/api/users',
        method: 'GET',
        languages: ['javascript'],
        codeByLanguage: {
          javascript: 'fetch("/api/users".then(res => res.json()))' // Missing closing parenthesis
        },
        request: {
          headers: {},
          body: null
        },
        response: {
          statusCode: 200,
          body: { users: [] }
        }
      };
      
      // Act
      const result = validateApiExamples([exampleWithSyntaxError]);
      
      // Assert
      expect(result.isValid).toBe(false);
      expect(result.syntaxErrors).toHaveLength(1);
      expect(result.syntaxErrors[0].message).toContain('Syntax error');
    });
    
    it('should validate that examples match OpenAPI specification', () => {
      // Arrange
      const example = {
        endpoint: '/api/users',
        method: 'GET',
        languages: ['javascript'],
        codeByLanguage: {
          javascript: 'fetch("/api/users").then(res => res.json())'
        },
        request: {
          headers: {},
          body: null
        },
        response: {
          statusCode: 200,
          body: { users: [] }
        }
      };
      
      const openApiSpec = {
        paths: {
          '/api/users': {
            get: {
              responses: {
                '200': {
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          users: {
                            type: 'array'
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      };
      
      // Act
      const result = validateApiExamples([example], openApiSpec);
      
      // Assert
      expect(result.isValid).toBe(true);
      expect(result.specErrors).toHaveLength(0);
    });
    
    it('should detect examples that do not match OpenAPI specification', () => {
      // Arrange
      const example = {
        endpoint: '/api/users',
        method: 'GET',
        languages: ['javascript'],
        codeByLanguage: {
          javascript: 'fetch("/api/users").then(res => res.json())'
        },
        request: {
          headers: {},
          body: null
        },
        response: {
          statusCode: 200,
          body: { employees: [] } // Should be 'users' according to the spec
        }
      };
      
      const openApiSpec = {
        paths: {
          '/api/users': {
            get: {
              responses: {
                '200': {
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          users: {
                            type: 'array'
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      };
      
      // Act
      const result = validateApiExamples([example], openApiSpec);
      
      // Assert
      expect(result.isValid).toBe(false);
      expect(result.specErrors).toHaveLength(1);
      expect(result.specErrors[0].message).toContain('does not match schema');
    });
  });
  
  describe('Example Testing', () => {
    beforeEach(() => {
      // Set up mocks for fetch or axios
      jest.spyOn(global, 'fetch').mockImplementation((url) => {
        if (url === '/api/users') {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ users: [] })
          } as Response);
        }
        return Promise.reject(new Error('Not found'));
      });
    });
    
    afterEach(() => {
      // Clean up mocks
      jest.restoreAllMocks();
    });
    
    it('should execute JavaScript examples to verify they work', async () => {
      // Arrange
      const example = {
        endpoint: '/api/users',
        method: 'GET',
        languages: ['javascript'],
        codeByLanguage: {
          javascript: 'fetch("/api/users").then(res => res.json())'
        },
        request: {
          headers: {},
          body: null
        },
        response: {
          statusCode: 200,
          body: { users: [] }
        }
      };
      
      // Act
      const result = await testApiExamples([example]);
      
      // Assert
      expect(result.success).toBe(true);
      expect(result.testedExamples).toHaveLength(1);
      expect(result.testedExamples[0].passed).toBe(true);
    });
    
    it('should detect and report errors in example execution', async () => {
      // Arrange
      const exampleWithError = {
        endpoint: '/api/nonexistent',
        method: 'GET',
        languages: ['javascript'],
        codeByLanguage: {
          javascript: 'fetch("/api/nonexistent").then(res => res.json())'
        },
        request: {
          headers: {},
          body: null
        },
        response: {
          statusCode: 200, // Expected to succeed but will fail
          body: { data: {} }
        }
      };
      
      // Act
      const result = await testApiExamples([exampleWithError]);
      
      // Assert
      expect(result.success).toBe(false);
      expect(result.testedExamples).toHaveLength(1);
      expect(result.testedExamples[0].passed).toBe(false);
      expect(result.testedExamples[0].error).toBeDefined();
    });
    
    it('should test all code examples across different languages', async () => {
      // Arrange
      const example = {
        endpoint: '/api/users',
        method: 'GET',
        languages: ['javascript', 'typescript'],
        codeByLanguage: {
          javascript: 'fetch("/api/users").then(res => res.json())',
          typescript: 'const response = await fetch("/api/users"); const data = await response.json();'
        },
        request: {
          headers: {},
          body: null
        },
        response: {
          statusCode: 200,
          body: { users: [] }
        }
      };
      
      // Act
      const result = await testApiExamples([example]);
      
      // Assert
      expect(result.success).toBe(true);
      expect(result.testedExamples).toHaveLength(1);
      expect(result.testedExamples[0].testedLanguages).toContain('javascript');
      expect(result.testedExamples[0].testedLanguages).toContain('typescript');
    });
    
    it('should validate response structure matches the expected output', async () => {
      // Arrange
      const example = {
        endpoint: '/api/users',
        method: 'GET',
        languages: ['javascript'],
        codeByLanguage: {
          javascript: 'fetch("/api/users").then(res => res.json())'
        },
        request: {
          headers: {},
          body: null
        },
        response: {
          statusCode: 200,
          body: { users: [{ id: 1, name: 'Test User' }] } // Expected data shape differs from mock
        }
      };
      
      // Act
      const result = await testApiExamples([example]);
      
      // Assert
      expect(result.success).toBe(false);
      expect(result.testedExamples[0].passed).toBe(false);
      expect(result.testedExamples[0].error).toContain('Response structure mismatch');
    });
  });
}); 