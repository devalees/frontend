import { describe, it, expect } from './utils';
import fs from 'fs';
import path from 'path';

describe('Project Structure', () => {
  const rootDir = path.resolve(__dirname, '../../');

  // Helper function to check if directory exists
  const directoryExists = (dirPath: string): boolean => {
    try {
      return fs.statSync(path.join(rootDir, dirPath)).isDirectory();
    } catch {
      return false;
    }
  };

  // Helper function to check if file exists
  const fileExists = (filePath: string): boolean => {
    try {
      return fs.statSync(path.join(rootDir, filePath)).isFile();
    } catch {
      return false;
    }
  };

  // Helper function to validate file naming convention
  const validateFileName = (fileName: string): boolean => {
    // Components should be PascalCase and end with .tsx
    const componentPattern = /^[A-Z][a-zA-Z0-9]*\.tsx$/;
    // Utilities should be camelCase and end with .ts
    const utilityPattern = /^[a-z][a-zA-Z0-9]*\.ts$/;
    // Hooks should start with 'use' and be camelCase
    const hookPattern = /^use[A-Z][a-zA-Z0-9]*\.ts$/;
    // Test files should end with .test.ts or .test.tsx
    const testPattern = /^[a-zA-Z0-9]+\.(test|spec)\.(ts|tsx)$/;
    
    return (
      componentPattern.test(fileName) ||
      utilityPattern.test(fileName) ||
      hookPattern.test(fileName) ||
      testPattern.test(fileName)
    );
  };

  describe('Directory Structure', () => {
    it('should have required root directories', () => {
      const requiredDirs = [
        'src',
        'src/components',
        'src/lib',
        'src/styles',
        'src/tests'
      ];

      requiredDirs.forEach(dir => {
        expect(directoryExists(dir)).toBe(true);
      });
    });

    it('should have required component subdirectories', () => {
      const componentDirs = [
        'src/components/ui',
        'src/components/layout',
        'src/components/forms',
        'src/components/loading'
      ];

      componentDirs.forEach(dir => {
        expect(directoryExists(dir)).toBe(true);
      });
    });

    it('should have required lib subdirectories', () => {
      const libDirs = [
        'src/lib/components',
        'src/lib/hooks'
      ];

      libDirs.forEach(dir => {
        expect(directoryExists(dir)).toBe(true);
      });
    });

    it('should have required style subdirectories', () => {
      const styleDirs = [
        'src/styles/components',
        'src/styles/themes'
      ];

      styleDirs.forEach(dir => {
        expect(directoryExists(dir)).toBe(true);
      });
    });
  });

  describe('File Naming Conventions', () => {
    it('UI components should follow PascalCase naming convention', () => {
      const uiComponents = [
        'src/components/ui/Button.tsx',
        'src/components/ui/Input.tsx',
        'src/components/ui/Modal.tsx'
      ];

      uiComponents.forEach(file => {
        expect(fileExists(file)).toBe(true);
        expect(validateFileName(path.basename(file))).toBe(true);
      });
    });

    it('Layout components should follow PascalCase naming convention', () => {
      const layoutComponents = [
        'src/components/layout/Header.tsx',
        'src/components/layout/Sidebar.tsx',
        'src/components/layout/Grid.tsx'
      ];

      layoutComponents.forEach(file => {
        expect(fileExists(file)).toBe(true);
        expect(validateFileName(path.basename(file))).toBe(true);
      });
    });

    it('Form components should follow PascalCase naming convention', () => {
      const formComponents = [
        'src/components/forms/Form.tsx',
        'src/components/forms/Select.tsx',
        'src/components/forms/DatePicker.tsx'
      ];

      formComponents.forEach(file => {
        expect(fileExists(file)).toBe(true);
        expect(validateFileName(path.basename(file))).toBe(true);
      });
    });

    it('Loading components should follow PascalCase naming convention', () => {
      const loadingComponents = [
        'src/components/loading/Spinner.tsx',
        'src/components/loading/Skeleton.tsx'
      ];

      loadingComponents.forEach(file => {
        expect(fileExists(file)).toBe(true);
        expect(validateFileName(path.basename(file))).toBe(true);
      });
    });

    it('Utility functions should follow camelCase naming convention', () => {
      const utils = [
        'src/lib/components/button.ts',
        'src/lib/components/input.ts',
        'src/lib/components/modal.ts'
      ];

      utils.forEach(file => {
        expect(fileExists(file)).toBe(true);
        expect(validateFileName(path.basename(file))).toBe(true);
      });
    });

    it('Hooks should follow useXxx naming convention', () => {
      const hooks = [
        'src/lib/hooks/useButton.ts',
        'src/lib/hooks/useInput.ts',
        'src/lib/hooks/useModal.ts'
      ];

      hooks.forEach(file => {
        expect(fileExists(file)).toBe(true);
        expect(validateFileName(path.basename(file))).toBe(true);
      });
    });
  });

  describe('Module Organization', () => {
    it('should have proper component organization', () => {
      const components = {
        ui: ['Button.tsx', 'Input.tsx', 'Modal.tsx'],
        layout: ['Header.tsx', 'Sidebar.tsx', 'Grid.tsx'],
        forms: ['Form.tsx', 'Select.tsx', 'DatePicker.tsx'],
        loading: ['Spinner.tsx', 'Skeleton.tsx']
      };

      Object.entries(components).forEach(([dir, files]) => {
        files.forEach(file => {
          const filePath = path.join('src/components', dir, file);
          expect(fileExists(filePath)).toBe(true);
          expect(validateFileName(file)).toBe(true);
        });
      });
    });

    it('should have proper utility organization', () => {
      const utils = {
        components: ['button.ts', 'input.ts', 'modal.ts'],
        hooks: ['useButton.ts', 'useInput.ts', 'useModal.ts']
      };

      Object.entries(utils).forEach(([dir, files]) => {
        files.forEach(file => {
          const filePath = path.join('src/lib', dir, file);
          expect(fileExists(filePath)).toBe(true);
          expect(validateFileName(file)).toBe(true);
        });
      });
    });

    it('should have proper style organization', () => {
      const styles = {
        components: ['button.css', 'input.css', 'modal.css'],
        themes: ['light.css', 'dark.css']
      };

      Object.entries(styles).forEach(([dir, files]) => {
        files.forEach(file => {
          const filePath = path.join('src/styles', dir, file);
          expect(fileExists(filePath)).toBe(true);
        });
      });
    });
  });
}); 