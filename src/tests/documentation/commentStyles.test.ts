/**
 * Test file for comment styles validation
 * 
 * This file contains tests for validating comment styles in the codebase.
 * It follows the test-driven development approach with failing tests first.
 */

// Import the centralized testing utilities
import { describe, it, expect } from '../utils/testingFramework';
import { render } from '../utils/testUtils';
import { createErrorResponse } from '../utils/fixtures';

// Import the actual implementations
import { validateCommentStyle, checkCommentFormat, checkCommentCompleteness } from '../../lib/documentation/commentStyles';

describe('Comment Styles Validation', () => {
  describe('Style Validation', () => {
    it('should validate JSDoc style comments correctly', () => {
      const validJSDocComment = `
/**
 * This is a valid JSDoc comment
 * @param {string} param1 - Description of param1
 * @returns {boolean} Description of return value
 */
      `;
      
      const result = validateCommentStyle(validJSDocComment);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('should detect invalid JSDoc style comments', () => {
      const invalidJSDocComment = `
/**
 * This is an invalid JSDoc comment
 * Missing @param and @returns tags
 */
      `;
      
      const result = validateCommentStyle(invalidJSDocComment);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing required JSDoc tags');
    });
    
    it('should validate inline comments correctly', () => {
      const validInlineComment = `// This is a valid inline comment`;
      
      const result = validateCommentStyle(validInlineComment);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('should detect invalid inline comments', () => {
      const invalidInlineComment = `//This is an invalid inline comment (missing space after //)`;
      
      const result = validateCommentStyle(invalidInlineComment);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Inline comments should have a space after //');
    });
  });
  
  describe('Format Checking', () => {
    it('should check JSDoc comment format correctly', () => {
      const wellFormattedJSDocComment = `
/**
 * This is a well-formatted JSDoc comment
 * @param {string} param1 - Description of param1
 * @returns {boolean} Description of return value
 */
      `;
      
      const result = checkCommentFormat(wellFormattedJSDocComment);
      
      expect(result.isFormatted).toBe(true);
      expect(result.issues).toHaveLength(0);
    });
    
    it('should detect formatting issues in JSDoc comments', () => {
      const poorlyFormattedJSDocComment = `
/**
* This is a poorly formatted JSDoc comment
*@param {string} param1 - Description of param1
*@returns {boolean} Description of return value
*/
      `;
      
      const result = checkCommentFormat(poorlyFormattedJSDocComment);
      
      expect(result.isFormatted).toBe(false);
      expect(result.issues).toContain('JSDoc comments should have proper indentation');
    });
    
    it('should check inline comment format correctly', () => {
      const wellFormattedInlineComment = `// This is a well-formatted inline comment`;
      
      const result = checkCommentFormat(wellFormattedInlineComment);
      
      expect(result.isFormatted).toBe(true);
      expect(result.issues).toHaveLength(0);
    });
    
    it('should detect formatting issues in inline comments', () => {
      const poorlyFormattedInlineComment = `//This is a poorly formatted inline comment`;
      
      const result = checkCommentFormat(poorlyFormattedInlineComment);
      
      expect(result.isFormatted).toBe(false);
      expect(result.issues).toContain('Inline comments should have a space after //');
    });
  });
  
  describe('Completeness Checking', () => {
    it('should check JSDoc comment completeness correctly', () => {
      const completeJSDocComment = `
/**
 * This is a complete JSDoc comment
 * @param {string} param1 - Description of param1
 * @returns {boolean} Description of return value
 * @throws {Error} Description of possible errors
 */
      `;
      
      const result = checkCommentCompleteness(completeJSDocComment);
      
      expect(result.isComplete).toBe(true);
      expect(result.missingElements).toHaveLength(0);
    });
    
    it('should detect missing elements in JSDoc comments', () => {
      const incompleteJSDocComment = `
/**
 * This is an incomplete JSDoc comment
 * @param {string} param1 - Description of param1
 */
      `;
      
      const result = checkCommentCompleteness(incompleteJSDocComment);
      
      expect(result.isComplete).toBe(false);
      expect(result.missingElements).toContain('@returns tag');
    });
    
    it('should check inline comment completeness correctly', () => {
      const completeInlineComment = `// This is a complete inline comment with sufficient detail`;
      
      const result = checkCommentCompleteness(completeInlineComment);
      
      expect(result.isComplete).toBe(true);
      expect(result.missingElements).toHaveLength(0);
    });
    
    it('should detect insufficient detail in inline comments', () => {
      const incompleteInlineComment = `// TODO`;
      
      const result = checkCommentCompleteness(incompleteInlineComment);
      
      expect(result.isComplete).toBe(false);
      expect(result.missingElements).toContain('Sufficient detail');
    });
  });
}); 