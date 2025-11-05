#!/usr/bin/env node

/**
 * Automatic Version Bumping Script
 * Bumps version based on commit message keywords
 *
 * Keywords:
 * - BREAKING CHANGE, major: -> bump major version (1.0.0 -> 2.0.0)
 * - feat:, feature: -> bump minor version (1.0.0 -> 1.1.0)
 * - fix:, bugfix:, patch: -> bump patch version (1.0.0 -> 1.0.1)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths
const FRONTEND_PACKAGE = path.join(__dirname, '../frontend/package.json');
const BACKEND_PACKAGE = path.join(__dirname, '../backend/package.json');
const SHARED_PACKAGE = path.join(__dirname, '../shared/package.json');
const VERSION_CONFIG = path.join(__dirname, '../frontend/src/shared/config/version.ts');
const CHANGELOG = path.join(__dirname, '../CHANGELOG.md');

/**
 * Get the last commit message
 */
function getLastCommitMessage() {
  try {
    return execSync('git log -1 --pretty=%B', { encoding: 'utf-8' }).trim();
  } catch (error) {
    return '';
  }
}

/**
 * Determine version bump type from commit message
 */
function getVersionBumpType(commitMessage) {
  const msg = commitMessage.toLowerCase();

  // Major version (breaking changes)
  if (msg.includes('breaking change') || msg.includes('major:')) {
    return 'major';
  }

  // Minor version (new features)
  if (msg.startsWith('feat:') || msg.startsWith('feature:') || msg.includes('feat(')) {
    return 'minor';
  }

  // Patch version (bug fixes, small changes)
  if (msg.startsWith('fix:') || msg.startsWith('bugfix:') || msg.startsWith('patch:') || msg.includes('fix(')) {
    return 'patch';
  }

  // Default to patch for any other commits
  return 'patch';
}

/**
 * Parse semantic version
 */
function parseVersion(versionString) {
  const [major, minor, patch] = versionString.split('.').map(Number);
  return { major, minor, patch };
}

/**
 * Bump version based on type
 */
function bumpVersion(currentVersion, bumpType) {
  const { major, minor, patch } = parseVersion(currentVersion);

  switch (bumpType) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    default:
      return currentVersion;
  }
}

/**
 * Update package.json version
 */
function updatePackageVersion(packagePath, newVersion) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  packageJson.version = newVersion;
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log(`✅ Updated ${path.basename(packagePath)} to v${newVersion}`);
}

/**
 * Update version.ts config
 */
function updateVersionConfig(newVersion) {
  const content = `/**
 * Application Version Configuration
 * Auto-updated on each deployment
 */

export const APP_VERSION = '${newVersion}';
export const BUILD_DATE = '${new Date().toISOString()}';

export const VERSION_CONFIG = {
  current: APP_VERSION,
  buildDate: BUILD_DATE,
  checkInterval: 5 * 60 * 1000, // Check every 5 minutes
  storageKey: 'app_version',
} as const;

/**
 * Check if app version has changed
 */
export const hasVersionChanged = (): boolean => {
  const storedVersion = localStorage.getItem(VERSION_CONFIG.storageKey);
  return storedVersion !== null && storedVersion !== APP_VERSION;
};

/**
 * Update stored version
 */
export const updateStoredVersion = (): void => {
  localStorage.setItem(VERSION_CONFIG.storageKey, APP_VERSION);
};

/**
 * Clear app cache and reload
 */
export const clearCacheAndReload = async (): Promise<void> => {
  try {
    // Clear all caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }

    // Clear service worker
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg => reg.unregister()));
    }

    // Update version and reload
    updateStoredVersion();
    window.location.reload();
  } catch (error) {
    console.error('Failed to clear cache:', error);
    // Fallback: just reload
    updateStoredVersion();
    window.location.reload();
  }
};
`;

  fs.writeFileSync(VERSION_CONFIG, content);
  console.log(`✅ Updated version.ts to v${newVersion}`);
}

/**
 * Update CHANGELOG.md
 */
function updateChangelog(newVersion, commitMessage, bumpType) {
  let changelog = '';

  // Read existing changelog if exists
  if (fs.existsSync(CHANGELOG)) {
    changelog = fs.readFileSync(CHANGELOG, 'utf-8');
  } else {
    changelog = '# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n';
  }

  // Generate new entry
  const date = new Date().toISOString().split('T')[0];
  const emoji = bumpType === 'major' ? '🚀' : bumpType === 'minor' ? '✨' : '🐛';
  const typeLabel = bumpType === 'major' ? 'BREAKING CHANGE' : bumpType === 'minor' ? 'New Feature' : 'Bug Fix';

  const newEntry = `## [${newVersion}] - ${date}\n\n### ${emoji} ${typeLabel}\n\n${commitMessage}\n\n---\n\n`;

  // Insert after header
  const lines = changelog.split('\n');
  const insertIndex = lines.findIndex(line => line.startsWith('## '));

  if (insertIndex > 0) {
    lines.splice(insertIndex, 0, newEntry);
    changelog = lines.join('\n');
  } else {
    changelog += newEntry;
  }

  fs.writeFileSync(CHANGELOG, changelog);
  console.log(`✅ Updated CHANGELOG.md with v${newVersion}`);
}

/**
 * Main function
 */
function main() {
  console.log('🔄 Auto-versioning script started...\n');

  // Get commit message
  const commitMessage = getLastCommitMessage();
  if (!commitMessage) {
    console.log('⚠️  No commit message found. Skipping version bump.');
    return;
  }

  console.log(`📝 Commit message: "${commitMessage.substring(0, 60)}..."`);

  // Determine bump type
  const bumpType = getVersionBumpType(commitMessage);
  console.log(`📊 Version bump type: ${bumpType.toUpperCase()}\n`);

  // Read current version from frontend package.json
  const frontendPackage = JSON.parse(fs.readFileSync(FRONTEND_PACKAGE, 'utf-8'));
  const currentVersion = frontendPackage.version;
  console.log(`📦 Current version: v${currentVersion}`);

  // Calculate new version
  const newVersion = bumpVersion(currentVersion, bumpType);
  console.log(`🎯 New version: v${newVersion}\n`);

  // Update all package.json files
  updatePackageVersion(FRONTEND_PACKAGE, newVersion);
  updatePackageVersion(BACKEND_PACKAGE, newVersion);
  updatePackageVersion(SHARED_PACKAGE, newVersion);

  // Update version config
  updateVersionConfig(newVersion);

  // Update changelog
  updateChangelog(newVersion, commitMessage, bumpType);

  console.log('\n✅ Version bump completed successfully!');
  console.log(`\n🚀 Version ${currentVersion} → ${newVersion}`);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { getVersionBumpType, bumpVersion, parseVersion };
