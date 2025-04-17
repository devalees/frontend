/**
 * Test file for documentation generation
 * 
 * This file contains tests for the documentation generation process.
 * It follows the test-driven development approach with failing tests first.
 */

// Import the centralized testing utilities
import { describe, it, expect, vi } from '../utils/testingFramework';
import { render } from '../utils/testUtils';
import { createErrorResponse } from '../utils/fixtures';

// Import the function implementations that will be developed later
import { 
  generateDocumentation, 
  validateOutputFormat, 
  validateDocContent 
} from '../../lib/documentation/docGeneration';

describe('Documentation Generation', () => {
  describe('Generation Process', () => {
    it('should generate documentation from source code files', () => {
      // Arrange
      const sourceFiles = [
        'src/components/Button.tsx',
        'src/utils/format.ts'
      ];
      
      // Act
      const result = generateDocumentation(sourceFiles);
      
      // Assert
      expect(result.success).toBe(true);
      expect(result.generatedFiles).toBeDefined();
      expect(result.generatedFiles.length).toBeGreaterThan(0);
      expect(result.generatedFiles[0].content).toBeDefined();
      expect(result.generatedFiles[0].path).toContain('documentation');
    });
    
    it('should handle source files with no documentation', () => {
      // Arrange
      const sourceFiles = [
        'src/utils/emptyFile.ts' // File with no comments/documentation
      ];
      
      // Act
      const result = generateDocumentation(sourceFiles);
      
      // Assert
      expect(result.success).toBe(false);
      expect(result.errors).toContain('No documentation comments found in source file');
    });
    
    it('should process multiple files and combine documentation', () => {
      // Arrange
      const sourceFiles = [
        'src/components/Button.tsx',
        'src/components/Input.tsx',
        'src/components/Modal.tsx'
      ];
      
      // Act
      const result = generateDocumentation(sourceFiles);
      
      // Assert
      expect(result.success).toBe(true);
      expect(result.generatedFiles.length).toBeGreaterThanOrEqual(3);
      expect(result.index).toBeDefined();
      expect(result.index.content).toContain('Button');
      expect(result.index.content).toContain('Input');
      expect(result.index.content).toContain('Modal');
    });
    
    it('should handle errors during documentation generation', () => {
      // Arrange
      const sourceFiles = [
        'src/components/NonExistentFile.tsx' // File that doesn't exist
      ];
      
      // Act
      const result = generateDocumentation(sourceFiles);
      
      // Assert
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
  
  describe('Output Format Validation', () => {
    it('should validate markdown format correctly', () => {
      // Arrange
      const markdownContent = `
# Component Documentation

## Button

A reusable button component.

### Props

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| variant | 'primary' \\| 'secondary' | 'primary' | The button variant |
`;
      
      // Act
      const result = validateOutputFormat(markdownContent, 'markdown');
      
      // Assert
      expect(result.isValid).toBe(true);
      expect(result.formatErrors).toHaveLength(0);
    });
    
    it('should detect invalid markdown format', () => {
      // Arrange
      const invalidMarkdownContent = `
# Heading 1
## Heading 2
Invalid table:
| Name | Type | Default |
| ---- | ---- |
| variant | 'primary' | 'primary' |
`;
      
      // Act
      const result = validateOutputFormat(invalidMarkdownContent, 'markdown');
      
      // Assert
      expect(result.isValid).toBe(false);
      expect(result.formatErrors).toContain('Invalid markdown table format');
    });
    
    it('should validate HTML format correctly', () => {
      // Arrange
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Component Documentation</title>
</head>
<body>
  <h1>Component Documentation</h1>
  <h2>Button</h2>
  <p>A reusable button component.</p>
  <h3>Props</h3>
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Type</th>
        <th>Default</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>variant</td>
        <td>'primary' | 'secondary'</td>
        <td>'primary'</td>
        <td>The button variant</td>
      </tr>
    </tbody>
  </table>
</body>
</html>
`;
      
      // Act
      const result = validateOutputFormat(htmlContent, 'html');
      
      // Assert
      expect(result.isValid).toBe(true);
      expect(result.formatErrors).toHaveLength(0);
    });
    
    it('should detect invalid HTML format', () => {
      // Arrange
      const invalidHtmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Component Documentation</title>
</head>
<body>
  <h1>Component Documentation</h1>
  <h2>Button</h2>
  <p>A reusable button component.</p>
  <h3>Props</h3>
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Type</th>
        <th>Default</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>variant</td>
        <td>'primary' | 'secondary'</td>
        <td>'primary'</td>
    </tbody>
  </table>
</body>
`;
      
      // Act
      const result = validateOutputFormat(invalidHtmlContent, 'html');
      
      // Assert
      expect(result.isValid).toBe(false);
      expect(result.formatErrors).toContain('HTML validation error: Unclosed tr tag');
    });
  });
  
  describe('Content Validation', () => {
    it('should validate required content sections in documentation', () => {
      // Arrange
      const docContent = `
# Component: Button

## Description
A reusable button component with multiple variants.

## Props
| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| variant | 'primary' | 'primary' | The button variant |

## Examples
\`\`\`tsx
<Button variant="primary">Click me</Button>
\`\`\`

## Accessibility
This component meets WCAG 2.1 AA standards.
`;
      
      const requiredSections = ['Description', 'Props', 'Examples', 'Accessibility'];
      
      // Act
      const result = validateDocContent(docContent, requiredSections);
      
      // Assert
      expect(result.isValid).toBe(true);
      expect(result.missingSections).toHaveLength(0);
    });
    
    it('should detect missing content sections', () => {
      // Arrange
      const docContent = `
# Component: Button

## Description
A reusable button component with multiple variants.

## Props
| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| variant | 'primary' | 'primary' | The button variant |
`;
      
      const requiredSections = ['Description', 'Props', 'Examples', 'Accessibility'];
      
      // Act
      const result = validateDocContent(docContent, requiredSections);
      
      // Assert
      expect(result.isValid).toBe(false);
      expect(result.missingSections).toContain('Examples');
      expect(result.missingSections).toContain('Accessibility');
    });
    
    it('should validate that props have proper descriptions', () => {
      // Arrange
      const docContent = `
# Component: Button

## Props
| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| variant | 'primary' \| 'secondary' | 'primary' | The button variant |
| size | 'small' \| 'medium' \| 'large' | 'medium' | The button size |
| disabled | boolean | false | Whether the button is disabled |
`;
      
      // Act
      const result = validateDocContent(docContent);
      
      // Assert
      expect(result.propsAreValid).toBe(true);
      expect(result.propErrors).toHaveLength(0);
    });
    
    it('should detect props with insufficient descriptions', () => {
      // Arrange
      const docContent = `
# Component: Button

## Props
| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| variant | 'primary' \| 'secondary' | 'primary' | The button variant |
| size | 'small' \| 'medium' \| 'large' | 'medium' | Size |
| disabled | boolean | false | Disabled |
`;
      
      // Act
      const result = validateDocContent(docContent);
      
      // Assert
      expect(result.propsAreValid).toBe(false);
      expect(result.propErrors).toContain('Prop "size" has insufficient description');
      expect(result.propErrors).toContain('Prop "disabled" has insufficient description');
    });
  });
}); 