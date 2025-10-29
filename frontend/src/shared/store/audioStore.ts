import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface Nashid {
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

export interface Playlist {
  id: string;
  name: string;
  nashids: Nashid[];
  createdAt: Date;
  updatedAt: Date;
}

export type NashidCategory =
  | 'all'
  | 'spiritual'
  | 'family'
  | 'gratitude'
  | 'prophet'
  | 'quran'
  | 'dua'
  | 'general';

interface AudioState {
  // State
  currentPlaying: Nashid | null;
  isPlaying: boolean;
  playlist: Nashid[];
  favorites: string[];
  isShuffled: boolean;
  repeatMode: 'none' | 'all' | 'one';

  // Playlists
  playlists: Playlist[];
  currentPlaylistId: string | null;

  // Actions - Playback
  playNashid: (nashid: Nashid) => void;
  pauseNashid: () => void;
  stopNashid: () => void;
  setPlaylist: (playlist: Nashid[], playlistId?: string) => void;
  toggleFavorite: (nashidId: string) => void;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
  playNext: () => void;
  playPrevious: () => void;
  setFavorites: (favorites: string[]) => void;

  // Actions - Playlists
  createPlaylist: (name: string, nashids?: Nashid[]) => Playlist;
  deletePlaylist: (playlistId: string) => void;
  updatePlaylist: (playlistId: string, updates: Partial<Omit<Playlist, 'id' | 'createdAt'>>) => void;
  addToPlaylist: (playlistId: string, nashid: Nashid) => void;
  removeFromPlaylist: (playlistId: string, nashidId: string) => void;
  playPlaylist: (playlistId: string) => void;
  setPlaylists: (playlists: Playlist[]) => void;
}

export const useAudioStore = create<AudioState>(
  persist(
    (set, get) => ({
      // Initial state
      currentPlaying: null,
      isPlaying: false,
      playlist: [],
      favorites: [],
      isShuffled: false,
      repeatMode: 'none',
      playlists: [],
      currentPlaylistId: null,

      // Actions - Playback
      playNashid: (nashid) => {
        console.log('[AudioStore] Playing nashid:', nashid.title);
        set({ currentPlaying: nashid, isPlaying: true });
      },

      pauseNashid: () => {
        console.log('[AudioStore] Pausing nashid');
        set({ isPlaying: false });
      },

      stopNashid: () => {
        console.log('[AudioStore] Stopping nashid');
        set({ currentPlaying: null, isPlaying: false });
      },

      setPlaylist: (playlist, playlistId) => {
        console.log('[AudioStore] Setting playlist:', playlist.length, 'items', playlistId ? `from playlist ${playlistId}` : '');
        set({ playlist, currentPlaylistId: playlistId || null });
      },

  toggleFavorite: (nashidId) => {
    const state = get();
    const isFavorite = state.favorites.includes(nashidId);
    console.log('[AudioStore] Toggle favorite:', nashidId, isFavorite ? 'remove' : 'add');

    set({
      favorites: isFavorite
        ? state.favorites.filter(id => id !== nashidId)
        : [...state.favorites, nashidId]
    });
  },

  setFavorites: (favorites) => {
    console.log('[AudioStore] Setting favorites:', favorites.length, 'items');
    set({ favorites });
  },

  toggleShuffle: () => {
    const state = get();
    console.log('[AudioStore] Toggle shuffle:', !state.isShuffled);
    set({ isShuffled: !state.isShuffled });
  },

  cycleRepeatMode: () => {
    const state = get();
    const modes: Array<'none' | 'all' | 'one'> = ['none', 'all', 'one'];
    const currentIndex = modes.indexOf(state.repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    console.log('[AudioStore] Cycle repeat mode:', state.repeatMode, '->', nextMode);
    set({ repeatMode: nextMode });
  },

  playNext: () => {
    const state = get();
    if (state.playlist.length === 0) {
      console.log('[AudioStore] No playlist, cannot play next');
      return;
    }

    const currentIndex = state.playlist.findIndex(n => n.id === state.currentPlaying?.id);
    let nextIndex: number;

    if (state.isShuffled) {
      // Random next track
      nextIndex = Math.floor(Math.random() * state.playlist.length);
      console.log('[AudioStore] Playing random track:', nextIndex);
    } else if (state.repeatMode === 'one') {
      // Repeat current track
      nextIndex = currentIndex;
      console.log('[AudioStore] Repeating current track');
    } else {
      // Next track (with loop)
      nextIndex = (currentIndex + 1) % state.playlist.length;
      console.log('[AudioStore] Playing next track:', nextIndex);
    }

    const nextNashid = state.playlist[nextIndex];
    if (nextNashid) {
      set({ currentPlaying: nextNashid, isPlaying: true });
    }
  },

  playPrevious: () => {
    const state = get();
    if (state.playlist.length === 0) {
      console.log('[AudioStore] No playlist, cannot play previous');
      return;
    }

    const currentIndex = state.playlist.findIndex(n => n.id === state.currentPlaying?.id);
    const prevIndex = currentIndex === 0 ? state.playlist.length - 1 : currentIndex - 1;
    const prevNashid = state.playlist[prevIndex];

    console.log('[AudioStore] Playing previous track:', prevIndex);
    if (prevNashid) {
      set({ currentPlaying: prevNashid, isPlaying: true });
    }
  },

      // Actions - Playlists
      createPlaylist: (name, nashids = []) => {
        const newPlaylist: Playlist = {
          id: `playlist-${Date.now()}`,
          name,
          nashids,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        console.log('[AudioStore] Creating playlist:', name, 'with', nashids.length, 'nashids');
        set((state) => ({
          playlists: [...state.playlists, newPlaylist]
        }));

        return newPlaylist;
      },

      deletePlaylist: (playlistId) => {
        console.log('[AudioStore] Deleting playlist:', playlistId);
        set((state) => ({
          playlists: state.playlists.filter(p => p.id !== playlistId),
          currentPlaylistId: state.currentPlaylistId === playlistId ? null : state.currentPlaylistId
        }));
      },

      updatePlaylist: (playlistId, updates) => {
        console.log('[AudioStore] Updating playlist:', playlistId, updates);
        set((state) => ({
          playlists: state.playlists.map(p =>
            p.id === playlistId
              ? { ...p, ...updates, updatedAt: new Date() }
              : p
          )
        }));
      },

      addToPlaylist: (playlistId, nashid) => {
        console.log('[AudioStore] Adding nashid to playlist:', playlistId, nashid.title);
        set((state) => ({
          playlists: state.playlists.map(p =>
            p.id === playlistId
              ? {
                  ...p,
                  nashids: [...p.nashids, nashid],
                  updatedAt: new Date()
                }
              : p
          )
        }));
      },

      removeFromPlaylist: (playlistId, nashidId) => {
        console.log('[AudioStore] Removing nashid from playlist:', playlistId, nashidId);
        set((state) => ({
          playlists: state.playlists.map(p =>
            p.id === playlistId
              ? {
                  ...p,
                  nashids: p.nashids.filter(n => n.id !== nashidId),
                  updatedAt: new Date()
                }
              : p
          )
        }));
      },

      playPlaylist: (playlistId) => {
        const state = get();
        const playlist = state.playlists.find(p => p.id === playlistId);

        if (!playlist || playlist.nashids.length === 0) {
          console.log('[AudioStore] Cannot play playlist:', playlistId, 'not found or empty');
          return;
        }

        console.log('[AudioStore] Playing playlist:', playlist.name, 'with', playlist.nashids.length, 'nashids');
        set({
          playlist: playlist.nashids,
          currentPlaylistId: playlistId,
          currentPlaying: playlist.nashids[0],
          isPlaying: true
        });
      },

      setPlaylists: (playlists) => {
        console.log('[AudioStore] Setting playlists:', playlists.length, 'items');
        set({ playlists });
      }
    }),
    {
      name: 'audio-storage',
      partialize: (state) => ({
        favorites: state.favorites,
        playlists: state.playlists,
        repeatMode: state.repeatMode,
        isShuffled: state.isShuffled
      })
    }
  )
);
