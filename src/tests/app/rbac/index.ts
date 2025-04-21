/**
 * RBAC Page Tests
 * 
 * This file exports all the RBAC page tests for easy importing.
 */

// Import all RBAC page tests
import './roles.test';
import './permissions.test';
import './user-roles.test';

// Export test utilities for RBAC pages
export * from '../../utils/componentTestUtils';
export * from '../../utils/integrationTestUtils';
export * from '../../utils/mockApi'; 