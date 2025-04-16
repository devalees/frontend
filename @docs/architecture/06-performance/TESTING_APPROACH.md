# Performance Testing Approach

This document extends the [General Testing Approach](../05-testing/GENERAL_TESTING_APPROACH.md) with specific guidance for performance testing.

## Performance-Specific Testing Considerations

When implementing the performance tests outlined in `IMPLEMENTATION_STEPS.md`, follow the general testing approach and consider these additional guidelines:

### Performance-Specific Test Fixtures

Create fixtures for performance-related test data:

```typescript
// Performance metrics fixture
const createPerformanceMetrics = (overrides = {}) => ({
  timeToFirstByte: 120,
  firstContentfulPaint: 250,
  timeToInteractive: 350,
  ...overrides
});

// Route chunk fixture
const createRouteChunk = (overrides = {}) => ({
  name: 'TestRoute',
  size: 45000, // bytes
  loadTime: 150, // ms
  ...overrides
});
```

### Performance Testing Patterns

1. **Benchmark Testing**: Measure and compare execution times
2. **Load Time Testing**: Verify components load within acceptable timeframes
3. **Memory Usage Testing**: Check for memory leaks or excessive consumption
4. **Core Web Vitals Testing**: Test FCP, LCP, CLS, and other web vitals
5. **Bundle Size Testing**: Verify code splitting is working correctly

## Example: Testing Route-based Splitting

Here's how to apply our testing approach to the route-based code splitting tasks:

```typescript
// src/tests/performance/routeSplitting.test.ts
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../tests/utils';
import { RouterContext } from '../../tests/contexts';
import { mockRouteComponent } from '../../tests/mocks';

// Create fixtures for route chunks
const createRouteChunk = (overrides = {}) => ({
  name: 'TestRoute',
  size: 45000, // bytes
  loadTime: 150, // ms
  ...overrides
});

describe('Route-based Code Splitting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear module loading cache between tests
    vi.resetModules();
  });

  describe('Route Loading', () => {
    it('should lazy load route component when navigating', async () => {
      // Setup with route fixture
      const routeChunk = createRouteChunk();
      
      // Mock dynamic import timing
      vi.mock('../../pages/TestRoute', () => {
        return {
          default: mockRouteComponent({
            name: routeChunk.name,
            loadDelay: routeChunk.loadTime
          })
        };
      });
      
      // Mock performance measurement
      const performanceMark = vi.spyOn(performance, 'mark');
      const performanceMeasure = vi.spyOn(performance, 'measure');
      
      // Render router with test context
      const { router } = render(
        <RouterContext initialRoute="/">
          <App />
        </RouterContext>
      );
      
      // Navigate to the route
      await act(() => {
        router.navigate('/test-route');
      });
      
      // Assert loading indicator shown
      expect(screen.getByTestId('route-loading')).toBeInTheDocument();
      
      // Wait for route to load
      await waitFor(() => {
        expect(screen.queryByTestId('route-loading')).not.toBeInTheDocument();
        expect(screen.getByText(`Route: ${routeChunk.name}`)).toBeInTheDocument();
      });
      
      // Verify performance was measured
      expect(performanceMark).toHaveBeenCalledWith(expect.stringContaining('route-load-start'));
      expect(performanceMark).toHaveBeenCalledWith(expect.stringContaining('route-load-end'));
      expect(performanceMeasure).toHaveBeenCalledWith(
        expect.stringContaining('route-load-time'),
        expect.stringContaining('route-load-start'),
        expect.stringContaining('route-load-end')
      );
    });
  });
});
```

## Example: Testing Performance Monitoring

```typescript
// src/tests/performance/metricsCollection.test.ts
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act, waitFor } from '../../tests/utils';
import { mockPerformanceObserver } from '../../tests/mocks';
import { PerformanceMetricsProvider } from '../../lib/performance/PerformanceMetricsProvider';
import { usePerformanceMetrics } from '../../lib/performance/usePerformanceMetrics';

// Create fixtures for performance entries
const createPerformanceEntry = (overrides = {}) => ({
  name: 'first-contentful-paint',
  entryType: 'paint',
  startTime: 250,
  duration: 0,
  ...overrides
});

describe('Performance Metrics Collection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPerformanceObserver.reset();
  });

  describe('Metrics Collection', () => {
    it('should collect core web vitals metrics', async () => {
      // Setup performance entry fixtures
      const fcpEntry = createPerformanceEntry();
      const lcpEntry = createPerformanceEntry({
        name: 'largest-contentful-paint',
        startTime: 550
      });
      
      // Setup metrics observer
      mockPerformanceObserver.simulateEntries([fcpEntry, lcpEntry]);
      
      // Test component to expose metrics
      const TestComponent = () => {
        const { metrics } = usePerformanceMetrics();
        return (
          <div data-testid="metrics">
            {JSON.stringify(metrics)}
          </div>
        );
      };
      
      // Render with performance provider
      render(
        <PerformanceMetricsProvider>
          <TestComponent />
        </PerformanceMetricsProvider>
      );
      
      // Wait for metrics to be collected
      await waitFor(() => {
        const metricsEl = screen.getByTestId('metrics');
        const metrics = JSON.parse(metricsEl.textContent || '{}');
        expect(metrics.fcp).toBe(fcpEntry.startTime);
        expect(metrics.lcp).toBe(lcpEntry.startTime);
      });
    });
  });
});
```

## Performance Testing Checklist

In addition to the general testing checklist, ensure your performance tests:

- [ ] Mock heavy operations to make tests fast and reliable
- [ ] Measure specific performance metrics relevant to the feature
- [ ] Test with both fast and slow network/device conditions
- [ ] Include performance assertions with appropriate thresholds
- [ ] Test loading states and transitions
- [ ] Verify code splitting is working as expected
- [ ] Test caching mechanisms
- [ ] Check for memory leaks in long-running processes 