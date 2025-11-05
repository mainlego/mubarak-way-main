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

  // Check if files exist
  if (!fs.existsSync(mainFile)) {
    console.error(`❌ Main file not found: ${mainFile}`);
    return;
  }

  // Read main content
  let mainContent = JSON.parse(fs.readFileSync(mainFile, 'utf-8'));
  let merged = false;

  // Find all addition files with pattern: lang_additions*.json
  const allFiles = fs.readdirSync(LOCALES_DIR);
  const additionFiles = allFiles.filter(file =>
    file.startsWith(`${lang}_additions`) && file.endsWith('.json')
  );

  if (additionFiles.length === 0) {
    console.log(`ℹ️  No additions files for ${lang}, skipping...`);
    return;
  }

  // Merge all addition files
  additionFiles.forEach(additionFile => {
    const additionPath = path.join(LOCALES_DIR, additionFile);

    try {
      const additionsContent = JSON.parse(fs.readFileSync(additionPath, 'utf-8'));

      // Merge
      mainContent = deepMerge(mainContent, additionsContent);
      console.log(`✅ Merged ${additionFile} into ${lang}.json`);
      merged = true;

      // Delete additions file
      fs.unlinkSync(additionPath);
      console.log(`🗑️  Removed ${additionFile}`);
    } catch (error) {
      console.error(`❌ Error processing ${additionFile}:`, error.message);
    }
  });

  // Write back if any merges happened
  if (merged) {
    fs.writeFileSync(mainFile, JSON.stringify(mainContent, null, 2) + '\n');
    console.log(`💾 Updated ${lang}.json\n`);
  }
});

console.log('\n✅ Translation merge completed!');
