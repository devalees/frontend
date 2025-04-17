# Non-Centralized Test Files

This document lists all test files that are NOT using our centralized test system.

The centralized test system imports testing utilities from our unified test utilities instead of directly from testing libraries. Tests that use the centralized system will import from `'../../tests/utils'` instead of directly from `'vitest'` or `'@testing-library/react'`.

## API Tests

- `/frontend/src/tests/api/tokenRefresh.test.ts`
- `/frontend/src/tests/api/optimisticUpdates.test.ts`
- `/frontend/src/tests/api/environmentConfig.test.ts`
- `/frontend/src/tests/api/responseHandlers.test.ts`
- `/frontend/src/tests/api/requestBuilders.test.ts`
- `/frontend/src/tests/api/realtimeUpdates.test.ts`
- `/frontend/src/tests/api/socketClient.test.ts`
- `/frontend/src/tests/api/errorHandling.test.ts`

## Component Tests

- `/frontend/src/tests/components/DatePicker.test.tsx`
- `/frontend/src/tests/components/Form.test.tsx`
- `/frontend/src/tests/components/Select.test.tsx`
- `/frontend/src/tests/components/DebugPanel.test.tsx`
- `/frontend/src/tests/components/Skeleton.test.tsx`
- `/frontend/src/tests/components/Spinner.test.tsx`
- `/frontend/src/tests/components/Grid.test.tsx`
- `/frontend/src/tests/components/Sidebar.test.tsx`
- `/frontend/src/tests/components/Modal.test.tsx`
- `/frontend/src/tests/components/Header.test.tsx`
- `/frontend/src/tests/components/Input.test.tsx`
- `/frontend/src/tests/components/Button.test.tsx`

## Documentation Tests

- `/frontend/src/tests/documentation/tutorials.test.ts`
- `/frontend/src/tests/documentation/userDocs.test.ts`
- `/frontend/src/tests/documentation/apiExamples.test.ts`
- `/frontend/src/tests/documentation/apiReference.test.ts`
- `/frontend/src/tests/documentation/docGeneration.test.ts`
- `/frontend/src/tests/documentation/commentStyles.test.ts`

## Performance Tests

- `/frontend/src/tests/performance/routeSplitting.test.tsx`
- `/frontend/src/tests/performance/performanceAnalysis.test.ts`
- `/frontend/src/tests/performance/componentSplitting.test.tsx`
- `/frontend/src/tests/performance/RouteLoading.test.tsx`
- `/frontend/src/tests/performance/RouteLink.test.tsx`
- `/frontend/src/tests/performance/serviceWorker.test.ts`
- `/frontend/src/tests/performance/RouteError.test.tsx`
- `/frontend/src/tests/performance/browserCache.test.ts`

## Manual Tests

- `/frontend/src/tests/manual/componentLoaderTest.tsx`

## Root Tests

- `/frontend/src/tests/buildTools.test.ts`
- `/frontend/src/tests/dependencies.test.ts`
- `/frontend/src/tests/envConfig.test.ts`
- `/frontend/src/tests/deployment.test.ts`
- `/frontend/src/tests/devTools.test.ts`
- `/frontend/src/tests/projectStructure.test.ts`

## Store Tests

- `/frontend/src/tests/store/actions.test.ts`
- `/frontend/src/tests/store/stateTypes.test.ts`
- `/frontend/src/tests/store/debugger.test.ts`
- `/frontend/src/tests/store/stateHooks.test.ts`
- `/frontend/src/tests/store/validationHelpers.test.ts`
- `/frontend/src/tests/store/logger.test.ts`
- `/frontend/src/tests/store/selectorHelpers.test.ts`
- `/frontend/src/tests/store/stateHelpers.test.ts`
- `/frontend/src/tests/store/stateSlices.test.ts`
- `/frontend/src/tests/store/persistence.test.ts`
- `/frontend/src/tests/store/middleware.test.ts`
- `/frontend/src/tests/store/zustandConfig.test.ts` 