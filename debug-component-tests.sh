#!/bin/bash

echo "=== Running Component Splitting Tests with Debug Logging ==="
echo "Started at $(date)"

# Create logs directory if it doesn't exist
mkdir -p logs

# Run the test with reporter=verbose output and save to log file
npm test -- --reporter=verbose src/tests/performance/componentSplitting.test.tsx 2>&1 | tee logs/component-tests-$(date +%Y%m%d-%H%M%S).log

echo "=== Test run completed at $(date) ==="
echo "Log file saved to logs directory" 