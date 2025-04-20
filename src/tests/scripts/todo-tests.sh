#!/bin/bash

# Run Todo-specific tests
echo "Running Todo-related tests..."

# Todo type definition test
npm test -- src/tests/types/todoType.test.ts

# Todo fixture test
npm test -- src/tests/utils/fixtures.test.ts --testNamePattern="Todo Fixtures" 