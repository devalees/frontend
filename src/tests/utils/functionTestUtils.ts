/**
 * Function Test Utilities
 * 
 * This file contains utilities for testing pure functions.
 * It provides functions for testing inputs, outputs, edge cases,
 * and performance of utility functions.
 */

import { vi } from 'vitest';

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
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const documentSpy = vi.spyOn(document, 'getElementById').mockImplementation(() => null);
      const localStorageSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
      
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