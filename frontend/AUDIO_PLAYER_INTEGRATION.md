# Global Audio Player Integration Guide

## Overview

Global Audio Player has been successfully migrated from shop to unified with Zustand state management.

## Created Files

### 1. Store
**Location:** `src/shared/store/audioStore.ts`

Zustand store for audio state management:
- `currentPlaying` - currently playing nashid
- `isPlaying` - playback state
- `playlist` - list of nashids
- `favorites` - favorite nashid IDs
- `isShuffled` - shuffle mode
- `repeatMode` - repeat mode (none/all/one)

**Actions:**
- `playNashid(nashid)` - play a nashid
- `pauseNashid()` - pause playback
- `stopNashid()` - stop and clear player
- `setPlaylist(playlist)` - set playlist
- `toggleFavorite(nashidId)` - toggle favorite
- `toggleShuffle()` - toggle shuffle mode
- `cycleRepeatMode()` - cycle through repeat modes
- `playNext()` - play next track
- `playPrevious()` - play previous track

### 2. Hook
**Location:** `src/shared/hooks/useGlobalAudio.ts`

Global audio hook that manages a single audio element for the entire app.

**Features:**
- Single audio element management
- Media Session API for background playback
- Auto-play next track on end
- Offline audio support
- Error handling

**Must be called ONCE at the top level (App.tsx)**

### 3. UI Component
**Location:** `src/widgets/library/GlobalAudioPlayer.tsx`

Pure UI component with two modes:
- **Mini Player** - compact player in bottom-right corner
- **Full Player** - full-screen player with all controls

**Features:**
- Play/Pause/Next/Previous controls
- Volume control
- Shuffle and repeat modes
- Favorites
- Download for offline
- Share functionality
- Playlist view
- Progress bar with seeking
- Haptic feedback (Telegram)

## Integration Steps

### Step 1: Install Dependencies (if needed)

```bash
npm install zustand lucide-react
```

### Step 2: Update App.tsx

Add the global audio hook and player component:

```tsx
import React, { useState } from 'react';
import { useGlobalAudio } from './shared/hooks/useGlobalAudio';
import { useAudioStore } from './shared/store/audioStore';
import GlobalAudioPlayer from './widgets/library/GlobalAudioPlayer';

function App() {
  // Initialize global audio (ONCE at top level)
  const audioState = useGlobalAudio();
  const { currentPlaying } = useAudioStore();

  // Player UI state
  const [isPlayerMinimized, setIsPlayerMinimized] = useState(false);

  return (
    <div className="App">
      {/* Your app content */}

      {/* Global Audio Player */}
      {currentPlaying && (
        <GlobalAudioPlayer
          onClose={() => {
            useAudioStore.getState().stopNashid();
          }}
          isMinimized={isPlayerMinimized}
          onToggleMinimize={() => setIsPlayerMinimized(!isPlayerMinimized)}
          audioState={audioState}
        />
      )}
    </div>
  );
}

export default App;
```

### Step 3: Play Audio from Any Component

```tsx
import { useAudioStore } from '../shared/store/audioStore';

function NashidCard({ nashid }) {
  const { playNashid, setPlaylist } = useAudioStore();

  const handlePlay = () => {
    // Set playlist (optional)
    setPlaylist([nashid, ...otherNashids]);

    // Play nashid
    playNashid(nashid);
  };

  return (
    <div onClick={handlePlay}>
      {nashid.title}
    </div>
  );
}
```

### Step 4: Sync Favorites with Backend

To sync favorites with MongoDB/backend:

```tsx
import { useEffect } from 'react';
import { useAudioStore } from '../shared/store/audioStore';
import { useUserStore } from '../shared/store/userStore';

function useSyncFavorites() {
  const { user } = useUserStore();
  const { favorites, setFavorites } = useAudioStore();

  // Load favorites from backend
  useEffect(() => {
    if (user?.telegramId) {
      fetch(`/api/users/${user.telegramId}/favorites`)
        .then(res => res.json())
        .then(data => setFavorites(data.favorites || []))
        .catch(console.error);
    }
  }, [user, setFavorites]);

  // Save favorites to backend when changed
  useEffect(() => {
    if (user?.telegramId && favorites.length > 0) {
      fetch(`/api/users/${user.telegramId}/favorites`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favorites })
      }).catch(console.error);
    }
  }, [user, favorites]);
}
```

## Key Features

### 1. Global Audio Management
- Single audio element for entire app
- No multiple audio elements playing simultaneously
- Consistent playback across navigation

### 2. Media Session API
- Background playback controls
- Lock screen controls
- Notification controls (on supported devices)
- Now Playing metadata

### 3. Offline Support
- Download nashids for offline playback
- IndexedDB storage via Dexie
- Automatic offline availability check
- Integration with existing offlineStorage

### 4. Playlist Management
- Set playlist from any component
- Shuffle mode
- Repeat modes (none/all/one)
- Auto-play next track

### 5. Telegram Integration
- Haptic feedback for actions
- Telegram-style UI
- Share functionality
- Mini app optimizations

### 6. UI Features
- Mini player (minimized mode)
- Full player (expanded mode)
- Album art display
- Progress bar with seeking
- Volume control
- Error display
- Loading states

## API Reference

### Audio Store

```typescript
interface AudioState {
  // State
  currentPlaying: Nashid | null;
  isPlaying: boolean;
  playlist: Nashid[];
  favorites: string[];
  isShuffled: boolean;
  repeatMode: 'none' | 'all' | 'one';

  // Actions
  playNashid: (nashid: Nashid) => void;
  pauseNashid: () => void;
  stopNashid: () => void;
  setPlaylist: (playlist: Nashid[]) => void;
  toggleFavorite: (nashidId: string) => void;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
  playNext: () => void;
  playPrevious: () => void;
  setFavorites: (favorites: string[]) => void;
}
```

### Nashid Type

```typescript
interface Nashid {
  id: string;
  nashidId?: string;
  title: string;
  artist: string;
  audioUrl?: string;
  audio_url?: string;
  cover?: string;
  duration?: string | number;
  category?: string;
  titleTransliteration?: string;
}
```

### Global Audio Hook

```typescript
const audioState = useGlobalAudio();

// Returns:
{
  audioRef: RefObject<HTMLAudioElement>;
  currentTime: number;
  duration: number;
  isLoading: boolean;
  audioError: string | null;
  setCurrentTime: (time: number) => void;
  setVolume: (volume: number) => void;
}
```

## Example: Library Integration

```tsx
import React, { useEffect } from 'react';
import { useAudioStore } from '../../shared/store/audioStore';
import { useLibraryStore } from '../../shared/store/libraryStore';

function NashidsLibrary() {
  const { nashids } = useLibraryStore();
  const { playNashid, setPlaylist, currentPlaying, isPlaying } = useAudioStore();

  const handlePlayNashid = (nashid: Nashid, index: number) => {
    // Set full playlist starting from this nashid
    const reorderedPlaylist = [
      ...nashids.slice(index),
      ...nashids.slice(0, index)
    ];
    setPlaylist(reorderedPlaylist);

    // Play the nashid
    playNashid(nashid);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {nashids.map((nashid, index) => (
        <div
          key={nashid.id}
          onClick={() => handlePlayNashid(nashid, index)}
          className="cursor-pointer"
        >
          <img src={nashid.cover} alt={nashid.title} />
          <h3>{nashid.title}</h3>
          <p>{nashid.artist}</p>
          {currentPlaying?.id === nashid.id && isPlaying && (
            <span>Now Playing...</span>
          )}
        </div>
      ))}
    </div>
  );
}
```

## Troubleshooting

### Audio not playing
- Check browser console for errors
- Verify audioUrl is correct and accessible
- Check CORS settings if audio is from external source
- Ensure user has interacted with page (autoplay policy)

### Media Session not working
- Only works on supported browsers (Chrome, Safari, Edge)
- Requires HTTPS (or localhost)
- Check browser console for Media Session errors

### Offline download not working
- Check IndexedDB is available
- Verify storage quota
- Check network connection for download

### TypeScript errors
- Ensure all types are imported correctly
- Check Nashid interface matches your data structure
- Verify zustand is properly installed

## Migration Notes

### From Redux to Zustand
- No providers needed (Zustand stores are self-contained)
- Simpler action creators (just functions)
- Direct state access via hooks
- No action types or reducers

### Breaking Changes
- Redux-specific code removed
- Store structure changed (flat vs nested)
- Action names simplified
- No selectors needed (direct state access)

## Performance Optimizations

1. **Single Audio Element**: Only one audio element exists, reducing memory usage
2. **Lazy Loading**: Player UI only renders when nashid is playing
3. **Memoized Callbacks**: All handlers are memoized with useCallback
4. **Optimized Re-renders**: Zustand only re-renders components that use changed state
5. **Offline Caching**: IndexedDB for audio caching reduces network requests

## Future Enhancements

- [ ] Queue management (add to queue, reorder)
- [ ] Crossfade between tracks
- [ ] Equalizer controls
- [ ] Sleep timer
- [ ] Lyrics display
- [ ] Audio visualization
- [ ] Podcast support
- [ ] Speed control
- [ ] A-B repeat
- [ ] Bookmarks

## Support

For issues or questions, check:
- TypeScript definitions in audioStore.ts
- Console logs (prefixed with [AudioStore] or [useGlobalAudio])
- Browser DevTools Network tab for audio loading
- Browser DevTools Application tab for IndexedDB

## License

Part of Mubarak Way unified app.
