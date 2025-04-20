#!/bin/bash

# Function to process a file
process_file() {
    local file=$1
    echo "Processing $file..."
    
    # Create a backup
    cp "$file" "${file}.bak"
    
    # Replace Vitest imports with Jest
    sed -i 's/import.*from.*vitest.*/import { jest } from "@jest\/globals";/' "$file"
    
    # Replace vi with jest
    sed -i 's/vi\./jest./g' "$file"
    
    # Replace Vitest types with Jest types
    sed -i 's/import type { Mock } from "vitest";/import type { Mock } from "jest";/' "$file"
    
    echo "Processed $file"
}

# Find all test files
find src/tests -type f -name "*.test.ts" -o -name "*.test.tsx" | while read -r file; do
    process_file "$file"
done

# Also process test files in the root tests directory
find tests -type f -name "*.test.ts" -o -name "*.test.tsx" | while read -r file; do
    process_file "$file"
done

echo "Migration complete. Please review the changes and run tests." 