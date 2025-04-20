/**
 * Mock Performance utilities for testing performance-related code
 * 
 * This file provides utilities for mocking the Performance API in tests.
 * It helps with testing performance measurements and timing.
 */

import { jest } from '@jest/globals';
import type { SpyInstance } from 'jest-mock';

// Type definitions
interface MockPerformanceEntry extends PerformanceEntry {
  initiatorType?: string;
  transferSize?: number;
}

interface MockPerformanceMark extends PerformanceMark {
  detail: any;
}

interface MockPerformanceMeasure extends PerformanceMeasure {
  detail: any;
}

class PerformanceMock {
  private marks: Record<string, number> = {};
  private measures: Record<string, MockPerformanceEntry> = {};
  private entries: MockPerformanceEntry[] = [];
  
  // Create spy functions for testing
  public mark = jest.fn((name: string) => {
    this.marks[name] = Date.now();
    return {
      name,
      entryType: 'mark',
      startTime: this.marks[name],
      duration: 0,
      detail: null,
      toJSON: () => ({
        name,
        entryType: 'mark',
        startTime: this.marks[name],
        duration: 0
      })
    } as MockPerformanceMark;
  });

  public measure = jest.fn((name: string, startMark: string, endMark: string) => {
    const start = this.marks[startMark] || 0;
    const end = this.marks[endMark] || Date.now();
    const duration = end - start;
    
    const measure = {
      name,
      entryType: 'measure',
      startTime: start,
      duration,
      detail: null,
      toJSON: () => ({
        name,
        entryType: 'measure',
        startTime: start,
        duration
      })
    } as MockPerformanceMeasure;
    
    this.measures[name] = measure;
    return measure;
  });

  /**
   * Reset all performance mocks and clear stored metrics
   */
  reset() {
    this.marks = {};
    this.measures = {};
    this.entries = [];
    jest.clearAllMocks();
  }

  /**
   * Reset all performance mocks and clear stored metrics (alias for reset)
   */
  resetAll() {
    this.reset();
  }

  /**
   * Add a resource entry for testing
   */
  addResourceEntry(entry: Partial<MockPerformanceEntry>) {
    const resourceEntry: MockPerformanceEntry = {
      name: entry.name || 'resource',
      entryType: 'resource',
      startTime: entry.startTime || 0,
      duration: entry.duration || 0,
      initiatorType: entry.initiatorType,
      transferSize: entry.transferSize,
      toJSON: () => ({
        name: entry.name || 'resource',
        entryType: 'resource',
        startTime: entry.startTime || 0,
        duration: entry.duration || 0,
        initiatorType: entry.initiatorType,
        transferSize: entry.transferSize
      })
    };
    this.entries.push(resourceEntry);
  }

  /**
   * Get entries by type
   */
  getEntriesByType(type: string): PerformanceEntryList {
    return this.entries.filter(entry => entry.entryType === type) as unknown as PerformanceEntryList;
  }

  /**
   * Clear all marks
   */
  clearMarks() {
    this.marks = {};
    jest.clearAllMocks();
  }

  /**
   * Clear all measures
   */
  clearMeasures() {
    this.measures = {};
    jest.clearAllMocks();
  }

  /**
   * Create spy functions for performance marks and measures
   * This is used in tests to verify that performance marks and measures are called
   */
  spyOnMetrics() {
    // Since we're already using jest.fn() for mark and measure,
    // we can just return those directly as they already have spy functionality
    return {
      markSpy: this.mark,
      measureSpy: this.measure
    };
  }
}

// Create a singleton instance
const performanceMockInstance = new PerformanceMock();

// Export the singleton instance
export { performanceMockInstance }; 