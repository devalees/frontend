/**
 * Comment style validation utilities
 * 
 * This file contains utilities for validating comment styles in the codebase.
 * It includes functions for validating JSDoc and inline comments, checking their format,
 * and ensuring they are complete.
 */

/**
 * Validates the style of a comment
 * @param comment The comment to validate
 * @returns An object containing validation results and any errors
 */
export function validateCommentStyle(comment: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check if it's a JSDoc comment
  if (comment.trim().startsWith('/**')) {
    const { isValid, errors: jsdocErrors } = validateJSDocComment(comment);
    return { isValid, errors: jsdocErrors };
  }
  
  // Check if it's an inline comment
  if (comment.trim().startsWith('//')) {
    return validateInlineComment(comment);
  }
  
  errors.push('Comment must be either JSDoc or inline style');
  return { isValid: false, errors };
}

/**
 * Checks the format of a comment
 * @param comment The comment to check
 * @returns An object containing format check results and any issues
 */
export function checkCommentFormat(comment: string): { isFormatted: boolean; issues: string[] } {
  const issues: string[] = [];
  
  // Check if it's a JSDoc comment
  if (comment.trim().startsWith('/**')) {
    return checkJSDocFormat(comment);
  }
  
  // Check if it's an inline comment
  if (comment.trim().startsWith('//')) {
    return checkInlineFormat(comment);
  }
  
  issues.push('Comment must be either JSDoc or inline style');
  return { isFormatted: false, issues };
}

/**
 * Checks the completeness of a comment
 * @param comment The comment to check
 * @returns An object containing completeness check results and any missing elements
 */
export function checkCommentCompleteness(comment: string): { isComplete: boolean; missingElements: string[] } {
  const missingElements: string[] = [];
  
  // Check if it's a JSDoc comment
  if (comment.trim().startsWith('/**')) {
    return checkJSDocCompleteness(comment);
  }
  
  // Check if it's an inline comment
  if (comment.trim().startsWith('//')) {
    return checkInlineCompleteness(comment);
  }
  
  missingElements.push('Comment must be either JSDoc or inline style');
  return { isComplete: false, missingElements };
}

/**
 * Validates a JSDoc comment
 * @param comment The JSDoc comment to validate
 * @returns An object containing validation results and any errors
 */
function validateJSDocComment(comment: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Trim the comment to ensure accurate detection of tags
  const trimmedComment = comment.trim();
  
  // Check for required JSDoc tags using regex to match actual tags, not text mentions
  const paramRegex = /^\s*\*\s+@param\s+/m;
  const returnsRegex = /^\s*\*\s+@returns\s+/m;
  
  const hasParam = paramRegex.test(trimmedComment);
  const hasReturns = returnsRegex.test(trimmedComment);
  
  // If either required tag is missing, add an error
  if (!hasParam || !hasReturns) {
    errors.push('Missing required JSDoc tags');
  }
  
  // Check for proper JSDoc format
  const lines = trimmedComment.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip the opening and closing lines
    if (i === 0 && line === '/**') continue;
    if (i === lines.length - 1 && line === '*/') continue;
    
    // Check middle lines
    if (line.startsWith('*')) {
      if (!line.match(/^\*\s/)) {
        errors.push('JSDoc comments should have a space after *');
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates an inline comment
 * @param comment The inline comment to validate
 * @returns An object containing validation results and any errors
 */
function validateInlineComment(comment: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check for proper inline comment format
  if (!comment.trim().match(/^\/\/\s/)) {
    errors.push('Inline comments should have a space after //');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Checks the format of a JSDoc comment
 * @param comment The JSDoc comment to check
 * @returns An object containing format check results and any issues
 */
function checkJSDocFormat(comment: string): { isFormatted: boolean; issues: string[] } {
  const issues: string[] = [];
  
  // Check for proper JSDoc format
  const lines = comment.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip the opening and closing lines
    if (i === 0 && line === '/**') continue;
    if (i === lines.length - 1 && line === '*/') continue;
    
    // Check middle lines
    if (line.startsWith('*')) {
      if (!line.match(/^\*\s/)) {
        issues.push('JSDoc comments should have proper indentation');
        break;
      }
    }
  }
  
  return {
    isFormatted: issues.length === 0,
    issues
  };
}

/**
 * Checks the format of an inline comment
 * @param comment The inline comment to check
 * @returns An object containing format check results and any issues
 */
function checkInlineFormat(comment: string): { isFormatted: boolean; issues: string[] } {
  const issues: string[] = [];
  
  // Check for proper inline comment format
  if (!comment.trim().match(/^\/\/\s/)) {
    issues.push('Inline comments should have a space after //');
  }
  
  return {
    isFormatted: issues.length === 0,
    issues
  };
}

/**
 * Checks the completeness of a JSDoc comment
 * @param comment The JSDoc comment to check
 * @returns An object containing completeness check results and any missing elements
 */
function checkJSDocCompleteness(comment: string): { isComplete: boolean; missingElements: string[] } {
  const missingElements: string[] = [];
  
  // Check for required JSDoc tags
  if (!comment.includes('@param')) {
    missingElements.push('@param tag');
  }
  if (!comment.includes('@returns')) {
    missingElements.push('@returns tag');
  }
  
  return {
    isComplete: missingElements.length === 0,
    missingElements
  };
}

/**
 * Checks the completeness of an inline comment
 * @param comment The inline comment to check
 * @returns An object containing completeness check results and any missing elements
 */
function checkInlineCompleteness(comment: string): { isComplete: boolean; missingElements: string[] } {
  const missingElements: string[] = [];
  
  // Check for sufficient detail
  const content = comment.trim().replace(/^\/\/\s*/, '');
  if (content.length < 10) {
    missingElements.push('Sufficient detail');
  }
  
  return {
    isComplete: missingElements.length === 0,
    missingElements
  };
} 