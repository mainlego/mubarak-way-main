import { create } from 'zustand';

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

export const useAudioStore = create<AudioState>((set, get) => ({
  // Initial state
  currentPlaying: null,
  isPlaying: false,
  playlist: [],
  favorites: [],
  isShuffled: false,
  repeatMode: 'none',

  // Actions
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

  setPlaylist: (playlist) => {
    console.log('[AudioStore] Setting playlist:', playlist.length, 'items');
    set({ playlist });
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
  }
}));
