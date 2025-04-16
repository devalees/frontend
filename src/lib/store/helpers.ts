import { produce } from 'immer';
import { createSelector } from 'reselect';

type Path = (string | number)[];
type Schema = {
  type: string;
  required?: string[];
  properties?: Record<string, Schema>;
};

interface StateUpdate {
  path: Path;
  value: unknown;
}

interface Draft {
  [key: string]: any;
}

/**
 * Helper class for immutable state updates
 */
export class StateUpdateHelper {
  /**
   * Updates a nested state property immutably
   */
  static updateNested<T extends Record<string, any>>(
    state: T,
    path: Path,
    value: unknown
  ): T {
    return produce(state, (draft: Draft) => {
      let current = draft;
      const lastIndex = path.length - 1;

      for (let i = 0; i < lastIndex; i++) {
        const key = path[i];
        current = current[key];
      }

      current[path[lastIndex]] = value;
    });
  }

  /**
   * Performs multiple state updates atomically
   */
  static batchUpdate<T extends Record<string, any>>(
    state: T,
    updates: StateUpdate[]
  ): T {
    return produce(state, (draft: Draft) => {
      updates.forEach(({ path, value }) => {
        let current = draft;
        const lastIndex = path.length - 1;

        for (let i = 0; i < lastIndex; i++) {
          const key = path[i];
          current = current[key];
        }

        current[path[lastIndex]] = value;
      });
    });
  }
}

/**
 * Helper class for creating and managing selectors
 */
export class StateSelectorHelper {
  /**
   * Creates a memoized selector for nested state access
   */
  static createSelector<T extends Record<string, any>, R>(
    path: Path
  ): (state: T) => R {
    return createSelector(
      [(state: T) => state],
      (state: T) => {
        let result: any = state;
        for (const key of path) {
          result = result[key];
        }
        return result as R;
      }
    );
  }

  /**
   * Creates a computed selector with transformation
   */
  static createComputedSelector<T extends Record<string, any>, R>(
    path: Path,
    transform: (value: any) => R
  ): (state: T) => R {
    return createSelector(
      [this.createSelector<T, any>(path)],
      transform
    );
  }
}

/**
 * Helper class for state validation
 */
export class StateValidationHelper {
  /**
   * Validates state shape against a schema
   */
  static validateShape(state: Record<string, any>, schema: Schema): boolean {
    // Check type
    if (schema.type === 'object' && typeof state !== 'object') {
      return false;
    }

    // Check required fields
    if (schema.required) {
      const hasAllRequired = schema.required.every(field => 
        Object.prototype.hasOwnProperty.call(state, field)
      );
      if (!hasAllRequired) {
        return false;
      }
    }

    // Check property types
    if (schema.properties) {
      return Object.entries(schema.properties).every(([key, propSchema]) => {
        if (!state.hasOwnProperty(key)) {
          return true; // Skip validation for optional properties
        }

        const value = state[key];
        switch (propSchema.type) {
          case 'string':
            return typeof value === 'string';
          case 'number':
            return typeof value === 'number';
          case 'boolean':
            return typeof value === 'boolean';
          case 'object':
            return typeof value === 'object' && 
              (!propSchema.properties || this.validateShape(value, propSchema));
          default:
            return true;
        }
      });
    }

    return true;
  }

  /**
   * Validates state transitions
   */
  static validateTransition(
    prevState: Record<string, any>,
    nextState: Record<string, any>
  ): boolean {
    // Validate status transitions
    const validStatuses = ['pending', 'success', 'error'] as const;
    if (!validStatuses.includes(nextState.status as typeof validStatuses[number])) {
      return false;
    }

    // Validate data/error consistency
    if (nextState.status === 'success') {
      return nextState.data !== null && nextState.error === null;
    }
    if (nextState.status === 'error') {
      return nextState.data === null && nextState.error !== null;
    }
    if (nextState.status === 'pending') {
      return nextState.data === null && nextState.error === null;
    }

    return true;
  }
} 