#!/usr/bin/env node

/**
 * Auto-Update Dependencies Script
 * 
 * यह script npm install के दौरान automatically चलता है और
 * सभी dependencies को latest version में update करता है
 * 
 * Environment Variables:
 * - SKIP_AUTO_UPDATE=true    : Auto-update को disable करने के लिए
 * - AUTO_UPDATE=false        : Alternative way to disable
 * - CI=true                  : CI environment में automatically enable
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const DEPENDENCIES = [
  'brave-real-launcher',
  'brave-real-puppeteer-core',
  'ghost-cursor',
  'puppeteer-extra',
  'tree-kill',
  'xvfb'
];

// Check if auto-update should be skipped
const shouldSkipUpdate = () => {
  // Skip करें अगर environment variable set है
  if (process.env.SKIP_AUTO_UPDATE === 'true' || process.env.AUTO_UPDATE === 'false') {
    console.log('⏭️  Auto-update skipped (SKIP_AUTO_UPDATE=true)');
    return true;
  }

  // Skip करें अगर यह khud की installation है (avoid recursion)
  if (process.env.npm_lifecycle_event === 'preinstall' && process.env.npm_package_name === 'brave-real-browser') {
    // Check if we're installing from npm registry
    const isRegistryInstall = process.env.npm_config_argv && 
                               process.env.npm_config_argv.includes('install') &&
                               !fs.existsSync(path.join(__dirname, '..', 'package.json'));
    
    if (isRegistryInstall) {
      console.log('📦 Installing from npm registry...');
      return true;
    }
  }

  return false;
};

// Main update function
const updateDependencies = () => {
  try {
    console.log('\n🔄 Brave-Real-Browser: Checking for dependency updates...\n');

    // Check for outdated packages
    let outdated = [];
    try {
      const result = execSync('npm outdated --json', { 
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore'] // Suppress stderr
      });
      outdated = Object.keys(JSON.parse(result || '{}'));
    } catch (error) {
      // npm outdated exits with code 1 when there are outdated packages
      if (error.stdout) {
        try {
          outdated = Object.keys(JSON.parse(error.stdout));
        } catch {}
      }
    }

    // Filter केवल हमारी dependencies
    const outdatedDeps = outdated.filter(dep => DEPENDENCIES.includes(dep));

    if (outdatedDeps.length === 0) {
      console.log('✅ All dependencies are up to date!\n');
      return;
    }

    console.log(`📦 Found ${outdatedDeps.length} outdated dependencies:`);
    outdatedDeps.forEach(dep => console.log(`   - ${dep}`));
    console.log('\n🔧 Updating to latest versions...\n');

    // Update सभी outdated dependencies
    const updateCommand = outdatedDeps.map(dep => `${dep}@latest`).join(' ');
    execSync(`npm install ${updateCommand}`, {
      stdio: 'inherit',
      encoding: 'utf8'
    });

    console.log('\n✅ Dependencies updated successfully!\n');

    // Show updated versions
    try {
      console.log('📋 Current versions:');
      execSync('npm list --depth=0', { 
        stdio: 'inherit',
        encoding: 'utf8' 
      });
    } catch (error) {
      // Ignore errors from npm list
    }

  } catch (error) {
    console.error('\n⚠️  Warning: Could not auto-update dependencies');
    console.error('   You can manually update using: npm run update-deps\n');
    // Don't fail the installation
  }
};

// Main execution
if (!shouldSkipUpdate()) {
  updateDependencies();
} else {
  console.log('🔍 Checking dependencies...\n');
}
