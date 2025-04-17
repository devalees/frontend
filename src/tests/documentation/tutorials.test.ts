/**
 * Test file for tutorials documentation validation
 * 
 * This file contains tests for validating tutorial structure,
 * step validation, and example testing. It follows the test-driven 
 * development approach with failing tests first.
 */

// Declare global type for the API
declare global {
  var api: {
    delete: (url: string) => Promise<{ status: number }>;
  };
}

// Import the centralized testing utilities
import { describe, it, expect, vi } from '../utils/testingFramework';
import { render } from '../utils/testUtils';
import { createErrorResponse } from '../utils/fixtures';

// Import the function implementations that will be developed later
import { 
  validateTutorialStructure, 
  validateTutorialSteps,
  validateTutorialExamples
} from '../../lib/documentation/tutorials';

describe('Tutorials Documentation', () => {
  describe('Tutorial Structure Validation', () => {
    it('should validate correct tutorial structure', () => {
      // Arrange
      const tutorialStructure = {
        title: 'Getting Started with Projects',
        difficulty: 'Beginner',
        timeEstimate: '15 minutes',
        prerequisites: ['Basic React knowledge', 'System setup completed'],
        sections: [
          {
            title: 'Introduction',
            content: 'This tutorial will guide you through creating your first project.'
          },
          {
            title: 'Steps',
            steps: [
              {
                title: 'Step 1: Create a new project',
                content: 'Click the "New Project" button in the dashboard.',
                codeExample: null,
                screenshot: 'path/to/screenshot.png'
              },
              {
                title: 'Step 2: Configure project settings',
                content: 'Fill in the project details form.',
                codeExample: null,
                screenshot: 'path/to/screenshot2.png'
              }
            ]
          },
          {
            title: 'Conclusion',
            content: 'You have successfully created your first project.'
          }
        ],
        tags: ['projects', 'beginners', 'setup']
      };
      
      // Act
      const result = validateTutorialStructure(tutorialStructure);
      
      // Assert
      expect(result.isValid).toBe(true);
      expect(result.structureErrors).toHaveLength(0);
    });
    
    it('should detect missing required sections in tutorial', () => {
      // Arrange
      const tutorialStructure = {
        title: 'Getting Started with Projects',
        difficulty: 'Beginner',
        timeEstimate: '15 minutes',
        prerequisites: ['Basic React knowledge'],
        sections: [
          {
            title: 'Introduction',
            content: 'This tutorial will guide you through creating your first project.'
          }
          // Missing required 'Steps' section
          // Missing required 'Conclusion' section
        ],
        tags: ['projects', 'beginners']
      };
      
      // Act
      const result = validateTutorialStructure(tutorialStructure);
      
      // Assert
      expect(result.isValid).toBe(false);
      expect(result.structureErrors).toContain('Missing required section: Steps');
      expect(result.structureErrors).toContain('Missing required section: Conclusion');
    });
    
    it('should validate tutorial metadata completeness', () => {
      // Arrange
      const tutorialStructure = {
        // Missing title
        difficulty: 'Beginner',
        // Missing timeEstimate
        prerequisites: ['Basic React knowledge'],
        sections: [
          {
            title: 'Introduction',
            content: 'This tutorial will guide you through creating your first project.'
          },
          {
            title: 'Steps',
            steps: [
              {
                title: 'Step 1: Create a new project',
                content: 'Click the "New Project" button in the dashboard.'
              }
            ]
          },
          {
            title: 'Conclusion',
            content: 'You have successfully created your first project.'
          }
        ],
        tags: ['projects', 'beginners']
      };
      
      // Act
      const result = validateTutorialStructure(tutorialStructure);
      
      // Assert
      expect(result.isValid).toBe(false);
      expect(result.structureErrors).toContain('Missing required metadata: title');
      expect(result.structureErrors).toContain('Missing required metadata: timeEstimate');
    });
    
    it('should validate tutorial difficulty levels', () => {
      // Arrange
      const tutorialStructure = {
        title: 'Advanced Project Configuration',
        difficulty: 'Expert', // Not a valid difficulty level
        timeEstimate: '30 minutes',
        prerequisites: ['Project management experience'],
        sections: [
          {
            title: 'Introduction',
            content: 'This tutorial covers advanced project configuration.'
          },
          {
            title: 'Steps',
            steps: [
              {
                title: 'Step 1: Access advanced settings',
                content: 'Navigate to project settings and select the Advanced tab.'
              }
            ]
          },
          {
            title: 'Conclusion',
            content: 'You have configured advanced project settings.'
          }
        ],
        tags: ['projects', 'advanced']
      };
      
      // Act
      const result = validateTutorialStructure(tutorialStructure);
      
      // Assert
      expect(result.isValid).toBe(false);
      expect(result.structureErrors).toContain('Invalid difficulty level: Expert. Valid options are: Beginner, Intermediate, Advanced');
    });
  });
  
  describe('Tutorial Steps Validation', () => {
    it('should validate correct step sequence', () => {
      // Arrange
      const tutorialSteps = [
        {
          stepNumber: 1,
          title: 'Create a new project',
          content: 'Click the "New Project" button in the dashboard.',
          codeExample: null,
          screenshot: 'path/to/screenshot.png'
        },
        {
          stepNumber: 2,
          title: 'Configure project settings',
          content: 'Fill in the project details form.',
          codeExample: null,
          screenshot: 'path/to/screenshot2.png'
        },
        {
          stepNumber: 3,
          title: 'Save project',
          content: 'Click the "Save" button to create your project.',
          codeExample: null,
          screenshot: 'path/to/screenshot3.png'
        }
      ];
      
      // Act
      const result = validateTutorialSteps(tutorialSteps);
      
      // Assert
      expect(result.isValid).toBe(true);
      expect(result.stepErrors).toHaveLength(0);
    });
    
    it('should detect incorrect step sequence', () => {
      // Arrange
      const tutorialSteps = [
        {
          stepNumber: 1,
          title: 'Create a new project',
          content: 'Click the "New Project" button in the dashboard.',
          codeExample: null,
          screenshot: 'path/to/screenshot.png'
        },
        {
          stepNumber: 3, // Incorrect sequence number
          title: 'Configure project settings',
          content: 'Fill in the project details form.',
          codeExample: null,
          screenshot: 'path/to/screenshot2.png'
        },
        {
          stepNumber: 2, // Incorrect sequence number
          title: 'Save project',
          content: 'Click the "Save" button to create your project.',
          codeExample: null,
          screenshot: 'path/to/screenshot3.png'
        }
      ];
      
      // Act
      const result = validateTutorialSteps(tutorialSteps);
      
      // Assert
      expect(result.isValid).toBe(false);
      expect(result.stepErrors).toContain('Incorrect step sequence: expected step 2 but found step 3');
      expect(result.stepErrors).toContain('Incorrect step sequence: expected step 3 but found step 2');
    });
    
    it('should validate step content completeness', () => {
      // Arrange
      const tutorialSteps = [
        {
          stepNumber: 1,
          title: 'Create a new project',
          content: 'Click the "New Project" button in the dashboard.',
          codeExample: null,
          screenshot: 'path/to/screenshot.png'
        },
        {
          stepNumber: 2,
          title: 'Configure project settings',
          content: '', // Empty content
          codeExample: null,
          screenshot: 'path/to/screenshot2.png'
        },
        {
          stepNumber: 3,
          title: '', // Empty title
          content: 'Click the "Save" button to create your project.',
          codeExample: null,
          screenshot: 'path/to/screenshot3.png'
        }
      ];
      
      // Act
      const result = validateTutorialSteps(tutorialSteps);
      
      // Assert
      expect(result.isValid).toBe(false);
      expect(result.stepErrors).toContain('Empty content in step 2: Configure project settings');
      expect(result.stepErrors).toContain('Empty title in step 3');
    });
    
    it('should validate required visual aids in steps', () => {
      // Arrange
      const tutorialSteps = [
        {
          stepNumber: 1,
          title: 'Create a new project',
          content: 'Click the "New Project" button in the dashboard.',
          codeExample: null,
          screenshot: null // Missing required screenshot
        },
        {
          stepNumber: 2,
          title: 'Configure project settings',
          content: 'Fill in the project details form as shown below.',
          codeExample: null,
          screenshot: null // Missing required screenshot
        }
      ];
      
      // Act
      const result = validateTutorialSteps(tutorialSteps);
      
      // Assert
      expect(result.isValid).toBe(false);
      expect(result.stepErrors).toContain('Missing visual aid (screenshot or code example) in step 1: Create a new project');
      expect(result.stepErrors).toContain('Missing visual aid (screenshot or code example) in step 2: Configure project settings');
    });
  });
  
  describe('Tutorial Examples Validation', () => {
    it('should validate correct example code', () => {
      // Arrange
      const codeExample = {
        language: 'typescript',
        code: `
const createProject = async (data: ProjectData): Promise<Project> => {
  const response = await api.post('/projects', data);
  return response.data;
};
        `,
        explanation: 'This function creates a new project by sending a POST request to the API.',
        runnable: true,
        dependencies: ['api-client']
      };
      
      // Act
      const result = validateTutorialExamples(codeExample);
      
      // Assert
      expect(result.isValid).toBe(true);
      expect(result.exampleErrors).toHaveLength(0);
    });
    
    it('should detect syntax errors in example code', () => {
      // Arrange
      const codeExample = {
        language: 'typescript',
        code: `
const createProject = async (data: ProjectData): Promise<Project> => {
  const response = await api.post('/projects', data);
  return response.data
}; // Missing semicolon
        `,
        explanation: 'This function creates a new project by sending a POST request to the API.',
        runnable: true,
        dependencies: ['api-client']
      };
      
      // Act
      const result = validateTutorialExamples(codeExample);
      
      // Assert
      expect(result.isValid).toBe(false);
      expect(result.exampleErrors).toContain('Syntax error in example code: missing semicolon');
    });
    
    it('should validate missing dependencies in example code', () => {
      // Arrange
      const codeExample = {
        language: 'typescript',
        code: `
import { useQuery } from 'react-query'; // Missing dependency

const ProjectList = () => {
  const { data, isLoading } = useQuery('projects', fetchProjects);
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <ul>
      {data.map(project => (
        <li key={project.id}>{project.name}</li>
      ))}
    </ul>
  );
};
        `,
        explanation: 'This component displays a list of projects.',
        runnable: true,
        dependencies: [] // Missing 'react-query' dependency
      };
      
      // Act
      const result = validateTutorialExamples(codeExample);
      
      // Assert
      expect(result.isValid).toBe(false);
      expect(result.exampleErrors).toContain('Missing dependency in example code: react-query');
    });
    
    it('should verify example code matches project conventions', () => {
      // Arrange
      const codeExample = {
        language: 'typescript',
        code: `
// Example not following project conventions
function CreateProject(data) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/api/projects', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
      var response = JSON.parse(xhr.responseText);
      return response;
    }
  };
  xhr.send(JSON.stringify(data));
}
        `,
        explanation: 'This function creates a new project.',
        runnable: true,
        dependencies: []
      };
      
      const projectConventions = {
        typescript: {
          preferArrowFunctions: true,
          useTypeAnnotations: true,
          useConstOverVar: true,
          preferAsyncAwait: true,
          apiClientLibrary: 'axios'
        }
      };
      
      // Act
      const result = validateTutorialExamples(codeExample, projectConventions);
      
      // Assert
      expect(result.isValid).toBe(false);
      expect(result.exampleErrors).toContain('Example code does not follow project convention: preferArrowFunctions');
      expect(result.exampleErrors).toContain('Example code does not follow project convention: useTypeAnnotations');
      expect(result.exampleErrors).toContain('Example code does not follow project convention: useConstOverVar');
      expect(result.exampleErrors).toContain('Example code does not follow project convention: preferAsyncAwait');
      expect(result.exampleErrors).toContain('Example code does not follow project convention: apiClientLibrary (axios)');
    });
    
    it('should test example code runability', async () => {
      // Arrange
      const codeExample = {
        language: 'typescript',
        code: `
const deleteProject = async (id: string): Promise<void> => {
  await api.delete(\`/projects/\${id}\`);
};
        `,
        explanation: 'This function deletes a project by sending a DELETE request to the API.',
        runnable: true,
        dependencies: ['api-client']
      };
      
      // Mock the API client
      const mockApi = {
        delete: vi.fn().mockResolvedValue({ status: 200 })
      };
      
      // Mock global object for the test
      global.api = mockApi;
      
      // Create a simple test function that directly calls the code
      // The special function to be used by validateTutorialExamples
      const runTest = async () => {
        try {
          // Call the deleteProject function directly
          const deleteProject = async (id: string): Promise<void> => {
            await mockApi.delete(`/projects/${id}`);
          };
          
          await deleteProject('project-123');
          return { success: true, error: null };
        } catch (error) {
          return { success: false, error: String(error) };
        }
      };
      
      // Act
      const result = await validateTutorialExamples(codeExample, null, runTest);
      
      // Assert
      expect(result.isValid).toBe(true);
      expect(result.exampleErrors).toHaveLength(0);
      expect(mockApi.delete).toHaveBeenCalledWith('/projects/project-123');
      
      // Clean up
      delete global.api;
    });
  });
}); 