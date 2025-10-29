# Version Checker - Documentation

## Overview

The Version Checker system provides automatic update detection and notification for the MubarakWay Unified application. It compares the client version with the server version and prompts users to update when a new version is available.

## Architecture

```
Frontend (VersionChecker Component)
    ↓
    Check version every 5 minutes
    ↓
Backend (/api/v1/version/check)
    ↓
    Compare versions
    ↓
    Return update info with changelog
    ↓
Frontend shows notification
    ↓
User clicks "Update Now" → Page reload
```

## Components

### 1. Backend API

#### **File:** `backend/src/routes/version.ts`

**Endpoints:**

##### `GET /api/v1/version`
Get current API version information

**Response:**
```json
{
  "success": true,
  "version": "1.0.0",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "environment": "production"
}
```

##### `GET /api/v1/version/check?version=1.0.0`
Check if client version needs update

**Query Parameters:**
- `version` (required) - Client version to check

**Response:**
```json
{
  "success": true,
  "currentVersion": "1.1.0",
  "clientVersion": "1.0.0",
  "needsUpdate": true,
  "updateAvailable": true,
  "changes": [
    "Улучшенная система закладок",
    "Поддержка highlight и аннотаций",
    "Семантический поиск по Корану"
  ]
}
```

### 2. Frontend Service

#### **File:** `frontend/src/shared/lib/versionService.ts`

**Functions:**

##### `getCurrentVersion(): Promise<VersionInfo>`
Fetch current API version

##### `checkForUpdate(clientVersion: string): Promise<VersionCheckResult>`
Check if update is available for given client version

##### `isNewerVersion(v1: string, v2: string): boolean`
Compare two semantic versions

**Usage:**
```typescript
import { checkForUpdate } from '@shared/lib/versionService';

const result = await checkForUpdate('1.0.0');
if (result.needsUpdate) {
  console.log('Update available:', result.currentVersion);
  console.log('Changes:', result.changes);
}
```

### 3. UI Component

#### **File:** `frontend/src/shared/ui/VersionChecker.tsx`

**Features:**
- Automatic version check on mount
- Periodic checks every 5 minutes
- Beautiful notification UI with Tailwind CSS
- Dark mode support
- Changelog display
- "Update Now" button (reloads page)
- "Later" button (dismisses notification)
- Dismissal memory (won't show again for same version)
- Loading state during update

**Props:** None (fully autonomous)

**Usage:**
```tsx
import { VersionChecker } from '@shared/ui';

function App() {
  return (
    <div>
      {/* Your app content */}
      <VersionChecker />
    </div>
  );
}
```

## Configuration

### Version Number

The version is stored in `backend/package.json`:

```json
{
  "version": "1.0.0"
}
```

**Update this when releasing a new version.**

### Check Interval

Default: 5 minutes (300,000 ms)

To change, edit `frontend/src/shared/ui/VersionChecker.tsx`:

```typescript
const VERSION_CHECK_INTERVAL = 5 * 60 * 1000; // Change this
```

### Current Version (Frontend)

The frontend version is hardcoded in `VersionChecker.tsx`:

```typescript
const CURRENT_VERSION = '1.0.0'; // Update this when deploying
```

**Important:** This should match `package.json` version.

## Changelog Management

The changelog is defined in `backend/src/routes/version.ts`:

```typescript
const changeLog: Record<string, string[]> = {
  '1.0.0': [
    'Полная интеграция трех приложений в одно',
    'Admin Panel для управления контентом',
    'Enhanced Book Reader с оффлайн режимом',
  ],
  '1.1.0': [
    'Улучшенная система закладок',
    'Поддержка highlight и аннотаций',
    'Семантический поиск по Корану',
  ],
  // Add more versions here
};
```

**When releasing a new version:**
1. Update `backend/package.json` version
2. Update `CURRENT_VERSION` in `VersionChecker.tsx`
3. Add changelog entry in `version.ts`
4. Deploy backend first, then frontend

## Semantic Versioning

We follow **Semantic Versioning 2.0.0**:

- **Major** (1.x.x): Breaking changes
- **Minor** (x.1.x): New features (backward compatible)
- **Patch** (x.x.1): Bug fixes

**Examples:**
- `1.0.0` → `1.0.1`: Bug fix
- `1.0.0` → `1.1.0`: New feature added
- `1.0.0` → `2.0.0`: Breaking API change

## User Experience

### Notification Appearance

The notification appears as a floating card in the bottom-right corner with:
- ✨ Sparkles icon
- Version number
- "Новые возможности доступны" subtitle
- List of changes (if provided)
- "Обновить сейчас" button (primary action)
- "Позже" button (dismisses)
- Close button (X)

### Dismissal Behavior

When user clicks "Позже" or X:
- Notification disappears
- Version is saved to `localStorage` as dismissed
- Won't show again for this version
- Will show again if newer version is detected

### Update Behavior

When user clicks "Обновить сейчас":
- Button shows "Обновление..." with spinning icon
- Page reloads with cache clear: `window.location.reload()`
- User sees the new version

## Testing

### Manual Testing

1. **Test version endpoint:**
```bash
curl http://localhost:4000/api/v1/version
```

Expected output:
```json
{
  "success": true,
  "version": "1.0.0",
  "timestamp": "...",
  "environment": "development"
}
```

2. **Test version check:**
```bash
curl "http://localhost:4000/api/v1/version/check?version=0.9.0"
```

Expected output:
```json
{
  "success": true,
  "currentVersion": "1.0.0",
  "clientVersion": "0.9.0",
  "needsUpdate": true,
  "updateAvailable": true,
  "changes": [...]
}
```

3. **Test with same version:**
```bash
curl "http://localhost:4000/api/v1/version/check?version=1.0.0"
```

Expected:
```json
{
  "needsUpdate": false,
  "updateAvailable": false,
  "changes": []
}
```

### Frontend Testing

1. **Temporarily change `CURRENT_VERSION` to lower version:**
```typescript
const CURRENT_VERSION = '0.9.0'; // Instead of '1.0.0'
```

2. Start the app:
```bash
npm run dev
```

3. You should see the update notification appear after a few seconds.

4. Test "Позже" button - notification should disappear and not reappear on page refresh.

5. Clear `localStorage` to reset dismissal:
```javascript
localStorage.removeItem('mubarakway_dismissed_version');
```

6. Test "Обновить сейчас" button - page should reload.

## Production Deployment

### Release Checklist

Before deploying a new version:

- [ ] Update `backend/package.json` version
- [ ] Update `CURRENT_VERSION` in `frontend/src/shared/ui/VersionChecker.tsx`
- [ ] Add changelog entry in `backend/src/routes/version.ts`
- [ ] Test version endpoints locally
- [ ] Test VersionChecker component with lower version
- [ ] Build backend: `npm run build`
- [ ] Build frontend: `npm run build`
- [ ] Deploy backend to Render
- [ ] Wait for backend to be live
- [ ] Deploy frontend to Render/Vercel
- [ ] Test on production (check console for version check logs)
- [ ] Verify notification appears for users on old version

### Zero-Downtime Updates

1. Deploy backend first (backward compatible API)
2. Old clients continue to work
3. Deploy frontend
4. Old clients get update notification
5. New clients load directly with new version

## Monitoring

### Backend Logs

The version check endpoint logs all checks:

```
GET /api/v1/version/check?version=0.9.0 - 200 - 5ms
```

### Frontend Logs

The VersionChecker logs version checks:

```javascript
console.log('Checking version...');
console.log('Update available:', newVersion);
console.log('User dismissed update for version:', version);
```

### Analytics (Optional)

To track update adoption, add analytics events:

```typescript
// In VersionChecker.tsx
const handleUpdate = () => {
  // Track update event
  window.gtag?.('event', 'version_update', {
    old_version: CURRENT_VERSION,
    new_version: newVersion.version,
  });

  setIsUpdating(true);
  window.location.reload();
};
```

## Troubleshooting

### Issue: Notification not appearing

**Solutions:**
1. Check browser console for errors
2. Verify backend is running: `curl http://localhost:4000/api/v1/version`
3. Check `CURRENT_VERSION` matches `package.json`
4. Clear localStorage: `localStorage.clear()`
5. Check network tab for API calls

### Issue: "needsUpdate" always false

**Solutions:**
1. Verify version numbers are different
2. Check version comparison logic in `version.ts`
3. Test manually: `compareVersions('1.1.0', '1.0.0')` should return 1

### Issue: Page not reloading on update

**Solutions:**
1. Check `window.location.reload()` is being called
2. Check for JavaScript errors blocking execution
3. Verify browser allows page reload

### Issue: Notification shows repeatedly

**Solutions:**
1. Check `localStorage.setItem()` is being called on dismiss
2. Verify `DISMISSED_VERSION_KEY` is correct
3. Clear localStorage and test again

## Future Enhancements

### Planned Features

1. **Automatic Updates (PWA)**
   - Service Worker integration
   - Silent background updates
   - No page reload required

2. **Release Notes Page**
   - Full changelog history
   - `/changelog` route
   - Link from notification

3. **Update Priority Levels**
   - Critical (force update)
   - Recommended (current behavior)
   - Optional (show banner only)

4. **Backend Changelog API**
   - Store changelog in database
   - Admin panel to add release notes
   - Markdown support for rich formatting

5. **Update Scheduling**
   - "Remind me in 1 hour/day"
   - Smart scheduling (avoid interrupting user)

6. **Version Analytics Dashboard**
   - Track version adoption rate
   - See % of users on each version
   - Update success rate

## API Reference

### Types

```typescript
interface VersionInfo {
  version: string;
  timestamp: string;
  environment: string;
  changes?: string[];
}

interface VersionCheckResult {
  currentVersion: string;
  clientVersion: string;
  needsUpdate: boolean;
  updateAvailable: boolean;
  changes: string[];
}
```

### Constants

```typescript
CURRENT_VERSION = '1.0.0'
VERSION_CHECK_INTERVAL = 5 * 60 * 1000 // 5 minutes
DISMISSED_VERSION_KEY = 'mubarakway_dismissed_version'
```

## Security Considerations

1. **No sensitive data in changelog** - Changelog is public
2. **Version endpoint is public** - No authentication required
3. **Rate limiting** - Consider adding rate limit to prevent abuse
4. **HTTPS required** - Ensure version endpoint uses HTTPS in production

## Support

For issues or questions:
1. Check this documentation
2. Review backend logs
3. Check browser console
4. Test with curl commands
5. Verify version numbers match

---

**Status:** ✅ Fully Implemented
**Version:** 1.0.0
**Last Updated:** January 2025
