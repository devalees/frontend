import { describe, it, expect } from './utils';
import fs from 'fs';
import path from 'path';

describe('Development Tools', () => {
  const rootDir = path.resolve(__dirname, '../../');

  // Helper function to read JSON file
  const readJsonFile = (filePath: string) => {
    try {
      return JSON.parse(fs.readFileSync(path.join(rootDir, filePath), 'utf8'));
    } catch {
      return null;
    }
  };

  // Helper function to read text file
  const readTextFile = (filePath: string) => {
    try {
      return fs.readFileSync(path.join(rootDir, filePath), 'utf8');
    } catch {
      return null;
    }
  };

  describe('Tool Integration', () => {
    it('should have TypeScript configuration', () => {
      const tsConfig = readJsonFile('tsconfig.json');
      expect(tsConfig).not.toBeNull();
      expect(tsConfig.compilerOptions).toBeDefined();
      expect(tsConfig.compilerOptions.jsx).toBe('preserve');
      expect(tsConfig.include).toContain('**/*.ts');
      expect(tsConfig.include).toContain('**/*.tsx');
    });

    it('should have ESLint configuration', () => {
      const eslintConfig = readJsonFile('.eslintrc.json');
      expect(eslintConfig).not.toBeNull();
      expect(eslintConfig.extends).toContain('next/core-web-vitals');
      expect(eslintConfig.plugins).toContain('@typescript-eslint');
    });

    it('should have Prettier configuration', () => {
      const prettierConfig = readJsonFile('.prettierrc');
      expect(prettierConfig).not.toBeNull();
      expect(prettierConfig.semi).toBeDefined();
      expect(prettierConfig.singleQuote).toBeDefined();
      expect(prettierConfig.tabWidth).toBeDefined();
    });
  });

  describe('Tool Configuration', () => {
    it('should have correct TypeScript compiler options', () => {
      const tsConfig = readJsonFile('tsconfig.json');
      expect(tsConfig.compilerOptions).toEqual(expect.objectContaining({
        target: 'es5',
        lib: expect.arrayContaining(['dom', 'dom.iterable', 'esnext']),
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        incremental: true,
        esModuleInterop: true,
        module: 'esnext',
        moduleResolution: 'bundler',
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: 'preserve'
      }));
    });

    it('should have correct ESLint rules', () => {
      const eslintConfig = readJsonFile('.eslintrc.json');
      expect(eslintConfig.rules).toEqual(expect.objectContaining({
        '@typescript-eslint/no-unused-vars': 'error',
        '@typescript-eslint/no-explicit-any': 'error',
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off'
      }));
    });

    it('should have correct Prettier options', () => {
      const prettierConfig = readJsonFile('.prettierrc');
      expect(prettierConfig).toEqual(expect.objectContaining({
        semi: true,
        singleQuote: true,
        tabWidth: 2,
        printWidth: 100,
        trailingComma: 'es5'
      }));
    });
  });

  describe('Tool Functionality', () => {
    it('should have script commands for development tools', () => {
      const pkg = readJsonFile('package.json');
      expect(pkg.scripts).toEqual(expect.objectContaining({
        'lint': 'next lint',
        'format': 'prettier --write "src/**/*.{ts,tsx}"',
        'type-check': 'tsc --noEmit'
      }));
    });

    it('should have pre-commit hooks configuration', () => {
      const hookContent = readTextFile('.husky/pre-commit');
      expect(hookContent).not.toBeNull();
      expect(hookContent).toContain('npm run lint');
      expect(hookContent).toContain('npm run type-check');
    });

    it('should have lint-staged configuration', () => {
      const lintStagedConfig = readJsonFile('.lintstagedrc.json');
      expect(lintStagedConfig).toEqual({
        '*.{ts,tsx}': [
          'eslint --fix',
          'prettier --write'
        ]
      });
    });
  });
}); 