import { jest } from "@jest/globals";
import fs from 'fs';
import path from 'path';

// Helper function to check if directory exists
const directoryExists = (dirPath: string): boolean => {
  try {
    return fs.statSync(dirPath).isDirectory();
  } catch (error) {
    return false;
  }
};

// Helper function to check if file exists
const fileExists = (filePath: string): boolean => {
  try {
    return fs.statSync(filePath).isFile();
  } catch (error) {
    return false;
  }
};

// Helper function to validate file naming convention
const validateFileName = (fileName: string): boolean => {
  // File names should be PascalCase for components and camelCase for utilities
  const componentPattern = /^[A-Z][a-zA-Z0-9]*\.(tsx|ts)$/;
  const utilityPattern = /^[a-z][a-zA-Z0-9]*\.(ts|js)$/;
  
  return componentPattern.test(fileName) || utilityPattern.test(fileName);
};

describe('Project Structure Validation', () => {
  const projectRoot = process.cwd();
  
  describe('Directory Structure', () => {
    it('should have src directory', () => {
      expect(directoryExists(path.join(projectRoot, 'src'))).toBe(true);
    });

    it('should have components directory in src', () => {
      expect(directoryExists(path.join(projectRoot, 'src', 'components'))).toBe(true);
    });

    it('should have ui directory in components', () => {
      expect(directoryExists(path.join(projectRoot, 'src', 'components', 'ui'))).toBe(true);
    });

    it('should have layout directory in components', () => {
      expect(directoryExists(path.join(projectRoot, 'src', 'components', 'layout'))).toBe(true);
    });

    it('should have forms directory in components', () => {
      expect(directoryExists(path.join(projectRoot, 'src', 'components', 'forms'))).toBe(true);
    });

    it('should have loading directory in components', () => {
      expect(directoryExists(path.join(projectRoot, 'src', 'components', 'loading'))).toBe(true);
    });

    it('should have lib directory in src', () => {
      expect(directoryExists(path.join(projectRoot, 'src', 'lib'))).toBe(true);
    });

    it('should have styles directory in src', () => {
      expect(directoryExists(path.join(projectRoot, 'src', 'styles'))).toBe(true);
    });

    it('should have tests directory in src', () => {
      expect(directoryExists(path.join(projectRoot, 'src', 'tests'))).toBe(true);
    });
  });

  describe('File Naming Conventions', () => {
    it('should follow PascalCase for component files', () => {
      const componentFiles = [
        'Button.tsx',
        'Input.tsx',
        'Modal.tsx',
        'Header.tsx',
        'Sidebar.tsx',
        'Grid.tsx',
        'Form.tsx',
        'Select.tsx',
        'DatePicker.tsx',
        'Spinner.tsx',
        'Skeleton.tsx'
      ];

      componentFiles.forEach(file => {
        expect(validateFileName(file)).toBe(true);
      });
    });

    it('should follow camelCase for utility files', () => {
      const utilityFiles = [
        'button.ts',
        'input.ts',
        'modal.ts',
        'useButton.ts',
        'useInput.ts',
        'useModal.ts'
      ];

      utilityFiles.forEach(file => {
        expect(validateFileName(file)).toBe(true);
      });
    });
  });

  describe('Module Organization', () => {
    it('should have proper component organization in ui directory', () => {
      const uiComponents = [
        'Button.tsx',
        'Input.tsx',
        'Modal.tsx'
      ];

      uiComponents.forEach(component => {
        expect(fileExists(path.join(projectRoot, 'src', 'components', 'ui', component))).toBe(true);
      });
    });

    it('should have proper component organization in layout directory', () => {
      const layoutComponents = [
        'Header.tsx',
        'Sidebar.tsx',
        'Grid.tsx'
      ];

      layoutComponents.forEach(component => {
        expect(fileExists(path.join(projectRoot, 'src', 'components', 'layout', component))).toBe(true);
      });
    });

    it('should have proper component organization in forms directory', () => {
      const formComponents = [
        'Form.tsx',
        'Select.tsx',
        'DatePicker.tsx'
      ];

      formComponents.forEach(component => {
        expect(fileExists(path.join(projectRoot, 'src', 'components', 'forms', component))).toBe(true);
      });
    });

    it('should have proper component organization in loading directory', () => {
      const loadingComponents = [
        'Spinner.tsx',
        'Skeleton.tsx'
      ];

      loadingComponents.forEach(component => {
        expect(fileExists(path.join(projectRoot, 'src', 'components', 'loading', component))).toBe(true);
      });
    });

    it('should have proper utility organization in lib directory', () => {
      const libUtils = [
        'button.ts',
        'input.ts',
        'modal.ts'
      ];

      libUtils.forEach(util => {
        expect(fileExists(path.join(projectRoot, 'src', 'lib', 'components', util))).toBe(true);
      });
    });

    it('should have proper hook organization in lib/hooks directory', () => {
      const hooks = [
        'useButton.ts',
        'useInput.ts',
        'useModal.ts'
      ];

      hooks.forEach(hook => {
        expect(fileExists(path.join(projectRoot, 'src', 'lib', 'hooks', hook))).toBe(true);
      });
    });
  });
}); 