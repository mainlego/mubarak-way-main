#!/usr/bin/env python3
"""
Fix Translation Files
Removes corrupted numeric keys and ensures proper structure
"""

import json
import os

LOCALES_DIR = os.path.join(os.path.dirname(__file__), '../frontend/src/shared/i18n/locales')

def fix_library_categories(data):
    """Remove numeric keys from library.categories"""
    if 'library' in data and 'categories' in data['library']:
        categories = data['library']['categories']
        # Remove numeric keys (0-9, etc.)
        keys_to_remove = [k for k in categories.keys() if k.isdigit()]
        for key in keys_to_remove:
            del categories[key]
        print(f"  🧹 Removed {len(keys_to_remove)} corrupted numeric keys")
    return data

def process_file(filepath, lang):
    """Process a single translation file"""
    print(f"\n📝 Processing {lang}.json...")

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Fix corrupted sections
        original_size = len(json.dumps(data))
        data = fix_library_categories(data)

        # Write back
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            f.write('\n')

        new_size = len(json.dumps(data))
        print(f"  ✅ Fixed {lang}.json (size: {original_size} → {new_size})")

    except Exception as e:
        print(f"  ❌ Error processing {lang}.json: {e}")

# Process all language files
languages = ['ru', 'en', 'ar']

print("🔧 Starting translation file cleanup...\n")

for lang in languages:
    filepath = os.path.join(LOCALES_DIR, f'{lang}.json')
    if os.path.exists(filepath):
        process_file(filepath, lang)
    else:
        print(f"⚠️  File not found: {filepath}")

print("\n✅ Translation cleanup completed!")
