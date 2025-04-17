/**
 * Test Configuration Module
 * 
 * This module provides functionality for managing test configurations 
 * including initialization, validation, and coverage reporting.
 */

/**
 * Represents a test configuration with all necessary settings.
 */
export interface TestConfig {
  id: string;
  name: string;
  testType: 'unit' | 'integration' | 'e2e';
  testPattern: string;
  testEnvironment: string;
  setupFiles: string[];
  coverageThreshold: {
    statements: number;
    branches: number;
    functions: number;
    lines: number;
  };
  initialized?: boolean;
}

/**
 * Represents the result of a validation operation.
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * File with uncovered lines information.
 */
export interface UncoveredFile {
  file: string;
  lines: number[];
}

/**
 * Represents test coverage results.
 */
export interface TestCoverageResult {
  statements: number;
  branches: number;
  functions: number;
  lines: number;
  files: number;
  uncoveredLines: UncoveredFile[];
  meetsCoverage: boolean;
}

// In-memory storage for test configurations
const testConfigRegistry: Record<string, TestConfig> = {};

/**
 * Initializes a test configuration with the provided settings.
 * @param config The test configuration to initialize
 * @returns The initialized test configuration
 * @throws Error if the configuration is invalid
 */
export function initializeTestConfig(config: TestConfig): TestConfig {
  // Validate ID
  if (!config.id || config.id.trim() === '') {
    throw new Error('Test ID is required');
  }

  // Validate test type
  if (!['unit', 'integration', 'e2e'].includes(config.testType)) {
    throw new Error('Invalid test type');
  }
  
  // Set appropriate test pattern based on test type
  let testPattern = config.testPattern;
  if (config.testType === 'integration') {
    testPattern = `**/*.integration.test.{ts,tsx}`;
  } else if (config.testType === 'e2e') {
    testPattern = `**/*.e2e.test.{ts,tsx}`;
  }

  // Create the initialized config
  const initializedConfig: TestConfig = {
    ...config,
    testPattern,
    initialized: true
  };

  // Store in registry
  testConfigRegistry[config.id] = initializedConfig;

  return initializedConfig;
}

/**
 * Validates a test configuration.
 * @param config The test configuration to validate
 * @returns Validation result with any errors
 */
export function validateTestConfig(config: TestConfig): ValidationResult {
  const errors: string[] = [];

  // Validate required fields
  if (!config.id || config.id.trim() === '') {
    errors.push('id is required');
  }

  if (!config.name || config.name.trim() === '') {
    errors.push('name is required');
  }

  if (!config.testEnvironment || config.testEnvironment.trim() === '') {
    errors.push('testEnvironment is required');
  }

  // Validate test type
  if (!['unit', 'integration', 'e2e'].includes(config.testType)) {
    errors.push('testType must be one of: unit, integration, e2e');
  }

  // Validate coverage thresholds
  if (config.coverageThreshold) {
    // Check if all required metrics are present
    const requiredMetrics = ['statements', 'branches', 'functions', 'lines'];
    for (const metric of requiredMetrics) {
      if (!(metric in config.coverageThreshold)) {
        errors.push(`Missing required coverage metric: ${metric}`);
      }
    }

    // Check if threshold values are within valid range
    for (const [key, value] of Object.entries(config.coverageThreshold)) {
      if (typeof value === 'number' && (value < 0 || value > 100)) {
        errors.push('Coverage threshold must be between 0 and 100');
        break; // Only add this error once
      }
    }
  } else {
    errors.push('coverageThreshold is required');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Gets the test coverage for a specific test configuration.
 * @param testId The ID of the test configuration
 * @returns Promise resolving to test coverage results
 * @throws Error if the test configuration doesn't exist
 */
export function getTestCoverage(testId: string): Promise<TestCoverageResult> {
  // Check if test config exists
  if (!testConfigRegistry[testId]) {
    return Promise.reject(new Error(`Test configuration not found: ${testId}`));
  }

  const config = testConfigRegistry[testId];
  
  // In a real implementation, this would call the test runner API to get actual coverage
  // For now, we'll simulate fetching coverage data
  return fetch(`/api/test-coverage/${testId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch coverage data: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      // Calculate if the coverage meets the threshold
      const meetsCoverage = 
        data.statements >= config.coverageThreshold.statements &&
        data.branches >= config.coverageThreshold.branches &&
        data.functions >= config.coverageThreshold.functions &&
        data.lines >= config.coverageThreshold.lines;

      return {
        ...data,
        meetsCoverage
      };
    });
}

/**
 * Resets the test configuration registry.
 * Used primarily for testing.
 */
export function resetTestConfig(): void {
  // Clear the registry
  for (const key in testConfigRegistry) {
    delete testConfigRegistry[key];
  }
} 