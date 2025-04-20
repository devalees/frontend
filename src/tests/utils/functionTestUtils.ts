/**
 * Function Test Utilities
 * 
 * This file contains utilities for testing pure functions.
 * It provides functions for testing inputs, outputs, edge cases,
 * and performance of utility functions.
 */

import { jest } from '@jest/globals';

/**
 * Pure Function Test Utilities
 * Provides utilities for testing pure utility functions
 */
export const pureFunctionTests = {
  /**
   * Tests a pure function with various inputs and expected outputs
   */
  testPureFunction<Input, Output>(
    fn: (input: Input) => Output,
    cases: Array<{
      input: Input;
      expected: Output;
      description: string;
    }>
  ) {
    cases.forEach(({ input, expected, description }) => {
      it(description, () => {
        const result = fn(input);
        expect(result).toEqual(expected);
      });
    });
  },

  /**
   * Tests a function with various input variations
   */
  testFunctionInputs<Input, Output>(
    fn: (input: Input) => Output,
    validInputs: Input[],
    invalidInputs: any[],
    expectedForValid: Output[] | ((input: Input) => Output),
    expectErrorForInvalid = true
  ) {
    // Test valid inputs
    validInputs.forEach((input, index) => {
      const expected = Array.isArray(expectedForValid) 
        ? expectedForValid[index] 
        : expectedForValid(input);
      
      it(`should handle valid input: ${JSON.stringify(input)}`, () => {
        const result = fn(input);
        expect(result).toEqual(expected);
      });
    });

    // Test invalid inputs
    if (expectErrorForInvalid) {
      invalidInputs.forEach((input) => {
        it(`should throw for invalid input: ${JSON.stringify(input)}`, () => {
          expect(() => fn(input as Input)).toThrow();
        });
      });
    } else {
      invalidInputs.forEach((input) => {
        it(`should not throw for invalid input: ${JSON.stringify(input)}`, () => {
          expect(() => fn(input as Input)).not.toThrow();
        });
      });
    }
  },

  /**
   * Tests a function's output characteristics
   */
  testFunctionOutputs<Input, Output>(
    fn: (input: Input) => Output,
    input: Input,
    assertions: Array<(output: Output) => void>
  ) {
    const output = fn(input);
    
    assertions.forEach((assertion, index) => {
      it(`should meet output assertion #${index + 1}`, () => {
        assertion(output);
      });
    });
  },

  /**
   * Tests a function with edge cases
   */
  testFunctionEdgeCases<Input, Output>(
    fn: (input: Input) => Output,
    edgeCases: Array<{
      input: Input;
      expected: Output | Error;
      description: string;
    }>
  ) {
    edgeCases.forEach(({ input, expected, description }) => {
      it(`handles edge case: ${description}`, () => {
        if (expected instanceof Error) {
          expect(() => fn(input)).toThrow(expected.message);
        } else {
          const result = fn(input);
          expect(result).toEqual(expected);
        }
      });
    });
  },
  
  /**
   * Tests a function's performance
   */
  testFunctionPerformance<Input, Output>(
    fn: (input: Input) => Output,
    input: Input,
    maxExecutionTime: number
  ) {
    it(`should execute within ${maxExecutionTime}ms`, () => {
      const start = performance.now();
      fn(input);
      const end = performance.now();
      const executionTime = end - start;
      
      expect(executionTime).toBeLessThanOrEqual(maxExecutionTime);
    });
  },
  
  /**
   * Tests a function for side effects
   */
  testForSideEffects<Input>(
    fn: (input: Input) => any,
    input: Input
  ) {
    it('should not have side effects', () => {
      // Create a deep copy of the input to compare later
      const inputCopy = JSON.parse(JSON.stringify(input));
      
      // Mock any potential side effect targets
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const documentSpy = jest.spyOn(document, 'getElementById').mockImplementation(() => null);
      const localStorageSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
      
      try {
        // Execute the function
        fn(input);
        
        // Verify input wasn't modified (for objects/arrays)
        if (typeof input === 'object' && input !== null) {
          expect(input).toEqual(inputCopy);
        }
        
        // Verify no common side effects occurred
        expect(consoleSpy).not.toHaveBeenCalled();
        expect(documentSpy).not.toHaveBeenCalled();
        expect(localStorageSpy).not.toHaveBeenCalled();
      } finally {
        // Restore all mocks
        consoleSpy.mockRestore();
        documentSpy.mockRestore();
        localStorageSpy.mockRestore();
      }
    });
  }
};

/**
 * Function Test Utilities
 * 
 * This file provides utilities for testing JavaScript/TypeScript functions
 */

/**
 * Simple performance test for a function
 * 
 * @param fn - Function to test
 * @param args - Arguments to pass to the function
 * @param iterations - Number of iterations (default: 1000)
 * @returns Average execution time in milliseconds
 */
export function measurePerformance<T extends (...args: any[]) => any>(
  fn: T,
  args: Parameters<T>,
  iterations = 1000
): number {
  // Run once first to avoid initial setup time affecting results
  fn(...args);
  
  const start = performance.now();
  
  for (let i = 0; i < iterations; i++) {
    fn(...args);
  }
  
  const end = performance.now();
  const totalTime = end - start;
  
  return totalTime / iterations;
}

/**
 * Tests a function with different inputs and expected outputs
 * 
 * @param fn - Function to test
 * @param testCases - Array of test cases with input and expected output
 * @returns Array of test results
 */
export function testWithCases<T extends (...args: any[]) => any>(
  fn: T,
  testCases: Array<{
    input: Parameters<T>;
    expected: ReturnType<T>;
    description?: string;
  }>
): Array<{
  description: string;
  passed: boolean;
  input: Parameters<T>;
  expected: ReturnType<T>;
  actual: ReturnType<T>;
}> {
  return testCases.map(testCase => {
    const { input, expected, description } = testCase;
    const actual = fn(...input);
    
    const passed = JSON.stringify(actual) === JSON.stringify(expected);
    
    return {
      description: description || `Test with input: ${JSON.stringify(input)}`,
      passed,
      input,
      expected,
      actual
    };
  });
}

/**
 * Tests exception handling in a function
 * 
 * @param fn - Function to test
 * @param input - Input that should cause an exception
 * @param expectedError - Expected error (string or error instance)
 * @returns Test result
 */
export function testException<T extends (...args: any[]) => any>(
  fn: T,
  input: Parameters<T>,
  expectedError?: string | Error | RegExp
): {
  threw: boolean;
  errorMessage?: string;
  expected?: string;
  passed: boolean;
} {
  try {
    fn(...input);
    
    return {
      threw: false,
      passed: expectedError === undefined
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    let passed = true;
    let expected;
    
    if (expectedError !== undefined) {
      if (typeof expectedError === 'string') {
        expected = expectedError;
        passed = errorMessage.includes(expectedError);
      } else if (expectedError instanceof RegExp) {
        expected = expectedError.toString();
        passed = expectedError.test(errorMessage);
      } else if (expectedError instanceof Error) {
        expected = expectedError.message;
        passed = errorMessage.includes(expected);
      }
    }
    
    return {
      threw: true,
      errorMessage,
      expected,
      passed
    };
  }
} 