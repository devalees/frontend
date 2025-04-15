#!/usr/bin/env node

/**
 * Build validation script
 * 
 * This script validates the build output to ensure it meets our requirements.
 * It checks for:
 * - Required files exist
 * - File sizes are within limits
 * - No console.log statements in production code
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const BUILD_DIR = path.resolve(__dirname, '../dist');
const MAX_JS_SIZE_KB = 500;
const MAX_CSS_SIZE_KB = 100;
const REQUIRED_FILES = ['index.html', 'assets'];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Helper functions
const log = (message, color = colors.reset) => {
  console.log(`${color}${message}${colors.reset}`);
};

const error = (message) => log(message, colors.red);
const success = (message) => log(message, colors.green);
const warning = (message) => log(message, colors.yellow);
const info = (message) => log(message, colors.blue);

// Check if build directory exists
const checkBuildDir = () => {
  if (!fs.existsSync(BUILD_DIR)) {
    error(`Build directory not found: ${BUILD_DIR}`);
    return false;
  }
  success(`Build directory found: ${BUILD_DIR}`);
  return true;
};

// Check if required files exist
const checkRequiredFiles = () => {
  let allFilesExist = true;
  
  for (const file of REQUIRED_FILES) {
    const filePath = path.join(BUILD_DIR, file);
    if (!fs.existsSync(filePath)) {
      error(`Required file not found: ${file}`);
      allFilesExist = false;
    } else {
      success(`Required file found: ${file}`);
    }
  }
  
  return allFilesExist;
};

// Check file sizes
const checkFileSizes = () => {
  let allSizesOk = true;
  
  // Get all JS files
  const jsFiles = getAllFiles(BUILD_DIR, '.js');
  for (const file of jsFiles) {
    const stats = fs.statSync(file);
    const sizeInKb = stats.size / 1024;
    
    if (sizeInKb > MAX_JS_SIZE_KB) {
      warning(`JS file exceeds size limit: ${path.relative(BUILD_DIR, file)} (${sizeInKb.toFixed(2)} KB)`);
      allSizesOk = false;
    } else {
      info(`JS file size OK: ${path.relative(BUILD_DIR, file)} (${sizeInKb.toFixed(2)} KB)`);
    }
  }
  
  // Get all CSS files
  const cssFiles = getAllFiles(BUILD_DIR, '.css');
  for (const file of cssFiles) {
    const stats = fs.statSync(file);
    const sizeInKb = stats.size / 1024;
    
    if (sizeInKb > MAX_CSS_SIZE_KB) {
      warning(`CSS file exceeds size limit: ${path.relative(BUILD_DIR, file)} (${sizeInKb.toFixed(2)} KB)`);
      allSizesOk = false;
    } else {
      info(`CSS file size OK: ${path.relative(BUILD_DIR, file)} (${sizeInKb.toFixed(2)} KB)`);
    }
  }
  
  return allSizesOk;
};

// Helper function to get all files with a specific extension
const getAllFiles = (dir, ext) => {
  const files = [];
  
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      files.push(...getAllFiles(itemPath, ext));
    } else if (item.endsWith(ext)) {
      files.push(itemPath);
    }
  }
  
  return files;
};

// Check for console.log statements in production code
const checkConsoleLogs = () => {
  try {
    // Use grep to search for console.log statements in JS files
    const result = execSync(`grep -r "console.log" ${BUILD_DIR}/assets/*.js`, { encoding: 'utf8' });
    
    if (result.trim()) {
      warning('Found console.log statements in production code:');
      console.log(result);
      return false;
    }
    
    success('No console.log statements found in production code');
    return true;
  } catch (error) {
    // grep returns non-zero exit code if no matches found, which is what we want
    success('No console.log statements found in production code');
    return true;
  }
};

// Main function
const validateBuild = () => {
  info('Starting build validation...');
  
  const buildDirExists = checkBuildDir();
  if (!buildDirExists) {
    error('Build validation failed: Build directory not found');
    process.exit(1);
  }
  
  const requiredFilesExist = checkRequiredFiles();
  if (!requiredFilesExist) {
    error('Build validation failed: Required files missing');
    process.exit(1);
  }
  
  const fileSizesOk = checkFileSizes();
  if (!fileSizesOk) {
    warning('Build validation warning: Some files exceed size limits');
  }
  
  const noConsoleLogs = checkConsoleLogs();
  if (!noConsoleLogs) {
    warning('Build validation warning: Console.log statements found in production code');
  }
  
  success('Build validation completed successfully!');
};

// Run validation
validateBuild(); 