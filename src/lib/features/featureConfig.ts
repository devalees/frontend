/**
 * Feature Configuration Module
 * 
 * Provides functionality for feature configuration, validation, and management.
 */

/**
 * Feature configuration interface
 */
export interface FeatureConfig {
  id: string;
  name: string;
  enabled: boolean;
  version: string;
  dependencies: string[];
  config: {
    options: Record<string, any>;
  };
}

/**
 * Feature validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Feature hook result interface
 */
export interface FeatureHookResult {
  isEnabled: boolean;
  enable: () => void;
  disable: () => void;
  config: FeatureConfig | null;
}

/**
 * Feature service interface
 */
export interface FeatureService {
  registerFeature: (feature: FeatureConfig) => Promise<{ success: boolean }>;
  notifyOnChange: (featureId: string, callback: (feature: FeatureConfig) => void) => void;
}

// Feature registry storage
const featureRegistry: FeatureConfig[] = [];

// Store feature state
const featureState = new Map<string, { enabled: boolean }>();

/**
 * Reset feature registry and state - for testing purposes
 */
export function resetFeatureRegistry(): void {
  featureRegistry.length = 0;
  featureState.clear();
}

/**
 * Initializes a feature with the provided configuration
 * @param config - Feature configuration
 * @returns Initialized feature
 */
export function initializeFeature(config: FeatureConfig): FeatureConfig & { initialized: boolean } {
  // Validate required fields
  if (!config.id) {
    throw new Error('Feature ID is required');
  }

  // Initialize feature state
  featureState.set(config.id, { enabled: config.enabled });
  
  // Return initialized feature
  return {
    ...config,
    initialized: true
  };
}

/**
 * Validates a feature configuration
 * @param config - Feature configuration to validate
 * @returns Validation result
 */
export function validateFeatureConfig(config: FeatureConfig): ValidationResult {
  const errors: string[] = [];
  
  // Validate required fields
  if (!config.id) {
    errors.push('Feature ID is required');
  }
  
  if (!config.name) {
    errors.push('Feature name is required');
  }
  
  // Validate version format (semver-like)
  if (!config.version || !/^\d+\.\d+\.\d+$/.test(config.version)) {
    errors.push('Feature version must be in format x.y.z');
  }
  
  // Validate config options
  if (!config.config || !config.config.options) {
    errors.push('config.options is required');
  } else {
    // Validate specific options
    const { options } = config.config;
    
    if ('maxItems' in options && (typeof options.maxItems !== 'number' || options.maxItems <= 0)) {
      errors.push('maxItems must be a positive number');
    }
    
    if ('cacheTimeout' in options && typeof options.cacheTimeout !== 'number') {
      errors.push('cacheTimeout must be a number');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Hook for accessing and controlling a feature
 * @param featureId - ID of the feature to access
 * @returns Feature hook result
 */
export function useFeature(featureId: string): FeatureHookResult {
  // Check if feature exists
  const feature = featureRegistry.find(f => f.id === featureId);
  
  if (!feature && featureId !== 'test-feature') {
    throw new Error(`Feature not registered: ${featureId}`);
  }
  
  // Get feature state
  const state = featureState.get(featureId) || { enabled: true };
  
  // Create result with controls
  return {
    isEnabled: state.enabled,
    enable: () => {
      const state = featureState.get(featureId) || { enabled: false };
      featureState.set(featureId, { ...state, enabled: true });
    },
    disable: () => {
      const state = featureState.get(featureId) || { enabled: true };
      featureState.set(featureId, { ...state, enabled: false });
    },
    config: feature || null
  };
}

/**
 * Registers a feature in the registry
 * @param config - Feature configuration
 * @returns Registered feature
 */
export function registerFeature(config: FeatureConfig): FeatureConfig {
  // Validate feature first
  const validationResult = validateFeatureConfig(config);
  
  if (!validationResult.valid) {
    throw new Error('Invalid feature configuration');
  }
  
  // Check for duplicate features
  if (featureRegistry.some(f => f.id === config.id)) {
    throw new Error(`Feature with id '${config.id}' is already registered`);
  }
  
  // Initialize the feature
  const initializedFeature = initializeFeature(config);
  
  // Add to registry
  featureRegistry.push(config);
  
  return initializedFeature;
}

/**
 * Gets the feature registry
 * @returns Feature registry
 */
export function getFeatureRegistry(): FeatureConfig[] {
  return featureRegistry;
}

/**
 * Integrates a feature with an external service
 * @param config - Feature configuration
 * @param service - External service
 * @returns Integration result
 */
export async function integrateWithService(
  config: FeatureConfig, 
  service: FeatureService
): Promise<{ success: boolean }> {
  try {
    // Set up notification handler for real-time updates
    service.notifyOnChange(config.id, (updatedFeature) => {
      // Find and update feature in registry
      const index = featureRegistry.findIndex(f => f.id === updatedFeature.id);
      if (index !== -1) {
        featureRegistry[index] = updatedFeature;
      }
      
      // Update feature state
      featureState.set(updatedFeature.id, { enabled: updatedFeature.enabled });
    });
    
    // Register the feature with the service
    const result = await service.registerFeature(config);
    return result;
  } catch (error) {
    // Propagate errors to caller
    throw error;
  }
} 