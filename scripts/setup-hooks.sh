#!/bin/bash

# Setup Git Hooks for Auto-Versioning
# Uses post-commit hook with recursion prevention

echo "🔧 Setting up Git hooks for auto-versioning..."

# Check if .git directory exists
if [ ! -d ".git" ]; then
  echo "❌ Error: Not a git repository"
  exit 1
fi

# Create .git/hooks directory if it doesn't exist
mkdir -p .git/hooks

# Create post-commit hook with recursion prevention
cat > .git/hooks/post-commit << 'EOF'
#!/bin/sh

# Lock file to prevent recursion
LOCK_FILE=".git/hooks/.version-bump-lock"

# If lock exists, we're in a recursive call - exit immediately
if [ -f "$LOCK_FILE" ]; then
  exit 0
fi

# Create lock file
touch "$LOCK_FILE"

# Auto-bump version after commit
echo "🔄 Auto-versioning..."

# Run the version bump script
node scripts/bump-version.js

# Stage the updated files
git add frontend/package.json backend/package.json shared/package.json 2>/dev/null
git add frontend/src/shared/config/version.ts 2>/dev/null
git add CHANGELOG.md 2>/dev/null

# Check if there are changes to commit
if ! git diff --cached --quiet; then
  # Amend the commit with version changes
  git commit --amend --no-edit --no-verify
  echo "✅ Version auto-bumped and committed!"
else
  echo "ℹ️  No version changes needed"
fi

# Remove lock file
rm -f "$LOCK_FILE"
EOF

# Make the hook executable
chmod +x .git/hooks/post-commit

echo "✅ Git hooks installed successfully!"
echo ""
echo "📝 Usage:"
echo "  - feat: message    -> bumps minor version (1.0.0 -> 1.1.0)"
echo "  - fix: message     -> bumps patch version (1.0.0 -> 1.0.1)"
echo "  - BREAKING CHANGE  -> bumps major version (1.0.0 -> 2.0.0)"
echo ""
echo "🎯 Next commit will automatically bump version!"
