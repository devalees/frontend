const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Patterns to replace
const replacements = [
  {
    from: /import\s*{\s*([^}]*)\s*}\s*from\s*['"]vitest['"]/g,
    to: 'import { $1 } from \'@jest/globals\''
  },
  {
    from: /import\s*{\s*([^}]*)\s*}\s*from\s*['"]@testing-library\/react['"]/g,
    to: 'import { $1 } from \'../../tests/utils\''
  },
  {
    from: /vi\./g,
    to: 'jest.'
  },
  {
    from: /describe\(['"]/g,
    to: 'describe(\''
  },
  {
    from: /it\(['"]/g,
    to: 'it(\''
  },
  {
    from: /expect\(/g,
    to: 'expect('
  }
];

// Find all test files
const testFiles = glob.sync('src/**/*.test.{ts,tsx}');

// Process each file
testFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Apply replacements
  replacements.forEach(({ from, to }) => {
    content = content.replace(from, to);
  });
  
  // Write back the file
  fs.writeFileSync(file, content);
  console.log(`Migrated ${file}`);
}); 