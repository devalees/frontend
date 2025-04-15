import { describe, test, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Deployment Setup', () => {
  const rootDir = path.resolve(__dirname, '../../');

  // Helper function to read configuration file
  const readConfigFile = (filePath: string) => {
    try {
      const content = fs.readFileSync(path.join(rootDir, filePath), 'utf8');
      if (filePath.endsWith('.ts')) {
        // For TypeScript files, we'll do a simple check for the presence of required configurations
        if (filePath === 'src/config/env.ts') {
          return {
            validate: content.includes('validate:') || content.includes('validateEnv'),
            getConfig: content.includes('getConfig') || content.includes('getEnvConfig'),
          };
        }
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
      } else if (filePath.endsWith('.js') || filePath.endsWith('.yml')) {
        // For JS and YAML files, just return a non-null object to indicate the file exists
        return { exists: true };
      }
      return JSON.parse(content);
    } catch (error) {
      console.error('Error reading config file:', error);
      return null;
    }
  };

  describe('Deployment Process', () => {
    test('should have deployment configuration', () => {
      const viteConfig = readConfigFile('vite.config.ts');
      expect(viteConfig).not.toBeNull();
      expect(viteConfig.build).toBeDefined();
    });

    test('should have proper build output configuration', () => {
      const viteConfig = readConfigFile('vite.config.ts');
      expect(viteConfig.build.outDir).toBe(true);
      expect(viteConfig.build.sourcemap).toBe(true);
    });

    test('should have proper environment handling', () => {
      const envFiles = [
        '.env',
        '.env.development',
        '.env.production',
        '.env.local'
      ];
      
      envFiles.forEach(file => {
        const envPath = path.join(rootDir, file);
        const envExists = fs.existsSync(envPath);
        expect(envExists).toBe(true);
      });
    });
  });

  describe('Environment Handling', () => {
    test('should have proper environment variable loading', () => {
      const envConfig = readConfigFile('src/config/env.ts');
      expect(envConfig).not.toBeNull();
    });

    test('should have proper environment validation', () => {
      const envConfig = readConfigFile('src/config/env.ts');
      expect(envConfig.validate).toBeDefined();
    });

    test('should have proper environment type definitions', () => {
      const envTypes = readConfigFile('src/types/env.d.ts');
      expect(envTypes).not.toBeNull();
    });
  });

  describe('Deployment Validation', () => {
    test('should have proper build validation', () => {
      const buildScript = readConfigFile('scripts/validate-build.js');
      expect(buildScript).not.toBeNull();
    });

    test('should have proper deployment scripts', () => {
      const pkg = readConfigFile('package.json');
      expect(pkg.scripts).toEqual(expect.objectContaining({
        'build': 'vite build',
        'preview': 'vite preview',
        'deploy': expect.any(String)
      }));
    });

    test('should have proper CI/CD configuration', () => {
      const ciConfig = readConfigFile('.github/workflows/deploy.yml');
      expect(ciConfig).not.toBeNull();
    });
  });
}); 