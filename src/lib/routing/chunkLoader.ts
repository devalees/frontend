import { performance } from 'perf_hooks';

export interface RouteChunk {
  name: string;
  size: number;
  path: string;
  dependencies?: string[];
}

/**
 * Get all chunks required for a route
 */
export const getRouteChunks = async (routePath: string): Promise<RouteChunk[]> => {
  // In a real implementation, this would come from webpack/Next.js chunk manifest
  // For now, we're simulating it
  return [];
};

/**
 * Load a chunk and its dependencies
 */
export const loadChunk = async (chunk: RouteChunk): Promise<void> => {
  performance.mark(`chunk-load-start-${chunk.name}`);

  try {
    // Load dependencies first if any
    if (chunk.dependencies?.length) {
      const dependencyChunks = await Promise.all(
        chunk.dependencies.map(dep => getRouteChunks(dep))
      );
      for (const depChunks of dependencyChunks) {
        for (const depChunk of depChunks) {
          await loadChunk(depChunk);
        }
      }
    }

    // Simulate chunk loading with dynamic import
    await import(/* webpackChunkName: "[request]" */ chunk.path);

    performance.mark(`chunk-load-end-${chunk.name}`);
    performance.measure(
      `chunk-load-time-${chunk.name}`,
      `chunk-load-start-${chunk.name}`,
      `chunk-load-end-${chunk.name}`
    );
  } catch (error) {
    console.error(`Failed to load chunk ${chunk.name}:`, error);
    throw error;
  }
};

/**
 * Preload a chunk without executing it
 */
export const preloadChunk = async (chunk: RouteChunk): Promise<void> => {
  const controller = new AbortController();
  const signal = controller.signal;

  const promise = new Promise<void>(async (resolve, reject) => {
    try {
      // Create a link preload tag
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'script';
      link.href = chunk.path;

      // Handle load success
      link.onload = () => {
        document.head.removeChild(link);
        resolve();
      };

      // Handle load error
      link.onerror = (error) => {
        document.head.removeChild(link);
        reject(error);
      };

      // Handle abort
      signal.addEventListener('abort', () => {
        document.head.removeChild(link);
        reject(new Error('Preload cancelled'));
      });

      // Start preloading
      document.head.appendChild(link);
    } catch (error) {
      reject(error);
    }
  });

  // Add cancel method to the promise
  (promise as any).cancel = () => {
    controller.abort();
  };

  return promise;
}; 