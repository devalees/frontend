/**
 * Test file for API reference generation and validation
 * 
 * This file contains tests for generating and validating API references.
 * It follows the test-driven development approach with failing tests first.
 */

// Import the centralized testing utilities
import { describe, it, expect, vi } from '../utils/testingFramework';
import { render } from '../utils/testUtils';
import { createErrorResponse } from '../utils/fixtures';

// Import the function implementations that will be developed later
import { 
  generateApiReference, 
  validateApiFormat, 
  validateApiAccuracy 
} from '../../lib/documentation/apiReference';

describe('API Reference Documentation', () => {
  describe('Reference Generation', () => {
    it('should generate API reference documentation from API endpoints', () => {
      // Arrange
      const apiEndpoints = [
        '/api/users',
        '/api/projects',
        '/api/tasks'
      ];
      
      // Act
      const result = generateApiReference(apiEndpoints);
      
      // Assert
      expect(result.success).toBe(true);
      expect(result.generatedFiles).toBeDefined();
      expect(result.generatedFiles.length).toBeGreaterThan(0);
      expect(result.generatedFiles[0].content).toBeDefined();
      expect(result.generatedFiles[0].path).toContain('api-reference');
    });
    
    it('should detect missing endpoint definitions during generation', () => {
      // Arrange
      const apiEndpoints = [
        '/api/missing-endpoint'
      ];
      
      // Act
      const result = generateApiReference(apiEndpoints);
      
      // Assert
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Endpoint definition not found');
    });
    
    it('should include HTTP method details in generated reference', () => {
      // Arrange
      const apiEndpoints = [
        '/api/users'
      ];
      
      // Act
      const result = generateApiReference(apiEndpoints);
      
      // Assert
      expect(result.success).toBe(true);
      expect(result.generatedFiles[0].content).toContain('GET');
      expect(result.generatedFiles[0].content).toContain('POST');
      expect(result.generatedFiles[0].content).toContain('PUT');
      expect(result.generatedFiles[0].content).toContain('DELETE');
    });
    
    it('should group related endpoints in the generated reference', () => {
      // Arrange
      const apiEndpoints = [
        '/api/projects',
        '/api/projects/:id',
        '/api/projects/:id/tasks'
      ];
      
      // Act
      const result = generateApiReference(apiEndpoints);
      
      // Assert
      expect(result.success).toBe(true);
      expect(result.generatedFiles.length).toBe(1);
      expect(result.generatedFiles[0].content).toContain('Projects API');
      expect(result.generatedFiles[0].sections).toContain('Project Details');
      expect(result.generatedFiles[0].sections).toContain('Project Tasks');
    });
  });
  
  describe('Format Validation', () => {
    it('should validate OpenAPI format correctly', () => {
      // Arrange
      const openApiContent = {
        openapi: '3.0.0',
        info: {
          title: 'Project Management API',
          version: '1.0.0',
          description: 'API for managing projects and tasks'
        },
        paths: {
          '/users': {
            get: {
              summary: 'Get all users',
              responses: {
                '200': {
                  description: 'List of users',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/User'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        components: {
          schemas: {
            User: {
              type: 'object',
              properties: {
                id: {
                  type: 'string'
                },
                name: {
                  type: 'string'
                }
              }
            }
          }
        }
      };
      
      // Act
      const result = validateApiFormat(openApiContent, 'openapi');
      
      // Assert
      expect(result.isValid).toBe(true);
      expect(result.formatErrors).toHaveLength(0);
    });
    
    it('should detect invalid OpenAPI format', () => {
      // Arrange
      const invalidOpenApiContent = {
        openapi: '3.0.0',
        info: {
          title: 'Project Management API',
          // Missing required version field
          description: 'API for managing projects and tasks'
        },
        // Missing required paths object
        components: {
          schemas: {
            User: {
              type: 'object',
              properties: {
                id: {
                  type: 'string'
                }
              }
            }
          }
        }
      };
      
      // Act
      const result = validateApiFormat(invalidOpenApiContent, 'openapi');
      
      // Assert
      expect(result.isValid).toBe(false);
      expect(result.formatErrors).toContain('Missing required "version" field in info object');
      expect(result.formatErrors).toContain('Missing required "paths" object');
    });
    
    it('should validate Swagger format correctly', () => {
      // Arrange
      const swaggerContent = {
        swagger: '2.0',
        info: {
          title: 'Project Management API',
          version: '1.0.0'
        },
        paths: {
          '/users': {
            get: {
              summary: 'Get all users',
              responses: {
                '200': {
                  description: 'List of users',
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/definitions/User'
                    }
                  }
                }
              }
            }
          }
        },
        definitions: {
          User: {
            type: 'object',
            properties: {
              id: {
                type: 'string'
              },
              name: {
                type: 'string'
              }
            }
          }
        }
      };
      
      // Act
      const result = validateApiFormat(swaggerContent, 'swagger');
      
      // Assert
      expect(result.isValid).toBe(true);
      expect(result.formatErrors).toHaveLength(0);
    });
    
    it('should detect invalid Swagger format', () => {
      // Arrange
      const invalidSwaggerContent = {
        swagger: '2.0',
        // Missing required info object
        paths: {
          '/users': {
            get: {
              // Missing required responses object
              summary: 'Get all users'
            }
          }
        }
      };
      
      // Act
      const result = validateApiFormat(invalidSwaggerContent, 'swagger');
      
      // Assert
      expect(result.isValid).toBe(false);
      expect(result.formatErrors).toContain('Missing required "info" object');
      expect(result.formatErrors).toContain('Missing required "responses" object in get operation for /users');
    });
  });
  
  describe('Content Accuracy Validation', () => {
    it('should validate API documentation accuracy against actual endpoints', () => {
      // Arrange
      const apiDoc = {
        paths: {
          '/api/users': {
            get: {
              summary: 'Get all users',
              responses: {
                '200': {
                  description: 'List of users'
                }
              }
            },
            post: {
              summary: 'Create a new user',
              responses: {
                '201': {
                  description: 'User created'
                }
              }
            }
          }
        }
      };
      
      const actualEndpoints = [
        {
          path: '/api/users',
          methods: ['GET', 'POST']
        }
      ];
      
      // Act
      const result = validateApiAccuracy(apiDoc, actualEndpoints);
      
      // Assert
      expect(result.isAccurate).toBe(true);
      expect(result.missingEndpoints).toHaveLength(0);
      expect(result.inaccurateEndpoints).toHaveLength(0);
    });
    
    it('should detect missing endpoints in documentation', () => {
      // Arrange
      const apiDoc = {
        paths: {
          '/api/users': {
            get: {
              summary: 'Get all users',
              responses: {
                '200': {
                  description: 'List of users'
                }
              }
            }
          }
        }
      };
      
      const actualEndpoints = [
        {
          path: '/api/users',
          methods: ['GET', 'POST']
        },
        {
          path: '/api/projects',
          methods: ['GET']
        }
      ];
      
      // Act
      const result = validateApiAccuracy(apiDoc, actualEndpoints);
      
      // Assert
      expect(result.isAccurate).toBe(false);
      expect(result.missingEndpoints).toContain('/api/projects');
      expect(result.missingMethods).toContain('/api/users:POST');
    });
    
    it('should detect documented endpoints that do not exist', () => {
      // Arrange
      const apiDoc = {
        paths: {
          '/api/users': {
            get: {
              summary: 'Get all users',
              responses: {
                '200': {
                  description: 'List of users'
                }
              }
            }
          },
          '/api/nonexistent': {
            get: {
              summary: 'This endpoint does not exist',
              responses: {
                '200': {
                  description: 'Nonexistent response'
                }
              }
            }
          }
        }
      };
      
      const actualEndpoints = [
        {
          path: '/api/users',
          methods: ['GET']
        }
      ];
      
      // Act
      const result = validateApiAccuracy(apiDoc, actualEndpoints);
      
      // Assert
      expect(result.isAccurate).toBe(false);
      expect(result.nonexistentEndpoints).toContain('/api/nonexistent');
    });
    
    it('should handle missing endpoint in documentation schema validation', () => {
      // Arrange
      const apiDoc = {
        paths: {
          // Empty paths object
        }
      };
      
      const actualResponse = [
        { id: '1', name: 'John Doe', email: 'john@example.com' }
      ];
      
      // Act
      const result = validateApiAccuracy(apiDoc, [], actualResponse, '/api/users', 'GET');
      
      // Assert
      expect(result.isAccurate).toBe(false);
      expect(result.schemaValidationErrors).toContain('Endpoint /api/users not found in documentation');
    });
    
    it('should handle missing method in documentation schema validation', () => {
      // Arrange
      const apiDoc = {
        paths: {
          '/api/users': {
            // No GET method
            post: {
              responses: {
                '201': {
                  description: 'User created'
                }
              }
            }
          }
        }
      };
      
      const actualResponse = [
        { id: '1', name: 'John Doe', email: 'john@example.com' }
      ];
      
      // Act
      const result = validateApiAccuracy(apiDoc, [], actualResponse, '/api/users', 'GET');
      
      // Assert
      expect(result.isAccurate).toBe(false);
      expect(result.schemaValidationErrors).toContain('Method GET not found for endpoint /api/users');
    });
    
    it('should handle missing 200 response in documentation schema validation', () => {
      // Arrange
      const apiDoc = {
        paths: {
          '/api/users': {
            get: {
              responses: {
                // No 200 response
                '400': {
                  description: 'Bad request'
                }
              }
            }
          }
        }
      };
      
      const actualResponse = [
        { id: '1', name: 'John Doe', email: 'john@example.com' }
      ];
      
      // Act
      const result = validateApiAccuracy(apiDoc, [], actualResponse, '/api/users', 'GET');
      
      // Assert
      expect(result.isAccurate).toBe(false);
      expect(result.schemaValidationErrors).toContain('No 200 response defined for GET /api/users');
    });
    
    it('should handle missing schema in documentation schema validation', () => {
      // Arrange
      const apiDoc = {
        paths: {
          '/api/users': {
            get: {
              responses: {
                '200': {
                  description: 'Success'
                  // No schema
                }
              }
            }
          }
        }
      };
      
      const actualResponse = [
        { id: '1', name: 'John Doe', email: 'john@example.com' }
      ];
      
      // Act
      const result = validateApiAccuracy(apiDoc, [], actualResponse, '/api/users', 'GET');
      
      // Assert
      expect(result.isAccurate).toBe(false);
      expect(result.schemaValidationErrors).toContain('No schema defined for GET /api/users response');
    });
    
    it('should validate response schemas against actual API responses', () => {
      // Arrange
      const apiDoc = {
        paths: {
          '/api/users': {
            get: {
              responses: {
                '200': {
                  content: {
                    'application/json': {
                      schema: {
                        type: 'array',
                        items: {
                          type: 'object',
                          required: ['id', 'name', 'email'],
                          properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                            email: { type: 'string' }
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
      
      const actualResponse = [
        { id: '1', name: 'John Doe', email: 'john@example.com' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com' }
      ];
      
      // Act
      const result = validateApiAccuracy(apiDoc, [], actualResponse, '/api/users', 'GET');
      
      // Assert
      expect(result.isAccurate).toBe(true);
      expect(result.schemaValidationErrors).toHaveLength(0);
    });
    
    it('should detect schema validation errors against actual responses', () => {
      // Arrange
      const apiDoc = {
        paths: {
          '/api/users': {
            get: {
              responses: {
                '200': {
                  content: {
                    'application/json': {
                      schema: {
                        type: 'array',
                        items: {
                          type: 'object',
                          required: ['id', 'name', 'email', 'role'],
                          properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                            email: { type: 'string' },
                            role: { type: 'string' }
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
      
      const actualResponse = [
        { id: '1', name: 'John Doe', email: 'john@example.com' }, // Missing 'role' property
        { id: '2', name: 'Jane Smith', email: 'jane@example.com' } // Missing 'role' property
      ];
      
      // Act
      const result = validateApiAccuracy(apiDoc, [], actualResponse, '/api/users', 'GET');
      
      // Assert
      expect(result.isAccurate).toBe(false);
      expect(result.schemaValidationErrors).toContain('Required property "role" is missing');
    });
  });
}); 