#!/usr/bin/env node

/**
 * Merge Translation Files
 * Merges additional translation keys into main translation files
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../frontend/src/shared/i18n/locales');

// Deep merge objects
function deepMerge(target, source) {
  for (const key in source) {
    if (source[key] instanceof Object && key in target) {
      Object.assign(source[key], deepMerge(target[key], source[key]));
    }
  }
  Object.assign(target || {}, source);
  return target;
}

// Process each language
const languages = ['ru', 'en', 'ar'];

languages.forEach(lang => {
  const mainFile = path.join(LOCALES_DIR, `${lang}.json`);
  const additionsFile = path.join(LOCALES_DIR, `${lang}_additions.json`);

  // Check if files exist
  if (!fs.existsSync(mainFile)) {
    console.error(`❌ Main file not found: ${mainFile}`);
    return;
  }

  if (!fs.existsSync(additionsFile)) {
    console.log(`ℹ️  No additions file for ${lang}, skipping...`);
    return;
  }

  try {
    // Read files
    const mainContent = JSON.parse(fs.readFileSync(mainFile, 'utf-8'));
    const additionsContent = JSON.parse(fs.readFileSync(additionsFile, 'utf-8'));

    // Merge
    const merged = deepMerge(mainContent, additionsContent);

    // Write back
    fs.writeFileSync(mainFile, JSON.stringify(merged, null, 2) + '\n');
    console.log(`✅ Merged ${lang}_additions.json into ${lang}.json`);

    // Delete additions file
    fs.unlinkSync(additionsFile);
    console.log(`🗑️  Removed ${lang}_additions.json`);
  } catch (error) {
    console.error(`❌ Error processing ${lang}:`, error.message);
  }
});

console.log('\n✅ Translation merge completed!');
