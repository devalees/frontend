/**
 * Performance debugging utilities
 * Add functions to help debug and analyze performance marks and measures
 */

interface PerformanceData {
  marks: {
    name: string;
    startTime: number;
  }[];
  measures: {
    name: string;
    startTime: number;
    duration: number;
  }[];
}

/**
 * Log all performance marks and measures
 * @returns Object containing all performance data
 */
export function logPerformanceData(): PerformanceData {
  const marks = performance.getEntriesByType('mark');
  const measures = performance.getEntriesByType('measure');
  
  console.group('Performance Data');
  
  console.log('=== Performance Marks ===');
  marks.forEach(mark => {
    console.log(`Mark: ${mark.name}, Time: ${mark.startTime.toFixed(2)}ms`);
  });
  
  console.log('\n=== Performance Measures ===');
  measures.forEach(measure => {
    console.log(`Measure: ${measure.name}, Duration: ${measure.duration.toFixed(2)}ms (${measure.startTime.toFixed(2)}ms - ${(measure.startTime + measure.duration).toFixed(2)}ms)`);
  });
  
  console.groupEnd();
  
  return {
    marks: marks.map(mark => ({ 
      name: mark.name, 
      startTime: mark.startTime 
    })),
    measures: measures.map(measure => ({
      name: measure.name,
      startTime: measure.startTime,
      duration: measure.duration
    }))
  };
}

/**
 * Log component loading performance for a specific component
 * @param componentId - ID of the component to check
 */
export function logComponentPerformance(componentId: string): void {
  const allMarks = performance.getEntriesByType('mark');
  const allMeasures = performance.getEntriesByType('measure');
  
  const componentMarks = allMarks.filter(mark => mark.name.includes(componentId));
  const componentMeasures = allMeasures.filter(measure => measure.name.includes(componentId));
  
  console.group(`Performance for Component: ${componentId}`);
  
  console.log('=== Component Marks ===');
  componentMarks.forEach(mark => {
    console.log(`Mark: ${mark.name}, Time: ${mark.startTime.toFixed(2)}ms`);
  });
  
  console.log('\n=== Component Measures ===');
  componentMeasures.forEach(measure => {
    console.log(`Measure: ${measure.name}, Duration: ${measure.duration.toFixed(2)}ms (${measure.startTime.toFixed(2)}ms - ${(measure.startTime + measure.duration).toFixed(2)}ms)`);
  });
  
  console.groupEnd();
}

/**
 * Clear all performance marks and measures
 */
export function clearPerformanceData(): void {
  performance.clearMarks();
  performance.clearMeasures();
  console.log('All performance marks and measures cleared');
}

/**
 * Apply a performance observer to watch for new performance entries
 * @param entryTypes - Types of entries to observe
 * @param callback - Callback function to handle entries
 * @returns The created PerformanceObserver
 */
export function observePerformance(
  entryTypes: string[] = ['mark', 'measure'],
  callback?: (list: PerformanceObserverEntryList) => void
): PerformanceObserver {
  const defaultCallback = (list: PerformanceObserverEntryList) => {
    const entries = list.getEntries();
    entries.forEach((entry: PerformanceEntry) => {
      if (entry.entryType === 'mark') {
        console.log(`[Performance Mark] ${entry.name} at ${entry.startTime.toFixed(2)}ms`);
      } else if (entry.entryType === 'measure') {
        const measureEntry = entry as PerformanceMeasure;
        console.log(`[Performance Measure] ${entry.name}: ${measureEntry.duration.toFixed(2)}ms`);
      }
    });
  };
  
  const observer = new PerformanceObserver(callback || defaultCallback);
  observer.observe({ entryTypes });
  
  console.log(`Performance observer started for: ${entryTypes.join(', ')}`);
  return observer;
}

/**
 * Log all component loading durations
 * Finds all component load time measures and prints them sorted by duration
 */
export function logComponentLoadTimes(): void {
  const measures = performance.getEntriesByType('measure');
  const loadMeasures = measures.filter(measure => 
    measure.name.includes('component-load-time') || 
    measure.name.includes('component-dependencies-load-time') ||
    measure.name.includes('component-render-time')
  );
  
  // Sort by duration (descending)
  const sortedMeasures = loadMeasures.sort((a, b) => b.duration - a.duration);
  
  console.group('Component Loading Performance (Sorted by Duration)');
  
  sortedMeasures.forEach(measure => {
    console.log(`${measure.name}: ${measure.duration.toFixed(2)}ms`);
  });
  
  // Calculate some statistics
  if (sortedMeasures.length > 0) {
    const total = sortedMeasures.reduce((sum, measure) => sum + measure.duration, 0);
    const average = total / sortedMeasures.length;
    const median = sortedMeasures[Math.floor(sortedMeasures.length / 2)].duration;
    const max = sortedMeasures[0].duration;
    const min = sortedMeasures[sortedMeasures.length - 1].duration;
    
    console.log('\n=== Statistics ===');
    console.log(`Total measurements: ${sortedMeasures.length}`);
    console.log(`Average duration: ${average.toFixed(2)}ms`);
    console.log(`Median duration: ${median.toFixed(2)}ms`);
    console.log(`Max duration: ${max.toFixed(2)}ms`);
    console.log(`Min duration: ${min.toFixed(2)}ms`);
  }
  
  console.groupEnd();
} 