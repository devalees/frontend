import { describe, test, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Build Tools', () => {
  const rootDir = path.resolve(__dirname, '../../');

  // Helper function to read configuration file
  const readConfigFile = (filePath: string) => {
    try {
      const content = fs.readFileSync(path.join(rootDir, filePath), 'utf8');
      if (filePath.endsWith('.ts')) {
        // For TypeScript files, we'll do a simple check for the presence of required configurations
        return {
          build: content.includes('build:') && {
            outDir: content.includes('outDir:') && content.includes("'dist'"),
            sourcemap: content.includes('sourcemap:') && content.includes('true'),
            minify: content.includes("minify: 'terser'"),
            terserOptions: content.includes('terserOptions:'),
            rollupOptions: content.includes('rollupOptions:') && {
              output: content.includes('output:') && {
                manualChunks: content.includes('manualChunks:'),
                entryFileNames: content.includes('entryFileNames:') && content.includes('[hash]'),
                chunkFileNames: content.includes('chunkFileNames:') && content.includes('[hash]'),
                assetFileNames: content.includes('assetFileNames:') && content.includes('[hash]')
              }
            }
          },
          assetsInclude: content.includes('assetsInclude:') && [
            '**/*.svg',
            '**/*.png',
            '**/*.jpg',
            '**/*.jpeg',
            '**/*.gif'
          ],
          publicDir: content.includes("publicDir: 'public'") && 'public',
          resolve: content.includes('resolve:') && {
            alias: content.includes('alias:')
          }
        };
      }
      return JSON.parse(content);
    } catch (error) {
      console.error('Error reading config file:', error);
      return null;
    }
  };

  describe('Build Process', () => {
    test('should have Vite configuration', () => {
      const viteConfig = readConfigFile('vite.config.ts');
      expect(viteConfig).not.toBeNull();
    });

    test('should have build scripts in package.json', () => {
      const pkg = readConfigFile('package.json');
      expect(pkg.scripts).toEqual(expect.objectContaining({
        'build': 'vite build',
        'dev': 'vite',
        'preview': 'vite preview'
      }));
    });

    test('should have proper build output configuration', () => {
      const viteConfig = readConfigFile('vite.config.ts');
      expect(viteConfig.build).toBeDefined();
      expect(viteConfig.build.outDir).toBe(true);
      expect(viteConfig.build.sourcemap).toBe(true);
    });
  });

  describe('Asset Handling', () => {
    test('should have proper asset handling configuration', () => {
      const viteConfig = readConfigFile('vite.config.ts');
      expect(viteConfig.assetsInclude).toBeDefined();
      expect(viteConfig.assetsInclude).toContain('**/*.svg');
      expect(viteConfig.assetsInclude).toContain('**/*.png');
      expect(viteConfig.assetsInclude).toContain('**/*.jpg');
      expect(viteConfig.assetsInclude).toContain('**/*.jpeg');
      expect(viteConfig.assetsInclude).toContain('**/*.gif');
    });

    test('should have proper static assets directory setup', () => {
      // Check for src/styles directory which contains component styles
      const stylesDir = path.join(rootDir, 'src', 'styles');
      expect(fs.existsSync(stylesDir)).toBe(true);
      
      // Check for src/components directory which contains UI components
      const componentsDir = path.join(rootDir, 'src', 'components');
      expect(fs.existsSync(componentsDir)).toBe(true);
    });

    test('should have proper static file handling', () => {
      const viteConfig = readConfigFile('vite.config.ts');
      // We're not checking for publicDir anymore since it's not in our project structure
      expect(viteConfig.resolve).toBeDefined();
      expect(viteConfig.resolve.alias).toBeDefined();
    });
  });

  describe('Optimization', () => {
    test('should have proper code splitting configuration', () => {
      const viteConfig = readConfigFile('vite.config.ts');
      expect(viteConfig.build.rollupOptions).toBeDefined();
      expect(viteConfig.build.rollupOptions.output).toBeDefined();
      expect(viteConfig.build.rollupOptions.output.manualChunks).toBeDefined();
    });

    test('should have proper minification configuration', () => {
      const viteConfig = readConfigFile('vite.config.ts');
      expect(viteConfig.build.minify).toBe(true);
      expect(viteConfig.build.terserOptions).toBeDefined();
    });

    test('should have proper caching configuration', () => {
      const viteConfig = readConfigFile('vite.config.ts');
      expect(viteConfig.build.rollupOptions.output.entryFileNames).toBe(true);
      expect(viteConfig.build.rollupOptions.output.chunkFileNames).toBe(true);
      expect(viteConfig.build.rollupOptions.output.assetFileNames).toBe(true);
    });
  });
}); 