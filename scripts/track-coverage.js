#!/usr/bin/env node
/**
 * Enhanced Coverage Tracking Script
 * 
 * This script runs tests and updates the migration tracker with coverage information.
 * It supports both module-specific tracking and global tracking.
 * 
 * Usage:
 *   # Track a specific module:
 *   npm run test:track:module -- api --status=completed --notes="Already well tested"
 * 
 *   # Track global coverage:
 *   npm run test:track:global
 * 
 * Options:
 *   --module    The module to test (provided as first argument after --)
 *   --status    The migration status (completed, in-progress, not-started)
 *   --notes     Any notes to add to the tracker (optional)
 *   --global    Flag to run and track global coverage
 *   --update    Update tracker without running tests (for manual updates)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { argv } = require('process');

// Parse command line arguments
console.log('Arguments (raw):', argv.slice(2));

// For this script, assume "npm run test:track:module -- api --status=completed" means:
// Position 0: "api" (the module name)
// Position 1: "--status=completed" or "--status" "completed"
const args = {
  global: argv.slice(2).includes('--global'),
  update: argv.slice(2).includes('--update'),
};

// Try to parse module name (first argument after --)
if (argv.length > 2 && !args.global) {
  args.module = argv[2]; // First argument is the module
  
  // Parse status and notes
  for (let i = 3; i < argv.length; i++) {
    const arg = argv[i];
    
    if (arg.startsWith('--status')) {
      if (arg.includes('=')) {
        args.status = arg.split('=')[1];
      } else if (i + 1 < argv.length) {
        args.status = argv[i + 1];
        i++; // Skip the next arg as it's the value
      }
    } else if (arg.startsWith('--notes')) {
      if (arg.includes('=')) {
        args.notes = arg.split('=')[1];
      } else if (i + 1 < argv.length) {
        args.notes = argv[i + 1];
        i++; // Skip the next arg as it's the value
      }
    }
  }
}

// Set default values
if (!args.status) args.status = 'in-progress';
if (!args.notes) args.notes = '';

// Log parsed arguments
console.log('Parsed Arguments:', args);

const isGlobal = args.global;
const targetModule = args.module;
const status = args.status;
const notes = args.notes;
const skipTests = args.update;

const trackerPath = path.join(__dirname, '..', 'test-migration-tracker.md');
const today = new Date().toISOString().split('T')[0];

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m'
};

// Function to print a formatted header
function printHeader(text) {
  const line = '─'.repeat(80);
  console.log(`\n${colors.bright}${colors.blue}${line}`);
  console.log(`📊 ${text}`);
  console.log(`${line}${colors.reset}\n`);
}

// Function to print a formatted section
function printSection(title, content) {
  console.log(`${colors.bright}${colors.cyan}🔹 ${title}:${colors.reset}`);
  console.log(`${content}\n`);
}

// Function to print a formatted coverage metric
function formatCoverageMetric(name, value, threshold) {
  const numValue = parseFloat(value);
  let color = colors.green;
  
  if (numValue < threshold) {
    color = numValue < threshold * 0.7 ? colors.red : colors.yellow;
  }
  
  return `${name.padEnd(12)}: ${color}${value}%${colors.reset} ${numValue >= threshold ? '✅' : `❌ (target: ${threshold}%)`}`;
}

// Function to generate test patterns for a module
function generateTestPatterns(moduleStr) {
  // Check if it's a special case for API
  if (moduleStr === 'api') {
    return '"src/tests/api/**/*.{test,spec}.{ts,tsx}"';
  }
  
  // Check if it includes a path separator
  if (moduleStr.includes('/')) {
    // Patterns for specific module paths
    return [
      // Tests in the tests directory
      `"src/tests/${moduleStr}/**/*.{test,spec}.{ts,tsx}"`,
      // Co-located tests
      `"src/${moduleStr}/**/*.{test,spec}.{ts,tsx}"`
    ].join(' ');
  }
  
  // Generic module without path (like 'components' or 'lib')
  return [
    // Tests in the tests directory
    `"src/tests/${moduleStr}/**/*.{test,spec}.{ts,tsx}"`,
    // Co-located tests
    `"src/${moduleStr}/**/*.{test,spec}.{ts,tsx}"`
  ].join(' ');
}

// Function to run tests and get coverage
function runTests(testPattern) {
  if (testPattern) {
    printHeader(`Running Tests for Module: ${colors.green}${targetModule}${colors.blue}`);
  } else {
    printHeader('Running Global Coverage Tests');
  }
  
  try {
    const testCommand = testPattern 
      ? `npm run test:coverage -- ${testPattern} --reporter=dot`
      : `npm run test:coverage -- --reporter=dot`;
    
    console.log(`${colors.dim}Running command: ${testCommand}${colors.reset}`);
    return execSync(testCommand, { encoding: 'utf-8' });
  } catch (error) {
    console.error(`${colors.red}Tests completed with errors${colors.reset}`);
    return error.stdout; // Still try to extract coverage from error output
  }
}

// Function to extract coverage from test output
function extractCoverage(testOutput) {
  // Extract overall coverage
  const coverageMatch = testOutput.match(/All files\s*\|\s*([\d.]+)/);
  const lineCoverage = coverageMatch ? coverageMatch[1] : 'unknown';
  
  // Extract other metrics
  const branchMatch = testOutput.match(/% Branch\s*\|\s*([\d.]+)/);
  const branchCoverage = branchMatch ? branchMatch[1] : 'unknown';
  
  const funcMatch = testOutput.match(/% Funcs\s*\|\s*([\d.]+)/);
  const funcCoverage = funcMatch ? funcMatch[1] : 'unknown';
  
  // Extract passed tests
  const testPassedMatch = testOutput.match(/Test Files\s+(\d+)\s+passed/);
  const testsPassed = testPassedMatch ? testPassedMatch[1] : '0';
  
  const totalTestsMatch = testOutput.match(/Tests\s+(\d+)\s+passed/);
  const totalTests = totalTestsMatch ? totalTestsMatch[1] : '0';
  
  return {
    lines: lineCoverage,
    branches: branchCoverage,
    functions: funcCoverage,
    testFiles: testsPassed,
    totalTests: totalTests
  };
}

// Function to extract and display test file details
function extractTestFiles(testOutput) {
  const testFileRegex = /✓ ([^(]+)\((\d+) tests\) (\d+)ms/g;
  let match;
  let fileResults = [];
  
  while ((match = testFileRegex.exec(testOutput)) !== null) {
    fileResults.push({
      file: match[1].trim(),
      tests: match[2],
      time: match[3]
    });
  }
  
  return fileResults;
}

// Function to display detailed test results
function displayTestResults(testOutput, coverage) {
  const testFiles = extractTestFiles(testOutput);
  
  // Display summary
  printSection('Test Summary', `${colors.green}✅ ${coverage.testFiles} test files with ${coverage.totalTests} tests passed${colors.reset}`);
  
  // Display coverage metrics
  const threshold = 90; // The target threshold
  printSection('Coverage Metrics', [
    formatCoverageMetric('Statements', coverage.lines, threshold),
    formatCoverageMetric('Branches', coverage.branches, threshold),
    formatCoverageMetric('Functions', coverage.functions, threshold),
  ].join('\n'));
  
  // Display test files if there aren't too many
  if (testFiles.length <= 10) {
    printSection('Test Files', testFiles.map(file => 
      `${colors.green}✓${colors.reset} ${colors.bright}${file.file}${colors.reset} (${file.tests} tests, ${file.time}ms)`
    ).join('\n'));
  } else {
    printSection('Test Files', `${colors.yellow}${testFiles.length} test files${colors.reset} (too many to display individually)`);
  }
}

// Function to update module in tracker
function updateModuleInTracker(trackerContent, moduleName, moduleStatus, coverage, moduleNotes) {
  let statusEmoji = '❌';
  if (moduleStatus === 'completed') statusEmoji = '✅';
  if (moduleStatus === 'in-progress') statusEmoji = '🚧';
  
  const updatedLine = `| ${moduleName} | ${statusEmoji} ${moduleStatus.charAt(0).toUpperCase() + moduleStatus.slice(1)} | ${today} | ${coverage.lines}% | ${moduleNotes} |`;
  
  // Find the module line and update it
  const moduleRegex = new RegExp(`\\| ${moduleName.replace(/\//g, '\\/')} \\| [^|]+ \\| [^|]+ \\| [^|]+ \\| [^|]+ \\|`, 'i');
  
  if (moduleRegex.test(trackerContent)) {
    // Update existing module
    return trackerContent.replace(moduleRegex, updatedLine);
  } else {
    // Add new module
    const tableEndIndex = trackerContent.indexOf('## Migration Priority List');
    const contentBefore = trackerContent.slice(0, tableEndIndex);
    const contentAfter = trackerContent.slice(tableEndIndex);
    
    return contentBefore + `${updatedLine}\n` + contentAfter;
  }
}

// Function to update global coverage summary
function updateGlobalCoverage(trackerContent, coverage) {
  // Update the overall progress summary
  const summaryRegex = /## Overall Progress Summary\n([\s\S]*?)(?=\n## Migration Priority List)/;
  const summaryMatch = trackerContent.match(summaryRegex);
  
  if (summaryMatch) {
    const currentSummary = summaryMatch[1];
    // Insert or update the coverage line
    if (currentSummary.includes("Current overall coverage:")) {
      return trackerContent.replace(
        /Current overall coverage: [\d.]+%/,
        `Current overall coverage: ${coverage.lines}%`
      );
    } else {
      const newSummary = currentSummary + `- Current overall coverage: ${coverage.lines}%\n`;
      return trackerContent.replace(summaryMatch[1], newSummary);
    }
  }
  
  return trackerContent;
}

// Function to update recent migrations
function updateRecentMigrations(trackerContent, moduleName, moduleNotes) {
  const recentMigrationsRegex = /## Recently Migrated Modules\n\n\| Date \| Module \| PRs \| Notes \|\n\|---\|---\|---\|---\|\n(\|[^\n]*\n)*/;
  const recentMigrationsMatch = trackerContent.match(recentMigrationsRegex);
  
  if (recentMigrationsMatch) {
    const recentMigrationsTable = recentMigrationsMatch[0];
    const recentMigrationsHeader = "## Recently Migrated Modules\n\n| Date | Module | PRs | Notes |\n|------|--------|-----|-------|\n";
    const newMigrationEntry = `| ${today} | ${moduleName} | | ${moduleNotes} |\n`;
    
    const newRecentMigrationsTable = recentMigrationsHeader + newMigrationEntry + recentMigrationsTable.split('\n').slice(4).join('\n');
    
    return trackerContent.replace(recentMigrationsRegex, newRecentMigrationsTable);
  }
  
  return trackerContent;
}

// Main execution
try {
  // Check if tracker file exists
  if (!fs.existsSync(trackerPath)) {
    console.error(`${colors.red}Tracker file not found at ${trackerPath}${colors.reset}`);
    process.exit(1);
  }
  
  let trackerContent = fs.readFileSync(trackerPath, 'utf-8');
  let testOutput = '';
  let coverage = {
    lines: 'unknown',
    branches: 'unknown',
    functions: 'unknown',
    testFiles: '0',
    totalTests: '0'
  };
  
  // Run tests if not skipped
  if (!skipTests) {
    if (isGlobal) {
      testOutput = runTests();
      coverage = extractCoverage(testOutput);
      
      // Display detailed results
      displayTestResults(testOutput, coverage);
      
      // Update global coverage in tracker
      trackerContent = updateGlobalCoverage(trackerContent, coverage);
      printSection('Migration Tracker', `${colors.green}Updated global coverage: ${coverage.lines}%${colors.reset}`);
    } else if (targetModule) {
      // Safe check for string type of targetModule
      const moduleStr = String(targetModule);
      const testPattern = generateTestPatterns(moduleStr);
      
      testOutput = runTests(testPattern);
      coverage = extractCoverage(testOutput);
      
      // Display detailed results
      displayTestResults(testOutput, coverage);
      
      // Update module in tracker
      trackerContent = updateModuleInTracker(trackerContent, moduleStr, status, coverage, notes);
      
      // Add to recent migrations
      trackerContent = updateRecentMigrations(trackerContent, moduleStr, notes);
      
      printSection('Migration Tracker', `${colors.green}Updated coverage for module ${moduleStr}: ${coverage.lines}%${colors.reset}`);
    } else {
      console.error(`${colors.red}Either --module or --global is required${colors.reset}`);
      process.exit(1);
    }
  } else {
    // Manual update without running tests
    if (targetModule) {
      // Safe check for string type of targetModule
      const moduleStr = String(targetModule);
      printHeader(`Manual Update for Module: ${colors.green}${moduleStr}${colors.blue}`);
      coverage.lines = '(manual)';
      trackerContent = updateModuleInTracker(trackerContent, moduleStr, status, coverage, notes);
      trackerContent = updateRecentMigrations(trackerContent, moduleStr, notes);
      printSection('Migration Tracker', `${colors.green}Manually updated module ${moduleStr} without running tests${colors.reset}`);
    } else {
      console.error(`${colors.red}--module is required with --update${colors.reset}`);
      process.exit(1);
    }
  }
  
  // Write updated content back to tracker
  fs.writeFileSync(trackerPath, trackerContent, 'utf-8');
  
  // Display closing message
  console.log(`\n${colors.bright}${colors.green}✅ Coverage tracking completed successfully.${colors.reset}\n`);
  
} catch (error) {
  console.error(`\n${colors.bright}${colors.red}Error: ${error.message}${colors.reset}\n`);
  process.exit(1);
} 