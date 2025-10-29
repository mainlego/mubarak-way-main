# Global Audio Player - Quick Start

## 🎵 What's New

Global Audio Player migrated from shop to unified with Zustand state management.

---

## 📦 Files Created

1. **Store**: `src/shared/store/audioStore.ts`
2. **Hook**: `src/shared/hooks/useGlobalAudio.ts`
3. **UI**: `src/widgets/library/GlobalAudioPlayer.tsx`

---

## ⚡ Quick Integration (5 minutes)

### Step 1: Update App.tsx

Add these imports:
```tsx
import { useAudioStore } from '@shared/store/audioStore';
import { useGlobalAudio } from '@shared/hooks/useGlobalAudio';
import GlobalAudioPlayer from '@widgets/library/GlobalAudioPlayer';
```

Add these in your App component:
```tsx
function App() {
  // Add these lines
  const audioState = useGlobalAudio();
  const { currentPlaying, stopNashid } = useAudioStore();
  const [isPlayerMinimized, setIsPlayerMinimized] = useState(false);

  return (
    <div>
      {/* Your existing routes */}

      {/* Add this at the end, before closing div */}
      {currentPlaying && (
        <GlobalAudioPlayer
          onClose={stopNashid}
          isMinimized={isPlayerMinimized}
          onToggleMinimize={() => setIsPlayerMinimized(!isPlayerMinimized)}
          audioState={audioState}
        />
      )}
    </div>
  );
}
```

### Step 2: Use in NashidListPage

```tsx
import { useAudioStore } from '@shared/store/audioStore';

function NashidListPage() {
  const { nashids } = useLibraryStore();
  const { playNashid, setPlaylist } = useAudioStore();

  const handlePlay = (nashid, index) => {
    // Set playlist
    const playlist = [...nashids.slice(index), ...nashids.slice(0, index)];
    setPlaylist(playlist);

    // Play nashid
    playNashid(nashid);
  };

  return (
    <div>
      {nashids.map((nashid, index) => (
        <div key={nashid.id} onClick={() => handlePlay(nashid, index)}>
          <h3>{nashid.title}</h3>
          <p>{nashid.artist}</p>
        </div>
      ))}
    </div>
  );
}
```

### Step 3: Test

1. Navigate to `/library/nashids`
2. Click a nashid
3. Audio player should appear
4. Test play/pause, next/previous buttons

---

## 🎯 Features

✅ Play/Pause/Next/Previous
✅ Shuffle & Repeat modes
✅ Volume control
✅ Progress bar with seeking
✅ Favorites
✅ Download for offline
✅ Share
✅ Playlist view
✅ Mini & Full player modes
✅ Background playback (Media Session API)
✅ Haptic feedback (Telegram)

---

## 📚 Documentation

- **Quick Start**: This file
- **Detailed Guide**: `AUDIO_PLAYER_INTEGRATION.md`
- **App Integration**: `APP_INTEGRATION_INSTRUCTIONS.md`
- **Summary**: `AUDIO_PLAYER_SUMMARY.md`

---

## 🐛 Troubleshooting

**Audio not playing?**
- Check browser console
- Verify audioUrl in nashid object
- User must interact with page first (autoplay policy)

**TypeScript errors?**
- Install: `npm install zustand lucide-react`
- Restart TS server: Ctrl+Shift+P → "TypeScript: Restart TS Server"

**Player not showing?**
- Check `currentPlaying` is not null
- Ensure GlobalAudioPlayer is rendered after routes

---

## 🔄 Redux → Zustand

**Before:**
```tsx
const dispatch = useDispatch();
const { isPlaying } = useSelector(state => state.nashids);
dispatch(playNashid(nashid));
```

**After:**
```tsx
const { isPlaying, playNashid } = useAudioStore();
playNashid(nashid);
```

---

## ✅ Done!

Your audio player is ready. For detailed documentation, see `AUDIO_PLAYER_INTEGRATION.md`.
