/**
 * Centralized Testing Framework Utilities
 * 
 * This file provides centralized access to testing framework functions.
 * It re-exports the testing functions from the testing library to ensure
 * consistent usage across the codebase.
 */

// Re-export testing functions from vitest
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Export the testing functions
export {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi
}; 