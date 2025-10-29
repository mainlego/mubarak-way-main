# Audio Player Integration Instructions for App.tsx

## Quick Integration Guide

Follow these steps to integrate the Global Audio Player into your App.tsx:

### Step 1: Update App.tsx

Replace the current `d:\Git Projects\mubarak-way-main\mubarak-way-unified\frontend\src\app\App.tsx` with the following code:

```tsx
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { initTelegramSDK, isTelegram } from '@shared/lib/telegram';
import { useUserStore } from '@shared/store';
import { useAudioStore } from '@shared/store/audioStore';
import { useGlobalAudio } from '@shared/hooks/useGlobalAudio';

// Pages
import HomePage from '@pages/HomePage';
import OnboardingPage from '@pages/OnboardingPage';

// Quran Pages
import {
  SurahListPage,
  SurahReaderPage,
  BookmarksPage,
  HistoryPage,
  AIChatPage,
} from '@pages/quran';

// Library Pages
import {
  LibraryPage,
  BookListPage,
  BookReaderPage,
  NashidListPage,
} from '@pages/library';

// Prayer Pages
import {
  PrayerPage,
  LessonListPage,
  LessonDetailPage,
  PrayerTimesPage,
  QiblaPage,
} from '@pages/prayer';

// Progress & Settings Pages
import ProgressPage from '@pages/ProgressPage';
import SettingsPage from '@pages/SettingsPage';

// Admin Pages
import AdminLoginPage from '../pages/admin/AdminLoginPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminBooksPage from '../pages/admin/AdminBooksPage';
import AdminNashidsPage from '../pages/admin/AdminNashidsPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminAdminsPage from '../pages/admin/AdminAdminsPage';
import AdminSubscriptionsPage from '../pages/admin/AdminSubscriptionsPage';
import AdminSettingsPage from '../pages/admin/AdminSettingsPage';
import AdminLayout from '../widgets/admin/AdminLayout';

// Widgets
import BottomNav from '@widgets/BottomNav';
import DebugPanel from '@widgets/DebugPanel';
import GlobalAudioPlayer from '@widgets/library/GlobalAudioPlayer';

function App() {
  const { login } = useUserStore();
  const { currentPlaying, stopNashid } = useAudioStore();

  // Initialize global audio hook (ONCE at top level)
  const audioState = useGlobalAudio();

  // Audio player UI state
  const [isPlayerMinimized, setIsPlayerMinimized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      // Initialize Telegram WebApp SDK
      initTelegramSDK();

      // Set theme based on Telegram theme
      const isDark = window.Telegram?.WebApp?.colorScheme === 'dark';
      if (isDark) {
        document.documentElement.classList.add('dark');
      }

      // Auto-login if in Telegram
      if (isTelegram()) {
        try {
          await login();
          console.log('✅ Auto-login successful');
        } catch (error) {
          console.error('❌ Auto-login failed:', error);
        }
      }
    };

    initializeApp();
  }, [login]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Routes>
          {/* Onboarding */}
          <Route path="/onboarding" element={<OnboardingPage />} />

          {/* Main App */}
          <Route path="/" element={<HomePage />} />

          {/* Quran Module */}
          <Route path="/quran" element={<SurahListPage />} />
          <Route path="/quran/surah/:surahNumber" element={<SurahReaderPage />} />
          <Route path="/quran/bookmarks" element={<BookmarksPage />} />
          <Route path="/quran/history" element={<HistoryPage />} />
          <Route path="/quran/ai" element={<AIChatPage />} />
          <Route path="/ai" element={<AIChatPage />} />

          {/* Library Module */}
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/library/books" element={<BookListPage />} />
          <Route path="/library/books/:bookId" element={<BookReaderPage />} />
          <Route path="/library/nashids" element={<NashidListPage />} />

          {/* Prayer Module */}
          <Route path="/prayer" element={<PrayerPage />} />
          <Route path="/prayer/lessons" element={<LessonListPage />} />
          <Route path="/prayer/lessons/:lessonSlug" element={<LessonDetailPage />} />
          <Route path="/prayer/times" element={<PrayerTimesPage />} />
          <Route path="/prayer/qibla" element={<QiblaPage />} />

          {/* Progress & Settings */}
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* Admin Panel */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="books" element={<AdminBooksPage />} />
            <Route path="nashids" element={<AdminNashidsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="admins" element={<AdminAdminsPage />} />
            <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Bottom Navigation */}
        <BottomNav />

        {/* Debug Panel (only in development or when needed) */}
        <DebugPanel />

        {/* Global Audio Player */}
        {currentPlaying && (
          <GlobalAudioPlayer
            onClose={stopNashid}
            isMinimized={isPlayerMinimized}
            onToggleMinimize={() => setIsPlayerMinimized(!isPlayerMinimized)}
            audioState={audioState}
          />
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
```

### Step 2: Update tsconfig.json paths (if needed)

Make sure your `tsconfig.json` has the following path mappings:

```json
{
  "compilerOptions": {
    "paths": {
      "@shared/*": ["./src/shared/*"],
      "@widgets/*": ["./src/widgets/*"],
      "@pages/*": ["./src/pages/*"]
    }
  }
}
```

### Step 3: Verify File Structure

Ensure these files exist:
```
src/
├── shared/
│   ├── store/
│   │   ├── audioStore.ts          ✓ Created
│   │   └── index.ts               ✓ Updated
│   ├── hooks/
│   │   └── useGlobalAudio.ts      ✓ Created
│   └── lib/
│       ├── offlineStorage.ts      ✓ Exists
│       ├── apiConfig.ts           ✓ Exists
│       └── telegram.ts            ✓ Exists
└── widgets/
    └── library/
        └── GlobalAudioPlayer.tsx  ✓ Created
```

### Step 4: Usage in NashidListPage

Update your NashidListPage to use the audio player:

```tsx
import { useAudioStore } from '@shared/store/audioStore';

function NashidListPage() {
  const { nashids } = useLibraryStore();
  const { playNashid, setPlaylist } = useAudioStore();

  const handlePlayNashid = (nashid: Nashid, index: number) => {
    // Set playlist starting from clicked nashid
    const reorderedPlaylist = [
      ...nashids.slice(index),
      ...nashids.slice(0, index)
    ];
    setPlaylist(reorderedPlaylist);

    // Play the nashid
    playNashid(nashid);
  };

  return (
    <div>
      {nashids.map((nashid, index) => (
        <div key={nashid.id} onClick={() => handlePlayNashid(nashid, index)}>
          <h3>{nashid.title}</h3>
          <p>{nashid.artist}</p>
        </div>
      ))}
    </div>
  );
}
```

### Step 5: Optional - Sync Favorites with Backend

Add this hook to your NashidListPage or create a separate hook file:

```tsx
import { useEffect } from 'react';
import { useAudioStore } from '@shared/store/audioStore';
import { useUserStore } from '@shared/store/userStore';
import { getApiUrl } from '@shared/lib/apiConfig';

export function useSyncFavorites() {
  const { user } = useUserStore();
  const { favorites, setFavorites } = useAudioStore();

  // Load favorites from backend on mount
  useEffect(() => {
    if (user?.telegramId) {
      fetch(`${getApiUrl()}/users/${user.telegramId}`)
        .then(res => res.json())
        .then(data => {
          if (data.favoriteNashids) {
            setFavorites(data.favoriteNashids);
          }
        })
        .catch(error => console.error('Failed to load favorites:', error));
    }
  }, [user, setFavorites]);

  // Save favorites to backend when changed
  useEffect(() => {
    if (user?.telegramId) {
      fetch(`${getApiUrl()}/users/${user.telegramId}/favorites`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favoriteNashids: favorites })
      })
        .then(res => res.json())
        .catch(error => console.error('Failed to save favorites:', error));
    }
  }, [user, favorites]);
}

// Use in component:
function NashidListPage() {
  useSyncFavorites();
  // ... rest of component
}
```

## What Changed from Shop Version

### Redux → Zustand Migration

**Old (Redux):**
```tsx
import { useDispatch, useSelector } from 'react-redux';
import { playNashid, pauseNashid } from '../store/slices/nashidsSlice';

const dispatch = useDispatch();
const { isPlaying, favorites } = useSelector(state => state.nashids);

dispatch(playNashid(nashid));
dispatch(pauseNashid());
```

**New (Zustand):**
```tsx
import { useAudioStore } from '@shared/store/audioStore';

const { isPlaying, favorites, playNashid, pauseNashid } = useAudioStore();

playNashid(nashid);
pauseNashid();
```

### Key Differences

1. **No Provider Needed**: Zustand stores work without providers
2. **Simpler Syntax**: Direct function calls instead of dispatch
3. **Better TypeScript**: Full type inference
4. **Smaller Bundle**: ~1KB vs Redux's ~10KB
5. **Same Features**: All functionality preserved

## Testing Checklist

- [ ] Audio plays when clicking nashid
- [ ] Pause/Play button works
- [ ] Next/Previous buttons work
- [ ] Shuffle mode works
- [ ] Repeat modes work (none/all/one)
- [ ] Progress bar updates
- [ ] Seeking works
- [ ] Volume control works
- [ ] Favorites toggle works
- [ ] Download for offline works
- [ ] Share button works
- [ ] Minimize/Expand works
- [ ] Playlist view works
- [ ] Media Session controls work (lock screen, notification)
- [ ] Auto-play next track works
- [ ] Error handling works (invalid audio URL)
- [ ] Mini player displays correctly
- [ ] Full player displays correctly
- [ ] Player persists across navigation
- [ ] Only one audio plays at a time

## Troubleshooting

### "Cannot find module '@shared/store/audioStore'"
- Check tsconfig.json paths configuration
- Restart TypeScript server in VSCode: Ctrl+Shift+P → "TypeScript: Restart TS Server"

### "Property 'playNashid' does not exist"
- Ensure audioStore.ts is properly exported
- Check shared/store/index.ts includes: `export * from './audioStore';`

### Audio not playing
- Check browser console for errors
- Verify audioUrl in nashid object
- Check CORS settings if audio is external
- User must interact with page first (browser autoplay policy)

### TypeScript errors in GlobalAudioPlayer
- Install lucide-react: `npm install lucide-react`
- Install zustand: `npm install zustand`

## Next Steps

1. Update App.tsx with the code above
2. Test audio playback in NashidListPage
3. Implement favorites sync with backend (optional)
4. Test on mobile devices
5. Test Telegram Mini App integration
6. Test offline functionality

## Support Files

- Full integration guide: `AUDIO_PLAYER_INTEGRATION.md`
- Audio Store: `src/shared/store/audioStore.ts`
- Global Audio Hook: `src/shared/hooks/useGlobalAudio.ts`
- UI Component: `src/widgets/library/GlobalAudioPlayer.tsx`
