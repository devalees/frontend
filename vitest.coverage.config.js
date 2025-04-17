import { defineConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default defineConfig({
  ...viteConfig,
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      // Only include src directory files
      include: ['src/**/*.{ts,tsx}'],
      // Exclude test files and unmigrated directories
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/__tests__/**',
        'src/tests/**',
        // Add directories here as they become centralized/migrated
        // 'src/components/unmigrated/**',
      ],
      // Customized thresholds for migration period
      thresholds: {
        // Set realistic thresholds during migration
        statements: 60,
        branches: 60,
        functions: 60,
        lines: 60,
        // For API which is already well tested
        perFile: [
          {
            file: 'src/api/**/*.{ts,tsx}',
            statements: 90,
            branches: 80,
            functions: 90,
            lines: 90,
          },
          // Add more per-file thresholds as modules are migrated
        ],
      },
    },
  },
}); 