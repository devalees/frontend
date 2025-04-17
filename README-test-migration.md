# Test Coverage Migration Guide

This guide explains how to use the tools we've created to migrate tests to our centralized testing system instead of trying to increase coverage with the old approach.

## Overview

Instead of trying to patch the old tests to reach 90% coverage, we're taking a more strategic approach:

1. We're gradually migrating tests to a centralized testing system
2. We're focusing on quality over artificially inflating coverage numbers
3. We're tracking progress and setting realistic goals

## Files Created

We've created several files to help with this migration:

1. `test-migration-plan.md` - The overall strategy and timeline
2. `test-migration-tracker.md` - A tracking document for progress
3. `vitest.coverage.config.js` - Modified coverage configuration with realistic thresholds
4. `src/tests/templates/` - Templates for the new test approach:
   - `component.test.template.tsx` - For component tests
   - `hook.test.template.ts` - For hook tests
5. `scripts/update-coverage-report.js` - Helper script for updating the tracker

## Using the Tools

### 1. Run Tests with Modified Coverage Thresholds

Instead of running the standard test command, use:

```bash
npm run test:coverage -- --config vitest.coverage.config.js
```

This will run tests with more realistic thresholds during the migration.

### 2. Create a New Test using Templates

When migrating a component or hook test:

1. Copy the appropriate template from `src/tests/templates/`
2. Update the imports and placeholders
3. Implement tests using the centralized utilities

### 3. Track Migration Progress

After migrating a module:

```bash
node scripts/update-coverage-report.js --module=lib/store --status=completed --notes="Migrated core store logic"
```

This will:
- Run tests for the module
- Extract coverage information
- Update the migration tracker
- Add an entry to the recent migrations list

## Migration Strategy

Follow these steps for each module:

1. **Assessment**: Evaluate the current tests and coverage
2. **Migration**: Create new tests using the centralized system
3. **Verification**: Ensure coverage is at least as good as before
4. **Removal**: Remove the old tests (once new ones are working)

## Package.json Changes

We've added these scripts to package.json:

```json
"test:coverage": "vitest run --coverage",
"test:coverage:90": "vitest run --coverage --config vitest.90coverage.config.js"
```

## Long-term Goals

Our goal is still to reach 90% coverage, but in a more sustainable way:

- Phase 1: Maintain current coverage (62%) with better structure
- Phase 2: 70% coverage of core modules
- Phase 3: 80% overall coverage
- Phase 4: 90%+ coverage with high-quality tests

## Reporting Issues

If you encounter any issues with the migration tools or process, please report them in the project issue tracker.

## Contributing

Feel free to improve the templates and tools as needed. Update the documentation when making changes! 