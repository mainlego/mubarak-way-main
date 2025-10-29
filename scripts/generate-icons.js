/**
 * Generate PNG icons from SVG for PWA
 *
 * This script converts the SVG icon to PNG format in multiple sizes.
 *
 * Requirements:
 * - Node.js
 * - sharp package: npm install -D sharp
 *
 * Usage:
 * node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.error('❌ Error: "sharp" package not found.');
  console.error('Please install it first: npm install -D sharp');
  process.exit(1);
}

const SVG_PATH = path.join(__dirname, '../frontend/public/icon.svg');
const OUTPUT_DIR = path.join(__dirname, '../frontend/public');

const SIZES = [
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' }
];

async function generateIcons() {
  console.log('🎨 Starting icon generation...\n');

  // Check if SVG exists
  if (!fs.existsSync(SVG_PATH)) {
    console.error(`❌ SVG file not found: ${SVG_PATH}`);
    process.exit(1);
  }

  for (const { size, name } of SIZES) {
    const outputPath = path.join(OUTPUT_DIR, name);

    try {
      await sharp(SVG_PATH)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 46, g: 125, b: 50, alpha: 1 } // #2e7d32
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ Generated: ${name} (${size}x${size}px)`);
    } catch (error) {
      console.error(`❌ Failed to generate ${name}:`, error.message);
    }
  }

  console.log('\n🎉 Icon generation complete!');
  console.log('\nNext steps:');
  console.log('1. Check the generated icons in frontend/public/');
  console.log('2. Commit and push:');
  console.log('   git add frontend/public/icon-*.png');
  console.log('   git commit -m "feat: add PWA icons (192x192 and 512x512)"');
  console.log('   git push');
}

generateIcons().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
