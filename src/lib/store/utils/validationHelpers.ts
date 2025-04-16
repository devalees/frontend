/**
 * Validation helper utilities for Zustand store
 * Provides functions for validating state data
 */

/**
 * Types for validation
 */
type ValidType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function' | 'undefined' | 'null';
type ValidationRule = {
  required?: boolean;
  type?: ValidType;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  schema?: ValidationSchema;
};
type ValidationSchema = Record<string, ValidationRule>;

/**
 * Validates that a value is not empty (not null, undefined, or empty string)
 * @param value The value to validate
 * @returns True if the value is not empty
 */
export function validateRequired(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  return true;
}

/**
 * Validates that a value is of a specific type
 * @param value The value to validate
 * @param type The expected type
 * @returns True if the value is of the expected type
 */
export function validateType(value: any, type: ValidType): boolean {
  if (value === null) return type === 'null';
  if (value === undefined) return type === 'undefined';
  
  if (type === 'array') return Array.isArray(value);
  if (type === 'object') return typeof value === 'object' && !Array.isArray(value) && value !== null;
  
  return typeof value === type;
}

/**
 * Validates that a string matches a pattern
 * @param value The string to validate
 * @param pattern The regex pattern
 * @returns True if the string matches the pattern
 */
export function validatePattern(value: any, pattern: RegExp): boolean {
  if (typeof value !== 'string') return false;
  return pattern.test(value);
}

/**
 * Validates that a number is within a range
 * @param value The number to validate
 * @param options The min and max values
 * @returns True if the number is within the range
 */
export function validateMinMax(
  value: any,
  options: { min?: number; max?: number }
): boolean {
  if (typeof value !== 'number') return false;
  
  const { min, max } = options;
  if (min !== undefined && value < min) return false;
  if (max !== undefined && value > max) return false;
  
  return true;
}

/**
 * Validates that a string or array has a length within a range
 * @param value The string or array to validate
 * @param options The min and max length
 * @returns True if the length is within the range
 */
export function validateLength(
  value: any,
  options: { min?: number; max?: number }
): boolean {
  if (typeof value !== 'string' && !Array.isArray(value)) return false;
  
  const length = value.length;
  const { min, max } = options;
  
  if (min !== undefined && length < min) return false;
  if (max !== undefined && length > max) return false;
  
  return true;
}

/**
 * Validates an object against a schema
 * @param obj The object to validate
 * @param schema The validation schema
 * @returns True if the object passes all validations
 */
export function validateObject(
  obj: Record<string, any>,
  schema: ValidationSchema
): boolean {
  // Check if obj is actually an object
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return false;
  }
  
  // Validate each field according to the schema
  for (const key in schema) {
    const rules = schema[key];
    const value = obj[key];
    
    // Check required fields
    if (rules.required && !validateRequired(value)) {
      return false;
    }
    
    // Skip further validation if the field is not required and is empty
    if (!rules.required && (value === undefined || value === null)) {
      continue;
    }
    
    // Check type
    if (rules.type && !validateType(value, rules.type)) {
      return false;
    }
    
    // Check pattern
    if (rules.pattern && !validatePattern(value, rules.pattern)) {
      return false;
    }
    
    // Check min/max for numbers
    if ((rules.min !== undefined || rules.max !== undefined) && 
        !validateMinMax(value, { min: rules.min, max: rules.max })) {
      return false;
    }
    
    // Check min/max length for strings and arrays
    if ((rules.minLength !== undefined || rules.maxLength !== undefined) && 
        !validateLength(value, { min: rules.minLength, max: rules.maxLength })) {
      return false;
    }
    
    // Recursively validate nested objects
    if (rules.schema && !validateObject(value, rules.schema)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Validates an array of items
 * @param array The array to validate
 * @param options Validation options
 * @returns True if the array passes all validations
 */
export function validateArray(
  array: any[],
  options: { type?: ValidType; schema?: ValidationSchema }
): boolean {
  if (!Array.isArray(array)) {
    return false;
  }
  
  // Validate array length
  const { type, schema } = options;
  
  // Validate each item in the array
  for (const item of array) {
    if (type && !validateType(item, type)) {
      return false;
    }
    
    if (schema && !validateObject(item, schema)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Creates a reusable validator function from a schema
 * @param schema The validation schema
 * @returns A function that validates objects against the schema
 */
export function createValidator(schema: ValidationSchema) {
  return (obj: Record<string, any>): boolean => {
    return validateObject(obj, schema);
  };
}

/**
 * Creates validation middleware for Zustand store
 * Validates state updates against a schema
 * @param schema The validation schema
 * @returns A middleware function
 */
export function createValidationMiddleware(schema: ValidationSchema) {
  return (config: any) => (set: any, get: any, api: any) => {
    return config((partial: any, replace?: boolean) => {
      // If it's a function, we can't validate it until it executes
      if (typeof partial === 'function') {
        return set(partial, replace);
      }
      
      // For direct state updates, validate the merged state
      const nextState = replace 
        ? partial 
        : { ...get(), ...partial };
      
      if (!validateObject(nextState, schema)) {
        console.error('State validation failed', { nextState, schema });
        throw new Error('State validation failed');
      }
      
      return set(partial, replace);
    }, get, api);
  };
} 