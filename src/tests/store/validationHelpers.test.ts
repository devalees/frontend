import { describe, it, expect } from '../../tests/utils';
import {
  validateRequired,
  validateType,
  validatePattern,
  validateMinMax,
  validateLength,
  validateObject,
  validateArray,
  createValidator
} from '../../lib/store/utils/validationHelpers';

describe('Validation Helpers', () => {
  describe('Basic Validations', () => {
    it('should validate required fields', () => {
      expect(validateRequired('value')).toBe(true);
      expect(validateRequired(0)).toBe(true);
      expect(validateRequired(false)).toBe(true);
      expect(validateRequired('')).toBe(false);
      expect(validateRequired(null)).toBe(false);
      expect(validateRequired(undefined)).toBe(false);
    });

    it('should validate value types', () => {
      expect(validateType('string', 'string')).toBe(true);
      expect(validateType(123, 'number')).toBe(true);
      expect(validateType(true, 'boolean')).toBe(true);
      expect(validateType([], 'array')).toBe(true);
      expect(validateType({}, 'object')).toBe(true);
      expect(validateType(() => {}, 'function')).toBe(true);
      
      expect(validateType('123', 'number')).toBe(false);
      expect(validateType(null, 'object')).toBe(false);
      expect(validateType(undefined, 'undefined')).toBe(true);
    });

    it('should validate against regex patterns', () => {
      expect(validatePattern('abc123', /^[a-z0-9]+$/)).toBe(true);
      expect(validatePattern('ABC123', /^[a-z0-9]+$/)).toBe(false);
      
      // Email pattern
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      expect(validatePattern('user@example.com', emailPattern)).toBe(true);
      expect(validatePattern('invalid-email', emailPattern)).toBe(false);
      
      // Should return false for non-string values
      expect(validatePattern(123, /^[0-9]+$/)).toBe(false);
    });
    
    it('should validate numeric min/max values', () => {
      expect(validateMinMax(5, { min: 0, max: 10 })).toBe(true);
      expect(validateMinMax(0, { min: 0, max: 10 })).toBe(true);
      expect(validateMinMax(10, { min: 0, max: 10 })).toBe(true);
      
      expect(validateMinMax(-1, { min: 0, max: 10 })).toBe(false);
      expect(validateMinMax(11, { min: 0, max: 10 })).toBe(false);
      
      // Min only
      expect(validateMinMax(5, { min: 0 })).toBe(true);
      expect(validateMinMax(-1, { min: 0 })).toBe(false);
      
      // Max only
      expect(validateMinMax(5, { max: 10 })).toBe(true);
      expect(validateMinMax(11, { max: 10 })).toBe(false);
      
      // Should handle non-numeric values
      expect(validateMinMax('5', { min: 0, max: 10 })).toBe(false);
    });
    
    it('should validate string/array length', () => {
      // String validation
      expect(validateLength('hello', { min: 3, max: 10 })).toBe(true);
      expect(validateLength('ab', { min: 3, max: 10 })).toBe(false);
      expect(validateLength('toolongstring', { min: 3, max: 10 })).toBe(false);
      
      // Array validation
      expect(validateLength([1, 2, 3], { min: 1, max: 5 })).toBe(true);
      expect(validateLength([], { min: 1, max: 5 })).toBe(false);
      expect(validateLength([1, 2, 3, 4, 5, 6], { min: 1, max: 5 })).toBe(false);
      
      // Min only
      expect(validateLength('hello', { min: 3 })).toBe(true);
      expect(validateLength('ab', { min: 3 })).toBe(false);
      
      // Max only
      expect(validateLength('hello', { max: 10 })).toBe(true);
      expect(validateLength('toolongstring', { max: 10 })).toBe(false);
      
      // Should handle invalid types
      expect(validateLength(123, { min: 1, max: 5 })).toBe(false);
    });
  });
  
  describe('Complex Validations', () => {
    it('should validate object structure', () => {
      const schema = {
        name: { required: true, type: 'string' },
        age: { type: 'number', min: 0, max: 120 },
        email: { type: 'string', pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ }
      };
      
      expect(validateObject({ 
        name: 'John',
        age: 30,
        email: 'john@example.com'
      }, schema)).toBe(true);
      
      expect(validateObject({ 
        age: 30,
        email: 'john@example.com'
      }, schema)).toBe(false); // Missing required name
      
      expect(validateObject({ 
        name: 'John',
        age: 150, // Exceeds max
        email: 'john@example.com'
      }, schema)).toBe(false);
      
      expect(validateObject({ 
        name: 'John',
        age: 30,
        email: 'invalid-email'
      }, schema)).toBe(false);
    });
    
    it('should validate array items', () => {
      // Primitive array validation
      expect(validateArray([1, 2, 3], { type: 'number' })).toBe(true);
      expect(validateArray(['a', 'b', 'c'], { type: 'string' })).toBe(true);
      expect(validateArray([1, '2', 3], { type: 'number' })).toBe(false);
      
      // Object array validation with schema
      const userSchema = {
        id: { required: true, type: 'number' },
        name: { required: true, type: 'string' },
      };
      
      const validUsers = [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' }
      ];
      
      const invalidUsers = [
        { id: 1, name: 'John' },
        { name: 'Jane' } // Missing id
      ];
      
      expect(validateArray(validUsers, { schema: userSchema })).toBe(true);
      expect(validateArray(invalidUsers, { schema: userSchema })).toBe(false);
    });
    
    it('should create and use custom validators', () => {
      const validateUser = createValidator({
        name: { required: true, type: 'string', minLength: 2 },
        email: { required: true, type: 'string', pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ },
        age: { type: 'number', min: 18 }
      });
      
      expect(validateUser({
        name: 'John',
        email: 'john@example.com',
        age: 25
      })).toBe(true);
      
      expect(validateUser({
        name: 'J', // Too short
        email: 'john@example.com',
        age: 25
      })).toBe(false);
      
      expect(validateUser({
        name: 'John',
        email: 'invalid-email',
        age: 25
      })).toBe(false);
      
      expect(validateUser({
        name: 'John',
        email: 'john@example.com',
        age: 16 // Underage
      })).toBe(false);
    });
  });
}); 