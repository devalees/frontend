#!/usr/bin/env node
/**
 * This script runs tests and updates the migration tracker with coverage information.
 * 
 * Usage:
 *   node scripts/update-coverage-report.js --module=lib/store
 * 
 * Options:
 *   --module   The module to test (e.g., api, components/ui, lib/store)
 *   --status   The migration status (completed, in-progress, not-started)
 *   --notes    Any notes to add to the tracker (optional)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { argv } = require('process');

// Parse command line arguments
const args = argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.replace('--', '').split('=');
  acc[key] = value;
  return acc;
}, {});

const module = args.module;
const status = args.status || 'in-progress';
const notes = args.notes || '';

if (!module) {
  console.error('Module parameter is required');
  console.error('Usage: node scripts/update-coverage-report.js --module=lib/store');
  process.exit(1);
}

// Run tests for the module
console.log(`Running tests for module: ${module}`);

try {
  const testPattern = module.includes('/') 
    ? `"src/${module}/**/*.{test,spec}.{ts,tsx}"`
    : `"src/${module}/**/*.{test,spec}.{ts,tsx}"`;
  
  const testCommand = `npm run test:coverage -- ${testPattern}`;
  const testOutput = execSync(testCommand, { encoding: 'utf-8' });
  
  console.log('Test output:', testOutput);
  
  // Extract coverage information
  const coverageMatch = testOutput.match(/All files\s*\|\s*([\d.]+)/);
  const coverage = coverageMatch ? coverageMatch[1] : 'unknown';
  
  // Update the tracker file
  const trackerPath = path.join(__dirname, '..', 'test-migration-tracker.md');
  const trackerContent = fs.readFileSync(trackerPath, 'utf-8');
  
  // Find the module line and update it
  const moduleRegex = new RegExp(`\\| ${module.replace('/', '\\/')} \\| [^|]+ \\| [^|]+ \\| [^|]+ \\| [^|]+ \\|`, 'i');
  
  let statusEmoji = '❌';
  if (status === 'completed') statusEmoji = '✅';
  if (status === 'in-progress') statusEmoji = '🚧';
  
  const today = new Date().toISOString().split('T')[0];
  const updatedLine = `| ${module} | ${statusEmoji} ${status.charAt(0).toUpperCase() + status.slice(1)} | ${today} | ${coverage}% | ${notes} |`;
  
  let updatedContent;
  
  if (moduleRegex.test(trackerContent)) {
    // Update existing module
    updatedContent = trackerContent.replace(moduleRegex, updatedLine);
  } else {
    // Add new module
    const tableEndIndex = trackerContent.indexOf('## Migration Priority List');
    const contentBefore = trackerContent.slice(0, tableEndIndex);
    const contentAfter = trackerContent.slice(tableEndIndex);
    
    updatedContent = contentBefore + `${updatedLine}\n` + contentAfter;
  }
  
  fs.writeFileSync(trackerPath, updatedContent, 'utf-8');
  
  // Also update the recent migrations table
  const recentMigrationsRegex = /## Recently Migrated Modules\n\n\| Date \| Module \| PRs \| Notes \|\n\|---\|---\|---\|---\|\n(\|[^\n]*\n)*/;
  const recentMigrationsMatch = trackerContent.match(recentMigrationsRegex);
  
  if (recentMigrationsMatch) {
    const recentMigrationsTable = recentMigrationsMatch[0];
    const recentMigrationsHeader = "## Recently Migrated Modules\n\n| Date | Module | PRs | Notes |\n|------|--------|-----|-------|\n";
    const newMigrationEntry = `| ${today} | ${module} | | ${notes} |\n`;
    
    const newRecentMigrationsTable = recentMigrationsHeader + newMigrationEntry + recentMigrationsTable.split('\n').slice(4).join('\n');
    
    updatedContent = updatedContent.replace(recentMigrationsRegex, newRecentMigrationsTable);
    fs.writeFileSync(trackerPath, updatedContent, 'utf-8');
  }
  
  console.log(`Updated migration tracker for module: ${module} with coverage: ${coverage}%`);
  
} catch (error) {
  console.error('Error running tests or updating tracker:', error.message);
  process.exit(1);
} 