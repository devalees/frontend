import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Environment Configuration', () => {
  const rootDir = path.resolve(__dirname, '../../');
  const envPath = path.join(rootDir, '.env');
  const envExamplePath = path.join(rootDir, '.env.example');

  // Helper function to check if file exists
  const fileExists = (filePath: string): boolean => {
    try {
      return fs.statSync(filePath).isFile();
    } catch {
      return false;
    }
  };

  // Helper function to read env file
  const readEnvFile = (filePath: string): Record<string, string> => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const env: Record<string, string> = {};
      
      content.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          const [, key, value] = match;
          env[key.trim()] = value.trim();
        }
      });
      
      return env;
    } catch {
      return {};
    }
  };

  describe('Environment Files', () => {
    test('should have .env.example file', () => {
      expect(fileExists(envExamplePath)).toBe(true);
    });

    test('should have .env file', () => {
      expect(fileExists(envPath)).toBe(true);
    });

    test('should have required environment variables', () => {
      const env = readEnvFile(envPath);
      const requiredVars = [
        'NODE_ENV',
        'API_URL',
        'APP_NAME'
      ];

      requiredVars.forEach(varName => {
        expect(env[varName]).toBeDefined();
        expect(env[varName]).not.toBe('');
      });
    });
  });

  describe('Configuration Loading', () => {
    test('should load environment variables correctly', () => {
      const env = readEnvFile(envPath);
      expect(env.NODE_ENV).toBe('development');
      expect(env.API_URL).toMatch(/^https?:\/\//);
    });

    test('should have consistent environment variables between .env and .env.example', () => {
      const env = readEnvFile(envPath);
      const envExample = readEnvFile(envExamplePath);
      
      // Check that all variables in .env.example exist in .env
      Object.keys(envExample).forEach(key => {
        expect(env[key]).toBeDefined();
      });
    });
  });

  describe('Environment Validation', () => {
    test('should validate NODE_ENV value', () => {
      const env = readEnvFile(envPath);
      const validEnvs = ['development', 'test', 'production'];
      expect(validEnvs).toContain(env.NODE_ENV);
    });

    test('should validate API_URL format', () => {
      const env = readEnvFile(envPath);
      expect(env.API_URL).toMatch(/^https?:\/\/.+/);
    });

    test('should validate required environment variables are not empty', () => {
      const env = readEnvFile(envPath);
      Object.entries(env).forEach(([key, value]) => {
        if (key.startsWith('REQUIRED_')) {
          expect(value).not.toBe('');
        }
      });
    });
  });
}); 