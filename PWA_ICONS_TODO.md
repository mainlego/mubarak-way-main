# PWA Icons Setup

## Current Status
- ✅ PWA manifest.json created
- ✅ Placeholder icon.svg created
- ❌ PNG icons (192x192 and 512x512) **NOT YET CREATED**

## Required Icons
You need to create the following PNG files from the SVG icon:

1. **icon-192.png** (192x192 pixels)
2. **icon-512.png** (512x512 pixels)

## How to Create PNG Icons

### Option 1: Using Online Tools (Easiest)
1. Go to https://cloudconvert.com/svg-to-png
2. Upload `frontend/public/icon.svg`
3. Set output size to 192x192, download as `icon-192.png`
4. Repeat with 512x512, download as `icon-512.png`
5. Place both files in `frontend/public/`

### Option 2: Using ImageMagick (CLI)
```bash
cd frontend/public
magick icon.svg -resize 192x192 icon-192.png
magick icon.svg -resize 512x512 icon-512.png
```

### Option 3: Using Inkscape (Desktop App)
```bash
inkscape icon.svg --export-width=192 --export-height=192 --export-filename=icon-192.png
inkscape icon.svg --export-width=512 --export-height=512 --export-filename=icon-512.png
```

### Option 4: Design Custom Icons
Use Figma, Adobe Illustrator, or any design tool to create professional icons:
- Size: 192x192px and 512x512px
- Format: PNG with transparency
- Design: Islamic theme (star, mosque, crescent, etc.)
- Colors: Primary #2e7d32 (green)

## After Creating Icons
1. Place `icon-192.png` and `icon-512.png` in `frontend/public/`
2. Commit and push:
```bash
git add frontend/public/icon-*.png
git commit -m "feat: add PWA icons (192x192 and 512x512)"
git push
```

## Verification
After deployment, check:
- No more 404 errors for `/icon-192.png` in browser console
- App installs properly as PWA on mobile devices
- Icons appear correctly in home screen and app switcher
