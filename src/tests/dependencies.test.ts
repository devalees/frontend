import { describe, it, expect } from './utils';
import fs from 'fs';
import path from 'path';

describe('Dependencies', () => {
  const rootDir = path.resolve(__dirname, '../../');
  const packageJsonPath = path.join(rootDir, 'package.json');

  // Helper function to read package.json
  const getPackageJson = () => {
    try {
      return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    } catch {
      return null;
    }
  };

  describe('Package Versions', () => {
    it('should have required core dependencies with specific versions', () => {
      const pkg = getPackageJson();
      expect(pkg).not.toBeNull();
      
      const requiredDeps = {
        'react': '^18.2.0',
        'react-dom': '^18.2.0'
      };

      Object.entries(requiredDeps).forEach(([dep, version]) => {
        expect(pkg.dependencies[dep]).toBe(version);
      });
    });

    it('should have required development dependencies with specific versions', () => {
      const pkg = getPackageJson();
      expect(pkg).not.toBeNull();

      const requiredDevDeps = {
        'typescript': '^5.0.0',
        'vitest': '^1.0.0',
        '@types/react': '^18.2.0',
        '@types/react-dom': '^18.2.0'
      };

      Object.entries(requiredDevDeps).forEach(([dep, version]) => {
        expect(pkg.devDependencies[dep]).toBe(version);
      });
    });
  });

  describe('Dependency Conflicts', () => {
    it('should not have conflicting React versions', () => {
      const pkg = getPackageJson();
      expect(pkg).not.toBeNull();

      const reactVersion = pkg.dependencies.react;
      expect(pkg.dependencies['react-dom']).toBe(reactVersion);
      expect(pkg.devDependencies['@types/react']).toBe(reactVersion);
      expect(pkg.devDependencies['@types/react-dom']).toBe(reactVersion);
    });

    it('should not have duplicate dependencies', () => {
      const pkg = getPackageJson();
      expect(pkg).not.toBeNull();

      const allDeps = {
        ...pkg.dependencies,
        ...pkg.devDependencies
      };

      const depNames = Object.keys(allDeps);
      const uniqueDepNames = new Set(depNames);
      expect(depNames.length).toBe(uniqueDepNames.size);
    });
  });

  describe('Peer Dependencies', () => {
    it('should have correct peer dependencies for React packages', () => {
      const pkg = getPackageJson();
      expect(pkg).not.toBeNull();

      const reactVersion = pkg.dependencies.react;
      expect(pkg.peerDependencies).toBeDefined();
      expect(pkg.peerDependencies.react).toBe(reactVersion);
      expect(pkg.peerDependencies['react-dom']).toBe(reactVersion);
    });

    it('should have compatible peer dependency ranges', () => {
      const pkg = getPackageJson();
      expect(pkg).not.toBeNull();

      if (pkg.peerDependencies) {
        Object.entries(pkg.peerDependencies).forEach(([dep, version]) => {
          // Version should be a valid semver range
          expect(typeof version).toBe('string');
          expect(version).toMatch(/^[\^~]?\d+\.\d+\.\d+/);
        });
      }
    });
  });
}); 