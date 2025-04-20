/**
 * Performance Analysis Tests
 * 
 * These tests verify the performance analysis implementation including:
 * - Performance tracking
 * - Bottleneck detection
 * - Optimization suggestions
 */

// Import core testing utilities directly from vitest
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
// Import our custom utilities from the centralized system
import { performanceMockInstance, waitFor } from '../utils';

// Import performance analysis (this will fail until implemented)
// This will be the target of our implementation
import { 
  analyzePerformanceMetrics, 
  detectBottlenecks, 
  generateOptimizationSuggestions 
} from '../../lib/performance/performanceAnalysis';

// Mock modules that the performance analysis might depend on
vi.mock('../../lib/components/debugPerformance', () => ({
  logPerformanceData: vi.fn(),
  logComponentPerformance: vi.fn(),
  logComponentLoadTimes: vi.fn(),
  observePerformance: vi.fn()
}));

// Create fixtures for performance data
const createPerformanceMark = (overrides = {}) => ({
  name: 'test-mark',
  startTime: 100,
  entryType: 'mark',
  duration: 0,
  ...overrides
});

const createPerformanceMeasure = (overrides = {}) => ({
  name: 'test-measure',
  startTime: 100,
  duration: 50,
  entryType: 'measure',
  ...overrides
});

const createResourceTiming = (overrides = {}) => ({
  name: 'https://example.com/resource.js',
  entryType: 'resource',
  startTime: 50,
  duration: 150,
  initiatorType: 'script',
  transferSize: 45000,
  ...overrides
});

const createComponentTiming = (overrides = {}) => ({
  name: 'component-load-time:TestComponent',
  entryType: 'measure',
  startTime: 200,
  duration: 120,
  ...overrides
});

describe('Performance Analysis', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    performanceMockInstance.reset();
    
    // Mock global.performance to use our performanceMockInstance
    Object.defineProperty(global, 'performance', {
      value: performanceMockInstance,
      configurable: true,
    });
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  describe('Performance Tracking', () => {
    it('should analyze performance metrics from marks and measures', async () => {
      // Add test performance marks and measures
      performanceMockInstance.mark('component-load-start:TestComponent');
      performanceMockInstance.mark('component-load-end:TestComponent');
      performanceMockInstance.measure(
        'component-load-time:TestComponent',
        'component-load-start:TestComponent',
        'component-load-end:TestComponent'
      );
      
      // Add resource entries
      performanceMockInstance.addResourceEntry(createResourceTiming({
        name: 'https://example.com/main.js',
        duration: 250,
        transferSize: 120000
      }));
      
      // Call the analysis function (this should fail until implemented)
      const result = await analyzePerformanceMetrics();
      
      // Check that metrics are analyzed correctly
      expect(result).toBeDefined();
      expect(result.componentLoadTimes).toBeDefined();
      expect(result.resourceLoadTimes).toBeDefined();
      expect(result.markTimestamps).toBeDefined();
      
      // Verify component load times
      expect(result.componentLoadTimes).toContainEqual(expect.objectContaining({
        componentId: 'TestComponent',
        loadTime: expect.any(Number)
      }));
      
      // Verify resource load times are tracked
      expect(result.resourceLoadTimes).toContainEqual(expect.objectContaining({
        url: 'https://example.com/main.js',
        duration: 250,
        size: 120000
      }));
    });
    
    it('should track performance metrics over time', async () => {
      // Simulate performance data at different points in time
      const timePoints = [0, 100, 200];
      
      // First time point
      performanceMockInstance.mark('route-load-start:Home');
      performanceMockInstance.mark('route-load-end:Home');
      performanceMockInstance.measure(
        'route-load-time:Home', 
        'route-load-start:Home', 
        'route-load-end:Home'
      );
      
      // Analyze at first time point (this should fail until implemented)
      const firstResult = await analyzePerformanceMetrics();
      
      // Second time point (add more data)
      performanceMockInstance.mark('component-load-start:Header');
      performanceMockInstance.mark('component-load-end:Header');
      performanceMockInstance.measure(
        'component-load-time:Header', 
        'component-load-start:Header', 
        'component-load-end:Header'
      );
      
      // Analyze at second time point
      const secondResult = await analyzePerformanceMetrics();
      
      // Verify metrics are accumulating
      expect(secondResult.totalEntries).toBeGreaterThan(firstResult.totalEntries);
      expect(secondResult.metricsHistory.length).toBeGreaterThan(0);
      
      // Check that time series data is recorded
      expect(secondResult.metricsHistory).toContainEqual(expect.objectContaining({
        timestamp: expect.any(Number),
        metrics: expect.any(Object)
      }));
    });
  });
  
  describe('Bottleneck Detection', () => {
    it('should detect slow component renders', async () => {
      // Add slow component render metrics
      performanceMockInstance.mark('component-render-start:SlowComponent');
      performanceMockInstance.mark('component-render-end:SlowComponent');
      performanceMockInstance.measure(
        'component-render-time:SlowComponent',
        'component-render-start:SlowComponent',
        'component-render-end:SlowComponent'
      );
      
      performanceMockInstance.mark('component-render-start:FastComponent');
      performanceMockInstance.mark('component-render-end:FastComponent');
      performanceMockInstance.measure(
        'component-render-time:FastComponent',
        'component-render-start:FastComponent',
        'component-render-end:FastComponent'
      );
      
      // Call bottleneck detection (this should fail until implemented)
      const bottlenecks = await detectBottlenecks();
      
      // Verify bottlenecks are detected
      expect(bottlenecks).toBeDefined();
      expect(bottlenecks.slowComponents).toBeDefined();
      expect(bottlenecks.slowComponents.length).toBeGreaterThan(0);
      
      // SlowComponent should be identified
      expect(bottlenecks.slowComponents).toContainEqual(expect.objectContaining({
        componentId: 'SlowComponent',
        renderTime: 300,
        severity: 'high' // Should be marked as high severity
      }));
      
      // FastComponent should not be in bottlenecks
      const hasSlowComponent = bottlenecks.slowComponents.some((comp: { componentId: string }) => 
        comp.componentId === 'SlowComponent'
      );
      const hasFastComponent = bottlenecks.slowComponents.some((comp: { componentId: string }) => 
        comp.componentId === 'FastComponent'
      );
      
      expect(hasSlowComponent).toBe(true);
      expect(hasFastComponent).toBe(false);
    });
    
    it('should detect slow network resources', async () => {
      // Add slow resource load metrics
      performanceMockInstance.addResourceEntry(createResourceTiming({
        name: 'https://example.com/large-image.jpg',
        duration: 800, // 800ms load time
        transferSize: 2000000 // 2MB
      }));
      
      performanceMockInstance.addResourceEntry(createResourceTiming({
        name: 'https://example.com/small-script.js',
        duration: 50, // 50ms load time
        transferSize: 5000 // 5KB
      }));
      
      // Call bottleneck detection (this should fail until implemented)
      const bottlenecks = await detectBottlenecks();
      
      // Verify bottlenecks are detected
      expect(bottlenecks).toBeDefined();
      expect(bottlenecks.slowResources).toBeDefined();
      expect(bottlenecks.slowResources.length).toBeGreaterThan(0);
      
      // Large image should be identified
      expect(bottlenecks.slowResources).toContainEqual(expect.objectContaining({
        url: 'https://example.com/large-image.jpg',
        loadTime: 800,
        size: 2000000,
        severity: 'high' // Should be marked as high severity
      }));
      
      // Small script should not be in bottlenecks
      const hasLargeImage = bottlenecks.slowResources.some((res: { url: string }) => 
        res.url.includes('large-image.jpg')
      );
      const hasSmallScript = bottlenecks.slowResources.some((res: { url: string }) => 
        res.url.includes('small-script.js')
      );
      
      expect(hasLargeImage).toBe(true);
      expect(hasSmallScript).toBe(false);
    });
    
    it('should detect render blocking patterns', async () => {
      // Add metrics showing render blocking pattern
      performanceMockInstance.mark('route-load-start:Dashboard');
      
      // Add several component loads that block rendering
      for (let i = 0; i < 5; i++) {
        performanceMockInstance.mark(`component-load-start:DashboardWidget${i}`);
        performanceMockInstance.mark(`component-load-end:DashboardWidget${i}`);
        performanceMockInstance.measure(
          `component-load-time:DashboardWidget${i}`,
          `component-load-start:DashboardWidget${i}`,
          `component-load-end:DashboardWidget${i}`
        );
      }
      
      performanceMockInstance.mark('route-load-end:Dashboard');
      performanceMockInstance.measure(
        'route-load-time:Dashboard',
        'route-load-start:Dashboard',
        'route-load-end:Dashboard'
      );
      
      // Call bottleneck detection (this should fail until implemented)
      const bottlenecks = await detectBottlenecks();
      
      // Verify render blocking patterns are detected
      expect(bottlenecks).toBeDefined();
      expect(bottlenecks.renderBlockingPatterns).toBeDefined();
      expect(bottlenecks.renderBlockingPatterns.length).toBeGreaterThan(0);
      
      // Should identify Dashboard route as having render blocking
      expect(bottlenecks.renderBlockingPatterns).toContainEqual(expect.objectContaining({
        routeId: 'Dashboard',
        blockingComponents: expect.arrayContaining([expect.stringMatching(/DashboardWidget/)]),
        severity: expect.stringMatching(/medium|high/)
      }));
    });
  });
  
  describe('Optimization Suggestions', () => {
    it('should generate suggestions for slow components', async () => {
      // Add slow component render metrics
      performanceMockInstance.mark('component-render-start:SlowComponent');
      performanceMockInstance.mark('component-render-end:SlowComponent');
      performanceMockInstance.measure(
        'component-render-time:SlowComponent',
        'component-render-start:SlowComponent',
        'component-render-end:SlowComponent'
      );
      
      // First detect bottlenecks
      const bottlenecks = await detectBottlenecks();
      
      // Then generate suggestions (this should fail until implemented)
      const suggestions = await generateOptimizationSuggestions(bottlenecks);
      
      // Verify suggestions are generated
      expect(suggestions).toBeDefined();
      expect(suggestions.componentSuggestions).toBeDefined();
      expect(suggestions.componentSuggestions.length).toBeGreaterThan(0);
      
      // Should include memoization suggestion for slow components
      const hasMemoizationSuggestion = suggestions.componentSuggestions.some(
        (sugg: { componentId: string; suggestion: string }) => 
          sugg.componentId === 'SlowComponent' && 
          sugg.suggestion.includes('memoization')
      );
      
      expect(hasMemoizationSuggestion).toBe(true);
    });
    
    it('should generate suggestions for slow resources', async () => {
      // Add slow resource load metrics
      performanceMockInstance.addResourceEntry(createResourceTiming({
        name: 'https://example.com/large-image.jpg',
        duration: 800, // 800ms load time
        transferSize: 2000000 // 2MB
      }));
      
      // First detect bottlenecks
      const bottlenecks = await detectBottlenecks();
      
      // Then generate suggestions (this should fail until implemented)
      const suggestions = await generateOptimizationSuggestions(bottlenecks);
      
      // Verify suggestions are generated
      expect(suggestions).toBeDefined();
      expect(suggestions.resourceSuggestions).toBeDefined();
      expect(suggestions.resourceSuggestions.length).toBeGreaterThan(0);
      
      // Should include image optimization suggestion
      const hasImageOptimizationSuggestion = suggestions.resourceSuggestions.some(
        (sugg: { resourceUrl: string; suggestion: string }) => 
          sugg.resourceUrl.includes('large-image.jpg') && 
          (sugg.suggestion.includes('optimize') || sugg.suggestion.includes('compression'))
      );
      
      expect(hasImageOptimizationSuggestion).toBe(true);
    });
    
    it('should generate suggestions for render blocking patterns', async () => {
      // Add metrics showing render blocking pattern
      performanceMockInstance.mark('route-load-start:Dashboard');
      
      // Add several component loads that block rendering
      for (let i = 0; i < 5; i++) {
        performanceMockInstance.mark(`component-load-start:DashboardWidget${i}`);
        performanceMockInstance.mark(`component-load-end:DashboardWidget${i}`);
        performanceMockInstance.measure(
          `component-load-time:DashboardWidget${i}`,
          `component-load-start:DashboardWidget${i}`,
          `component-load-end:DashboardWidget${i}`
        );
      }
      
      performanceMockInstance.mark('route-load-end:Dashboard');
      performanceMockInstance.measure(
        'route-load-time:Dashboard',
        'route-load-start:Dashboard',
        'route-load-end:Dashboard'
      );
      
      // First detect bottlenecks
      const bottlenecks = await detectBottlenecks();
      
      // Then generate suggestions (this should fail until implemented)
      const suggestions = await generateOptimizationSuggestions(bottlenecks);
      
      // Verify suggestions are generated
      expect(suggestions).toBeDefined();
      expect(suggestions.routeSuggestions).toBeDefined();
      expect(suggestions.routeSuggestions.length).toBeGreaterThan(0);
      
      // Should include code splitting or lazy loading suggestion
      const hasLazyLoadingSuggestion = suggestions.routeSuggestions.some(
        (sugg: { routeId: string; suggestion: string }) => 
          sugg.routeId === 'Dashboard' && 
          (sugg.suggestion.includes('lazy loading') || sugg.suggestion.includes('code splitting'))
      );
      
      expect(hasLazyLoadingSuggestion).toBe(true);
    });
  });
}); 