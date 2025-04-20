/**
 * Feature Utilities Tests
 * 
 * Tests for feature utility functionality including:
 * - Utility functions
 * - Helper methods
 * - Integration points
 */

// Import testing utilities from centralized testing framework
import { describe, it, expect, beforeEach, vi } from '../../tests/utils';

// Import the feature configuration module for type references and validation
import {
  FeatureConfig,
  resetFeatureRegistry,
  validateFeatureConfig
} from '../../lib/features/featureConfig';

// Import the feature utilities module that will be implemented
import {
  isFeatureEnabled,
  toggleFeature,
  getFeatureDependencies,
  mergeFeatureConfigs,
  checkFeatureCompatibility,
  filterEnabledFeatures,
  sortFeaturesByPriority,
  validateDependencies,
  createFeatureLogger,
  executeFeatureCallback,
  migrateFeatureConfig,
  FeatureLogger,
  CompatibilityResult
} from '../../lib/features/featureUtils';

describe('Feature Utilities', () => {
  // Mock feature configurations for testing
  const mockFeatureConfig: FeatureConfig = {
    id: 'test-feature',
    name: 'Test Feature',
    enabled: true,
    version: '1.0.0',
    dependencies: [],
    config: {
      options: {
        maxItems: 10,
        cacheTimeout: 5000,
        priority: 1
      }
    }
  };

  const mockDependentFeature: FeatureConfig = {
    id: 'dependent-feature',
    name: 'Dependent Feature',
    enabled: true,
    version: '1.0.0',
    dependencies: ['test-feature'],
    config: {
      options: {
        maxItems: 5,
        cacheTimeout: 3000,
        priority: 2
      }
    }
  };

  // Reset registry before each test
  beforeEach(() => {
    vi.resetAllMocks();
    resetFeatureRegistry();
  });

  describe('Utility Functions', () => {
    it('should check if a feature is enabled', () => {
      // Act
      const result = isFeatureEnabled('test-feature');
      
      // Assert
      expect(result).toBe(false);
    });

    it('should toggle a feature state', () => {
      // Act
      const result = toggleFeature('test-feature');
      
      // Assert
      expect(result).toBe(true);
    });

    it('should retrieve feature dependencies', () => {
      // Act
      const dependencies = getFeatureDependencies('dependent-feature');
      
      // Assert
      expect(dependencies).toEqual([]);
    });

    it('should merge feature configurations', () => {
      // Arrange
      const overrideConfig: Partial<FeatureConfig> = {
        enabled: false,
        config: {
          options: {
            maxItems: 20
          }
        }
      };
      
      // Act
      const merged = mergeFeatureConfigs(mockFeatureConfig, overrideConfig);
      
      // Assert
      expect(merged).toMatchObject({
        id: 'test-feature',
        enabled: false,
        config: {
          options: {
            maxItems: 20,
            cacheTimeout: 5000
          }
        }
      });
    });

    it('should merge feature configurations with empty override options', () => {
      // Arrange
      const overrideConfig: Partial<FeatureConfig> = {
        enabled: false,
        config: {
          options: {} // Empty options object
        }
      };
      
      // Act
      const merged = mergeFeatureConfigs(mockFeatureConfig, overrideConfig);
      
      // Assert
      expect(merged).toMatchObject({
        id: 'test-feature',
        enabled: false,
        config: {
          options: {
            maxItems: 10,
            cacheTimeout: 5000
          }
        }
      });
    });

    it('should merge feature configurations with null config', () => {
      // Arrange
      const overrideConfig: Partial<FeatureConfig> = {
        enabled: false
      };
      
      // Act
      const merged = mergeFeatureConfigs(mockFeatureConfig, overrideConfig);
      
      // Assert
      expect(merged).toMatchObject({
        id: 'test-feature',
        enabled: false,
        config: {
          options: {
            maxItems: 10,
            cacheTimeout: 5000
          }
        }
      });
    });
  });

  describe('Helper Methods', () => {
    it('should check feature compatibility based on version', () => {
      // Arrange
      const featureA: FeatureConfig = { ...mockFeatureConfig, version: '1.2.0' };
      const featureB: FeatureConfig = { ...mockFeatureConfig, version: '1.0.0' };
      
      // Act
      const compatResult = checkFeatureCompatibility(featureA, featureB);
      
      // Assert
      expect(compatResult.compatible).toBe(false);
      expect(compatResult.reason).toContain('version mismatch');
    });

    it('should filter enabled features from a list', () => {
      // Arrange
      const features = [
        { ...mockFeatureConfig, enabled: true },
        { ...mockDependentFeature, enabled: false }
      ];
      
      // Act
      const enabledFeatures = filterEnabledFeatures(features);
      
      // Assert
      expect(enabledFeatures).toHaveLength(1);
      expect(enabledFeatures[0].id).toBe('test-feature');
    });

    it('should filter an empty list of features', () => {
      // Arrange
      const features: FeatureConfig[] = [];
      
      // Act
      const enabledFeatures = filterEnabledFeatures(features);
      
      // Assert
      expect(enabledFeatures).toHaveLength(0);
    });

    it('should sort features by priority', () => {
      // Arrange
      const features = [
        { ...mockFeatureConfig, config: { options: { priority: 2 } } },
        { ...mockDependentFeature, config: { options: { priority: 1 } } }
      ];
      
      // Act
      const sortedFeatures = sortFeaturesByPriority(features);
      
      // Assert
      expect(sortedFeatures[0].id).toBe('dependent-feature');
      expect(sortedFeatures[1].id).toBe('test-feature');
    });

    it('should handle features with missing priority', () => {
      // Arrange
      const features = [
        { ...mockFeatureConfig, config: { options: {} } }, // Missing priority (defaults to 0)
        { ...mockDependentFeature, config: { options: { priority: 1 } } }
      ];
      
      // Act
      const sortedFeatures = sortFeaturesByPriority(features);
      
      // Assert
      // First feature should be the one with missing priority (0) since we sort ascending
      expect(sortedFeatures[0].id).toBe('test-feature');
      expect(sortedFeatures[1].id).toBe('dependent-feature');
    });

    it('should handle features with completely missing options', () => {
      // Arrange
      const features = [
        { ...mockFeatureConfig, config: {} as any }, // Completely missing options
        { ...mockDependentFeature, config: { options: { priority: 1 } } }
      ];
      
      // Act
      const sortedFeatures = sortFeaturesByPriority(features);
      
      // Assert
      expect(sortedFeatures[0].id).toBe('test-feature');
      expect(sortedFeatures[1].id).toBe('dependent-feature');
    });
  });

  describe('Integration Points', () => {
    it('should validate features against their dependencies', () => {
      // Act
      const validationResult = validateDependencies([mockFeatureConfig, mockDependentFeature]);
      
      // Assert
      expect(validationResult.valid).toBe(false);
      expect(validationResult.errors).toContain('Missing dependency: test-feature for dependent-feature');
    });

    it('should create a feature logger with appropriate tags', () => {
      // Act
      const logger = createFeatureLogger('test-feature');
      
      // Assert
      expect(logger).toBeDefined();
      expect(typeof logger.log).toBe('function');
      expect(typeof logger.error).toBe('function');
    });

    it('should use feature logger methods for coverage', () => {
      // Arrange
      const logger = createFeatureLogger('test-feature');
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      
      // Act
      logger.log('Test log');
      logger.error('Test error', new Error('Test'));
      logger.warn('Test warning');
      logger.info('Test info');
      
      // Also test without optional parameters
      logger.log('Test log only');
      logger.error('Test error only');
      logger.warn('Test warning only');
      logger.info('Test info only');
      
      // Assert
      expect(logSpy).toHaveBeenCalledTimes(2);
      expect(errorSpy).toHaveBeenCalledTimes(2);
      expect(warnSpy).toHaveBeenCalledTimes(2);
      expect(infoSpy).toHaveBeenCalledTimes(2);
    });

    it('should safely execute feature callbacks with error handling', async () => {
      // Arrange
      const successCallback = vi.fn().mockResolvedValue('success');
      const errorCallback = vi.fn().mockRejectedValue(new Error('test error'));
      
      // Act
      const successResult = await executeFeatureCallback('test-feature', successCallback);
      const errorResult = await executeFeatureCallback('test-feature', errorCallback);
      
      // Assert
      expect(successResult.success).toBe(true);
      expect(successResult.result).toBe('success');
      expect(errorResult.success).toBe(false);
      expect(errorResult.error).toBeDefined();
    });

    it('should handle non-Error objects in callback errors', async () => {
      // Arrange
      const errorCallback = vi.fn().mockRejectedValue('string error');
      
      // Act
      const errorResult = await executeFeatureCallback('test-feature', errorCallback);
      
      // Assert
      expect(errorResult.success).toBe(false);
      expect(errorResult.error).toBeInstanceOf(Error);
      expect(errorResult.error?.message).toBe('Unknown error');
    });

    it('should migrate feature configuration between versions', () => {
      // Arrange
      const oldConfig: FeatureConfig = {
        ...mockFeatureConfig,
        version: '0.9.0',
        config: {
          options: {
            legacy: true,
            maxItems: 5
          }
        }
      };
      
      // Act
      const migratedConfig = migrateFeatureConfig(oldConfig, '1.0.0');
      
      // Assert
      expect(migratedConfig.version).toBe('1.0.0');
      expect(migratedConfig.config.options).not.toHaveProperty('legacy');
      expect(migratedConfig.config.options.maxItems).toBe(5);
    });

    it('should migrate feature configuration without legacy options', () => {
      // Arrange
      const oldConfig: FeatureConfig = {
        ...mockFeatureConfig,
        version: '0.9.0',
        config: {
          options: {
            maxItems: 5
          }
        }
      };
      
      // Act
      const migratedConfig = migrateFeatureConfig(oldConfig, '1.0.0');
      
      // Assert
      expect(migratedConfig.version).toBe('1.0.0');
      expect(migratedConfig.config.options.maxItems).toBe(5);
    });
  });
}); 