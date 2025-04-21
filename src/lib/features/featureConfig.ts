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
  
  if (!feature) {
    console.log(`Feature not found: ${featureId}`);
    throw new Error(`Feature not registered: ${featureId}`);
  }
  
  // Get feature state with default value
  const state = featureState.get(featureId) || { enabled: feature.enabled };
  
  // Create a mutable reference to track the current state
  let currentState = state.enabled;
  
  // Create result with controls
  return {
    get isEnabled() {
      return currentState;
    },
    enable: () => {
      console.log(`Enabling feature: ${featureId}`);
      featureState.set(featureId, { enabled: true });
      currentState = true;
    },
    disable: () => {
      console.log(`Disabling feature: ${featureId}`);
      featureState.set(featureId, { enabled: false });
      currentState = false;
    },
    config: feature
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
    // Register with service
    const result = await service.registerFeature(config);
    
    // Set up change notification
    service.notifyOnChange(config.id, (updatedFeature) => {
      // Update feature state when changes occur
      const index = featureRegistry.findIndex(f => f.id === updatedFeature.id);
      if (index !== -1) {
        featureRegistry[index] = updatedFeature;
        featureState.set(updatedFeature.id, { enabled: updatedFeature.enabled });
      }
    });
    
    return result;
  } catch (error) {
    throw error;
  }
} 