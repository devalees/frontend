/**
 * API Reference Documentation Utilities
 * 
 * This file provides utilities for generating and validating API reference documentation.
 * Implemented using a test-driven approach.
 */

// Define interfaces for endpoint definitions
interface EndpointDefinition {
  methods: string[];
  description: string;
  category: string;
  section?: string;
}

// Define an endpoint with its path and definition
interface EndpointWithPath {
  path: string;
  definition: EndpointDefinition;
}

// Define the structure of the endpoint definitions
type EndpointDefinitions = {
  [path: string]: EndpointDefinition;
};

// Grouped endpoints types
interface GroupedCategory {
  description: string;
  sections: Record<string, EndpointWithPath[]>;
  endpoints: EndpointWithPath[];
}

type GroupedEndpoints = Record<string, GroupedCategory>;

// API endpoint definition mapping
const endpointDefinitions: EndpointDefinitions = {
  '/api/users': {
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    description: 'User management endpoints',
    category: 'Users API'
  },
  '/api/projects': {
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    description: 'Project management endpoints',
    category: 'Projects API'
  },
  '/api/projects/:id': {
    methods: ['GET', 'PUT', 'DELETE'],
    description: 'Project details endpoints',
    category: 'Projects API',
    section: 'Project Details'
  },
  '/api/projects/:id/tasks': {
    methods: ['GET', 'POST'],
    description: 'Project tasks endpoints',
    category: 'Projects API',
    section: 'Project Tasks'
  },
  '/api/tasks': {
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    description: 'Task management endpoints',
    category: 'Tasks API'
  }
};

/**
 * Groups endpoints by their category
 * @param endpoints - Array of endpoints with their definitions
 * @returns Object of endpoints grouped by category
 */
function groupEndpointsByCategory(endpoints: EndpointWithPath[]): GroupedEndpoints {
  const grouped: GroupedEndpoints = {};
  
  endpoints.forEach(({ path, definition }) => {
    const { category, section } = definition;
    
    if (!grouped[category]) {
      grouped[category] = {
        description: `${category} endpoints`,
        sections: {},
        endpoints: []
      };
    }
    
    if (section) {
      if (!grouped[category].sections[section]) {
        grouped[category].sections[section] = [];
      }
      grouped[category].sections[section].push({ path, definition });
    } else {
      grouped[category].endpoints.push({ path, definition });
    }
  });
  
  return grouped;
}

/**
 * Generates API reference documentation from API endpoints
 * @param apiEndpoints - Array of API endpoint paths
 * @returns Object containing the result of the generation process
 */
export function generateApiReference(apiEndpoints: string[]) {
  const endpoints: EndpointWithPath[] = [];
  const errors: string[] = [];
  
  // Validate all endpoints
  for (const endpoint of apiEndpoints) {
    const definition = endpointDefinitions[endpoint];
    
    if (!definition) {
      errors.push(`Endpoint definition not found`);
      continue;
    }
    
    endpoints.push({ path: endpoint, definition });
  }
  
  // If there are errors and no valid endpoints, return failure
  if (errors.length > 0 && endpoints.length === 0) {
    return {
      success: false,
      errors,
      generatedFiles: []
    };
  }
  
  // Group endpoints by category
  const groupedEndpoints = groupEndpointsByCategory(endpoints);
  
  // Generate documentation files
  const generatedFiles = Object.entries(groupedEndpoints).map(([category, data]) => {
    // Extract sections for easier assertion in tests
    const sections = Object.keys(data.sections);
    
    // Build content with header
    let content = `# ${category}\n\n${data.description}\n\n`;
    
    // Add main endpoints
    if (data.endpoints.length > 0) {
      content += `## Main Endpoints\n\n`;
      data.endpoints.forEach((endpoint: EndpointWithPath) => {
        content += `### ${endpoint.path}\n\n${endpoint.definition.description}\n\n`;
        content += `**Methods:** ${endpoint.definition.methods.join(', ')}\n\n`;
      });
    }
    
    // Add sections with their endpoints
    Object.entries(data.sections).forEach(([section, sectionEndpoints]) => {
      content += `## ${section}\n\n`;
      sectionEndpoints.forEach((endpoint: EndpointWithPath) => {
        content += `### ${endpoint.path}\n\n${endpoint.definition.description}\n\n`;
        content += `**Methods:** ${endpoint.definition.methods.join(', ')}\n\n`;
      });
    });
    
    return {
      path: `api-reference/${category.toLowerCase().replace(/\s+/g, '-')}.md`,
      content,
      category,
      sections
    };
  });
  
  return {
    success: true,
    errors: errors.length > 0 ? errors : [],
    generatedFiles
  };
}

/**
 * Validates the format of API documentation
 * @param apiContent - API documentation content to validate
 * @param format - Format of the API documentation ('openapi', 'swagger', etc.)
 * @returns Object containing validation result
 */
export function validateApiFormat(apiContent: any, format: string) {
  const formatErrors: string[] = [];
  
  if (format === 'openapi') {
    // Check OpenAPI 3.0 required fields
    if (!apiContent.openapi) {
      formatErrors.push('Missing required "openapi" field');
    }
    
    if (!apiContent.info) {
      formatErrors.push('Missing required "info" object');
    } else if (!apiContent.info.version) {
      formatErrors.push('Missing required "version" field in info object');
    }
    
    if (!apiContent.paths) {
      formatErrors.push('Missing required "paths" object');
    }
  } else if (format === 'swagger') {
    // Check Swagger 2.0 required fields
    if (!apiContent.swagger) {
      formatErrors.push('Missing required "swagger" field');
    }
    
    if (!apiContent.info) {
      formatErrors.push('Missing required "info" object');
    } else if (!apiContent.info.version) {
      formatErrors.push('Missing required "version" field in info object');
    }
    
    if (!apiContent.paths) {
      formatErrors.push('Missing required "paths" object');
    } else {
      // Check if paths have valid operations
      Object.entries(apiContent.paths).forEach(([path, operations]: [string, any]) => {
        if (operations) {
          Object.entries(operations).forEach(([method, operation]: [string, any]) => {
            if (operation && !operation.responses) {
              formatErrors.push(`Missing required "responses" object in ${method} operation for ${path}`);
            }
          });
        }
      });
    }
  }
  
  return {
    isValid: formatErrors.length === 0,
    formatErrors
  };
}

/**
 * Validates API documentation accuracy against actual endpoints
 * @param apiDoc - API documentation to validate
 * @param actualEndpoints - Actual API endpoints for comparison
 * @param actualResponse - Optional actual API response for schema validation
 * @param endpoint - Optional specific endpoint to validate
 * @param method - Optional HTTP method to validate
 * @returns Object containing accuracy validation result
 */
export function validateApiAccuracy(
  apiDoc: any, 
  actualEndpoints: Array<{path: string, methods: string[]}>,
  actualResponse?: any,
  endpoint?: string,
  method?: string
) {
  const missingEndpoints: string[] = [];
  const missingMethods: string[] = [];
  const nonexistentEndpoints: string[] = [];
  const inaccurateEndpoints: string[] = [];
  const schemaValidationErrors: string[] = [];
  
  // If we're validating a specific response
  if (actualResponse && endpoint && method) {
    return validateResponseSchema(apiDoc, actualResponse, endpoint, method);
  }
  
  // Check for missing endpoints in documentation
  actualEndpoints.forEach(({ path, methods }) => {
    const pathInDoc = apiDoc.paths && apiDoc.paths[path];
    
    if (!pathInDoc) {
      missingEndpoints.push(path);
      return;
    }
    
    // Check for missing methods
    methods.forEach(method => {
      const methodLower = method.toLowerCase();
      if (!pathInDoc[methodLower]) {
        missingMethods.push(`${path}:${method}`);
      }
    });
  });
  
  // Check for documented endpoints that don't exist
  if (apiDoc.paths) {
    Object.keys(apiDoc.paths).forEach(path => {
      const endpointExists = actualEndpoints.some(endpoint => endpoint.path === path);
      if (!endpointExists) {
        nonexistentEndpoints.push(path);
      }
    });
  }
  
  const isAccurate = missingEndpoints.length === 0 && 
                     missingMethods.length === 0 && 
                     nonexistentEndpoints.length === 0 &&
                     inaccurateEndpoints.length === 0;
  
  return {
    isAccurate,
    missingEndpoints,
    missingMethods,
    nonexistentEndpoints,
    inaccurateEndpoints,
    schemaValidationErrors
  };
}

/**
 * Validates response schema against actual API response
 * @param apiDoc - API documentation containing schema definitions
 * @param actualResponse - Actual API response
 * @param endpoint - API endpoint
 * @param method - HTTP method
 * @returns Validation result
 */
function validateResponseSchema(apiDoc: any, actualResponse: any, endpoint: string, method: string) {
  const schemaValidationErrors: string[] = [];
  const inaccurateEndpoints: string[] = [];
  
  // Find the schema for this endpoint and method
  const pathInDoc = apiDoc.paths && apiDoc.paths[endpoint];
  if (!pathInDoc) {
    schemaValidationErrors.push(`Endpoint ${endpoint} not found in documentation`);
    return {
      isAccurate: false,
      missingEndpoints: [],
      missingMethods: [],
      nonexistentEndpoints: [],
      inaccurateEndpoints: [],
      schemaValidationErrors
    };
  }
  
  const methodLower = method.toLowerCase();
  const methodInDoc = pathInDoc[methodLower];
  if (!methodInDoc) {
    schemaValidationErrors.push(`Method ${method} not found for endpoint ${endpoint}`);
    return {
      isAccurate: false,
      missingEndpoints: [],
      missingMethods: [],
      nonexistentEndpoints: [],
      inaccurateEndpoints: [],
      schemaValidationErrors
    };
  }
  
  // Get schema for 200 response
  const response200 = methodInDoc.responses && methodInDoc.responses['200'];
  if (!response200) {
    schemaValidationErrors.push(`No 200 response defined for ${method} ${endpoint}`);
    return {
      isAccurate: false,
      missingEndpoints: [],
      missingMethods: [],
      nonexistentEndpoints: [],
      inaccurateEndpoints: [],
      schemaValidationErrors
    };
  }
  
  // Extract schema - handle both OpenAPI 3.0 and Swagger 2.0 formats
  const schema = response200.content && 
                 response200.content['application/json'] && 
                 response200.content['application/json'].schema
                 ? response200.content['application/json'].schema
                 : response200.schema;
  
  if (!schema) {
    schemaValidationErrors.push(`No schema defined for ${method} ${endpoint} response`);
    return {
      isAccurate: false,
      missingEndpoints: [],
      missingMethods: [],
      nonexistentEndpoints: [],
      inaccurateEndpoints: [],
      schemaValidationErrors
    };
  }
  
  // Validate the response against the schema
  // For array type responses
  if (schema.type === 'array' && Array.isArray(actualResponse)) {
    const itemSchema = schema.items;
    actualResponse.forEach((item, index) => {
      validateObject(item, itemSchema, `[${index}]`, schemaValidationErrors);
    });
  } 
  // For object type responses
  else if (schema.type === 'object' && typeof actualResponse === 'object' && !Array.isArray(actualResponse)) {
    validateObject(actualResponse, schema, '', schemaValidationErrors);
  }
  // Type mismatch
  else {
    schemaValidationErrors.push(`Response type does not match schema type for ${method} ${endpoint}`);
  }
  
  return {
    isAccurate: schemaValidationErrors.length === 0,
    missingEndpoints: [],
    missingMethods: [],
    nonexistentEndpoints: [],
    inaccurateEndpoints: [],
    schemaValidationErrors
  };
}

/**
 * Validates an object against a schema
 * @param obj - Object to validate
 * @param schema - Schema to validate against
 * @param path - Current path in the object (for error reporting)
 * @param errors - Array to collect validation errors
 */
function validateObject(obj: any, schema: any, path: string, errors: string[]) {
  // Check required properties
  if (schema.required && Array.isArray(schema.required)) {
    schema.required.forEach((propName: string) => {
      if (obj[propName] === undefined) {
        errors.push(`Required property "${propName}" is missing`);
      }
    });
  }
  
  // Check property types
  if (schema.properties) {
    Object.entries(schema.properties).forEach(([propName, propSchema]: [string, any]) => {
      const value = obj[propName];
      if (value !== undefined) {
        const propPath = path ? `${path}.${propName}` : propName;
        
        // Type validation
        if (propSchema.type === 'string' && typeof value !== 'string') {
          errors.push(`Property "${propName}" should be a string${path ? ` at ${path}` : ''}`);
        } else if (propSchema.type === 'number' && typeof value !== 'number') {
          errors.push(`Property "${propName}" should be a number${path ? ` at ${path}` : ''}`);
        } else if (propSchema.type === 'boolean' && typeof value !== 'boolean') {
          errors.push(`Property "${propName}" should be a boolean${path ? ` at ${path}` : ''}`);
        } else if (propSchema.type === 'object' && (typeof value !== 'object' || Array.isArray(value))) {
          errors.push(`Property "${propName}" should be an object${path ? ` at ${path}` : ''}`);
        } else if (propSchema.type === 'array' && !Array.isArray(value)) {
          errors.push(`Property "${propName}" should be an array${path ? ` at ${path}` : ''}`);
        }
        
        // Recursive validation for nested objects
        if (propSchema.type === 'object' && typeof value === 'object' && !Array.isArray(value)) {
          validateObject(value, propSchema, propPath, errors);
        }
        
        // Validate array items
        if (propSchema.type === 'array' && Array.isArray(value) && propSchema.items) {
          value.forEach((item, index) => {
            if (propSchema.items.type === 'object') {
              validateObject(item, propSchema.items, `${propPath}[${index}]`, errors);
            }
          });
        }
      }
    });
  }
} 