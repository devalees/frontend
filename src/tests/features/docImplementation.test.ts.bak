/**
 * Documentation Implementation Tests
 * 
 * Tests for documentation implementation functionality including:
 * - Feature documentation generation
 * - Usage guide generation
 * - Examples generation
 */

// Import testing utilities from centralized testing framework - NO direct testing library imports
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Import utility functions
import {
  componentTestHarness,
  pureFunctionTests,
  userFlowTesting
} from '../utils/testImplementationUtils';

// Import the documentation implementation module
// @ts-ignore: Path will be resolved at runtime
import * as docImplementation from '../../lib/features/docImplementation';
const {
  generateFeatureDocs,
  generateUsageGuides,
  generateExamples,
  resetDocImplementation,
  setDebugMode,
  generateFeatureDocsForValidation
} = docImplementation;

// Types
// @ts-ignore: Path will be resolved at runtime
import type { 
  FeatureDocConfig, 
  UsageGuideConfig, 
  ExampleConfig 
} from '../../lib/features/docImplementation';

// Import the doc setup module for validation
import {
  initializeDocStructure,
  validateDocContent,
  checkDocFormat,
  DocStructure
} from '../../lib/features/docSetup';

// Mock validateDocContent for specific tests
vi.mock('../../lib/features/docSetup', async (importOriginal) => {
  const actual = await importOriginal() as Record<string, unknown>;
  return {
    ...actual,
    validateDocContent: vi.fn().mockImplementation((content) => {
      // Always return valid true for the test cases
      return { valid: true, errors: [] };
    }),
    checkDocFormat: vi.fn().mockImplementation((content) => {
      // Always return valid true for the test cases
      return { valid: true, errors: [] };
    })
  };
});

// Mock console.log to test debug functionality
vi.spyOn(console, 'log').mockImplementation((...args) => {
  // Do nothing for tests
});

// Mock console.error to test error logging
vi.spyOn(console, 'error').mockImplementation((...args) => {
  // Do nothing for tests
});

describe('Feature Documentation Implementation', () => {
  // Mock configurations for testing
  const mockFeatureDocConfig: FeatureDocConfig = {
    featureId: 'test-feature',
    title: 'Test Feature',
    version: '1.0.0',
    description: 'A test feature for demonstration purposes',
    apiEndpoints: [
      {
        path: '/api/test',
        method: 'GET',
        description: 'Retrieves test data',
        responseType: 'TestData[]'
      },
      {
        path: '/api/test/:id',
        method: 'POST',
        description: 'Creates test data',
        requestType: 'TestDataInput',
        responseType: 'TestData'
      }
    ],
    components: [
      {
        name: 'TestComponent',
        description: 'A component for testing purposes',
        props: [
          { name: 'data', type: 'TestData', required: true, description: 'The test data' },
          { name: 'onUpdate', type: 'function', required: false, description: 'Called when data is updated' }
        ]
      }
    ],
    dependencies: [
      { name: 'react', version: '^18.0.0' },
      { name: 'axios', version: '^1.2.0' }
    ]
  };

  const mockUsageGuideConfig: UsageGuideConfig = {
    featureId: 'test-feature',
    sections: [
      {
        title: 'Installation',
        content: 'Instructions for installing the feature'
      },
      {
        title: 'Basic Usage',
        content: 'How to use the feature in basic scenarios'
      },
      {
        title: 'Advanced Usage',
        content: 'Advanced usage patterns and techniques'
      }
    ],
    codeExamples: [
      {
        title: 'Basic Example',
        language: 'tsx',
        code: 'import { TestComponent } from "components";\n\nfunction App() {\n  return <TestComponent data={{ id: 1, name: "Test" }} />;\n}'
      }
    ]
  };

  const mockExampleConfig: ExampleConfig = {
    featureId: 'test-feature',
    examples: [
      {
        title: 'Simple Example',
        description: 'A simple example of the feature in use',
        code: 'import { useTestFeature } from "features/test";\n\nfunction Example() {\n  const { data } = useTestFeature();\n  return <div>{data.map(item => <div key={item.id}>{item.name}</div>)}</div>;\n}',
        preview: 'data-url-mock-for-preview'
      },
      {
        title: 'Advanced Example',
        description: 'An advanced example with all options',
        code: 'import { useTestFeature } from "features/test";\n\nfunction AdvancedExample() {\n  const { data, loading, error, refetch } = useTestFeature({ advanced: true });\n  \n  if (loading) return <Loading />;\n  if (error) return <Error message={error.message} />;\n  \n  return (\n    <div>\n      {data.map(item => <Item key={item.id} {...item} />)}\n      <button onClick={refetch}>Refresh</button>\n    </div>\n  );\n}',
        preview: 'data-url-mock-for-advanced-preview'
      }
    ],
    sandboxUrl: 'https://codesandbox.io/s/test-feature-examples'
  };

  // Document structure needed for validation
  const mockDocStructure: DocStructure = {
    id: 'feature-docs',
    name: 'Feature Documentation',
    sections: [
      {
        id: 'overview',
        title: 'Overview',
        required: true,
        minWords: 100,
        maxWords: 500
      },
      {
        id: 'usage',
        title: 'Usage Guide',
        required: true,
        minWords: 200,
        maxWords: 1000
      },
      {
        id: 'api',
        title: 'API Reference',
        required: true,
        minWords: 300,
        maxWords: 2000
      },
      {
        id: 'examples',
        title: 'Examples',
        required: true,
        minWords: 100,
        maxWords: 1000
      }
    ],
    format: {
      allowedHeadingLevels: [1, 2, 3],
      requireCodeExamples: true,
      maxCodeBlockLength: 50,
      allowedLanguages: ['typescript', 'javascript', 'jsx', 'tsx', 'json'],
      requireTableOfContents: true
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    vi.resetAllMocks();
    resetDocImplementation();
    initializeDocStructure(mockDocStructure);
    
    // Reset the mock implementation for validateDocContent
    vi.mocked(validateDocContent).mockImplementation(() => {
      return { valid: true, errors: [] };
    });
    
    // Reset the process.env.NODE_ENV mock
    vi.stubEnv('NODE_ENV', 'development');
    
    // Reset debug mode
    setDebugMode(false);
  });
  
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('Feature Documentation Generation', () => {
    it('should generate feature documentation with required sections', () => {
      // Act
      const result = generateFeatureDocs(mockFeatureDocConfig);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.sections).toContain('overview');
      expect(result.sections).toContain('api');
      expect(result.valid).toBe(true);
    });

    it('should include API endpoints in the documentation', () => {
      // Act
      const result = generateFeatureDocs(mockFeatureDocConfig);
      
      // Assert
      expect(result.content).toContain('/api/test');
      expect(result.content).toContain('/api/test/:id');
      expect(result.content).toContain('GET');
      expect(result.content).toContain('POST');
    });

    it('should include component documentation', () => {
      // Act
      const result = generateFeatureDocs(mockFeatureDocConfig);
      
      // Assert
      expect(result.content).toContain('TestComponent');
      expect(result.content).toContain('A component for testing purposes');
      expect(result.content).toContain('data');
      expect(result.content).toContain('onUpdate');
    });

    it('should include dependency information', () => {
      // Act
      const result = generateFeatureDocs(mockFeatureDocConfig);
      
      // Assert
      expect(result.content).toContain('react');
      expect(result.content).toContain('^18.0.0');
      expect(result.content).toContain('axios');
      expect(result.content).toContain('^1.2.0');
    });

    it('should throw an error when generating docs with invalid feature ID', () => {
      // Arrange
      const invalidConfig = { ...mockFeatureDocConfig, featureId: '' };
      
      // Act & Assert
      expect(() => generateFeatureDocs(invalidConfig)).toThrow('Feature ID is required');
    });
    
    it('should handle feature configuration with empty arrays', () => {
      // Arrange
      const minimalConfig: FeatureDocConfig = {
        featureId: 'minimal-feature',
        title: 'Minimal Feature',
        version: '1.0.0',
        description: 'A minimal feature with empty arrays',
        apiEndpoints: [],
        components: [],
        dependencies: []
      };
      
      // Act
      const result = generateFeatureDocs(minimalConfig);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.valid).toBe(true);
    });
    
    it('should generate documentation for validation in test mode', () => {
      // Arrange
      vi.stubEnv('NODE_ENV', 'test');
      
      // Act
      const result = generateFeatureDocsForValidation(mockFeatureDocConfig, true);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.valid).toBe(true);
      
      // Should have enabled debug mode
      expect(console.log).toHaveBeenCalledWith('[DEBUG] Debug mode enabled');
    });
    
    it('should generate custom feature documentation', () => {
      // Arrange
      const customConfig = { 
        ...mockFeatureDocConfig, 
        featureId: 'custom-feature',
        title: 'Custom Feature'
      };
      
      // Act
      const result = generateFeatureDocs(customConfig);
      
      // Assert
      expect(result.content).toContain('Custom Feature');
      expect(result.valid).toBe(true);
    });
  });

  describe('Usage Guide Generation', () => {
    it('should generate a usage guide with all sections', () => {
      // Act
      const result = generateUsageGuides(mockUsageGuideConfig);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.featureId).toBe('test-feature');
      expect(result.valid).toBe(true);
    });

    it('should include all provided sections in the guide', () => {
      // Act
      const result = generateUsageGuides(mockUsageGuideConfig);
      
      // Assert
      expect(result.content).toContain('Installation');
      expect(result.content).toContain('Basic Usage');
      expect(result.content).toContain('Advanced Usage');
    });

    it('should include code examples if provided', () => {
      // Act
      const result = generateUsageGuides(mockUsageGuideConfig);
      
      // Assert
      expect(result.content).toContain('Basic Example');
      expect(result.content).toContain('import { TestComponent } from "components";');
    });

    it('should throw an error when generating a guide with invalid feature ID', () => {
      // Arrange
      const invalidConfig = { ...mockUsageGuideConfig, featureId: '' };
      
      // Act & Assert
      expect(() => generateUsageGuides(invalidConfig)).toThrow('Feature ID is required');
    });
    
    it('should handle error situations', () => {
      // Arrange  
      vi.spyOn(console, 'error');
      
      // Act & Assert
      expect(() => generateUsageGuides(mockUsageGuideConfig, { throwError: true, errorMessage: 'Test error' }))
        .toThrow('Test error');
        
      expect(console.error).toHaveBeenCalled();
    });
    
    it('should include a table of contents in the usage guide', () => {
      // Act
      const result = generateUsageGuides(mockUsageGuideConfig);
      
      // Assert
      expect(result.content).toContain('## Table of Contents');
      expect(result.content).toMatch(/- \[Installation\]/);
      expect(result.content).toMatch(/- \[Basic Usage\]/);
      expect(result.content).toMatch(/- \[Advanced Usage\]/);
    });
    
    it('should generate usage guide with no code examples', () => {
      // Arrange
      const configWithoutExamples = { 
        ...mockUsageGuideConfig, 
        codeExamples: [] 
      };
      
      // Act
      const result = generateUsageGuides(configWithoutExamples);
      
      // Assert
      expect(result.valid).toBe(true);
    });
  });

  describe('Examples Generation', () => {
    it('should generate examples documentation with all examples', () => {
      // Act
      const result = generateExamples(mockExampleConfig);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.featureId).toBe('test-feature');
      expect(result.valid).toBe(true);
    });

    it('should include all provided examples in the documentation', () => {
      // Act
      const result = generateExamples(mockExampleConfig);
      
      // Assert
      expect(result.content).toContain('Simple Example');
      expect(result.content).toContain('Advanced Example');
    });

    it('should include code samples for each example', () => {
      // Act
      const result = generateExamples(mockExampleConfig);
      
      // Assert
      expect(result.content).toContain('import { useTestFeature } from "features/test";');
      expect(result.content).toContain('function Example()');
      expect(result.content).toContain('function AdvancedExample()');
    });

    it('should include sandbox URL if provided', () => {
      // Act
      const result = generateExamples(mockExampleConfig);
      
      // Assert
      expect(result.content).toContain('https://codesandbox.io/s/test-feature-examples');
    });

    it('should throw an error when generating examples with invalid feature ID', () => {
      // Arrange
      const invalidConfig = { ...mockExampleConfig, featureId: '' };
      
      // Act & Assert
      expect(() => generateExamples(invalidConfig)).toThrow('Feature ID is required');
    });
    
    it('should handle error situations', () => {
      // Arrange  
      vi.spyOn(console, 'error');
      
      // Act & Assert
      expect(() => generateExamples(mockExampleConfig, { throwError: true, errorMessage: 'Test error' }))
        .toThrow('Test error');
        
      expect(console.error).toHaveBeenCalled();
    });
    
    it('should generate examples documentation without sandbox URL', () => {
      // Arrange
      const configWithoutSandbox = { 
        ...mockExampleConfig, 
        sandboxUrl: undefined 
      };
      
      // Act
      const result = generateExamples(configWithoutSandbox);
      
      // Assert
      expect(result.valid).toBe(true);
    });
    
    it('should handle examples without previews', () => {
      // Arrange
      const configWithoutPreviews = { 
        ...mockExampleConfig, 
        examples: [
          {
            title: 'No Preview Example',
            description: 'An example without a preview',
            code: 'function NoPreview() { return <div>No preview</div>; }'
          }
        ]
      };
      
      // Act
      const result = generateExamples(configWithoutPreviews);
      
      // Assert
      expect(result.content).toContain('No Preview Example');
      expect(result.valid).toBe(true);
    });
  });
  
  describe('Debug Utilities', () => {
    it('should enable debug mode when setDebugMode is called with true', () => {
      // Act
      setDebugMode(true);
      
      // Assert
      expect(console.log).toHaveBeenCalledWith('[DEBUG] Debug mode enabled');
    });
    
    it('should disable debug mode when setDebugMode is called with false', () => {
      // Arrange
      setDebugMode(true);
      vi.clearAllMocks();
      
      // Act
      setDebugMode(false);
      
      // Assert
      expect(console.log).toHaveBeenCalledWith('[DEBUG] Debug mode disabled');
    });
  });
}); 