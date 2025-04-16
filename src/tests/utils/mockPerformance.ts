/**
 * Mock Performance utilities for testing performance-related code
 * 
 * This file provides utilities for mocking the Performance API in tests.
 * It helps with testing performance measurements and timing.
 */

import { vi, SpyInstance } from 'vitest';

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

type PerformanceMetrics = {
  markSpy: SpyInstance;
  measureSpy: SpyInstance;
};

class PerformanceMock {
  private marks: Record<string, number> = {};
  private measures: Record<string, MockPerformanceEntry> = {};
  private entries: MockPerformanceEntry[] = [];
  private markSpy: SpyInstance;
  private measureSpy: SpyInstance;

  constructor() {
    // Create spy functions
    this.markSpy = vi.fn((name: string) => {
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

    this.measureSpy = vi.fn((name: string, startMark: string, endMark: string) => {
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

    // Mock the performance API
    const mockPerformance = {
      mark: this.markSpy,
      measure: this.measureSpy,
      getEntriesByType: (type: string): PerformanceEntryList => {
        const entries = type === 'resource' 
          ? this.entries 
          : Object.values(this.measures).filter(entry => entry.entryType === type);
        
        return Object.assign(entries, {
          toJSON: () => entries.map(entry => entry.toJSON())
        }) as PerformanceEntryList;
      },
      clearMarks: () => {
        this.marks = {};
      },
      clearMeasures: () => {
        this.measures = {};
      }
    };

    // Replace the global performance object
    Object.defineProperty(global, 'performance', {
      value: mockPerformance,
      writable: true,
      configurable: true
    });
  }

  /**
   * Reset all performance mocks and clear stored metrics
   */
  reset() {
    this.marks = {};
    this.measures = {};
    this.entries = [];
    vi.clearAllMocks();
  }

  /**
   * Get spy instances for performance methods
   */
  spyOnMetrics(): PerformanceMetrics {
    return {
      markSpy: this.markSpy,
      measureSpy: this.measureSpy
    };
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
}

// Export a singleton instance
export const mockPerformance = new PerformanceMock(); 